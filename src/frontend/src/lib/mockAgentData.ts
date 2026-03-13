// Realistic OpenClaw mock data for Agent Control Center tabs

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const now = Date.now();
const h = (ms: number) => now - ms;

export const MOCK_TASKS = [
  {
    id: "t1",
    title: "Research competitor pricing via web-search",
    status: "running",
    agentId: "a1",
    startedAt: h(12 * 60000),
    completedAt: null,
    duration: null,
    output: null,
  },
  {
    id: "t2",
    title: "Update MEMORY.md with market findings",
    status: "pending",
    agentId: "a1",
    startedAt: null,
    completedAt: null,
    duration: null,
    output: null,
  },
  {
    id: "t3",
    title: "Execute daily analytics cron job",
    status: "pending",
    agentId: "a2",
    startedAt: null,
    completedAt: null,
    duration: null,
    output: null,
  },
  {
    id: "t4",
    title: "HTTP POST results to webhook endpoint",
    status: "completed",
    agentId: "a1",
    startedAt: h(45 * 60000),
    completedAt: h(43 * 60000),
    duration: 2100,
    output: "200 OK — payload delivered",
  },
  {
    id: "t5",
    title: "Analyze Q4 sales CSV data",
    status: "completed",
    agentId: "a2",
    startedAt: h(90 * 60000),
    completedAt: h(87 * 60000),
    duration: 3400,
    output: "47 rows processed, 3 anomalies flagged",
  },
  {
    id: "t6",
    title: "Send Slack notification via http-request",
    status: "completed",
    agentId: "a1",
    startedAt: h(120 * 60000),
    completedAt: h(119 * 60000),
    duration: 850,
    output: "Message delivered to #ops channel",
  },
  {
    id: "t7",
    title: "Scrape product listings — electronics category",
    status: "completed",
    agentId: "a3",
    startedAt: h(180 * 60000),
    completedAt: h(175 * 60000),
    duration: 5200,
    output: "284 listings scraped, saved to output.json",
  },
  {
    id: "t8",
    title: "Write daily summary to MEMORY.md",
    status: "completed",
    agentId: "a2",
    startedAt: h(240 * 60000),
    completedAt: h(239 * 60000),
    duration: 600,
    output: "MEMORY.md updated — 847 bytes written",
  },
];

