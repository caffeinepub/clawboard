import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Info,
  List,
  MemoryStick,
  MessageSquare,
  Play,
  RefreshCw,
  Terminal,
  Wrench,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useGetAllAgents } from "../hooks/useQueries";
import {
  MOCK_MEMORY_CONTENT,
  MOCK_MEMORY_HISTORY,
  getAgentMockData,
} from "../lib/mockAgentData";

interface AgentControlCenterProps {
  agentId: string;
  onBack: () => void;
}

type LogLevel = "info" | "warn" | "error";
type LogFilter = "all" | LogLevel;

const PRIORITY_LABELS: Record<number, { label: string; color: string }> = {
  1: {
    label: "CRITICAL",
    color: "text-terminal-red border-terminal-red/40 bg-terminal-red/10",
  },
  2: {
    label: "HIGH",
    color: "text-terminal-amber border-terminal-amber/40 bg-terminal-amber/10",
  },
  3: { label: "NORMAL", color: "text-primary border-primary/40 bg-primary/10" },
  4: { label: "LOW", color: "text-muted-foreground border-border bg-muted/20" },
  5: {
    label: "BG",
    color: "text-muted-foreground/50 border-border/50 bg-muted/10",
  },
};

function formatTs(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "text-terminal-green border-terminal-green/30 bg-terminal-green/10",
    idle: "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/10",
    error: "text-terminal-red border-terminal-red/30 bg-terminal-red/10",
    offline: "text-muted-foreground border-border bg-muted/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border text-[10px] font-mono tracking-widest ${colors[status] ?? colors.offline}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "active" ? "bg-terminal-green animate-pulse" : status === "error" ? "bg-terminal-red animate-pulse" : "bg-current"}`}
      />
      {status.toUpperCase()}
    </span>
  );
}

