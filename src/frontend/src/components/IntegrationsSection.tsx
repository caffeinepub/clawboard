import {
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  Plug2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type IntegrationId =
  | "grafana"
  | "prometheus"
  | "posthog"
  | "supabase"
  | "vercel";

interface IntegrationDef {
  id: IntegrationId;
  name: string;
  description: string;
  color: string;
  accentColor: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
  logo: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "grafana",
    name: "Grafana",
    description: "Pull key metrics and dashboards from your Grafana instance.",
    color: "border-orange-500/30",
    accentColor: "text-orange-400",
    logo: "G",
    fields: [
      {
        key: "url",
        label: "Grafana URL",
        placeholder: "https://grafana.example.com",
      },
      {
        key: "apiKey",
        label: "API Key",
        placeholder: "glsa_xxxxxxxxxxxx",
        type: "password",
      },
    ],
  },
  {
    id: "prometheus",
    name: "Prometheus",
    description:
      "Pull CPU, memory, and network metrics from Prometheus endpoints.",
    color: "border-red-500/30",
    accentColor: "text-red-400",
    logo: "P",
    fields: [
      {
        key: "url",
        label: "Prometheus URL",
        placeholder: "https://prometheus.example.com",
      },
    ],
  },
  {
    id: "posthog",
    name: "PostHog",
    description: "Pull product analytics and event data from PostHog.",
    color: "border-purple-500/30",
    accentColor: "text-purple-400",
    logo: "PH",
    fields: [
      {
        key: "apiKey",
        label: "API Key",
        placeholder: "phx_xxxxxxxxxxxx",
        type: "password",
      },
      { key: "projectId", label: "Project ID", placeholder: "12345" },
    ],
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "View DB stats, active connections, and query performance.",
    color: "border-green-500/30",
    accentColor: "text-green-400",
    logo: "SB",
    fields: [
      {
        key: "url",
        label: "Project URL",
        placeholder: "https://xyz.supabase.co",
      },
      {
        key: "serviceKey",
        label: "Service Key",
        placeholder: "eyJhbGci...",
        type: "password",
      },
    ],
  },
  {
    id: "vercel",
    name: "Vercel AI SDK",
    description: "Pull AI SDK usage stats if your agents use Vercel AI SDK.",
    color: "border-zinc-400/30",
    accentColor: "text-zinc-300",
    logo: "▲",
    fields: [
      {
        key: "apiToken",
        label: "API Token",
        placeholder: "Bearer vxxxxxxxxxx",
        type: "password",
      },
    ],
  },
];

type ConnectionState = "disconnected" | "connecting" | "connected";

