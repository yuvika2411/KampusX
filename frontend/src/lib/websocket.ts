"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSession } from "./auth";

export interface WsEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export type ConnectionStatus = "CONNECTING" | "CONNECTED" | "RECONNECTING" | "DISCONNECTED";

interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

type MessageCallback = (event: WsEvent<any>) => void;
type StatusCallback = (status: ConnectionStatus) => void;

interface Subscription {
  id: string;
  destination: string;
  callback: MessageCallback;
}

class KampusXWebSocketClient {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "DISCONNECTED";
  private statusListeners = new Set<StatusCallback>();
  private subscriptions = new Map<string, Subscription>();
  private subCounter = 0;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private shouldConnect = false;
  private currentUrlIndex = 0;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.disconnect();
      });
    }
  }

  private getCandidateUrls(): string[] {
    if (typeof window === "undefined") return [];

    if (process.env.NEXT_PUBLIC_WS_URL) {
      return [process.env.NEXT_PUBLIC_WS_URL];
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (baseUrl) {
      const ws = baseUrl.replace(/^https:\/\//i, "wss://").replace(/^http:\/\//i, "ws://").replace(/\/$/, "") + "/ws";
      return [ws];
    }

    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return ["ws://localhost:8081/ws", "wss://kampusx-backend.onrender.com/ws"];
    }

    return ["wss://kampusx-backend.onrender.com/ws"];
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(newStatus: ConnectionStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((cb) => cb(newStatus));
    }
  }

  public onStatusChange(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.status);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  public connect() {
    if (typeof window === "undefined") return;
    this.shouldConnect = true;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus(this.reconnectAttempts > 0 ? "RECONNECTING" : "CONNECTING");
    this.initSocket();
  }

  private initSocket() {
    const urls = this.getCandidateUrls();
    if (urls.length === 0) return;

    const url = urls[this.currentUrlIndex % urls.length];

    try {
      this.socket = new WebSocket(url);
    } catch {
      this.handleSocketFailure();
      return;
    }

    this.socket.onopen = () => {
      const session = getSession();
      const token = session?.token || "";

      let connectFrame = "CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\n";
      if (token) {
        connectFrame += `Authorization:Bearer ${token}\ntoken:${token}\n`;
      }
      connectFrame += "\n\0";

      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(connectFrame);
      }
    };

    this.socket.onmessage = (event) => {
      if (typeof event.data !== "string") return;
      const frames = this.parseFrames(event.data);
      for (const frame of frames) {
        this.handleFrame(frame);
      }
    };

    this.socket.onerror = () => {
      // Handled by onclose
    };

    this.socket.onclose = () => {
      this.cleanupSocket();
      if (this.shouldConnect) {
        this.handleSocketFailure();
      } else {
        this.setStatus("DISCONNECTED");
      }
    };
  }

  private handleSocketFailure() {
    const urls = this.getCandidateUrls();
    if (urls.length > 1) {
      this.currentUrlIndex = (this.currentUrlIndex + 1) % urls.length;
    }

    this.setStatus("RECONNECTING");
    this.reconnectAttempts++;
    const delay = Math.min(2000 * Math.pow(1.5, Math.min(this.reconnectAttempts, 5)), 15000);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.shouldConnect) {
        this.initSocket();
      }
    }, delay);
  }

  private handleFrame(frame: StompFrame) {
    if (frame.command === "CONNECTED") {
      this.reconnectAttempts = 0;
      this.setStatus("CONNECTED");

      // Resubscribe all active subscriptions
      this.subscriptions.forEach((sub) => {
        this.sendSubscribeFrame(sub.id, sub.destination);
      });

      // Start ping heartbeat
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send("\n");
        }
      }, 15000);
    } else if (frame.command === "MESSAGE") {
      const destination = frame.headers["destination"];
      const subId = frame.headers["subscription"];

      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(frame.body);
      } catch {
        parsedPayload = frame.body;
      }

      // Check if wrapped in WsEvent structure
      const wsEvent: WsEvent<any> =
        parsedPayload && typeof parsedPayload === "object" && "type" in parsedPayload
          ? parsedPayload
          : { type: "MESSAGE", payload: parsedPayload, timestamp: Date.now() };

      this.subscriptions.forEach((sub) => {
        if (sub.id === subId || sub.destination === destination) {
          try {
            sub.callback(wsEvent);
          } catch (e) {
            console.error("Error in WS subscriber callback:", e);
          }
        }
      });
    }
  }

  private sendSubscribeFrame(subId: string, destination: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.status === "CONNECTED") {
      const frame = `SUBSCRIBE\nid:${subId}\ndestination:${destination}\n\n\0`;
      this.socket.send(frame);
    }
  }

  public subscribe<T = any>(destination: string, callback: (event: WsEvent<T>) => void): () => void {
    this.subCounter++;
    const subId = `sub-${this.subCounter}`;

    const sub: Subscription = {
      id: subId,
      destination,
      callback: callback as MessageCallback,
    };

    this.subscriptions.set(subId, sub);

    if (this.status === "CONNECTED") {
      this.sendSubscribeFrame(subId, destination);
    } else {
      this.connect();
    }

    return () => {
      this.subscriptions.delete(subId);
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(`UNSUBSCRIBE\nid:${subId}\n\n\0`);
      }
    };
  }

  public disconnect() {
    this.shouldConnect = false;
    this.cleanupSocket();
    this.setStatus("DISCONNECTED");
  }

  private cleanupSocket() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      try {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send("DISCONNECT\n\n\0");
        }
        this.socket.close();
      } catch {
        // Ignore close errors
      }
      this.socket = null;
    }
  }

  private parseFrames(raw: string): StompFrame[] {
    const frames: StompFrame[] = [];
    const chunks = raw.split("\0");

    for (const chunk of chunks) {
      const trimmed = chunk.replace(/^[\r\n]+/, "");
      if (!trimmed) continue;

      const divider = trimmed.indexOf("\n\n") !== -1 ? trimmed.indexOf("\n\n") : trimmed.indexOf("\r\n\r\n");
      if (divider === -1) continue;

      const headerPart = trimmed.slice(0, divider);
      const isCrlf = trimmed.includes("\r\n\r\n");
      const bodyPart = trimmed.slice(divider + (isCrlf ? 4 : 2));

      const lines = headerPart.split(/\r?\n/);
      const command = lines[0].trim();
      const headers: Record<string, string> = {};

      for (let i = 1; i < lines.length; i++) {
        const colonIdx = lines[i].indexOf(":");
        if (colonIdx !== -1) {
          const key = lines[i].slice(0, colonIdx).trim();
          const value = lines[i].slice(colonIdx + 1).trim();
          headers[key] = value;
        }
      }

      frames.push({ command, headers, body: bodyPart });
    }

    return frames;
  }
}

// Global singleton instance
export const wsClient = new KampusXWebSocketClient();

// React hook to observe connection status
export function useWebSocketStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>(() => wsClient.getStatus());

  useEffect(() => {
    return wsClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  return status;
}

// React hook for auto-subscribing inside components
export function useWebSocketSubscription<T = any>(
  destination: string | null | undefined,
  onEvent: (event: WsEvent<T>) => void
) {
  const callbackRef = useRef(onEvent);
  useEffect(() => {
    callbackRef.current = onEvent;
  });

  const stableCallback = useCallback((e: WsEvent<T>) => {
    callbackRef.current(e);
  }, []);

  useEffect(() => {
    if (!destination) return;
    wsClient.connect();
    const unsubscribe = wsClient.subscribe<T>(destination, stableCallback);
    return () => {
      unsubscribe();
    };
  }, [destination, stableCallback]);
}
