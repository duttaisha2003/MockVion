
// eta die cloud e store h66e
//============================================================================
// import express from "express";
// import { uploadToCloudinary } from "../middleware/upload.js";

// const router = express.Router();

// router.post("/upload", uploadToCloudinary.single("resume"), (req, res) => {
//   try {
//     if (!req.file || !req.file.path) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     res.status(200).json({
//       message: "Resume uploaded successfully",
//       url: req.file.path, 
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

//================================================================================


import express from "express";
import multer from "multer";
import { extractTextFromPDF } from "../utils/pdfparser.js";
import { parseResumeText } from "../utils/resumePerser.js";
import { enhanceResumeWithAI } from "../utils/resumeAgent.js";
import ParsedResume from "../model/ParsedResume.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { storeResumeInPinecone } from "../utils/storeResumeInPinecone .js";
const router = express.Router();

// ---------------- MULTER CONFIG ----------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

// ---------------- UPLOAD RESUME ----------------
router.post("/upload",authMiddleware,upload.single("resume"),async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      

      // 1. PDF → TEXT
      const text = await extractTextFromPDF(req.file.buffer);

      // 2. RULE PARSER
      const parsedData = parseResumeText(text);

      // 3. AI ENHANCEMENT (only if needed)
      let finalData = parsedData;

      const shouldUseAI =
        parsedData.skills.length < 3 ||
        parsedData.projects.length === 0 ||
        !parsedData.email;

      if (shouldUseAI) {
        const aiData = await enhanceResumeWithAI({
          rawText: text,
          parsedData
        });

        if (aiData) {
          finalData = {
            ...parsedData,
            ...aiData,
            skills: [
              ...new Set([
                ...(parsedData.skills || []),
                ...(aiData.skills || [])
              ])
            ]
          };
        }
      }

      // attach user
      finalData.user = req.user._id;
      const achievements = (finalData.achievements || []).map((item) => {
  // if AI/parser returns string
  if (typeof item === "string") {
    return {
      title: item,
      description: ""
    };
  }

  // if already object
  return {
    title: item.title || "",
    description: item.description || ""
  };
});

/* overwrite achievements */
finalData.achievements = achievements;
      // 4. UPSERT (update or create)
      const savedResume = await ParsedResume.findOneAndUpdate(
        { user: req.user._id },
        finalData,
        { new: true, upsert: true }
      );
      //5. save to pinecone
      await storeResumeInPinecone(savedResume);

      return res.json({
        success: true,
        message: "Resume processed successfully",
        data: savedResume
      });

    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      res.status(500).json({
        success: false,
        message: "Error processing resume"
      });
    }
  }
);

// ---------------- GET RESUME ----------------
router.get("/getResume", authMiddleware, async (req, res) => {
  try {
    const resume = await ParsedResume.findOne({
      user: req.user._id
    });

    return res.json({
      success: true,
      exists: !!resume,
      resume: resume || null
    });

  } catch (error) {
    console.error("GET ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching resume"
    });
  }
});

export default router;