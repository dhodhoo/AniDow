"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: "iframe";
      height: number;
      width: number;
      params: Record<string, never>;
    };
  }
}

const nativeBanner = {
  containerId: "container-e66a1dd8bcaef31b57b6f61363e96fcb",
  src: "https://pl29514160.effectivecpmnetwork.com/e66a1dd8bcaef31b57b6f61363e96fcb/invoke.js",
};

const banner728 = {
  key: "3264b6d082149a05bf5ec0f086817dc9",
  width: 728,
  height: 90,
};

const banner300 = {
  key: "e56fa825a53c3cd2cc809885607540ce",
  width: 300,
  height: 250,
};

function AdFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex w-full justify-center ${className}`}>
      <div className="relative flex max-w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/30 shadow-[0_0_30px_rgba(79,70,229,0.08)]">
        {children}
      </div>
    </div>
  );
}

function ScriptBanner({ ad }: { ad: typeof banner728 | typeof banner300 }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const optionsScript = document.createElement("script");
    optionsScript.text = `
      window.atOptions = {
        key: "${ad.key}",
        format: "iframe",
        height: ${ad.height},
        width: ${ad.width},
        params: {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.src = `https://www.highperformanceformat.com/${ad.key}/invoke.js`;
    invokeScript.async = false;

    container.append(optionsScript, invokeScript);

    return () => {
      container.innerHTML = "";
    };
  }, [ad]);

  return (
    <div
      ref={containerRef}
      className="max-w-full overflow-hidden"
      style={{ width: ad.width, minHeight: ad.height }}
    />
  );
}

export function AdsterraLeaderboard({ className = "" }: { className?: string }) {
  return (
    <AdFrame className={className}>
      <div className="w-full max-w-[728px] overflow-hidden">
        <ScriptBanner ad={banner728} />
      </div>
    </AdFrame>
  );
}

export function AdsterraRectangle({ className = "" }: { className?: string }) {
  return (
    <AdFrame className={className}>
      <ScriptBanner ad={banner300} />
    </AdFrame>
  );
}

export function AdsterraNative({ className = "" }: { className?: string }) {
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[data-adsterra-native="${nativeBanner.containerId}"]`
    );

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.adsterraNative = nativeBanner.containerId;
    script.dataset.cfasync = "false";
    script.src = nativeBanner.src;
    document.body.appendChild(script);
  }, []);

  return (
    <AdFrame className={className}>
      <div id={nativeBanner.containerId} className="min-h-[120px] w-full max-w-[760px]" />
    </AdFrame>
  );
}
