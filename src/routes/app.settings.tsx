import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { platforms } from "@/lib/mock-data";
import { Check, User, Sliders, Plug, Bell, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, accents } from "@/lib/theme";


export const Route = createFileRoute("/app/settings")({ component: Settings });

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "feed", label: "Feed personalization", icon: Sliders },
  { id: "platforms", label: "Connected platforms", icon: Plug },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "theme", label: "Appearance", icon: Palette },
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
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition",
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <p className="text-xs text-muted-foreground mt-1">Your account information</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 border border-border" />
        <div>
          <button className="text-xs bg-surface border border-border rounded-md px-3 py-1.5 hover:bg-accent transition">Change photo</button>
          <p className="text-xs text-muted-foreground mt-2">PNG or JPG, max 2MB</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <SettingField label="Full name" value="Alex Chen" />
        <SettingField label="Email" value="alex@signalfeed.app" />
        <SettingField label="Username" value="@alexchen" />
        <SettingField label="Timezone" value="GMT+1 (Berlin)" />
      </div>
      <div className="pt-4 border-t border-border flex justify-end">
        <button className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition">Save changes</button>
      </div>
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5">{label}</label>
      <input
        defaultValue={value}
        className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
      />
    </div>
  );
}

function FeedTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Feed personalization</h2>
        <p className="text-xs text-muted-foreground mt-1">Tune how recommendations are ranked</p>
      </div>
      {[
        { label: "Discovery vs familiarity", v: 60, l: "Familiar", r: "Discovery" },
        { label: "Recency bias", v: 75, l: "Timeless", r: "Latest" },
        { label: "Long-form preference", v: 40, l: "Quick", r: "Deep" },
        { label: "Diversity boost", v: 80, l: "Off", r: "Aggressive" },
      ].map((s) => (
        <div key={s.label}>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">{s.label}</span>
            <span className="text-muted-foreground">{s.v}</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full">
            <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${s.v}%` }} />
            <div className="absolute -top-1 w-4 h-4 rounded-full bg-card border-2 border-primary" style={{ left: `calc(${s.v}% - 8px)` }} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
            <span>{s.l}</span><span>{s.r}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlatformsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Connected platforms</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage which sources feed your recommendations</p>
      </div>
      <div className="space-y-2">
        {platforms.map((p) => (
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
            <button className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-md border transition",
              p.connected
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface border-border hover:bg-accent"
            )}>
              {p.connected ? (<><Check className="w-3.5 h-3.5 inline mr-1" />Connected</>) : "Connect"}
            </button>
          </div>
        ))}
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
    { label: "Product updates", desc: "SignalFeed news and features", on: false },
  ];
  return (
    <div className="space-y-6">
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
          "w-11 h-6 rounded-full p-0.5 transition",
          on ? "bg-primary" : "bg-muted"
        )}
      >
        <div className={cn("w-5 h-5 rounded-full bg-card transition-transform shadow-sm", on && "translate-x-5")} />
      </button>
    </div>
  );
}

function ThemeTab() {
  const { accent, mode, setAccent, setMode } = useTheme();
  const modes: { id: "dark" | "light"; label: string; bg: string; fg: string }[] = [
    { id: "dark", label: "Dark", bg: "oklch(0.16 0.012 260)", fg: "oklch(0.97 0.005 250)" },
    { id: "light", label: "Light", bg: "oklch(0.99 0.003 250)", fg: "oklch(0.18 0.012 260)" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold">Appearance</h2>
        <p className="text-xs text-muted-foreground mt-1">Pick a mode and your minimalist accent color — everything updates instantly.</p>
      </div>

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Mode</div>
        <div className="grid sm:grid-cols-2 gap-3 max-w-md">
          {modes.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={cn(
                "rounded-xl border p-4 transition text-left",
                mode === t.id ? "border-primary/60 ring-1 ring-primary/30" : "border-border hover:border-border/80"
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

      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Accent color</div>
        <p className="text-xs text-muted-foreground mb-4 max-w-md">A single, minimalist hue tints the entire interface — buttons, highlights, charts, and shades adapt automatically.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-xl">
          {accents.map((a) => {
            const active = accent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={cn(
                  "group rounded-xl border p-3 transition flex flex-col items-center gap-2",
                  active ? "border-primary/60 ring-1 ring-primary/30 bg-accent/40" : "border-border hover:border-border/80"
                )}
              >
                <div
                  className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center"
                  style={{ background: a.swatch }}
                >
                  {active && <Check className="w-4 h-4 text-background" />}
                </div>
                <span className="text-xs font-medium">{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

