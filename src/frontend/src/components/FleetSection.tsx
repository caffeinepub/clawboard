import { Activity, Bot, Cpu, MemoryStick, Plug, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Agent as BackendAgent } from "../backend";
import { useGetAllAgents } from "../hooks/useQueries";
import {
  getSystemLoadForAgent,
  getTokenSpendForAgent,
} from "../lib/mockAgentData";
import { SectionError, SectionLoading } from "./SectionShell";

type Section =
  | "fleet"
  | "agent-detail"
  | "agentops"
  | "integrations"
  | "skills"
  | "cron"
  | "credits"
  | "activity"
  | "security"
  | "connect"
  | "controls"
  | "brain"
  | "privacy";

interface FleetSectionProps {
  setActive: (s: Section) => void;
  setSelectedAgentId: (id: string) => void;
}

type HealthFilter = "all" | "healthy" | "warning" | "critical";

function getHealth(status: string): "healthy" | "warning" | "critical" {
  if (status === "active") return "healthy";
  if (status === "idle") return "warning";
  return "critical";
}

export function FleetSection({
  setActive,
  setSelectedAgentId,
}: FleetSectionProps) {
  const { data, isLoading, isError } = useGetAllAgents();
  const [filter, setFilter] = useState<HealthFilter>("all");
  const agents: BackendAgent[] = data ?? [];

  const filtered = useMemo(() => {
    if (filter === "all") return agents;
    return agents.filter((a) => {
      const h = getHealth(a.status as string);
      return h === filter;
    });
  }, [agents, filter]);

  const online = agents.filter((a) => (a.status as string) === "active").length;
  const totalTokens = agents.reduce(
    (sum, a) => sum + getTokenSpendForAgent(a.id).tokens,
    0,
  );
  const totalUsd = agents.reduce(
    (sum, a) => sum + getTokenSpendForAgent(a.id).usd,
    0,
  );
  const errors = agents.filter(
    (a) =>
      (a.status as string) === "error" || (a.status as string) === "offline",
  ).length;

  if (isLoading) return <SectionLoading ocid="fleet.loading_state" />;
  if (isError) return <SectionError />;

  if (agents.length === 0) {
    return (
      <div
        data-ocid="fleet.empty_state"
        className="flex flex-col items-center justify-center gap-5 py-24"
      >
        <div className="relative">
          <Bot className="w-14 h-14 text-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-mono font-semibold text-foreground/70 tracking-wide">
            No agents in fleet
          </p>
          <p className="text-xs font-mono text-muted-foreground/50">
            Add the ClawBoard skill to your agent to get started
          </p>
        </div>
        <button
          type="button"
          data-ocid="fleet.connect.button"
          onClick={() => setActive("connect")}
          className="flex items-center gap-2 px-4 py-2 rounded-sm border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-wide hover:bg-primary/20 hover:border-primary/50 transition-all duration-150"
        >
          <Plug className="w-3.5 h-3.5" />
          Go to Connect Agent
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Fleet summary bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "AGENTS ONLINE",
            value: `${online} / ${agents.length}`,
            accent: "text-primary",
            icon: <Bot className="w-4 h-4" />,
          },
          {
            label: "TOKENS TODAY",
            value: `${(totalTokens / 1000).toFixed(0)}K`,
            accent: "text-accent",
            icon: <Activity className="w-4 h-4" />,
          },
          {
            label: "USD SPEND TODAY",
            value: `$${totalUsd.toFixed(2)}`,
            accent: "text-terminal-amber",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            label: "ACTIVE ERRORS",
            value: errors.toString(),
            accent:
              errors > 0 ? "text-terminal-red" : "text-muted-foreground/50",
            icon: <Cpu className="w-4 h-4" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 p-3 rounded-sm border border-border bg-card"
          >
            <span className={`${stat.accent} opacity-60`}>{stat.icon}</span>
            <div>
              <p className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
                {stat.label}
              </p>
              <p className={`text-lg font-display font-bold ${stat.accent}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <div
          data-ocid="fleet.filter.tab"
          className="flex items-center gap-1 p-1 rounded-sm border border-border bg-card"
        >
          {(["all", "healthy", "warning", "critical"] as HealthFilter[]).map(
            (f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all duration-150 ${
                  filter === f
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ),
          )}
        </div>
        <div className="ml-auto text-[10px] text-muted-foreground/40 tracking-widest">
          {filtered.length} agents
        </div>
      </div>

      {/* Fleet grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((agent, i) => (
          <FleetCard
            key={agent.id}
            agent={agent}
            index={i + 1}
            onDrillDown={() => {
              setSelectedAgentId(agent.id);
              setActive("agent-detail");
            }}
          />
        ))}
      </div>
    </div>
  );
}

type StatusKey = "active" | "idle" | "error" | "offline";

const STATUS_CONFIG: Record<
  StatusKey,
  {
    label: string;
    color: string;
    dot: string;
    border: string;
    glow: string;
    cardBg: string;
  }
> = {
  active: {
    label: "LIVE",
    color: "text-terminal-green",
    dot: "bg-terminal-green",
    border: "border-terminal-green/30",
    glow: "shadow-glow-green",
    cardBg: "bg-card",
  },
  idle: {
    label: "IDLE",
    color: "text-terminal-amber",
    dot: "bg-terminal-amber",
    border: "border-terminal-amber/30",
    glow: "shadow-glow-amber",
    cardBg: "bg-card",
  },
  error: {
    label: "ERROR",
    color: "text-terminal-red",
    dot: "bg-terminal-red",
    border: "border-terminal-red/30",
    glow: "shadow-glow-red",
    cardBg: "bg-card",
  },
  offline: {
    label: "OFFLINE",
    color: "text-muted-foreground/50",
    dot: "bg-muted-foreground/40",
    border: "border-border/40",
    glow: "",
    cardBg: "bg-card opacity-70",
  },
};

const MOCK_TASKS_SHORT = [
  "Research competitor pricing",
  "Update MEMORY.md",
  "Webhook delivery",
  "Analyze CSV data",
  "Scrape product listings",
  "Send Slack digest",
  "Run cron analytics",
  "Write daily summary",
];

function formatRelativeTime(timestamp: bigint): string {
  const now = Date.now();
  const ts = Number(timestamp) / 1_000_000;
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function FleetCard({
  agent,
  index,
  onDrillDown,
}: { agent: BackendAgent; index: number; onDrillDown: () => void }) {
  const statusKey = agent.status as string as StatusKey;
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.offline;
  const showPing = statusKey === "active";
  const sysLoad = getSystemLoadForAgent(agent.id);
  const spend = getTokenSpendForAgent(agent.id);
  const taskIdx = hashStr(agent.id) % MOCK_TASKS_SHORT.length;
  const currentTask =
    statusKey === "active"
      ? MOCK_TASKS_SHORT[taskIdx]
      : statusKey === "idle"
        ? "Idle — awaiting task"
        : "Offline";

  return (
    <motion.div
      data-ocid={`fleet.item.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={onDrillDown}
      className={`relative flex flex-col gap-3 p-4 rounded-sm border ${cfg.cardBg} ${cfg.border} ${cfg.glow} hover:brightness-110 cursor-pointer transition-all duration-200 overflow-hidden group`}
    >
      {/* Corner accents */}
      <span
        className={`absolute top-0 left-0 w-3 h-3 border-t border-l ${cfg.border}`}
      />
      <span
        className={`absolute top-0 right-0 w-3 h-3 border-t border-r ${cfg.border}`}
      />
      <span
        className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l ${cfg.border}`}
      />
      <span
        className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r ${cfg.border}`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-sm text-foreground truncate tracking-wide">
          {agent.name}
        </h3>
        <div
          className={`flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-sm border ${cfg.border} bg-background/40`}
        >
          <div className="relative shrink-0">
            <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
            {showPing && (
              <span
                className={`absolute inset-0 w-2 h-2 rounded-full ${cfg.dot} animate-ping opacity-50`}
              />
            )}
          </div>
          <span
            className={`text-[10px] font-bold tracking-widest ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Current task */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase shrink-0">
          TASK
        </span>
        <span className="text-[10px] font-mono text-foreground/70 truncate">
          {currentTask}
        </span>
      </div>

      {/* Model */}
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase shrink-0">
          MODEL
        </span>
        <span className="px-1.5 py-0.5 rounded-sm bg-primary/8 border border-primary/15 text-primary/80 text-[10px] font-mono truncate">
          {agent.modelName}
        </span>
      </div>

      {/* CPU / RAM bars */}
      <div className="grid grid-cols-2 gap-2">
        <MiniBar
          label="CPU"
          value={sysLoad.cpu}
          icon={<Cpu className="w-2.5 h-2.5" />}
        />
        <MiniBar
          label="RAM"
          value={sysLoad.ram}
          icon={<MemoryStick className="w-2.5 h-2.5" />}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30">
        <span className="text-[9px] text-muted-foreground/40 tracking-widest">
          PING {formatRelativeTime(agent.lastActive)}
        </span>
        <span className="text-[9px] text-terminal-amber/70 font-mono tracking-wide">
          ${spend.usd} today
        </span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-200 rounded-sm pointer-events-none" />
    </motion.div>
  );
}

function MiniBar({
  label,
  value,
  icon,
}: { label: string; value: number; icon: React.ReactNode }) {
  const color =
    value > 80
      ? "bg-terminal-red"
      : value > 60
        ? "bg-terminal-amber"
        : "bg-primary";
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-[9px] text-muted-foreground/40 tracking-widest">
        <span className="text-muted-foreground/30">{icon}</span>
        <span>
          {label} {value}%
        </span>
      </div>
      <div className="h-0.5 w-full bg-muted/40 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
