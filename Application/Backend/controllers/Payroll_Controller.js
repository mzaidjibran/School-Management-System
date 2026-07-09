import { Payroll } from "../models/Payroll_Model.js";
import Teacher from "../models/Teacher_Model.js";
import { StaffAttendance } from "../models/Staff_Attendence_Model.js";

// Pay or record salary payment
export const paySalary = async (request, response) => {
  try {
    const { teacherId, month, salaryBasis, rate, units, allowance, deduction, netSalary, status } = request.body;

    if (!teacherId || !month || !salaryBasis || rate === undefined || units === undefined || netSalary === undefined) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Teacher, month, salary basis, rate, units, and netSalary are mandatory",
      });
    }

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    
    // Verify teacher belongs to admin
    const teacherExists = await Teacher.findOne({ _id: teacherId, userId: ownerId });
    if (!teacherExists) {
      return response.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized teacher access",
      });
    }

    let branchId = null;
    if (request.headers["x-branch-id"]) {
      branchId = request.headers["x-branch-id"];
    }

    const doc = await Payroll.findOneAndUpdate(
      { teacher: teacherId, month: month.trim() },
      {
        salaryBasis,
        rate,
        units,
        allowance: allowance || 0,
        deduction: deduction || 0,
        netSalary,
        status: status || "paid",
        paymentDate: status === "paid" ? new Date() : null,
        branch: branchId,
      },
      { new: true, upsert: true, runValidators: true }
    );

    response.status(201).json({
      success: true,
      error: false,
      message: `Salary marked as paid successfully`,
      data: doc,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// Get payroll history for a given month
export const getPayrollHistory = async (request, response) => {
  try {
    const { month } = request.query;

    if (!month) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Month query parameter is mandatory",
      });
    }

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    
    // Get all teachers for this admin
    const teacherQuery = { userId: ownerId };
    if (request.headers["x-branch-id"]) {
      teacherQuery.branch = request.headers["x-branch-id"];
    }
    const teachersList = await Teacher.find(teacherQuery);
    const teacherIds = teachersList.map(t => t._id);

    const records = await Payroll.find({
      teacher: { $in: teacherIds },
      month: month.trim(),
    }).populate("teacher", "name employeeId email subject");

    response.status(200).json({
      success: true,
      error: false,
      message: "Payroll history fetched successfully",
      data: records,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// Update teacher default base salary and basis
export const updateTeacherBaseSalary = async (request, response) => {
  try {
    const { teacherId, salary, salaryBasis } = request.body;

    if (!teacherId || salary === undefined || !salaryBasis) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "teacherId, salary rate, and salaryBasis are mandatory",
      });
    }

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const teacher = await Teacher.findOneAndUpdate(
      { _id: teacherId, userId: ownerId },
      { salary, salaryBasis },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Teacher not found or unauthorized",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Teacher base salary settings updated successfully",
      data: teacher,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// Get monthly attendance summaries for all teachers
export const getPayrollAttendanceStats = async (request, response) => {
  try {
    const { month } = request.query;

    if (!month) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Month query parameter is mandatory",
      });
    }

    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    
    // Get all teachers for this admin
    const teacherQuery = { userId: ownerId };
    if (request.headers["x-branch-id"]) {
      teacherQuery.branch = request.headers["x-branch-id"];
    }
    const teachersList = await Teacher.find(teacherQuery);
    const teacherIds = teachersList.map(t => t._id);

    // Parse month name to get start and end dates in local / UTC time
    // month is like "July 2026"
    const [monthName, yearName] = month.trim().split(" ");
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = months.indexOf(monthName);
    
    if (monthIndex === -1 || !yearName) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Invalid month format. Expected 'Month Year' (e.g. 'July 2026')",
      });
    }

    const year = parseInt(yearName);
    const start = new Date(year, monthIndex, 1, 0, 0, 0);
    const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

    const records = await StaffAttendance.find({
      teacher: { $in: teacherIds },
      date: { $gte: start, $lte: end },
    });

    const stats = {};
    teacherIds.forEach(id => {
      stats[id] = { present: 0, absent: 0, late: 0, leave: 0 };
    });

    records.forEach(r => {
      const teacherIdStr = r.teacher.toString();
      if (stats[teacherIdStr] && r.status) {
        const statusKey = r.status.toLowerCase();
        if (stats[teacherIdStr][statusKey] !== undefined) {
          stats[teacherIdStr][statusKey]++;
        }
      }
    });

    response.status(200).json({
      success: true,
      error: false,
      message: "Monthly attendance statistics fetched successfully",
      data: stats,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};
