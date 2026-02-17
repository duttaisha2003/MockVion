import express from "express";
import { startInterview,beginInterview,getCurrentQuestion,submitAnswer,addProctoringEvent,
  completeInterview,getInterviewResults} from "../controller/interviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import InterviewSession from "../model/interviewSession.js";

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

// List user's interviews
// router.get("/my-interviews", authMiddleware, async (req, res) => {
//   try {
//     const interviews = await InterviewSession.find({
//       user: req.user._id,
//       status: "completed"
//     })
//       .sort({ createdAt: -1 })
//       .select("_id startTime endTime totalScore averageScore duration");

//     res.json({
//       success: true,
//       data: interviews
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

export default router;