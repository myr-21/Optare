import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AccentId = "emerald" | "violet" | "sky" | "amber" | "rose" | "slate";
export type ModeId = "dark" | "light";

export const accents: { id: AccentId; label: string; hue: number; chroma: number; swatch: string }[] = [
  { id: "emerald", label: "Emerald", hue: 145, chroma: 0.16, swatch: "oklch(0.72 0.16 145)" },
  { id: "violet",  label: "Violet",  hue: 285, chroma: 0.17, swatch: "oklch(0.68 0.17 285)" },
  { id: "sky",     label: "Sky",     hue: 230, chroma: 0.15, swatch: "oklch(0.7 0.15 230)" },
  { id: "amber",   label: "Amber",   hue: 70,  chroma: 0.16, swatch: "oklch(0.78 0.16 70)" },
  { id: "rose",    label: "Rose",    hue: 15,  chroma: 0.17, swatch: "oklch(0.7 0.17 15)" },
  { id: "slate",   label: "Slate",   hue: 260, chroma: 0.03, swatch: "oklch(0.7 0.03 260)" },
];

type Ctx = {
  accent: AccentId;
  mode: ModeId;
  setAccent: (a: AccentId) => void;
  setMode: (m: ModeId) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

function applyAccent(id: AccentId, mode: ModeId) {
  const a = accents.find((x) => x.id === id) ?? accents[0];
  const root = document.documentElement;
  const L = mode === "light" ? 0.58 : 0.74;
  const primary = `oklch(${L} ${a.chroma} ${a.hue})`;
  const ring = primary;
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--ring", ring);
  root.style.setProperty("--sidebar-primary", primary);
  root.style.setProperty("--sidebar-ring", ring);
  root.style.setProperty("--chart-1", primary);
  root.style.setProperty("--chart-2", `oklch(${L} ${a.chroma * 0.7} ${(a.hue + 40) % 360})`);
  root.style.setProperty("--chart-3", `oklch(${L} ${a.chroma * 0.5} ${(a.hue + 80) % 360})`);
}

function applyMode(mode: ModeId) {
  const root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.classList.toggle("dark", mode === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<AccentId>("emerald");
  const [mode, setModeState] = useState<ModeId>("dark");

  useEffect(() => {
    const a = (localStorage.getItem("sf:accent") as AccentId | null) ?? "emerald";
    const m = (localStorage.getItem("sf:mode") as ModeId | null) ?? "dark";
    setAccentState(a); setModeState(m);
    applyMode(m); applyAccent(a, m);
  }, []);

  const setAccent = (a: AccentId) => {
    setAccentState(a); localStorage.setItem("sf:accent", a); applyAccent(a, mode);
  };
  const setMode = (m: ModeId) => {
    setModeState(m); localStorage.setItem("sf:mode", m); applyMode(m); applyAccent(accent, m);
  };

  return <ThemeCtx.Provider value={{ accent, mode, setAccent, setMode }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
