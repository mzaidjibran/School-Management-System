import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User_Model from "../models/User_Model.js";

// ─── Token Verify Karo ────────────────────────────────────────────
export const protect = async (request, response, next) => {
  try {
    let token;

    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith("Bearer")
    ) {
      token = request.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "Access denied. Pehle login karein",
      });
    }

    // JWT_ACCESS_SECRET use karo (JWT_SECRET nahi)
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // decoded.userId use karo (decoded.id nahi)
    const user = await User_Model.findById(decoded.userId).select("-password");

    if (!user) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "User nahi mila. Dobara login karein",
      });
    }

    if (user.role === "teacher" && !user.gender) {
      try {
        const TeacherModel = mongoose.model("Teacher");
        const teacherDoc = await TeacherModel.findOne({ email: user.email.toLowerCase().trim() });
        if (teacherDoc) {
          user.gender = teacherDoc.gender || "male";
          await User_Model.updateOne({ _id: user._id }, { gender: user.gender });
        }
      } catch (err) {
        console.error("Failed to populate teacher gender:", err.message);
      }
    }

    // request.userId set karo — controllers mein isi se access hota hai
    request.userId = user._id;
    request.user   = user;
    next();
  } catch (error) {
    return response.status(401).json({
      success: false,
      error: true,
      message: "Invalid token. Dobara login karein",
    });
  }
};

// ─── Role Check Middleware ────────────────────────────────────────
export const authorize = (...roles) => {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) {
      return response.status(403).json({
        success: false,
        error: true,
        message: `Sirf ${roles.join(" ya ")} yeh kaam kar sakta hai`,
      });
    }
    next();
  };
};