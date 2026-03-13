import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
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

      {/* Divider */}
      <div className="relative">
        <div className="h-px bg-border/40" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Spend Analysis
        </span>
      </div>

      {/* Anthropic Spend Tracker */}
      <section>
        <PanelHeading label="Anthropic Spend Tracker" sub="Current month" />
        <AnthropicSpendPanel />
      </section>

      {/* Monthly Budget */}
      <section>
        <PanelHeading label="Monthly Budget" sub="Track vs target" />
        <MonthlyBudgetPanel />
      </section>

      {/* Cost per task */}
      <section>
        <PanelHeading label="Cost Per Task" sub="Last 10 tasks" />
        <CostPerTaskPanel />
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

// ── Anthropic Spend Panel ─────────────────────────────────────────────────────
const ANTHROPIC_MODELS = [
  { model: "claude-opus-4", tokens: 124000, costPer1M: 15.0 },
  { model: "claude-sonnet-4-5", tokens: 487000, costPer1M: 3.0 },
  { model: "claude-haiku-4", tokens: 892000, costPer1M: 0.25 },
];

function AnthropicSpendPanel() {
  const totalSpend = ANTHROPIC_MODELS.reduce(
    (sum, m) => sum + (m.tokens / 1_000_000) * m.costPer1M,
    0,
  );
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-sm border border-primary/20 bg-primary/5">
        <div>
          <p className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
            Total Anthropic Spend (Month)
          </p>
          <p className="text-2xl font-display font-bold text-primary mt-0.5">
            ${totalSpend.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="rounded-sm border border-border overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Model", "Tokens Used", "Cost / 1M", "Total Cost"].map((h) => (
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
            {ANTHROPIC_MODELS.map((m, i) => {
              const cost = (m.tokens / 1_000_000) * m.costPer1M;
              return (
                <tr
                  key={m.model}
                  data-ocid={`credits.anthropic.item.${i + 1}`}
                  className="border-b border-border/40 hover:bg-muted/10"
                >
                  <td className="px-4 py-2.5 text-foreground/80 font-semibold">
                    {m.model}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground/60">
                    {(m.tokens / 1000).toFixed(0)}K
                  </td>
                  <td className="px-4 py-2.5 text-accent/80">
                    ${m.costPer1M.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-primary font-semibold">
                    ${cost.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Monthly Budget Panel ──────────────────────────────────────────────────────

function MonthlyBudgetPanel() {
  const [budget, setBudget] = useState(100);
  const spent = 47.23;
  const pct = Math.min(100, (spent / budget) * 100);
  const isWarning = pct > 70;
  const isOver = pct >= 100;

  return (
    <div className="p-4 rounded-sm border border-border bg-card space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
            Budget Used
          </p>
          <p className="text-lg font-display font-bold text-foreground mt-0.5">
            <span
              className={
                isOver
                  ? "text-terminal-red"
                  : isWarning
                    ? "text-terminal-amber"
                    : "text-primary"
              }
            >
              ${spent.toFixed(2)}
            </span>
            <span className="text-muted-foreground/40 text-sm">
              {" "}
              / ${budget.toFixed(2)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="credits-budget-input"
            className="text-[9px] tracking-widest text-muted-foreground/40 uppercase"
          >
            Budget ($)
          </label>
          <input
            id="credits-budget-input"
            data-ocid="credits.budget.input"
            type="number"
            value={budget}
            onChange={(e) => setBudget(Math.max(1, Number(e.target.value)))}
            className="w-20 px-2 py-1 bg-background border border-border rounded-sm text-xs font-mono text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[9px] text-muted-foreground/40 mb-1.5">
          <span>0</span>
          <span className={isOver ? "text-terminal-red font-semibold" : ""}>
            {pct.toFixed(0)}%
          </span>
          <span>${budget}</span>
        </div>
        <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isOver ? "bg-terminal-red" : isWarning ? "bg-terminal-amber" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Cost Per Task Panel ───────────────────────────────────────────────────────
const COST_PER_TASK = [
  {
    task: "Research competitor pricing",
    model: "claude-3-5-sonnet",
    tokens: 8400,
    cost: 0.025,
  },
  {
    task: "Update MEMORY.md",
    model: "claude-haiku-4",
    tokens: 1200,
    cost: 0.0003,
  },
  {
    task: "Daily analytics cron",
    model: "deepseek-chat",
    tokens: 12000,
    cost: 0.002,
  },
  {
    task: "Webhook payload delivery",
    model: "claude-3-5-sonnet",
    tokens: 2800,
    cost: 0.008,
  },
  {
    task: "Q4 CSV analysis",
    model: "claude-3-opus",
    tokens: 34000,
    cost: 0.51,
  },
  {
    task: "Slack digest notification",
    model: "claude-haiku-4",
    tokens: 800,
    cost: 0.0002,
  },
  {
    task: "Scrape product listings",
    model: "deepseek-chat",
    tokens: 18000,
    cost: 0.003,
  },
  {
    task: "Write daily summary",
    model: "claude-haiku-4",
    tokens: 1600,
    cost: 0.0004,
  },
  {
    task: "Market research report",
    model: "claude-3-5-sonnet",
    tokens: 22000,
    cost: 0.066,
  },
  {
    task: "Shell script execution",
    model: "claude-haiku-4",
    tokens: 600,
    cost: 0.00015,
  },
];

function CostPerTaskPanel() {
  return (
    <div className="rounded-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Task", "Model", "Tokens", "Cost (USD)"].map((h) => (
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
            {COST_PER_TASK.map((t, i) => (
              <tr
                key={t.task}
                data-ocid={`credits.tasks.item.${i + 1}`}
                className="border-b border-border/40 hover:bg-muted/10"
              >
                <td className="px-4 py-2.5 text-foreground/70 max-w-[200px] truncate">
                  {t.task}
                </td>
                <td className="px-4 py-2.5">
                  <span className="px-1.5 py-0.5 rounded-sm bg-accent/8 border border-accent/15 text-accent/70 text-[10px]">
                    {t.model}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground/60">
                  {(t.tokens / 1000).toFixed(1)}K
                </td>
                <td className="px-4 py-2.5 text-primary font-semibold">
                  ${t.cost.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
