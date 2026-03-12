import { Loader2, ServerCrash } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export function formatRelativeTime(timestamp: bigint): string {
  const now = Date.now();
  const ts = Number(timestamp) / 1_000_000;
  const diff = now - ts;
  if (diff < 0) {
    const futureDiff = -diff;
    if (futureDiff < 60_000) return "in <1m";
    if (futureDiff < 3_600_000) return `in ${Math.floor(futureDiff / 60_000)}m`;
    if (futureDiff < 86_400_000)
      return `in ${Math.floor(futureDiff / 3_600_000)}h`;
    return `in ${Math.floor(futureDiff / 86_400_000)}d`;
  }
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function SectionLoading({ ocid }: { ocid: string }) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground"
    >
      <Loader2 className="w-7 h-7 animate-spin text-primary" />
      <p className="text-[10px] tracking-widest uppercase">Loading data...</p>
    </div>
  );
}

export function SectionError() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-destructive">
      <ServerCrash className="w-7 h-7" />
      <p className="text-[10px] tracking-widest uppercase">
        Failed to load data
      </p>
    </div>
  );
}

export function SectionEmpty({
  ocid,
  message,
}: {
  ocid: string;
  message?: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground/40"
    >
      <div className="text-[10px] tracking-widest uppercase">
        {message ?? "No data found. Click SEED DATA to initialize."}
      </div>
    </div>
  );
}

export function SectionHeader({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-wrap items-center gap-3 mb-5"
    >
      {children}
    </motion.div>
  );
}

export function TerminalBadge({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-sm border text-[10px] font-bold tracking-widest font-mono ${
        color ?? "border-border text-muted-foreground bg-muted/30"
      }`}
    >
      {children}
    </span>
  );
}
