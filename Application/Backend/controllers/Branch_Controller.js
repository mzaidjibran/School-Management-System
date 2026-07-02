import { Branch } from "../models/Branch_Model.js";

// Get all branches for the authenticated Principal
export const getAllBranches = async (request, response) => {
  try {
    const branches = await Branch.find({ createdBy: request.userId });

    response.status(200).json({
      success: true,
      error: false,
      data: branches,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// Create a new school branch
export const createBranch = async (request, response) => {
  try {
    const { name, code, address, phone } = request.body;
    
    if (!name || !code) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "Name and code are mandatory",
      });
    }

    // Check unique code per principal
    const exists = await Branch.findOne({ code, createdBy: request.userId });
    if (exists) {
      return response.status(400).json({
        success: false,
        error: true,
        message: `Branch code '${code}' already exists`,
      });
    }

    const branch = await Branch.create({
      name,
      code,
      address: address || "",
      phone: phone || "",
      createdBy: request.userId,
    });

    response.status(201).json({
      success: true,
      error: false,
      data: branch,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};

// Delete a school branch
export const deleteBranch = async (request, response) => {
  try {
    const { id } = request.params;
    const deleted = await Branch.findOneAndDelete({ _id: id, createdBy: request.userId });
    
    if (!deleted) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Branch not found",
      });
    }

    response.status(200).json({
      success: true,
      error: false,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      error: true,
      message: error.message,
    });
  }
};
