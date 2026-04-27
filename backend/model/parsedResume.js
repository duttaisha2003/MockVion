
import mongoose from "mongoose";

const parsedResumeSchema = new mongoose.Schema(
  {
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true  
  },
    name: String,
    email: String,
    phone: String,
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        techStack: String,
        duration: String
      }
    ],
    achievements: [
      {
        title: String,
        description: String
      }
    ],
    hobbies: [String],
    experience: [
      {
        role: String,
        company: String,
        duration: String,
        description: String
      }
    ],
    rawText: String
  },
  { timestamps: true }
);

// Check if model already exists before creating
const ParsedResume = mongoose.models.ParsedResume || mongoose.model("ParsedResume", parsedResumeSchema);

export default ParsedResume;