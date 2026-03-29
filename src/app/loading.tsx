import AnimeSkeleton from "@/components/AnimeSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-1000">
      <div className="mb-8">
        <div className="h-8 w-64 bg-zinc-800/50 animate-pulse rounded-md mb-3" />
        <div className="h-4 w-96 bg-zinc-800/30 animate-pulse rounded-md" />
      </div>
      
      {/* Skeletons Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <AnimeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
