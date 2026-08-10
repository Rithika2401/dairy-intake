const db = require('../config/db');

class NotificationService {
  async getUserNotifications(userId, organizationId) {
    return await db.query(
      `SELECT n.* FROM notifications n 
       WHERE n.recipient_id = ? AND n.organization_id = ?
       ORDER BY n.created_at DESC`,
      [userId, organizationId]
    );
  }

  async markAsRead(notificationId, userId) {
    await db.query(
      `UPDATE notifications SET status = 'READ' WHERE id = ? AND recipient_id = ?`,
      [notificationId, userId]
    );
    return { success: true };
  }

  async markAllAsRead(userId, organizationId) {
    await db.query(
      `UPDATE notifications SET status = 'READ' WHERE recipient_id = ? AND organization_id = ?`,
      [userId, organizationId]
    );
    return { success: true };
  }
}

module.exports = new NotificationService();
