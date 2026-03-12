import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
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
  type CronJobStatus = { #running; #idle; #failed };

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

  // Persistent Data Structures
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

  // Modules with comparison functions
  module Agent {
    public func compare(a1 : Agent, a2 : Agent) : Order.Order {
      Text.compare(a1.name, a2.name);
    };
  };

  module Skill {
    public func compare(s1 : Skill, s2 : Skill) : Order.Order {
      Text.compare(s1.name, s2.name);
    };
  };

  module CronJob {
    public func compare(cj1 : CronJob, cj2 : CronJob) : Order.Order {
      Text.compare(cj1.name, cj2.name);
    };
  };

  module Credit {
    public func compare(c1 : Credit, c2 : Credit) : Order.Order {
      switch (Nat.compare(c1.balance, c2.balance)) {
        case (#equal) { Text.compare(c1.id, c2.id) };
        case (order) { order };
      };
    };
  };

  module Provider {
    public func compare(p1 : Provider, p2 : Provider) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  module ActivityLog {
    public func compare(al1 : ActivityLog, al2 : ActivityLog) : Order.Order {
      Text.compare(al1.action, al2.action);
    };
  };

  module BrainEntry {
    public func compare(be1 : BrainEntry, be2 : BrainEntry) : Order.Order {
      Text.compare(be1.key, be2.key);
    };
  };

  module ConfigEntry {
    public func compare(ce1 : ConfigEntry, ce2 : ConfigEntry) : Order.Order {
      Text.compare(ce1.key, ce2.key);
    };
  };

  module SecurityEvent {
    public func compare(se1 : SecurityEvent, se2 : SecurityEvent) : Order.Order {
      Text.compare(se1.eventType, se2.eventType);
    };
  };

  module BroadcastMessage {
    public func compare(bm1 : BroadcastMessage, bm2 : BroadcastMessage) : Order.Order {
      switch (Int.compare(bm1.timestamp, bm2.timestamp)) {
        case (#equal) { Text.compare(bm1.id, bm2.id) };
        case (order) { order };
      };
    };
  };

  module LeaderboardEntry {
    public func compare(le1 : LeaderboardEntry, le2 : LeaderboardEntry) : Order.Order {
      switch (Nat.compare(le1.rank, le2.rank)) {
        case (#equal) { Text.compare(le1.agentName, le2.agentName) };
        case (order) { order };
      };
    };
  };

  // CRUD Operations
  // Agents
  public shared ({ caller }) func addAgent(agent : Agent) : async () {
    agentMap.add(agent.id, agent);
  };

  public query ({ caller }) func getAgent(id : Text) : async Agent {
    switch (agentMap.get(id)) {
      case (null) { Runtime.trap("Agent not found") };
      case (?agent) { agent };
    };
  };

  public query ({ caller }) func getAllAgents() : async [Agent] {
    agentMap.values().toArray().sort();
  };

  // Skills
  public shared ({ caller }) func addSkill(skill : Skill) : async () {
    skillMap.add(skill.id, skill);
  };

  public query ({ caller }) func getAllSkills() : async [Skill] {
    skillMap.values().toArray();
  };

  // CronJobs
  public shared ({ caller }) func addCronJob(cronJob : CronJob) : async () {
    cronJobMap.add(cronJob.id, cronJob);
  };

  public query ({ caller }) func getAllCronJobs() : async [CronJob] {
    cronJobMap.values().toArray();
  };

  // Credits
  public shared ({ caller }) func addCredit(credit : Credit) : async () {
    creditMap.add(credit.id, credit);
  };

  public query ({ caller }) func getAllCredits() : async [Credit] {
    creditMap.values().toArray();
  };

  // Providers
  public shared ({ caller }) func addProvider(provider : Provider) : async () {
    providerMap.add(provider.id, provider);
  };

  public query ({ caller }) func getAllProviders() : async [Provider] {
    providerMap.values().toArray();
  };

  // ActivityLogs
  public shared ({ caller }) func addActivityLog(log : ActivityLog) : async () {
    activityLogMap.add(log.id, log);
  };

  public query ({ caller }) func getAllActivityLogs() : async [ActivityLog] {
    activityLogMap.values().toArray();
  };

  // BrainEntries
  public shared ({ caller }) func addBrainEntry(entry : BrainEntry) : async () {
    brainEntryMap.add(entry.id, entry);
  };

  public query ({ caller }) func getAllBrainEntries() : async [BrainEntry] {
    brainEntryMap.values().toArray();
  };

  // ConfigEntries
  public shared ({ caller }) func addConfigEntry(entry : ConfigEntry) : async () {
    configEntryMap.add(entry.id, entry);
  };

  public query ({ caller }) func getAllConfigEntries() : async [ConfigEntry] {
    configEntryMap.values().toArray();
  };

  // SecurityEvents
  public shared ({ caller }) func addSecurityEvent(event : SecurityEvent) : async () {
    securityEventMap.add(event.id, event);
  };

  public query ({ caller }) func getAllSecurityEvents() : async [SecurityEvent] {
    securityEventMap.values().toArray();
  };

  // BroadcastMessages
  public shared ({ caller }) func addBroadcastMessage(message : BroadcastMessage) : async () {
    broadcastMessageMap.add(message.id, message);
  };

  public query ({ caller }) func getAllBroadcastMessages() : async [BroadcastMessage] {
    broadcastMessageMap.values().toArray();
  };

  // Leaderboard
  public shared ({ caller }) func addLeaderboardEntry(entry : LeaderboardEntry) : async () {
    leaderboardMap.add(entry.agentId, entry);
  };

  public query ({ caller }) func getAllLeaderboardEntries() : async [LeaderboardEntry] {
    leaderboardMap.values().toArray();
  };

  // Seed Sample Data
  public shared ({ caller }) func seedData() : async () {
    // Agents
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

    // Skills
    let skill : Skill = {
      id = "skill1";
      agentId = "agent1";
      name = "Natural Language Processing";
      description = "Understands and processes text";
      version = "1.0";
      enabled = true;
    };
    skillMap.add(skill.id, skill);

    // CronJobs
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

    // Continue seeding remaining data as needed...
  };
};
