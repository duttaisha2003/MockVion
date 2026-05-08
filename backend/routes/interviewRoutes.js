import express from "express";
import { startInterview,beginInterview,getCurrentQuestion,submitAnswer,addProctoringEvent,
  completeInterview,getInterviewResults, startJobInterview} from "../controller/interviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import InterviewSession from "../model/interviewSession.js";
import Application from "../model/application.js";
const router = express.Router();

// Start new interview session
router.post("/start", authMiddleware, startInterview);

// Begin an interview (start timer, etc.)
router.post("/:sessionId/begin", authMiddleware, beginInterview);

// Get current question
router.get("/:sessionId/current-question", authMiddleware, getCurrentQuestion);

// Submit answer and get next question
router.post("/:sessionId/submit-answer", authMiddleware, submitAnswer);

// Add proctoring event during interview
router.post("/:sessionId/proctoring", authMiddleware, addProctoringEvent);

// Manually complete interview
router.post("/:sessionId/complete", authMiddleware, completeInterview);

router.get("/my-interviews", authMiddleware, async (req, res) => {
  try {
    const interviews = await InterviewSession.find({
      user: req.user._id,
      status: "completed"
    })
      .sort({ createdAt: -1 })
      .select("_id startTime endTime totalScore averageScore duration");

    res.json({
      success: true,
      data: interviews
    });
  } catch (error) {
    console.error("My Interviews Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// Get interview results
router.get("/:sessionId/results", authMiddleware, getInterviewResults);
// Start job-based interview
router.post("/start-job", authMiddleware, startJobInterview);


router.get("/check-applied/:jobId", authMiddleware, async (req, res) => {
  try {
    

    const application = await Application.findOne({
      jobId: req.params.jobId,
      userId: req.user._id
    });

    res.json({
      success: true,
      applied: !!application
    });

  } catch (error) {
    console.log("ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

import dotenv from "dotenv";
dotenv.config();


import multer from "multer";
import { AssemblyAI } from "assemblyai";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY, // set in your .env
});

// POST /api/transcribe
// Receives audio blob from frontend, returns transcribed text
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    // console.log(
    //   `📥 Audio received: ${req.file.size} bytes, type: ${req.file.mimetype}`
    // );

    // Step 1: Upload audio buffer to AssemblyAI
    const uploadResponse = await client.files.upload(req.file.buffer, {
      // AssemblyAI auto-detects format from buffer
    });

    // console.log("⬆️ Uploaded to AssemblyAI:", uploadResponse);

    // Step 2: Request transcription (polls until complete)
    const transcript = await client.transcripts.transcribe({
      audio_url: uploadResponse,        // upload returns URL string directly
      speech_models: ["universal-3-pro", "universal-2"],       // best accuracy
      language_code: "en",
      punctuate: true,
      format_text: true,
    });

    if (transcript.status === "error") {
      console.error("AssemblyAI transcription error:", transcript.error);
      return res.status(500).json({ error: transcript.error });
    }

    const text = transcript.text || "";
    // console.log("✅ Transcription complete:", text);

    res.json({ text });
  } catch (err) {
    console.error("Transcription route error:", err);
    res.status(500).json({ error: "Transcription failed", detail: err.message });
  }
});

export default router;