import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: String,
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'situational', 'project-based'],
    default: 'technical'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: String, // e.g., "JavaScript", "React", "System Design"
  expectedKeywords: [String],
  timeLimit: { type: Number, default: 120 }, // seconds
  generatedAt: { type: Date, default: Date.now }
});

const answerEvaluationSchema = new mongoose.Schema({
  question: String,
  answer: String,
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: String,
  strengths: [String],
  improvements: [String],
  timeliness: Number, // Response time in seconds
  confidence: Number, // Voice confidence score 1-10
  plagiarismDetected: Boolean,
  helpDetected: Boolean,
  noiseLevel: Number, // 1-10 scale
  aiEvaluation: Object, // Raw AI evaluation
  evaluationTime: { type: Date, default: Date.now }
});

const proctoringEventSchema = new mongoose.Schema({
  timestamp: Date,
  eventType: {
    type: String,
    enum: ['background_change', 'multiple_faces', 'noise_detected', 'tab_switch', 'mobile_usage', 'voice_absent']
  },
  severity: { type: String, enum: ['low', 'medium', 'high'] },
  details: {
  type: mongoose.Schema.Types.Mixed
}
});

const interviewSessionSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParsedResume',
      required: true
    },
    questions: [questionSchema],
    currentQuestionIndex: {
      type: Number,
      default: -1 // -1 means not started, 0-based indexing
    },
    answers: [answerEvaluationSchema],
    status: {
      type: String,
      enum: ['pending', 'active', 'paused', 'completed', 'terminated'],
      default: 'pending'
    },
    startTime: Date,
    endTime: Date,
    duration: Number, // Total duration in seconds
    totalScore: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    // Video call specific
    sessionToken: String,
    roomId: String,
    peerConnection: {
      status: String,
      connectedAt: Date,
      disconnectedAt: Date
    },
    // Enhanced proctoring
    proctoringEvents: [proctoringEventSchema],
    proctoringSummary: {
      backgroundChanges: { type: Number, default: 0 },
      multipleFacesDetected: { type: Number, default: 0 },
      highNoiseLevels: { type: Number, default: 0 },
      suspiciousActivities: { type: Number, default: 0 },
      tabSwitches: { type: Number, default: 0 },
      overallRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'low' }
    },
    // Interview settings
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'mixed'],
      default: 'mixed'
    },
    totalQuestions: { type: Number, default: 5 },
    // Analytics
    performance: {
      technicalScore: Number,
      behavioralScore: Number,
      communicationScore: Number,
      timeManagementScore: Number
    }
  }, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
// Virtual for current question
interviewSessionSchema.virtual('currentQuestion').get(function () {
  if (!this.questions || !Array.isArray(this.questions)) return null;

  if (
    this.currentQuestionIndex >= 0 &&
    this.currentQuestionIndex < this.questions.length
  ) {
    return this.questions[this.currentQuestionIndex];
  }

  return null;
});

// Virtual for progress
interviewSessionSchema.virtual('progress').get(function () {
  if (!this.questions || !Array.isArray(this.questions)) return 0;

  if (this.questions.length === 0) return 0;

  return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
});

// Method to move to next question
interviewSessionSchema.methods.nextQuestion = function () {
  if (!this.questions || !Array.isArray(this.questions)) return null;

  if (this.currentQuestionIndex < this.questions.length - 1) {
    this.currentQuestionIndex += 1;
    return this.questions[this.currentQuestionIndex];
  }

  return null;
};


// Method to add answer and calculate score
interviewSessionSchema.methods.addAnswer = async function(answerData) {
  const answer = {
    ...answerData,
    evaluationTime: new Date()
  };
  
  this.answers.push(answer);
  
  // Calculate scores
  this.totalScore = this.answers.reduce((sum, ans) => sum + (ans.score || 0), 0);
  this.averageScore = this.answers.length > 0 ? this.totalScore / this.answers.length : 0;
  
  await this.save();
  return answer;
};

export default mongoose.model('InterviewSession', interviewSessionSchema);