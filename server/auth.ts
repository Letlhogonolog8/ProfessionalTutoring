import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, RequestHandler } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import rateLimit from "express-rate-limit";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

function sanitizeUser<T extends { password: string }>(user: T) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function createDefaultAccounts(retries = 3, delayMs = 1000) {
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const existingAdmin = await storage.getUserByUsername(adminUsername);
      if (!existingAdmin) {
        await storage.createUser({
          username: adminUsername,
          password: await hashPassword(adminPassword),
          email: "admin@kindleah.com",
          fullName: "System Administrator",
          role: "admin",
        });
        console.log("Default admin account created");
      } else {
        console.log("Admin account already exists");
      }
      return;
    } catch (error) {
      console.error(`Failed to manage accounts (attempt ${attempt}/${retries}):`, error);
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
}

export let sessionMiddleware: RequestHandler;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later." },
});

export function setupAuth(app: Express) {
  createDefaultAccounts();

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET environment variable is not set");
  }

  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret || "kindleah-academic-tutoring-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      httpOnly: true,
    },
    name: "sessionId",
  };

  app.set("trust proxy", 1);

  sessionMiddleware = session(sessionSettings);

  app.use((req, res, next) => {
    sessionMiddleware(req, res, (err) => {
      if (err) {
        console.error("Session middleware error:", err);
        return next(err);
      }
      next();
    });
  });

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user =
          (await storage.getUserByUsername(username)) ||
          (await storage.getUserByUsername(username.toLowerCase()));
        if (!user) {
          console.log("User not found:", username);
          return done(null, false);
        }
        if (!(await comparePasswords(password, user.password))) {
          console.log("Invalid password for user:", username);
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const userId = parseInt(id, 10);
      if (isNaN(userId)) {
        console.error("Invalid user ID in session:", id);
        return done(null, false);
      }
      const user = await storage.getUser(userId);
      if (!user) return done(null, false);
      done(null, user);
    } catch (error) {
      console.error("Deserialization error:", error);
      done(error);
    }
  });

  app.post("/api/register", authLimiter, async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.session.regenerate((err) => {
        if (err) return next(err);
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          res.status(201).json(sanitizeUser(user));
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", authLimiter, async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username?.trim() || !password?.trim()) {
        return res.status(401).json({ message: "Username and password are required" });
      }

      console.log("Login attempt for username:", username);

      const user =
        (await storage.getUserByUsername(username)) ||
        (await storage.getUserByUsername(username.toLowerCase()));

      if (!user) {
        console.log("User not found:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePasswords(password, user.password);
      if (!isValidPassword) {
        console.log("Invalid password for user:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.regenerate((err) => {
        if (err) return next(err);
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          console.log("Login successful for user:", user.username);
          res.status(200).json(sanitizeUser(user));
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) console.error("Session destroy error:", destroyErr);
        res.clearCookie("sessionId");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(sanitizeUser(req.user!));
  });
}
