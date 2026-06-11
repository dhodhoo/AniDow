import { Skeleton } from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <Skeleton className="h-5 w-40 rounded-md" />
      <Skeleton className="h-10 w-2/3 rounded-md" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-16 w-full rounded-2xl" />
    </div>
  );
}
