import { Skeleton } from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 lg:gap-10 lg:flex-row pb-10">
      <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-5">
        <Skeleton className="w-full max-w-[260px] mx-auto lg:max-w-none aspect-[3/4] rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </aside>
      <main className="flex-1 flex flex-col gap-8">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>
        <Skeleton className="h-14 w-3/4 rounded-md" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-48 rounded-full" />
          <Skeleton className="h-12 w-56 rounded-full" />
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </main>
    </div>
  );
}
