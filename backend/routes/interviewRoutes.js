import express from "express";
import { startInterview,beginInterview,getCurrentQuestion,submitAnswer,addProctoringEvent,
  completeInterview,getInterviewResults, startJobInterview} from "../controller/interviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import InterviewSession from "../model/interviewSession.js";
import Application from "../model/Application.js";
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


export default router;