/**
 * Identity Provider Interface
 * All identity providers must implement this interface
 */

class IIdentityProvider {
  /**
   * Authenticate user with external provider
   * @param {Object} credentials - Authentication credentials
   * @returns {Promise<Object>} User information
   */
  async authenticate(credentials) {
    throw new Error('authenticate() must be implemented');
  }

  /**
   * Verify access token
   * @param {string} token - Access token
   * @returns {Promise<Object>} Token verification result
   */
  async verifyToken(token) {
    throw new Error('verifyToken() must be implemented');
  }

  /**
   * Get user profile from provider
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getUserProfile(userId) {
    throw new Error('getUserProfile() must be implemented');
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshAccessToken(refreshToken) {
    throw new Error('refreshAccessToken() must be implemented');
  }

  /**
   * Revoke token
   * @param {string} token - Token to revoke
   * @returns {Promise<boolean>} Revocation result
   */
  async revokeToken(token) {
    throw new Error('revokeToken() must be implemented');
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented');
  }
}

module.exports = IIdentityProvider;
