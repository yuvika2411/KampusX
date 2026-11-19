"use client";

import { useWebSocketStatus } from "@/lib/websocket";
import { Radio } from "lucide-react";

interface LiveStatusIndicatorProps {
  className?: string;
  showText?: boolean;
}

export default function LiveStatusIndicator({
  className = "",
  showText = true,
}: LiveStatusIndicatorProps) {
  const status = useWebSocketStatus();

  if (status === "CONNECTED") {
    return (
      <span
        title="Real-time WebSocket connected. Live updates enabled."
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {showText && <span>Live Updates</span>}
      </span>
    );
  }

  if (status === "CONNECTING" || status === "RECONNECTING") {
    return (
      <span
        title="Connecting to real-time updates..."
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse" />
        </span>
        {showText && <span>Reconnecting...</span>}
      </span>
    );
  }

  return (
    <span
      title="Disconnected from real-time updates."
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-mute bg-soft border border-line ${className}`}
    >
      <Radio size={12} className="opacity-60" />
      {showText && <span>Offline</span>}
    </span>
  );
}
