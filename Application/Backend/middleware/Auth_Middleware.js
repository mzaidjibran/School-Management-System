import jwt from "jsonwebtoken";
import User from "../models/User_Model.js";

// ─── Token Verify Karo ────────────────────────────────────────────
export const protect = async (request, response, next) => {
  try {
    let token;

    // Token header se lo
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

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User fetch karo (password exclude)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "User nahi mila. Dobara login karein",
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Aapka account inactive hai. Admin se rabta karein",
      });
    }

    // request mein user set karo — controllers mein request.user se milega
    request.user = user;
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
// Usage: authorize("admin") ya authorize("admin", "teacher")
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