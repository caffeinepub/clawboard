import {
  AlertOctagon,
  Loader2,
  Medal,
  Play,
  Radio,
  RotateCcw,
  Send,
  Square,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAddBroadcastMessage,
  useGetAllAgents,
  useGetAllBroadcastMessages,
  useGetAllLeaderboardEntries,
} from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionLoading,
  TerminalBadge,
  formatRelativeTime,
} from "./SectionShell";

// ── Types ─────────────────────────────────────────────────────────────────────
type LeaderboardEntry = {
  rank: bigint;
  agentName: string;
  agentId: string;
  uptimePercent: bigint;
  taskCount: bigint;
  creditsUsed: bigint;
};

type BroadcastMessage = {
  id: string;
  sentBy: string;
  agentTargets: string[];
  message: string;
  timestamp: bigint;
};

type SortKey = "taskCount" | "creditsUsed" | "uptimePercent";

// ── Medal helpers ─────────────────────────────────────────────────────────────
const MEDAL = [
  {
    icon: <Trophy className="w-4 h-4" />,
    color: "text-yellow-400",
    glow: "shadow-[0_0_12px_rgba(250,204,21,0.4)]",
    border: "border-yellow-400/30",
    bg: "bg-yellow-400/5",
  },
  {
    icon: <Medal className="w-4 h-4" />,
    color: "text-slate-300",
    glow: "shadow-[0_0_12px_rgba(203,213,225,0.3)]",
    border: "border-slate-400/30",
    bg: "bg-slate-400/5",
  },
  {
    icon: <Medal className="w-4 h-4" />,
    color: "text-orange-400",
    glow: "shadow-[0_0_12px_rgba(251,146,60,0.35)]",
    border: "border-orange-400/30",
    bg: "bg-orange-400/5",
  },
];

// ── Panel heading ─────────────────────────────────────────────────────────────
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

