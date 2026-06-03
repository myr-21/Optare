import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { interestCategories as mockCategories, platforms } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { getInterestCategories, updateUserInterests, getConnectedPlatforms, saveConnectedPlatforms } from "@/lib/api";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

type Intensity = "high" | "medium" | "ignore";

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [interests, setInterests] = useState<Record<string, Intensity>>({});
  const [sources, setSources] = useState<Record<string, boolean>>(() => getConnectedPlatforms());
  const [feedPref, setFeedPref] = useState("balanced");

  useEffect(() => {
    getInterestCategories()
      .then((cats) => {
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch backend interest categories:", err);
        // Fallback to mock data for resilience
        setCategories(mockCategories);
        setLoading(false);
      });
  }, []);

  const toggleInterest = (cat: string, level: Intensity) => {
    setInterests((prev) => ({ ...prev, [cat]: prev[cat] === level ? "medium" : level }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const interestsPayload = categories.map((cat) => {
        const intensity = interests[cat] || "medium";
        const weight = intensity === "high" ? "HIGH" : intensity === "ignore" ? "IGNORE" : "MEDIUM";
        return { category: cat, weight };
      });
      await updateUserInterests(interestsPayload);
      saveConnectedPlatforms(sources);
      navigate({ to: "/app" });
    } catch (err) {
      console.error("Failed to save user interests:", err);
      saveConnectedPlatforms(sources);
      // Resilient fallback: go to app anyway so user isn't bricked
      navigate({ to: "/app" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border h-16 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-border flex items-center justify-center">
            <Logo className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold tracking-tight">Optare</span>
        </Link>
        <div className="ml-auto text-xs text-muted-foreground">Step {step} of 3</div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* progress */}
        <div className="flex gap-1.5 mb-10">
          {[1, 2, 3].map(n => (
            <div key={n} className={cn("h-1 flex-1 rounded-full transition", n <= step ? "bg-primary" : "bg-muted")} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-semibold tracking-tight">What are you into?</h1>
            <p className="text-muted-foreground mt-2">Set the intensity for each topic. You can always change this later.</p>

            
            {loading ? (
              <div className="mt-8 grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[58px] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const lvl = interests[cat] || "medium";
                  return (
                    <div key={cat} className="flex items-center justify-between p-3.5 bg-card border border-border rounded-xl">
                      <span className="text-sm font-medium text-foreground">{cat}</span>
                      <div className="flex items-center bg-muted/45 p-1 rounded-lg border border-border/60 gap-0.5">
                        {[
                          { k: "high" as const, label: "High", activeClass: "bg-primary text-primary-foreground shadow-sm" },
                          { k: "medium" as const, label: "Medium", activeClass: "bg-background text-foreground shadow-sm border border-border/20" },
                          { k: "ignore" as const, label: "Ignore", activeClass: "bg-destructive text-destructive-foreground shadow-sm" },
                        ].map(({ k, label, activeClass }) => {
                          const active = lvl === k;
                          return (
                            <button
                              key={k}
                              onClick={() => toggleInterest(cat, k)}
                              className={cn(
                                "px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                                active 
                                  ? activeClass 
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                              )}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Pick your sources</h1>
            <p className="text-muted-foreground mt-2">Connect the platforms you want recommendations from.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {platforms.map((p) => {
                const on = sources[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => setSources((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                    className={cn(
                      "text-left p-4 rounded-xl border transition",
                      on ? "bg-primary/5 border-primary/40 ring-1 ring-primary/30" : "bg-card border-border hover:border-border/80"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition",
                        on ? "bg-primary border-primary" : "border-border"
                      )}>
                        {on && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="font-display text-3xl font-semibold tracking-tight">Tune your feed</h1>
            <p className="text-muted-foreground mt-2">How should we balance familiar topics vs new discoveries?</p>
            <div className="mt-8 space-y-3">
              {[
                { id: "focused", title: "Focused", desc: "Stay deep in topics I already love. Minimal surprises." },
                { id: "balanced", title: "Balanced", desc: "A healthy mix of familiar topics and fresh perspectives. Recommended." },
                { id: "explorer", title: "Explorer", desc: "Push me out of my bubble. Surface diverse viewpoints and new domains." },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFeedPref(opt.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-xl border transition flex items-start gap-4",
                    feedPref === opt.id ? "bg-primary/5 border-primary/40 ring-1 ring-primary/30" : "bg-card border-border hover:border-border/80"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition",
                    feedPref === opt.id ? "border-primary" : "border-border"
                  )}>
                    {feedPref === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <div className="font-medium">{opt.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1 || submitting}
            className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition"
          >
            ← Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition shadow-sm"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition shadow-sm disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  Open my feed <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
