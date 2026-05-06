import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="dash-bg">
      <div className="dash-hero">
        <div className="max-w-5xl mx-auto px-5 pt-8 pb-3 relative z-10">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-3 w-32 mb-1" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>
      <main className="max-w-5xl mx-auto px-5 pt-6 pb-12 -mt-2 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pc p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-2" />
                <div className="flex gap-1.5 flex-wrap">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <Skeleton className="h-20 w-20 rounded-full" />
            </div>
            <div className="space-y-1.5 mt-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-1.5 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
