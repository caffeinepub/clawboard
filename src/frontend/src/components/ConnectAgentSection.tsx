import { useQuery } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Loader2,
  Plug,
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

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({
  text,
  ocid,
  label = "Copy",
}: {
  text: string;
  ocid: string;
  label?: string;
}) {
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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-border/60 bg-muted/20 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
    >
      {copied ? (
        <Check className="w-3 h-3 text-terminal-green" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ── Step badge + card ─────────────────────────────────────────────────────────
function StepBadge({ n }: { n: number }) {
  return (
    <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-sm border border-primary/40 bg-primary/5 text-primary text-xs font-mono font-bold">
      {n}
    </div>
  );
}

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: step * 0.08 }}
      className="flex gap-4 p-5 rounded-sm border border-border/60 bg-card/50"
    >
      <StepBadge n={step} />
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-display font-semibold tracking-widest text-foreground/80 uppercase mb-3">
          {title}
        </h3>
        {children}
      </div>
    </motion.div>
  );
}

// ── Live ping status indicator ────────────────────────────────────────────────
function PingStatusIndicator() {
  const { actor, isFetching: actorFetching } = useActor();

  // Poll agents every 5 seconds
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

  // Capture the baseline count exactly once when data first arrives
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
        // ── Connected state ────────────────────────────────────────────────
        <motion.div
          key="connected"
          data-ocid="connect.status.success_state"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex items-start gap-4 px-5 py-4 rounded-sm border border-terminal-green/40 bg-terminal-green/8"
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
            <CheckCircle2 className="w-5 h-5 text-terminal-green shrink-0 mt-0.5" />
          </motion.div>
          <div className="space-y-1">
            <motion.p
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="text-sm font-mono font-semibold text-terminal-green tracking-wide"
            >
              Agent Connected!
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="text-[11px] font-mono text-terminal-green/70 leading-relaxed"
            >
              Your agent is now reporting to ClawBoard. Head to the{" "}
              <span className="text-terminal-green font-semibold">Agents</span>{" "}
              tab to see it.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="text-[10px] font-mono text-terminal-green/40 tracking-widest uppercase"
            >
              {current - baseline} new agent
              {current - baseline !== 1 ? "s" : ""} detected
            </motion.p>
          </div>
        </motion.div>
      ) : (
        // ── Waiting state ──────────────────────────────────────────────────
        <motion.div
          key="waiting"
          data-ocid="connect.waiting.panel"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {/* Description */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center gap-2 mt-1 shrink-0">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-terminal-green" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-terminal-green animate-ping opacity-60" />
              </div>
              <div className="w-px h-6 bg-terminal-green/20" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-mono text-foreground/80">
                Waiting for your first ping...
              </p>
              <p className="text-[11px] font-mono text-muted-foreground/50 leading-relaxed">
                Your agent will appear in the{" "}
                <span className="text-primary/70">Agents</span> tab
                automatically within 5 minutes of installing the skill file. No
                manual registration needed.
              </p>
              <p className="text-[11px] font-mono text-muted-foreground/40 leading-relaxed">
                Once connected, you will see live status, logs, credits, skill
                results, and cron history — all updated every 5 minutes.
              </p>
            </div>
          </div>

          {/* Animated bar indicator */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-sm border border-terminal-green/20 bg-terminal-green/5">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-3 rounded-full bg-terminal-green/50"
                  animate={{ opacity: [0.3, 1, 0.3], scaleY: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 1.2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-terminal-green/70 tracking-wider">
              LISTENING FOR PINGS
            </span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground/30 tracking-widest">
              POLL / 5s
            </span>
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
  const generateRef = useRef(generateMutation.mutateAsync);
  generateRef.current = generateMutation.mutateAsync;

  // On mount: use existing token or generate one
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

  const skillFileContent = token ? buildSkillFile(token) : "";

  const handleDownload = () => {
    const blob = new Blob([skillFileContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clawboard-reporter.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = loadingToken || (generateMutation.isPending && !token);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 flex items-center justify-center rounded-sm border border-primary/30 bg-primary/5">
          <Plug className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-display font-semibold text-foreground tracking-widest uppercase">
            Connect Your Agent
          </h1>
          <p className="text-[11px] text-muted-foreground/50 font-mono mt-0.5">
            Add one skill file to your OpenClaw agent — it handles everything
            else automatically.
          </p>
        </div>
      </div>

      {/* Step 1 — API Token */}
      <StepCard step={1} title="Your API Token">
        <p className="text-[11px] text-muted-foreground/60 font-mono mb-3">
          This token identifies your ClawBoard account. It will be embedded in
          your skill file automatically.
        </p>
        {isLoading ? (
          <div
            data-ocid="connect.token.loading_state"
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground/40"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating token...
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-sm border border-primary/20 bg-muted/40 overflow-x-auto">
              <code
                data-ocid="connect.token.panel"
                className="text-primary text-xs font-mono tracking-wider whitespace-nowrap flex-1"
              >
                {token}
              </code>
            </div>
            <CopyButton
              text={token}
              ocid="connect.token.button"
              label="Copy Token"
            />
          </div>
        )}
      </StepCard>

      {/* Step 2 — Skill File */}
      <StepCard step={2} title="Download Your Skill File">
        <p className="text-[11px] text-muted-foreground/60 font-mono mb-3">
          This pre-filled skill file tells your agent to phone home to ClawBoard
          every 5 minutes with its status and data.
        </p>
        {isLoading ? (
          <div
            data-ocid="connect.skill.loading_state"
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground/40"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            Building skill file...
          </div>
        ) : (
          <div className="space-y-3">
            <div
              data-ocid="connect.skill.panel"
              className="rounded-sm border border-border/50 bg-muted/40 overflow-x-auto"
            >
              <pre className="p-3 text-[10px] font-mono text-foreground/60 leading-relaxed whitespace-pre">
                {skillFileContent}
              </pre>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <CopyButton
                text={skillFileContent}
                ocid="connect.skill.button"
                label="Copy File"
              />
              <button
                type="button"
                data-ocid="connect.skill.download_button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-accent/40 bg-accent/5 text-xs font-mono text-accent hover:bg-accent/15 hover:border-accent/60 transition-all duration-150"
              >
                <Download className="w-3 h-3" />
                Download .md
              </button>
            </div>
          </div>
        )}
      </StepCard>

      {/* Step 3 — Install Instructions */}
      <StepCard step={3} title="Install the Skill File">
        <div className="space-y-2.5">
          {[
            {
              n: 1,
              text: "Find your OpenClaw agent's skills folder — it's usually a folder named \"skills/\" in your agent's home directory.",
            },
            {
              n: 2,
              text: "Drop the downloaded clawboard-reporter.md file into that skills/ folder.",
            },
            {
              n: 3,
              text: "Restart your agent, or wait for it to auto-reload if it watches for skill file changes.",
            },
          ].map((item) => (
            <div key={item.n} className="flex items-start gap-3">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center rounded-sm border border-border/40 bg-muted/30 text-[10px] font-mono text-muted-foreground/50 mt-0.5">
                {item.n}
              </span>
              <p className="text-xs font-mono text-foreground/60 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 px-3 py-2.5 rounded-sm border border-border/30 bg-muted/20">
          <p className="text-[10px] font-mono text-muted-foreground/40 tracking-wide">
            <span className="text-primary/60">TIP:</span> No SSH commands or
            server restarts needed — just drop the file and you are done.
          </p>
        </div>
      </StepCard>

      {/* Step 4 — Waiting / Connected */}
      <StepCard step={4} title="Your Agent Will Appear Automatically">
        <PingStatusIndicator />
      </StepCard>
    </div>
  );
}
