import {Class} from "../models/Class_Model.js";

// ─── Create Class ─────────────────────────────────────────────────
export const createClass = async (request, response) => {
  try {
    request.body.createdBy = request.userId;
    if (request.headers["x-branch-id"]) request.body.branch = request.headers["x-branch-id"];
    request.body.schoolSection = request.body.schoolSection || request.headers["x-section"];
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
    const ownerId = request.user && request.user.role === "teacher" ? request.user.createdBy : request.userId;
    const filter = { createdBy: ownerId };
    if (academicYear) filter.academicYear = academicYear;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (request.headers["x-branch-id"]) filter.branch = request.headers["x-branch-id"];
    
    if (request.user && request.user.role === "teacher") {
      filter.schoolSection = request.user.gender === "female" ? "girls" : "boys";
    } else {
      const sectionParam = request.query.schoolSection || request.query.section;
      if (sectionParam) {
        if (sectionParam !== "all") {
          filter.schoolSection = sectionParam;
        }
      } else if (request.headers["x-section"]) {
        filter.schoolSection = request.headers["x-section"];
      }
    }

    const classes = await Class.find(filter)
      .populate("classTeacher", "firstName lastName name email profileImage")
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
    const query = { _id: request.params.id, createdBy: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const singleClass = await Class.findOne(query).populate(
      "classTeacher",
      "firstName lastName name email profileImage"
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
    const query = { _id: request.params.id, createdBy: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const updatedClass = await Class.findOneAndUpdate(
      query,
      request.body,
      { new: true, runValidators: true }
    ).populate("classTeacher", "firstName lastName name email profileImage");

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

export const deleteClass = async (request, response) => {
  try {
    const query = { _id: request.params.id, createdBy: request.userId };
    if (request.headers["x-branch-id"]) query.branch = request.headers["x-branch-id"];
    if (request.headers["x-section"]) query.schoolSection = request.headers["x-section"];

    const deletedClass = await Class.findOneAndDelete(query);

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