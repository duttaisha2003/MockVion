import Recruiter from "../model/recruiter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ---------------- REGISTER ---------------- */

export const registerRecruiter = async (req, res) => {
  try {
    const { email, password, companyName, companyWebsite } = req.body;

    const existing = await Recruiter.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Recruiter.create({
      email,
      password: hashedPassword,
      companyName,
      companyWebsite
    });

    res.status(201).json({
      message: "Registered successfully. Await admin approval."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ---------------- LOGIN ---------------- */

export const loginRecruiter = async (req, res) => {
  try {
    const { email, password } = req.body;

    const recruiter = await Recruiter.findOne({ email });

    if (!recruiter) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (recruiter.recruiterStatus !== "approved") {
      return res.status(403).json({
        message: "Recruiter not approved by admin"
      });
    }

    const match = await bcrypt.compare(password, recruiter.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: recruiter._id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("recruiterToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login successful",
      recruiter: {
        _id: recruiter._id,
        email: recruiter.email,
        companyName: recruiter.companyName
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ---------------- LOGOUT ---------------- */

export const logoutRecruiter = (req, res) => {
  res.clearCookie("recruiterToken", {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
  res.json({ message: "Logged out successfully" });
};
/* ---------------- View Profile ---------------- */

export const getProfileRecruiter = async (req, res) => {
  try {
    const recId = req.recruiter._id;

    const recruiter = await Recruiter.findById(recId)
      .select("-password -__v");

    if (!recruiter) {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      recruiter,
    });

  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

/* ---------------- Update Profile ---------------- */

// export const updateProfile = async (req, res) => {
//   try {
//     const recruiterId = req.user._id;

//     // ✅ Allow only these text fields
//     const allowedFields = ["firstName", "lastName", "age"];

//     const updateData = {};

//     // Handle text fields safely
//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updateData[field] = req.body[field].trim();
//       }
//     });

//     // Handle image upload (multer)
//     if (req.file) {
//       updateData.image = req.file.path;
//       // If using object schema:
//       // updateData.image = { url: req.file.path, publicId: req.file.filename };
//     }

//     // Validate invalid body fields
//     const invalidFields = Object.keys(req.body).filter(
//       (field) => !allowedFields.includes(field)
//     );

//     if (invalidFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `You cannot update: ${invalidFields.join(", ")}`,
//       });
//     }

//     const updatedUser = await Recruiter.findByIdAndUpdate(
//       recruiterId,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     ).select("-password -__v");

//     if (!updatedUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//       user: updatedUser,
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Update failed",
//     });
//   }
// };