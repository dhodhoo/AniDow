import AnimeSkeleton from "@/components/AnimeSkeleton";

export default function SearchLoading() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div>
        <div className="h-10 w-80 bg-zinc-800/50 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-md mb-3" />
        <div className="h-5 w-48 bg-zinc-800/30 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-md" />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <AnimeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
