
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";

import main from "./config/db.js";
import authRoutes from "./routes/UserAuthRoute.js";
import resumeRoute from "./routes/ResumeRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";

import subjectInterviewRoutes from "./routes/subjectInterviewRoutes.js";

const app = express();
const httpServer = createServer(app);


// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['https://mock-vion-kktd.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Routes
  app.use("/api/auth", authRoutes);
app.use("/resume", resumeRoute);
app.use('/api/interview', interviewRoutes);

app.use("/api/subject-interview", subjectInterviewRoutes);
app.use("/api/recruiter", recruiterRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    availableRoutes: [
      "GET /health",
      "GET /ws-test",
      "POST /api/interview/start",
      "POST /api/interview/:sessionId/begin",
      "GET /api/interview/:sessionId/current-question",
      "POST /api/interview/:sessionId/submit-answer",
      "GET /api/interview/:sessionId/results"
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// DB connect + server start
main()
  .then(() => {
    httpServer.listen(process.env.PORT, () => {
      console.log(" Server listening at port:", process.env.PORT);
      console.log(" HTTP Endpoints:");
      console.log("   - POST /api/interview/start");
      console.log("   - POST /api/interview/:sessionId/begin");
      console.log("   - GET  /api/interview/:sessionId/current-question");
      console.log("   - POST /api/interview/:sessionId/submit-answer");
    
    });
  })
  .catch((err) => {
    console.error(" DB Error:", err);
    process.exit(1);
  });