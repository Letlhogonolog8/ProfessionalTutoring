import { z } from "zod";

// ── User ──────────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  bio: string | null;
};

export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  fullName: z.string().min(1),
  role: z.string().default("student"),
  avatarUrl: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// ── Session (tutoring session) ────────────────────────────────────────────────

export type Session = {
  id: number;
  title: string;
  description: string | null;
  tutorId: number;
  studentId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
};

export const insertSessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  tutorId: z.number().int(),
  studentId: z.number().int(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.string().default("scheduled"),
  notes: z.string().nullable().optional(),
});

export type InsertSession = z.infer<typeof insertSessionSchema>;

// ── Message ───────────────────────────────────────────────────────────────────

export type Message = {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  timestamp: Date;
  read: boolean;
};

export const insertMessageSchema = z.object({
  content: z.string().min(1),
  senderId: z.number().int(),
  receiverId: z.number().int(),
  timestamp: z.date().optional(),
  read: z.boolean().default(false),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

// ── Document ──────────────────────────────────────────────────────────────────

export type Document = {
  id: number;
  name: string;
  url: string;
  uploaderId: number;
  sharedWithId: number | null;
  uploadTime: Date;
  type: string;
  size: number;
};

export const insertDocumentSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  uploaderId: z.number().int(),
  sharedWithId: z.number().int().nullable().optional(),
  uploadTime: z.date().optional(),
  type: z.string().min(1),
  size: z.number().int(),
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
