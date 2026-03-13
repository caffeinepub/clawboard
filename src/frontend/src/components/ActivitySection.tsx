import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  Terminal,
  XCircle,
} from "lucide-react";
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
type TimeRange = "1h" | "24h" | "7d" | "all";

const LEVEL_CONFIG: Record<
  ActivityLevel,
  { color: string; icon: React.ReactNode; label: string }
> = {
  info: {
    color: "text-accent",
    icon: <Info className="w-3 h-3" />,
    label: "INFO",
  },
  warn: {
    color: "text-terminal-amber",
    icon: <AlertTriangle className="w-3 h-3" />,
    label: "WARN",
  },
  error: {
    color: "text-terminal-red",
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

const TIME_RANGES: { id: TimeRange; label: string; ms: number | null }[] = [
  { id: "1h", label: "Last 1h", ms: 60 * 60 * 1000 },
  { id: "24h", label: "Last 24h", ms: 24 * 60 * 60 * 1000 },
  { id: "7d", label: "Last 7d", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "all", label: "All time", ms: null },
];

export function ActivitySection() {
  const { data: rawLogs, isLoading, isError } = useGetAllActivityLogs();
  const { data: rawAgents } = useGetAllAgents();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const agents = rawAgents ?? [];
  const logs = rawLogs ?? [];

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  const sorted = useMemo(
    () => [...logs].sort((a, b) => Number(b.timestamp - a.timestamp)),
    [logs],
  );

  const filtered = useMemo(() => {
    const nowMs = Date.now();
    return sorted.filter((l) => {
      if (activeFilter !== "all" && (l.level as string) !== activeFilter)
        return false;
      if (agentFilter !== "all" && l.agentId !== agentFilter) return false;
      const range = TIME_RANGES.find((r) => r.id === timeRange);
      if (range?.ms !== null && range?.ms !== undefined) {
        const logMs = Number(l.timestamp) / 1_000_000;
        if (nowMs - logMs > range.ms) return false;
      }
      return true;
    });
  }, [sorted, activeFilter, agentFilter, timeRange]);

  const counts = useMemo(
    () => ({
      info: logs.filter((l) => (l.level as string) === "info").length,
      warn: logs.filter((l) => (l.level as string) === "warn").length,
      error: logs.filter((l) => (l.level as string) === "error").length,
    }),
    [logs],
  );

  const handleExportCSV = () => {
    const header = "timestamp,level,agent,action,details";
    const rows = filtered.map((l) =>
      [
        new Date(Number(l.timestamp) / 1_000_000).toISOString(),
        l.level,
        agentName(l.agentId),
        `"${l.action.replace(/"/g, '""')}"`,
        `"${l.details.replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <SectionLoading ocid="activity.loading_state" />;
  if (isError) return <SectionError />;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-1 rounded-sm font-bold ${isActive ? "text-primary" : "text-muted-foreground/30"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <select
          data-ocid="activity.agent_filter.select"
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-sm text-[10px] font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="all">All Agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          data-ocid="activity.timerange.select"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRange)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-sm text-[10px] font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          {TIME_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          data-ocid="activity.export.button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border/50 bg-card text-[10px] font-mono text-muted-foreground/60 hover:text-foreground hover:border-border transition-all"
        >
          <Download className="w-3 h-3" />
          CSV
        </button>

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
          No matching entries
        </div>
      ) : (
        <div className="rounded-sm border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/60 bg-muted/20">
            <Terminal className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-[9px] tracking-widest text-muted-foreground/30 uppercase font-mono">
              agent.activity.log — {filtered.length} entries
            </span>
          </div>
          <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {filtered.map((log, i) => {
                const levelKey = log.level as string as ActivityLevel;
                const cfg = LEVEL_CONFIG[levelKey] ?? LEVEL_CONFIG.info;
                const isExpanded = expandedId === log.id;
                return (
                  <motion.div
                    key={log.id}
                    data-ocid={`activity.item.${i + 1}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: i < 20 ? i * 0.02 : 0 }}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className={`w-full text-left flex gap-3 px-4 py-2.5 font-mono text-[11px] cursor-pointer transition-colors hover:bg-muted/10 ${
                        isExpanded ? "bg-muted/15" : ""
                      }`}
                    >
                      <span className="shrink-0 text-muted-foreground/30 w-14 text-right">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                      <span
                        className={`shrink-0 flex items-center gap-1 w-14 ${cfg.color}`}
                      >
                        {cfg.icon}
                        <span className="text-[9px] tracking-widest">
                          {cfg.label}
                        </span>
                      </span>
                      <span className="shrink-0 text-accent/60 w-24 truncate">
                        [{agentName(log.agentId)}]
                      </span>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-foreground/80 font-semibold">
                          {log.action}
                        </span>
                        {!isExpanded && log.details && (
                          <span className="text-muted-foreground/40 truncate">
                            {log.details}
                          </span>
                        )}
                        <span className="ml-auto shrink-0 text-muted-foreground/25">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </span>
                      </div>
                    </button>
                    {isExpanded && log.details && (
                      <div className="px-4 pb-2.5 pl-[calc(1rem+3.5rem+3.5rem+6rem+0.75rem)] font-mono text-[10px] text-muted-foreground/55 bg-muted/10">
                        {log.details}
                      </div>
                    )}
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
