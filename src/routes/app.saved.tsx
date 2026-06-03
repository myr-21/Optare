import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RecCard } from "@/components/rec-card";
import { SectionHeader, EmptyState } from "@/components/ui-bits";
import { recommendations, collections } from "@/lib/mock-data";
import { Bookmark, Clock, Play, Star, Folder, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/saved")({ component: Saved });

const tabs = [
  { id: "all", label: "All saved", icon: Bookmark },
  { id: "watch", label: "Watch Later", icon: Play },
  { id: "read", label: "Read Later", icon: Clock },
  { id: "fav", label: "Favorites", icon: Star },
  { id: "col", label: "Collections", icon: Folder },
];

function Saved() {
  const [tab, setTab] = useState("all");
  return (
    <div className="space-y-8 max-w-[1600px]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Saved</h1>
        <p className="text-muted-foreground mt-1">Everything you've bookmarked, organized.</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface border border-border rounded-lg w-fit overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition inline-flex items-center gap-1.5",
              tab === id ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "col" ? (
        <div>
          <SectionHeader
            title="Your collections"
            action={
              <button className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition">
                <Plus className="w-3.5 h-3.5" /> New collection
              </button>
            }
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition group">
                <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${c.color}, color-mix(in oklab, ${c.color} 30%, transparent))` }}>
                  <Folder className="absolute right-4 bottom-4 w-8 h-8 text-white/70" />
                </div>
                <div className="p-4">
                  <div className="font-display font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.count} items</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="Nothing saved yet"
          desc="Save items from your feed to read later, build collections, and never lose track."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {recommendations.slice(0, 8).map((r) => <RecCard key={r.id} rec={r} />)}
        </div>
      )}
    </div>
  );
}
