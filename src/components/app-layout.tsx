import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Home, Compass, Bookmark, Settings, Search, ChevronLeft, Menu, LogOut
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { logout, getStoredUser } from "@/lib/api";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/discover", label: "Discover", icon: Compass },
  { to: "/app/saved", label: "Saved", icon: Bookmark },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchParams = useRouterState({ select: (s) => s.location.search });
  const q = (searchParams as any).q || "";
  const user = getStoredUser();

  useEffect(() => {
    setSearchVal(q);
  }, [q]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const handleTopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/app/discover", search: { q: searchVal } });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col relative",
          collapsed ? "w-[72px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute top-[18px] -right-3.5 z-50 w-7 h-7 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-foreground shadow-sm transition-transform cursor-pointer"
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </button>

        <div className={cn("h-16 flex items-center border-b border-sidebar-border px-4 justify-between", collapsed && "lg:justify-center lg:px-0")}>
          <Link to="/app" className={cn("flex items-center gap-2 overflow-hidden", collapsed && "lg:mx-auto lg:justify-center")}>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center shrink-0">
              <Logo className="w-4 h-4" />
            </div>
            {!collapsed && (
              <span className="font-display font-semibold text-sidebar-foreground tracking-tight">Optare</span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
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
                  "flex items-center gap-3 py-2 pr-3 transition-all border-l-2",
                  collapsed ? "justify-center px-0 border-l-0" : "pl-2.5 rounded-r-lg",
                  active
                    ? "bg-sidebar-accent/95 text-sidebar-foreground font-semibold border-primary shadow-sm"
                    : "text-muted-foreground border-transparent hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-all text-left outline-none cursor-pointer",
                collapsed ? "justify-center" : ""
              )}>
                <Avatar className="w-8 h-8 border border-border shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {user?.username ? user.username[0].toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-sidebar-foreground truncate leading-none mb-1">{user?.username || "Account"}</p>
                    <p className="text-[10px] text-muted-foreground truncate leading-none">{user?.email || "user@optare.com"}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={collapsed ? "center" : "start"} side="right" className="w-56 bg-popover border border-border rounded-lg shadow-lg p-1 text-popover-foreground z-50">
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{user?.username || "Account"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@optare.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
              <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-accent outline-none">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-muted" />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive outline-none">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 lg:px-6 justify-between gap-3">
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent mr-3"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleTopSearch} className="flex-1 max-w-[80%] lg:max-w-[85%] relative mx-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search across all your platforms..."
              className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
            />
            <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-background">⌘K</kbd>
          </form>

          {/* Balance spacing on mobile to center search */}
          <div className="w-9 h-9 lg:hidden" />
        </header>

        <main className="flex-1 p-4 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
