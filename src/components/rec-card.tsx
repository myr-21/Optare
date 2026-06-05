import { Bookmark, ThumbsUp, ThumbsDown, ExternalLink, Target, TrendingUp, Play, MessageSquare } from "lucide-react";
import { useState } from "react";
import { type Recommendation, sourceMeta, type SourceType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { recordInteraction, removeInteraction, getStoredToken } from "@/lib/api";

function formatTimeAgo(dateStr?: string | Date) {
  if (!dateStr) return "recent";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return "recent";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export function RecCard({ rec }: { rec: any }) {
  const [saved, setSaved] = useState(rec.saved || false);
  const [showWhy, setShowWhy] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const sourceLower = rec.source?.toLowerCase() || "";
  const meta = (sourceMeta[sourceLower as SourceType] || {
    label: rec.sourceName || rec.source?.toUpperCase() || "Source",
    color: "oklch(0.6 0.02 120)"
  });

  const displayTitle = rec.titleHighlight || rec.title || "Untitled";
  const displayAuthor = rec.author || "Anonymous";
  const displaySourceName = rec.sourceName || meta.label;
  const displayTimeAgo = rec.timeAgo || formatTimeAgo(rec.publishedDate);
  const displayScore = rec.trendingScore ?? (rec.engagementScore ? Math.round(rec.engagementScore) : rec.score ? Math.round(rec.score * 100) : 0);

  const displayWhy = rec.whyRecommended || (Array.isArray(rec.reasons) && rec.reasons.length > 0 ? rec.reasons.join(" · ") : "");

  const isHN = sourceLower === "hackernews";
  const hasThumbnail = !isHN && !!(rec.thumbnail && !rec.thumbnail.startsWith("linear-gradient") && rec.thumbnail.trim() !== "");
  
  const backgroundStyle = hasThumbnail 
    ? { backgroundImage: `url(${rec.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }
    : undefined;

  const handleThumbsUp = async () => {
    if (!getStoredToken()) {
      window.dispatchEvent(new CustomEvent("trigger-auth-gate"));
      return;
    }
    try {
      if (feedback === "up") {
        setFeedback(null);
        await removeInteraction(rec.id, "FAVORITE");
      } else {
        if (feedback === "down") {
          await removeInteraction(rec.id, "DISMISS");
        }
        setFeedback("up");
        await recordInteraction(rec.id, "FAVORITE");
      }
    } catch (err) {
      console.error("Failed to update thumbs up interaction", err);
    }
  };

  const handleThumbsDown = async () => {
    if (!getStoredToken()) {
      window.dispatchEvent(new CustomEvent("trigger-auth-gate"));
      return;
    }
    try {
      if (feedback === "down") {
        setFeedback(null);
        await removeInteraction(rec.id, "DISMISS");
      } else {
        if (feedback === "up") {
          await removeInteraction(rec.id, "FAVORITE");
        }
        setFeedback("down");
        await recordInteraction(rec.id, "DISMISS");
      }
    } catch (err) {
      console.error("Failed to update thumbs down interaction", err);
    }
  };

  const handleBookmark = async () => {
    if (!getStoredToken()) {
      window.dispatchEvent(new CustomEvent("trigger-auth-gate"));
      return;
    }
    try {
      if (saved) {
        setSaved(false);
        await removeInteraction(rec.id, "BOOKMARK");
      } else {
        setSaved(true);
        await recordInteraction(rec.id, "BOOKMARK");
      }
    } catch (err) {
      console.error("Failed to update bookmark interaction", err);
    }
  };

  const handleRecordView = async () => {
    if (!getStoredToken()) return;
    try {
      await recordInteraction(rec.id, "VIEW");
    } catch (err) {
      console.error("Failed to record VIEW interaction", err);
    }
  };

  return (
    <article 
      className={cn(
        "group relative bg-card border border-border/80 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/40 hover:bg-surface/30 hover:-translate-y-[1.5px] transition-all duration-200 flex flex-col",
        isHN && "border-l-4 border-l-[#ff6600]"
      )}
    >
      {/* Thumbnail */}
      {hasThumbnail && (
        <a
          href={rec.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleRecordView}
          className="relative aspect-[16/9] overflow-hidden border-b border-border/40 block cursor-pointer"
          style={backgroundStyle}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          {rec.source === "youtube" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-200">
                <Play className="w-4 h-4 text-white fill-white ml-0.5 group-hover:text-primary-foreground group-hover:fill-primary-foreground transition-colors" />
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md border border-white/10"
              style={{ backgroundColor: `color-mix(in oklab, ${meta.color} 75%, rgba(0,0,0,0.4))` }}
            >
              {meta.label}
            </span>
          </div>
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/15">
            <TrendingUp className="w-3 h-3 text-primary" />
            {displayScore}
          </div>
        </a>
      )}

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        {!hasThumbnail && (
          <div className="flex items-center justify-between mb-3">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: isHN ? "#ff6600" : meta.color }}
            >
              {isHN && <MessageSquare className="w-3 h-3 shrink-0" />}
              {meta.label}
            </span>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-accent border border-border text-foreground">
              <TrendingUp className="w-3 h-3 text-primary" />
              {displayScore}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
          <span className="font-medium text-foreground/80">{displaySourceName}</span>
          <span>·</span>
          <span>{displayAuthor}</span>
          <span>·</span>
          <span>{displayTimeAgo}</span>
        </div>
        <a
          href={rec.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleRecordView}
          className="hover:underline cursor-pointer"
        >
          <h3 
            className="font-display font-semibold text-[15px] leading-snug text-foreground line-clamp-2 mb-1.5"
            dangerouslySetInnerHTML={{ __html: displayTitle }}
          />
        </a>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{rec.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {rec.tags && rec.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-muted-foreground border border-border">
              #{tag}
            </span>
          ))}
        </div>

        {showWhy && displayWhy && (
          <div className="mb-3 p-3 rounded-lg bg-muted/40 border border-border animate-fade-in">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">
              <Target className="w-3 h-3" /> Relevance Info
            </div>
            <p className="text-xs text-foreground/80">{displayWhy}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleThumbsUp}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition",
                feedback === "up" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={handleThumbsDown}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition",
                feedback === "down" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition",
                showWhy ? "text-primary" : "text-muted-foreground"
              )}
              title="Why this?"
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              onClick={handleBookmark}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md hover:bg-accent transition",
                saved ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            </button>
          </div>
          <a
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleRecordView}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition cursor-pointer"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function RecCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-[16/9] skeleton animate-pulse bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 skeleton animate-pulse bg-muted rounded" />
        <div className="h-4 w-full skeleton animate-pulse bg-muted rounded" />
        <div className="h-4 w-2/3 skeleton animate-pulse bg-muted rounded" />
        <div className="flex gap-1.5">
          <div className="h-5 w-14 skeleton animate-pulse bg-muted rounded-md" />
          <div className="h-5 w-16 skeleton animate-pulse bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}
