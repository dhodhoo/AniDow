import AnimeSkeleton, { Skeleton } from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-[320px] sm:h-[400px] md:h-[500px] w-full rounded-3xl mb-8 sm:mb-12" />

      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <section key={rowIndex} className="mt-8 sm:mt-10">
          <Skeleton className="h-7 w-56 rounded-md mb-2" />
          <Skeleton className="h-4 w-80 rounded-md mb-6" />
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[43%] shrink-0 sm:w-[30%] md:w-[22%] lg:w-[18%] xl:w-[16%]">
                <AnimeSkeleton />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
