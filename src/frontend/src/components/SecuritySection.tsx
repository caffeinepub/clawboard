import {
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useGetAllAgents,
  useGetAllConfigEntries,
  useGetAllSecurityEvents,
  useGetApiToken,
  useRevokeAndRegenerateToken,
} from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
  TerminalBadge,
  formatRelativeTime,
} from "./SectionShell";

// ── Types ─────────────────────────────────────────────────────────────────────
type ConfigEntry = {
  id: string;
  key: string;
  value: string;
  agentId: string;
  sensitive: boolean;
};

type SecurityEvent = {
  id: string;
  description: string;
  agentId: string;
  timestamp: bigint;
  severity: string;
  eventType: string;
};

// ── Severity config ───────────────────────────────────────────────────────────
const SEV_CONFIG: Record<
  string,
  { label: string; color: string; rowBg: string; icon: React.ReactNode }
> = {
  high: {
    label: "HIGH",
    color: "border-terminal-red/50 text-terminal-red bg-terminal-red/10",
    rowBg: "bg-terminal-red/5 hover:bg-terminal-red/8",
    icon: <ShieldX className="w-3.5 h-3.5 text-terminal-red" />,
  },
  medium: {
    label: "MED",
    color: "border-terminal-amber/50 text-terminal-amber bg-terminal-amber/10",
    rowBg: "hover:bg-muted/10",
    icon: <ShieldAlert className="w-3.5 h-3.5 text-terminal-amber" />,
  },
  low: {
    label: "LOW",
    color: "border-accent/40 text-accent bg-accent/10",
    rowBg: "hover:bg-muted/10",
    icon: <ShieldCheck className="w-3.5 h-3.5 text-accent" />,
  },
};

const SEV_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

