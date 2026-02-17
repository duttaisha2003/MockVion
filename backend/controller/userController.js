
import User from "../model/user.js";
import validate from "../utils/validator.js";  
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    validate(req.body);

    const exists = await User.exists({ mobile: req.body.mobile });
    if (exists) {
      return res.status(400).json({
        error: "Mobile number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
      ...req.body,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User Registered Successfully",
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message || "Registration failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      throw new Error("Invalid Credentials");
    }

    const user = await User.findOne({ emailId });
    if (!user || !user.password) {
      throw new Error("Invalid Credentials");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error("Invalid Credentials");
    }

    const token = jwt.sign(
      { _id: user._id, email: emailId },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
    res.status(200).json({
  success: true,
  user: {
    _id: user._id,
    emailId: user.emailId,
    firstName: user.firstName
  }
});

  } catch (err) {
    res.status(401).send("Error: " + err.message);
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token"); 
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId).select(
      "-password -__v"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Only fields allowed to update
    const allowedFields = ["age", "image"];

    const updateData = {};

    // Handle text fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle image upload (if file exists)
    if (req.file) {
      updateData.image = req.file.path; 
      // or req.file.filename depending on your multer config
    }

    // Check for invalid fields
    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You cannot update: ${invalidFields.join(", ")}`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};


