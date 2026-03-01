

import InterviewSession from "../model/interviewSession.js";
import { generateSubjectQuestion } from "../services/questionGenerator.js";
import { evaluateSubjectAnswer } from "../services/answerEvaluator.js";

const difficultyPlan = ["easy", "easy", "medium", "medium", "medium", "hard"];

/* =============== START SUBJECT INTERVIEW================== */
export const startSubjectInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subject } = req.body;

    const normalizedSubject = subject.toLowerCase();

    const session = await InterviewSession.create({
      user: userId,
      subject: normalizedSubject,
      questions: [],
      currentQuestionIndex: 0,
      status: "active",
      interviewType: "technical",
      totalQuestions: 6,
      resolvedGaps: [],
      startTime: new Date()
    });

    const firstDifficulty = difficultyPlan[0];

    const firstQuestion = await generateSubjectQuestion(
      normalizedSubject,
      null,
      firstDifficulty
    );

    session.questions.push(firstQuestion);
    await session.save();

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        currentQuestion: firstQuestion
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ===================== SUBMIT ANSWER======================== */
export const submitSubjectAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;

    const session = await InterviewSession.findById(sessionId);

    if (!session || session.status !== "active") {
      return res.status(404).json({ message: "Active session not found" });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    if (!currentQuestion) {
      return res.status(400).json({ message: "No active question" });
    }

    /* ===================== 1️⃣ Evaluate Answer ===================== */
    const evaluation = await evaluateSubjectAnswer(currentQuestion, answer);

    /* ===================== 2️⃣ Store Answer ======================== */
     session.answers.push({
      question: currentQuestion.text,
      answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      aiEvaluation: evaluation,
    });

    /* ===================== 3️⃣ Stop If Interview Complete ========== */
    if (session.answers.length >= session.totalQuestions) {
      session.status = "completed";
      session.endTime = new Date();
      session.duration = Math.floor(
      (session.endTime - session.startTime) / 1000
    );
      const totalScore = session.answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
      const averageScore = session.answers.length > 0 ? totalScore / session.answers.length : 0;

      session.totalScore = totalScore;
      session.averageScore = averageScore;

      await session.save();

      return res.json({ message: "Interview completed", totalScore, averageScore });
    }

    /* ===================== 4️⃣ Decide Next Topic ================== */
    const askedTopics = session.questions.map((q) => q.category);
    const resolvedGaps = session.resolvedGaps || [];

    let nextTopic = null;
    let nextDifficulty =
      difficultyPlan[session.currentQuestionIndex + 1] || currentQuestion.difficulty;

    if (
      evaluation.nextQuestionStrategy === "gap_based" &&
      evaluation.knowledgeGapTopics?.length
    ) {
      const unresolvedGap = evaluation.knowledgeGapTopics.find(
        (topic) => !askedTopics.includes(topic) && !resolvedGaps.includes(topic)
      );
      if (unresolvedGap) nextTopic = unresolvedGap;
    }

    if (!nextTopic && evaluation.nextQuestionStrategy === "next_topic") {
      if (evaluation.nextQuestionTopic && !askedTopics.includes(evaluation.nextQuestionTopic)) {
        nextTopic = evaluation.nextQuestionTopic;
      }
    }

    /* ===================== 5️⃣ Generate Next Question ================== */
    const nextQuestion = await generateSubjectQuestion(
      session.subject,
      nextTopic,
      nextDifficulty
    );

    // Guard: if generator fails, end interview gracefully
    if (!nextQuestion) {
      session.status = "completed";
      session.endTime = new Date();
      await session.save();

      return res.json({
        message: "Interview completed (no more questions available)",
        evaluation,
        totalScore: session.totalScore || 0,
        averageScore: session.averageScore || 0,
        hasMoreQuestions: false,
      });
    }

   /* ===================== 6️⃣ Store Next Question ================== */
    if (!Array.isArray(session.questions)) session.questions = [];
    if (!Array.isArray(session.resolvedGaps)) session.resolvedGaps = [];

    session.questions.push(nextQuestion);
    session.currentQuestionIndex += 1;

    if (evaluation.nextQuestionStrategy === "gap_based" && currentQuestion.category) {
      session.resolvedGaps.push(currentQuestion.category);
    }

    await session.save();

    res.json({
      evaluation,
      nextQuestion,
      hasMoreQuestions: true,
    });
  } catch (error) {
    console.error("SubmitAnswer Error:", error);
    res.status(500).json({ message: error.message });
  }
};