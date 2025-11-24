/**
 * Storage Provider Interface
 * All storage providers must implement this interface
 */

class IStorageProvider {
  /**
   * Upload a file
   * @param {Object} file - File object
   * @param {string} file.path - Local file path
   * @param {string} file.originalname - Original filename
   * @param {string} file.mimetype - MIME type
   * @param {number} file.size - File size in bytes
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with URL
   */
  async uploadFile(file, options = {}) {
    throw new Error('uploadFile() must be implemented');
  }

  /**
   * Download a file
   * @param {string} fileKey - File identifier/key
   * @returns {Promise<Buffer>} File buffer
   */
  async downloadFile(fileKey) {
    throw new Error('downloadFile() must be implemented');
  }

  /**
   * Delete a file
   * @param {string} fileKey - File identifier/key
   * @returns {Promise<boolean>} Deletion result
   */
  async deleteFile(fileKey) {
    throw new Error('deleteFile() must be implemented');
  }

  /**
   * Get file URL
   * @param {string} fileKey - File identifier/key
   * @param {Object} options - URL options (expiry, etc.)
   * @returns {Promise<string>} File URL
   */
  async getFileUrl(fileKey, options = {}) {
    throw new Error('getFileUrl() must be implemented');
  }

  /**
   * Check if file exists
   * @param {string} fileKey - File identifier/key
   * @returns {Promise<boolean>} Existence result
   */
  async fileExists(fileKey) {
    throw new Error('fileExists() must be implemented');
  }

  /**
   * Get provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    throw new Error('getProviderName() must be implemented');
  }
}

module.exports = IStorageProvider;
