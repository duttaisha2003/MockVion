
import dotenv from "dotenv";
dotenv.config();

import ParsedResume from "../model/parsedResume.js";
import Job from "../model/job.js";
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

/* SINGLE INDEX */
const index = pinecone.index("mockvion");

/* ---------------- COSINE SIMILARITY ---------------- */
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/* ---------------- SKILL MATCH ---------------- */
function normalize(skill) {
  return skill
    .toLowerCase()
    .replace(/\.js/g, "js")     // Node.js → Nodejs
    .replace(/[^a-z0-9]/g, "")  // remove spaces, dots, hyphens
    .trim();
}
function isMatch(skill, resumeSet) {
  for (let s of resumeSet) {
    if (
      s === skill ||                 // exact
      s.includes(skill) ||          // partial
      skill.includes(s)             // reverse partial
    ) {
      return true;
    }
  }
  return false;
}
function calculateSkillMatch(resumeSkills = [], jobSkills = []) {
  if (!jobSkills.length) return 0;

  const normalizedResume = resumeSkills.map(normalize);

  let matched = 0;

  for (const skill of jobSkills) {
    const normalizedSkill = normalize(skill);

    if (isMatch(normalizedSkill, normalizedResume)) {
      matched++;
    }
  }

  return (matched / jobSkills.length) * 100;
}
/* ---------------- CONTROLLER ---------------- */
export const getMatchedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const resume = await ParsedResume.findOne({ user: userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const resumeId = resume._id.toString();
    
    const resumeFetch = await index.namespace("resumes").fetch([resumeId]);

    const resumeEmbedding =
      resumeFetch.records?.[resumeId]?.values;

    if (!resumeEmbedding) {
      return res.status(404).json({ message: "Resume embedding not found" });
    }

    const jobs = await Job.find({});

    const jobIds = jobs.map(j => j.jobId);

    const jobFetch = await index.namespace("jobs").fetch(jobIds);

    const results = [];

    for (const job of jobs) {
  const jobVector = jobFetch.records?.[job.jobId]?.values;


  if (!jobVector) {
    console.log(" No vector found for this job in Pinecone");
    continue;
  }

  const similarity = cosineSimilarity(resumeEmbedding, jobVector);

  const skillMatch = calculateSkillMatch(
    resume.skills || [],
    job.skillsRequired || []
  );
 
  const finalScore =
    similarity * 50 + (skillMatch / 100) * 50;


  results.push({
    jobId: job.jobId,
    title: job.title,
    description: job.description,

    experienceRequired: job.experienceRequired,

    skillsRequired: job.skillsRequired,

    salary: {
      min: job.salary?.min || 0,
      max: job.salary?.max || 0,
      currency: job.salary?.currency || "INR",
    },

    lastDate: job.lastDate,

    matchScore: Number(finalScore.toFixed(2)),

    canApply: finalScore >= 50
  });
}

    results.sort((a, b) => b.finalScore - a.finalScore);

    return res.status(200).json({
      total: results.length,
      matches: results,
    });
      
  } catch (error) {
    console.error("getMatchedJobs error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};