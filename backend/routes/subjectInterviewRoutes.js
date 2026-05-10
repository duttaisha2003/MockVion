import express from "express";
import {startSubjectInterview,submitSubjectAnswer} from "../controller/subjectInterviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { completeInterview, addProctoringEvent } from "../controller/interviewController.js"; // ← add this

const router = express.Router();

router.post("/start", authMiddleware, startSubjectInterview);
router.post("/:sessionId/submit-answer", authMiddleware, submitSubjectAnswer);
router.post("/:sessionId/complete",      authMiddleware, completeInterview);      // ← add this
router.post("/:sessionId/proctoring",    authMiddleware, addProctoringEvent); 
export default router;