export default function WatchLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full pb-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 pt-2">
       {/* Player Block */}
       <div className="flex-1 flex flex-col gap-6">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
          
          <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col gap-4 border border-white/5 min-h-[150px] mt-2">
             <div className="h-4 w-40 bg-zinc-800 rounded-md animate-[pulse_3s_ease-in-out_infinite]" />
             <div className="h-10 w-3/4 max-w-xl bg-zinc-800 rounded-xl animate-[pulse_3s_ease-in-out_infinite]" />
             <div className="h-6 w-64 bg-zinc-800/50 rounded-md mt-4 animate-[pulse_3s_ease-in-out_infinite]" />
          </div>
       </div>

       {/* List Sidebar Block */}
       <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 h-[600px] bg-zinc-900/50 rounded-2xl border border-white/5 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
    </div>
  );
}
