import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-2 h-5 w-96" />
      <div className="mt-8 space-y-2 rounded-xl border border-border/60 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