// ── API Token Panel ───────────────────────────────────────────────────────────
function ApiTokenPanel() {
  const { data: token, isLoading } = useGetApiToken();
  const revokeMutation = useRevokeAndRegenerateToken();
  const [revealed, setRevealed] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const maskedToken = token
    ? `${token.slice(0, 8)}${".".repeat(24)}${token.slice(-4)}`
    : "";

  const handleRegenerate = async () => {
    if (!confirmRegen) {
      setConfirmRegen(true);
      return;
    }
    try {
      await revokeMutation.mutateAsync();
      setConfirmRegen(false);
      setRevealed(false);
      toast.success("Token regenerated", {
        description:
          "Update your skill files with the new token. Agents will stop reporting until updated.",
      });
    } catch {
      toast.error("Failed to regenerate token", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-sm border border-terminal-amber/30 bg-terminal-amber/5">
        <AlertTriangle className="w-3.5 h-3.5 text-terminal-amber shrink-0 mt-0.5" />
        <p className="text-[11px] font-mono text-terminal-amber/80 leading-relaxed">
          Regenerating invalidates the current token.{" "}
          <span className="text-terminal-amber">
            All connected agents will stop reporting
          </span>{" "}
          until they receive the new token.
        </p>
      </div>

      {/* Token display */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-sm border border-border/50 bg-muted/30 overflow-hidden">
          <Key className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
          {isLoading ? (
            <span
              data-ocid="security.token.loading_state"
              className="text-xs font-mono text-muted-foreground/30 flex items-center gap-2"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading...
            </span>
          ) : (
            <code
              data-ocid="security.token.panel"
              className="text-xs font-mono text-primary/80 tracking-wider flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {revealed ? token : maskedToken}
            </code>
          )}
        </div>
        <button
          type="button"
          data-ocid="security.token.toggle"
          onClick={() => setRevealed((v) => !v)}
          disabled={isLoading || !token}
          className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-border/50 bg-muted/20 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {revealed ? (
            <EyeOff className="w-3 h-3" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
          {revealed ? "Hide" : "Reveal"}
        </button>
      </div>

      {/* Regenerate */}
      <div className="flex items-center gap-3">
        {confirmRegen && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-[11px] font-mono text-terminal-amber/80">
              Are you sure? This cannot be undone.
            </span>
            <button
              type="button"
              data-ocid="security.token.cancel_button"
              onClick={() => setConfirmRegen(false)}
              className="text-[11px] font-mono text-muted-foreground/50 hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
        <button
          type="button"
          data-ocid="security.token.delete_button"
          onClick={handleRegenerate}
          disabled={revokeMutation.isPending || isLoading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-mono tracking-wide transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
            confirmRegen
              ? "border-terminal-red/50 bg-terminal-red/10 text-terminal-red hover:bg-terminal-red/20"
              : "border-border/50 bg-muted/20 text-muted-foreground hover:text-foreground hover:border-terminal-amber/40"
          }`}
        >
          {revokeMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {confirmRegen ? "Confirm Regenerate" : "Regenerate Token"}
        </button>
      </div>
    </div>
  );
}

// ── Config Panel ──────────────────────────────────────────────────────────────
function ConfigPanel({
  entries,
  agentName,
  agentFilter,
  setAgentFilter,
  agents,
}: {
  entries: ConfigEntry[];
  agentName: (id: string) => string;
  agentFilter: string;
  setAgentFilter: (v: string) => void;
  agents: { id: string; name: string }[];
}) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (agentFilter === "all") return entries;
    return entries.filter((e) => e.agentId === agentFilter);
  }, [entries, agentFilter]);

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (entries.length === 0) {
    return (
      <SectionEmpty
        ocid="config.empty_state"
        message="No config entries found. Seed the system to populate."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          data-ocid="config.agent_filter.select"
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-3 py-1.5 bg-card border border-border rounded-sm text-xs font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
        >
          <option value="all">All Agents</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <span className="text-[10px] text-muted-foreground/35 tracking-widest">
          {filtered.filter((e) => e.sensitive).length} sensitive &nbsp;·&nbsp;
          {filtered.length} total
        </span>
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Key", "Value", "Agent", ""].map((h) => (
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
              {filtered.map((entry, i) => {
                const isRevealed = revealed.has(entry.id);
                return (
                  <motion.tr
                    key={entry.id}
                    data-ocid={`config.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.sensitive && (
                          <Lock className="w-3 h-3 text-terminal-amber/60 shrink-0" />
                        )}
                        <span className="text-primary/80 font-semibold">
                          {entry.key}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[240px]">
                      {entry.sensitive && !isRevealed ? (
                        <span className="tracking-widest text-muted-foreground/40 select-none">
                          ●●●●●●●●
                        </span>
                      ) : (
                        <span className="text-foreground/70 break-all">
                          {entry.value}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/50">
                      {agentName(entry.agentId)}
                    </td>
                    <td className="px-4 py-3">
                      {entry.sensitive && (
                        <button
                          type="button"
                          onClick={() => toggleReveal(entry.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-sm border border-border/60 text-[10px] text-muted-foreground/50 hover:text-foreground hover:border-primary/30 transition-colors"
                        >
                          {isRevealed ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          {isRevealed ? "Hide" : "Reveal"}
                        </button>
                      )}
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

// ── Security Events Panel ─────────────────────────────────────────────────────
function SecurityPanel({
  events,
  agentName,
}: {
  events: SecurityEvent[];
  agentName: (id: string) => string;
}) {
  const sorted = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9) ||
          Number(b.timestamp - a.timestamp),
      ),
    [events],
  );

  const high = events.filter((e) => e.severity === "high").length;
  const medium = events.filter((e) => e.severity === "medium").length;
  const low = events.filter((e) => e.severity === "low").length;

  if (events.length === 0) {
    return (
      <SectionEmpty
        ocid="security.empty_state"
        message="No security events found. Seed the system to populate."
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex flex-wrap gap-3">
        {[
          {
            label: "HIGH",
            count: high,
            color: "text-terminal-red border-terminal-red/30 bg-terminal-red/5",
          },
          {
            label: "MEDIUM",
            count: medium,
            color:
              "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/5",
          },
          {
            label: "LOW",
            count: low,
            color: "text-accent border-accent/30 bg-accent/5",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono ${s.color}`}
          >
            <span className="font-bold">{s.count}</span>
            <span className="text-[10px] tracking-widest">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Event list */}
      <div className="rounded-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Time", "Type", "Description", "Agent", "Severity"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sorted.map((evt, i) => {
                const cfg = SEV_CONFIG[evt.severity] ?? SEV_CONFIG.low;
                const isHigh = evt.severity === "high";
                return (
                  <motion.tr
                    key={evt.id}
                    data-ocid={`security.item.${i + 1}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className={`border-b border-border/40 transition-colors ${cfg.rowBg}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground/40 whitespace-nowrap">
                      {formatRelativeTime(evt.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {cfg.icon}
                        <span className="text-[10px] tracking-widest text-muted-foreground/60">
                          {evt.eventType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`${
                          isHigh ? "text-terminal-red/90" : "text-foreground/70"
                        }`}
                      >
                        {evt.description}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/50 whitespace-nowrap">
                      {agentName(evt.agentId)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isHigh && (
                          <span className="w-1.5 h-1.5 rounded-full bg-terminal-red animate-pulse shrink-0" />
                        )}
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

// ── Data Transparency Panel ───────────────────────────────────────────────────
function DataTransparencyPanel({
  agents,
}: {
  agents: object[];
}) {
  if (!agents || agents.length === 0) {
    return (
      <SectionEmpty
        ocid="security.data_transparency.empty_state"
        message="No agent payloads received yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {agents.map((agent: any, i: number) => (
        <div key={agent.id ?? i} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-primary/70 tracking-wider font-semibold">
              {agent.name ?? agent.id ?? `Agent ${i + 1}`}
            </span>
            <div className="flex-1 h-px bg-border/30" />
          </div>
          <pre
            data-ocid={`security.data_transparency.item.${i + 1}`}
            className="overflow-y-auto max-h-64 p-3 rounded-sm border border-border/50 bg-background text-[10px] font-mono text-terminal-green/80 leading-relaxed whitespace-pre"
          >
            {JSON.stringify(
              agent,
              (_k, v) => (typeof v === "bigint" ? v.toString() : v),
              2,
            )}
          </pre>
        </div>
      ))}
    </div>
  );
}

// ── Panel heading (shared) ────────────────────────────────────────────────────
function PanelHeading({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-display font-semibold tracking-widest text-foreground/70 uppercase">
        {label}
      </h2>
      <div className="flex-1 h-px bg-border/40" />
      {sub && (
        <span className="text-[10px] text-muted-foreground/30 tracking-widest">
          {sub}
        </span>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function SecuritySection() {
  const {
    data: rawConfig,
    isLoading: loadCfg,
    isError: errCfg,
  } = useGetAllConfigEntries();
  const {
    data: rawEvents,
    isLoading: loadEvt,
    isError: errEvt,
  } = useGetAllSecurityEvents();
  const { data: rawAgents } = useGetAllAgents();
  const [agentFilter, setAgentFilter] = useState("all");

  const configs = (rawConfig ?? []) as ConfigEntry[];
  const events = (rawEvents ?? []) as SecurityEvent[];
  const agents = (rawAgents ?? []) as { id: string; name: string }[];

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  if (loadCfg || loadEvt) return <SectionLoading ocid="config.loading_state" />;
  if (errCfg || errEvt) return <SectionError />;

  return (
    <div className="space-y-8">
      {/* API Token Panel — always at the top */}
      <section data-ocid="security.token.panel">
        <PanelHeading label="API Token" />
        <ApiTokenPanel />
      </section>

      <div className="relative">
        <div className="h-px bg-border/40" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Config Inspector
        </span>
      </div>

      <section>
        <PanelHeading
          label="Config Inspector"
          sub={`${configs.length} entries`}
        />
        <ConfigPanel
          entries={configs}
          agentName={agentName}
          agentFilter={agentFilter}
          setAgentFilter={setAgentFilter}
          agents={agents}
        />
      </section>

      <div className="relative">
        <div className="h-px bg-border/40" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Security Events
        </span>
      </div>

      <section>
        <PanelHeading label="Security Events" sub={`${events.length} total`} />
        <SecurityPanel events={events} agentName={agentName} />
      </section>

      <div className="relative">
        <div className="h-px bg-border/40" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Data Transparency
        </span>
      </div>

      <section data-ocid="security.data_transparency.panel">
        <PanelHeading label="Data Transparency" sub="last payload per agent" />
        <p className="text-[11px] font-mono text-muted-foreground/50 mb-4 leading-relaxed">
          The exact raw JSON payload last received from each agent. Nothing is
          hidden or reformatted — this is precisely what was sent.
        </p>
        <DataTransparencyPanel agents={agents} />
      </section>
    </div>
  );
}
