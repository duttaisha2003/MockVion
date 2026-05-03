import express from "express";
import {registerRecruiter,loginRecruiter,logoutRecruiter,getProfileRecruiter} from "../controller/recruiterController.js";
import{generateJobTemplate}from "../controller/aiController.js";
import { recruiterAuth } from "../middleware/recruiterAuth.js";
import { createJob,getRecruiterJobs,getApplicantsByJobId,getJobsWithApplicants,getResultById,
    updateJob,deleteJob ,getJobById ,updateApplicationStatus , getShortlistedApplicants } from "../controller/jobController.js";

const router = express.Router();

router.post("/register", registerRecruiter);
router.post("/login", loginRecruiter);
router.post("/logout", logoutRecruiter);
router.get("/getprofile",recruiterAuth,getProfileRecruiter);
router.post("/create-job", recruiterAuth, createJob);
router.post("/ai/job-template", recruiterAuth, generateJobTemplate);
router.get("/get-all-job", recruiterAuth, getRecruiterJobs);
router.get("/job/:jobId/applicants",recruiterAuth, getApplicantsByJobId);
router.get("/jobs-with-applicants",recruiterAuth,getJobsWithApplicants);
router.get("/jobs/:resultId",recruiterAuth, getResultById);
router.put("/job/:jobId", recruiterAuth, updateJob);
router.delete("/job/:jobId", recruiterAuth, deleteJob);
router.get("/job/:jobId", recruiterAuth, getJobById); 
router.patch("/application/:applicationId/status",recruiterAuth, updateApplicationStatus);
router.get("/job/:jobId/shortlisted", recruiterAuth, getShortlistedApplicants);
export default router;