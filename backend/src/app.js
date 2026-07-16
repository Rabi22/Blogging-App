import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";
import { getLogs } from "../src/config/logStore.config.js"
import blogRouter from "./routes/blog.route.js";
import adminRoute from "./routes/admin.route.js";
import authUser from "./middleware/userAuth.middleware.js";
import adminOnly from "./middleware/adminOnly.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const allowedOrigins = [
    process.env.CLIENT_URL,
     "http://localhost:5173"
].filter(Boolean);

const app = express();
app.use(express.json());
app.use(cookieParser());

/**
 * @name SentryInit
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.httpIntegration({ spans: true }),
    Sentry.expressIntegration(),
  ],
  tracesSampleRate: 1.0,
});

/**
 * @name CORSConfig
 */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

/**
 * @name Routes
 */
app.use("/api/auth/admin", adminRoute);
app.use("/api/blog", blogRouter);

/**
 * @name MongoDBConnect
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.mongodb_url);
    console.log("Connected to DB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    Sentry.captureException(error);
  }
}
connectDB();

// error route to test Sentry
app.get("/debug-sentry", (req, res) => {
  throw new Error("My first Sentry error!");
});

// Sentry error handler
Sentry.setupExpressErrorHandler(app);

// my error handler
app.use((err, req, res, next) => {
  console.log("Unhandled error:", err);
  res.status(200).json({ message: "TEST : Internal server error" });
});

/**
 * @name logStore
 */

app.get("/logs", authUser, adminOnly, (req, res) => {
  res.json({ logs: getLogs() });
});

// Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;