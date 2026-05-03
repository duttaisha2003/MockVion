import Job from "../model/job.js";
import { storeJobInPinecone,deleteJobFromPinecone } from "../utils/storeJobInPinecone.js";
import Recruiter from "../model/recruiter.js";
import Application from "../model/application.js";
import User from "../model/user.js";
import InterviewSession from "../model/interviewSession.js";
import application from "../model/application.js";

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

/* ---------- view all candidates (For Recruiters) ---------- */
export const getApplicantsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ jobId })
      .populate("userId", "firstName lastName emailId")
      .populate("resultId", "totalScore overallFeedback")
      .sort({ createdAt: -1 });
    const formattedData = applications.map((app) => ({
      applicationId: app._id,
      candidateId: app.userId?._id,

      candidateName: `${app.userId?.firstName || ""} ${app.userId?.lastName || ""}`,

      email: app.userId?.emailId,

      interviewScore: app.resultId?.totalScore || 0,
      feedback: app.resultId?.overallFeedback || "",
      resultId: app.resultId?._id,
      status: app.status,
      appliedAt: app.createdAt,
    }));
    res.status(200).json({
      success: true,
      applicants: formattedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
    });
  }
};
export const getJobsWithApplicants = async (req, res) => {
  try {
    // assuming recruiter id comes from auth middleware
     const recruiterId = req.recruiter._id; 
   
    // fetch  only recruiter posted jobs
    const jobs = await Job.find({ postedBy: recruiterId }).sort({ createdAt: -1 });

    const formattedJobs = await Promise.all(
      jobs.map(async (job) => {
        const totalApplicants = await Application.countDocuments({
          jobId: job.jobId,
        });

        return {
          jobId: job.jobId,
          jobTitle: job.title,
          companyName: job.companyName,
          totalApplicants,
          createdAt: job.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      jobs: formattedJobs,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs with applicants",
    });
  }
};
export const getResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await InterviewSession.findById(resultId)
      .lean();

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    res.status(500).json({ message: "Server error" });
  }
};
/* ----------  shortlist candidates (For Recruiters) ---------- */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // "shortlisted" or "rejected"

    if (!["shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: `Application ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};
export const getShortlistedApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({
      jobId,
      status: "shortlisted"
    }).populate("userId", "firstName lastName emailId");
    const applicants = applications.map((app) => ({
      applicationId: app._id,
      candidateName: `${app.userId?.firstName || ""} ${app.userId?.lastName || ""}`.trim() || "N/A",
      email: app.userId?.emailId || "N/A",  // ✅ emailId not email
      resultId: app.resultId,
      resumeId: app.resumeId,
      status: app.status,
    }));

    res.status(200).json({ success: true, applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
/* ---------- Manage ALL JOBS (For Recruiters) ---------- */
export const updateJob = async (req, res) => {
  try {
    const recruiter = req.recruiter;
    const { jobId } = req.params;

    const {
      title,
      description,
      skillsRequired,
      experienceRequired,
      salary,
      lastDate,
    } = req.body;

    // Find job and verify ownership
    const job = await Job.findOne({ jobId, postedBy: recruiter._id });
    if (!job) {
      return res.status(404).json({
        message: "Job not found or you are not authorized to update it",
      });
    }

    // Validate lastDate if provided
    if (lastDate && new Date(lastDate) < new Date()) {
      return res.status(400).json({
        message: "Last date cannot be in the past",
      });
    }

    // Normalize skills if provided
    const normalizedSkills = skillsRequired
      ? skillsRequired.map((skill) => skill.toLowerCase().trim())
      : job.skillsRequired;

    // Build updated fields (only override what's provided)
    const updatedFields = {
      title: title?.trim() || job.title,
      description: description?.trim() || job.description,
      skillsRequired: normalizedSkills,
      experienceRequired: {
        min:
          experienceRequired?.min !== undefined
            ? Number(experienceRequired.min)
            : job.experienceRequired.min,
        max:
          experienceRequired?.max !== undefined
            ? Number(experienceRequired.max)
            : job.experienceRequired.max,
      },
      salary: {
        min: salary?.min !== undefined ? Number(salary.min) : job.salary.min,
        max: salary?.max !== undefined ? Number(salary.max) : job.salary.max,
        currency: salary?.currency || job.salary.currency,
      },
      lastDate: lastDate ? new Date(lastDate) : job.lastDate,
    };

    // Update in MongoDB
    const updatedJob = await Job.findOneAndUpdate(
      { jobId, postedBy: recruiter._id },
      { $set: updatedFields },
      { new: true }
    );

    // Sync updated job to Pinecone (upsert overwrites existing vector)
    await storeJobInPinecone(updatedJob);

    res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);
    res.status(500).json({
      message: "Failed to update job",
      error: error.message,
    });
  }
};
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({ jobId, postedBy: req.recruiter._id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job", error: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const recruiter = req.recruiter;
    const { jobId } = req.params;

    // Find job and verify ownership
    const job = await Job.findOne({ jobId, postedBy: recruiter._id });
    if (!job) {
      return res.status(404).json({
        message: "Job not found or you are not authorized to delete it",
      });
    }

    // Delete from MongoDB
    await Job.deleteOne({ jobId, postedBy: recruiter._id });

    // Delete vector from Pinecone
    await deleteJobFromPinecone(jobId);

    res.status(200).json({
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);
    res.status(500).json({
      message: "Failed to delete job",
      error: error.message,
    });
  }
};