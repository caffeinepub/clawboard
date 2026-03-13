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

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function mockUsageCount(id: string): number {
  return hashStr(`${id}`) % 501;
}
function mockErrorRate(id: string): number {
  return hashStr(`${id}err`) % 16;
}
function mockLastUsed(id: string): string {
  const hours = hashStr(`${id}lu`) % 168;
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SkillsSection() {
  const { data: rawSkills, isLoading, isError } = useGetAllSkills();
  const { data: rawAgents } = useGetAllAgents();
  const [agentFilter, setAgentFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");

  const agents = rawAgents ?? [];
  const skills = rawSkills ?? [];

  const filtered = useMemo(() => {
    if (agentFilter === "all") return skills;
    return skills.filter((s) => s.agentId === agentFilter);
  }, [skills, agentFilter]);

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? id;

  // Unique skill names for comparison view
  const uniqueSkillNames = useMemo(
    () => [...new Set(skills.map((s) => s.name))],
    [skills],
  );

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

        <div
          data-ocid="skills.view.tab"
          className="flex items-center gap-1 p-0.5 rounded-sm border border-border bg-muted/20"
        >
          {(["grid", "comparison"] as const).map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all ${
                viewMode === v
                  ? "bg-primary/15 text-primary border border-primary/25"
                  : "text-muted-foreground/40 hover:text-foreground border border-transparent"
              }`}
            >
              {v === "grid" ? "Grid" : "Comparison"}
            </button>
          ))}
        </div>

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
      ) : viewMode === "comparison" ? (
        <ComparisonView
          skills={skills}
          agents={agents}
          skillNames={uniqueSkillNames}
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
}: { skill: Skill; agentName: string; index: number }) {
  const usageCount = mockUsageCount(skill.id);
  const errorRate = mockErrorRate(skill.id);
  const lastUsed = mockLastUsed(skill.id);

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
      <div
        className={`absolute top-0 left-0 right-0 h-px ${skill.enabled ? "bg-primary" : "bg-border"}`}
      />

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-display font-semibold text-foreground truncate tracking-wide">
          {skill.name}
        </h3>
        <div
          className={`shrink-0 w-8 h-4 rounded-full border flex items-center transition-colors ${
            skill.enabled
              ? "bg-primary/20 border-primary/40"
              : "bg-muted/40 border-border/50"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full mx-0.5 transition-all ${skill.enabled ? "bg-primary translate-x-4" : "bg-muted-foreground/40 translate-x-0"}`}
          />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/65 leading-relaxed line-clamp-2">
        {skill.description}
      </p>

      {/* Usage stats */}
      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground/35 tracking-widest uppercase">
            Calls
          </span>
          <span className="text-foreground/70">{usageCount}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground/35 tracking-widest uppercase">
            Errors
          </span>
          <span
            className={
              errorRate > 10
                ? "text-terminal-red"
                : errorRate > 5
                  ? "text-terminal-amber"
                  : "text-terminal-green"
            }
          >
            {errorRate}%
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground/35 tracking-widest uppercase">
            Last
          </span>
          <span className="text-muted-foreground/50">{lastUsed}</span>
        </div>
      </div>

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

function ComparisonView({
  skills,
  agents,
  skillNames,
}: {
  skills: Skill[];
  agents: { id: string; name: string }[];
  skillNames: string[];
}) {
  return (
    <div className="rounded-sm border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="px-4 py-2.5 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal sticky left-0 bg-muted/20">
                Skill
              </th>
              {agents.map((a) => (
                <th
                  key={a.id}
                  className="px-4 py-2.5 text-left text-[9px] tracking-widest text-muted-foreground/40 uppercase font-normal whitespace-nowrap"
                >
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {skillNames.map((name, i) => (
              <tr
                key={name}
                data-ocid={`skills.comparison.item.${i + 1}`}
                className="border-b border-border/40 hover:bg-muted/10"
              >
                <td className="px-4 py-2.5 font-semibold text-foreground/80 sticky left-0 bg-card">
                  {name}
                </td>
                {agents.map((a) => {
                  const skill = skills.find(
                    (s) => s.name === name && s.agentId === a.id,
                  );
                  return (
                    <td key={a.id} className="px-4 py-2.5 text-center">
                      {skill ? (
                        <span
                          className={`text-[11px] ${skill.enabled ? "text-terminal-green" : "text-muted-foreground/30"}`}
                        >
                          {skill.enabled ? "✓" : "◦"}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/20">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
