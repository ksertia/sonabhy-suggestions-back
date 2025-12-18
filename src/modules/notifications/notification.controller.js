const notificationService = require('./notification.service');
const { successResponse } = require('../../utils/response');

class NotificationController {
  async getUserNotifications(req, res, next) {
    try {
      const filters = {
        isRead: req.query.read,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        role: req.user.role,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await notificationService.getUserNotifications(req.user.id, filters, pagination);
      successResponse(res, result, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getNotificationById(req, res, next) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id, req.user);
      successResponse(res, { notification }, 'Notification retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user);
      successResponse(res, { notification }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user);
      successResponse(res, {}, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const result = await notificationService.getUnreadCount(req.user);
      successResponse(res, result, 'Unread count retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const result = await notificationService.deleteNotification(req.params.id, req.user);
      successResponse(res, result, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteAllNotifications(req, res, next) {
    try {
      const result = await notificationService.deleteAllNotifications(req.user);
      successResponse(res, result, 'All notifications deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async sendTestNotification(req, res, next) {
    try {
      const { type, message, metadata } = req.body;
      const notification = await notificationService.sendInternalNotification(
        req.user.id,
        type,
        message,
        metadata
      );
      successResponse(res, { notification }, 'Test notification sent successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async createNotification(req, res, next) {
    try {
      const notification = await notificationService.createNotification(req.body);
      successResponse(res, { notification }, 'notification sended');
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new NotificationController();
