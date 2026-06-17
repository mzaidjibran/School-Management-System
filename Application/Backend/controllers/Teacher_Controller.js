import Teacher from "../models/Teacher_Model.js";
import path from "path";

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
    const map = { active: "active", inactive: "inactive", on_leave: "on_leave" };
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
    const teacherData = normalizePayload(request.body, request.file);

    // Only set userId if auth middleware has populated request.user
    if (request.user?._id) {
      teacherData.userId = request.user._id;
    }

    const teacher = await Teacher.create(teacherData);
    response.status(201).json({ success: true, error: false, message: "Teacher created successfully", data: transformTeacherDoc(teacher) });
  } catch (error) {
    response.status(400).json({ success: false, error: true, message: error.message });
  }
};

export const getAllTeachers = async (request, response) => {
  try {
    const teachers = await Teacher.find({});
    response.status(200).json({ success: true, error: false, message: "Teachers fetched successfully", data: teachers.map(transformTeacherDoc) });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

export const getSingleTeacher = async (request, response) => {
  try {
    const teacher = await Teacher.findById(request.params.id);
    if (!teacher) return response.status(404).json({ success: false, error: true, message: "Teacher not found" });
    response.status(200).json({ success: true, error: false, message: "Teacher fetched successfully", data: transformTeacherDoc(teacher) });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

export const updateTeacher = async (request, response) => {
  try {
    const updateData = normalizePayload(request.body, request.file);
    const updatedTeacher = await Teacher.findByIdAndUpdate(request.params.id, updateData, { new: true, runValidators: true });
    if (!updatedTeacher) return response.status(404).json({ success: false, error: true, message: "Teacher not found" });
    response.status(200).json({ success: true, error: false, message: "Teacher updated successfully", data: transformTeacherDoc(updatedTeacher) });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

export const deleteTeacher = async (request, response) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(request.params.id);
    if (!deletedTeacher) return response.status(404).json({ success: false, error: true, message: "Teacher not found" });
    response.status(200).json({ success: true, error: false, message: "Teacher deleted successfully", data: transformTeacherDoc(deletedTeacher) });
  } catch (error) {
    response.status(500).json({ success: false, error: true, message: error.message });
  }
};

export const assignClass = async (request, response) => {
  try {
    const { classId, subject } = request.body;
    const teacher = await Teacher.findByIdAndUpdate(request.params.id, { $push: { assignedClasses: { classId, subject } } }, { new: true, runValidators: true });
    if (!teacher) return response.status(404).json({ success: false, error: true, message: "Teacher not found" });
    response.status(200).json({ success: true, error: false, message: "Class assigned successfully", data: transformTeacherDoc(teacher) });
  } catch (error) {
    response.status(400).json({ success: false, error: true, message: error.message });
  }
};