import AnimeSkeleton, { Skeleton } from "@/components/AnimeSkeleton";

export default function PageLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 pt-2">
      {/* Header skeleton */}
      <div className="flex flex-col gap-3 mb-2">
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <AnimeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
