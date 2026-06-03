import { Link, type LinkProps } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function AuthShell({
  title, subtitle, children, footer,
}: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 relative bg-sidebar border-r border-border overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/15 blur-[120px] rounded-full" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">SignalFeed</span>
          </Link>
          <div>
            <blockquote className="font-display text-3xl font-medium leading-snug tracking-tight max-w-md">
              "Finally, a feed that respects my time. I cancelled three subscriptions and read more than ever."
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 border border-border" />
              <div>
                <div className="text-sm font-medium">Maya Okonkwo</div>
                <div className="text-xs text-muted-foreground">Engineering Director · Linear</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-semibold tracking-tight">SignalFeed</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({ 
  label, 
  type = "text", 
  placeholder, 
  hint, 
  value, 
  onChange, 
  required, 
  name 
}: { 
  label: string; 
  type?: string; 
  placeholder?: string; 
  hint?: ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  name?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-foreground">{label}</label>
        {hint}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        name={name}
        className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring/60 transition"
      />
    </div>
  );
}

export function PrimaryBtn({ children, to, disabled }: { children: ReactNode; to?: LinkProps["to"]; disabled?: boolean }) {
  if (to) {
    return (
      <Link to={to} className="block w-full text-center bg-primary text-primary-foreground rounded-lg py-2.5 font-medium hover:opacity-90 transition glow-primary">
        {children}
      </Link>
    );
  }
  return (
    <button type="submit" disabled={disabled} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-medium hover:opacity-90 transition glow-primary disabled:opacity-50 flex items-center justify-center gap-2">
      {children}
    </button>
  );
}

export function SocialBtns() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button className="h-10 inline-flex items-center justify-center gap-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-accent transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity=".7"/></svg>
        Google
      </button>
      <button className="h-10 inline-flex items-center justify-center gap-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-accent transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
        Apple
      </button>
    </div>
  );
}
