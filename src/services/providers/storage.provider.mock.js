/**
 * Mock Storage Provider
 * Simulates cloud storage for development/testing
 */

const IStorageProvider = require('./storage.provider.interface');

class MockStorageProvider extends IStorageProvider {
  constructor() {
    super();
    this.storage = new Map(); // In-memory storage
    this.shouldFail = false;
    this.delay = 50;
    this.baseUrl = 'https://mock-storage.ideabox.com';
  }

  /**
   * Upload file (mock implementation)
   */
  async uploadFile(file, options = {}) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock storage provider: Simulated upload failure');
    }

    if (!file || !file.path) {
      throw new Error('Invalid file object');
    }

    // Generate unique file key
    const fileKey = this.generateFileKey(file.originalname);
    const folder = options.folder || 'uploads';
    const fullKey = `${folder}/${fileKey}`;

    // Store file metadata
    const fileData = {
      key: fullKey,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      url: `${this.baseUrl}/${fullKey}`,
      metadata: options.metadata || {},
    };

    this.storage.set(fullKey, fileData);

    console.log('📦 [MOCK STORAGE PROVIDER] File uploaded:');
    console.log(`   Key: ${fullKey}`);
    console.log(`   Original Name: ${file.originalname}`);
    console.log(`   Size: ${file.size} bytes`);
    console.log(`   URL: ${fileData.url}`);

    return {
      success: true,
      key: fullKey,
      url: fileData.url,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * Download file (mock implementation)
   */
  async downloadFile(fileKey) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock storage provider: Simulated download failure');
    }

    const fileData = this.storage.get(fileKey);

    if (!fileData) {
      throw new Error(`File not found: ${fileKey}`);
    }

    console.log('📥 [MOCK STORAGE PROVIDER] File downloaded:');
    console.log(`   Key: ${fileKey}`);

    // Return mock buffer
    return Buffer.from(`Mock file content for: ${fileKey}`);
  }

  /**
   * Delete file (mock implementation)
   */
  async deleteFile(fileKey) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock storage provider: Simulated delete failure');
    }

    const existed = this.storage.has(fileKey);
    this.storage.delete(fileKey);

    console.log('🗑️  [MOCK STORAGE PROVIDER] File deleted:');
    console.log(`   Key: ${fileKey}`);
    console.log(`   Existed: ${existed}`);

    return existed;
  }

  /**
   * Get file URL (mock implementation)
   */
  async getFileUrl(fileKey, options = {}) {
    const fileData = this.storage.get(fileKey);

    if (!fileData) {
      throw new Error(`File not found: ${fileKey}`);
    }

    // Add expiry parameter if specified
    let url = fileData.url;
    if (options.expiresIn) {
      const expiryTime = Date.now() + options.expiresIn * 1000;
      url += `?expires=${expiryTime}`;
    }

    return url;
  }

  /**
   * Check if file exists (mock implementation)
   */
  async fileExists(fileKey) {
    return this.storage.has(fileKey);
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'MockStorageProvider';
  }

  /**
   * Generate unique file key
   */
  generateFileKey(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const ext = originalName.split('.').pop();
    return `${timestamp}-${random}.${ext}`;
  }

  /**
   * Simulate network delay
   */
  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  /**
   * Get all stored files (for testing)
   */
  getAllFiles() {
    return Array.from(this.storage.values());
  }

  /**
   * Get file metadata (for testing)
   */
  getFileMetadata(fileKey) {
    return this.storage.get(fileKey);
  }

  /**
   * Clear all files (for testing)
   */
  clearAllFiles() {
    this.storage.clear();
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
   * Get storage statistics
   */
  getStats() {
    const files = Array.from(this.storage.values());
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const byMimeType = files.reduce((acc, file) => {
      acc[file.mimetype] = (acc[file.mimetype] || 0) + 1;
      return acc;
    }, {});

    return {
      totalFiles: files.length,
      totalSize,
      byMimeType,
      recentFiles: files.slice(-10),
    };
  }
}

module.exports = MockStorageProvider;
