import { Skeleton } from "@/components/AnimeSkeleton";

export default function WatchLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 w-full pb-24 lg:pb-10 max-w-[1600px] mx-auto animate-in fade-in duration-300 pt-2">
      {/* Left Column */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Video Player Skeleton */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
          <div className="w-full h-full bg-zinc-800/40 animate-[pulse_3s_ease-in-out_infinite]" />
        </div>

        {/* Info Card Skeleton */}
        <div className="glass-card p-5 md:p-8 rounded-2xl flex flex-col gap-4 md:gap-5 border border-white/5 mt-1 md:mt-2">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
          </div>
          <div>
            <Skeleton className="h-10 w-3/4 max-w-xl rounded-xl mb-3" />
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-[95%] rounded-md" />
          <Skeleton className="h-4 w-4/6 rounded-md" />
          <div className="hidden sm:flex flex-wrap gap-3 border-t border-white/5 pt-5">
            <Skeleton className="h-10 w-40 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>

        {/* Download Panel Skeleton */}
        <div className="glass-card rounded-2xl border border-white/5 p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-7 w-48 rounded-md" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>

      {/* Episode List Sidebar Skeleton */}
      <aside className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 h-[420px] sm:h-[520px] lg:h-[calc(100vh-140px)] lg:sticky top-28">
        <div className="flex flex-col h-full bg-[#0a0a0a]/60 glass-card rounded-2xl border border-white/5 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="p-3 sm:p-4 border-b border-white/5 bg-[#050505]/40 backdrop-blur-md shrink-0">
            <Skeleton className="h-6 w-28 rounded-md mb-1" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
