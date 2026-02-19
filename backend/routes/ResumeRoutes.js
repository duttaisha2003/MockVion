
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
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


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

        
      // ---------------- NAME VALIDATION ----------------
      const resumeName = normalizeName(parsedData.name);
      //const userName = normalizeName(req.user.name); 
      // If you have firstName + lastName:
       const userName = normalizeName(`${req.user.firstName} ${req.user.lastName}`);

      if (!resumeName || !userName) {
        return res.status(400).json({
          message: "Unable to verify resume name"
        });
      }

      if (!resumeName.includes(userName)) {
        return res.status(400).json({
          message: "Resume name does not match logged-in user"
        });
      }

      parsedData.user = req.user._id;

      //  duplicate resume upload korbe na
      const existingResume = await ParsedResume.findOne({
        user: req.user._id
      });

      // if (existingResume) {
      //   return res.status(400).json({
      //     message: "Resume already uploaded for this user"
      //   });
      // }
      // Check if resume exists
      
      let savedResume;

      if (existingResume) {
        // UPDATE existing
        savedResume = await ParsedResume.findOneAndUpdate(
          { user: req.user._id },
          parsedData,
          { new: true }
        );

        return res.json({
          message: "Resume updated successfully",
          data: savedResume
        });

      } else {
        // CREATE new
        savedResume = await ParsedResume.create(parsedData);

        return res.json({
          message: "Resume uploaded successfully",
          data: savedResume
        });
      }

      // const savedResume = await ParsedResume.create(parsedData);

      // res.json({
      //   message: "Resume uploaded successfully",
      //   data: savedResume
      // });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/getResume", authMiddleware, async (req, res) => {
  try {
    const resume = await ParsedResume.findOne({
      user: req.user._id
    });

    res.json({
      exists: !!resume,
      resume: resume || null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
