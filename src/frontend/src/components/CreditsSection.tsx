import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  useGetAllAgents,
  useGetAllCredits,
  useGetAllProviders,
} from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
  TerminalBadge,
} from "./SectionShell";

// ── Credit types ─────────────────────────────────────────────────────────────
type Credit = {
  id: string;
  balance: bigint;
  agentId: string;
  totalUsed: bigint;
  costAlerts: Array<[bigint, boolean]>;
};

type Provider = {
  id: string;
  status: string;
  model: string;
  name: string;
  latencyMs: bigint;
  uptimePercent: bigint;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const PROVIDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string; glow: string }
> = {
  healthy: {
    label: "HEALTHY",
    color: "border-primary/40 text-primary bg-primary/10",
    dot: "bg-primary animate-pulse-slow",
    glow: "shadow-glow-green",
  },
  degraded: {
    label: "DEGRADED",
    color: "border-terminal-amber/40 text-terminal-amber bg-terminal-amber/10",
    dot: "bg-terminal-amber",
    glow: "shadow-glow-amber",
  },
  down: {
    label: "DOWN",
    color: "border-terminal-red/40 text-terminal-red bg-terminal-red/10",
    dot: "bg-terminal-red animate-pulse",
    glow: "shadow-glow-red",
  },
};

function LOW_BALANCE_THRESHOLD(
  balance: bigint,
  alerts: Array<[bigint, boolean]>,
) {
  return alerts.some(
    ([threshold, triggered]) => triggered && balance < threshold,
  );
}

function formatCredits(n: bigint) {
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toString();
}

