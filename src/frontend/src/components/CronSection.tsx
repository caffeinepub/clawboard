import { motion } from "motion/react";
import { useMemo } from "react";
import { useGetAllAgents, useGetAllCronJobs } from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
  TerminalBadge,
  formatRelativeTime,
} from "./SectionShell";

type CronStatusKey = "running" | "idle" | "failed";

const CRON_STATUS_CONFIG: Record<
  CronStatusKey,
  { label: string; color: string; dot: string }
> = {
  running: {
    label: "RUNNING",
    color: "border-primary/40 text-primary bg-primary/10",
    dot: "bg-primary animate-pulse",
  },
  idle: {
    label: "IDLE",
    color: "border-accent/40 text-accent bg-accent/10",
    dot: "bg-accent",
  },
  failed: {
    label: "FAILED",
    color: "border-terminal-red/40 text-terminal-red bg-terminal-red/10",
    dot: "bg-terminal-red animate-pulse",
  },
};

export function CronSection() {
  const { data: rawJobs, isLoading, isError } = useGetAllCronJobs();
  const { data: rawAgents } = useGetAllAgents();

  const agents = rawAgents ?? [];
  const jobs = rawJobs ?? [];

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  const now = BigInt(Date.now()) * BigInt(1_000_000);

  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => Number(a.nextRun - b.nextRun)),
    [jobs],
  );

  if (isLoading) return <SectionLoading ocid="cron.loading_state" />;
  if (isError) return <SectionError />;
  if (jobs.length === 0)
    return (
      <SectionEmpty
        ocid="cron.empty_state"
        message="No cron jobs found. Seed the system to populate."
      />
    );

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex flex-wrap gap-3">
        {(["running", "idle", "failed"] as CronStatusKey[]).map((s) => {
          const count = jobs.filter((j) => (j.status as string) === s).length;
          const cfg = CRON_STATUS_CONFIG[s];
          return (
            <div
              key={s}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/50 bg-card"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              <span className="text-[10px] tracking-widest text-muted-foreground/50 uppercase">
                {cfg.label}
              </span>
              <span className="text-xs font-mono text-foreground/80">
                {count}
              </span>
            </div>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-terminal-amber/20 bg-terminal-amber/5">
          <span className="text-[10px] tracking-widest text-terminal-amber/70 uppercase">
            Overdue
          </span>
          <span className="text-xs font-mono text-terminal-amber">
            {
              jobs.filter(
                (j) => j.nextRun < now && (j.status as string) !== "running",
              ).length
            }
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {[
                  "Job Name",
                  "Agent",
                  "Schedule",
                  "Last Run",
                  "Next Run",
                  "Status",
                ].map((h) => (
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
              {sortedJobs.map((job, i) => {
                const statusKey = job.status as string as CronStatusKey;
                const cfg =
                  CRON_STATUS_CONFIG[statusKey] ?? CRON_STATUS_CONFIG.idle;
                const isOverdue = job.nextRun < now && statusKey !== "running";

                return (
                  <motion.tr
                    key={job.id}
                    data-ocid={`cron.item.${i + 1}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className={`border-b border-border/40 transition-colors ${
                      isOverdue
                        ? "bg-terminal-amber/5 hover:bg-terminal-amber/8"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isOverdue && (
                          <span className="w-1.5 h-1.5 rounded-full bg-terminal-amber shrink-0" />
                        )}
                        <span
                          className={`font-semibold truncate max-w-[160px] ${
                            isOverdue
                              ? "text-terminal-amber"
                              : "text-foreground/90"
                          }`}
                        >
                          {job.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/60 truncate max-w-[120px]">
                      {agentName(job.agentId)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-accent/80 bg-accent/5 border border-accent/20 px-1.5 py-0.5 rounded-sm">
                        {job.schedule}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/50">
                      {formatRelativeTime(job.lastRun)}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        isOverdue
                          ? "text-terminal-amber font-semibold"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {formatRelativeTime(job.nextRun)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                        />
                        <TerminalBadge color={cfg.color}>
                          {cfg.label}
                        </TerminalBadge>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
