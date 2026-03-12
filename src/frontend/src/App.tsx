import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Activity,
  Bot,
  Brain,
  Clock,
  CreditCard,
  Gamepad2,
  Loader2,
  Menu,
  Moon,
  Plug,
  Shield,
  Sun,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ActivitySection } from "./components/ActivitySection";
import { AgentsSection } from "./components/AgentsSection";
import { BrainSection } from "./components/BrainSection";
import { ConnectAgentSection } from "./components/ConnectAgentSection";
import { ControlsSection } from "./components/ControlsSection";
import { CreditsSection } from "./components/CreditsSection";
import { CronSection } from "./components/CronSection";
import { SecuritySection } from "./components/SecuritySection";
import { SkillsSection } from "./components/SkillsSection";
import { useSeedData } from "./hooks/useQueries";
import { useTheme } from "./hooks/useTheme";

const queryClient = new QueryClient();

type Section =
  | "agents"
  | "brain"
  | "skills"
  | "cron"
  | "credits"
  | "activity"
  | "security"
  | "connect"
  | "controls";

const NAV_ITEMS: {
  id: Section;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}[] = [
  {
    id: "agents",
    label: "Agents",
    icon: <Bot className="w-4 h-4" />,
    ocid: "nav.agents.link",
  },
  {
    id: "brain",
    label: "Brain",
    icon: <Brain className="w-4 h-4" />,
    ocid: "nav.brain.link",
  },
  {
    id: "skills",
    label: "Skills",
    icon: <Wrench className="w-4 h-4" />,
    ocid: "nav.skills.link",
  },
  {
    id: "cron",
    label: "Cron Jobs",
    icon: <Clock className="w-4 h-4" />,
    ocid: "nav.cron.link",
  },
  {
    id: "credits",
    label: "Credits & Providers",
    icon: <CreditCard className="w-4 h-4" />,
    ocid: "nav.credits.link",
  },
  {
    id: "activity",
    label: "Activity Feed",
    icon: <Activity className="w-4 h-4" />,
    ocid: "nav.activity.link",
  },
  {
    id: "security",
    label: "Security & Config",
    icon: <Shield className="w-4 h-4" />,
    ocid: "nav.security.link",
  },
  {
    id: "connect",
    label: "Connect Agent",
    icon: <Plug className="w-4 h-4" />,
    ocid: "nav.connect.link",
  },
  {
    id: "controls",
    label: "Controls & Leaderboard",
    icon: <Gamepad2 className="w-4 h-4" />,
    ocid: "nav.controls.link",
  },
];

const SECTION_LABELS: Record<Section, string> = {
  agents: "Agent Overview",
  brain: "Brain Viewer",
  skills: "Skills Browser",
  cron: "Cron Job Scheduler",
  credits: "Credits & Providers",
  activity: "Activity Feed",
  security: "Security & Config",
  connect: "Connect Agent",
  controls: "Controls & Leaderboard",
};

function AppShell() {
  const [active, setActive] = useState<Section>("agents");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const seedMutation = useSeedData();
  const { theme, toggleTheme } = useTheme();

  const handleSeed = async () => {
    try {
      await seedMutation.mutateAsync();
      toast.success("System initialized", {
        description: "Sample agent data loaded successfully.",
      });
    } catch {
      toast.error("Seed failed", {
        description: "Could not initialize system data.",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border h-screen">
        <SidebarContent
          active={active}
          setActive={setActive}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>

      {/* Sidebar — mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            className="fixed left-0 top-0 bottom-0 z-30 w-60 flex flex-col bg-sidebar border-r border-sidebar-border lg:hidden"
          >
            <SidebarContent
              active={active}
              setActive={setActive}
              setSidebarOpen={setSidebarOpen}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/60 bg-background/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest text-muted-foreground/40 uppercase hidden sm:block">
                {"//"}
              </span>
              <h1 className="text-sm font-display font-semibold text-foreground tracking-wide">
                {SECTION_LABELS[active]}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              data-ocid="header.theme_toggle"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border/50 bg-muted/30 text-muted-foreground text-xs font-mono tracking-wider hover:bg-muted/60 hover:text-foreground hover:border-border transition-all duration-150"
            >
              <motion.span
                key={theme}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? (
                  <Sun className="w-3 h-3" />
                ) : (
                  <Moon className="w-3 h-3" />
                )}
              </motion.span>
              <span className="hidden sm:inline">
                {theme === "dark" ? "LIGHT" : "DARK"}
              </span>
            </button>

            {/* Seed data */}
            <button
              type="button"
              data-ocid="header.seed_button"
              onClick={handleSeed}
              disabled={seedMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-accent/30 bg-accent/5 text-accent text-xs font-mono tracking-wider hover:bg-accent/15 hover:border-accent/60 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seedMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              SEED DATA
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {active === "agents" && <AgentsSection />}
              {active === "brain" && <BrainSection />}
              {active === "skills" && <SkillsSection />}
              {active === "cron" && <CronSection />}
              {active === "credits" && <CreditsSection />}
              {active === "activity" && <ActivitySection />}
              {active === "security" && <SecuritySection />}
              {active === "connect" && <ConnectAgentSection />}
              {active === "controls" && <ControlsSection />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="shrink-0 px-4 py-2 border-t border-border/30 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/30 tracking-widest">
            CLAWBOARD v1.0.0
          </span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors tracking-wide"
          >
            &copy; {new Date().getFullYear()} Built with &hearts; using
            caffeine.ai
          </a>
        </footer>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-card border border-border font-mono text-xs",
            title: "text-foreground",
            description: "text-muted-foreground",
          },
        }}
      />
    </div>
  );
}

function SidebarContent({
  active,
  setActive,
  setSidebarOpen,
}: {
  active: Section;
  setActive: (s: Section) => void;
  setSidebarOpen: (v: boolean) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 flex items-center justify-center rounded-sm bg-primary/10 border border-primary/30">
            <Bot className="w-4 h-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
          </div>
          <span className="font-display font-bold text-base text-foreground tracking-widest text-glow-blue">
            ClawBoard
          </span>
        </div>
        <button
          type="button"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-2 border-b border-sidebar-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-slow" />
          System Online
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        <p className="px-2 mb-2 text-[9px] tracking-widest text-muted-foreground/30 uppercase">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={item.ocid}
              onClick={() => {
                setActive(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-mono tracking-wide transition-all duration-150 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent border border-transparent"
              }`}
            >
              <span
                className={
                  isActive ? "text-primary" : "text-muted-foreground/40"
                }
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1 h-4 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border/50">
        <div className="text-[9px] text-muted-foreground/25 tracking-widest space-y-0.5">
          <div className="flex justify-between">
            <span>NODE</span>
            <span className="text-primary/40">ICP-MAINNET</span>
          </div>
          <div className="flex justify-between">
            <span>CANISTER</span>
            <span className="text-accent/40">OPENCLAW</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}