export function IntegrationsSection() {
  const [states, setStates] = useState<Record<IntegrationId, ConnectionState>>({
    grafana: "disconnected",
    prometheus: "disconnected",
    posthog: "disconnected",
    supabase: "disconnected",
    vercel: "disconnected",
  });
  const [forms, setForms] = useState<
    Record<IntegrationId, Record<string, string>>
  >({
    grafana: {},
    prometheus: {},
    posthog: {},
    supabase: {},
    vercel: {},
  });
  const [expanded, setExpanded] = useState<IntegrationId | null>(null);

  const handleConnect = (id: IntegrationId) => {
    setStates((s) => ({ ...s, [id]: "connecting" }));
    setExpanded(null);
    setTimeout(() => {
      setStates((s) => ({ ...s, [id]: "connected" }));
    }, 1500);
  };

  const handleDisconnect = (id: IntegrationId) => {
    setStates((s) => ({ ...s, [id]: "disconnected" }));
    setForms((f) => ({ ...f, [id]: {} }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-mono font-semibold tracking-widest text-muted-foreground/50 uppercase">
          External Monitoring
        </h2>
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-[10px] text-muted-foreground/30 font-mono">
          {Object.values(states).filter((s) => s === "connected").length}{" "}
          connected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {INTEGRATIONS.map((integration, idx) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            index={idx + 1}
            state={states[integration.id]}
            formValues={forms[integration.id]}
            onFormChange={(key, val) =>
              setForms((f) => ({
                ...f,
                [integration.id]: { ...f[integration.id], [key]: val },
              }))
            }
            expanded={expanded === integration.id}
            onToggleExpand={() =>
              setExpanded(expanded === integration.id ? null : integration.id)
            }
            onConnect={() => handleConnect(integration.id)}
            onDisconnect={() => handleDisconnect(integration.id)}
          />
        ))}
      </div>
    </div>
  );
}

function IntegrationCard({
  integration,
  index,
  state,
  formValues,
  onFormChange,
  expanded,
  onToggleExpand,
  onConnect,
  onDisconnect,
}: {
  integration: IntegrationDef;
  index: number;
  state: ConnectionState;
  formValues: Record<string, string>;
  onFormChange: (key: string, val: string) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const isConnected = state === "connected";
  const isConnecting = state === "connecting";

  return (
    <motion.div
      data-ocid={`integrations.item.${index}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-sm border bg-card overflow-hidden transition-all duration-300 ${
        isConnected ? integration.color : "border-border"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div
          className={`w-9 h-9 rounded-sm border ${integration.color} bg-background/40 flex items-center justify-center text-[11px] font-bold font-mono ${integration.accentColor}`}
        >
          {integration.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-display font-semibold text-foreground tracking-wide">
              {integration.name}
            </h3>
            {isConnected && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-terminal-green/30 bg-terminal-green/10 text-terminal-green text-[9px] font-mono tracking-widest">
                <Check className="w-2.5 h-2.5" />
                CONNECTED
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-snug">
            {integration.description}
          </p>
        </div>
      </div>

      {/* Connected data widget */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <MockDataWidget id={integration.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {isConnecting ? (
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Connecting...
          </div>
        ) : isConnected ? (
          <button
            type="button"
            data-ocid={`integrations.disconnect_button.${index}`}
            onClick={onDisconnect}
            className="text-[10px] font-mono text-muted-foreground/40 hover:text-terminal-red transition-colors border border-border/40 hover:border-terminal-red/30 px-2.5 py-1 rounded-sm"
          >
            Disconnect
          </button>
        ) : (
          <>
            <button
              type="button"
              data-ocid={`integrations.connect_button.${index}`}
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono tracking-wide hover:bg-primary/20 hover:border-primary/50 transition-all"
            >
              <Plug2 className="w-3 h-3" />
              Connect
            </button>
            {expanded && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="text-muted-foreground/40 hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Connect form */}
      <AnimatePresence>
        {expanded && !isConnected && !isConnecting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground/50 font-mono tracking-wide pt-3">
                Enter your credentials to connect
              </p>
              {integration.fields.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={`field-${integration.id}-${field.key}`}
                    className="text-[9px] tracking-widest text-muted-foreground/40 uppercase font-mono block mb-1"
                  >
                    {field.label}
                  </label>
                  <input
                    id={`field-${integration.id}-${field.key}`}
                    data-ocid={`integrations.${integration.id}.${field.key}.input`}
                    type={field.type ?? "text"}
                    value={formValues[field.key] ?? ""}
                    onChange={(e) => onFormChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-1.5 bg-background border border-border rounded-sm text-xs font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              ))}
              <button
                type="button"
                data-ocid={`integrations.${integration.id}.submit_button`}
                onClick={onConnect}
                className="w-full py-2 rounded-sm border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-wide hover:bg-primary/20 transition-all"
              >
                Connect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MockDataWidget({ id }: { id: IntegrationId }) {
  const data: Record<IntegrationId, React.ReactNode> = {
    grafana: (
      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Requests/sec",
            value: "2,847",
            trend: "+12%",
            color: "text-primary",
          },
          {
            label: "Error Rate",
            value: "0.12%",
            trend: "-0.03%",
            color: "text-terminal-green",
          },
          {
            label: "P95 Latency",
            value: "234ms",
            trend: "+8ms",
            color: "text-terminal-amber",
          },
          {
            label: "Active Users",
            value: "1,203",
            trend: "+47",
            color: "text-accent",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="p-2 rounded-sm border border-border/50 bg-background/40"
          >
            <p className="text-[9px] text-muted-foreground/40 tracking-widest uppercase">
              {m.label}
            </p>
            <p className={`text-sm font-display font-bold mt-0.5 ${m.color}`}>
              {m.value}
            </p>
            <p className="text-[9px] text-muted-foreground/40 font-mono">
              {m.trend}
            </p>
          </div>
        ))}
      </div>
    ),
    prometheus: (
      <div className="space-y-2">
        {[
          { label: "CPU Usage", value: 34, color: "bg-primary" },
          { label: "Memory", value: 67, color: "bg-accent" },
          { label: "Network I/O", value: 23, color: "bg-terminal-green" },
        ].map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="text-muted-foreground/50">{m.label}</span>
              <span className="text-foreground/70">{m.value}%</span>
            </div>
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color}`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
    posthog: (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-sm border border-border/50 bg-background/40">
            <p className="text-[9px] text-muted-foreground/40 tracking-widest">
              EVENTS TODAY
            </p>
            <p className="text-sm font-display font-bold text-purple-400">
              12,483
            </p>
          </div>
          <div className="p-2 rounded-sm border border-border/50 bg-background/40">
            <p className="text-[9px] text-muted-foreground/40 tracking-widest">
              DAU
            </p>
            <p className="text-sm font-display font-bold text-accent">847</p>
          </div>
        </div>
        <div className="text-[10px] font-mono space-y-1">
          {[
            ["page_view", "8,421"],
            ["identify", "1,204"],
            ["click_cta", "847"],
          ].map(([evt, cnt]) => (
            <div key={evt} className="flex justify-between">
              <span className="text-muted-foreground/50">{evt}</span>
              <span className="text-foreground/60">{cnt}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    supabase: (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground/50">Connections</span>
          <span className="text-terminal-green">23 / 100</span>
        </div>
        <div className="space-y-1">
          {[
            ["users", "2.3 MB"],
            ["events", "18.7 MB"],
            ["logs", "4.1 MB"],
          ].map(([tbl, size]) => (
            <div
              key={tbl}
              className="flex justify-between text-[10px] font-mono"
            >
              <span className="text-muted-foreground/40">{tbl}</span>
              <span className="text-foreground/60">{size}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-terminal-amber/70 font-mono">
          Avg query: 12ms
        </div>
      </div>
    ),
    vercel: (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-sm border border-border/50 bg-background/40">
            <p className="text-[9px] text-muted-foreground/40 tracking-widest">
              AVG TOKENS/REQ
            </p>
            <p className="text-sm font-display font-bold text-zinc-300">
              1,247
            </p>
          </div>
          <div className="p-2 rounded-sm border border-border/50 bg-background/40">
            <p className="text-[9px] text-muted-foreground/40 tracking-widest">
              P50 LATENCY
            </p>
            <p className="text-sm font-display font-bold text-accent">892ms</p>
          </div>
        </div>
        <div className="text-[10px] font-mono space-y-1">
          {[
            ["claude-3-5-sonnet", "68%"],
            ["deepseek-chat", "22%"],
            ["gemini-pro", "10%"],
          ].map(([m, pct]) => (
            <div key={m} className="flex justify-between">
              <span className="text-muted-foreground/50 truncate">{m}</span>
              <span className="text-foreground/60 ml-2">{pct}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  };
  return (
    <div className="p-3 rounded-sm border border-border/40 bg-background/30">
      {data[id]}
    </div>
  );
}