export const MOCK_TOOL_CALLS = [
  {
    id: "tc1",
    skill: "web-search",
    args: '"competitor pricing 2025"',
    result: "success",
    durationMs: 1240,
    timestamp: h(5 * 60000),
    agentId: "a1",
    output: "12 results returned",
  },
  {
    id: "tc2",
    skill: "memory-write",
    args: "key=market_data, 342 bytes",
    result: "success",
    durationMs: 45,
    timestamp: h(6 * 60000),
    agentId: "a1",
    output: "Written to MEMORY.md §Market Research",
  },
  {
    id: "tc3",
    skill: "http-request",
    args: "POST https://hooks.slack.com/...",
    result: "success",
    durationMs: 820,
    timestamp: h(8 * 60000),
    agentId: "a1",
    output: "200 OK",
  },
  {
    id: "tc4",
    skill: "file-read",
    args: "path=data/sales_q4.csv",
    result: "success",
    durationMs: 110,
    timestamp: h(15 * 60000),
    agentId: "a2",
    output: "47 rows, 8 columns",
  },
  {
    id: "tc5",
    skill: "csv-parser",
    args: "file=sales_q4.csv, delimiter=,",
    result: "success",
    durationMs: 340,
    timestamp: h(16 * 60000),
    agentId: "a2",
    output: "Parsed 47 records",
  },
  {
    id: "tc6",
    skill: "memory-read",
    args: "key=last_run_stats",
    result: "success",
    durationMs: 22,
    timestamp: h(20 * 60000),
    agentId: "a1",
    output: "Retrieved 128 bytes",
  },
  {
    id: "tc7",
    skill: "http-request",
    args: "POST https://api.example.com/webhook",
    result: "error",
    durationMs: 30012,
    timestamp: h(25 * 60000),
    agentId: "a1",
    output: "TIMEOUT after 30s",
  },
  {
    id: "tc8",
    skill: "http-request",
    args: "POST https://api.example.com/webhook (retry 2)",
    result: "success",
    durationMs: 1820,
    timestamp: h(26 * 60000),
    agentId: "a1",
    output: "200 OK",
  },
  {
    id: "tc9",
    skill: "web-search",
    args: '"OpenAI pricing changes 2025"',
    result: "success",
    durationMs: 980,
    timestamp: h(30 * 60000),
    agentId: "a3",
    output: "8 results returned",
  },
  {
    id: "tc10",
    skill: "shell-exec",
    args: "python3 scripts/analyze.py --mode=full",
    result: "success",
    durationMs: 4200,
    timestamp: h(35 * 60000),
    agentId: "a2",
    output: "Exit 0 — analysis complete",
  },
  {
    id: "tc11",
    skill: "file-write",
    args: "path=output/report_2025.json, 2.1KB",
    result: "success",
    durationMs: 67,
    timestamp: h(36 * 60000),
    agentId: "a2",
    output: "File written successfully",
  },
  {
    id: "tc12",
    skill: "cron-executor",
    args: "job=daily-analytics, schedule=0 9 * * *",
    result: "success",
    durationMs: 8900,
    timestamp: h(60 * 60000),
    agentId: "a2",
    output: "Cron completed in 8.9s",
  },
  {
    id: "tc13",
    skill: "slack-notify",
    args: 'channel=#ops, msg="Daily report ready"',
    result: "success",
    durationMs: 430,
    timestamp: h(61 * 60000),
    agentId: "a2",
    output: "Notification sent",
  },
  {
    id: "tc14",
    skill: "memory-write",
    args: "key=task_history, append=true",
    result: "error",
    durationMs: 12,
    timestamp: h(70 * 60000),
    agentId: "a3",
    output: "ERROR: MEMORY.md locked by another process",
  },
  {
    id: "tc15",
    skill: "memory-write",
    args: "key=task_history, append=true (retry)",
    result: "success",
    durationMs: 38,
    timestamp: h(70 * 60000 + 2000),
    agentId: "a3",
    output: "Appended 124 bytes",
  },
];

