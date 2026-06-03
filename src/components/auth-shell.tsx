import { Link, type LinkProps } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import type { ReactNode } from "react";

export function AuthShell({
  title, subtitle, children, footer,
}: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="w-full max-w-sm relative z-10">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center w-fit mx-auto">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
            <Logo className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold tracking-tight text-lg">Optare</span>
        </Link>
        
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 text-xs">{subtitle}</p>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          {children}
        </div>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">{footer}</div>
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
      <Link to={to} className="block w-full text-center bg-primary text-primary-foreground rounded-lg py-2.5 font-medium hover:opacity-90 transition shadow-sm">
        {children}
      </Link>
    );
  }
  return (
    <button type="submit" disabled={disabled} className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
      {children}
    </button>
  );
}

