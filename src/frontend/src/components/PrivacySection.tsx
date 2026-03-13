import {
  Github,
  Lock,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShieldX,
  Unlock,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

function PanelCard({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-sm border border-border/50 bg-card/60 p-5 space-y-3 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  icon,
  label,
  accent = false,
}: { icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={accent ? "text-destructive" : "text-primary"}>
        {icon}
      </span>
      <h3
        className={`text-xs font-display font-semibold tracking-widest uppercase ${
          accent ? "text-destructive/80" : "text-foreground/70"
        }`}
      >
        {label}
      </h3>
      <div className="flex-1 h-px bg-border/30" />
    </div>
  );
}

function BulletItem({
  children,
  accent = false,
}: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${
          accent ? "bg-destructive" : "bg-primary/60"
        }`}
      />
      <span
        className={`text-[11px] font-mono leading-relaxed ${
          accent ? "text-destructive/70" : "text-foreground/65"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

export function PrivacySection({
  onNavigateToSecurity,
}: {
  onNavigateToSecurity?: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-sm border border-primary/30 bg-primary/10">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-display font-bold tracking-widest text-foreground text-glow-blue">
            Privacy & Trust
          </h1>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed pl-11">
          ClawBoard is built around the principle that your agents&apos; data
          belongs to you — not us.
        </p>
      </motion.div>

      {/* Section 1 — What we can see */}
      <PanelCard>
        <SectionHeading
          icon={<ShieldCheck className="w-3.5 h-3.5" />}
          label="What ClawBoard Can See"
        />
        <div className="space-y-2">
          <BulletItem>
            Agent status (active / idle / offline / error)
          </BulletItem>
          <BulletItem>Agent logs and recent activity</BulletItem>
          <BulletItem>Skill names and execution results</BulletItem>
          <BulletItem>Credit usage per provider</BulletItem>
          <BulletItem>Cron job schedules and run history</BulletItem>
          <BulletItem>
            MD file contents sent by the reporter skill (IDENTITY.md, SOUL.md,
            MEMORY.md)
          </BulletItem>
        </div>
      </PanelCard>

      {/* Section 2 — What we never see */}
      <PanelCard className="border-destructive/20 bg-destructive/5">
        <SectionHeading
          icon={<ShieldX className="w-3.5 h-3.5" />}
          label="What ClawBoard Never Sees or Stores"
          accent
        />
        <div className="space-y-2">
          <BulletItem accent>Private keys or wallet seed phrases</BulletItem>
          <BulletItem accent>Passwords or SSH credentials</BulletItem>
          <BulletItem accent>
            Any data your agent doesn&apos;t explicitly include in the reporter
            skill payload
          </BulletItem>
          <BulletItem accent>
            System files, environment variables, or host configuration outside
            of what&apos;s documented
          </BulletItem>
        </div>
        <p className="text-[10px] font-mono text-destructive/50 mt-2 pt-2 border-t border-destructive/20">
          The reporter skill is the boundary. Only what&apos;s in the skill file
          gets sent.
        </p>
      </PanelCard>

      {/* Section 3 — Who can access */}
      <PanelCard>
        <SectionHeading
          icon={<Lock className="w-3.5 h-3.5" />}
          label="Who Can Access Your Data"
        />
        <p className="text-[11px] font-mono text-foreground/60 leading-relaxed">
          Only accounts authenticated with your API token. No ClawBoard
          employee, admin, or third party can access your agent data. Each token
          is unique to your account and gates all data reads and writes.
        </p>
      </PanelCard>

      {/* Section 4 — Cut access instantly */}
      <PanelCard>
        <SectionHeading
          icon={<ShieldOff className="w-3.5 h-3.5" />}
          label="How to Cut Access Instantly"
        />
        <p className="text-[11px] font-mono text-foreground/60 leading-relaxed">
          Go to <span className="text-primary">Security &amp; Config</span>,
          revoke your API token. Your agent goes dark immediately — no more data
          can be sent or received. Any agent still running the old token will be
          silently rejected on its next ping.
        </p>
        {onNavigateToSecurity && (
          <button
            type="button"
            data-ocid="privacy.security.button"
            onClick={onNavigateToSecurity}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-primary/30 bg-primary/5 text-xs font-mono text-primary hover:bg-primary/15 hover:border-primary/50 transition-all duration-150"
          >
            <Shield className="w-3 h-3" />
            Go to Security &amp; Config
          </button>
        )}
      </PanelCard>

      {/* Section 5 — Open source reporter */}
      <PanelCard>
        <SectionHeading
          icon={<Unlock className="w-3.5 h-3.5" />}
          label="Is the Reporter Skill Open Source?"
        />
        <p className="text-[11px] font-mono text-foreground/60 leading-relaxed">
          Yes. The{" "}
          <code className="text-primary/80 bg-primary/10 px-1 py-0.5 rounded-sm">
            clawboard-reporter.md
          </code>{" "}
          skill file is fully readable before you install it. Every line that
          gets collected and sent is visible in the file you copy. No hidden
          logic, no telemetry beyond what&apos;s documented.
        </p>
      </PanelCard>

      {/* Section 6 — Self-host */}
      <PanelCard>
        <SectionHeading
          icon={<Zap className="w-3.5 h-3.5" />}
          label="Self-Host for Full Data Sovereignty"
        />
        <p className="text-[11px] font-mono text-foreground/60 leading-relaxed">
          Teams that require complete data sovereignty can self-host ClawBoard
          on their own infrastructure. All agent data stays within your
          environment — no data leaves your servers.
        </p>
        <button
          type="button"
          data-ocid="privacy.github.link"
          className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/50 bg-muted/20 text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
        >
          <Github className="w-3.5 h-3.5" />
          View on GitHub
        </button>
      </PanelCard>
    </div>
  );
}
