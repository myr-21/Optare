import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RecCard, RecCardSkeleton } from "@/components/rec-card";
import { SectionHeader } from "@/components/ui-bits";
import { sourceMeta, type SourceType } from "@/lib/mock-data";
import { Hash, Bookmark, ExternalLink, Play, BookOpen, MessageSquare, Newspaper } from "lucide-react";
import { useState, useEffect } from "react";
import { searchContent, type SearchResponse, recordInteraction, removeInteraction, getInterestCategories } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/discover")({
  component: Discover,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
    };
  },
});



function Discover() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    getInterestCategories()
      .then(setCategories)
      .catch((err) => console.error("Failed to load interest categories in discover:", err));
  }, []);

  useEffect(() => {
    if (q && q.trim()) {
      executeSearch(q);
    } else {
      setResults(null);
    }
  }, [q]);

  const executeSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const searchData = await searchContent(searchQuery);
      setResults(searchData);
    } catch (err) {
      console.error("Search failed:", err);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: string) => {
    navigate({ search: { q: topic } });
  };

  return (
    <div className="space-y-10 max-w-[1600px]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Discover</h1>
        <p className="text-muted-foreground mt-1">Explore topics, platforms, and trending categories.</p>
      </div>

      {loading && (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground animate-pulse">Searching the database...</div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <RecCardSkeleton key={n} />
            ))}
          </div>
        </div>
      )}

      {!loading && results && (
        <div className="space-y-8 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-medium text-foreground">
              Search Results for <span className="text-primary font-semibold">"{results.query}"</span>
            </h2>
            <span className="text-xs text-muted-foreground">{results.totalResults} items found</span>
          </div>

          {results.totalResults === 0 ? (
            <div className="text-center py-12 bg-card border border-border border-dashed rounded-xl">
              <p className="text-sm text-muted-foreground">No matches found in the search index.</p>
              <button 
                type="button" 
                onClick={() => { navigate({ search: { q: "" } }); }}
                className="mt-3 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            Object.entries(results.groups).map(([group, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <section key={group} className="space-y-3">
                  <SectionHeader 
                    title={group === "VIDEO" ? "Videos" : group === "DISCUSSION" ? "Discussions" : "Articles"} 
                    subtitle={`Recent matching ${group.toLowerCase()} items`}
                  />
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {items.map((item) => (
                      <RecCard 
                        key={item.id} 
                        rec={item}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      )}

      {!loading && !results && (
        <section>
          <SectionHeader title="Browse all topics" subtitle="Explore indexed content by backend category tags" />
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button 
                key={c} 
                onClick={() => handleTopicClick(c)}
                className="px-3 py-1.5 rounded-full bg-card border border-border hover:bg-accent hover:border-primary/30 transition text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Hash className="w-3.5 h-3.5 text-muted-foreground" /> {c}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
