import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useGetAllAgents, useGetAllBrainEntries } from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionHeader,
  SectionLoading,
  TerminalBadge,
} from "./SectionShell";

const CATEGORY_COLORS: Record<string, string> = {
  memory: "border-primary/40 text-primary bg-primary/10",
  knowledge: "border-accent/40 text-accent bg-accent/10",
  context: "border-terminal-amber/40 text-terminal-amber bg-terminal-amber/10",
  config: "border-terminal-red/40 text-terminal-red bg-terminal-red/10",
  state: "border-purple-400/40 text-purple-400 bg-purple-400/10",
  task: "border-sky-400/40 text-sky-400 bg-sky-400/10",
};

function getCategoryColor(cat: string) {
  return (
    CATEGORY_COLORS[cat.toLowerCase()] ??
    "border-border text-muted-foreground bg-muted/30"
  );
}

export function BrainSection() {
  const { data: rawEntries, isLoading, isError } = useGetAllBrainEntries();
  const { data: rawAgents } = useGetAllAgents();
  const [agentFilter, setAgentFilter] = useState("all");
  const [search, setSearch] = useState("");

  const agents = rawAgents ?? [];
  const entries = rawEntries ?? [];

  const filtered = useMemo(() => {
    let result = entries;
    if (agentFilter !== "all") {
      result = result.filter((e) => e.agentId === agentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.key.toLowerCase().includes(q) ||
          e.value.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q),
      );
    }
    return result;
  }, [entries, agentFilter, search]);

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  if (isLoading) return <SectionLoading ocid="brain.loading_state" />;
  if (isError) return <SectionError />;

  return (
    <div className="space-y-4">
      <SectionHeader>
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
          <input
            data-ocid="brain.search_input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keys, values..."
            className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-sm text-xs font-mono text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>

        {/* Agent filter */}
        <select
          data-ocid="brain.agent_filter.select"
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

        <div className="ml-auto flex items-center gap-2 text-[10px] text-muted-foreground/40 tracking-widest">
          <span className="text-primary">{filtered.length}</span> entries
        </div>
      </SectionHeader>

      {entries.length === 0 ? (
        <SectionEmpty
          ocid="brain.empty_state"
          message="No brain entries found. Seed the system to populate."
        />
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[10px] text-muted-foreground/40 tracking-widest uppercase">
          No entries match your filter
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              data-ocid={`brain.item.${i + 1}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="relative flex flex-col gap-2 p-3.5 rounded-sm border border-border bg-card hover:border-primary/30 hover:bg-card/80 transition-all duration-150 group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-primary/90 font-semibold truncate">
                  {entry.key}
                </span>
                <TerminalBadge color={getCategoryColor(entry.category)}>
                  {entry.category.toUpperCase()}
                </TerminalBadge>
              </div>

              {/* Value */}
              <p className="text-[11px] text-muted-foreground/70 font-mono leading-relaxed line-clamp-2">
                {entry.value}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-[9px] tracking-widest text-muted-foreground/35 uppercase">
                  {agentName(entry.agentId)}
                </span>
                <span className="text-[9px] text-muted-foreground/25 font-mono">
                  {entry.id.slice(0, 8)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
