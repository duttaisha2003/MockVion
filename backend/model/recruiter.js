import mongoose from "mongoose";
const { Schema } = mongoose;

const RecruiterSchema = new Schema(
  {
    email: {type: String,required: true,unique: true,lowercase: true,trim: true},

    password: {type: String,required: true},

    recruiterStatus: {type: String,enum: ["pending", "approved", "rejected"],default: "pending"},

    companyName: {type: String,required: true,trim: true},

    companyWebsite: {type: String,required: true,trim: true}
  },
  { timestamps: true }
);

export default mongoose.model("Recruiter", RecruiterSchema);