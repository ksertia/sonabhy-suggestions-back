const notificationRepository = require('./notification.repository');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');


class NotificationService {

  async createNotification (data) {
    if(!data) throw NotFoundError('Aucune donné dans la data');

    return await notificationRepository.create(data);
  }
  /**
   * Send internal notification (stored in database)
   */
  async sendInternalNotification(userId, type, message, metadata = {}) {
    const notification = await notificationRepository.create({
      userId,
      type,
      message,
      metadata: metadata || {},
      isRead: false,
    });

    console.log(`📬 [NOTIFICATION] Internal notification sent to user ${userId}: ${message}`);
    
    return notification;
  }


  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters, pagination) {
    console.log(filters)
    const result = await notificationRepository.findAll(userId, filters, pagination);
    return result;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id, user) {
    const notification = await notificationRepository.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Check permissions
    if (notification.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to view this notification');
    }

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id, user) {
    const notification = await notificationRepository.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Check permissions
    if (notification.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to update this notification');
    }

    return notificationRepository.markAsRead(id);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(user) {
    return notificationRepository.markAllAsRead(user.id);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(user) {
    const count = await notificationRepository.getUnreadCount(user.id);
    return { count };
  }

  /**
   * Delete notification
   */
  async deleteNotification(id, user) {
    const notification = await notificationRepository.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Check permissions
    if (notification.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this notification');
    }

    await notificationRepository.delete(id);
    return { message: 'Notification deleted successfully' };
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(user) {
    await notificationRepository.deleteAll(user.id);
    return { message: 'All notifications deleted successfully' };
  }
}

module.exports = new NotificationService();
