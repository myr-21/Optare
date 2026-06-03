import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("w-5 h-5 text-primary", className)}
    >
      {/* Converging Streams Concept: Multiple lines merging into a single path */}
      <path d="M3 6h4c2 0 3.5 2 5 6h10" />
      <path d="M3 12h19" />
      <path d="M3 18h4c2 0 3.5-2 5-6h10" />
    </svg>
  );
}
