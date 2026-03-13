import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MOCK_CRON_STATS,
  MOCK_ERRORS_BY_TYPE,
  MOCK_MODEL_SWITCHES,
  MOCK_SKILL_USAGE,
  MOCK_SPEND_DATA,
  MOCK_TOKEN_CHART_DATA,
} from "../lib/mockAgentData";

const CHART_COLORS = {
  claude: "#3b82f6",
  deepseek: "#06b6d4",
  gemini: "#f59e0b",
  anthropic: "#3b82f6",
  error: "#ef4444",
};

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "2px",
  fontSize: "11px",
  fontFamily: "monospace",
  color: "hsl(var(--foreground))",
};

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function PanelCard({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground/60 uppercase">
          {title}
        </h3>
        <div className="flex-1 h-px bg-border/40" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
      </div>
      {children}
    </div>
  );
}

export function AgentOpsSection() {
  const [tick, setTick] = useState(0);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");
  const [spendView, setSpendView] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const tokenData =
    timeRange === "7d"
      ? MOCK_TOKEN_CHART_DATA.slice(-7)
      : MOCK_TOKEN_CHART_DATA;
  const spendData =
    timeRange === "7d" ? MOCK_SPEND_DATA.slice(-7) : MOCK_SPEND_DATA;

  const totalSpend = spendData.reduce(
    (sum, d) => sum + d.anthropic + d.deepseek + d.gemini,
    0,
  );
  const anthropicShare = spendData.reduce((sum, d) => sum + d.anthropic, 0);
  const deepseekShare = spendData.reduce((sum, d) => sum + d.deepseek, 0);
  const geminiShare = spendData.reduce((sum, d) => sum + d.gemini, 0);

  const donutData = [
    {
      name: "Anthropic",
      value: Math.round(anthropicShare * 100) / 100,
      fill: CHART_COLORS.anthropic,
    },
    {
      name: "DeepSeek",
      value: Math.round(deepseekShare * 100) / 100,
      fill: CHART_COLORS.deepseek,
    },
    {
      name: "Gemini",
      value: Math.round(geminiShare * 100) / 100,
      fill: CHART_COLORS.gemini,
    },
  ];

  const fallbackCount = MOCK_MODEL_SWITCHES.filter(
    (s) => s.reason === "rate_limit" || s.reason === "fallback",
  ).length;

  return (
    <div className="space-y-5" data-tick={tick}>
      {/* Time range controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono font-semibold tracking-widest text-muted-foreground/50 uppercase">
          AgentOps Analytics
        </h2>
        <div
          data-ocid="agentops.timerange.tab"
          className="flex items-center gap-1 p-1 rounded-sm border border-border bg-card"
        >
          {(["7d", "14d", "30d"] as const).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all ${
                timeRange === r
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground/50 hover:text-foreground border border-transparent"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Token usage */}
      <PanelCard title="Token Usage Over Time">
        <div className="flex items-center gap-4 mb-2">
          {[
            ["Claude", CHART_COLORS.claude],
            ["DeepSeek", CHART_COLORS.deepseek],
            ["Gemini", CHART_COLORS.gemini],
          ].map(([name, color]) => (
            <span
              key={name as string}
              className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color as string }}
              />
              {name}
            </span>
          ))}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={tokenData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                {[
                  ["claude", CHART_COLORS.claude],
                  ["deepseek", CHART_COLORS.deepseek],
                  ["gemini", CHART_COLORS.gemini],
                ].map(([k, c]) => (
                  <linearGradient
                    key={k as string}
                    id={`grad-${k}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={c as string}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={c as string}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  fill: "rgba(255,255,255,0.3)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatTokens}
                tick={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  fill: "rgba(255,255,255,0.3)",
                }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v: number) => [formatTokens(v), ""]}
              />
              <Area
                type="monotone"
                dataKey="claude"
                stroke={CHART_COLORS.claude}
                strokeWidth={2}
                fill="url(#grad-claude)"
              />
              <Area
                type="monotone"
                dataKey="deepseek"
                stroke={CHART_COLORS.deepseek}
                strokeWidth={2}
                fill="url(#grad-deepseek)"
              />
              <Area
                type="monotone"
                dataKey="gemini"
                stroke={CHART_COLORS.gemini}
                strokeWidth={2}
                fill="url(#grad-gemini)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      {/* Spend + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <PanelCard title="API Spend (USD)">
            <div className="flex items-center gap-2 mb-2">
              <div
                data-ocid="agentops.spend.tab"
                className="flex gap-1 p-0.5 rounded-sm border border-border bg-muted/20"
              >
                {(["daily", "weekly", "monthly"] as const).map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setSpendView(v)}
                    className={`px-2.5 py-0.5 rounded-sm text-[9px] font-mono tracking-widest transition-all ${
                      spendView === v
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spendData.slice(-7)}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      fill: "rgba(255,255,255,0.3)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      fill: "rgba(255,255,255,0.3)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: number) => [`$${v}`, ""]}
                  />
                  <Bar
                    dataKey="anthropic"
                    stackId="a"
                    fill={CHART_COLORS.anthropic}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="deepseek"
                    stackId="a"
                    fill={CHART_COLORS.deepseek}
                  />
                  <Bar
                    dataKey="gemini"
                    stackId="a"
                    fill={CHART_COLORS.gemini}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </PanelCard>
        </div>
        <PanelCard title="Spend Breakdown">
          <div className="flex flex-col items-center">
            <div className="relative h-36 w-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: number) => [`$${v}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-base font-display font-bold text-foreground">
                  ${totalSpend.toFixed(2)}
                </span>
                <span className="text-[9px] text-muted-foreground/40 tracking-widest">
                  TOTAL
                </span>
              </div>
            </div>
            <div className="space-y-1.5 w-full mt-2">
              {donutData.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center justify-between text-[11px] font-mono"
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: d.fill }}
                    />
                    <span className="text-muted-foreground/60">{d.name}</span>
                  </span>
                  <span className="text-foreground/70">${d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Model switching log + fallback tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PanelCard title="Model Switching Log">
          <div className="rounded-sm border border-border overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Time", "From", "To", "Reason"].map((h) => (
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
                {MOCK_MODEL_SWITCHES.slice(0, 5).map((sw, i) => (
                  <tr
                    key={sw.id}
                    data-ocid={`agentops.switches.item.${i + 1}`}
                    className="border-b border-border/40 hover:bg-muted/10"
                  >
                    <td className="px-3 py-2 text-muted-foreground/40">
                      {new Date(
                        Date.now() - (i + 1) * 2 * 60 * 60000,
                      ).toLocaleTimeString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground/60 truncate max-w-[80px]">
                      {sw.fromModel}
                    </td>
                    <td className="px-3 py-2 text-foreground/70 truncate max-w-[80px]">
                      {sw.toModel}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded-sm border text-[9px] tracking-widest ${
                          sw.reason === "rate_limit"
                            ? "border-terminal-amber/30 text-terminal-amber bg-terminal-amber/10"
                            : sw.reason === "fallback"
                              ? "border-terminal-red/30 text-terminal-red bg-terminal-red/10"
                              : sw.reason === "cost"
                                ? "border-terminal-green/30 text-terminal-green bg-terminal-green/10"
                                : "border-primary/30 text-primary bg-primary/10"
                        }`}
                      >
                        {sw.reason.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <PanelCard title="Model Fallback Tracker">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-sm border border-terminal-amber/20 bg-terminal-amber/5">
                <p className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
                  Claude → DeepSeek
                </p>
                <p className="text-xl font-display font-bold text-terminal-amber mt-1">
                  {fallbackCount}
                </p>
                <p className="text-[9px] text-muted-foreground/40 font-mono">
                  last 30 days
                </p>
              </div>
              <div className="p-3 rounded-sm border border-primary/20 bg-primary/5">
                <p className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
                  Auto-Recovery
                </p>
                <p className="text-xl font-display font-bold text-primary mt-1">
                  {
                    MOCK_MODEL_SWITCHES.filter((s) => s.reason === "manual")
                      .length
                  }
                </p>
                <p className="text-[9px] text-muted-foreground/40 font-mono">
                  manual restores
                </p>
              </div>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { pair: "C→D", count: 5 },
                    { pair: "C→G", count: 2 },
                    { pair: "D→C", count: 3 },
                    { pair: "G→C", count: 1 },
                  ]}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="pair"
                    tick={{
                      fontSize: 9,
                      fontFamily: "monospace",
                      fill: "rgba(255,255,255,0.3)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar
                    dataKey="count"
                    fill={CHART_COLORS.gemini}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Skill usage */}
      <PanelCard title="Skill Usage Analytics">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MOCK_SKILL_USAGE}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 60, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  fill: "rgba(255,255,255,0.3)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="skill"
                tick={{
                  fontSize: 9,
                  fontFamily: "monospace",
                  fill: "rgba(255,255,255,0.5)",
                }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="callCount"
                fill={CHART_COLORS.deepseek}
                radius={[0, 2, 2, 0]}
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      {/* Error dashboard + Cron analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PanelCard title="Error Dashboard">
          <div className="space-y-2">
            {MOCK_ERRORS_BY_TYPE.map((err, i) => (
              <div
                key={err.type}
                data-ocid={`agentops.errors.item.${i + 1}`}
                className="flex items-center gap-3"
              >
                <span className="text-[10px] font-mono text-muted-foreground/60 w-28 truncate">
                  {err.type}
                </span>
                <div className="flex-1 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-terminal-red/70 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (err.count / 25) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-terminal-red/80 w-6 text-right">
                  {err.count}
                </span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Cron Job Analytics">
          <div className="rounded-sm border border-border overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Job", "Success", "Avg Time"].map((h) => (
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
                {MOCK_CRON_STATS.map((stat, i) => (
                  <tr
                    key={stat.jobId}
                    data-ocid={`agentops.cron.item.${i + 1}`}
                    className="border-b border-border/40 hover:bg-muted/10"
                  >
                    <td className="px-3 py-2.5 text-foreground/70 truncate max-w-[120px]">
                      {stat.jobName}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              stat.successRate >= 95
                                ? "bg-terminal-green"
                                : stat.successRate >= 80
                                  ? "bg-terminal-amber"
                                  : "bg-terminal-red"
                            }`}
                            style={{ width: `${stat.successRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground/60">
                          {stat.successRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground/50">
                      {(stat.avgRunMs / 1000).toFixed(1)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </div>
  );
}