export const MOCK_LOGS = [
  {
    id: "l1",
    level: "info",
    message:
      '[web-search] Query: "competitor pricing 2025" → 12 results in 1.24s',
    timestamp: h(5 * 60000),
    agentId: "a1",
  },
  {
    id: "l2",
    level: "info",
    message: "[memory-write] Updated MEMORY.md §Market Research — +342 bytes",
    timestamp: h(6 * 60000),
    agentId: "a1",
  },
  {
    id: "l3",
    level: "warn",
    message:
      "[http-request] Retry 1/3: POST https://api.example.com/webhook — timeout after 30s",
    timestamp: h(25 * 60000),
    agentId: "a1",
  },
  {
    id: "l4",
    level: "info",
    message: "[http-request] Retry 2/3 succeeded — 200 OK in 1.82s",
    timestamp: h(26 * 60000),
    agentId: "a1",
  },
  {
    id: "l5",
    level: "info",
    message:
      '[cron-executor] Job "daily-analytics" started — schedule: 0 9 * * *',
    timestamp: h(60 * 60000),
    agentId: "a2",
  },
  {
    id: "l6",
    level: "info",
    message:
      "[file-read] Loaded data/sales_q4.csv — 47 rows, 8 columns (110ms)",
    timestamp: h(15 * 60000),
    agentId: "a2",
  },
  {
    id: "l7",
    level: "info",
    message: "[csv-parser] Parsed 47 records — 3 anomalies flagged",
    timestamp: h(16 * 60000),
    agentId: "a2",
  },
  {
    id: "l8",
    level: "error",
    message:
      "[memory-write] MEMORY.md locked by another process — retrying in 2s",
    timestamp: h(70 * 60000),
    agentId: "a3",
  },
  {
    id: "l9",
    level: "info",
    message:
      "[memory-write] Lock released — appended 124 bytes to task_history",
    timestamp: h(70 * 60000 + 2000),
    agentId: "a3",
  },
  {
    id: "l10",
    level: "info",
    message: "[shell-exec] Running: python3 scripts/analyze.py --mode=full",
    timestamp: h(35 * 60000),
    agentId: "a2",
  },
  {
    id: "l11",
    level: "info",
    message: "[shell-exec] Exit 0 — analysis complete (4.2s)",
    timestamp: h(35 * 60000 + 4200),
    agentId: "a2",
  },
  {
    id: "l12",
    level: "info",
    message: "[file-write] output/report_2025.json written — 2.1 KB",
    timestamp: h(36 * 60000),
    agentId: "a2",
  },
  {
    id: "l13",
    level: "warn",
    message:
      "[web-search] Rate limit approaching — 47/60 requests used this minute",
    timestamp: h(32 * 60000),
    agentId: "a3",
  },
  {
    id: "l14",
    level: "info",
    message: '[slack-notify] Message delivered to #ops — "Daily report ready"',
    timestamp: h(61 * 60000),
    agentId: "a2",
  },
  {
    id: "l15",
    level: "info",
    message: "[memory-read] Retrieved last_run_stats — 128 bytes (22ms)",
    timestamp: h(20 * 60000),
    agentId: "a1",
  },
  {
    id: "l16",
    level: "error",
    message: "[http-request] 429 Too Many Requests — backing off 60s",
    timestamp: h(48 * 60000),
    agentId: "a3",
  },
  {
    id: "l17",
    level: "info",
    message:
      '[cron-executor] Job "daily-analytics" completed — 8.9s total runtime',
    timestamp: h(59 * 60000),
    agentId: "a2",
  },
  {
    id: "l18",
    level: "warn",
    message:
      "[memory-write] MEMORY.md approaching size limit — 87% of 50KB used",
    timestamp: h(75 * 60000),
    agentId: "a1",
  },
  {
    id: "l19",
    level: "info",
    message:
      '[web-search] Query: "OpenAI pricing changes 2025" → 8 results in 0.98s',
    timestamp: h(30 * 60000),
    agentId: "a3",
  },
  {
    id: "l20",
    level: "info",
    message:
      "[http-request] GET https://api.openai.com/v1/models — 200 OK (345ms)",
    timestamp: h(55 * 60000),
    agentId: "a1",
  },
];

export const MOCK_MEMORY_CONTENT = `# MEMORY.md
_Last updated: ${new Date(h(6 * 60000)).toISOString()}_

## Market Research
- **2025-01-15**: Competitor A raised prices 12% for enterprise tier
- **2025-01-14**: New entrant offering 30% discount for first 6 months
- **2025-01-12**: Industry report: avg API pricing down 8% YoY
- OpenAI GPT-4o at $5/1M input, $15/1M output (as of Jan 2025)
- Anthropic Claude 3.5 Sonnet: $3/1M input, $15/1M output

## Task History
- Daily analytics cron running successfully since 2025-01-01
- Webhook delivery issues resolved 2025-01-13 (increased timeout to 30s)
- Q4 sales analysis completed — report in output/report_2025.json

## Key Contacts
- ops-team: #ops on Slack
- data-team: data@company.internal
- Webhook: https://api.example.com/webhook (auth: Bearer token in env)

## Configuration Notes
- Rate limit: 60 web-search requests/minute
- MEMORY.md max size: 50KB (currently 87% full)
- Fallback model: deepseek-chat (when claude-3-5-sonnet rate limited)

## Pending Actions
- [ ] Purge old task history entries (>30 days)
- [ ] Update webhook URL after infrastructure migration
- [ ] Review anomalies from Q4 sales data
`;

