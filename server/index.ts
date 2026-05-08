
import { config as loadEnv } from "dotenv";
loadEnv({ override: true });

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import os from "os";
import fs from "fs";
import https from "https";

const app = express();

// CORS — explicit allowlist before any other middleware
app.use((req, res, next) => {
  const rawOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:5000";
  const allowed = rawOrigins.split(",").map((o) => o.trim());
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handler — log but do NOT re-throw after the response is sent
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(err);
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT) || 5000;
  const host = "localhost";

  const startServer = async () => {
    try {
      const certPath = process.env.SSL_CERT_PATH;
      const keyPath = process.env.SSL_KEY_PATH;
      const useHttps = certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath);

      const listenTarget = useHttps
        ? https.createServer({ cert: fs.readFileSync(certPath!), key: fs.readFileSync(keyPath!) }, app)
        : server;

      const protocol = useHttps ? "https" : "http";

      await new Promise<void>((resolve, reject) => {
        listenTarget.listen({ port, host }, () => {
          log(`Server started on ${protocol}://${host}:${port}`);
          resolve();
        }).on("error", (err) => {
          console.error("Server error:", err);
          reject(err);
        });
      });

      const networkInterfaces = os.networkInterfaces();
      const localIP = Object.values(networkInterfaces)
        .flat()
        .find((iface) => iface?.family === "IPv4" && !iface.internal)?.address;

      if (localIP) {
        console.log(`Server accessible on your local network at: ${protocol}://${localIP}:${port}`);
      }

      log(`Server started successfully on ${protocol}://${host}:${port}`);
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  };

  startServer();
})();
