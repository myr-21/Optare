import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles, ArrowRight, Youtube, Newspaper, BookOpen,
  Github, MessagesSquare, Zap, Brain, Shield, BarChart3,
  Target, Globe, CheckCircle2, TrendingUp, Bookmark, Layers
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignalFeed — Break Free From Algorithmic Silos" },
      { name: "description", content: "Cross-platform recommendation aggregator. Personalized content discovery from YouTube, Reddit, news and articles — in one unified feed." },
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
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold tracking-tight">SignalFeed</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#sources" className="hover:text-foreground transition">Sources</a>
            <a href="#intelligence" className="hover:text-foreground transition">Intelligence</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 transition">Log in</Link>
            <Link to="/signup" className="text-sm font-medium bg-primary text-primary-foreground rounded-lg px-4 py-2 hover:opacity-90 transition">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6 animate-fade-in">
            <Zap className="w-3 h-3" /> Aggregating 12+ platforms in real time
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.05] text-gradient max-w-4xl mx-auto animate-slide-up">
            Break Free From<br />Algorithmic Silos
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            One intelligent feed that aggregates personalized recommendations from YouTube, Reddit, news outlets, and the best of the web — without surrendering your attention to any single platform.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Link to="/signup" className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium hover:opacity-90 transition glow-primary">
              Start free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-surface border border-border rounded-lg px-6 py-3 font-medium hover:bg-accent transition">
              See live demo
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> 12 sources free</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> GDPR friendly</span>
          </div>
        </div>

        {/* Preview dashboard */}
        <div className="relative max-w-6xl mx-auto px-6 pb-24 animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="glass rounded-2xl p-2 shadow-2xl shadow-black/40">
            <div className="rounded-xl overflow-hidden border border-border/80 bg-background">
              <div className="h-9 border-b border-border flex items-center px-4 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-chart-3/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                <div className="mx-auto text-[11px] text-muted-foreground">signalfeed.app/home</div>
              </div>
              <div className="grid grid-cols-12 min-h-[440px]">
                <div className="col-span-3 border-r border-border bg-sidebar p-3 space-y-1 hidden md:block">
                  {["Home","Discover","Trending","Saved","Analytics","Collections"].map((l,i)=>(
                    <div key={l} className={`text-xs px-3 py-2 rounded-md ${i===0?"bg-accent text-foreground":"text-muted-foreground"}`}>{l}</div>
                  ))}
                </div>
                <div className="col-span-12 md:col-span-9 p-5">
                  <div className="text-xs text-muted-foreground mb-1">For you, today</div>
                  <div className="font-display text-lg font-semibold mb-4">Personalized Feed</div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[0,1,2,3,4,5].map((i) => (
                      <div key={i} className="rounded-lg border border-border overflow-hidden">
                        <div className="aspect-video" style={{ background: `linear-gradient(135deg, oklch(0.${4+i} 0.${15+i%3} ${145+i*30}), oklch(0.3 0.12 ${200+i*20}))` }} />
                        <div className="p-2 space-y-1">
                          <div className="h-2 w-3/4 bg-muted rounded" />
                          <div className="h-2 w-1/2 bg-muted/60 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" className="border-y border-border bg-surface/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-primary font-medium mb-2">Unified intake</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">One feed. Every source you trust.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: Youtube, name: "YouTube" },
              { icon: MessagesSquare, name: "Reddit" },
              { icon: Newspaper, name: "News" },
              { icon: BookOpen, name: "Articles" },
              { icon: Github, name: "GitHub" },
              { icon: Globe, name: "+ More" },
            ].map(({ icon: Icon, name }) => (
              <div key={name} className="flex flex-col items-center gap-2 py-6 rounded-xl bg-card border border-border hover:border-primary/30 transition">
                <Icon className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs uppercase tracking-widest text-primary font-medium mb-2">Why SignalFeed</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight max-w-2xl mx-auto">Recommendations that work for you — not for engagement metrics.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Brain, title: "True personalization", desc: "Set interest weights explicitly. No dark patterns, no rage-bait amplification." },
              { icon: Shield, title: "Echo chamber detection", desc: "We actively measure topic diversity and surface counter-perspectives when you ask." },
              { icon: BarChart3, title: "Consumption analytics", desc: "Understand exactly where your attention goes — by source, category, and time." },
              { icon: Target, title: "Granular control", desc: "Mute sources, boost topics, set quiet hours, and tune intensity per category." },
              { icon: Layers, title: "Collections that travel", desc: "Save anything, organize across platforms, export anywhere — your data, your rules." },
              { icon: TrendingUp, title: "Cross-platform trends", desc: "See what's actually trending across the open web, not within a single walled garden." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence preview */}
      <section id="intelligence" className="py-24 border-t border-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-medium mb-3">Content Intelligence</div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-4">Know what you're consuming — and why.</h2>
            <p className="text-muted-foreground mb-6">Every week, SignalFeed delivers an honest breakdown of your attention. Diversity scores, echo-chamber alerts, and recommendations to balance your information diet.</p>
            <ul className="space-y-3">
              {[
                "Content consumption by category and source",
                "Recommendation quality feedback loop",
                "Diversity score with weekly trend",
                "Detect and break out of echo chambers",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-xs text-muted-foreground mb-4">This week · Diversity Score</div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-display text-5xl font-semibold">82</span>
              <span className="text-sm text-primary font-medium">+6 vs last week</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "AI Research", v: 38, c: "var(--chart-1)" },
                { label: "Engineering", v: 24, c: "var(--chart-2)" },
                { label: "Design", v: 14, c: "var(--chart-3)" },
                { label: "Startups", v: 12, c: "var(--chart-4)" },
                { label: "Other", v: 12, c: "var(--chart-5)" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium">{r.v}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${r.v}%`, background: r.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Bookmark className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tighter text-gradient mb-4">
            Reclaim your feed.
          </h2>
          <p className="text-muted-foreground mb-8">Free forever for individuals. Set up in under a minute.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-medium hover:opacity-90 transition glow-primary">
              Create your account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center bg-surface border border-border rounded-lg px-6 py-3 font-medium hover:bg-accent transition">
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>© 2026 SignalFeed. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Status</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
