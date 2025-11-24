/**
 * Mock Email Provider
 * Simulates email sending for development/testing
 */

const IEmailProvider = require('./email.provider.interface');

class MockEmailProvider extends IEmailProvider {
  constructor() {
    super();
    this.sentEmails = [];
    this.shouldFail = false;
    this.delay = 100; // Simulate network delay
  }

  /**
   * Send email (mock implementation)
   */
  async sendEmail(options) {
    const { to, subject, html, text, from, attachments = [] } = options;

    // Simulate network delay
    await this.simulateDelay();

    // Simulate failure if configured
    if (this.shouldFail) {
      throw new Error('Mock email provider: Simulated failure');
    }

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      throw new Error('Missing required email fields: to, subject, and html/text');
    }

    // Create email record
    const email = {
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      to,
      subject,
      html,
      text,
      from: from || 'noreply@ideabox.com',
      attachments,
      sentAt: new Date(),
      status: 'sent',
    };

    // Store email
    this.sentEmails.push(email);

    // Log to console
    console.log('📧 [MOCK EMAIL PROVIDER] Email sent:');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${email.from}`);
    console.log(`   Attachments: ${attachments.length}`);
    console.log(`   ID: ${email.id}`);

    return {
      success: true,
      messageId: email.id,
      provider: 'mock',
      to,
      subject,
    };
  }

  /**
   * Verify provider configuration
   */
  async verify() {
    console.log('✅ [MOCK EMAIL PROVIDER] Verification successful');
    return true;
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'MockEmailProvider';
  }

  /**
   * Get all sent emails (for testing)
   */
  getSentEmails() {
    return this.sentEmails;
  }

  /**
   * Get email by ID (for testing)
   */
  getEmailById(id) {
    return this.sentEmails.find(email => email.id === id);
  }

  /**
   * Clear sent emails (for testing)
   */
  clearSentEmails() {
    this.sentEmails = [];
  }

  /**
   * Configure failure mode (for testing)
   */
  setShouldFail(shouldFail) {
    this.shouldFail = shouldFail;
  }

  /**
   * Set network delay (for testing)
   */
  setDelay(delay) {
    this.delay = delay;
  }

  /**
   * Simulate network delay
   */
  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalSent: this.sentEmails.length,
      byRecipient: this.groupByRecipient(),
      bySubject: this.groupBySubject(),
      recentEmails: this.sentEmails.slice(-10),
    };
  }

  /**
   * Group emails by recipient
   */
  groupByRecipient() {
    return this.sentEmails.reduce((acc, email) => {
      acc[email.to] = (acc[email.to] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Group emails by subject
   */
  groupBySubject() {
    return this.sentEmails.reduce((acc, email) => {
      acc[email.subject] = (acc[email.subject] || 0) + 1;
      return acc;
    }, {});
  }
}

module.exports = MockEmailProvider;
