import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const { mode } = useTheme();
  
  // Use light-background version (logo-light.png) on light UI, and dark-background version (logo-dark.png) on dark UI.
  const src = mode === "light" ? "/logo-light.png" : "/logo-dark.png";

  return (
    <img 
      src={src} 
      className={cn("w-5 h-5 object-contain scale-[1.4]", className)} 
      alt="Optare Logo" 
    />
  );
}
