import { ClassAssignment } from "../models/ClassAssignment_Model.js";
import { Student } from "../models/Student_Model.js";

// ─── Assign Student To Class ──────────────────────────────────────
export const assignStudentToClass = async (request, response) => {
  try {
    const { student, class: classId, academicYear, reason } = request.body;

    // Pehle check karo — kya is student ki koi current assignment hai?
    const existing = await ClassAssignment.findOne({
      student,
      isCurrent: true,
    });

    if (existing) {
      // Purani assignment band karo
      existing.isCurrent = false;
      existing.leftDate = new Date();
      await existing.save();
    }

    // Nayi assignment banao
    const assignment = await ClassAssignment.create({
      student,
      class: classId,
      academicYear,
      reason: reason || "new_admission",
      assignedBy: request.user._id,
      isCurrent: true,
    });

    // Student model mein bhi currentClass update karo
    await Student.findByIdAndUpdate(student, { currentClass: classId });

    const populated = await assignment.populate([
      { path: "student", select: "firstName lastName rollNumber" },
      { path: "class", select: "name section" },
    ]);

    response.status(201).json({
      success: true,
      error: false,
      message: "Student assigned to class successfully",
      data: populated,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Current Class of Student ────────────────────────────────
export const getStudentCurrentClass = async (request, response) => {
  try {
    const assignment = await ClassAssignment.findOne({
      student: request.params.studentId,
      isCurrent: true,
    }).populate([
      { path: "student", select: "firstName lastName rollNumber" },
      { path: "class", select: "name section academicYear" },
    ]);

    if (!assignment) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Student ki koi current class assignment nahi mili",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Current class fetched successfully",
      data: assignment,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Student Class History ────────────────────────────────────
// Student kis kis class mein raha — poori history
export const getStudentClassHistory = async (request, response) => {
  try {
    const history = await ClassAssignment.find({
      student: request.params.studentId,
    })
      .populate("class", "name section academicYear")
      .sort({ assignedDate: -1 });

    response.status(200).json({
      success: true,
      error: false,
      message: "Class history fetched successfully",
      data: history,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Students In A Class ──────────────────────────────────
export const getStudentsInClass = async (request, response) => {
  try {
    const assignments = await ClassAssignment.find({
      class: request.params.classId,
      isCurrent: true,
    }).populate("student", "firstName lastName rollNumber profileImage gender");

    response.status(200).json({
      success: true,
      error: false,
      message: "Students fetched successfully",
      data: assignments,
      total: assignments.length,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};