import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, Field, PrimaryBtn, SocialBtns } from "@/components/auth-shell";
import { login } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate({ to: "/app" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your SignalFeed account."
      footer={<>Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <SocialBtns />
        <div className="flex items-center gap-3 text-xs text-muted-foreground my-2">
          <div className="flex-1 h-px bg-border" />or<div className="flex-1 h-px bg-border" />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Field 
          label="Email" 
          type="email" 
          placeholder="you@domain.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          hint={<Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot?</Link>}
        />
        <PrimaryBtn disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
            </>
          ) : (
            "Log in"
          )}
        </PrimaryBtn>
      </form>
    </AuthShell>
  );
}
