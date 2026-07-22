import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { RecCard, RecCardSkeleton } from "@/components/rec-card";
import { SectionHeader, FilterBar, StatCard, EmptyState } from "@/components/ui-bits";
import { Sparkles, TrendingUp, Bookmark, Activity, ArrowRight, Play, BookOpen, Sliders, RefreshCw, AlertCircle, Layers, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getFeed, 
  getStoredUser, 
  getBookmarkCollections, 
  getBookmarks,
  getAuthHeaders,
  getConnectedPlatforms
} from "@/lib/api";

export const Route = createFileRoute("/app/")({ component: Home });

function Home() {
  const [user, setUser] = useState<any>(null);
  
  // Feed state
  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showColdStartMessage, setShowColdStartMessage] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter state
  const [activeSource, setActiveSource] = useState("All");



  // Continue section state
  const [continueItems, setContinueItems] = useState<any[]>([]);

  // Collections state
  const [collections, setCollections] = useState<string[]>([]);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    setUser(getStoredUser());
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    setShowColdStartMessage(false);

    // Show friendly message if backend takes more than 3 seconds (cold start indicator)
    const timer = setTimeout(() => {
      setShowColdStartMessage(true);
    }, 3000);

    try {
      // Load collections, and continue items in parallel
      const [cols, watchLater, readLater, stats] = await Promise.all([
        getBookmarkCollections().catch(() => []),
        getBookmarks("WATCH_LATER", "", 0, 3).catch(() => ({ content: [] })),
        getBookmarks("READ_LATER", "", 0, 3).catch(() => ({ content: [] })),
        fetchStats().catch(() => null)
      ]);

      setCollections(cols);
      setAnalytics(stats);

      const combinedContinue = [...(watchLater?.content || []), ...(readLater?.content || [])].slice(0, 3);
      setContinueItems(combinedContinue);

      // Now fetch feed (fetch 12 items for first page so trending has 4 and main has 8)
      const feedRes = await getFeed(0, 12);
      const connectedMap = getConnectedPlatforms();
      const items = (feedRes.content || []).filter((item: any) => {
        const src = item.source?.toLowerCase();
        return connectedMap[src] !== false;
      });
      setFeedData(items);
      setPage(0);
      setHasMore(!feedRes.last && (feedRes.content || []).length >= 12);
    } catch (err: any) {
      console.error("Error loading home data:", err);
      setError(err.message || "Failed to load feed. Please try again.");
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setShowColdStartMessage(false);
    }
  };

  const fetchStats = async () => {
    const headers = await getAuthHeaders();
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081/api";
    const res = await fetch(`${API_BASE}/analytics/overview`, { headers });
    if (res.ok) {
      return await res.json();
    }
    return null;
  };

  const fetchFeedData = async (sourceFilter = activeSource) => {
    setLoading(true);
    setError(null);
    try {
      // Map source filter name to backend enum name
      let sourceParam = "";
      if (sourceFilter !== "All") {
        if (sourceFilter === "Articles") {
          sourceParam = "ARTICLE";
        } else if (sourceFilter === "Dev.to") {
          sourceParam = "DEVTO";
        } else if (sourceFilter === "Hacker News") {
          sourceParam = "HACKERNEWS";
        } else {
          sourceParam = sourceFilter.toUpperCase();
        }
      }
      const feedRes = await getFeed(0, 12, "", sourceParam);
      const connectedMap = getConnectedPlatforms();
      const items = (feedRes.content || []).filter((item: any) => {
        const src = item.source?.toLowerCase();
        return connectedMap[src] !== false;
      });
      setFeedData(items);
      setPage(0);
      setHasMore(!feedRes.last && (feedRes.content || []).length >= 12);
    } catch (err: any) {
      console.error("Error loading feed data:", err);
      setError(err.message || "Failed to fetch feed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      let sourceParam = "";
      if (activeSource !== "All") {
        if (activeSource === "Articles") {
          sourceParam = "ARTICLE";
        } else if (activeSource === "Dev.to") {
          sourceParam = "DEVTO";
        } else if (activeSource === "Hacker News") {
          sourceParam = "HACKERNEWS";
        } else {
          sourceParam = activeSource.toUpperCase();
        }
      }
      const feedRes = await getFeed(nextPage, 8, "", sourceParam);
      const newItemsRaw = feedRes.content || [];
      const connectedMap = getConnectedPlatforms();
      const newItems = newItemsRaw.filter((item: any) => {
        const src = item.source?.toLowerCase();
        return connectedMap[src] !== false;
      });
      if (newItemsRaw.length === 0) {
        setHasMore(false);
      } else {
        setFeedData(prev => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(!feedRes.last);
      }
    } catch (err) {
      console.error("Failed to load more feed items:", err);
    } finally {
      setLoadingMore(false);
    }
  };



  const handleSourceChange = (source: string) => {
    setActiveSource(source);
    fetchFeedData(source);
  };

  const displayName = user?.username || "there";

  return (
    <div className="space-y-10 max-w-[1600px]">



      {/* Continue */}
      {continueItems.length > 0 && (
        <section className="animate-fade-in">
          <SectionHeader
            title="Continue where you left off"
            subtitle="Pick up the videos and articles you started this week"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {continueItems.map((r) => {
              const isVideo = r.contentType === "VIDEO" || r.source?.toLowerCase() === "youtube";
              const displaySourceName = r.sourceName || r.source;
              return (
                <a 
                  key={r.id} 
                  href={r.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-card border border-border rounded-xl p-4 flex gap-4 hover:border-border/80 transition"
                >
                  <div 
                    className="w-24 h-24 rounded-lg shrink-0 relative overflow-hidden" 
                    style={r.thumbnail ? { backgroundImage: `url(${r.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "oklch(0.5 0.18 145)" }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                      {isVideo ? <Play className="w-5 h-5 text-white fill-white" /> : <BookOpen className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{displaySourceName}</div>
                      <h4 className="font-medium text-sm leading-snug line-clamp-2 mb-2">{r.title}</h4>
                    </div>
                    <div className="text-[11px] text-muted-foreground">Click to resume</div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Personalized feed */}
      <section>
        <SectionHeader
          title="Personalized Feed"
          subtitle="Curated by your interest weights and recent activity"
          action={
            <button onClick={() => fetchFeedData(activeSource)} className="p-2 hover:bg-accent rounded-lg transition text-muted-foreground hover:text-foreground" title="Refresh feed">
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          }
        />
        <FilterBar 
          sources={["YouTube", "Articles", "Hacker News", "Dev.to"]} 
          active={activeSource}
          onChange={handleSourceChange}
        />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {loading ? (
            <>
              {showColdStartMessage && (
                <div className="col-span-full bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-4 flex gap-3 animate-fade-in mb-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-400">Waking up the backend server...</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our API is hosted on Render's free tier, which sleeps after 15 minutes of inactivity. 
                      Waking the server up may take 1 to 2 minutes. Thank you for your patience!
                    </p>
                  </div>
                </div>
              )}
              {Array.from({ length: 8 }).map((_, i) => <RecCardSkeleton key={i} />)}
            </>
          ) : error ? (
            <div className="col-span-full py-12 text-center bg-card border border-border rounded-xl">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <div className="font-semibold text-foreground">Failed to load feed</div>
              <div className="text-xs text-muted-foreground mt-1 mb-4">{error}</div>
              <button 
                onClick={() => fetchFeedData(activeSource)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          ) : feedData.length === 0 ? (
            <div className="col-span-full">
              <EmptyState 
                icon={<Layers className="w-6 h-6" />}
                title="Your feed is empty"
                desc="Try adjusting your personalization categories, connecting more ingestion sources, or running the backend crawler."
                action={
                  <button 
                    onClick={() => fetchFeedData(activeSource)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition animate-fade-in"
                  >
                    <RefreshCw className="w-4 h-4" /> Refresh Feed
                  </button>
                }
              />
            </div>
          ) : (
            [...feedData.slice(0, 8), ...feedData.slice(12)].map((r) => (
              <RecCard key={r.id} rec={r} />
            ))
          )}
        </div>

        {hasMore && feedData.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-secondary text-secondary-foreground border border-border rounded-lg text-sm font-medium hover:bg-accent transition disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-1" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </section>

      {/* Two col */}
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <SectionHeader title="Trending across platforms" subtitle="What the open web is paying attention to today" />
          <div className="grid sm:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <RecCardSkeleton key={i} />)
            ) : feedData.length > 8 ? (
              feedData.slice(8, 12).map((r) => (
                <RecCard key={r.id} rec={r} />
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-xs text-muted-foreground border border-border border-dashed rounded-xl">
                Additional feed items will appear here as they are ingested.
              </div>
            )}
          </div>
        </section>
        
        <section>
          <SectionHeader title="Your collections" />
          <div className="space-y-2">
            {collections.length === 0 ? (
              <div className="text-xs text-muted-foreground p-8 text-center border border-dashed border-border rounded-xl">
                No collections yet. Bookmark items to organize them.
              </div>
            ) : (
              collections.map((c) => {
                return (
                  <Link
                    key={c}
                    to="/app/collections"
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/40 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg shrink-0 bg-gradient-to-br from-muted to-accent border border-border flex items-center justify-center">
                      <Folder className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c}</div>
                      <div className="text-xs text-muted-foreground">Saved Collection</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition shrink-0" />
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Stats — LAST */}
      <section>
        <SectionHeader title="Your week at a glance" subtitle="A snapshot of how your feed performed" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Viewed" value={String(analytics?.totalViewed ?? 0)} delta="" icon={<Activity className="w-4 h-4" />} />
          <StatCard label="Saved items" value={String(analytics?.totalSaved ?? 0)} delta="" icon={<Bookmark className="w-4 h-4" />} />
          <StatCard label="Categories tracked" value="9" delta="" icon={<Sliders className="w-4 h-4" />} />
          <StatCard label="Active Sources" value="4" delta="" icon={<TrendingUp className="w-4 h-4" />} />
        </div>
      </section>
    </div>
  );
}