export const MOCK_MEMORY_HISTORY = [
  {
    id: "mh1",
    timestamp: h(6 * 60000),
    changeType: "updated",
    key: "Market Research",
    agentId: "a1",
  },
  {
    id: "mh2",
    timestamp: h(36 * 60000),
    changeType: "added",
    key: "Task History / Q4 report",
    agentId: "a2",
  },
  {
    id: "mh3",
    timestamp: h(70 * 60000 + 2000),
    changeType: "updated",
    key: "task_history",
    agentId: "a3",
  },
  {
    id: "mh4",
    timestamp: h(120 * 60000),
    changeType: "updated",
    key: "Configuration Notes",
    agentId: "a1",
  },
  {
    id: "mh5",
    timestamp: h(240 * 60000),
    changeType: "added",
    key: "Pending Actions",
    agentId: "a2",
  },
];

export const MOCK_JOB_QUEUE = [
  {
    id: "j1",
    name: "Competitor pricing research",
    status: "running",
    priority: 1,
    queuedAt: h(15 * 60000),
    startedAt: h(12 * 60000),
    agentId: "a1",
  },
  {
    id: "j2",
    name: "Update MEMORY.md",
    status: "pending",
    priority: 2,
    queuedAt: h(14 * 60000),
    startedAt: null,
    agentId: "a1",
  },
  {
    id: "j3",
    name: "Daily analytics cron",
    status: "pending",
    priority: 2,
    queuedAt: h(13 * 60000),
    startedAt: null,
    agentId: "a2",
  },
  {
    id: "j4",
    name: "Slack digest notification",
    status: "pending",
    priority: 3,
    queuedAt: h(12 * 60000),
    startedAt: null,
    agentId: "a2",
  },
  {
    id: "j5",
    name: "Webhook payload delivery",
    status: "completed",
    priority: 2,
    queuedAt: h(50 * 60000),
    startedAt: h(45 * 60000),
    agentId: "a1",
  },
  {
    id: "j6",
    name: "Q4 CSV analysis",
    status: "completed",
    priority: 1,
    queuedAt: h(95 * 60000),
    startedAt: h(90 * 60000),
    agentId: "a2",
  },
];

export const MOCK_CONVERSATIONS = [
  {
    id: "cv1",
    startedAt: h(10 * 60000),
    agentId: "a1",
    messages: [
      {
        role: "user",
        content:
          "Research the latest competitor pricing changes and summarize key findings.",
        timestamp: h(10 * 60000),
      },
      {
        role: "assistant",
        content:
          "I'll use web-search to gather competitor pricing data. Starting with the top 5 competitors in the AI API space.\n\nFound 12 relevant results. Key findings:\n- Competitor A: +12% enterprise tier price hike effective Feb 2025\n- Competitor B: New discount program (30% off for 6 months)\n- Industry trend: Average API pricing down 8% YoY\n\nUpdating MEMORY.md with these findings now.",
        timestamp: h(8 * 60000),
      },
      {
        role: "user",
        content: "Good. Now send a summary to the #ops Slack channel.",
        timestamp: h(7 * 60000),
      },
      {
        role: "assistant",
        content:
          "Sending summary to #ops via http-request skill. Message delivered successfully to #ops channel.",
        timestamp: h(6 * 60000 + 30000),
      },
    ],
  },
  {
    id: "cv2",
    startedAt: h(95 * 60000),
    agentId: "a2",
    messages: [
      {
        role: "user",
        content: "Run the Q4 sales analysis and flag any anomalies.",
        timestamp: h(95 * 60000),
      },
      {
        role: "assistant",
        content:
          "Loading data/sales_q4.csv with file-read...\n47 rows, 8 columns loaded. Running csv-parser to process records.\n\nRunning analysis script via shell-exec: python3 scripts/analyze.py --mode=full\n\nAnalysis complete (4.2s). Found 3 anomalies:\n1. Row 23: Revenue spike 340% above mean — possible data entry error\n2. Row 31: Negative margin on product SKU-447\n3. Row 44: Date field format inconsistency\n\nFull report written to output/report_2025.json",
        timestamp: h(87 * 60000),
      },
    ],
  },
];

