const express = require("express");
const router = express.Router();
const NotificationRepository = require("../repositories/NotificationRepository");
const ItemRepository = require("../repositories/ItemRepository");
const { authMiddleware } = require("../middleware/auth");

// Get notifications for current user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const notifications = await NotificationRepository.findByUser(userId);
    const unreadCount = await NotificationRepository.countUnread(userId);

    const populated = await Promise.all(
      notifications.map(async n => {
        let item = null;
        if (n.relatedItem) {
          item = await ItemRepository.findById(n.relatedItem);
        }
        return {
          ...n,
          id: n._id || n.id,
          relatedItem: item ? { id: item._id || item.id, name: item.name, type: item.type, emoji: item.emoji } : null
        };
      })
    );

    res.json({
      success: true,
      unreadCount,
      notifications: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark single notification as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const notification = await NotificationRepository.markAsRead(req.params.id, userId);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    res.json({ success: true, notification: { ...notification, id: notification._id || notification.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark all as read
router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    await NotificationRepository.markAllAsRead(userId);
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
