import { Notification } from "../models/Notification_Model.js";

// Helper function to create a notification programmatically
export const createNotificationHelper = async (title, message, type = "system") => {
  try {
    const notification = await Notification.create({ title, message, type });
    return notification;
  } catch (err) {
    console.error("Error creating notification helper:", err);
  }
};

// Fetch notifications (limit to last 20)
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
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

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
