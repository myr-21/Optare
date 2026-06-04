import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Youtube, Newspaper, BookOpen,
  Github, MessagesSquare, Zap, Brain, Shield, BarChart3,
  Target, Globe, CheckCircle2, TrendingUp, Bookmark
} from "lucide-react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Optare — Minimalist Content Discovery Feed" },
      { name: "description", content: "Personalized content discovery platform. Aggregate your feeds from Hacker News, Dev.to, YouTube, and RSS feeds in one minimalist reader." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
              <Logo className="w-4 h-4" />
            </div>
            <span className="font-display font-semibold tracking-tight">Optare</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition">Log in</Link>
            <Link to="/signup" className="text-sm font-medium bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90 transition">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">

          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.05] text-gradient max-w-4xl mx-auto animate-slide-up">
            All your feeds.<br />One minimalist reader.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            Aggregate, search, and filter your favorite content from Hacker News, Dev.to, YouTube, and RSS feeds in a single high-density, ad-free reader.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link to="/signup" className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium hover:opacity-90 transition shadow-sm">
              Get started <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-surface border border-border rounded-lg px-6 py-3 font-medium hover:bg-accent transition">
              Sign in to Optare
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
