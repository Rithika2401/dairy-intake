const notificationService = require('../services/notification.service');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const items = await notificationService.getUserNotifications(req.user.id, req.user.organization_id);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      await notificationService.markAsRead(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id, req.user.organization_id);
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
