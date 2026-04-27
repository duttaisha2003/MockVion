import mongoose from "mongoose";
const { Schema } = mongoose;

const ApplicationSchema = new Schema(
  {
    jobId: {
      type: String,
      ref: "Job",
      required: true,
    },

    userId: {   
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },

    resumeId: {
      type: Schema.Types.ObjectId,
      ref: "ParsedResume",
      required: false,
    },

    resultId: {   
      type: Schema.Types.ObjectId,
      ref: "InterviewSession", 
    },

  
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected"],
      default: "applied",
    },
  },
  { timestamps: true }
);

//  Prevent duplicate apply 
ApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Application", ApplicationSchema);