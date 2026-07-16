import { Student } from "../models/Student_Model.js";
import { createNotificationHelper } from "./Notification_Controller.js";
import path from "path";

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Helper: Normalize Incoming Data ─────────────────────────────
function normalizePayload(body, file) {
  const data = { ...body };

  // Name → firstName + lastName
  if (data.Name) {
    const parts = String(data.Name).trim().split(/\s+/);
    data.firstName = parts[0] || "";
    data.lastName = parts.slice(1).join(" ") || parts[0] || "";
    delete data.Name;
  }

  // Map class to currentClass
  if (data.class) {
    data.currentClass = data.class;
    delete data.class;
  }

  // CNIC
  if (data.cnic && !data.CNIC) {
    data.CNIC = data.cnic;
    delete data.cnic;
  }

  // Date of Birth
  if (data.dateofBirth && !data.dateOfBirth) {
    data.dateOfBirth = data.dateofBirth;
    delete data.dateofBirth;
  }

  // Gender — match karo model ke enum se (lowercase)
  if (data.gender && typeof data.gender === "string") {
    const g = data.gender.toLowerCase();
    if (["male", "female", "other"].includes(g)) data.gender = g;
  }

  // Status — match karo model ke enum se
  if (data.status && typeof data.status === "string") {
    const s = data.status.toLowerCase();
    const map = {
      active: "active",
      inactive: "inactive",
      graduated: "graduated",
      expelled: "expelled",
      transferred: "transferred",
    };
    if (map[s]) data.status = map[s];
  }

  // Profile Image
  if (file) data.profileImage = `/image/${file.filename}`;

  return data;
}

// ─── Helper: Transform Doc for Frontend ──────────────────────────
function transformStudentDoc(doc) {
  if (!doc) return doc;
  const raw = doc.toObject ? doc.toObject() : { ...doc };

  return {
    ...raw,
    Name: `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
    cnic: raw.CNIC || raw.cnic || "",
    dateofBirth: raw.dateOfBirth || null,
    dateOfJoining: raw.admissionDate || null,
    class: raw.currentClass
      ? typeof raw.currentClass === "object"
        ? raw.currentClass.name
        : raw.currentClass
      : "",
    profileImage: raw.profileImage
      ? raw.profileImage.startsWith("/image/")
        ? raw.profileImage
        : `/image/${path.basename(raw.profileImage)}`
      : "",
  };
}

// ─── Create Student ───────────────────────────────────────────────
export const createStudent = async (request, response) => {
  try {
    const studentData = normalizePayload(request.body, request.file);
    studentData.createdBy = request.userId;
    if (request.headers["x-branch-id"])
      studentData.branch = request.headers["x-branch-id"];
    studentData.schoolSection =
      studentData.schoolSection || request.headers["x-section"];

    // Auto-generate unique admission number if not provided to prevent index duplicate key errors
    if (!studentData.admissionNumber) {
      studentData.admissionNumber = `ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const student = await Student.create(studentData);
    await createNotificationHelper(
      "New Student Registered",
      `${studentData.firstName} ${studentData.lastName || ""} was admitted under admission number ${studentData.admissionNumber}.`,
      "student"
    );
    const populated = await Student.findById(student._id).populate(
      "currentClass",
    );
    response.status(201).json({
      success: true,
      error: false,
      message: "Student created successfully",
      data: transformStudentDoc(populated),
    });
  } catch (error) {
    console.log("Validation error:", error.message);
    response.status(400).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Students ─────────────────────────────────────────────
export const getAllStudents = async (request, response) => {
  try {
    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const query = { createdBy: ownerId };
    const { rollNumber, name, search } = request.query;

    if (request.query.currentClass) {
      query.currentClass = request.query.currentClass;
    }
    if (rollNumber) {
      query.rollNumber = String(rollNumber).trim();
    }
    const searchTerm = String(name || search || "").trim();
    if (searchTerm) {
      const regex = new RegExp(escapeRegExp(searchTerm), "i");
      const words = searchTerm.split(/\s+/);
      if (words.length > 1) {
        const firstRegex = new RegExp(escapeRegExp(words[0]), "i");
        const lastRegex = new RegExp(escapeRegExp(words.slice(1).join(" ")), "i");
        query.$or = [
          { firstName: regex },
          { lastName: regex },
          {
            $and: [
              { firstName: firstRegex },
              { lastName: lastRegex }
            ]
          },
          {
            $and: [
              { firstName: lastRegex },
              { lastName: firstRegex }
            ]
          }
        ];
      } else {
        query.$or = [
          { firstName: regex },
          { lastName: regex }
        ];
      }
    }
    if (request.user && request.user.role === "teacher") {
      query.schoolSection = request.user.gender === "female" ? "girls" : "boys";
    } else {
      if (request.query.section) {
        query.schoolSection = request.query.section;
      } else if (request.headers["x-section"]) {
        query.schoolSection = request.headers["x-section"];
      }
    }
    if (request.headers["x-branch-id"]) {
      query.branch = request.headers["x-branch-id"];
    }
    const students = await Student.find(query).populate("currentClass");
    response.status(200).json({
      success: true,
      error: false,
      message: "Students fetched successfully",
      data: students.map(transformStudentDoc),
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

export const getSingleStudent = async (request, response) => {
  try {
    const query = { _id: request.params.id, createdBy: request.userId };
    if (request.headers["x-branch-id"])
      query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"])
      query.schoolSection = request.headers["x-section"];

    const student = await Student.findOne(query).populate("currentClass");
    if (!student) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Student not found",
      });
    }
    response.status(200).json({
      success: true,
      error: false,
      message: "Student fetched successfully",
      data: transformStudentDoc(student),
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Update Student ───────────────────────────────────────────────
export const updateStudent = async (request, response) => {
  try {
    const updateData = normalizePayload(request.body, request.file);

    const query = { _id: request.params.id, createdBy: request.userId };
    if (request.headers["x-branch-id"])
      query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"])
      query.schoolSection = request.headers["x-section"];

    const updatedStudent = await Student.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    }).populate("currentClass");

    if (!updatedStudent) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Student not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Student updated successfully",
      data: transformStudentDoc(updatedStudent),
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

export const deleteStudent = async (request, response) => {
  try {
    const query = { _id: request.params.id, createdBy: request.userId };
    if (request.headers["x-branch-id"])
      query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"])
      query.schoolSection = request.headers["x-section"];

    const deletedStudent = await Student.findOneAndDelete(query);

    if (!deletedStudent) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Student not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Student deleted successfully",
      data: transformStudentDoc(deletedStudent),
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};
