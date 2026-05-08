import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { ExpressPeerServer } from "peer";
import { storage } from "./storage";
import { hashPassword, setupAuth, sessionMiddleware } from "./auth";
import {
  insertSessionSchema,
  insertMessageSchema,
  insertDocumentSchema,
  type Session,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";

type WebSocketMessage = {
  type: string;
  payload: any;
};

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user!.role !== "admin") {
    return res.sendStatus(403);
  }
  next();
}

// ── File upload (multer) ──────────────────────────────────────────────────
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ── Nodemailer transporter ────────────────────────────────────────────────
function createMailTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Serve uploaded files
  const express = (await import("express")).default;
  app.use("/uploads", express.static(UPLOADS_DIR));

  const httpServer = createServer(app);

  const peerServer = ExpressPeerServer(httpServer, { path: "/peerjs" });
  app.use("/peerjs", peerServer);
  console.log("PeerJS server configured at /peerjs");

  // ── WebSocket upgrade routing ───────────────────────────────────────────
  // The `peer` package calls socket.destroy() for any non-PeerJS upgrade
  // request, which kills Vite's HMR WebSocket before it can respond.
  // Fix: capture all listeners peer registered, remove them, then re-wrap
  // them so they only fire for /peerjs paths.  Vite registers its own
  // listener later (in setupVite) and will handle HMR paths undisturbed.

  const peerListeners = httpServer.listeners("upgrade").slice() as ((...a: any[]) => void)[];
  httpServer.removeAllListeners("upgrade");

  // Re-add PeerJS listeners wrapped to only handle /peerjs paths (no socket.destroy for others)
  peerListeners.forEach((listener) => {
    httpServer.on("upgrade", (req: any, socket: any, head: any) => {
      const { pathname } = new URL(req.url ?? "/", `http://${req.headers.host}`);
      if (pathname.startsWith("/peerjs")) {
        listener(req, socket, head);
      }
    });
  });

  const wss = new WebSocketServer({ noServer: true });
  const connections = new Map<number, WebSocket>();

  httpServer.on("upgrade", (req: any, socket: any, head: any) => {
    const { pathname } = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
    // All other paths (Vite HMR etc.) are handled by their own listeners
  });

  wss.on("connection", async (ws, req: any) => {
    // Authenticate via session — derive userId server-side, never trust client
    let userId: number | null = null;

    try {
      await new Promise<void>((resolve, reject) => {
        sessionMiddleware(req, {} as any, (err: any) =>
          err ? reject(err) : resolve()
        );
      });
      const passportUserId = req.session?.passport?.user;
      if (passportUserId != null) {
        userId = Number(passportUserId);
        connections.set(userId, ws);
        console.log(`User ${userId} connected to WebSocket`);
      } else {
        ws.close(1008, "Unauthorized");
        return;
      }
    } catch (err) {
      console.error("WS session parse error:", err);
      ws.close(1011, "Session error");
      return;
    }

    ws.on("message", async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        if (message.type === "chat_message") {
          const parsed = insertMessageSchema.safeParse({
            content: message.payload.content,
            senderId: userId,
            receiverId: message.payload.receiverId,
            timestamp: new Date(),
            read: false,
          });
          if (!parsed.success) return;

          const savedMessage = await storage.createMessage(parsed.data);

          const receiverWs = connections.get(parsed.data.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({ type: "chat_message", payload: savedMessage }));
          }
          ws.send(JSON.stringify({ type: "message_sent", payload: savedMessage }));

        } else if (message.type === "session_update") {
          const session = message.payload.session;
          [session.tutorId, session.studentId].forEach((id: number) => {
            const userWs = connections.get(id);
            if (userWs && userWs.readyState === WebSocket.OPEN && id !== userId) {
              userWs.send(JSON.stringify({ type: "session_update", payload: { session } }));
            }
          });

        } else if (message.type === "call_request") {
          // Relay call request (with caller's peer ID) to the target user
          const targetWs = connections.get(message.payload.to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: "call_request",
              payload: { from: userId, peerId: message.payload.peerId },
            }));
          }

        } else if (message.type === "peer_id") {
          // Relay answerer's peer ID back to the caller
          const targetWs = connections.get(message.payload.to);
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: "peer_id",
              payload: { from: userId, peerId: message.payload.peerId },
            }));
          }

        } else if (message.type === "call_end") {
          // Notify specific target, or broadcast if no target specified
          const targetId = message.payload.to as number | undefined;
          if (targetId) {
            const targetWs = connections.get(targetId);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({ type: "call_end", payload: { from: userId } }));
            }
          } else {
            connections.forEach((connWs, connId) => {
              if (connId !== userId && connWs.readyState === WebSocket.OPEN) {
                connWs.send(JSON.stringify({ type: "call_end", payload: { from: userId } }));
              }
            });
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });

    ws.on("close", () => {
      if (userId) {
        connections.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
  });

  // ── Sessions API ──────────────────────────────────────────────────────────

  app.get("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user!;
    const sessions =
      user.role === "admin"
        ? await storage.getAllSessions()
        : user.role === "tutor"
        ? await storage.getSessionsByTutor(user.id)
        : await storage.getSessionsByStudent(user.id);
    res.json(sessions);
  });

  app.post("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertSessionSchema.safeParse({
      ...req.body,
      startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
      endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid session data", errors: parsed.error.flatten() });
    }
    try {
      const session = await storage.createSession(parsed.data);
      res.status(201).json(session);
    } catch {
      res.status(400).json({ message: "Failed to create session" });
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sessionId = parseInt(req.params.id);
    const session = await storage.getSession(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    const isAdmin = req.user!.role === "admin";
    if (!isAdmin && session.tutorId !== req.user!.id && session.studentId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to update this session" });
    }
    try {
      const updatedData: Partial<Session> = { ...req.body };
      if (req.body.startTime) updatedData.startTime = new Date(req.body.startTime);
      if (req.body.endTime) updatedData.endTime = new Date(req.body.endTime);
      const updatedSession = await storage.updateSession(sessionId, updatedData);
      res.json(updatedSession);
    } catch {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sessionId = parseInt(req.params.id);
    const session = await storage.getSession(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    const isAdmin = req.user!.role === "admin";
    if (!isAdmin && session.tutorId !== req.user!.id && session.studentId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to delete this session" });
    }
    const success = await storage.deleteSession(sessionId);
    res.sendStatus(success ? 204 : 500);
  });

  // ── Messages API ──────────────────────────────────────────────────────────

  app.get("/api/messages/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const count = await storage.getUnreadMessageCount(req.user!.id);
    res.json({ count });
  });

  app.get("/api/messages/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const otherUserId = parseInt(req.params.userId);
    if (isNaN(otherUserId)) return res.status(400).json({ message: "Invalid user ID" });
    const messages = await storage.getMessagesBetweenUsers(req.user!.id, otherUserId);
    res.json(messages);
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertMessageSchema.safeParse({
      content: req.body.content,
      senderId: req.user!.id,
      receiverId: req.body.receiverId,
      timestamp: new Date(),
      read: false,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid message data", errors: parsed.error.flatten() });
    }
    try {
      const message = await storage.createMessage(parsed.data);
      res.status(201).json(message);
    } catch {
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.put("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const messageId = parseInt(req.params.id);
    const message = await storage.getMessage(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.receiverId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const updated = await storage.markMessageAsRead(messageId);
    res.json(updated);
  });

  // ── Documents API ─────────────────────────────────────────────────────────

  app.get("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const documents = await storage.getDocumentsSharedWithUser(req.user!.id);
    res.json(documents);
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertDocumentSchema.safeParse({
      ...req.body,
      uploaderId: req.user!.id,
      uploadTime: new Date(),
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid document data", errors: parsed.error.flatten() });
    }
    try {
      const document = await storage.createDocument(parsed.data);
      res.status(201).json(document);
    } catch {
      res.status(400).json({ message: "Failed to create document" });
    }
  });

  const updateDocumentSchema = z.object({
    sharedWithId: z.number().int().nullable(),
  });

  app.put("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const documentId = parseInt(req.params.id);
    const document = await storage.getDocument(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });
    if (document.uploaderId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to update this document" });
    }

    const parsed = updateDocumentSchema.safeParse({
      sharedWithId: req.body.sharedWithId ?? null,
    });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid document data", errors: parsed.error.flatten() });
    }

    const updatedDocument = await storage.updateDocument(documentId, parsed.data);
    if (!updatedDocument) {
      return res.status(500).json({ message: "Failed to update document" });
    }

    res.json(updatedDocument);
  });

  app.delete("/api/documents/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const documentId = parseInt(req.params.id);
    const document = await storage.getDocument(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });
    const isAdmin = req.user!.role === "admin";
    if (!isAdmin && document.uploaderId !== req.user!.id) {
      return res.status(403).json({ message: "Not authorized to delete this document" });
    }
    const success = await storage.deleteDocument(documentId);
    res.sendStatus(success ? 204 : 500);
  });

  // ── Users API ─────────────────────────────────────────────────────────────

  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const role = req.query.role as string | undefined;
    const userList = await storage.getAllUsers(role);
    res.json(userList.map(({ password, ...rest }) => rest));
  });

  app.get("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Update own profile (any authenticated user)
  app.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.id);
    if (req.user!.id !== userId && req.user!.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    const updateSchema = z.object({
      fullName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      phoneNumber: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
      avatarUrl: z.string().nullable().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }
    const updated = await storage.updateUser(userId, parsed.data);
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { password, ...safe } = updated;
    res.json(safe);
  });

  // Change password (own account only)
  app.put("/api/users/:id/password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = parseInt(req.params.id);
    if (req.user!.id !== userId) return res.status(403).json({ message: "Not authorized" });

    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    }

    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { scrypt, timingSafeEqual } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    const [hashed, salt] = user.password.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(parsed.data.currentPassword, salt, 64)) as Buffer;
    if (!timingSafeEqual(hashedBuf, suppliedBuf)) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newHashed = await hashPassword(parsed.data.newPassword);
    await storage.updateUser(userId, { password: newHashed });
    res.json({ message: "Password updated successfully" });
  });

  // Single-user delete — admin only
  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const userToDelete = await storage.getUser(userId);
    if (!userToDelete) return res.status(404).json({ message: "User not found" });
    if (userToDelete.id === req.user!.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    const success = await storage.deleteUser(userId);
    res.sendStatus(success ? 204 : 500);
  });

  // Admin: get all documents in the system
  app.get("/api/admin/documents", requireAdmin, async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const allDocs = (await Promise.all(
      allUsers.map(u => storage.getDocumentsByUploader(u.id))
    )).flat();
    res.json(allDocs);
  });

  // ── Admin API ─────────────────────────────────────────────────────────────

  const insertTutorSchema = z.object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().min(1),
    phoneNumber: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
  });

  app.post("/api/admin/tutors", requireAdmin, async (req, res) => {
    const parsed = insertTutorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid tutor data", errors: parsed.error.flatten() });
    }
    try {
      const tutorData = {
        ...parsed.data,
        username: parsed.data.username.toLowerCase(),
        email: parsed.data.email.toLowerCase(),
        role: "tutor" as const,
        password: await hashPassword(parsed.data.password),
      };
      const tutor = await storage.createUser(tutorData);
      const { password, ...tutorWithoutPassword } = tutor;
      res.status(201).json(tutorWithoutPassword);
    } catch (error) {
      console.error("Tutor creation error:", error);
      res.status(400).json({ message: "Failed to create tutor. Please check the provided information." });
    }
  });

  // ── File upload endpoint ──────────────────────────────────────────────────

  app.post("/api/upload", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  }, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      url: fileUrl,
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size,
    });
  });

  // ── Contact form API ──────────────────────────────────────────────────────

  const contactSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    subject: z.string().min(1),
    message: z.string().min(1),
  });

  app.post("/api/contact", async (req, res) => {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid contact data", errors: parsed.error.flatten() });
    }
    const { fullName, email, subject, message } = parsed.data;
    console.log("[Contact Form]", parsed.data);

    const transporter = createMailTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || email,
          to: process.env.CONTACT_EMAIL || "info@kindleahinvestment.com",
          replyTo: email,
          subject: `[Contact] ${subject}`,
          text: `From: ${fullName} <${email}>\n\n${message}`,
          html: `<p><strong>From:</strong> ${fullName} &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br>")}</p>`,
        });
        console.log("[Contact Form] Email sent to", process.env.CONTACT_EMAIL);
      } catch (err) {
        console.error("[Contact Form] Email send failed:", err);
      }
    } else {
      console.warn("[Contact Form] SMTP not configured — email not sent");
    }

    res.status(200).json({ message: "Message received. We will get back to you soon." });
  });

  return httpServer;
}
