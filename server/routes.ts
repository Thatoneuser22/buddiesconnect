import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertChannelSchema, insertMessageSchema, insertFriendRequestSchema } from "@shared/schema";
import type { UserStatus } from "@shared/schema";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";

interface ConnectedClient {
  odId: string;
  ws: WebSocket;
}

const clients: Map<string, ConnectedClient> = new Map();

const BAD_WORDS = [
  "rape", "rapist", "pedo", "pedophile", "child abuse", "kill yourself", "kys"
];

function containsBadWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
}

function broadcast(message: object, excludeUserId?: string) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.odId !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(data);
    }
  });
}

function sendToUser(odId: string, message: object) {
  const client = clients.get(odId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify(message));
  }
}

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer({ 
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      cb(null, randomUUID() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, path.basename(req.path));
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // Upload endpoints
  app.post("/api/upload/image", storage_multer.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.post("/api/upload/video", storage_multer.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    const name = req.file.originalname;
    res.json({ url, name });
  });

  app.post("/api/upload/audio", storage_multer.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    const name = req.file.originalname;
    res.json({ url, name });
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let odId: string | null = null;

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        switch (message.type) {
          case "auth": {
            odId = message.odId;
            if (odId) {
              clients.set(odId, { odId, ws });
              
              await storage.updateUserStatus(odId, "online");
              
              broadcast({ type: "user_status", odId, status: "online" }, odId);
              
              const allUsers = await storage.getAllUsers();
              const onlineUsers = allUsers
                .filter(u => clients.has(u.id))
                .map(u => ({ id: u.id, status: u.status }));
              
              ws.send(JSON.stringify({ type: "users_online", users: onlineUsers }));
            }
            break;
          }

          case "message": {
            if (!odId) return;
            
            const content = message.content || "";
            if (containsBadWords(content)) {
              return;
            }
            
            try {
              const validatedMessage = insertMessageSchema.parse({
                content,
                channelId: message.channelId,
                imageUrl: message.imageUrl,
                videoUrl: message.videoUrl,
                audioUrl: message.audioUrl,
                replyToId: message.replyToId,
              });
              
              const newMessage = await storage.createMessage(odId, validatedMessage);
              newMessage.videoName = message.videoName;
              newMessage.audioName = message.audioName;
              
              broadcast({ type: "message", message: newMessage });
            } catch (err) {
              if (err instanceof Error && err.message.includes("Too many messages")) {
                ws.send(JSON.stringify({ type: "error", message: err.message }));
              }
            }
            break;
          }

          case "dm_message": {
            if (!odId) return;
            
            const toUserId = message.toUserId;
            const content = (message.content || "") + (message.imageUrl ? `\n[Image]` : "");
            
            if (!toUserId || !content.trim()) return;
            
            const newMessage = await storage.createDMMessage(odId, toUserId, content);
            
            sendToUser(odId, { type: "dm_message", message: newMessage, odId: toUserId });
            sendToUser(toUserId, { type: "dm_message", message: newMessage, odId });
            break;
          }

          case "typing_start": {
            if (!odId) return;
            const user = await storage.getUser(odId);
            if (!user) return;
            
            broadcast(
              { type: "typing_start", channelId: message.channelId, odId, username: user.username },
              odId
            );
            break;
          }

          case "typing_stop": {
            if (!odId) return;
            broadcast(
              { type: "typing_stop", channelId: message.channelId, odId },
              odId
            );
            break;
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", async () => {
      if (odId) {
        clients.delete(odId);
        await storage.updateUserStatus(odId, "offline");
        broadcast({ type: "user_status", odId, status: "offline" });
      }
    });
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      res.json(user);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.get("/api/channels", async (_req, res) => {
    const channels = await storage.getChannels();
    res.json(channels);
  });

  app.post("/api/channels", async (req, res) => {
    try {
      const validated = insertChannelSchema.parse(req.body);
      const channel = await storage.createChannel(validated);
      
      broadcast({ type: "channel_created", channel });
      
      res.json(channel);
    } catch (error) {
      console.error("Create channel error:", error);
      res.status(400).json({ error: "Invalid channel data" });
    }
  });

  app.get("/api/channels/:id/messages", async (req, res) => {
    const messages = await storage.getMessages(req.params.id);
    res.json(messages);
  });

  app.post("/api/channels/:id/messages", async (req, res) => {
    try {
      const odId = req.headers["x-user-id"] as string;
      if (!odId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const validated = insertMessageSchema.parse({
        ...req.body,
        channelId: req.params.id,
      });
      
      const message = await storage.createMessage(odId, validated);
      
      broadcast({ type: "message", message });
      
      res.json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.get("/api/friends", async (req, res) => {
    const odId = req.headers["x-user-id"] as string;
    if (!odId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const friends = await storage.getFriends(odId);
    res.json(friends);
  });

  app.get("/api/friends/requests", async (req, res) => {
    const odId = req.headers["x-user-id"] as string;
    if (!odId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const requests = await storage.getFriendRequests(odId);
    res.json(requests);
  });

  app.post("/api/friends/request", async (req, res) => {
    try {
      const odId = req.headers["x-user-id"] as string;
      if (!odId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const validated = insertFriendRequestSchema.parse(req.body);
      const request = await storage.createFriendRequest(odId, validated.toUsername);
      
      sendToUser(request.toUserId, { type: "friend_request", request });
      
      res.json(request);
    } catch (error: unknown) {
      console.error("Create friend request error:", error);
      const errorMessage = error instanceof Error ? error.message : "Invalid request";
      res.status(400).json({ error: errorMessage });
    }
  });

  app.post("/api/friends/accept/:requestId", async (req, res) => {
    try {
      const odId = req.headers["x-user-id"] as string;
      if (!odId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await storage.acceptFriendRequest(req.params.requestId);
      if (!result) {
        return res.status(404).json({ error: "Request not found" });
      }
      
      sendToUser(result.friend2.odId, { type: "friend_accepted", friend: result.friend1 });
      
      res.json(result.friend1);
    } catch (error) {
      console.error("Accept friend request error:", error);
      res.status(400).json({ error: "Failed to accept request" });
    }
  });

  app.post("/api/friends/decline/:requestId", async (req, res) => {
    try {
      const success = await storage.declineFriendRequest(req.params.requestId);
      if (!success) {
        return res.status(404).json({ error: "Request not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Decline friend request error:", error);
      res.status(400).json({ error: "Failed to decline request" });
    }
  });

  app.get("/api/dm/:odId/messages", async (req, res) => {
    const odId = req.headers["x-user-id"] as string;
    if (!odId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const messages = await storage.getDMMessages(odId, req.params.odId);
    res.json(messages);
  });

  return httpServer;
}
