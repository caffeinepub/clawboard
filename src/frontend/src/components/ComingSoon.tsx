import { Construction } from "lucide-react";
import { motion } from "motion/react";

export function ComingSoon({ section }: { section: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-4 py-32"
    >
      <div className="relative">
        <Construction className="w-10 h-10 text-accent/40" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent/60 animate-pulse-slow" />
      </div>
      <p className="text-sm font-mono text-muted-foreground/50 tracking-wide">
        <span className="text-accent/60">[</span>
        {section}
        <span className="text-accent/60">]</span>
      </p>
      <p className="text-[10px] tracking-widest text-muted-foreground/30 uppercase">
        Module initializing — coming next
      </p>
    </motion.div>
  );
}
