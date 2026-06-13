"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Defer state update to avoid sync setState in effect
    Promise.resolve().then(() => setLoading(true));

    // Auto-hide progress after page settles
    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(hideTimer);
      setLoading(false);
    };
  }, [pathname, searchParams]);

  return (
    <div
      className={`pointer-events-none fixed top-0 left-0 z-[99] h-[2px] w-full transition-opacity duration-200 ${
        loading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`h-full bg-indigo-500 ${loading ? "animate-[progress_1.2s_ease-in-out]" : ""}`}
        style={{
          width: loading ? "70%" : "0%",
          transition: "width 0.3s ease-out",
        }}
      />
    </div>
  );
}
