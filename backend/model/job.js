import mongoose from "mongoose";
const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    jobId: {type: String,unique: true,required: true},

    title: { type: String, required: true },

    description: { type: String, required: true },

    experienceRequired: {
      min: { type: Number, default: 0 },
      max: { type: Number }
    },

    skillsRequired: [{ type: String, required: true }],

    
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "INR" }
    },

    
    lastDate: {
      type: Date,
      required: true
    },

    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true
    }
  },
  { timestamps: true }
);

//  Auto-generate jobId
JobSchema.pre("save", async function () {
  if (!this.jobId) {
    this.jobId = "JOB-" + Date.now();
  }
});
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

export default Job;