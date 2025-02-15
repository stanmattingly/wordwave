import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { Server as NetServer } from "http";
import { Socket } from "net";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Store active connections and rooms
const rooms = new Map<string, Set<string>>();
const connections = new Map<WebSocket, string>();

app.prepare().then(() => {
  // Create HTTP server for Next.js
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server on port 3001
  const wss = new WebSocketServer({ port: 3001 });

  wss.on("connection", (ws) => {
    const playerId = Math.random().toString(36).substring(7);
    connections.set(ws, playerId);

    console.log(`🟢 Player ${playerId} connected`);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("📩 Received message:", data);

        switch (data.type) {
          case "join_room": {
            const roomId = data.roomId;
            const isHost = data.isHost;

            if (!rooms.has(roomId)) {
              rooms.set(roomId, new Set());
            }

            rooms.get(roomId)!.add(playerId);

            console.log(`✅ Player ${playerId} joined room ${roomId}`);

            ws.send(
              JSON.stringify({
                type: "room_joined",
                playerId,
                room: {
                  id: roomId,
                  players: Array.from(rooms.get(roomId)!).map((pid) => ({
                    id: pid,
                    connectedAt: new Date(),
                    isHost: pid === playerId ? isHost : false,
                  })),
                  status: "waiting",
                },
              })
            );
            break;
          }
          case "game_message": {
            const roomId = data.roomId;
            if (rooms.has(roomId)) {
              wss.clients.forEach((client) => {
                if (client !== ws && rooms.get(roomId)!.has(connections.get(client)!)) {
                  client.send(JSON.stringify(data));
                }
              });
            }
            break;
          }
          case "leave_room": {
            const roomId = data.roomId;
            if (rooms.has(roomId)) {
              rooms.get(roomId)!.delete(playerId);
              if (rooms.get(roomId)!.size === 0) {
                rooms.delete(roomId);
              }
            }
            break;
          }
        }
      } catch (error) {
        console.error("❌ Error processing message:", error);
      }
    });

    ws.on("close", () => {
      console.log(`🔴 Player ${playerId} disconnected`);
      connections.delete(ws);

      // Remove from all rooms
      rooms.forEach((players, roomId) => {
        if (players.has(playerId)) {
          players.delete(playerId);
          if (players.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });

    ws.send(JSON.stringify({ type: "connected", content: "Successfully connected" }));
  });

  server.listen(3000, () => {
    console.log("🚀 Next.js running on http://localhost:3000");
  });

  console.log("🟢 WebSocket server running on ws://localhost:3001");
});
