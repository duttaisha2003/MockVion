import express from "express";
import {startSubjectInterview,submitSubjectAnswer} from "../controller/subjectInterviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startSubjectInterview);
router.post("/:sessionId/submit-answer", authMiddleware, submitSubjectAnswer);

export default router;