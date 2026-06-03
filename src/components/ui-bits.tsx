import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Filter, ChevronDown } from "lucide-react";

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function FilterBar({ 
  sources, 
  active: propActive, 
  onChange 
}: { 
  sources: string[]; 
  active?: string; 
  onChange?: (val: string) => void; 
}) {
  const [internalActive, setInternalActive] = useState("All");
  const active = propActive !== undefined ? propActive : internalActive;
  const setActive = (val: string) => {
    if (propActive === undefined) {
      setInternalActive(val);
    }
    if (onChange) {
      onChange(val);
    }
  };
  const opts = ["All", ...sources];
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg">
        {opts.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition",
              active === s
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <button className="ml-auto h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-surface border border-border hover:bg-accent text-xs font-medium transition">
        <Filter className="w-3.5 h-3.5" /> Filters <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function StatCard({ label, value, delta, icon }: { label: string; value: string; delta?: string; icon?: ReactNode }) {
  const positive = delta?.startsWith("+");
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold tracking-tight">{value}</span>
        {delta && (
          <span className={cn("text-xs font-medium", positive ? "text-primary" : "text-destructive")}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, desc, action }: { icon: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-2xl py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent mx-auto flex items-center justify-center text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">{desc}</p>
      {action}
    </div>
  );
}
