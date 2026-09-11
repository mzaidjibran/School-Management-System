import { Notification } from "../models/Notification_Model.js";

// Helper function to create a notification programmatically scoped to owner/principal
export const createNotificationHelper = async (title, message, type = "system", createdBy = null) => {
  try {
    const notification = await Notification.create({ title, message, type, createdBy });
    return notification;
  } catch (err) {
    console.error("Error creating notification helper:", err);
  }
};

// Fetch notifications (scoped to logged in principal/owner)
export const getNotifications = async (req, res) => {
  try {
    const ownerId = req.user && req.user.role === "teacher" ? req.user.createdBy : req.userId;
    const filter = ownerId ? { $or: [{ createdBy: ownerId }, { createdBy: null }] } : {};

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark all as read (scoped to logged in principal/owner)
export const markAllAsRead = async (req, res) => {
  try {
    const ownerId = req.user && req.user.role === "teacher" ? req.user.createdBy : req.userId;
    const filter = { read: false };
    if (ownerId) filter.$or = [{ createdBy: ownerId }, { createdBy: null }];

    await Notification.updateMany(filter, { read: true });
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
