import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell, Field, PrimaryBtn, SocialBtns } from "@/components/auth-shell";
import { register } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: Signup });

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(username, email, password);
      // Route new users to onboarding
      navigate({ to: "/onboarding" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Check if email/username is already in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start aggregating your feed in under a minute."
      footer={<>Already have one? <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link></>}
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
          label="Full name / Username" 
          placeholder="Alex Chen" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
          placeholder="At least 8 characters" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <p className="text-[11px] text-muted-foreground">
          By signing up you agree to our <a className="underline hover:text-foreground" href="#">Terms</a> and <a className="underline hover:text-foreground" href="#">Privacy Policy</a>.
        </p>
        
        <PrimaryBtn disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
            </>
          ) : (
            "Create account"
          )}
        </PrimaryBtn>
      </form>
    </AuthShell>
  );
}
