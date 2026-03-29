import { Skeleton } from "@/components/AnimeSkeleton";

export default function AnimeDetailLoading() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row pb-12 animate-in fade-in duration-500 pt-4">
      <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </aside>

      <main className="flex-1 flex flex-col gap-8">
        <div>
          <div className="flex gap-2 mb-4">
             <Skeleton className="h-6 w-20 rounded-md" />
             <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <Skeleton className="h-16 w-3/4 mb-4 rounded-xl" />
          <Skeleton className="h-6 w-1/3 rounded-lg mb-8" />
          
          <Skeleton className="h-12 w-52 rounded-full" />
        </div>

        <section className="flex flex-col gap-3 mt-4">
          <Skeleton className="h-8 w-40 rounded-lg mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[98%]" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-4/6" />
        </section>

        <section className="mt-8">
           <Skeleton className="h-8 w-48 rounded-lg mb-6" />
           <Skeleton className="w-full aspect-video rounded-3xl" />
        </section>
      </main>
    </div>
  );
}
