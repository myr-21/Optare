import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { RecCard } from "@/components/rec-card";
import { SectionHeader, EmptyState } from "@/components/ui-bits";
import { getBookmarks, getBookmarkCollections } from "@/lib/api";
import { Bookmark, Clock, Play, Star, Folder, Plus, RefreshCw, AlertCircle } from "lucide-react";
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
  const [items, setItems] = useState<any[]>([]);
  const [collectionsList, setCollectionsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  useEffect(() => {
    loadSavedData();
  }, [tab, selectedCollection]);

  const loadSavedData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "col") {
        if (selectedCollection) {
          const res = await getBookmarks("BOOKMARK", selectedCollection);
          setItems(res.content || []);
        } else {
          const cols = await getBookmarkCollections();
          setCollectionsList(cols);
        }
      } else {
        let typeParam = "BOOKMARK";
        if (tab === "watch") typeParam = "WATCH_LATER";
        if (tab === "read") typeParam = "READ_LATER";
        if (tab === "fav") typeParam = "FAVORITE";

        const res = await getBookmarks(typeParam);
        setItems(res.content || []);
      }
    } catch (err: any) {
      console.error("Error loading saved data:", err);
      setError(err.message || "Failed to load saved items.");
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => {
              setTab(id);
              setSelectedCollection(null);
            }}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition inline-flex items-center gap-1.5",
              tab === id ? "bg-card text-foreground border border-border shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-fade-in">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl aspect-[16/10] animate-pulse" style={{ backgroundColor: "oklch(0.2 0.02 0)" }} />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center bg-card border border-border rounded-xl animate-fade-in">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <div className="font-semibold text-foreground">Failed to load saved items</div>
          <div className="text-xs text-muted-foreground mt-1 mb-4">{error}</div>
          <button 
            onClick={loadSavedData}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : tab === "col" ? (
        selectedCollection ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setSelectedCollection(null)}
                className="text-xs bg-surface border border-border rounded-md px-3 py-1.5 hover:bg-accent transition cursor-pointer"
              >
                ← Back to Collections
              </button>
              <h2 className="text-lg font-semibold">Collection: {selectedCollection}</h2>
            </div>
            {items.length === 0 ? (
              <EmptyState
                icon={<Bookmark className="w-6 h-6" />}
                title="No items in this collection"
                desc="Bookmark items and add them to this collection to organize them here."
              />
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-fade-in">
                {items.map((r) => <RecCard key={r.id} rec={r} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <SectionHeader title="Your collections" />
            {collectionsList.length === 0 ? (
              <EmptyState
                icon={<Folder className="w-6 h-6" />}
                title="No collections yet"
                desc="Create custom collections by selecting the bookmark option on content cards."
              />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                    <button
                      key={c}
                      onClick={() => setSelectedCollection(c)}
                      className="text-left w-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition group cursor-pointer"
                    >
                      <div className="h-28 relative bg-gradient-to-br from-muted to-accent border-b border-border/45">
                        <Folder className="absolute right-4 bottom-4 w-8 h-8 text-muted-foreground/60 group-hover:text-primary transition-colors duration-200" />
                      </div>
                      <div className="p-4">
                        <div className="font-display font-semibold text-sidebar-foreground">{c}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Click to open collection</div>
                      </div>
                    </button>
              </div>
            )}
          </div>
        )
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="Nothing saved yet"
          desc="Save items from your feed to read later, build collections, and never lose track."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-fade-in">
          {items.map((r) => <RecCard key={r.id} rec={r} />)}
        </div>
      )}
    </div>
  );
}
