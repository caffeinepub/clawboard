import { ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import type { Agent as BackendAgent } from "../backend";

interface AgentCardProps {
  agent: BackendAgent;
  index: number;
}

function formatRelativeTime(timestamp: bigint): string {
  const now = Date.now();
  const ts = Number(timestamp) / 1_000_000; // nanoseconds to ms
  const diff = now - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

type StatusKey = "active" | "idle" | "error" | "offline";

const STATUS_CONFIG: Record<
  StatusKey,
  {
    label: string;
    color: string;
    glow: string;
    dot: string;
    pingColor: string;
    border: string;
  }
> = {
  active: {
    label: "ACTIVE",
    color: "text-terminal-green",
    glow: "shadow-glow-green",
    dot: "bg-terminal-green",
    pingColor: "bg-terminal-green",
    border: "border-terminal-green/30",
  },
  idle: {
    label: "IDLE",
    color: "text-terminal-amber",
    glow: "shadow-glow-amber",
    dot: "bg-terminal-amber",
    pingColor: "",
    border: "border-terminal-amber/30",
  },
  error: {
    label: "ERROR",
    color: "text-terminal-red",
    glow: "shadow-glow-red",
    dot: "bg-terminal-red",
    pingColor: "bg-terminal-red",
    border: "border-terminal-red/30",
  },
  offline: {
    label: "OFFLINE",
    color: "text-terminal-gray",
    glow: "",
    dot: "bg-terminal-gray",
    pingColor: "",
    border: "border-terminal-gray/20",
  },
};

export function AgentCard({ agent, index }: AgentCardProps) {
  const statusKey = agent.status as string as StatusKey;
  const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.offline;
  const showPing = statusKey === "active" || statusKey === "error";

  return (
    <motion.div
      data-ocid={`agents.item.${index}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`relative flex flex-col gap-3 p-4 rounded-sm border bg-card ${
        cfg.border
      } ${cfg.glow} hover:brightness-110 transition-all duration-200 overflow-hidden`}
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

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm text-foreground truncate tracking-wide">
            {agent.name}
          </h3>
          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
            {agent.description}
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-sm border ${cfg.border} bg-background/40`}
        >
          {/* Pulsing status dot with ping ring */}
          <div className="relative shrink-0">
            <span className={`inline-block w-2 h-2 rounded-full ${cfg.dot}`} />
            {showPing && (
              <span
                className={`absolute inset-0 w-2 h-2 rounded-full ${cfg.pingColor} animate-ping opacity-50`}
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

      {/* Provider badge */}
      {agent.modelName && (
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
            Provider
          </span>
          <span className="px-1.5 py-0.5 rounded-sm bg-primary/8 border border-primary/15 text-primary/80 text-[10px] font-mono truncate max-w-[120px]">
            {agent.modelName}
          </span>
        </div>
      )}

      {/* Divider */}
      <div
        className={`h-px w-full bg-gradient-to-r from-transparent via-current to-transparent ${cfg.color} opacity-20`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Stat label="TASKS" value={agent.taskCount.toString()} accent />
        <Stat
          label="UPTIME"
          value={`${agent.uptimePercentage.toString()}%`}
          accent
        />
        <Stat label="LAST PING" value={formatRelativeTime(agent.lastActive)} />
        <Stat label="MODEL" value={agent.modelName} mono />
      </div>

      {/* Uptime bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] text-muted-foreground/50 tracking-widest">
          <span>UPTIME</span>
          <span>{agent.uptimePercentage.toString()}%</span>
        </div>
        <div className="h-0.5 w-full bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Number(agent.uptimePercentage)}%` }}
            transition={{
              duration: 0.8,
              delay: index * 0.06 + 0.3,
              ease: "easeOut",
            }}
            className={`h-full rounded-full ${
              statusKey === "active"
                ? "bg-terminal-green"
                : statusKey === "idle"
                  ? "bg-terminal-amber"
                  : statusKey === "error"
                    ? "bg-terminal-red"
                    : "bg-terminal-gray"
            }`}
          />
        </div>
      </div>

      {/* View Details button */}
      <button
        type="button"
        data-ocid={`agents.view.button.${index}`}
        className="w-full mt-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-sm border border-border/40 bg-background/40 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 tracking-wide"
      >
        <ExternalLink className="w-3 h-3" />
        VIEW DETAILS
      </button>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] tracking-widest text-muted-foreground/50 uppercase">
        {label}
      </span>
      <span
        className={`text-xs font-medium truncate ${
          mono
            ? "font-mono text-foreground/80"
            : accent
              ? "text-primary"
              : "text-foreground/70"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
