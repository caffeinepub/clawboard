import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BroadcastMessage {
    id: string;
    sentBy: string;
    agentTargets: Array<string>;
    message: string;
    timestamp: Time;
}
export interface LeaderboardEntry {
    rank: bigint;
    agentName: string;
    agentId: string;
    uptimePercent: bigint;
    taskCount: bigint;
    creditsUsed: bigint;
}
export type Time = bigint;
export interface ConfigEntry {
    id: string;
    key: string;
    value: string;
    agentId: string;
    sensitive: boolean;
}
export interface SecurityEvent {
    id: string;
    description: string;
    agentId: string;
    timestamp: Time;
    severity: SecuritySeverity;
    eventType: string;
}
export interface ActivityLog {
    id: string;
    action: string;
    agentId: string;
    level: ActivityLevel;
    timestamp: Time;
    details: string;
}
export interface Credit {
    id: string;
    balance: bigint;
    agentId: string;
    totalUsed: bigint;
    costAlerts: Array<[bigint, boolean]>;
}
export interface Agent {
    id: string;
    status: Status;
    name: string;
    description: string;
    taskCount: bigint;
    modelName: string;
    uptimePercentage: bigint;
    lastActive: Time;
}
export interface Skill {
    id: string;
    name: string;
    description: string;
    agentId: string;
    version: string;
    enabled: boolean;
}
export interface Provider {
    id: string;
    status: ProviderStatus;
    model: string;
    name: string;
    latencyMs: bigint;
    uptimePercent: bigint;
}
export interface BrainEntry {
    id: string;
    key: string;
    value: string;
    agentId: string;
    category: string;
}
export interface CronJob {
    id: string;
    status: Variant_idle_failed_running;
    name: string;
    agentId: string;
    nextRun: Time;
    schedule: string;
    lastRun: Time;
}
export enum ActivityLevel {
    info = "info",
    warn = "warn",
    error = "error"
}
export enum ProviderStatus {
    down = "down",
    healthy = "healthy",
    degraded = "degraded"
}
export enum SecuritySeverity {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum Status {
    active = "active",
    idle = "idle",
    error = "error",
    offline = "offline"
}
export enum Variant_idle_failed_running {
    idle = "idle",
    failed = "failed",
    running = "running"
}
export interface backendInterface {
    addActivityLog(log: ActivityLog): Promise<void>;
    addAgent(agent: Agent): Promise<void>;
    addBrainEntry(entry: BrainEntry): Promise<void>;
    addBroadcastMessage(message: BroadcastMessage): Promise<void>;
    addConfigEntry(entry: ConfigEntry): Promise<void>;
    addCredit(credit: Credit): Promise<void>;
    addCronJob(cronJob: CronJob): Promise<void>;
    addLeaderboardEntry(entry: LeaderboardEntry): Promise<void>;
    addProvider(provider: Provider): Promise<void>;
    addSecurityEvent(event: SecurityEvent): Promise<void>;
    addSkill(skill: Skill): Promise<void>;
    getAgent(id: string): Promise<Agent>;
    getAllActivityLogs(): Promise<Array<ActivityLog>>;
    getAllAgents(): Promise<Array<Agent>>;
    getAllBrainEntries(): Promise<Array<BrainEntry>>;
    getAllBroadcastMessages(): Promise<Array<BroadcastMessage>>;
    getAllConfigEntries(): Promise<Array<ConfigEntry>>;
    getAllCredits(): Promise<Array<Credit>>;
    getAllCronJobs(): Promise<Array<CronJob>>;
    getAllLeaderboardEntries(): Promise<Array<LeaderboardEntry>>;
    getAllProviders(): Promise<Array<Provider>>;
    getAllSecurityEvents(): Promise<Array<SecurityEvent>>;
    getAllSkills(): Promise<Array<Skill>>;
    seedData(): Promise<void>;
}
