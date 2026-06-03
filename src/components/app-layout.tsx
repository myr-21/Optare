import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Compass, TrendingUp, Bookmark, BarChart3, FolderHeart,
  Settings, Sparkles, Search, Bell, Plus, ChevronLeft, Menu, LogOut
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api";

const navItems = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/discover", label: "Discover", icon: Compass },
  { to: "/app/trending", label: "Trending", icon: TrendingUp },
  { to: "/app/saved", label: "Saved", icon: Bookmark },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/collections", label: "Collections", icon: FolderHeart },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link to="/app" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <span className="font-display font-semibold text-sidebar-foreground tracking-tight">SignalFeed</span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-sidebar-border">
            <div className="rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-3">
              <div className="text-xs font-medium text-sidebar-foreground">Pro Plan</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Unlimited sources & analytics</div>
              <button className="mt-2 w-full text-xs bg-primary text-primary-foreground rounded-md py-1.5 font-medium hover:opacity-90 transition">
                Upgrade
              </button>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
            )}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 lg:px-6 gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search across all your platforms..."
              className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
            />
            <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-background">⌘K</kbd>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden md:flex h-9 px-3 items-center gap-1.5 rounded-lg bg-surface border border-border hover:bg-accent text-sm transition">
              <Plus className="w-4 h-4" /> Add Source
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent relative">
              <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
