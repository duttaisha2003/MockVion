import InterviewSession from '../model/interviewSession.js';
import ParsedResume from '../model/parsedResume.js';
import { generateQuestions, evaluateAnswer,generateJobQuestionsFromAI } from '../services/groqService.js';
import Application from "../model/application.js";
import Job from "../model/job.js";
export const startInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { interviewType = 'mixed', totalQuestions = 5 } = req.body;

    
    const resume = await ParsedResume.findOne({ user: userId });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "No resume found. Please upload your resume first."
      });
    }

  
    const generatedQuestions = await generateInterviewQuestions(resume, interviewType, totalQuestions);


    const interviewSession = new InterviewSession({
      user: userId,
      resume: resume._id,
      questions: generatedQuestions,
      currentQuestionIndex: -1, 
      status: 'pending',
      interviewType,
      totalQuestions,
      sessionToken: generateSessionToken(),
      roomId: generateRoomId()
    });

    await interviewSession.save();

    res.status(201).json({
      success: true,
      message: "Interview session created successfully",
      data: {
        sessionId: interviewSession._id,
        roomId: interviewSession.roomId,
        sessionToken: interviewSession.sessionToken,
        totalQuestions: interviewSession.questions.length,
        status: interviewSession.status
      }
    });

  } catch (error) {
    console.error("Start Interview Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to start interview"
    });
  }
};
export const startJobInterview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId, interviewType = "technical", totalQuestions = 10 } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required" });
    }

    
    const job = await Job.findOne({ jobId });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication?.resultId) {
      return res.status(400).json({ success: false, message: "You already attempted this interview" });
    }

    const generatedQuestions = await generateJobQuestions(job, interviewType, totalQuestions);

    const interviewSession = new InterviewSession({
      user: userId,
      questions: generatedQuestions,
      currentQuestionIndex: -1,
      status: "pending",
      interviewType,
      totalQuestions,
      sessionToken: generateSessionToken(),
      roomId: generateRoomId(),
      autoSubmitted: false
    });

    await interviewSession.save();

    res.status(201).json({
      success: true,
      message: "Job interview created",
      data: {
        sessionId: interviewSession._id,
        totalQuestions: interviewSession.questions.length
      }
    });

  } catch (error) {
    console.error("Start Job Interview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const beginInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    
    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId,
      status: 'pending'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or already started"
      });
    }

    session.status = 'active';
    session.startTime = new Date();
    session.currentQuestionIndex = 0; 
    await session.save();

    const firstQuestion = session.questions[0];

    res.json({
      success: true,
      message: "Interview started",
      data: {
        sessionId: session._id,
        currentQuestion: firstQuestion,
        questionIndex: 0,
        totalQuestions: session.questions.length,
        timeLimit: firstQuestion.timeLimit,
        progress: 0
      }
    });

  } catch (error) {
    console.error("Begin Interview Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to begin interview"
    });
  }
};

export const getCurrentQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId,
      status: 'active'
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Active session not found"
      });
    }

    const currentQuestion = session.currentQuestion;

    res.json({
      success: true,
      data: {
        question: currentQuestion,
        questionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        timeLimit: currentQuestion?.timeLimit || 120,
        progress: session.progress
      }
    });

  } catch (error) {
    console.error("Get Question Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get question"
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const {
      answer,
      timeliness,
      confidence,
      noiseLevel,
      plagiarismDetected = false,
      helpDetected = false
    } = req.body;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId,
      status: "active"
    });

    if (!session || session.currentQuestionIndex < 0) {
      return res.status(404).json({
        success: false,
        message: "No active question found"
      });
    }

    const currentQuestion = session.currentQuestion;

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: "No current question available"
      });
    }

    const evaluation = await evaluateAnswer(
      currentQuestion.text,
      answer
    );

    const answerEvaluation = {
      question: currentQuestion.text,
      answer: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      timeliness: timeliness || 0,
      confidence: confidence || 0,
      noiseLevel: noiseLevel || 0,
      plagiarismDetected,
      helpDetected,
      aiEvaluation: evaluation
    };

    await session.addAnswer(answerEvaluation);

    const hasMoreQuestions =
      session.currentQuestionIndex < session.questions.length - 1;

    if (hasMoreQuestions) {
      session.nextQuestion();
    }

    await session.save();

    res.json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        evaluation: {
          score: evaluation.score,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements
        },
        hasMoreQuestions,
        nextQuestion: hasMoreQuestions
          ? session.currentQuestion
          : null,
        questionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        progress: session.progress,
        sessionStatus: session.status
      }
    });

  } catch (error) {
    console.error("Submit Answer Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit answer"
    });
  }
};