export const MOCK_SYSTEM_LOAD = {
  cpu: 34,
  ram: 67,
  disk: 45,
  networkIn: 1.2,
  networkOut: 0.8,
};

export function getSystemLoadForAgent(agentId: string) {
  const h2 = hashStr(agentId);
  return {
    cpu: 20 + (h2 % 50),
    ram: 40 + (h2 % 40),
    disk: 20 + (h2 % 60),
    networkIn: Math.round((0.5 + (h2 % 30) * 0.1) * 10) / 10,
    networkOut: Math.round((0.2 + (h2 % 15) * 0.1) * 10) / 10,
  };
}

const BASE_DATE = new Date();
BASE_DATE.setHours(0, 0, 0, 0);

export const MOCK_TOKEN_CHART_DATA = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - (13 - i));
  const label = `${d.getMonth() + 1}/${d.getDate()}`;
  const base = 80000 + Math.sin(i * 0.7) * 30000;
  return {
    date: label,
    claude: Math.round(base + 20000 + Math.sin(i * 1.1) * 10000),
    deepseek: Math.round(base * 0.4 + Math.cos(i * 0.9) * 8000),
    gemini: Math.round(base * 0.25 + Math.sin(i * 1.3) * 5000),
  };
});

export const MOCK_SPEND_DATA = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - (13 - i));
  const label = `${d.getMonth() + 1}/${d.getDate()}`;
  return {
    date: label,
    anthropic: Math.round((3.2 + Math.sin(i * 0.7) * 1.5) * 100) / 100,
    deepseek: Math.round((0.8 + Math.cos(i * 0.9) * 0.4) * 100) / 100,
    gemini: Math.round((0.5 + Math.sin(i * 1.1) * 0.3) * 100) / 100,
  };
});

export const MOCK_MODEL_SWITCHES = [
  {
    id: "ms1",
    fromModel: "claude-3-5-sonnet",
    toModel: "deepseek-chat",
    reason: "rate_limit",
    timestamp: h(2 * 60 * 60000),
    agentId: "a1",
  },
  {
    id: "ms2",
    fromModel: "deepseek-chat",
    toModel: "claude-3-5-sonnet",
    reason: "manual",
    timestamp: h(1.5 * 60 * 60000),
    agentId: "a1",
  },
  {
    id: "ms3",
    fromModel: "claude-3-5-sonnet",
    toModel: "deepseek-chat",
    reason: "rate_limit",
    timestamp: h(5 * 60 * 60000),
    agentId: "a2",
  },
  {
    id: "ms4",
    fromModel: "claude-3-opus",
    toModel: "claude-3-5-sonnet",
    reason: "cost",
    timestamp: h(8 * 60 * 60000),
    agentId: "a3",
  },
  {
    id: "ms5",
    fromModel: "claude-3-5-sonnet",
    toModel: "gemini-pro",
    reason: "fallback",
    timestamp: h(12 * 60 * 60000),
    agentId: "a2",
  },
  {
    id: "ms6",
    fromModel: "gemini-pro",
    toModel: "claude-3-5-sonnet",
    reason: "manual",
    timestamp: h(10 * 60 * 60000),
    agentId: "a2",
  },
  {
    id: "ms7",
    fromModel: "claude-3-5-sonnet",
    toModel: "deepseek-chat",
    reason: "rate_limit",
    timestamp: h(18 * 60 * 60000),
    agentId: "a1",
  },
  {
    id: "ms8",
    fromModel: "deepseek-chat",
    toModel: "claude-3-5-sonnet",
    reason: "manual",
    timestamp: h(16 * 60 * 60000),
    agentId: "a1",
  },
];

