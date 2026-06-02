import Student from "../models/Student_Model.js"
import path from "path";

function normalizePayload(body, file) {
  const data = { ...body };
  if (data.Name) {
    const parts = String(data.Name || "")
      .trim()
      .split(/\s+/);
    data.firstName = parts[0] || "";
    data.lastName = parts.slice(1).join(" ") || parts[0] || "";
    delete data.Name;
  }
  if (data.cnic && !data.CNIC) {
    data.CNIC = data.cnic;
    delete data.cnic;
  }

  if (data.dateofBirth && !data.dateOfBirth) {
    data.dateOfBirth = data.dateofBirth;
    delete data.dateofBirth;
  }

  if (data.dateOfJoining && !data.dateOfJoining) {
  }

  if (data.gender && typeof data.gender === "string") {
    const g = data.gender.toLowerCase();
    if (g === "male") data.gender = "Male";
    else if (g === "female") data.gender = "Female";
    else data.gender = "Other";
  }

  // normalize status

  if (data.status && typeof data.status === "string") {
    const s = data.status.toLowerCase();
    if (s === "active") data.status = "Active";
    else if (s === "inactive") data.status = "Inactive";
    else if (s === "terminated") data.status = "Terminated";
    else if (s === "leave" || s === "on leave") data.status = "On Leave";
  }

  if (file) data.profileImage = `/image/${file.filename}`;
  return data;
}

function transformStudentDoc(doc) {
  if (!doc) return doc;

  // if doc is a mongoose document, use _doc to avoid prototypes

  const raw = doc.toObject ? doc.toObject() : { ...doc };

  return {
    ...raw,
    // keep original model fields but also add keys expected by frontend

    Name: `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
    cnic: raw.CNIC || raw.cnic || "",
    dateofBirth: raw.dateOfBirth || raw.dateofBirth || null,
    dateOfJoining: raw.dateOfJoining || raw.dateOfJoining || null,
    profileImage: raw.profileImage
      ? raw.profileImage.startsWith("/image/")
        ? raw.profileImage
        : `/image/${path.basename(raw.profileImage)}`
      : "",
  };
}

export const createStudent = async (request, response) => {
  try {
    const userId = request.userId;
    if (!userId) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized: Student ID not found",
      });
    }
    const studentData = normalizePayload(request.body, request.file);
    const student = await Student.create({
      ...studentData,
      user: userId,
    });
    response.status(201).json(transformStudentDoc(student));
  } catch (error) {
    response.status(400).json({
      message: error.message,
    });
  }
};

// Get all students

export const getAllStudents = async (request, response) => {
  try {
    const userId = request.userId;
    if (!userId) {
      return response.status(401).json({
        success: false,
        error: true,
        message: "Unauthorized: Student ID not found",
        data: null,
      });
    }
    const students = await Student.find({
      $or: [{ user: userId }, { user: null }, { user: { $exists: false } }],
    });
    const mapped = students.map(transformStudentDoc);
    response.status(200).json({
      success: true,
      error: false,
      message: "Student fetched successfully",
      data: mapped,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: "Error fetching students",
      data: null,
    });
  }
};

// Get student by id

export const getSingleStudent = async (request, response) => {
  try {
    const student = await Student.findById(request.params.id);
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
      message: "Error fetching student",
    });
  }
};

// Update student

export const updateStudent = async (request, response) => {
  try {
    const userId = request.userId;
    const studentId = request.params.id;

    // Verify the student belongs to the current user
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Student not found",
      });
    }

    // Check if user owns this student (with backward compatibility)
    if (
      existingStudent.user &&
      existingStudent.user.toString() !== userId.toString()
    ) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized: You can only update your own student",
      });
    }

    const updateData = {
      ...normalizePayload(request.body, request.file),
      user: userId,
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      {
        new: true,
      },
    );

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
      message: "Error updating student",
    });
  }
};

// Delete student

export const deleteStudent = async (request, response) => {
  try {
    const userId = request.userId;
    const studentId = request.params.id;

    // Verify the student belongs to the current user
    const existingStudent = await Student.findById(studentId);
    if (!existingStudent) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Student not found",
      });
    }

    // Check if user owns this student (with backward compatibility)
    if (
      existingStudent.user &&
      existingStudent.user.toString() !== userId.toString()
    ) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized: You can only delete your own student",
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(studentId);

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
      message: "Error deleting student",
    });
  }
};
