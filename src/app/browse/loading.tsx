import AnimeSkeleton from "@/components/AnimeSkeleton";

export default function BrowseLoading() {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500 pt-2">
      <div className="glass-card h-[250px] w-full rounded-3xl animate-[pulse_3s_ease-in-out_infinite] border border-white/5 bg-zinc-900/40" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <AnimeSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
