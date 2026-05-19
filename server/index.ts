import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

function getAllowedOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || process.env.VITE_APP_PUBLIC_URL;
  if (!configuredOrigins) return [];
  return configuredOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => origin.replace(/\/$/, ""));
}

// Debug environment variables
console.log('🔧 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);

const app = express();
const server = createServer(app);
const port = parseInt(process.env.PORT || '3001', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = req.headers.origin;

  if (requestOrigin) {
    const requestOriginNormalized = requestOrigin.replace(/\/$/, "");
    if (allowedOrigins.length === 0 || allowedOrigins.includes(requestOriginNormalized)) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    }
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'Planora');
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
  try {
    console.log('🔧 Registering routes...');
    await registerRoutes(app);
    console.log('✅ Routes registered successfully');
  } catch (error) {
    console.error('❌ Failed to register routes:', error);
    process.exit(1);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.setHeader('X-Powered-By', 'Planora');
    res.status(status).json({ message, server: 'Planora' });
    throw err;
  });

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  server.listen(port, '0.0.0.0', () => {
    log(`Server running at http://localhost:${port}`);
    console.log('🌐 Server bound to 0.0.0.0:' + port);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
})();