// ── Credits Sub-panel ─────────────────────────────────────────────────────────
function CreditPanel({
  credits,
  agentName,
}: {
  credits: Credit[];
  agentName: (id: string) => string;
}) {
  const totalBalance = useMemo(
    () => credits.reduce((acc, c) => acc + c.balance, BigInt(0)),
    [credits],
  );
  const totalUsed = useMemo(
    () => credits.reduce((acc, c) => acc + c.totalUsed, BigInt(0)),
    [credits],
  );

  if (credits.length === 0) {
    return (
      <SectionEmpty
        ocid="credits.empty_state"
        message="No credit records found. Seed the system to populate."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "TOTAL BALANCE",
            value: formatCredits(totalBalance),
            accent: "text-primary",
          },
          {
            label: "TOTAL USED",
            value: formatCredits(totalUsed),
            accent: "text-accent",
          },
          {
            label: "AGENTS",
            value: credits.length.toString(),
            accent: "text-foreground/70",
          },
          {
            label: "ALERTS ACTIVE",
            value: credits
              .reduce(
                (acc, c) =>
                  acc +
                  c.costAlerts.filter(([, triggered]) => triggered).length,
                0,
              )
              .toString(),
            accent: "text-terminal-amber",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 p-3 rounded-sm border border-border bg-card"
          >
            <span className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
              {stat.label}
            </span>
            <span className={`text-xl font-display font-bold ${stat.accent}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Per-agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {credits.map((credit, i) => {
          const hasAlert = LOW_BALANCE_THRESHOLD(
            credit.balance,
            credit.costAlerts,
          );
          const triggeredAlerts = credit.costAlerts.filter(
            ([, triggered]) => triggered,
          );
          // balance bar: percentage vs totalUsed+balance
          const total = credit.balance + credit.totalUsed;
          const pct = total > 0n ? Number((credit.balance * 100n) / total) : 0;
          const isLow = pct < 20;

          return (
            <motion.div
              key={credit.id}
              data-ocid={`credits.item.${i + 1}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`relative flex flex-col gap-3 p-4 rounded-sm border bg-card transition-all ${
                hasAlert
                  ? "border-terminal-amber/40 shadow-glow-amber"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {/* Warning pulse */}
              {hasAlert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-amber opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-amber" />
                </span>
              )}

              {/* Agent name */}
              <div className="flex items-center gap-2 pr-4">
                <h3 className="text-sm font-display font-semibold text-foreground tracking-wide truncate">
                  {agentName(credit.agentId)}
                </h3>
                {hasAlert && (
                  <AlertTriangle className="w-3.5 h-3.5 text-terminal-amber shrink-0" />
                )}
              </div>

              {/* Balance bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] tracking-widest text-muted-foreground/40 uppercase">
                  <span>Balance</span>
                  <span
                    className={isLow ? "text-terminal-red" : "text-primary"}
                  >
                    {formatCredits(credit.balance)} cr
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.05 + 0.2,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${
                      isLow
                        ? "bg-terminal-red"
                        : pct < 50
                          ? "bg-terminal-amber"
                          : "bg-primary"
                    }`}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-widest text-muted-foreground/35 uppercase">
                    Used
                  </span>
                  <span className="text-accent font-mono">
                    {formatCredits(credit.totalUsed)} cr
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-widest text-muted-foreground/35 uppercase">
                    Alerts
                  </span>
                  <span className="text-muted-foreground/60 font-mono">
                    {credit.costAlerts.length} configured
                  </span>
                </div>
              </div>

              {/* Triggered alerts */}
              {triggeredAlerts.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-terminal-amber/20">
                  {triggeredAlerts.map(([threshold]) => (
                    <div
                      key={threshold.toString()}
                      className="flex items-center gap-1.5 text-[10px] text-terminal-amber/80"
                    >
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>
                        Alert at {formatCredits(threshold)} cr threshold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Provider Sub-panel ────────────────────────────────────────────────────────
function ProviderPanel({ providers }: { providers: Provider[] }) {
  const healthy = providers.filter(
    (p) => (p.status as string) === "healthy",
  ).length;
  const degraded = providers.filter(
    (p) => (p.status as string) === "degraded",
  ).length;
  const down = providers.filter((p) => (p.status as string) === "down").length;

  if (providers.length === 0) {
    return (
      <SectionEmpty
        ocid="providers.empty_state"
        message="No providers found. Seed the system to populate."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Health summary */}
      <div className="flex flex-wrap gap-3">
        {[
          {
            label: "Healthy",
            count: healthy,
            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
            color: "text-primary border-primary/30 bg-primary/5",
          },
          {
            label: "Degraded",
            count: degraded,
            icon: <Activity className="w-3.5 h-3.5" />,
            color:
              "text-terminal-amber border-terminal-amber/30 bg-terminal-amber/5",
          },
          {
            label: "Down",
            count: down,
            icon: <WifiOff className="w-3.5 h-3.5" />,
            color: "text-terminal-red border-terminal-red/30 bg-terminal-red/5",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-mono ${s.color}`}
          >
            {s.icon}
            <span>
              {s.count} {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((provider, i) => {
          const statusKey = provider.status as string;
          const cfg =
            PROVIDER_STATUS_CONFIG[statusKey] ?? PROVIDER_STATUS_CONFIG.down;

          return (
            <motion.div
              key={provider.id}
              data-ocid={`providers.item.${i + 1}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`relative flex flex-col gap-3 p-4 rounded-sm border bg-card transition-all duration-200 ${
                statusKey === "healthy"
                  ? "border-primary/25 shadow-glow-green"
                  : statusKey === "degraded"
                    ? "border-terminal-amber/25 shadow-glow-amber"
                    : "border-terminal-red/25 shadow-glow-red"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Wifi
                      className={`w-3.5 h-3.5 shrink-0 ${
                        statusKey === "healthy"
                          ? "text-primary"
                          : statusKey === "degraded"
                            ? "text-terminal-amber"
                            : "text-terminal-red"
                      }`}
                    />
                    <h3 className="text-sm font-display font-semibold text-foreground truncate">
                      {provider.name}
                    </h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono truncate">
                    {provider.model}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <TerminalBadge color={cfg.color}>{cfg.label}</TerminalBadge>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-widest text-muted-foreground/35 uppercase">
                    Latency
                  </span>
                  <span
                    className={`text-sm font-mono font-semibold ${
                      Number(provider.latencyMs) < 100
                        ? "text-primary"
                        : Number(provider.latencyMs) < 300
                          ? "text-terminal-amber"
                          : "text-terminal-red"
                    }`}
                  >
                    {provider.latencyMs.toString()}
                    <span className="text-[10px] text-muted-foreground/40">
                      ms
                    </span>
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] tracking-widest text-muted-foreground/35 uppercase">
                    Uptime
                  </span>
                  <span className="text-sm font-mono font-semibold text-accent">
                    {provider.uptimePercent.toString()}
                    <span className="text-[10px] text-muted-foreground/40">
                      %
                    </span>
                  </span>
                </div>
              </div>

              {/* Uptime bar */}
              <div className="h-0.5 w-full bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Number(provider.uptimePercent)}%` }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.05 + 0.2,
                    ease: "easeOut",
                  }}
                  className={`h-full rounded-full ${
                    statusKey === "healthy"
                      ? "bg-primary"
                      : statusKey === "degraded"
                        ? "bg-terminal-amber"
                        : "bg-terminal-red"
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function CreditsSection() {
  const {
    data: rawCredits,
    isLoading: loadingCredits,
    isError: errorCredits,
  } = useGetAllCredits();
  const {
    data: rawProviders,
    isLoading: loadingProviders,
    isError: errorProviders,
  } = useGetAllProviders();
  const { data: rawAgents } = useGetAllAgents();

  const credits = (rawCredits ?? []) as Credit[];
  const providers = (rawProviders ?? []) as Provider[];
  const agents = rawAgents ?? [];

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  if (loadingCredits || loadingProviders) {
    return <SectionLoading ocid="credits.loading_state" />;
  }
  if (errorCredits || errorProviders) {
    return <SectionError />;
  }

  return (
    <div className="space-y-8">
      {/* Credits panel */}
      <section>
        <PanelHeading
          label="Credit Tracking"
          sub={`${credits.length} agents tracked`}
        />
        <CreditPanel credits={credits} agentName={agentName} />
      </section>

      {/* Divider */}
      <div className="relative">
        <div className="h-px bg-border/40" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Provider Health
        </span>
      </div>

      {/* Providers panel */}
      <section>
        <PanelHeading
          label="Provider Health"
          sub={`${providers.length} providers registered`}
        />
        <ProviderPanel providers={providers} />
      </section>
    </div>
  );
}

function PanelHeading({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xs font-display font-semibold tracking-widest text-foreground/70 uppercase">
        {label}
      </h2>
      <div className="flex-1 h-px bg-border/40" />
      <span className="text-[10px] text-muted-foreground/30 tracking-widest">
        {sub}
      </span>
    </div>
  );
}
