import jwt from "jsonwebtoken";
import User from "../models/User_Model.js";

// ─── Helper: Token Banao ──────────────────────────────────────────
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
}

// ─── Register ─────────────────────────────────────────────────────
export const register = async (request, response) => {
  try {
    const { firstName, lastName, email, password, role, phone } = request.body;

    // Email already exist karta hai?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(409).json({
        success: false,
        error: true,
        message: "Yeh email already registered hai",
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
    });

    const token = generateToken(user._id);

    response.status(201).json({
      success: true,
      error: false,
      message: "User registered successfully",
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Login ────────────────────────────────────────────────────────
export const login = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Email aur password dono zaruri hain",
      });
    }

    // Password bhi fetch karo (model mein select:false hai)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "Email ya password galat hai",
      });
    }

    // Password match karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "Email ya password galat hai",
      });
    }

    if (!user.isActive) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Aapka account inactive hai. Admin se rabta karein",
      });
    }

    const token = generateToken(user._id);

    response.status(200).json({
      success: true,
      error: false,
      message: "Login successful",
      token,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Logged In User ───────────────────────────────────────────
export const getMe = async (request, response) => {
  try {
    response.status(200).json({
      success: true,
      error: false,
      message: "User fetched successfully",
      data: request.user, // auth middleware ne set kiya tha
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};