import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = new Map<string, any>(); // Stores game rooms
const connections = new Map<WebSocket, string>(); // Tracks player connections

let wss: WebSocketServer;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  wss = new WebSocketServer({ port: 3001 });

  wss.on("connection", (ws) => {
    const playerId = Math.random().toString(36).substring(7);
    connections.set(ws, playerId);
    console.log(`🟢 Player ${playerId} connected`);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("📩 Received message:", data);

        switch (data.type) {
          case "join_room":
            handleJoinRoom(ws, playerId, data.roomId, data.isHost);
            break;
          case "game_start":
            handleGameStart(data.roomId);
            break;
          case "turn_update":
            handleTurnUpdate(data.roomId, data.content.turnIndex);
            break;
          case "round_update":
            handleRoundUpdate(data.roomId, data.content.roundNumber);
            break;
          case "player_score_update":
            handlePlayerScoreUpdate(data.roomId, data.content.playerId, data.content.points);
            break;
          case "leave_room":
            handleLeaveRoom(playerId, data.roomId);
            break;
        }
      } catch (error) {
        console.error("❌ Error processing message:", error);
      }
    });

    ws.on("close", () => {
      handleDisconnect(ws, playerId);
    });

    ws.send(JSON.stringify({ type: "connected", content: "Successfully connected" }));
  });

  server.listen(3000, () => {
    console.log("🚀 Next.js running on http://localhost:3000");
  });

  console.log("🟢 WebSocket server running on ws://localhost:3001");
});

/**
 * Handles when a player joins a room.
 */
function handleJoinRoom(ws: WebSocket, playerId: string, roomId: string, isHost: boolean) {
  // 🔹 Auto-assign a player to the first available room if no roomId is provided
  if (!roomId) {
    const existingRoom = Array.from(rooms.values()).find(room => room.players.length < 4); // Limit to 4 players per room
    roomId = existingRoom ? existingRoom.id : Math.random().toString(36).substring(7);
  }

  let room = rooms.get(roomId);

  // 🔹 If the room doesn't exist, create it
  if (!room) {
    room = {
      id: roomId,
      players: [],
      boardState: null,
      roundNumber: 1,
      turnIndex: 0,
      status: "waiting",
    };
    rooms.set(roomId, room);
  }

  // 🔹 Add the player if they are not already in the room
  if (!room.players.find((p: any) => p.id === playerId)) {
    room.players.push({
      id: playerId,
      name: `Player ${room.players.length + 1}`,
      points: 0,
      isHost: isHost || room.players.length === 0, // First player is host
    });

    console.log(`✅ Player ${playerId} joined room ${roomId}`);

    // 🔹 Ensure the board is generated once, when the first player joins
    if (room.players.length === 1 && !room.boardState) {
      console.log("🛠 Generating board for the new room...");
      room.boardState = generateRandomBoard();
    }
  }

  // 🔹 Send the updated room state to all players
  broadcastMessage(roomId, { type: "room_updated", content: {room} });

  // 🔹 Send the game board to all players in the room
  broadcastMessage(roomId, { type: "gameboard_update", content: { board: room.boardState } });
}


/**
 * Handles when the host starts the game.
 */
function handleGameStart(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.status = "playing";
  room.boardState = generateRandomBoard();
  room.roundNumber = 1;
  room.turnIndex = 0;

  console.log("🛠 Generating board:", room.boardState);

  broadcastMessage(roomId, { type: "game_start" });

  broadcastMessage(roomId, { type: "gameboard_update", content: { board: room.boardState } });

  broadcastMessage(roomId, { type: "round_update", content: { roundNumber: room.roundNumber } });
}

/**
 * Handles turn updates.
 */
function handleTurnUpdate(roomId: string, turnIndex: number) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.turnIndex = turnIndex;

  broadcastMessage(roomId, { type: "turn_update", content: { turnIndex: room.turnIndex } });
}

/**
 * Handles round updates.
 */
function handleRoundUpdate(roomId: string, roundNumber: number) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.roundNumber = roundNumber;
  room.turnIndex = 0; // Reset turn index at new round

  broadcastMessage(roomId, { type: "round_update", content: { roundNumber: room.roundNumber } });
}

/**
 * Handles player score updates.
 */
function handlePlayerScoreUpdate(roomId: string, playerId: string, points: number) {
  const room = rooms.get(roomId);
  if (!room) return;

  const player = room.players.find((p: any) => p.id === playerId);
  if (player) {
    player.points = points;
  }

  broadcastMessage(roomId, { type: "player_score_update", content: { playerId, points } });
}

/**
 * Handles when a player leaves a room.
 */
function handleLeaveRoom(playerId: string, roomId: string) {
  const room = rooms.get(roomId);
  if (room) {
    room.players = room.players.filter((p: any) => p.id !== playerId);
    if (room.players.length === 0) {
      rooms.delete(roomId);
    } else {
      broadcastMessage(roomId, { type: "room_updated", room });
    }
  }
}

/**
 * Handles when a player disconnects.
 */
function handleDisconnect(ws: WebSocket, playerId: string) {
  console.log(`🔴 Player ${playerId} disconnected`);
  connections.delete(ws);

  // Remove from rooms
  rooms.forEach((room, roomId) => {
    room.players = room.players.filter((p: any) => p.id !== playerId);
    if (room.players.length === 0) {
      rooms.delete(roomId);
    } else {
      broadcastMessage(roomId, { type: "room_updated", room });
    }
  });
}

/**
 * Broadcasts a message to all players in a room.
 */
function broadcastMessage(roomId: string, message: any) {
  wss.clients.forEach((client) => {
    const playerId = connections.get(client);
    if (
      client.readyState === WebSocket.OPEN &&
      rooms.get(roomId)?.players.some((p: any) => p.id === playerId)
    ) {
      client.send(JSON.stringify(message));
    }
  });
}

/**
 * Generates a random 5x5 board.
 */
function generateRandomBoard() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let shuffled = [...alphabet].sort(() => Math.random() - 0.5);
  return Array.from({ length: 5 }, (_, i) => shuffled.slice(i * 5, i * 5 + 5));
}
