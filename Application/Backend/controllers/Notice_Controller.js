import Notice from "../models/Notice_Model.js";

export const getAllNotices = async (req, res) => {
  try {
    const { status, priority, targetAudience, page = 1, limit = 20 } = req.query;
    const filter = { createdBy: req.userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (targetAudience) filter.targetAudience = targetAudience;
    if (req.headers["x-branch-id"]) filter.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) filter.schoolSection = req.headers["x-section"];

    const total = await Notice.countDocuments(filter);
    const notices = await Notice.find(filter)
      .populate("createdBy", "Name")
      .populate("targetClass", "name section")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ publishDate: -1 });

    res.json({ success: true, total, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNoticeById = async (req, res) => {
  try {
    const query = { _id: req.params.id, createdBy: req.userId };
    if (req.headers["x-branch-id"]) query.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) query.schoolSection = req.headers["x-section"];

    const notice = await Notice.findOneAndUpdate(
      query,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("createdBy", "Name");
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json({ success: true, notice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createNotice = async (req, res) => {
  try {
    req.body.createdBy = req.userId;
    if (req.headers["x-branch-id"]) req.body.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) req.body.schoolSection = req.headers["x-section"];
    const notice = new Notice({ ...req.body});
    await notice.save();
    const populated = await Notice.findById(notice._id).populate("createdBy", "Name");
    res.status(201).json({ success: true, message: "Notice created", notice: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const query = { _id: req.params.id, createdBy: req.userId };
    if (req.headers["x-branch-id"]) query.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) query.schoolSection = req.headers["x-section"];

    const notice = await Notice.findOneAndUpdate(query, req.body, {
      new: true, runValidators: true,
    }).populate("createdBy", "Name");
    if (!notice) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json({ success: true, message: "Notice updated", notice });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    const query = { _id: req.params.id, createdBy: req.userId };
    if (req.headers["x-branch-id"]) query.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) query.schoolSection = req.headers["x-section"];

    const deleted = await Notice.findOneAndDelete(query);
    if (!deleted) return res.status(404).json({ success: false, message: "Notice not found" });
    res.json({ success: true, message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getActiveNotices = async (req, res) => {
  try {
    const now = new Date();
    const filter = {
      createdBy: req.userId,
      status: "published",
      publishDate: { $lte: now },
      $or: [{ expiryDate: { $gte: now } }, { expiryDate: null }],
    };
    if (req.headers["x-branch-id"]) filter.branch = req.headers["x-branch-id"];
    if (req.headers["x-section"]) filter.schoolSection = req.headers["x-section"];

    const notices = await Notice.find(filter).sort({ priority: 1, publishDate: -1 }).limit(10);
    res.json({ success: true, notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};