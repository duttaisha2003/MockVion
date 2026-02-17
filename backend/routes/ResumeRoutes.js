
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

const router = express.Router();


const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

// Test route: extract PDF text
import ParsedResume from "../model/ParsedResume.js";
import { parseResumeText } from "../utils/resumePerser.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
router.post("/upload",authMiddleware,upload.single("resume"),async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const text = await extractTextFromPDF(req.file.buffer);
      const parsedData = parseResumeText(text);


      parsedData.user = req.user._id;

      //  duplicate resume upload korbe na
      const existingResume = await ParsedResume.findOne({
        user: req.user._id
      });

      if (existingResume) {
        return res.status(400).json({
          message: "Resume already uploaded for this user"
        });
      }

      const savedResume = await ParsedResume.create(parsedData);

      res.json({
        message: "Resume uploaded successfully",
        data: savedResume
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);


export default router;
