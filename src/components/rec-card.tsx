import { Bookmark, ThumbsUp, ThumbsDown, ExternalLink, Sparkles, TrendingUp, Play } from "lucide-react";
import { useState } from "react";
import { type Recommendation, sourceMeta, type SourceType } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { recordInteraction, removeInteraction } from "@/lib/api";

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

  const isGradient = rec.thumbnail?.startsWith("linear-gradient");
  const gradients = [
    "linear-gradient(135deg, oklch(0.5 0.18 145), oklch(0.3 0.12 200))",
    "linear-gradient(135deg, oklch(0.55 0.2 25), oklch(0.35 0.15 320))",
    "linear-gradient(135deg, oklch(0.5 0.2 260), oklch(0.4 0.15 180))",
    "linear-gradient(135deg, oklch(0.6 0.18 70), oklch(0.4 0.15 15))",
    "linear-gradient(135deg, oklch(0.5 0.2 300), oklch(0.35 0.15 200))",
    "linear-gradient(135deg, oklch(0.55 0.18 180), oklch(0.35 0.15 260))",
  ];
  
  const backgroundStyle = isGradient 
    ? { background: rec.thumbnail }
    : rec.thumbnail 
      ? { backgroundImage: `url(${rec.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { background: gradients[Math.abs(hashString(rec.id || "")) % gradients.length] };

  const handleThumbsUp = async () => {
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

  return (
    <article className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 flex flex-col">
      {/* Thumbnail */}
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={backgroundStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {rec.source === "youtube" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-md"
            style={{ backgroundColor: `color-mix(in oklab, ${meta.color} 70%, transparent)` }}
          >
            {meta.label}
          </span>
        </div>
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-black/50 backdrop-blur-md text-white border border-white/10">
          <TrendingUp className="w-3 h-3 text-primary" />
          {displayScore}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
          <span className="font-medium text-foreground/80">{displaySourceName}</span>
          <span>·</span>
          <span>{displayAuthor}</span>
          <span>·</span>
          <span>{displayTimeAgo}</span>
        </div>
        <h3 
          className="font-display font-semibold text-[15px] leading-snug text-foreground line-clamp-2 mb-1.5"
          dangerouslySetInnerHTML={{ __html: displayTitle }}
        />
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{rec.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {rec.tags && rec.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-accent text-muted-foreground border border-border">
              #{tag}
            </span>
          ))}
        </div>

        {showWhy && displayWhy && (
          <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/15 animate-fade-in">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">
              <Sparkles className="w-3 h-3" /> Why this
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
              <Sparkles className="w-4 h-4" />
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary transition"
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
