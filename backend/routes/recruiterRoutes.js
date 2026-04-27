import express from "express";
import {registerRecruiter,loginRecruiter,logoutRecruiter,getProfileRecruiter} from "../controller/recruiterController.js";
import{generateJobTemplate}from "../controller/aiController.js";
import { recruiterAuth } from "../middleware/recruiterAuth.js";
import { createJob,getRecruiterJobs } from "../controller/jobController.js";

const router = express.Router();

router.post("/register", registerRecruiter);
router.post("/login", loginRecruiter);
router.post("/logout", logoutRecruiter);
router.get("/getprofile",recruiterAuth,getProfileRecruiter);
router.post("/create-job", recruiterAuth, createJob);
router.post("/ai/job-template", recruiterAuth, generateJobTemplate);
router.get("/get-all-job", recruiterAuth, getRecruiterJobs);
export default router;