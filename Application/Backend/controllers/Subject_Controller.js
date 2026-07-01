import Subject from "../models/Subject_Model.js";

export const getAllSubjects = async (req, res) => {
  try {
    const { classId, status, search } = req.query;
    const filter = { createdBy: req.userId };
    if (classId) filter.class = classId;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const subjects = await Subject.find(filter)
      .populate("class", "name section")
      .populate("teacher", "name")
      .sort({ name: 1 });

    res.json({
      success: true,
      error: false,
      message: "Subjects fetched successfully",
      total: subjects.length,
      data: subjects,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, createdBy: req.userId })
      .populate("class", "name section")
      .populate("teacher", "name");
    if (!subject)
      return res.status(404).json({ success: false, error: true, message: "Subject not found" });
    res.json({ success: true, error: false, message: "Subject fetched", data: subject });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};

export const addSubject = async (req, res) => {
  try {
    req.body.createdBy = req.userId;
    const subject = new Subject(req.body);
    await subject.save();
    const populated = await Subject.findOne({ _id: subject._id, createdBy: req.userId })
      .populate("class", "name section")
      .populate("teacher", "name");
    res.status(201).json({
      success: true,
      error: false,
      message: "Subject added successfully",
      data: populated,
    });
  } catch (err) {
    // Duplicate code check
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: true,
        message: "Yeh subject code already exist karta hai",
      });
    }
    res.status(400).json({ success: false, error: true, message: err.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("class", "name section")
      .populate("teacher", "name");
    if (!subject)
      return res.status(404).json({ success: false, error: true, message: "Subject not found" });
    res.json({
      success: true,
      error: false,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (err) {
    res.status(400).json({ success: false, error: true, message: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!deleted)
      return res.status(404).json({ success: false, error: true, message: "Subject not found" });
    res.json({
      success: true,
      error: false,
      message: "Subject deleted successfully",
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: true, message: err.message });
  }
};