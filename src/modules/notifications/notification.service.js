const notificationRepository = require('./notification.repository');
const emailService = require('../../services/email.service');
const { NotFoundError, ForbiddenError } = require('../../utils/errors');

/**
 * Notification Types
 */
const NOTIFICATION_TYPES = {
  IDEA_SUBMITTED: 'IDEA_SUBMITTED',
  IDEA_STATUS_CHANGED: 'IDEA_STATUS_CHANGED',
  PLAN_ACTION_ASSIGNED: 'PLAN_ACTION_ASSIGNED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  PLAN_ACTION_UPDATED: 'PLAN_ACTION_UPDATED',
  IDEA_APPROVED: 'IDEA_APPROVED',
  IDEA_REJECTED: 'IDEA_REJECTED',
  MENTION: 'MENTION',
  SYSTEM: 'SYSTEM',
};

class NotificationService {
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
   * Trigger notification for idea submission
   */
  async notifyIdeaSubmission(idea, user) {
    try {
      // Send internal notification
      await this.sendInternalNotification(
        user.id,
        NOTIFICATION_TYPES.IDEA_SUBMITTED,
        `Your idea "${idea.title}" has been submitted successfully.`,
        {
          ideaId: idea.id,
          ideaTitle: idea.title,
        }
      );

      // Send email notification
      await emailService.sendIdeaSubmissionEmail(user, idea);

      console.log(`✅ Idea submission notifications sent for idea: ${idea.title}`);
    } catch (error) {
      console.error('Error sending idea submission notifications:', error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Trigger notification for idea status change
   */
  async notifyIdeaStatusChange(idea, user, oldStatus, newStatus) {
    try {
      // Send internal notification
      await this.sendInternalNotification(
        user.id,
        NOTIFICATION_TYPES.IDEA_STATUS_CHANGED,
        `Your idea "${idea.title}" status changed from "${oldStatus}" to "${newStatus}".`,
        {
          ideaId: idea.id,
          ideaTitle: idea.title,
          oldStatus,
          newStatus,
        }
      );

      // Send email notification
      await emailService.sendIdeaStatusChangeEmail(user, idea, oldStatus, newStatus);

      // Special notifications for approval/rejection
      if (newStatus.toLowerCase().includes('approved')) {
        await this.sendInternalNotification(
          user.id,
          NOTIFICATION_TYPES.IDEA_APPROVED,
          `Congratulations! Your idea "${idea.title}" has been approved.`,
          {
            ideaId: idea.id,
            ideaTitle: idea.title,
          }
        );
      } else if (newStatus.toLowerCase().includes('rejected')) {
        await this.sendInternalNotification(
          user.id,
          NOTIFICATION_TYPES.IDEA_REJECTED,
          `Your idea "${idea.title}" has been rejected. Please review the feedback.`,
          {
            ideaId: idea.id,
            ideaTitle: idea.title,
          }
        );
      }

      console.log(`✅ Status change notifications sent for idea: ${idea.title}`);
    } catch (error) {
      console.error('Error sending status change notifications:', error);
    }
  }

  /**
   * Trigger notification for plan action assignment
   */
  async notifyPlanActionAssigned(planAction, assignee, idea) {
    try {
      // Send internal notification
      await this.sendInternalNotification(
        assignee.id,
        NOTIFICATION_TYPES.PLAN_ACTION_ASSIGNED,
        `You have been assigned a new plan action: "${planAction.title}".`,
        {
          planActionId: planAction.id,
          planActionTitle: planAction.title,
          ideaId: idea?.id,
          ideaTitle: idea?.title,
        }
      );

      // Send email notification
      await emailService.sendPlanActionAssignedEmail(assignee, planAction, idea);

      console.log(`✅ Plan action assignment notifications sent to: ${assignee.email}`);
    } catch (error) {
      console.error('Error sending plan action assignment notifications:', error);
    }
  }

  /**
   * Trigger notification for comment added
   */
  async notifyCommentAdded(comment, ideaOwner, idea) {
    try {
      // Don't notify if the comment author is the idea owner
      if (comment.userId === ideaOwner.id) {
        return;
      }

      // Send internal notification
      await this.sendInternalNotification(
        ideaOwner.id,
        NOTIFICATION_TYPES.COMMENT_ADDED,
        `New comment on your idea "${idea.title}".`,
        {
          commentId: comment.id,
          ideaId: idea.id,
          ideaTitle: idea.title,
          commenterId: comment.userId,
        }
      );

      // Send email notification
      await emailService.sendCommentNotificationEmail(ideaOwner, comment, idea);

      console.log(`✅ Comment notifications sent for idea: ${idea.title}`);
    } catch (error) {
      console.error('Error sending comment notifications:', error);
    }
  }

  /**
   * Trigger notification for plan action update
   */
  async notifyPlanActionUpdated(planAction, idea, updatedBy) {
    try {
      // Notify idea owner if different from updater
      const prisma = require('../../config/database');
      const ideaOwner = await prisma.user.findUnique({
        where: { id: idea.userId },
      });

      if (ideaOwner && ideaOwner.id !== updatedBy.id) {
        await this.sendInternalNotification(
          ideaOwner.id,
          NOTIFICATION_TYPES.PLAN_ACTION_UPDATED,
          `Plan action "${planAction.title}" for your idea "${idea.title}" has been updated.`,
          {
            planActionId: planAction.id,
            planActionTitle: planAction.title,
            ideaId: idea.id,
            ideaTitle: idea.title,
            progress: planAction.progress,
          }
        );
      }

      console.log(`✅ Plan action update notifications sent`);
    } catch (error) {
      console.error('Error sending plan action update notifications:', error);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters, pagination) {
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
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
