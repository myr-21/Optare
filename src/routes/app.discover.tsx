import { createFileRoute } from "@tanstack/react-router";
import { RecCard } from "@/components/rec-card";
import { SectionHeader } from "@/components/ui-bits";
import { recommendations, trendingTopics, interestCategories } from "@/lib/mock-data";
import { Search, TrendingUp, Hash } from "lucide-react";
import { useState } from "react";
import { searchContent, type SearchResponse } from "@/lib/api";

export const Route = createFileRoute("/app/discover")({ component: Discover });

function Discover() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = customQuery !== undefined ? customQuery : query;
    
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }
    
    setLoading(true);
    const searchData = await searchContent(searchQuery);
    setResults(searchData);
    setLoading(false);
  };

  const handleTopicClick = (topic: string) => {
    setQuery(topic);
    handleSearch(undefined, topic);
  };

  return (
    <div className="space-y-10 max-w-[1600px]">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Discover</h1>
        <p className="text-muted-foreground mt-1">Explore topics, platforms, and trending categories.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the entire feed — topics, creators, sources..."
          className="w-full h-14 pl-12 pr-16 bg-card border border-border rounded-xl text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(""); setResults(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded px-2 py-1 transition"
          >
            Clear
          </button>
        )}
      </form>

      {loading && (
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground animate-pulse">Searching the backend database...</div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card border border-border rounded-xl aspect-[16/10] animate-pulse" style={{ backgroundColor: "oklch(0.2 0.02 0)" }} />
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
                onClick={() => { setQuery(""); setResults(null); }}
                className="mt-3 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            Object.entries(results.groups).map(([group, items]) => {
              if (!items || items.length === 0) return null;
              return (
                <section key={group} className="space-y-4">
                  <SectionHeader 
                    title={group === "VIDEO" ? "Videos" : group === "DISCUSSION" ? "Discussions" : "Articles"} 
                    subtitle={`Recent matching ${group.toLowerCase()} items`}
                  />
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <RecCard 
                        key={item.id} 
                        rec={{
                          id: item.id,
                          title: item.titleHighlight || item.title,
                          description: item.description,
                          source: item.source.toLowerCase() as any,
                          sourceName: item.source,
                          author: item.author || "Unknown",
                          thumbnail: item.thumbnail || "linear-gradient(135deg, oklch(0.5 0.18 145), oklch(0.3 0.12 200))",
                          category: item.category || "General",
                          tags: item.tags || [],
                          trendingScore: Math.round(item.engagementScore),
                          timeAgo: "Recently Ingested",
                          whyRecommended: "Full-text search keyword match",
                          url: item.url
                        }} 
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
        <>
          <section>
            <SectionHeader title="Trending categories" subtitle="Most active topics in the last 24 hours" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trendingTopics.map((t, i) => (
                <button 
                  key={t.name} 
                  onClick={() => handleTopicClick(t.name)}
                  className="text-left p-5 bg-card border border-border rounded-xl hover:border-primary/40 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground">#{i + 1} trending</span>
                    <span className={`text-xs font-medium ${t.change.startsWith("+") ? "text-primary" : "text-destructive"}`}>{t.change}</span>
                  </div>
                  <div className="font-display text-xl font-semibold tracking-tight">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t.count} new items today</div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition">
                    <TrendingUp className="w-3 h-3" /> Explore →
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="Browse all topics" />
            <div className="flex flex-wrap gap-2">
              {interestCategories.map((c) => (
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

          <section>
            <SectionHeader title="Editor's picks today" subtitle="Hand-picked across all platforms" />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {recommendations.slice(2, 8).map((r) => <RecCard key={r.id} rec={r} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
