/**
 * Email Service - Mock Implementation
 * 
 * This is a mock email service for development.
 * Replace with real SMTP implementation (nodemailer, SendGrid, etc.) in production.
 * 
 * To integrate real SMTP:
 * 1. Install nodemailer: npm install nodemailer
 * 2. Configure SMTP settings in .env
 * 3. Replace mock methods with real email sending logic
 */

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.emailLogs = []; // Store email logs for development
  }

  /**
   * Send email (Mock implementation)
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML or plain text)
   * @param {object} options - Additional options (cc, bcc, attachments, etc.)
   * @returns {Promise<object>} Email send result
   */
  async sendEmail(to, subject, body, options = {}) {
    const emailData = {
      to,
      subject,
      body,
      ...options,
      sentAt: new Date(),
      status: 'sent',
    };

    // Mock implementation - log to console and store
    console.log('📧 [EMAIL SERVICE - MOCK] Sending email:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body.substring(0, 100)}...`);
    
    // Store in memory for testing
    this.emailLogs.push(emailData);

    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      to,
      subject,
    };
  }

  /**
   * Send idea submission notification
   */
  async sendIdeaSubmissionEmail(user, idea) {
    const subject = `Idea Submitted: ${idea.title}`;
    const body = `
      <h2>Idea Submitted Successfully</h2>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>Your idea has been submitted successfully!</p>
      <h3>Idea Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${idea.title}</li>
        <li><strong>Description:</strong> ${idea.description || 'N/A'}</li>
        <li><strong>Status:</strong> ${idea.status?.name || 'Pending'}</li>
        <li><strong>Category:</strong> ${idea.category?.name || 'N/A'}</li>
      </ul>
      <p>Your idea will be reviewed by our team shortly.</p>
      <p>Thank you for your contribution!</p>
    `;

    return this.sendEmail(user.email, subject, body);
  }

  /**
   * Send idea status change notification
   */
  async sendIdeaStatusChangeEmail(user, idea, oldStatus, newStatus) {
    const subject = `Idea Status Updated: ${idea.title}`;
    const body = `
      <h2>Idea Status Changed</h2>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>The status of your idea has been updated.</p>
      <h3>Idea Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${idea.title}</li>
        <li><strong>Previous Status:</strong> ${oldStatus}</li>
        <li><strong>New Status:</strong> ${newStatus}</li>
      </ul>
      <p>You can view your idea details in the system.</p>
    `;

    return this.sendEmail(user.email, subject, body);
  }

  /**
   * Send plan action assignment notification
   */
  async sendPlanActionAssignedEmail(user, planAction, idea) {
    const subject = `New Plan Action Assigned: ${planAction.title}`;
    const body = `
      <h2>Plan Action Assigned to You</h2>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>A new plan action has been assigned to you.</p>
      <h3>Action Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${planAction.title}</li>
        <li><strong>Description:</strong> ${planAction.description || 'N/A'}</li>
        <li><strong>Related Idea:</strong> ${idea?.title || 'N/A'}</li>
        <li><strong>Deadline:</strong> ${planAction.deadline ? new Date(planAction.deadline).toLocaleDateString() : 'No deadline'}</li>
        <li><strong>Progress:</strong> ${planAction.progress}%</li>
      </ul>
      <p>Please log in to the system to view and manage this action.</p>
    `;

    return this.sendEmail(user.email, subject, body);
  }

  /**
   * Send comment notification
   */
  async sendCommentNotificationEmail(user, comment, idea) {
    const subject = `New Comment on Idea: ${idea.title}`;
    const body = `
      <h2>New Comment on Your Idea</h2>
      <p>Hello ${user.firstName} ${user.lastName},</p>
      <p>A new comment has been added to your idea.</p>
      <h3>Comment Details:</h3>
      <ul>
        <li><strong>Idea:</strong> ${idea.title}</li>
        <li><strong>Comment:</strong> ${comment.content}</li>
        <li><strong>By:</strong> ${comment.user?.firstName} ${comment.user?.lastName}</li>
      </ul>
      <p>You can view and reply to this comment in the system.</p>
    `;

    return this.sendEmail(user.email, subject, body);
  }

  /**
   * Get email logs (for testing/debugging)
   */
  getEmailLogs() {
    return this.emailLogs;
  }

  /**
   * Clear email logs
   */
  clearEmailLogs() {
    this.emailLogs = [];
  }
}

module.exports = new EmailService();

/* 
 * PRODUCTION SMTP INTEGRATION EXAMPLE:
 * 
 * const nodemailer = require('nodemailer');
 * 
 * class EmailService {
 *   constructor() {
 *     this.transporter = nodemailer.createTransport({
 *       host: process.env.SMTP_HOST,
 *       port: process.env.SMTP_PORT,
 *       secure: process.env.SMTP_SECURE === 'true',
 *       auth: {
 *         user: process.env.SMTP_USER,
 *         pass: process.env.SMTP_PASSWORD,
 *       },
 *     });
 *   }
 * 
 *   async sendEmail(to, subject, body, options = {}) {
 *     const mailOptions = {
 *       from: process.env.SMTP_FROM || 'noreply@ideabox.com',
 *       to,
 *       subject,
 *       html: body,
 *       ...options,
 *     };
 * 
 *     const info = await this.transporter.sendMail(mailOptions);
 *     return {
 *       success: true,
 *       messageId: info.messageId,
 *       to,
 *       subject,
 *     };
 *   }
 * }
 */
