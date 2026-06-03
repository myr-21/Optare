import { createFileRoute } from "@tanstack/react-router";
import { collections } from "@/lib/mock-data";
import { SectionHeader } from "@/components/ui-bits";
import { Folder, Plus } from "lucide-react";

export const Route = createFileRoute("/app/collections")({ component: Collections });

function Collections() {
  return (
    <div className="space-y-8 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1">Organize your saved content into themed buckets.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition glow-primary">
          <Plus className="w-4 h-4" /> New collection
        </button>
      </div>

      <SectionHeader title="All collections" subtitle={`${collections.length} collections · ${collections.reduce((s, c) => s + c.count, 0)} items`} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg transition group cursor-pointer flex flex-col">
            <div className="h-32 relative bg-gradient-to-br from-muted to-accent border-b border-border/45">
              <div className="absolute inset-0 grid-bg opacity-10" />
              <Folder className="absolute right-5 bottom-5 w-10 h-10 text-muted-foreground/60 group-hover:text-primary transition-colors duration-200" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="font-display font-semibold text-lg text-foreground">{c.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">{c.count} items</span>
                <span className="text-xs text-muted-foreground">Updated today</span>
              </div>
            </div>
          </div>
        ))}
        <button className="rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-accent/40 transition flex flex-col items-center justify-center min-h-[210px] text-muted-foreground hover:text-foreground">
          <Plus className="w-6 h-6 mb-1.5" />
          <span className="text-sm font-medium">Create collection</span>
        </button>
      </div>
    </div>
  );
}