export function AgentControlCenter({
  agentId,
  onBack,
}: AgentControlCenterProps) {
  const { data: agents } = useGetAllAgents();
  const agent = agents?.find((a) => a.id === agentId);
  const mock = useMemo(() => getAgentMockData(agentId), [agentId]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRefreshTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const agentName = agent?.name ?? "Agent";
  const agentStatus = (agent?.status as string) ?? "offline";

  return (
    <div className="space-y-4" data-refresh={refreshTick}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          data-ocid="agent-detail.back.button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-border/50 bg-muted/30 text-muted-foreground text-xs font-mono hover:text-foreground hover:bg-muted/60 transition-all duration-150"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Fleet
        </button>
        <div className="h-4 w-px bg-border/50" />
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-display font-bold text-foreground tracking-wide">
            {agentName}
          </h1>
          <StatusBadge status={agentStatus} />
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground/40 font-mono tracking-widest">
          <RefreshCw className="w-3 h-3" />
          AUTO-REFRESH 30s
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" data-ocid="agent-detail.tab">
        <TabsList className="bg-card border border-border h-auto p-1 flex-wrap gap-1">
          {[
            {
              value: "tasks",
              label: "Tasks",
              icon: <List className="w-3 h-3" />,
            },
            {
              value: "memory",
              label: "Memory State",
              icon: <MemoryStick className="w-3 h-3" />,
            },
            {
              value: "tools",
              label: "Tool Calls",
              icon: <Wrench className="w-3 h-3" />,
            },
            {
              value: "queue",
              label: "Job Queue",
              icon: <Clock className="w-3 h-3" />,
            },
            {
              value: "logs",
              label: "Logs",
              icon: <Terminal className="w-3 h-3" />,
            },
            {
              value: "system",
              label: "System Load",
              icon: <Cpu className="w-3 h-3" />,
            },
            {
              value: "convo",
              label: "Conversations",
              icon: <MessageSquare className="w-3 h-3" />,
            },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="flex items-center gap-1.5 text-[11px] font-mono tracking-wide px-3 py-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/25"
            >
              {t.icon}
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* TASKS TAB */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <TasksTab tasks={mock.tasks} />
        </TabsContent>

        {/* MEMORY TAB */}
        <TabsContent value="memory" className="mt-4">
          <MemoryTab />
        </TabsContent>

        {/* TOOL CALLS TAB */}
        <TabsContent value="tools" className="mt-4">
          <ToolCallsTab toolCalls={mock.toolCalls} />
        </TabsContent>

        {/* JOB QUEUE TAB */}
        <TabsContent value="queue" className="mt-4">
          <JobQueueTab jobs={mock.jobQueue} />
        </TabsContent>

        {/* LOGS TAB */}
        <TabsContent value="logs" className="mt-4">
          <LogsTab logs={mock.logs} />
        </TabsContent>

        {/* SYSTEM LOAD TAB */}
        <TabsContent value="system" className="mt-4">
          <SystemLoadTab load={mock.systemLoad} />
        </TabsContent>

        {/* CONVERSATIONS TAB */}
        <TabsContent value="convo" className="mt-4">
          <ConversationsTab
            conversations={mock.conversations}
            agentName={agentName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Tasks Tab ───────────────────────────────────────────────────────────────
function TasksTab({
  tasks,
}: {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    agentId: string;
    startedAt: number | null;
    completedAt: number | null;
    duration: number | null;
    output: string | null;
  }>;
}) {
  const running = tasks.filter((t) => t.status === "running");
  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-5">
      {running.length > 0 && (
        <div>
          <SectionLabel>Currently Running</SectionLabel>
          {running.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-sm border border-primary/30 bg-primary/5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <motion.span
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1.5,
                  }}
                />
                <span className="text-sm font-mono font-semibold text-foreground">
                  {task.title}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground/50 font-mono tracking-widest">
                Started{" "}
                {task.startedAt ? formatRelativeTime(task.startedAt) : "now"}
              </div>
              <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: ["0%", "60%", "45%", "80%", "65%"] }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <SectionLabel>Pending Queue ({pending.length})</SectionLabel>
          <div className="rounded-sm border border-border overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["#", "Task", "Queued"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((task, i) => (
                  <tr
                    key={task.id}
                    data-ocid={`agent-detail.tasks.pending.item.${i + 1}`}
                    className="border-b border-border/40 hover:bg-muted/10"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground/40">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2.5 text-foreground/80">
                      {task.title}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground/40">
                      {task.startedAt
                        ? formatRelativeTime(task.startedAt as number)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <SectionLabel>Completed ({completed.length})</SectionLabel>
          <div className="space-y-2">
            {completed.map((task, i) => (
              <div
                key={task.id}
                data-ocid={`agent-detail.tasks.completed.item.${i + 1}`}
                className="flex items-start gap-3 p-3 rounded-sm border border-border/40 bg-card"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-foreground/80">
                    {task.title}
                  </p>
                  {task.output && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono">
                      {task.output}
                    </p>
                  )}
                </div>
                <div className="text-[9px] text-muted-foreground/35 font-mono shrink-0">
                  {task.duration ? formatDuration(task.duration) : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Memory Tab ───────────────────────────────────────────────────────────────
function MemoryTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <SectionLabel>MEMORY.md — Live Contents</SectionLabel>
        <div className="rounded-sm border border-border bg-background overflow-hidden">
          <div className="px-3 py-2 border-b border-border/50 bg-muted/20 flex items-center gap-2">
            <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase font-mono">
              MEMORY.md
            </span>
            <span className="ml-auto text-[9px] text-primary/50 font-mono">
              LIVE
            </span>
          </div>
          <pre className="p-4 text-[11px] font-mono text-foreground/75 overflow-auto max-h-96 leading-relaxed whitespace-pre-wrap">
            {MOCK_MEMORY_CONTENT}
          </pre>
        </div>
      </div>
      <div>
        <SectionLabel>Change History</SectionLabel>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Time", "Type", "Key"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_MEMORY_HISTORY.map((entry, i) => (
                <tr
                  key={entry.id}
                  data-ocid={`agent-detail.memory.item.${i + 1}`}
                  className="border-b border-border/40 hover:bg-muted/10"
                >
                  <td className="px-3 py-2 text-muted-foreground/40">
                    {formatRelativeTime(entry.timestamp)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-sm border text-[9px] tracking-widest ${
                        entry.changeType === "added"
                          ? "border-terminal-green/30 text-terminal-green bg-terminal-green/10"
                          : entry.changeType === "updated"
                            ? "border-primary/30 text-primary bg-primary/10"
                            : "border-terminal-red/30 text-terminal-red bg-terminal-red/10"
                      }`}
                    >
                      {entry.changeType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-foreground/70 truncate max-w-[160px]">
                    {entry.key}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Tool Calls Tab ───────────────────────────────────────────────────────────
function ToolCallsTab({
  toolCalls,
}: {
  toolCalls: Array<{
    id: string;
    skill: string;
    args: string;
    result: string;
    durationMs: number;
    timestamp: number;
    agentId: string;
    output?: string | null;
  }>;
}) {
  const [filter, setFilter] = useState<"all" | "success" | "error">("all");
  const filtered =
    filter === "all" ? toolCalls : toolCalls.filter((t) => t.result === filter);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          data-ocid="agent-detail.tools.filter.tab"
          className="flex items-center gap-1 p-1 rounded-sm border border-border bg-card"
        >
          {(["all", "success", "error"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all ${
                filter === f
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground/50 hover:text-foreground border border-transparent"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-mono">
          {filtered.length} calls
        </span>
      </div>
      <div className="rounded-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Skill", "Args", "Result", "Duration", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tc, i) => (
                <tr
                  key={tc.id}
                  data-ocid={`agent-detail.tools.item.${i + 1}`}
                  className={`border-b border-border/40 hover:bg-muted/10 border-l-2 ${
                    tc.result === "success"
                      ? "border-l-terminal-green/50"
                      : "border-l-terminal-red/50"
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <span className="px-1.5 py-0.5 rounded-sm bg-accent/10 border border-accent/20 text-accent text-[10px]">
                      {tc.skill}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/60 max-w-[160px] truncate">
                    {tc.args}
                  </td>
                  <td className="px-4 py-2.5">
                    {tc.result === "success" ? (
                      <span className="flex items-center gap-1 text-terminal-green">
                        <CheckCircle2 className="w-3 h-3" />
                        OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-terminal-red">
                        <XCircle className="w-3 h-3" />
                        ERR
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/60">
                    {formatDuration(tc.durationMs)}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/40">
                    {formatTs(tc.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Job Queue Tab ─────────────────────────────────────────────────────────────
function JobQueueTab({
  jobs,
}: {
  jobs: Array<{
    id: string;
    name: string;
    status: string;
    priority: number;
    queuedAt: number;
    startedAt: number | null;
    agentId: string;
  }>;
}) {
  const pending = jobs.filter(
    (j) => j.status === "pending" || j.status === "running",
  );
  const completed = jobs.filter(
    (j) => j.status === "completed" || j.status === "cancelled",
  );

  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Pending ({pending.length})</SectionLabel>
        <div className="space-y-2">
          {pending.map((job, i) => {
            const p = PRIORITY_LABELS[job.priority] ?? PRIORITY_LABELS[3];
            return (
              <div
                key={job.id}
                data-ocid={`agent-detail.queue.item.${i + 1}`}
                className="flex items-center gap-3 p-3 rounded-sm border border-border bg-card hover:border-border/80 transition-colors"
              >
                <div className="flex items-center gap-2 shrink-0 text-muted-foreground/30">
                  <span className="text-xs font-mono">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-foreground/80 truncate">
                    {job.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                    Queued {formatRelativeTime(job.queuedAt)}
                  </p>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded-sm border text-[9px] font-mono tracking-widest ${p.color}`}
                >
                  {p.label}
                </span>
                {job.status === "running" && (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 1.5,
                    }}
                  />
                )}
                <button
                  type="button"
                  data-ocid={`agent-detail.queue.delete_button.${i + 1}`}
                  className="text-muted-foreground/30 hover:text-terminal-red transition-colors text-[10px] font-mono border border-border/40 px-2 py-0.5 rounded-sm hover:border-terminal-red/40"
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <SectionLabel>Completed ({completed.length})</SectionLabel>
        <div className="rounded-sm border border-border overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Job", "Status", "Started", "Priority"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completed.map((job, i) => (
                <tr
                  key={job.id}
                  data-ocid={`agent-detail.queue.completed.item.${i + 1}`}
                  className="border-b border-border/40 hover:bg-muted/10"
                >
                  <td className="px-4 py-2.5 text-foreground/70">{job.name}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-sm border ${
                        job.status === "completed"
                          ? "border-terminal-green/30 text-terminal-green bg-terminal-green/10"
                          : "border-border text-muted-foreground/50"
                      }`}
                    >
                      {job.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/40">
                    {job.startedAt ? formatRelativeTime(job.startedAt) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/40">
                    {job.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────
function LogsTab({
  logs,
}: {
  logs: Array<{
    id: string;
    level: string;
    message: string;
    timestamp: number;
    agentId: string;
  }>;
}) {
  const [filter, setFilter] = useState<LogFilter>("all");
  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.level === filter);

  const levelColor: Record<string, string> = {
    info: "text-accent",
    warn: "text-terminal-amber",
    error: "text-terminal-red",
  };
  const levelPrefix: Record<string, string> = {
    info: "INFO ",
    warn: "WARN ",
    error: "ERROR",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          data-ocid="agent-detail.logs.filter.tab"
          className="flex items-center gap-1 p-1 rounded-sm border border-border bg-card"
        >
          {(["all", "info", "warn", "error"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all ${
                filter === f
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground/50 hover:text-foreground border border-transparent"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/40 font-mono ml-auto">
          Showing {filtered.length} entries
        </span>
      </div>
      <div className="rounded-sm border border-border bg-[#0a0a0f] overflow-hidden">
        <div className="px-3 py-2 border-b border-border/50 bg-muted/10 flex items-center gap-2">
          <Terminal className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[9px] font-mono text-muted-foreground/30 tracking-widest uppercase">
            agent.log
          </span>
        </div>
        <div className="max-h-96 overflow-y-auto p-4 space-y-1">
          {filtered.map((log, i) => (
            <div
              key={log.id}
              data-ocid={`agent-detail.logs.item.${i + 1}`}
              className="flex gap-3 text-[11px] font-mono leading-relaxed"
            >
              <span className="text-muted-foreground/30 shrink-0 w-16 text-right">
                {formatTs(log.timestamp)}
              </span>
              <span
                className={`shrink-0 w-10 ${levelColor[log.level] ?? "text-muted-foreground"}`}
              >
                {levelPrefix[log.level]}
              </span>
              <span className={levelColor[log.level] ?? "text-foreground/70"}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── System Load Tab ──────────────────────────────────────────────────────────
function SystemLoadTab({
  load,
}: {
  load: {
    cpu: number;
    ram: number;
    disk: number;
    networkIn: number;
    networkOut: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <GaugeCard
        label="CPU"
        value={load.cpu}
        unit="%"
        color={
          load.cpu > 80 ? "#ef4444" : load.cpu > 60 ? "#f59e0b" : "#3b82f6"
        }
      />
      <GaugeCard
        label="RAM"
        value={load.ram}
        unit="%"
        color={
          load.ram > 85 ? "#ef4444" : load.ram > 70 ? "#f59e0b" : "#3b82f6"
        }
      />
      <GaugeCard
        label="DISK"
        value={load.disk}
        unit="%"
        color={
          load.disk > 90 ? "#ef4444" : load.disk > 75 ? "#f59e0b" : "#06b6d4"
        }
      />
      <div className="flex flex-col gap-3 p-4 rounded-sm border border-border bg-card">
        <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
          NETWORK
        </span>
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-muted-foreground/50">IN</span>
            <span className="text-terminal-green">{load.networkIn} MB/s</span>
          </div>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-muted-foreground/50">OUT</span>
            <span className="text-accent">{load.networkOut} MB/s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GaugeCard({
  label,
  value,
  unit,
  color,
}: { label: string; value: number; unit: string; color: string }) {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div
      data-ocid={`agent-detail.system.${label.toLowerCase()}.card`}
      className="flex flex-col items-center gap-3 p-4 rounded-sm border border-border bg-card"
    >
      <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
        {label}
      </span>
      <div className="relative w-24 h-24">
        <svg
          className="w-24 h-24 -rotate-90"
          viewBox="0 0 88 88"
          role="img"
          aria-label={`${label} gauge`}
        >
          <circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          <motion.circle
            cx="44"
            cy="44"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-display font-bold" style={{ color }}>
            {value}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Conversations Tab ─────────────────────────────────────────────────────────
function ConversationsTab({
  conversations,
  agentName,
}: {
  conversations: Array<{
    id: string;
    startedAt: number;
    agentId: string;
    messages: Array<{ role: string; content: string; timestamp: number }>;
  }>;
  agentName: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(
    conversations[0]?.id ?? null,
  );

  return (
    <div className="space-y-3">
      {conversations.map((convo, i) => (
        <div
          key={convo.id}
          data-ocid={`agent-detail.convo.item.${i + 1}`}
          className="rounded-sm border border-border bg-card overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setExpanded(expanded === convo.id ? null : convo.id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-xs font-mono text-foreground/70">
              Conversation {i + 1}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-mono ml-auto">
              {formatRelativeTime(convo.startedAt)} — {convo.messages.length}{" "}
              messages
            </span>
            {expanded === convo.id ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            )}
          </button>
          <AnimatePresence>
            {expanded === convo.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3 border-t border-border/40">
                  {convo.messages.map((msg, mi) => (
                    <div
                      key={`${convo.id}-${mi}`}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mt-3`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-sm text-xs font-mono leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary/10 border border-primary/20 text-foreground/80"
                            : "bg-muted/30 border border-border text-foreground/80"
                        }`}
                      >
                        <div
                          className={`text-[9px] tracking-widest mb-1 ${
                            msg.role === "user"
                              ? "text-primary/50"
                              : "text-accent/50"
                          }`}
                        >
                          {msg.role === "user"
                            ? "USER"
                            : agentName.toUpperCase()}
                        </div>
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/50 uppercase">
        {children}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}
