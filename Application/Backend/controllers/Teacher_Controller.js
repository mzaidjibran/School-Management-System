import Teacher from "../models/Teacher_Model.js";
import { createNotificationHelper } from "./Notification_Controller.js";
import User_Model from "../models/User_Model.js";
import path from "path";
import bcrypt from "bcrypt";

function normalizePayload(body, file) {
  const data = { ...body };

  if (data.fullName) {
    data.name = data.fullName;
    delete data.fullName;
  }

  if (data.gender && typeof data.gender === "string") {
    const g = data.gender.toLowerCase();
    if (["male", "female", "other"].includes(g)) data.gender = g;
  }

  if (data.status && typeof data.status === "string") {
    const s = data.status.toLowerCase();
    const map = {
      active: "active",
      inactive: "inactive",
      on_leave: "on_leave",
    };
    if (map[s]) data.status = map[s];
  }

  if (data.emergencyName || data.emergencyPhone) {
    data.emergencyContact = {
      name: data.emergencyName || "",
      phone: data.emergencyPhone || "",
    };
    delete data.emergencyName;
    delete data.emergencyPhone;
  }

  if (file) data.profileImage = `/image/${file.filename}`;

  return data;
}

function transformTeacherDoc(doc) {
  if (!doc) return doc;
  const raw = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...raw,
    fullName: raw.name || "",
    emergencyName: raw.emergencyContact?.name || "",
    emergencyPhone: raw.emergencyContact?.phone || "",
    profileImage: raw.profileImage
      ? raw.profileImage.startsWith("/image/")
        ? raw.profileImage
        : `/image/${path.basename(raw.profileImage)}`
      : "",
  };
}

export const createTeacher = async (request, response) => {
  try {
    console.log("createTeacher received body:", request.body);
    const teacherData = normalizePayload(request.body, request.file);
    teacherData.userId = request.userId;
    if (request.headers["x-branch-id"]) teacherData.branch = request.headers["x-branch-id"];
    teacherData.schoolSection = teacherData.schoolSection || request.headers["x-section"];

    const teacher = await Teacher.create(teacherData);
    await createNotificationHelper(
      "New Teacher Onboarded",
      `${teacherData.name || "A new teacher"} has been successfully onboarded with email ${teacherData.email}.`,
      "teacher"
    );

    // Create corresponding login User account
    const existingUser = await User_Model.findOne({ email: teacherData.email.toLowerCase().trim() });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      await User_Model.create({
        Name: teacherData.name,
        email: teacherData.email.toLowerCase().trim(),
        password: hashedPassword,
        role: "teacher",
        gender: teacherData.gender || "male",
        createdBy: request.userId,
        assignedPages: ["attendance"], // default page
      });
    }

    response
      .status(201)
      .json({
        success: true,
        error: false,
        message: "Teacher created successfully. Login account created with default password '123456'.",
        data: transformTeacherDoc(teacher),
      });
  } catch (error) {
    response
      .status(400)
      .json({ success: false, error: true, message: error.message });
  }
};

export const getAllTeachers = async (request, response) => {
  try {
    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const query = { userId: ownerId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.user && request.user.role === "teacher") {
      query.schoolSection = request.user.gender === "female" ? "girls" : "boys";
    } else if (request.headers["x-section"]) {
      query.schoolSection = request.headers["x-section"];
    }

    const teachers = await Teacher.find(query);
    response
      .status(200)
      .json({
        success: true,
        error: false,
        message: "Teachers fetched successfully",
        data: teachers.map(transformTeacherDoc),
      });
  } catch (error) {
    response
      .status(500)
      .json({ success: false, error: true, message: error.message });
  }
};

export const getSingleTeacher = async (request, response) => {
  try {
    const query = { _id: request.params.id, userId: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const teacher = await Teacher.findOne(query);
    if (!teacher)
      return response
        .status(404)
        .json({ success: false, error: true, message: "Teacher not found" });
    response
      .status(200)
      .json({
        success: true,
        error: false,
        message: "Teacher fetched successfully",
        data: transformTeacherDoc(teacher),
      });
  } catch (error) {
    response
      .status(500)
      .json({ success: false, error: true, message: error.message });
  }
};

export const updateTeacher = async (request, response) => {
  try {
    const updateData = normalizePayload(request.body, request.file);
    const query = { _id: request.params.id, userId: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const updatedTeacher = await Teacher.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedTeacher)
      return response
        .status(404)
        .json({ success: false, error: true, message: "Teacher not found" });
    response
      .status(200)
      .json({
        success: true,
        error: false,
        message: "Teacher updated successfully",
        data: transformTeacherDoc(updatedTeacher),
      });
  } catch (error) {
    response
      .status(500)
      .json({ success: false, error: true, message: error.message });
  }
};

export const deleteTeacher = async (request, response) => {
  try {
    const query = { _id: request.params.id, userId: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const deletedTeacher = await Teacher.findOneAndDelete(query);
    if (!deletedTeacher)
      return response
        .status(404)
        .json({ success: false, error: true, message: "Teacher not found" });
    response
      .status(200)
      .json({
        success: true,
        error: false,
        message: "Teacher deleted successfully",
        data: transformTeacherDoc(deletedTeacher),
      });
  } catch (error) {
    response
      .status(500)
      .json({ success: false, error: true, message: error.message });
  }
};

export const assignClass = async (request, response) => {
  try {
    const { classId, subject } = request.body;
    const teacher = await Teacher.findOneAndUpdate(
      { _id: request.params.id, userId: request.userId },
      { $push: { assignedClasses: { classId, subject } } },
      { new: true, runValidators: true },
    );
    if (!teacher)
      return response
        .status(404)
        .json({ success: false, error: true, message: "Teacher not found" });
    response
      .status(200)
      .json({
        success: true,
        error: false,
        message: "Class assigned successfully",
        data: transformTeacherDoc(teacher),
      });
  } catch (error) {
    response
      .status(400)
      .json({ success: false, error: true, message: error.message });
  }
};

export const getTeacherPermissionsList = async (request, response) => {
  try {
    const query = { userId: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const teachers = await Teacher.find(query);

    const list = await Promise.all(
      teachers.map(async (t) => {
        const u = await User_Model.findOne({ email: t.email.toLowerCase().trim() });
        return {
          _id: t._id,
          name: t.name,
          email: t.email,
          assignedPages: u ? u.assignedPages : [],
          hasAccount: !!u,
        };
      })
    );

    response.status(200).json({
      success: true,
      error: false,
      data: list,
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

export const updateTeacherPermissions = async (request, response) => {
  try {
    const { email, name, assignedPages, password } = request.body;

    if (!email) {
      return response.status(400).json({ success: false, error: true, message: "Email is required!" });
    }

    let user = await User_Model.findOne({ email: email.toLowerCase().trim() });
    const teacherDoc = await Teacher.findOne({ email: email.toLowerCase().trim() });
    const teacherGender = teacherDoc ? teacherDoc.gender : "male";

    if (!user) {
      const hashedPassword = await bcrypt.hash(password || "123456", 10);
      user = await User_Model.create({
        Name: name || "Teacher User",
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "teacher",
        gender: teacherGender,
        createdBy: request.userId,
        assignedPages: assignedPages || [],
      });
    } else {
      user.role = "teacher";
      user.gender = teacherGender;
      user.assignedPages = assignedPages || [];
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Permissions updated successfully",
      data: {
        email: user.email,
        assignedPages: user.assignedPages,
        hasAccount: true,
      },
    });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};
