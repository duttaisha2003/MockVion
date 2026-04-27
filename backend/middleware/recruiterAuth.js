import jwt from "jsonwebtoken";
import Recruiter from "../model/recruiter.js";

export const recruiterAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.recruiterToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    const recruiter = await Recruiter.findById(decoded._id).select("-password");

    if (!recruiter) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.recruiter = recruiter;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};