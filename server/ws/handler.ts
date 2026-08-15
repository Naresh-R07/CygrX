import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

export type WsEvent = {
  type: string;
  entity: string;
  data?: any;
};

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function initWebSocket(server: Server): void {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`[WS] Client connected (${clients.size} total)`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`[WS] Client disconnected (${clients.size} total)`);
    });

    ws.on("error", (err) => {
      console.error("[WS] Error:", err);
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: "connected", message: "WebSocket connected to CygrX SOC" }));
  });
}

export function broadcast(event: WsEvent): void {
  if (!wss) return;

  const payload = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function getConnectedClients(): number {
  return clients.size;
}