export const addProctoringEvent = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { eventType, severity, details } = req.body;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // ── NO proctoringEvents.push() — summary only ──
    switch (eventType) {
      case 'background_change':
        session.proctoringSummary.backgroundChanges += 1;
        break;
      case 'multiple_faces':
        session.proctoringSummary.multipleFacesDetected += 1;
        break;
      case 'noise_detected':
        session.proctoringSummary.highNoiseLevels += 1;
        break;
      case 'tab_switch':
        session.proctoringSummary.tabSwitches += 1;
        break;
      case 'face_absence':
        session.proctoringSummary.faceAbsences += 1;
        break;
      case 'look_away':
        session.proctoringSummary.lookAways += 1;
        break;
      case 'face_inconsistency':
        session.proctoringSummary.faceSwaps += 1;
        break;
      case 'object_detected':
        session.proctoringSummary.objectsDetected += 1;
        break;
    }

    // Risk based on summary totals, not events array
    const s = session.proctoringSummary;
    const highCount = s.faceAbsences + s.multipleFacesDetected + s.faceSwaps + s.objectsDetected;
    const medCount  = s.lookAways + s.tabSwitches + s.backgroundChanges;

    if (highCount > 5) {
      session.proctoringSummary.overallRisk = 'high';
    } else if (highCount > 2 || medCount > 8) {
      session.proctoringSummary.overallRisk = 'medium';
    }

    await session.save();
    res.json({ success: true, message: "Proctoring event recorded" });

  } catch (error) {
    console.error("Proctoring Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to record proctoring event" });
  }
};

export const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;
    const { jobId } = req.body; 
      console.log(jobId);
    const session = await InterviewSession.findOne({ _id: sessionId, user: userId });

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.status === "completed") {
      return res.json({ success: true, message: "Interview already completed", data: session });
    }

    
    session.status = "completed";
    session.endTime = new Date();
    session.duration = Math.floor((session.endTime - session.startTime) / 1000);

   
    session.totalScore = session.answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
    session.averageScore = session.answers.length > 0
      ? session.totalScore / session.answers.length
      : 0;

    await session.save();

    if (jobId) {
      await Application.findOneAndUpdate(
        { jobId, userId },
        {
          jobId,
          userId,
          resultId: session._id,
          score: parseFloat(session.averageScore.toFixed(2)),
          status: "applied"   
        },
        { upsert: true, new: true }
      );
    }


    res.json({
      success: true,
      message: "Interview completed successfully",
      data: {
        sessionId: session._id,
        averageScore: session.averageScore,
        totalScore: session.totalScore,
        totalAnswers: session.answers.length
      }
    });

  } catch (error) {
    console.error("Complete Interview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getInterviewResults = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId
    }).populate('resume', 'name skills experience');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found"
      });
    }

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.duration,
          totalQuestions: session.questions.length,
          questionsAnswered: session.answers.length
        },
        scores: {
          totalScore: session.totalScore,
          averageScore: session.averageScore,
          performance: session.performance
        },
        answers: session.answers.map((ans, idx) => ({
          question: session.questions[idx]?.text || 'Unknown',
          answer: ans.answer,
          score: ans.score,
          feedback: ans.feedback,
          timeliness: ans.timeliness,
          confidence: ans.confidence
        })),
        proctoring: session.proctoringSummary,
        resume: session.resume
      }
    });

  } catch (error) {
    console.error("Get Results Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get interview results"
    });
  }
};


async function generateInterviewQuestions(resume, interviewType, totalQuestions) {
 
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  const projects = resume.projects || [];
  

  const resumeText = `
    Name: ${resume.name}
    Skills: ${skills.join(', ')}
    Experience: ${experience.map(exp => `${exp.role} at ${exp.company}: ${exp.description}`).join(' | ')}
    Projects: ${projects.map(proj => `${proj.title}: ${proj.description} (Tech: ${proj.techStack})`).join(' | ')}
    Achievements: ${(resume.achievements || []).join(', ')}
  `;


  const questions = await generateQuestions(resumeText, interviewType, totalQuestions);
  

  return questions.map((q, index) => ({
    text: q.question,
    type: q.type || 'technical',
    difficulty: q.difficulty || 'medium',
    category: q.category || 'General',
    timeLimit: q.timeLimit && q.timeLimit >= 30 ? q.timeLimit : 120,
    expectedKeywords: q.keywords || []
  }));
}
async function generateJobQuestions(job, interviewType, totalQuestions) {
  const jobText = `
    Title: ${job.title}
    Skills: ${(job.skills || []).join(", ")}
    Description: ${job.description}
  `;

  const questions = await generateJobQuestionsFromAI(jobText,interviewType,totalQuestions);

  return questions.map(q => ({
    text: q.text,
    type: q.type || "technical",
    difficulty: q.difficulty || "medium",
    timeLimit: q.timeLimit && q.timeLimit >= 30 ? q.timeLimit : 120
  }));
}
function generateSessionToken() {
  return 'sess_' + Math.random().toString(36).substr(2, 16);
}

function generateRoomId() {
  return 'room_' + Math.random().toString(36).substr(2, 9);
}