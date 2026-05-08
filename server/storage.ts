import {
  type User, type InsertUser,
  type Session, type InsertSession,
  type Message, type InsertMessage,
  type Document, type InsertDocument,
} from "@shared/schema";
import { getSupabaseClient } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

const scryptAsync = promisify(scrypt);
async function hashPasswordLocal(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// ── IStorage interface ────────────────────────────────────────────────────────

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(role?: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  deleteAllUsers(): Promise<boolean>;

  getSession(id: number): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  getSessionsByTutor(tutorId: number): Promise<Session[]>;
  getSessionsByStudent(studentId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, sessionData: Partial<Session>): Promise<Session | undefined>;
  deleteSession(id: number): Promise<boolean>;

  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;

  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUploader(uploaderId: number): Promise<Document[]>;
  getDocumentsSharedWithUser(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  sessionStore: session.Store;
}

// ── MemStorage (in-memory fallback) ──────────────────────────────────────────

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private messages: Map<number, Message>;
  private documents: Map<number, Document>;
  sessionStore: session.Store;

  private userIdCounter = 1;
  private sessionIdCounter = 1;
  private messageIdCounter = 1;
  private documentIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.messages = new Map();
    this.documents = new Map();
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    const existing = await this.getUserByUsername("sam");
    if (!existing) {
      await this.createUser({
        username: "sam",
        email: "samuel@kindleahinvestment.com",
        password: await hashPasswordLocal("inw73KYI!"),
        fullName: "Samuel Silabele",
        role: "tutor",
        phoneNumber: "0734801665",
        bio: "PhD in Research Methodology with 10+ years of tutoring experience. Specialized in quantitative, qualitative, and mixed methods research approaches.",
        avatarUrl: "/tutor.jpg",
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const lower = username.toLowerCase();
    return Array.from(this.users.values()).find(u => u.username.toLowerCase() === lower);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async getAllUsers(role?: string): Promise<User[]> {
    const all = Array.from(this.users.values());
    return role ? all.filter(u => u.role === role) : all;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = {
      ...userData,
      id,
      role: userData.role ?? "student",
      avatarUrl: userData.avatarUrl ?? null,
      phoneNumber: userData.phoneNumber ?? null,
      bio: userData.bio ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated: User = { ...user, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async deleteAllUsers(): Promise<boolean> {
    this.users.clear();
    this.userIdCounter = 1;
    return true;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSessionsByTutor(tutorId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.tutorId === tutorId);
  }

  async getSessionsByStudent(studentId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(s => s.studentId === studentId);
  }

  async createSession(sessionData: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const s: Session = {
      ...sessionData,
      id,
      status: sessionData.status ?? "scheduled",
      description: sessionData.description ?? null,
      notes: sessionData.notes ?? null,
    };
    this.sessions.set(id, s);
    return s;
  }

  async updateSession(id: number, sessionData: Partial<Session>): Promise<Session | undefined> {
    const s = this.sessions.get(id);
    if (!s) return undefined;
    const updated: Session = { ...s, ...sessionData };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: number): Promise<boolean> {
    return this.sessions.delete(id);
  }

  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const msg: Message = {
      ...messageData,
      id,
      timestamp: messageData.timestamp ?? new Date(),
      read: messageData.read ?? false,
    };
    this.messages.set(id, msg);
    return msg;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const msg = this.messages.get(id);
    if (!msg) return undefined;
    const updated: Message = { ...msg, read: true };
    this.messages.set(id, updated);
    return updated;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      m => m.receiverId === userId && !m.read
    ).length;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUploader(uploaderId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.uploaderId === uploaderId);
  }

  async getDocumentsSharedWithUser(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      d => d.sharedWithId === userId || d.sharedWithId === null || d.uploaderId === userId
    );
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const doc: Document = {
      ...documentData,
      id,
      sharedWithId: documentData.sharedWithId ?? null,
      uploadTime: documentData.uploadTime ?? new Date(),
    };
    this.documents.set(id, doc);
    return doc;
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const doc = this.documents.get(id);
    if (!doc) return undefined;
    const updated: Document = { ...doc, ...documentData };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

// ── Supabase row types (snake_case columns) ───────────────────────────────────

type DbUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  phone_number: string | null;
  bio: string | null;
};

type DbSession = {
  id: number;
  title: string;
  description: string | null;
  tutor_id: number;
  student_id: number;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
};

type DbMessage = {
  id: number;
  content: string;
  sender_id: number;
  receiver_id: number;
  timestamp: string;
  read: boolean;
};

type DbDocument = {
  id: number;
  name: string;
  url: string;
  uploader_id: number;
  shared_with_id: number | null;
  upload_time: string;
  type: string;
  size: number;
};

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapUser(r: DbUser): User {
  return {
    id: r.id,
    username: r.username,
    email: r.email,
    password: r.password,
    fullName: r.full_name,
    role: r.role,
    avatarUrl: r.avatar_url,
    phoneNumber: r.phone_number,
    bio: r.bio,
  };
}

function mapSession(r: DbSession): Session {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    tutorId: r.tutor_id,
    studentId: r.student_id,
    startTime: new Date(r.start_time),
    endTime: new Date(r.end_time),
    status: r.status,
    notes: r.notes,
  };
}

function mapMessage(r: DbMessage): Message {
  return {
    id: r.id,
    content: r.content,
    senderId: r.sender_id,
    receiverId: r.receiver_id,
    timestamp: new Date(r.timestamp),
    read: r.read,
  };
}

function mapDocument(r: DbDocument): Document {
  return {
    id: r.id,
    name: r.name,
    url: r.url,
    uploaderId: r.uploader_id,
    sharedWithId: r.shared_with_id,
    uploadTime: new Date(r.upload_time),
    type: r.type,
    size: r.size,
  };
}

// ── SupabaseStorage ───────────────────────────────────────────────────────────

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  private get db() {
    return getSupabaseClient();
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapUser(data as DbUser);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle();
    if (error || !data) return undefined;
    return mapUser(data as DbUser);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.db
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (error || !data) return undefined;
    return mapUser(data as DbUser);
  }

  async getAllUsers(role?: string): Promise<User[]> {
    let query = this.db.from("users").select("*");
    if (role) query = query.eq("role", role);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as DbUser[]).map(mapUser);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const row = {
      username: userData.username.toLowerCase(),
      email: userData.email.toLowerCase(),
      password: userData.password,
      full_name: userData.fullName,
      role: userData.role ?? "student",
      avatar_url: userData.avatarUrl ?? null,
      phone_number: userData.phoneNumber ?? null,
      bio: userData.bio ?? null,
    };
    const { data, error } = await this.db
      .from("users")
      .insert(row)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create user: ${error?.message}`);
    return mapUser(data as DbUser);
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const row: Record<string, unknown> = {};
    if (userData.username !== undefined) row.username = userData.username;
    if (userData.email !== undefined) row.email = userData.email;
    if (userData.password !== undefined) row.password = userData.password;
    if (userData.fullName !== undefined) row.full_name = userData.fullName;
    if (userData.role !== undefined) row.role = userData.role;
    if (userData.avatarUrl !== undefined) row.avatar_url = userData.avatarUrl;
    if (userData.phoneNumber !== undefined) row.phone_number = userData.phoneNumber;
    if (userData.bio !== undefined) row.bio = userData.bio;

    const { data, error } = await this.db
      .from("users")
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return undefined;
    return mapUser(data as DbUser);
  }

  async deleteUser(id: number): Promise<boolean> {
    const { error } = await this.db.from("users").delete().eq("id", id);
    return !error;
  }

  async deleteAllUsers(): Promise<boolean> {
    const { error } = await this.db.from("users").delete().neq("id", 0);
    return !error;
  }

  // ── Sessions ───────────────────────────────────────────────────────────────

  async getSession(id: number): Promise<Session | undefined> {
    const { data, error } = await this.db
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapSession(data as DbSession);
  }

  async getAllSessions(): Promise<Session[]> {
    const { data, error } = await this.db.from("sessions").select("*");
    if (error || !data) return [];
    return (data as DbSession[]).map(mapSession);
  }

  async getSessionsByTutor(tutorId: number): Promise<Session[]> {
    const { data, error } = await this.db
      .from("sessions")
      .select("*")
      .eq("tutor_id", tutorId);
    if (error || !data) return [];
    return (data as DbSession[]).map(mapSession);
  }

  async getSessionsByStudent(studentId: number): Promise<Session[]> {
    const { data, error } = await this.db
      .from("sessions")
      .select("*")
      .eq("student_id", studentId);
    if (error || !data) return [];
    return (data as DbSession[]).map(mapSession);
  }

  async createSession(sessionData: InsertSession): Promise<Session> {
    const row = {
      title: sessionData.title,
      description: sessionData.description ?? null,
      tutor_id: sessionData.tutorId,
      student_id: sessionData.studentId,
      start_time: sessionData.startTime.toISOString(),
      end_time: sessionData.endTime.toISOString(),
      status: sessionData.status ?? "scheduled",
      notes: sessionData.notes ?? null,
    };
    const { data, error } = await this.db
      .from("sessions")
      .insert(row)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create session: ${error?.message}`);
    return mapSession(data as DbSession);
  }

  async updateSession(id: number, sessionData: Partial<Session>): Promise<Session | undefined> {
    const row: Record<string, unknown> = {};
    if (sessionData.title !== undefined) row.title = sessionData.title;
    if (sessionData.description !== undefined) row.description = sessionData.description;
    if (sessionData.tutorId !== undefined) row.tutor_id = sessionData.tutorId;
    if (sessionData.studentId !== undefined) row.student_id = sessionData.studentId;
    if (sessionData.startTime !== undefined) row.start_time = sessionData.startTime.toISOString();
    if (sessionData.endTime !== undefined) row.end_time = sessionData.endTime.toISOString();
    if (sessionData.status !== undefined) row.status = sessionData.status;
    if (sessionData.notes !== undefined) row.notes = sessionData.notes;

    const { data, error } = await this.db
      .from("sessions")
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return undefined;
    return mapSession(data as DbSession);
  }

  async deleteSession(id: number): Promise<boolean> {
    const { error } = await this.db.from("sessions").delete().eq("id", id);
    return !error;
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  async getMessage(id: number): Promise<Message | undefined> {
    const { data, error } = await this.db
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapMessage(data as DbMessage);
  }

  async getMessagesBetweenUsers(userId1: number, userId2: number): Promise<Message[]> {
    const { data, error } = await this.db
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order("timestamp", { ascending: true });
    if (error || !data) return [];
    return (data as DbMessage[]).map(mapMessage);
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const row = {
      content: messageData.content,
      sender_id: messageData.senderId,
      receiver_id: messageData.receiverId,
      timestamp: (messageData.timestamp ?? new Date()).toISOString(),
      read: messageData.read ?? false,
    };
    const { data, error } = await this.db
      .from("messages")
      .insert(row)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create message: ${error?.message}`);
    return mapMessage(data as DbMessage);
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const { data, error } = await this.db
      .from("messages")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return undefined;
    return mapMessage(data as DbMessage);
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const { count, error } = await this.db
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("read", false);
    if (error) return 0;
    return count ?? 0;
  }

  // ── Documents ──────────────────────────────────────────────────────────────

  async getDocument(id: number): Promise<Document | undefined> {
    const { data, error } = await this.db
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapDocument(data as DbDocument);
  }

  async getDocumentsByUploader(uploaderId: number): Promise<Document[]> {
    const { data, error } = await this.db
      .from("documents")
      .select("*")
      .eq("uploader_id", uploaderId);
    if (error || !data) return [];
    return (data as DbDocument[]).map(mapDocument);
  }

  async getDocumentsSharedWithUser(userId: number): Promise<Document[]> {
    const { data, error } = await this.db
      .from("documents")
      .select("*")
      .or(`shared_with_id.eq.${userId},shared_with_id.is.null,uploader_id.eq.${userId}`);
    if (error || !data) return [];
    return (data as DbDocument[]).map(mapDocument);
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const row = {
      name: documentData.name,
      url: documentData.url,
      uploader_id: documentData.uploaderId,
      shared_with_id: documentData.sharedWithId ?? null,
      upload_time: (documentData.uploadTime ?? new Date()).toISOString(),
      type: documentData.type,
      size: documentData.size,
    };
    const { data, error } = await this.db
      .from("documents")
      .insert(row)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to create document: ${error?.message}`);
    return mapDocument(data as DbDocument);
  }

  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document | undefined> {
    const row: Record<string, unknown> = {};
    if (documentData.name !== undefined) row.name = documentData.name;
    if (documentData.url !== undefined) row.url = documentData.url;
    if (documentData.sharedWithId !== undefined) row.shared_with_id = documentData.sharedWithId;
    if (documentData.type !== undefined) row.type = documentData.type;
    if (documentData.size !== undefined) row.size = documentData.size;

    const { data, error } = await this.db
      .from("documents")
      .update(row)
      .eq("id", id)
      .select()
      .single();
    if (error || !data) return undefined;
    return mapDocument(data as DbDocument);
  }

  async deleteDocument(id: number): Promise<boolean> {
    const { error } = await this.db.from("documents").delete().eq("id", id);
    return !error;
  }
}

// ── Active storage instance ───────────────────────────────────────────────────

export const storage: IStorage =
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    ? new SupabaseStorage()
    : new MemStorage();
