import { createFileRoute } from "@tanstack/react-router";
import { RecCard } from "@/components/rec-card";
import { SectionHeader, FilterBar } from "@/components/ui-bits";
import { recommendations } from "@/lib/mock-data";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/app/trending")({ component: Trending });

function Trending() {
  const sorted = [...recommendations].sort((a, b) => b.trendingScore - a.trendingScore);
  return (
    <div className="space-y-8 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Trending</h1>
          <p className="text-muted-foreground mt-1">What's rising across YouTube, Reddit, news, and beyond — right now.</p>
        </div>
      </div>
      <FilterBar sources={["YouTube", "Reddit", "News", "Articles", "GitHub"]} />
      <SectionHeader title="Top 12 right now" subtitle="Ranked by cross-platform velocity over the last 4 hours" />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {sorted.map((r) => <RecCard key={r.id} rec={r} />)}
      </div>
    </div>
  );
}
