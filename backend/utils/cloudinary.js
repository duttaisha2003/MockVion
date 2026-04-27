import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "profile_images",
      resource_type: "image", // ✅ important
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

export const upload = multer({ storage });

export const uploadResume = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: "resumes",
      resource_type: "raw", // ✅ for PDF
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`
    }),
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"), false);
    }
    cb(null, true);
  }
});
