import TeacherSalary from "../models/Teacher_Salary_Model.js";
import Teacher from "../models/Teacher_Model.js";

// ─── Generate Salary ──────────────────────────────────────────────
export const generateSalary = async (request, response) => {
  try {
    const { teacherId, month, year, allowances = 0, deductions = 0 } = request.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Teacher not found",
      });
    }

    const salary = await TeacherSalary.create({
      teacherId,
      month,
      year,
      basicSalary: teacher.salary,
      allowances,
      deductions,
    });

    response.status(201).json({
      success: true,
      error: false,
      message: "Salary generated successfully",
      data: salary,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Salary already generated for this month",
      });
    }
    response.status(400).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Salary Records ───────────────────────────────────────────
export const getSalaryRecords = async (request, response) => {
  try {
    const { teacherId, month, year, status } = request.query;
    const query = {};

    if (teacherId) query.teacherId = teacherId;
    if (month)     query.month = Number(month);
    if (year)      query.year = Number(year);
    if (status)    query.status = status;

    const records = await TeacherSalary.find(query).populate(
      "teacherId",
      "firstName lastName employeeId salary"
    );

    response.status(200).json({
      success: true,
      error: false,
      message: "Salary records fetched successfully",
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

// ─── Mark Salary as Paid ──────────────────────────────────────────
export const markAsPaid = async (request, response) => {
  try {
    const updatedRecord = await TeacherSalary.findByIdAndUpdate(
      request.params.id,
      { status: "paid", paidDate: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedRecord) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Salary record not found",
      });
    }
    response.status(200).json({
      success: true,
      error: false,
      message: "Salary marked as paid successfully",
      data: updatedRecord,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};