import { useQuery } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Loader2,
  Radio,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useGenerateApiToken, useGetApiToken } from "../hooks/useQueries";

const ENDPOINT = "https://clawboard.app/api/ping";

function buildSkillFile(token: string): string {
  return `---
name: clawboard-reporter
version: 1.0.0
schedule: "*/5 * * * *"
description: Reports agent status to ClawBoard every 5 minutes
api_token: ${token}
endpoint: ${ENDPOINT}
---

# ClawBoard Reporter

## Instructions

You are running as an OpenClaw agent. Every 5 minutes, collect the following data about yourself and POST it to ClawBoard:

1. Your current status (active/idle/offline/error)
2. The model you are currently using
3. Any recent log entries (last 10)
4. Any errors encountered in the last run
5. The contents of your IDENTITY.md, SOUL.md, and MEMORY.md files
6. Your current skills list

POST this data as JSON to: ${ENDPOINT}

Include the following headers:
- Content-Type: application/json
- X-API-Token: ${token}

Request body format:
{
  "apiToken": "${token}",
  "agentId": "<your unique agent ID - use your hostname or a UUID you generate once>",
  "agentName": "<your agent name from IDENTITY.md>",
  "status": "<active|idle|offline|error>",
  "modelName": "<current model>",
  "logs": ["<log line 1>", "<log line 2>"],
  "errors": ["<error 1>"],
  "identityMd": "<full contents of IDENTITY.md>",
  "soulMd": "<full contents of SOUL.md>",
  "memoryMd": "<full contents of MEMORY.md>",
  "skillsList": ["<skill name 1>", "<skill name 2>"]
}

Execute this report automatically every 5 minutes as specified in the schedule above.
`;
}

const HELP_STEPS = [
  {
    key: "find",
    n: 1,
    text: "Find your agent's skills folder — usually a folder named skills/ in your agent's home directory.",
  },
  {
    key: "drop",
    n: 2,
    text: "Drop clawboard-reporter.md into that skills/ folder.",
  },
  {
    key: "restart",
    n: 3,
    text: "Restart your agent (or wait for auto-reload if it watches for skill changes).",
  },
];

// ── Syntax highlighting ────────────────────────────────────────────────────────
function renderSyntaxHighlighted(content: string) {
  const lines = content.split("\n");
  return lines.map((line, lineNum) => {
    const stableKey = `L${lineNum}`;
    // YAML delimiters
    if (line === "---") {
      return (
        <span key={stableKey} className="block text-muted-foreground/40">
          {line}\n
        </span>
      );
    }
    // YAML key: value pairs (inside front matter)
    const kvMatch = line.match(/^([\w_]+)(:\s*)(.*)?$/);
    if (kvMatch && !line.startsWith("#") && !line.startsWith(" ")) {
      return (
        <span key={stableKey} className="block">
          <span className="text-terminal-green">{kvMatch[1]}</span>
          <span className="text-muted-foreground/50">{kvMatch[2]}</span>
          <span className="text-foreground/70">{kvMatch[3] ?? ""}\n</span>
        </span>
      );
    }
    // Comments / headings
    if (line.startsWith("#")) {
      return (
        <span key={stableKey} className="block text-primary/70">
          {line}\n
        </span>
      );
    }
    // Default
    return (
      <span key={stableKey} className="block text-foreground/75">
        {line}\n
      </span>
    );
  });
}

