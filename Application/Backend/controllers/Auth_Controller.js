import User_Model from "../models/User_Model.js";
import RefreshToken from "../models/refreshToken.js";
import otpModel from "../models/otpModel.js";
import { toSafeUser } from "../utils/userHelpers.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ── Helper: Refresh token DB mein save karo (7 din ki expiry) ────────────────
const saveRefreshToken = (userId, token) =>
  RefreshToken.create({
    userId,
    token,
    expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

// ── Sign Up (pehla user hamesha admin banta hai) ──────────────────────────────
export const SignUp = async (request, response) => {
  try {
    const { Name, email, password } = request.body;

    if (!Name || !email || !password)
      return response.status(400).json({ success: false, error: true, message: "Name, email and password are required!" });

    if (password.length < 6)
      return response.status(400).json({ success: false, error: true, message: "Password must be at least 6 characters!" });

    const existing = await User_Model.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return response.status(400).json({ success: false, error: true, message: "This email is already registered!" });

    const newUser = await User_Model.create({
      Name: Name.trim(),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      role: "admin",
      createdBy: null,
    });

    return response.status(201).json({
      success: true,
      error: false,
      message: "Account created. Please login!",
      data: toSafeUser(newUser),
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Sign In ───────────────────────────────────────────────────────────────────
export const SignIn = async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !password)
      return response.status(400).json({ success: false, error: true, message: "Email and password are required!" });

    const user = await User_Model.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return response.status(401).json({ success: false, error: true, message: "Invalid email or password!" });

    const accessToken  = generateAccessToken(user._id, user.role, user.email);
    const refreshToken = generateRefreshToken(user._id);
    await saveRefreshToken(user._id, refreshToken);

    return response.status(200).json({
      success: true,
      error: false,
      message: `Welcome ${user.Name}!`,
      data: { user: toSafeUser(user), accessToken, refreshToken },
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Refresh Access Token ──────────────────────────────────────────────────────
export const RefreshAccessToken = async (request, response) => {
  try {
    const { refreshToken } = request.body;

    if (!refreshToken)
      return response.status(400).json({ success: false, error: true, message: "Refresh token is required!" });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      await RefreshToken.deleteOne({ token: refreshToken });
      return response.status(401).json({ success: false, error: true, message: "Refresh token is invalid or expired!" });
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
    }).populate("userId");

    if (!storedToken)
      return response.status(401).json({ success: false, error: true, message: "Refresh token not recognised!" });

    await RefreshToken.deleteOne({ token: refreshToken });

    const user = storedToken.userId;
    const newAccessToken  = generateAccessToken(user._id, user.role, user.email);
    const newRefreshToken = generateRefreshToken(user._id);
    await saveRefreshToken(user._id, newRefreshToken);

    return response.status(200).json({
      success: true,
      error: false,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const LogOut = async (request, response) => {
  try {
    const { refreshToken } = request.body;
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });

    return response.status(200).json({ success: true, error: false, message: "Logged out successfully!" });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Get Current User Profile ──────────────────────────────────────────────────
export const GetCurrentUser = async (request, response) => {
  try {
    const user = await User_Model.findById(request.userId);
    if (!user)
      return response.status(404).json({ success: false, error: true, message: "User not found!" });

    return response.status(200).json({ success: true, error: false, data: toSafeUser(user) });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Update My Profile ─────────────────────────────────────────────────────────
export const UpdateMyProfile = async (request, response) => {
  try {
    const updateData = { ...request.body };
    delete updateData.password;
    delete updateData.role;

    if (request.file) updateData.profileImage = `/image/${request.file.filename}`;

    const updated = await User_Model.findByIdAndUpdate(request.userId, updateData, { new: true });
    if (!updated)
      return response.status(404).json({ success: false, error: true, message: "User not found!" });

    return response.status(200).json({
      success: true,
      error: false,
      message: "Profile updated successfully.",
      data: toSafeUser(updated),
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const ForgotPassword = async (request, response) => {
  try {
    const { email } = request.body;
    const user = await User_Model.findOne({ email: email?.toLowerCase().trim() });

    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await otpModel.deleteMany({ email: user.email });
      await otpModel.create({ email: user.email, otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
      await sendOtpEmail(user.email, otp);
    }

    return response.status(200).json({
      success: true,
      error: false,
      message: "If this email is registered, an OTP has been sent.",
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const VerifyOtp = async (request, response) => {
  try {
    const { email, otp } = request.body;

    if (!email || !otp)
      return response.status(400).json({ success: false, error: true, message: "Email and OTP are required!" });

    const otpRecord = await otpModel.findOne({ email: email.toLowerCase().trim() });

    if (!otpRecord)
      return response.status(400).json({ success: false, error: true, message: "OTP not found. Please request again!" });

    if (new Date() > otpRecord.expiresAt) {
      await otpModel.deleteOne({ email });
      return response.status(400).json({ success: false, error: true, message: "OTP has expired. Please request again!" });
    }

    if (otpRecord.otp !== otp)
      return response.status(400).json({ success: false, error: true, message: "Wrong OTP!" });

    const resetToken = jwt.sign(
      { email: email.toLowerCase().trim() },
      process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    await otpModel.deleteOne({ email });

    return response.status(200).json({ success: true, error: false, message: "OTP verified!", resetToken });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
export const ResetPassword = async (request, response) => {
  try {
    const { resetToken, newPassword } = request.body;

    if (!resetToken || !newPassword)
      return response.status(400).json({ success: false, error: true, message: "Reset token and new password are required!" });

    if (newPassword.length < 6)
      return response.status(400).json({ success: false, error: true, message: "Password must be at least 6 characters!" });

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_RESET_SECRET || process.env.JWT_ACCESS_SECRET);
    } catch {
      return response.status(400).json({ success: false, error: true, message: "Reset token is invalid or expired!" });
    }

    const user = await User_Model.findOne({ email: payload.email });
    if (!user)
      return response.status(404).json({ success: false, error: true, message: "User not found!" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await RefreshToken.deleteMany({ userId: user._id });

    return response.status(200).json({ success: true, error: false, message: "Password reset successfully. Please login again!" });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

// ── Get All Principals (Admins) ───────────────────────────────────────────────
export const GetPrincipals = async (request, response) => {
  try {
    const principals = await User_Model.find({ role: "admin" }).select("-password");
    return response.status(200).json({
      success: true,
      error: false,
      data: principals,
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};