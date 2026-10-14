import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import config from "./config/config.js";
import connectDB from "./config/db.js";

import requestLogger from "./middleware/requestLogger.js";
import {
  notFound,
  errorHandler,
} from "./middleware/errorMiddleware.js";

// ===============================
// Routes
// ===============================
import authRoutes from "./routes/authRoutes.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import signalRoutes from "./routes/signalRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import laneRoutes from "./routes/laneRoutes.js";

const app = express();

// ===============================
// Database
// ===============================
connectDB();

// ===============================
// Security
// ===============================
app.use(helmet());

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

// ===============================
// Body Parser
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Serve Processed Lane Videos
// ===============================
app.use(
  "/videos",
  express.static(
    path.resolve(
      process.cwd(),
      "ml-model",
      "videos",
      "processed"
    )
  )
);

// ===============================
// Logging
// ===============================
app.use(morgan("dev"));
app.use(requestLogger);

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Smart Traffic Management System API is running",
    project:
      "Smart Traffic Management System for Urban Congestion",
  });
});

// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/traffic", trafficRoutes);

app.use("/api/signals", signalRoutes);

app.use("/api/incidents", incidentRoutes);

app.use("/api/routes", routeRoutes);

app.use("/api/analytics", analyticsRoutes);

// ===============================
// Lane Detection
// ===============================
app.use("/api/lane", laneRoutes);

// ===============================
// Error Handling
// ===============================
app.use(notFound);
app.use(errorHandler);

// ===============================
// Start Server
// ===============================
app.listen(config.port, () => {
  console.log(
    `🚦 Smart Traffic API running on http://localhost:${config.port}`
  );

  console.log(
    `🎥 Processed videos available at http://localhost:${config.port}/videos/`
  );
});