import { useEffect, useRef, useCallback, useState } from "react";

export interface WsEvent {
  type: string;
  entity: string;
  data?: any;
}

type EventHandler = (event: WsEvent) => void;

let ws: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<EventHandler>();
let isConnected = false;

function connect(): void {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  const url = `${protocol}//${host}/ws`;

  ws = new WebSocket(url);

  ws.onopen = () => {
    isConnected = true;
    console.log("[WS] Connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as WsEvent;
      for (const listener of listeners) {
        listener(data);
      }
    } catch {}
  };

  ws.onclose = () => {
    isConnected = false;
    console.log("[WS] Disconnected, reconnecting in 3s...");
    reconnectTimeout = setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

function disconnect(): void {
  if (reconnectTimeout) clearTimeout(reconnectTimeout);
  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  isConnected = false;
}

export function useWebSocket(onEvent?: EventHandler) {
  const [connected, setConnected] = useState(isConnected);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    connect();

    const handler = (event: WsEvent) => {
      if (onEventRef.current) onEventRef.current(event);
    };
    listeners.add(handler);

    const checkInterval = setInterval(() => {
      setConnected(isConnected);
    }, 1000);

    return () => {
      listeners.delete(handler);
      clearInterval(checkInterval);
    };
  }, []);

  return { connected };
}

export function broadcastWsEvent(event: WsEvent): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}
