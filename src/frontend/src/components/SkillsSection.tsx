import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useGetAllAgents, useGetAllSkills } from "../hooks/useQueries";
import {
  SectionEmpty,
  SectionError,
  SectionHeader,
  SectionLoading,
  TerminalBadge,
} from "./SectionShell";

export function SkillsSection() {
  const { data: rawSkills, isLoading, isError } = useGetAllSkills();
  const { data: rawAgents } = useGetAllAgents();
  const [agentFilter, setAgentFilter] = useState("all");

  const agents = rawAgents ?? [];
  const skills = rawSkills ?? [];

  const filtered = useMemo(() => {
    if (agentFilter === "all") return skills;
    return skills.filter((s) => s.agentId === agentFilter);
  }, [skills, agentFilter]);

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  if (isLoading) return <SectionLoading ocid="skills.loading_state" />;
  if (isError) return <SectionError />;

  return (
    <div className="space-y-4">
      <SectionHeader>
        <select
          data-ocid="skills.agent_filter.select"
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

        <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground/40 tracking-widest">
          <span>
            <span className="text-primary">
              {filtered.filter((s) => s.enabled).length}
            </span>{" "}
            enabled
          </span>
          <span>
            <span className="text-muted-foreground/50">
              {filtered.filter((s) => !s.enabled).length}
            </span>{" "}
            disabled
          </span>
        </div>
      </SectionHeader>

      {skills.length === 0 ? (
        <SectionEmpty
          ocid="skills.empty_state"
          message="No skills found. Seed the system to populate."
        />
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[10px] text-muted-foreground/40 tracking-widest uppercase">
          No skills for this agent
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((skill, i) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              agentName={agentName(skill.agentId)}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type Skill = {
  id: string;
  name: string;
  description: string;
  agentId: string;
  version: string;
  enabled: boolean;
};

function SkillCard({
  skill,
  agentName,
  index,
}: {
  skill: Skill;
  agentName: string;
  index: number;
}) {
  return (
    <motion.div
      data-ocid={`skills.item.${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative flex flex-col gap-3 p-4 rounded-sm border bg-card transition-all duration-200 overflow-hidden ${
        skill.enabled
          ? "border-primary/30 shadow-glow-green hover:border-primary/50"
          : "border-border/50 opacity-60 hover:opacity-80"
      }`}
    >
      {/* Enabled/disabled indicator strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-px ${
          skill.enabled ? "bg-primary" : "bg-border"
        }`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-display font-semibold text-foreground truncate tracking-wide">
          {skill.name}
        </h3>
        {/* Toggle visual */}
        <div
          className={`shrink-0 w-8 h-4 rounded-full border flex items-center transition-colors ${
            skill.enabled
              ? "bg-primary/20 border-primary/40"
              : "bg-muted/40 border-border/50"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full mx-0.5 transition-all ${
              skill.enabled
                ? "bg-primary translate-x-4"
                : "bg-muted-foreground/40 translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-muted-foreground/65 leading-relaxed line-clamp-2">
        {skill.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 mt-auto">
        <span className="text-[9px] tracking-widest text-muted-foreground/35 uppercase truncate">
          {agentName}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <TerminalBadge color="border-accent/30 text-accent/70 bg-accent/5">
            v{skill.version}
          </TerminalBadge>
          <TerminalBadge
            color={
              skill.enabled
                ? "border-primary/30 text-primary bg-primary/5"
                : "border-border text-muted-foreground/40 bg-transparent"
            }
          >
            {skill.enabled ? "ON" : "OFF"}
          </TerminalBadge>
        </div>
      </div>
    </motion.div>
  );
}