// ── Quick Controls Panel ──────────────────────────────────────────────────────
function ControlsPanel() {
  const { data: rawAgents } = useGetAllAgents();
  const { data: rawMessages } = useGetAllBroadcastMessages();
  const addBroadcast = useAddBroadcastMessage();

  const agents = rawAgents ?? [];
  const messages = ((rawMessages ?? []) as BroadcastMessage[]).sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  const [confirmStop, setConfirmStop] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");

  const sendCommand = (agentName: string, cmd: string) => {
    toast.success("Command sent", {
      description: `${cmd} → ${agentName}`,
    });
  };

  const emergencyStop = () => {
    setConfirmStop(false);
    toast.error("Emergency stop issued", {
      description: "All agents ordered to halt immediately.",
    });
  };

  const sendBroadcast = async () => {
    const text = broadcastText.trim();
    if (!text) return;
    try {
      await addBroadcast.mutateAsync({
        id: `bcast-${Date.now()}`,
        sentBy: "operator",
        agentTargets: agents.map((a) => a.id),
        message: text,
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      });
      setBroadcastText("");
      toast.success("Broadcast sent", { description: text.slice(0, 60) });
    } catch {
      toast.error("Broadcast failed");
    }
  };

  return (
    <div className="space-y-5">
      {/* Emergency stop */}
      <div className="flex items-center justify-between p-4 rounded-sm border border-terminal-red/30 bg-terminal-red/5">
        <div>
          <p className="text-xs font-display font-semibold text-terminal-red tracking-wide">
            Emergency Stop
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-0.5">
            Immediately halt all running agents
          </p>
        </div>
        <button
          type="button"
          data-ocid="controls.emergency_stop.button"
          onClick={() => setConfirmStop(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-sm border border-terminal-red/50 bg-terminal-red/10 text-terminal-red text-xs font-mono tracking-wider hover:bg-terminal-red/20 transition-all duration-150"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          STOP ALL
        </button>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {confirmStop && (
          <motion.div
            data-ocid="controls.emergency_stop.dialog"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="p-4 rounded-sm border border-terminal-red/50 bg-terminal-red/10 space-y-3"
          >
            <p className="text-xs font-mono text-terminal-red">
              ⚠ Confirm emergency stop — this will halt ALL agents immediately.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="controls.emergency_stop.confirm_button"
                onClick={emergencyStop}
                className="px-4 py-1.5 rounded-sm border border-terminal-red/60 bg-terminal-red/20 text-terminal-red text-xs font-mono tracking-widest hover:bg-terminal-red/30 transition-colors"
              >
                CONFIRM STOP
              </button>
              <button
                type="button"
                data-ocid="controls.emergency_stop.cancel_button"
                onClick={() => setConfirmStop(false)}
                className="px-4 py-1.5 rounded-sm border border-border text-muted-foreground text-xs font-mono tracking-widest hover:border-primary/30 hover:text-foreground transition-colors"
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-agent controls */}
      {agents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] tracking-widest text-muted-foreground/30 uppercase mb-3">
            Agent Controls
          </p>
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              data-ocid={`controls.agent_item.${i + 1}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-sm border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    (agent.status as string) === "active"
                      ? "bg-primary animate-pulse-slow"
                      : (agent.status as string) === "idle"
                        ? "bg-terminal-amber"
                        : "bg-terminal-gray"
                  }`}
                />
                <span className="text-xs font-mono text-foreground/80 truncate">
                  {agent.name}
                </span>
                <TerminalBadge color="border-border text-muted-foreground/40 bg-transparent">
                  {(agent.status as string).toUpperCase()}
                </TerminalBadge>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <AgentBtn
                  icon={<Play className="w-3 h-3" />}
                  label="Start"
                  color="text-primary border-primary/30 hover:bg-primary/10"
                  onClick={() => sendCommand(agent.name, "START")}
                />
                <AgentBtn
                  icon={<Square className="w-3 h-3" />}
                  label="Stop"
                  color="text-terminal-amber border-terminal-amber/30 hover:bg-terminal-amber/10"
                  onClick={() => sendCommand(agent.name, "STOP")}
                />
                <AgentBtn
                  icon={<RotateCcw className="w-3 h-3" />}
                  label="Restart"
                  color="text-accent border-accent/30 hover:bg-accent/10"
                  onClick={() => sendCommand(agent.name, "RESTART")}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Broadcast panel */}
      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-accent" />
          <p className="text-[9px] tracking-widest text-muted-foreground/40 uppercase">
            Broadcast Message
          </p>
        </div>
        <div className="flex gap-2">
          <input
            data-ocid="broadcast.input"
            type="text"
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendBroadcast()}
            placeholder="Message to all agents..."
            className="flex-1 px-3 py-2 bg-card border border-border rounded-sm text-xs font-mono text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
          />
          <button
            type="button"
            data-ocid="broadcast.submit_button"
            onClick={sendBroadcast}
            disabled={!broadcastText.trim() || addBroadcast.isPending}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-accent/30 bg-accent/5 text-accent text-xs font-mono hover:bg-accent/15 hover:border-accent/60 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addBroadcast.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            SEND
          </button>
        </div>

        {/* Recent broadcasts */}
        {messages.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            <p className="text-[9px] tracking-widest text-muted-foreground/25 uppercase">
              Recent broadcasts
            </p>
            {messages.slice(0, 10).map((msg, i) => (
              <motion.div
                key={msg.id}
                data-ocid={`broadcast.item.${i + 1}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3 px-3 py-2 rounded-sm border border-border/40 bg-card/50 text-[11px] font-mono"
              >
                <span className="text-muted-foreground/30 shrink-0 pt-px">
                  {formatRelativeTime(msg.timestamp)}
                </span>
                <span className="text-accent/60 shrink-0">[{msg.sentBy}]</span>
                <span className="text-foreground/60 flex-1 min-w-0 break-words">
                  {msg.message}
                </span>
                <span className="text-muted-foreground/25 shrink-0 text-[9px]">
                  →{msg.agentTargets.length}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentBtn({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 px-2 py-1 rounded-sm border text-[10px] font-mono tracking-wider transition-all duration-150 ${color}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ── Leaderboard Panel ─────────────────────────────────────────────────────────
function LeaderboardPanel() {
  const {
    data: rawEntries,
    isLoading,
    isError,
  } = useGetAllLeaderboardEntries();
  const [sortKey, setSortKey] = useState<SortKey>("taskCount");

  const entries = (rawEntries ?? []) as LeaderboardEntry[];

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => Number(b[sortKey] - a[sortKey]));
  }, [entries, sortKey]);

  if (isLoading) return <SectionLoading ocid="leaderboard.loading_state" />;
  if (isError) return <SectionError />;
  if (entries.length === 0)
    return (
      <SectionEmpty
        ocid="leaderboard.empty_state"
        message="No leaderboard data. Seed the system to populate."
      />
    );

  return (
    <div className="space-y-3">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Sort by
        </span>
        {(
          [
            ["taskCount", "Tasks"],
            ["creditsUsed", "Credits"],
            ["uptimePercent", "Uptime"],
          ] as [SortKey, string][]
        ).map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => setSortKey(key)}
            className={`px-2.5 py-1 rounded-sm border text-[10px] font-mono tracking-wider transition-all duration-150 ${
              sortKey === key
                ? "bg-primary/10 text-primary border-primary/25"
                : "border-border text-muted-foreground/40 hover:text-foreground hover:border-border/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-sm border border-border overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {["Rank", "Agent", "Tasks", "Credits Used", "Uptime"].map((h) => (
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
            {sorted.map((entry, i) => {
              const displayRank = Number(entry.rank);
              const podium = displayRank <= 3 ? MEDAL[displayRank - 1] : null;
              return (
                <motion.tr
                  key={entry.agentId}
                  data-ocid={`leaderboard.item.${i + 1}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.04 }}
                  className={`border-b border-border/40 transition-colors ${
                    podium
                      ? `${podium.bg} hover:brightness-110`
                      : "hover:bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {podium ? (
                        <span className={`${podium.color} ${podium.glow}`}>
                          {podium.icon}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/30 w-4 text-center">
                          #{displayRank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        podium ? podium.color : "text-foreground/80"
                      }`}
                    >
                      {entry.agentName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`${
                        sortKey === "taskCount"
                          ? "text-primary font-semibold"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {entry.taskCount.toString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`${
                        sortKey === "creditsUsed"
                          ? "text-accent font-semibold"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {entry.creditsUsed.toString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`${
                        sortKey === "uptimePercent"
                          ? "text-primary font-semibold"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {entry.uptimePercent.toString()}%
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function ControlsSection() {
  const { isLoading, isError } = useGetAllAgents();

  if (isLoading) return <SectionLoading ocid="leaderboard.loading_state" />;
  if (isError) return <SectionError />;

  return (
    <div className="space-y-8">
      <section>
        <PanelHeading
          label="Quick Controls &amp; Broadcast"
          sub="agent command interface"
        />
        <ControlsPanel />
      </section>

      <div className="relative">
        <div className="h-px bg-border/40" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-background text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Leaderboard
        </span>
      </div>

      <section>
        <PanelHeading
          label="Community Leaderboard"
          sub="ranked by performance"
        />
        <LeaderboardPanel />
      </section>
    </div>
  );
}
