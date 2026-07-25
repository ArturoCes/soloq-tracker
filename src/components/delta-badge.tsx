import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeltaBadge({ delta, className }: { delta: number; className?: string }) {
  if (delta === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground", className)}>
        <Minus className="size-3.5" /> 0
      </span>
    );
  }

  const positive = delta > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        positive ? "text-emerald-400" : "text-rose-400",
        className
      )}
    >
      {positive ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
      {Math.abs(delta)}
    </span>
  );
}
