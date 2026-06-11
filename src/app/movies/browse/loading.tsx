import AnimeSkeleton, { Skeleton } from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <Skeleton className="h-9 w-72 rounded-md" />
      <Skeleton className="h-4 w-96 rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-11 w-24 rounded-xl" />
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, j) => (
            <Skeleton key={j} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      ))}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <AnimeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
