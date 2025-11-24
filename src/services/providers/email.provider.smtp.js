/**
 * SMTP Email Provider
 * Real email sending via SMTP (nodemailer)
 * 
 * To use: npm install nodemailer
 */

const IEmailProvider = require('./email.provider.interface');

class SMTPEmailProvider extends IEmailProvider {
  constructor(config = {}) {
    super();
    this.config = {
      host: config.host || process.env.SMTP_HOST,
      port: config.port || process.env.SMTP_PORT || 587,
      secure: config.secure || process.env.SMTP_SECURE === 'true',
      auth: {
        user: config.user || process.env.SMTP_USER,
        pass: config.pass || process.env.SMTP_PASSWORD,
      },
      from: config.from || process.env.SMTP_FROM || 'noreply@ideabox.com',
    };

    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize nodemailer transporter
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Lazy load nodemailer
      const nodemailer = require('nodemailer');

      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      this.initialized = true;
      console.log('✅ [SMTP EMAIL PROVIDER] Initialized successfully');
    } catch (error) {
      console.error('❌ [SMTP EMAIL PROVIDER] Initialization failed:', error.message);
      throw new Error(`SMTP Email Provider initialization failed: ${error.message}`);
    }
  }

  /**
   * Send email via SMTP
   */
  async sendEmail(options) {
    await this.initialize();

    const { to, subject, html, text, from, attachments = [] } = options;

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      throw new Error('Missing required email fields: to, subject, and html/text');
    }

    try {
      const mailOptions = {
        from: from || this.config.from,
        to,
        subject,
        html,
        text,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log('📧 [SMTP EMAIL PROVIDER] Email sent:');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp',
        to,
        subject,
      };
    } catch (error) {
      console.error('❌ [SMTP EMAIL PROVIDER] Send failed:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Verify SMTP configuration
   */
  async verify() {
    await this.initialize();

    try {
      await this.transporter.verify();
      console.log('✅ [SMTP EMAIL PROVIDER] Verification successful');
      return true;
    } catch (error) {
      console.error('❌ [SMTP EMAIL PROVIDER] Verification failed:', error.message);
      return false;
    }
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'SMTPEmailProvider';
  }
}

module.exports = SMTPEmailProvider;
