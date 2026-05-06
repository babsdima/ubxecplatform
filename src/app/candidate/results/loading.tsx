import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="dash-bg">
      <div className="dash-hero">
        <div className="max-w-4xl mx-auto px-5 pt-10 pb-2 relative z-10">
          <Skeleton className="h-3 w-32 mb-2" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 pt-6 pb-12 -mt-2 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="pc p-5 sm:p-6">
            <Skeleton className="h-3 w-40 mb-4" />
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-6" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
