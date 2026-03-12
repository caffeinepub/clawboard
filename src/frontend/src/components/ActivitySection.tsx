import { AlertTriangle, Info, Terminal, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { useGetAllActivityLogs, useGetAllAgents } from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
  formatRelativeTime,
} from "./SectionShell";

type ActivityLevel = "info" | "warn" | "error";
type FilterTab = "all" | ActivityLevel;

const LEVEL_CONFIG: Record<
  ActivityLevel,
  {
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  info: {
    color: "text-accent",
    bg: "bg-accent/5",
    border: "border-accent/20",
    icon: <Info className="w-3 h-3" />,
    label: "INFO",
  },
  warn: {
    color: "text-terminal-amber",
    bg: "bg-terminal-amber/5",
    border: "border-terminal-amber/20",
    icon: <AlertTriangle className="w-3 h-3" />,
    label: "WARN",
  },
  error: {
    color: "text-terminal-red",
    bg: "bg-terminal-red/5",
    border: "border-terminal-red/20",
    icon: <XCircle className="w-3 h-3" />,
    label: "ERR",
  },
};

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "info", label: "INFO" },
  { id: "warn", label: "WARN" },
  { id: "error", label: "ERROR" },
];

export function ActivitySection() {
  const { data: rawLogs, isLoading, isError } = useGetAllActivityLogs();
  const { data: rawAgents } = useGetAllAgents();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const agents = rawAgents ?? [];
  const logs = rawLogs ?? [];

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  // Sort newest first
  const sorted = useMemo(
    () => [...logs].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [logs],
  );

  const filtered = useMemo(() => {
    if (activeFilter === "all") return sorted;
    return sorted.filter((l) => (l.level as string) === activeFilter);
  }, [sorted, activeFilter]);

  const counts = useMemo(
    () => ({
      info: logs.filter((l) => (l.level as string) === "info").length,
      warn: logs.filter((l) => (l.level as string) === "warn").length,
      error: logs.filter((l) => (l.level as string) === "error").length,
    }),
    [logs],
  );

  if (isLoading) return <SectionLoading ocid="activity.loading_state" />;
  if (isError) return <SectionError />;

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filter tabs */}
        <div
          data-ocid="activity.filter.tab"
          className="flex items-center gap-1 p-1 rounded-sm border border-border bg-card"
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count =
              tab.id === "all" ? logs.length : counts[tab.id as ActivityLevel];
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all duration-150 ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/30 border border-transparent"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1 rounded-sm font-bold ${
                    isActive ? "text-primary" : "text-muted-foreground/30"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live indicator */}
        <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground/40 tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
          LIVE FEED
        </div>
      </div>

      {/* Feed */}
      {logs.length === 0 ? (
        <SectionEmpty
          ocid="activity.empty_state"
          message="No activity logs found. Seed the system to populate."
        />
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[10px] text-muted-foreground/40 tracking-widest uppercase">
          No {activeFilter} entries
        </div>
      ) : (
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          {/* Terminal chrome */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/60 bg-muted/20">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-[9px] tracking-widest text-muted-foreground/30 uppercase font-mono">
              agent.activity.log — {filtered.length} entries
            </span>
            <div className="ml-auto flex gap-1.5">
              {(["error", "warn", "info"] as ActivityLevel[]).map((lvl) => {
                const cfg = LEVEL_CONFIG[lvl];
                return (
                  <span
                    key={lvl}
                    className={`text-[9px] font-mono tracking-wider ${cfg.color} opacity-70`}
                  >
                    {counts[lvl]} {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Log lines */}
          <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filtered.map((log, i) => {
                const levelKey = log.level as string as ActivityLevel;
                const cfg = LEVEL_CONFIG[levelKey] ?? LEVEL_CONFIG.info;

                return (
                  <motion.div
                    key={log.id}
                    data-ocid={`activity.item.${i + 1}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: i < 20 ? i * 0.025 : 0,
                    }}
                    className={`flex gap-3 px-4 py-2.5 font-mono text-[11px] transition-colors hover:bg-muted/10 ${
                      levelKey === "error"
                        ? "hover:bg-terminal-red/5"
                        : levelKey === "warn"
                          ? "hover:bg-terminal-amber/5"
                          : "hover:bg-accent/5"
                    }`}
                  >
                    {/* Timestamp */}
                    <span className="shrink-0 text-muted-foreground/30 w-14 text-right">
                      {formatRelativeTime(log.timestamp)}
                    </span>

                    {/* Level badge */}
                    <span
                      className={`shrink-0 flex items-center gap-1 w-14 ${cfg.color}`}
                    >
                      {cfg.icon}
                      <span className="text-[9px] tracking-widest">
                        {cfg.label}
                      </span>
                    </span>

                    {/* Agent */}
                    <span className="shrink-0 text-accent/60 w-24 truncate">
                      [{agentName(log.agentId)}]
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span className="text-foreground/80 font-semibold">
                        {log.action}
                      </span>
                      {log.details && (
                        <span className="text-muted-foreground/45 ml-2">
                          {log.details}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
