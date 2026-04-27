import Job from "../model/job.js";
import { storeJobInPinecone } from "../utils/storeJobInPinecone.js";
import Recruiter from "../model/recruiter.js";

export const createJob = async (req, res) => {
  try {
    const recruiter = req.recruiter;

    const {
      title,
      description,
      skillsRequired,
      experienceRequired,
      salary,
      lastDate
    } = req.body;

    //  Validation
    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required"
      });
    }

    if (!skillsRequired || skillsRequired.length === 0) {
      return res.status(400).json({
        message: "At least one skill is required"
      });
    }

    if (!lastDate) {
      return res.status(400).json({
        message: "Last date is required"
      });
    }

    //  Prevent past date jobs
    if (new Date(lastDate) < new Date()) {
      return res.status(400).json({
        message: "Last date cannot be in the past"
      });
    }

    //  Normalize skills
    const normalizedSkills = skillsRequired.map((skill) =>
      skill.toLowerCase().trim()
    );

    // Create job
    const job = await Job.create({
      jobId: "JOB-" + Date.now(), // 🔥 auto job ID

      title: title.trim(),

      description: description.trim(),

      experienceRequired: {
        min: Number(experienceRequired?.min) || 0,
        max: Number(experienceRequired?.max) || null
      },

      skillsRequired: normalizedSkills,

      salary: {
        min: Number(salary?.min) || 0,
        max: Number(salary?.max) || 0,
        currency: salary?.currency || "INR"
      },

      lastDate: new Date(lastDate),

      postedBy: recruiter._id
    });
    await storeJobInPinecone(job);
    res.status(201).json({
      message: "Job created successfully",
      job
    });

  } catch (error) {
     console.error("CREATE JOB ERROR:", error); 
    res.status(500).json({
      message: "Failed to create job",
      error: error.message
    });
  }
};


/* ---------- GET ALL JOBS (For Recruiters) ---------- */
export const getRecruiterJobs = async (req, res) => {
  try {
    const recId = req.recruiter._id; // from auth middleware
    
    const jobs = await Job.find({ postedBy: recId })
      .populate("postedBy", "companyName companyWebsite")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      jobs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ---------- Manage ALL JOBS (For Recruiters) ---------- */
/* ---------- view all candidates (For Recruiters) ---------- */
/* ---------- shortlist candidates(For Recruiters) ---------- */