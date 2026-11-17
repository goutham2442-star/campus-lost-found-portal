const { getMode, fileStores } = require("../config/db");
const MongooseNotification = require("../models/Notification");
const notifStore = fileStores.notifications;

class NotificationRepository {
  static async create(data) {
    if (getMode() === "mongo") {
      const notif = new MongooseNotification(data);
      return await notif.save();
    } else {
      const now = new Date();
      const doc = await notifStore.insert({
        ...data,
        isRead: false,
        createdAt: now,
        updatedAt: now
      });
      return { ...doc, id: doc._id };
    }
  }

  static async findByUser(userId) {
    if (getMode() === "mongo") {
      return await MongooseNotification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("relatedItem", "name type emoji");
    } else {
      const docs = await notifStore.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
      return docs.map(d => ({ ...d, id: d._id }));
    }
  }

  static async countUnread(userId) {
    if (getMode() === "mongo") {
      return await MongooseNotification.countDocuments({ user: userId, isRead: false });
    } else {
      return await notifStore.count({ user: userId, isRead: false });
    }
  }

  static async markAsRead(id, userId) {
    if (getMode() === "mongo") {
      return await MongooseNotification.findOneAndUpdate(
        { _id: id, user: userId },
        { isRead: true },
        { new: true }
      );
    } else {
      await notifStore.update({ _id: id, user: userId }, { $set: { isRead: true } });
      return await notifStore.findOne({ _id: id });
    }
  }

  static async markAllAsRead(userId) {
    if (getMode() === "mongo") {
      await MongooseNotification.updateMany({ user: userId, isRead: false }, { isRead: true });
    } else {
      await notifStore.update({ user: userId, isRead: false }, { $set: { isRead: true } }, { multi: true });
    }
  }

  static async clearAll() {
    if (getMode() === "mongo") {
      await MongooseNotification.deleteMany({});
    } else {
      await notifStore.remove({}, { multi: true });
    }
  }
}

module.exports = NotificationRepository;
