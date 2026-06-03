import { createFileRoute } from "@tanstack/react-router";
import { StatCard, SectionHeader } from "@/components/ui-bits";
import { Activity, AlertTriangle, BarChart3, Clock, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/analytics")({ component: Analytics });

const consumption = [
  { label: "AI Research", v: 38, c: "var(--chart-1)" },
  { label: "Engineering", v: 24, c: "var(--chart-2)" },
  { label: "Design", v: 14, c: "var(--chart-3)" },
  { label: "Startups", v: 12, c: "var(--chart-4)" },
  { label: "Other", v: 12, c: "var(--chart-5)" },
];

const platformDist = [
  { label: "YouTube", v: 32 },
  { label: "Articles", v: 28 },
  { label: "Reddit", v: 18 },
  { label: "News", v: 14 },
  { label: "GitHub", v: 8 },
];

const weekly = [22, 31, 28, 42, 38, 35, 47];
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function Analytics() {
  const maxW = Math.max(...weekly);
  return (
    <div className="space-y-10 max-w-[1600px]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Understand your information diet. Be intentional about it.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Items consumed" value="247" delta="+18%" icon={<Activity className="w-4 h-4" />} />
        <StatCard label="Time spent" value="9h 32m" delta="+1h" icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Diversity score" value="82" delta="+6" icon={<Shield className="w-4 h-4" />} />
        <StatCard label="Recommendation quality" value="91%" delta="+3%" icon={<Sparkles className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <SectionHeader title="Weekly activity" subtitle="Items consumed across all platforms" />
          <div className="flex items-end gap-3 h-48">
            {weekly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition">{v}</div>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary group-hover:from-primary/40 transition"
                  style={{ height: `${(v / maxW) * 100}%` }}
                />
                <div className="text-xs text-muted-foreground">{days[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Consumption by category */}
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionHeader title="By category" />
          <div className="space-y-3">
            {consumption.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{r.v}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform distribution donut */}
        <div className="bg-card border border-border rounded-xl p-6">
          <SectionHeader title="Platform distribution" />
          <div className="flex items-center justify-center py-4">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {platformDist.reduce<{ acc: number; el: React.ReactElement[] }>((s, p, i) => {
                  const dash = (p.v / 100) * 100;
                  const dashArr = `${dash} ${100 - dash}`;
                  const offset = -s.acc;
                  s.el.push(
                    <circle key={p.label} cx="18" cy="18" r="15.9" fill="transparent"
                      stroke={`var(--chart-${(i % 5) + 1})`} strokeWidth="3.5"
                      strokeDasharray={dashArr} strokeDashoffset={offset} pathLength="100" />
                  );
                  s.acc += dash;
                  return s;
                }, { acc: 0, el: [] }).el}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-display text-2xl font-semibold">5</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">sources</div>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            {platformDist.map((p, i) => (
              <div key={p.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: `var(--chart-${(i % 5) + 1})` }} />
                  <span>{p.label}</span>
                </div>
                <span className="font-medium">{p.v}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Echo chamber alert */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-chart-3/10 border border-chart-3/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" style={{ color: "var(--chart-3)" }} />
            </div>
            <div>
              <h3 className="font-display font-semibold">Echo chamber check</h3>
              <p className="text-sm text-muted-foreground mt-1">62% of your AI Research consumption came from 3 creators this week. Consider diversifying.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { name: "Lex Fridman", v: 28 },
              { name: "Two Minute Papers", v: 19 },
              { name: "Yannic Kilcher", v: 15 },
            ].map((c) => (
              <div key={c.name} className="p-3 bg-surface border border-border rounded-lg">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.v}% of category</div>
              </div>
            ))}
          </div>
          <button className="mt-5 text-xs font-medium text-primary hover:underline">
            Show me counter-perspectives →
          </button>
        </div>
      </div>

      {/* Interest trends */}
      <div className="bg-card border border-border rounded-xl p-6">
        <SectionHeader title="Interest trends" subtitle="How your topic mix has shifted over the last 6 weeks" />
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 42 }).map((_, i) => {
            const h = 30 + Math.sin(i * 0.5) * 25 + Math.cos(i * 0.3) * 20 + 30;
            return (
              <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-primary/20 to-primary/50 hover:from-primary/40 hover:to-primary transition" style={{ height: `${h}%` }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
