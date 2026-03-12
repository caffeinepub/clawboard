import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";

actor {
  // Type Definitions
  type Status = { #active; #idle; #error; #offline };
  type Skill = {
    id : Text;
    agentId : Text;
    name : Text;
    description : Text;
    version : Text;
    enabled : Bool;
  };
  type CronJob = {
    id : Text;
    agentId : Text;
    name : Text;
    schedule : Text;
    lastRun : Time.Time;
    nextRun : Time.Time;
    status : { #running; #idle; #failed };
  };
  type Credit = {
    id : Text;
    agentId : Text;
    balance : Nat;
    totalUsed : Nat;
    costAlerts : [(Nat, Bool)];
  };
  type ProviderStatus = { #healthy; #degraded; #down };
  type ActivityLevel = { #info; #warn; #error };
  type SecuritySeverity = { #low; #medium; #high };
  type BroadcastMessage = {
    id : Text;
    timestamp : Time.Time;
    message : Text;
    sentBy : Text;
    agentTargets : [Text];
  };

  type Agent = {
    id : Text;
    name : Text;
    status : Status;
    modelName : Text;
    uptimePercentage : Nat;
    lastActive : Time.Time;
    taskCount : Nat;
    description : Text;
  };
  type Provider = {
    id : Text;
    name : Text;
    status : ProviderStatus;
    latencyMs : Nat;
    uptimePercent : Nat;
    model : Text;
  };
  type ActivityLog = {
    id : Text;
    agentId : Text;
    timestamp : Time.Time;
    action : Text;
    details : Text;
    level : ActivityLevel;
  };
  type BrainEntry = { id : Text; agentId : Text; key : Text; value : Text; category : Text };
  type ConfigEntry = { id : Text; agentId : Text; key : Text; value : Text; sensitive : Bool };
  type SecurityEvent = {
    id : Text;
    agentId : Text;
    timestamp : Time.Time;
    eventType : Text;
    description : Text;
    severity : SecuritySeverity;
  };
  type LeaderboardEntry = {
    agentId : Text;
    agentName : Text;
    taskCount : Nat;
    creditsUsed : Nat;
    uptimePercent : Nat;
    rank : Nat;
  };

  type AgentPing = {
    apiToken : Text;
    agentId : Text;
    agentName : Text;
    status : Text;
    modelName : Text;
    logs : [Text];
    errors : [Text];
    identityMd : Text;
    soulMd : Text;
    memoryMd : Text;
    skillsList : [Text];
  };

  // Persistent Data
  var apiToken : Text = "";
  var tokenCounter : Nat = 0;

  let agentMap = Map.empty<Text, Agent>();
  let skillMap = Map.empty<Text, Skill>();
  let cronJobMap = Map.empty<Text, CronJob>();
  let creditMap = Map.empty<Text, Credit>();
  let providerMap = Map.empty<Text, Provider>();
  let activityLogMap = Map.empty<Text, ActivityLog>();
  let brainEntryMap = Map.empty<Text, BrainEntry>();
  let configEntryMap = Map.empty<Text, ConfigEntry>();
  let securityEventMap = Map.empty<Text, SecurityEvent>();
  let broadcastMessageMap = Map.empty<Text, BroadcastMessage>();
  let leaderboardMap = Map.empty<Text, LeaderboardEntry>();

  // Token helpers
  func makeToken(seed : Nat) : Text {
    "cb_" # seed.toText() # "_" # (Time.now() % 999999999).toText();
  };

  // API Token Management
  public shared func generateApiToken() : async Text {
    if (apiToken == "") {
      tokenCounter += 1;
      apiToken := makeToken(tokenCounter);
    };
    apiToken;
  };

  public query func getApiToken() : async Text {
    apiToken;
  };

  public shared func revokeAndRegenerateToken() : async Text {
    tokenCounter += 1;
    apiToken := makeToken(tokenCounter);
    apiToken;
  };

  // Agent Ping Ingestion
  public shared func receiveAgentPing(ping : AgentPing) : async Text {
    if (ping.apiToken != apiToken or apiToken == "") {
      Runtime.trap("Invalid API token");
    };

    let statusVal : Status = switch (ping.status) {
      case "active" { #active };
      case "idle" { #idle };
      case "error" { #error };
      case _ { #offline };
    };

    let existing = agentMap.get(ping.agentId);
    let taskCount : Nat = switch (existing) {
      case (?a) { a.taskCount + 1 };
      case null { 1 };
    };

    let agent : Agent = {
      id = ping.agentId;
      name = if (ping.agentName == "") { "Agent-" # ping.agentId } else { ping.agentName };
      status = statusVal;
      modelName = ping.modelName;
      uptimePercentage = 99;
      lastActive = Time.now();
      taskCount = taskCount;
      description = "Connected via OpenClaw skill reporter.";
    };
    agentMap.add(ping.agentId, agent);

    let now = Time.now();
    let logId = ping.agentId # "_ping_" # now.toText();
    let log : ActivityLog = {
      id = logId;
      agentId = ping.agentId;
      timestamp = now;
      action = "PING";
      details = "Agent checked in. Model: " # ping.modelName # ". Status: " # ping.status;
      level = #info;
    };
    activityLogMap.add(logId, log);

    if (ping.identityMd != "") {
      let entry : BrainEntry = {
        id = ping.agentId # "_identity";
        agentId = ping.agentId;
        key = "IDENTITY.md";
        value = ping.identityMd;
        category = "identity";
      };
      brainEntryMap.add(entry.id, entry);
    };
    if (ping.soulMd != "") {
      let entry : BrainEntry = {
        id = ping.agentId # "_soul";
        agentId = ping.agentId;
        key = "SOUL.md";
        value = ping.soulMd;
        category = "soul";
      };
      brainEntryMap.add(entry.id, entry);
    };
    if (ping.memoryMd != "") {
      let entry : BrainEntry = {
        id = ping.agentId # "_memory";
        agentId = ping.agentId;
        key = "MEMORY.md";
        value = ping.memoryMd;
        category = "memory";
      };
      brainEntryMap.add(entry.id, entry);
    };

    for (errMsg in ping.errors.values()) {
      let errId = ping.agentId # "_err_" # errMsg;
      let errLog : ActivityLog = {
        id = errId;
        agentId = ping.agentId;
        timestamp = now;
        action = "ERROR";
        details = errMsg;
        level = #error;
      };
      activityLogMap.add(errId, errLog);
    };

    "ok";
  };

  // Agents
  public shared func addAgent(agent : Agent) : async () {
    agentMap.add(agent.id, agent);
  };

  public query func getAgent(id : Text) : async Agent {
    switch (agentMap.get(id)) {
      case (null) { Runtime.trap("Agent not found") };
      case (?agent) { agent };
    };
  };

  public query func getAllAgents() : async [Agent] {
    agentMap.values().toArray();
  };

  public shared func updateAgent(agent : Agent) : async () {
    agentMap.add(agent.id, agent);
  };

  public shared func deleteAgent(id : Text) : async () {
    ignore agentMap.remove(id);
  };

  // Skills
  public shared func addSkill(skill : Skill) : async () {
    skillMap.add(skill.id, skill);
  };

  public shared func updateSkill(skill : Skill) : async () {
    skillMap.add(skill.id, skill);
  };

  public shared func deleteSkill(id : Text) : async () {
    ignore skillMap.remove(id);
  };

  public query func getAllSkills() : async [Skill] {
    skillMap.values().toArray();
  };

  // CronJobs
  public shared func addCronJob(cronJob : CronJob) : async () {
    cronJobMap.add(cronJob.id, cronJob);
  };

  public shared func updateCronJob(cronJob : CronJob) : async () {
    cronJobMap.add(cronJob.id, cronJob);
  };

  public shared func deleteCronJob(id : Text) : async () {
    ignore cronJobMap.remove(id);
  };

  public query func getAllCronJobs() : async [CronJob] {
    cronJobMap.values().toArray();
  };

  // Credits
  public shared func addCredit(credit : Credit) : async () {
    creditMap.add(credit.id, credit);
  };

  public shared func updateCredit(credit : Credit) : async () {
    creditMap.add(credit.id, credit);
  };

  public query func getAllCredits() : async [Credit] {
    creditMap.values().toArray();
  };

  // Providers
  public shared func addProvider(provider : Provider) : async () {
    providerMap.add(provider.id, provider);
  };

  public shared func updateProvider(provider : Provider) : async () {
    providerMap.add(provider.id, provider);
  };

  public query func getAllProviders() : async [Provider] {
    providerMap.values().toArray();
  };

  // ActivityLogs
  public shared func addActivityLog(log : ActivityLog) : async () {
    activityLogMap.add(log.id, log);
  };

  public query func getAllActivityLogs() : async [ActivityLog] {
    activityLogMap.values().toArray();
  };

  // BrainEntries
  public shared func addBrainEntry(entry : BrainEntry) : async () {
    brainEntryMap.add(entry.id, entry);
  };

  public query func getAllBrainEntries() : async [BrainEntry] {
    brainEntryMap.values().toArray();
  };

  // ConfigEntries
  public shared func addConfigEntry(entry : ConfigEntry) : async () {
    configEntryMap.add(entry.id, entry);
  };

  public shared func updateConfigEntry(entry : ConfigEntry) : async () {
    configEntryMap.add(entry.id, entry);
  };

  public shared func deleteConfigEntry(id : Text) : async () {
    ignore configEntryMap.remove(id);
  };

  public query func getAllConfigEntries() : async [ConfigEntry] {
    configEntryMap.values().toArray();
  };

  // SecurityEvents
  public shared func addSecurityEvent(event : SecurityEvent) : async () {
    securityEventMap.add(event.id, event);
  };

  public query func getAllSecurityEvents() : async [SecurityEvent] {
    securityEventMap.values().toArray();
  };

  // BroadcastMessages
  public shared func addBroadcastMessage(message : BroadcastMessage) : async () {
    broadcastMessageMap.add(message.id, message);
  };

  public query func getAllBroadcastMessages() : async [BroadcastMessage] {
    broadcastMessageMap.values().toArray();
  };

  // Leaderboard
  public shared func addLeaderboardEntry(entry : LeaderboardEntry) : async () {
    leaderboardMap.add(entry.agentId, entry);
  };

  public query func getAllLeaderboardEntries() : async [LeaderboardEntry] {
    leaderboardMap.values().toArray();
  };

  // Seed Sample Data
  public shared func seedData() : async () {
    if (apiToken == "") {
      tokenCounter += 1;
      apiToken := makeToken(tokenCounter);
    };

    let agents : [Agent] = [
      {
        id = "agent1";
        name = "ClawBot Alpha";
        status = #active;
        modelName = "GPT-4";
        uptimePercentage = 99;
        lastActive = Time.now();
        taskCount = 120;
        description = "Handles scheduling and reminders.";
      },
      {
        id = "agent2";
        name = "ClawBot Beta";
        status = #idle;
        modelName = "GPT-3.5";
        uptimePercentage = 95;
        lastActive = Time.now() - 3600;
        taskCount = 80;
        description = "Manages data processing tasks.";
      },
    ];
    for (agent in agents.values()) {
      agentMap.add(agent.id, agent);
    };

    let skill : Skill = {
      id = "skill1";
      agentId = "agent1";
      name = "Natural Language Processing";
      description = "Understands and processes text";
      version = "1.0";
      enabled = true;
    };
    skillMap.add(skill.id, skill);

    let cronJob : CronJob = {
      id = "cronJob1";
      agentId = "agent1";
      name = "Daily Report";
      schedule = "0 0 * * *";
      lastRun = Time.now() - 86400;
      nextRun = Time.now() + 86400;
      status = #idle;
    };
    cronJobMap.add(cronJob.id, cronJob);

    let credit : Credit = {
      id = "credit1";
      agentId = "agent1";
      balance = 5000;
      totalUsed = 2500;
      costAlerts = [(1000, true), (5000, false)];
    };
    creditMap.add(credit.id, credit);

    let provider : Provider = {
      id = "provider1";
      name = "OpenAI";
      status = #healthy;
      latencyMs = 120;
      uptimePercent = 99;
      model = "GPT-4";
    };
    providerMap.add(provider.id, provider);

    let log : ActivityLog = {
      id = "log1";
      agentId = "agent1";
      timestamp = Time.now();
      action = "TASK_COMPLETE";
      details = "Processed 50 items in batch job.";
      level = #info;
    };
    activityLogMap.add(log.id, log);

    let brain : BrainEntry = {
      id = "brain1";
      agentId = "agent1";
      key = "goal";
      value = "Maximize task throughput";
      category = "objective";
    };
    brainEntryMap.add(brain.id, brain);

    let cfg : ConfigEntry = {
      id = "cfg1";
      agentId = "agent1";
      key = "MAX_RETRIES";
      value = "3";
      sensitive = false;
    };
    configEntryMap.add(cfg.id, cfg);

    let secEvt : SecurityEvent = {
      id = "secevt1";
      agentId = "agent1";
      timestamp = Time.now();
      eventType = "AUTH_ATTEMPT";
      description = "Successful authentication from known IP";
      severity = #low;
    };
    securityEventMap.add(secEvt.id, secEvt);
  };
};
