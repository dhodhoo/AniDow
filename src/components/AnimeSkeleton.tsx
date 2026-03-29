"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-zinc-800/50 rounded-md", className)}
      {...props}
    />
  );
}

export default function AnimeSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full border border-zinc-800/50">
      <div className="relative aspect-[3/4] w-full">
        <Skeleton className="absolute inset-0 rounded-none bg-zinc-800/30" />
      </div>

      <div className="p-4 flex flex-col gap-3 flex-grow bg-zinc-900/20">
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-2/3 rounded-md" />
        
        <div className="flex gap-2 mt-auto pt-2">
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
