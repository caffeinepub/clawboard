import { Bot, Loader2, Plug, ServerCrash } from "lucide-react";
import { motion } from "motion/react";
import type { Agent as BackendAgent } from "../backend";
import { useGetAllAgents } from "../hooks/useQueries";
import { AgentCard } from "./AgentCard";

interface AgentsSectionProps {
  setActive: (
    s:
      | "agents"
      | "brain"
      | "skills"
      | "cron"
      | "credits"
      | "activity"
      | "security"
      | "connect"
      | "controls",
  ) => void;
}

export function AgentsSection({ setActive }: AgentsSectionProps) {
  const { data, isLoading, isError } = useGetAllAgents();
  const agents: BackendAgent[] = data ?? [];

  if (isLoading) {
    return (
      <div
        data-ocid="agents.loading_state"
        className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs tracking-widest uppercase">
          Initializing agent matrix...
        </p>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-4 bg-primary/40 rounded-full"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.8,
                delay: i * 0.12,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-destructive">
        <ServerCrash className="w-8 h-8" />
        <p className="text-xs tracking-widest uppercase">
          Failed to load agent data
        </p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div
        data-ocid="agents.empty_state"
        className="flex flex-col items-center justify-center gap-5 py-24"
      >
        <div className="relative">
          <Bot className="w-14 h-14 text-muted-foreground/20" />
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-mono font-semibold text-foreground/70 tracking-wide">
            No agents connected yet
          </p>
          <p className="text-xs font-mono text-muted-foreground/50">
            Add the ClawBoard skill to your agent to get started
          </p>
        </div>
        <button
          type="button"
          data-ocid="agents.connect.button"
          onClick={() => setActive("connect")}
          className="flex items-center gap-2 px-4 py-2 rounded-sm border border-primary/30 bg-primary/10 text-primary text-xs font-mono tracking-wide hover:bg-primary/20 hover:border-primary/50 transition-all duration-150"
        >
          <Plug className="w-3.5 h-3.5" />
          Go to Connect Agent
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground/50 tracking-widest uppercase">
            Agents online
          </span>
          <span className="px-1.5 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-wider">
            {agents.filter((a) => a.status === "active").length} /{" "}
            {agents.length}
          </span>
        </div>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
