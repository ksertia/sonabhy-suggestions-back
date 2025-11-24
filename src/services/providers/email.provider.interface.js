/**
 * Email Provider Interface
 * All email providers must implement this interface
 */

class IEmailProvider {
  /**
   * Send an email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML content
   * @param {string} options.text - Plain text content (optional)
   * @param {string} options.from - Sender email (optional)
   * @param {Array} options.attachments - Attachments (optional)
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    throw new Error('sendEmail() must be implemented');
  }

  /**
   * Verify email provider configuration
   * @returns {Promise<boolean>} Verification result
   */
  async verify() {
    throw new Error('verify() must be implemented');
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented');
  }
}

module.exports = IEmailProvider;
