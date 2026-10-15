import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import taskRoutes from "./routes/tasks.routes";
import goalRoutes from "./routes/goals.routes";
import scheduleRoutes from "./routes/schedule.routes";
import plannerRoutes from "./routes/planner.routes";
import { requireAuth } from "./middleware/auth";
import { errorHandler } from "./middleware/errors";

export const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "planwise-backend" }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/goals", requireAuth, goalRoutes);
app.use("/api/schedule", requireAuth, scheduleRoutes);
app.use("/api/planner", requireAuth, plannerRoutes);

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
app.use(errorHandler);