// ── Copy button (Stripe-style) ──────────────────────────────────────────────────
function CopyButton({ text, ocid }: { text: string; ocid: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border/60 bg-background/80 backdrop-blur-sm text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 shadow-sm"
    >
      {copied ? (
        <Check className="w-3 h-3 text-terminal-green" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied!" : "Copy File"}
    </button>
  );
}

// ── Live ping status indicator ────────────────────────────────────────────────
function PingStatusIndicator() {
  const { actor, isFetching: actorFetching } = useActor();

  const { data: agents } = useQuery({
    queryKey: ["agents-ping-watch"],
    queryFn: async (): Promise<number> => {
      if (!actor) return 0;
      const result = await (actor as any).getAllAgents();
      return Array.isArray(result) ? result.length : 0;
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 5000,
  });

  const baselineRef = useRef<number | null>(null);
  if (agents !== undefined && baselineRef.current === null) {
    baselineRef.current = agents;
  }

  const baseline = baselineRef.current ?? 0;
  const current = agents ?? 0;
  const connected = current > baseline;

  return (
    <AnimatePresence mode="wait">
      {connected ? (
        <motion.div
          key="connected"
          data-ocid="connect.status.success_state"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-center gap-3 px-4 py-3 rounded-sm border border-terminal-green/40 bg-terminal-green/8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.1,
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-terminal-green shrink-0" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-sm font-mono font-semibold text-terminal-green tracking-wide"
          >
            ✅ Agent Connected!
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="text-[11px] font-mono text-terminal-green/60 ml-auto"
          >
            {current - baseline} new agent{current - baseline !== 1 ? "s" : ""}{" "}
            · check Agents tab
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="waiting"
          data-ocid="connect.waiting.panel"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 px-4 py-3 rounded-sm border border-terminal-green/20 bg-terminal-green/5"
        >
          <div className="relative shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-terminal-green" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-terminal-green animate-ping opacity-60" />
          </div>
          <span className="text-[11px] font-mono text-terminal-green/70 tracking-wide">
            Waiting for first ping...
          </span>
          <div className="flex gap-0.5 ml-auto">
            {["a", "b", "c", "d"].map((id, i) => (
              <motion.div
                key={id}
                className="w-0.5 h-3 rounded-full bg-terminal-green/40"
                animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export function ConnectAgentSection() {
  const { data: existingToken, isLoading: loadingToken } = useGetApiToken();
  const generateMutation = useGenerateApiToken();
  const [token, setToken] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "ok" | "fail"
  >("idle");
  const { actor } = useActor();
  const generateRef = useRef(generateMutation.mutateAsync);
  generateRef.current = generateMutation.mutateAsync;

  useEffect(() => {
    if (loadingToken) return;
    if (existingToken && existingToken.length > 0) {
      setToken(existingToken);
    } else {
      generateRef
        .current()
        .then((t) => setToken(t))
        .catch(() => {});
    }
  }, [loadingToken, existingToken]);

  const skillFileContent = buildSkillFile(token || "YOUR_API_TOKEN_HERE");

  const handleTestConnection = async () => {
    setTestStatus("loading");
    try {
      if (!actor) {
        setTestStatus("fail");
        setTimeout(() => setTestStatus("idle"), 4000);
        return;
      }
      const result = await (actor as any).getAllAgents();
      const count = Array.isArray(result) ? result.length : 0;
      setTestStatus(count > 0 ? "ok" : "fail");
      setTimeout(() => setTestStatus("idle"), 4000);
    } catch {
      setTestStatus("fail");
      setTimeout(() => setTestStatus("idle"), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      {/* Headline */}
      <p
        data-ocid="connect.headline"
        className="text-sm font-mono text-foreground/80 leading-relaxed"
      >
        Add this one file to your agent&apos;s skills folder and you&apos;re
        done.
      </p>

      {/* Code block — always shown immediately */}
      <div
        data-ocid="connect.skill.panel"
        className="relative rounded-sm border border-border/60 bg-muted/30 overflow-hidden"
      >
        <div className="absolute top-2.5 right-2.5 z-10">
          <CopyButton text={skillFileContent} ocid="connect.skill.button" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/40">
          <span className="text-[10px] font-mono text-muted-foreground/50 tracking-wider">
            clawboard-reporter.md
          </span>
        </div>
        <pre className="overflow-y-auto max-h-[60vh] p-3 text-[10px] font-mono leading-relaxed whitespace-pre">
          {renderSyntaxHighlighted(skillFileContent)}
        </pre>
      </div>

      {/* Test Connection button */}
      <button
        type="button"
        data-ocid="connect.test.button"
        onClick={handleTestConnection}
        disabled={testStatus === "loading"}
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/50 bg-muted/20 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 w-fit disabled:opacity-50"
      >
        {testStatus === "loading" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Radio className="w-3 h-3" />
        )}
        {testStatus === "loading"
          ? "Checking..."
          : testStatus === "ok"
            ? "✓ Ping received"
            : testStatus === "fail"
              ? "No ping yet"
              : "Test Connection"}
      </button>

      {/* Need help? */}
      <div>
        <button
          type="button"
          data-ocid="connect.help.toggle"
          onClick={() => setHelpOpen((v) => !v)}
          className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${helpOpen ? "rotate-180" : ""}`}
          />
          Need help?
        </button>
        <AnimatePresence>
          {helpOpen && (
            <motion.div
              key="help"
              data-ocid="connect.help.panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 px-4 py-3 rounded-sm border border-border/40 bg-muted/20 space-y-2">
                <p className="text-[11px] font-mono text-foreground/60 font-semibold tracking-wider uppercase">
                  Installation
                </p>
                {HELP_STEPS.map(({ key, n, text }) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="shrink-0 text-[10px] font-mono text-muted-foreground/30 mt-0.5">
                      {n}.
                    </span>
                    <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}

                {/* API Reference */}
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-[11px] font-mono text-foreground/60 font-semibold tracking-wider uppercase mb-2">
                    API Reference
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground/50 mb-2">
                    POST to{" "}
                    <code className="text-primary/70">
                      https://clawboard.app/api/ping
                    </code>{" "}
                    — for power users building their own reporter:
                  </p>
                  <pre className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 rounded-sm p-2 overflow-x-auto leading-relaxed">{`{
  "apiToken": "your-token",
  "agentId": "unique-agent-id",
  "agentName": "Agent Name",
  "status": "active|idle|offline|error",
  "modelName": "gpt-4o",
  "logs": ["log line 1"],
  "errors": [],
  "identityMd": "...",
  "soulMd": "...",
  "memoryMd": "...",
  "skillsList": ["skill1", "skill2"]
}`}</pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ping status */}
      <PingStatusIndicator />
    </div>
  );
}
