/**
 * AWS S3 Storage Provider
 * Real cloud storage via AWS S3
 * 
 * To use: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 */

const IStorageProvider = require('./storage.provider.interface');
const fs = require('fs').promises;

class S3StorageProvider extends IStorageProvider {
  constructor(config = {}) {
    super();
    this.config = {
      region: config.region || process.env.AWS_REGION || 'us-east-1',
      bucket: config.bucket || process.env.AWS_S3_BUCKET,
      accessKeyId: config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
    };

    this.s3Client = null;
    this.initialized = false;
  }

  /**
   * Initialize AWS S3 client
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const { S3Client } = require('@aws-sdk/client-s3');

      this.s3Client = new S3Client({
        region: this.config.region,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });

      this.initialized = true;
      console.log('✅ [S3 STORAGE PROVIDER] Initialized successfully');
    } catch (error) {
      console.error('❌ [S3 STORAGE PROVIDER] Initialization failed:', error.message);
      throw new Error(`S3 Storage Provider initialization failed: ${error.message}`);
    }
  }

  /**
   * Upload file to S3
   */
  async uploadFile(file, options = {}) {
    await this.initialize();

    const { PutObjectCommand } = require('@aws-sdk/client-s3');

    const fileKey = this.generateFileKey(file.originalname, options.folder);
    const fileBuffer = await fs.readFile(file.path);

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.mimetype,
      Metadata: options.metadata || {},
    });

    try {
      await this.s3Client.send(command);

      const url = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${fileKey}`;

      console.log('📦 [S3 STORAGE PROVIDER] File uploaded:');
      console.log(`   Key: ${fileKey}`);
      console.log(`   Bucket: ${this.config.bucket}`);
      console.log(`   URL: ${url}`);

      return {
        success: true,
        key: fileKey,
        url,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      console.error('❌ [S3 STORAGE PROVIDER] Upload failed:', error.message);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Download file from S3
   */
  async downloadFile(fileKey) {
    await this.initialize();

    const { GetObjectCommand } = require('@aws-sdk/client-s3');

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
    });

    try {
      const response = await this.s3Client.send(command);
      const buffer = await this.streamToBuffer(response.Body);

      console.log('📥 [S3 STORAGE PROVIDER] File downloaded:');
      console.log(`   Key: ${fileKey}`);

      return buffer;
    } catch (error) {
      console.error('❌ [S3 STORAGE PROVIDER] Download failed:', error.message);
      throw new Error(`Failed to download file from S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(fileKey) {
    await this.initialize();

    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
    });

    try {
      await this.s3Client.send(command);

      console.log('🗑️  [S3 STORAGE PROVIDER] File deleted:');
      console.log(`   Key: ${fileKey}`);

      return true;
    } catch (error) {
      console.error('❌ [S3 STORAGE PROVIDER] Delete failed:', error.message);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Get presigned URL for file
   */
  async getFileUrl(fileKey, options = {}) {
    await this.initialize();

    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: options.expiresIn || 3600, // 1 hour default
      });

      return url;
    } catch (error) {
      console.error('❌ [S3 STORAGE PROVIDER] Get URL failed:', error.message);
      throw new Error(`Failed to get file URL from S3: ${error.message}`);
    }
  }

  /**
   * Check if file exists in S3
   */
  async fileExists(fileKey) {
    await this.initialize();

    const { HeadObjectCommand } = require('@aws-sdk/client-s3');

    const command = new HeadObjectCommand({
      Bucket: this.config.bucket,
      Key: fileKey,
    });

    try {
      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'S3StorageProvider';
  }

  /**
   * Generate unique file key
   */
  generateFileKey(originalName, folder = 'uploads') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const ext = originalName.split('.').pop();
    return `${folder}/${timestamp}-${random}.${ext}`;
  }

  /**
   * Convert stream to buffer
   */
  async streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

module.exports = S3StorageProvider;
