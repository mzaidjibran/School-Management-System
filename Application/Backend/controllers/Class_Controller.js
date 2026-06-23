import {Class} from "../models/Class_Model.js";

// ─── Create Class ─────────────────────────────────────────────────
export const createClass = async (request, response) => {
  try {
    const newClass = await Class.create(request.body);

    response.status(201).json({
      success: true,
      error: false,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        error: true,
        message: "Yeh class already exist karti hai",
      });
    }
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get All Classes ──────────────────────────────────────────────
export const getAllClasses = async (request, response) => {
  try {
    const { academicYear, isActive } = request.query;
    const filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const classes = await Class.find(filter)
      .populate("classTeacher", "firstName lastName name email")
      .sort({ name: 1, section: 1 });

    response.status(200).json({
      success: true,
      error: false,
      message: "Classes fetched successfully",
      data: classes,
      total: classes.length,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Get Single Class ─────────────────────────────────────────────
export const getSingleClass = async (request, response) => {
  try {
    const singleClass = await Class.findById(request.params.id).populate(
      "classTeacher",
      "firstName lastName name email"
    );

    if (!singleClass) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Class nahi mili",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Class fetched successfully",
      data: singleClass,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Update Class ─────────────────────────────────────────────────
export const updateClass = async (request, response) => {
  try {
    const updatedClass = await Class.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    ).populate("classTeacher", "firstName lastName name email");

    if (!updatedClass) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Class nahi mili",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// ─── Delete Class ─────────────────────────────────────────────────
export const deleteClass = async (request, response) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(request.params.id);

    if (!deletedClass) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Class nahi mili",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Class deleted successfully",
      data: deletedClass,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};