export const MOCK_SKILL_USAGE = [
  { skill: "web-search", callCount: 487, errorCount: 12, avgDurationMs: 1100 },
  { skill: "memory-write", callCount: 342, errorCount: 8, avgDurationMs: 42 },
  { skill: "memory-read", callCount: 298, errorCount: 2, avgDurationMs: 25 },
  { skill: "http-request", callCount: 256, errorCount: 31, avgDurationMs: 940 },
  { skill: "file-read", callCount: 187, errorCount: 4, avgDurationMs: 95 },
  { skill: "file-write", callCount: 143, errorCount: 6, avgDurationMs: 72 },
  { skill: "cron-executor", callCount: 98, errorCount: 7, avgDurationMs: 8400 },
  { skill: "shell-exec", callCount: 76, errorCount: 9, avgDurationMs: 3200 },
  { skill: "csv-parser", callCount: 54, errorCount: 1, avgDurationMs: 320 },
  { skill: "slack-notify", callCount: 48, errorCount: 3, avgDurationMs: 450 },
];

export const MOCK_ERRORS_BY_TYPE = [
  { type: "TIMEOUT", count: 23, lastSeen: h(25 * 60000) },
  { type: "RATE_LIMIT", count: 18, lastSeen: h(48 * 60000) },
  { type: "FILE_LOCK", count: 7, lastSeen: h(70 * 60000) },
  { type: "HTTP_4XX", count: 12, lastSeen: h(35 * 60000) },
  { type: "HTTP_5XX", count: 5, lastSeen: h(120 * 60000) },
  { type: "MEMORY_OVERFLOW", count: 3, lastSeen: h(75 * 60000) },
  { type: "PARSE_ERROR", count: 4, lastSeen: h(200 * 60000) },
];

export const MOCK_CRON_STATS = [
  {
    jobId: "cj1",
    jobName: "daily-analytics",
    successRate: 94,
    failRate: 6,
    avgRunMs: 8900,
  },
  {
    jobId: "cj2",
    jobName: "memory-cleanup",
    successRate: 98,
    failRate: 2,
    avgRunMs: 1200,
  },
  {
    jobId: "cj3",
    jobName: "webhook-heartbeat",
    successRate: 87,
    failRate: 13,
    avgRunMs: 450,
  },
  {
    jobId: "cj4",
    jobName: "market-research",
    successRate: 91,
    failRate: 9,
    avgRunMs: 15400,
  },
  {
    jobId: "cj5",
    jobName: "slack-digest",
    successRate: 100,
    failRate: 0,
    avgRunMs: 620,
  },
];

export function getAgentMockData(agentId: string) {
  function filterArr<T extends { agentId: string }>(arr: T[]): T[] {
    const filtered = arr.filter((x) => x.agentId === agentId);
    return filtered.length > 0
      ? filtered
      : (arr.slice(0, 3).map((x) => ({ ...x, agentId })) as T[]);
  }
  return {
    tasks: filterArr(MOCK_TASKS),
    toolCalls: filterArr(MOCK_TOOL_CALLS),
    logs: filterArr(MOCK_LOGS),
    jobQueue: filterArr(MOCK_JOB_QUEUE),
    conversations: filterArr(MOCK_CONVERSATIONS),
    systemLoad: getSystemLoadForAgent(agentId),
  };
}

export function getTokenSpendForAgent(agentId: string): {
  tokens: number;
  usd: number;
} {
  let h2 = 0;
  for (let i = 0; i < agentId.length; i++)
    h2 = (Math.imul(31, h2) + agentId.charCodeAt(i)) | 0;
  h2 = Math.abs(h2);
  const tokens = 40000 + (h2 % 120000);
  return { tokens, usd: Math.round(tokens * 0.000015 * 100) / 100 };
}
