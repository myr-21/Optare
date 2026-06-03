import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, User, Sliders, Plug, Bell, Palette, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, accents } from "@/lib/theme";
import { getMe, getUserInterests, getInterestCategories, updateUserInterests, getConnectedPlatforms, saveConnectedPlatforms } from "@/lib/api";

export const Route = createFileRoute("/app/settings")({ component: Settings });

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "feed", label: "Feed personalization", icon: Sliders },
  { id: "platforms", label: "Connected platforms", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "theme", label: "Appearance", icon: Palette },
];

const activePlatforms = [
  { id: "youtube", name: "YouTube", connected: true, desc: "Technical channels & videos" },
  { id: "article", name: "Articles (RSS)", connected: true, desc: "Wired, TechCrunch, Verge, etc." },
  { id: "hackernews", name: "Hacker News", connected: true, desc: "Developer discussion feed" },
  { id: "devto", name: "Dev.to", connected: true, desc: "Developer community articles" }
];

function Settings() {
  const [tab, setTab] = useState("profile");

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="text-muted-foreground mt-1 mb-8">Manage your account, feed, and connected platforms.</p>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="space-y-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition text-left cursor-pointer",
                tab === id ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="bg-card border border-border rounded-xl p-8 min-h-[500px]">
          {tab === "profile" && <ProfileTab />}
          {tab === "feed" && <FeedTab />}
          {tab === "platforms" && <PlatformsTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "theme" && <ThemeTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMe();
      setUser(data);
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      setError(err.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center animate-fade-in">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
        <div className="font-semibold text-foreground">Failed to load profile</div>
        <div className="text-xs text-muted-foreground mt-1 mb-4">{error}</div>
        <button 
          onClick={loadProfile}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <p className="text-xs text-muted-foreground mt-1">Your account information</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 border border-border flex items-center justify-center font-display text-2xl font-bold text-primary-foreground">
          {user?.username ? user.username[0].toUpperCase() : "U"}
        </div>
        <div>
          <div className="text-sm font-semibold">{user?.username}</div>
          <p className="text-xs text-muted-foreground mt-1">Optare MVP user account</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium block mb-1.5">Username</label>
          <input
            readOnly
            value={user?.username || ""}
            className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground focus:outline-none transition cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1.5">Email address</label>
          <input
            readOnly
            value={user?.email || ""}
            className="w-full h-10 px-3 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground focus:outline-none transition cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}

function FeedTab() {
  const [categories, setCategories] = useState<string[]>([]);
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    setLoading(true);
    try {
      const [cats, interests] = await Promise.all([
        getInterestCategories(),
        getUserInterests()
      ]);
      setCategories(cats);
      setUserInterests(interests);
    } catch (err) {
      console.error("Failed to load feed personalization data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = async (cat: string, weight: string) => {
    setUpdatingId(cat);
    try {
      const updated = categories.map(c => {
        const existing = userInterests.find(i => i.category.toUpperCase() === c.toUpperCase());
        if (c.toUpperCase() === cat.toUpperCase()) {
          return { category: c, weight };
        }
        return { 
          category: c, 
          weight: existing ? existing.weight : "MEDIUM" 
        };
      });
      await updateUserInterests(updated);
      const refreshed = await getUserInterests();
      setUserInterests(refreshed);
    } catch (err) {
      console.error("Failed to update interest weight:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading interests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-lg font-semibold">Feed personalization</h2>
        <p className="text-xs text-muted-foreground mt-1">Tune how recommendations are ranked by setting the interest level for each topic</p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const interest = userInterests.find(i => i.category.toUpperCase() === cat.toUpperCase());
          const currentWeight = interest ? interest.weight : "MEDIUM";
          const isUpdating = updatingId === cat;

          return (
            <div key={cat} className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
              <div>
                <div className="font-medium text-sm text-foreground">{cat}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {currentWeight === "HIGH" && "Boost recommendations in this category"}
                  {currentWeight === "MEDIUM" && "Standard recommendation density"}
                  {currentWeight === "IGNORE" && "Completely filter out recommendations"}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <div className="flex items-center bg-muted/45 p-1 rounded-lg border border-border/60 gap-0.5">
                    {[
                      { label: "High", value: "HIGH", activeClass: "bg-primary text-primary-foreground shadow-sm" },
                      { label: "Medium", value: "MEDIUM", activeClass: "bg-background text-foreground shadow-sm border border-border/20" },
                      { label: "Ignore", value: "IGNORE", activeClass: "bg-destructive text-destructive-foreground shadow-sm" }
                    ].map((btn) => {
                      const active = currentWeight === btn.value;
                      return (
                        <button
                          key={btn.value}
                          onClick={() => handleWeightChange(cat, btn.value)}
                          className={cn(
                            "px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                            active 
                              ? btn.activeClass 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                          )}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlatformsTab() {
  const [connected, setConnected] = useState<Record<string, boolean>>(() => getConnectedPlatforms());

  const handleToggle = (id: string) => {
    const updated = { ...connected, [id]: !connected[id] };
    setConnected(updated);
    saveConnectedPlatforms(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-lg font-semibold">Connected platforms</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage which sources feed your recommendations</p>
      </div>
      <div className="space-y-2">
        {activePlatforms.map((p) => {
          const isConnected = connected[p.id] !== false;
          return (
            <div key={p.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-display font-semibold">
                  {p.name[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              </div>
              <button 
                onClick={() => handleToggle(p.id)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-md border transition cursor-pointer",
                  isConnected
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-surface border-border hover:bg-accent text-muted-foreground"
                )}
              >
                {isConnected ? (<><Check className="w-3.5 h-3.5 inline mr-1" />Connected</>) : "Connect"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const items = [
    { label: "Weekly digest", desc: "Top items from your sources every Monday", on: true },
    { label: "Trending alerts", desc: "Push notification when a topic spikes", on: true },
    { label: "Echo chamber warnings", desc: "Email when your diversity score drops", on: true },
    { label: "Creator updates", desc: "When followed creators publish new content", on: false },
    { label: "Product updates", desc: "Optare news and features", on: false },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <p className="text-xs text-muted-foreground mt-1">Control what reaches you, and when</p>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <Toggle key={it.label} label={it.label} desc={it.desc} defaultOn={it.on} />
        ))}
      </div>
    </div>
  );
}

function Toggle({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn(
          "w-11 h-6 rounded-full p-0.5 transition cursor-pointer",
          on ? "bg-primary" : "bg-muted"
        )}
      >
        <div className={cn("w-5 h-5 rounded-full bg-card transition-transform shadow-sm", on && "translate-x-5")} />
      </button>
    </div>
  );
}

function ThemeTab() {
  const { mode, setMode } = useTheme();
  const modes: { id: "dark" | "light"; label: string; bg: string; fg: string }[] = [
    { id: "dark", label: "Dark", bg: "oklch(0.16 0.012 260)", fg: "oklch(0.97 0.005 250)" },
    { id: "light", label: "Light", bg: "oklch(0.99 0.003 250)", fg: "oklch(0.18 0.012 260)" },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <p className="text-xs text-muted-foreground mt-1">Pick a color mode for the user interface.</p>
      </div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Mode</div>
        <div className="grid sm:grid-cols-2 gap-3 max-w-md">
          {modes.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={cn(
                "rounded-xl border p-4 transition text-left cursor-pointer",
                mode === t.id ? "border-primary/60 ring-1 ring-primary/30 bg-card" : "border-border hover:border-border/80 bg-surface"
              )}
            >
              <div className="h-20 rounded-lg mb-3 border border-border" style={{ background: t.bg }}>
                <div className="h-full w-full p-2 flex flex-col gap-1">
                  <div className="h-1.5 w-1/2 rounded" style={{ background: t.fg, opacity: 0.4 }} />
                  <div className="h-1.5 w-1/3 rounded" style={{ background: t.fg, opacity: 0.2 }} />
                </div>
              </div>
              <div className="text-sm font-medium">{t.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

