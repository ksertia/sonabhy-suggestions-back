/**
 * Provider Factory
 * Dependency Injection container for swappable providers
 */

// Email Providers
const MockEmailProvider = require('./email.provider.mock');
const SMTPEmailProvider = require('./email.provider.smtp');

// Storage Providers
const MockStorageProvider = require('./storage.provider.mock');
const S3StorageProvider = require('./storage.provider.s3');

// Identity Providers
const MockIdentityProvider = require('./identity.provider.mock');

class ProviderFactory {
  constructor() {
    this.providers = {
      email: null,
      storage: null,
      identity: null,
    };

    this.initialized = false;
  }

  /**
   * Initialize all providers based on configuration
   */
  initialize(config = {}) {
    if (this.initialized) {
      console.log('⚠️  [PROVIDER FACTORY] Already initialized');
      return;
    }

    const env = config.env || process.env.NODE_ENV || 'development';

    // Initialize Email Provider
    this.providers.email = this.createEmailProvider(
      config.emailProvider || process.env.EMAIL_PROVIDER || 'mock'
    );

    // Initialize Storage Provider
    this.providers.storage = this.createStorageProvider(
      config.storageProvider || process.env.STORAGE_PROVIDER || 'mock'
    );

    // Initialize Identity Provider
    this.providers.identity = this.createIdentityProvider(
      config.identityProvider || process.env.IDENTITY_PROVIDER || 'mock'
    );

    this.initialized = true;

    console.log('✅ [PROVIDER FACTORY] Initialized successfully');
    console.log(`   Environment: ${env}`);
    console.log(`   Email Provider: ${this.providers.email.getProviderName()}`);
    console.log(`   Storage Provider: ${this.providers.storage.getProviderName()}`);
    console.log(`   Identity Provider: ${this.providers.identity.getProviderName()}`);
  }

  /**
   * Create Email Provider
   */
  createEmailProvider(type) {
    switch (type.toLowerCase()) {
      case 'smtp':
        return new SMTPEmailProvider();
      case 'mock':
      default:
        return new MockEmailProvider();
    }
  }

  /**
   * Create Storage Provider
   */
  createStorageProvider(type) {
    switch (type.toLowerCase()) {
      case 's3':
        return new S3StorageProvider();
      case 'mock':
      default:
        return new MockStorageProvider();
    }
  }

  /**
   * Create Identity Provider
   */
  createIdentityProvider(type) {
    switch (type.toLowerCase()) {
      case 'oauth':
      case 'saml':
        // Add real providers here when needed
        console.log(`⚠️  [PROVIDER FACTORY] ${type} not implemented, using mock`);
        return new MockIdentityProvider();
      case 'mock':
      default:
        return new MockIdentityProvider();
    }
  }

  /**
   * Get Email Provider
   */
  getEmailProvider() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.providers.email;
  }

  /**
   * Get Storage Provider
   */
  getStorageProvider() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.providers.storage;
  }

  /**
   * Get Identity Provider
   */
  getIdentityProvider() {
    if (!this.initialized) {
      this.initialize();
    }
    return this.providers.identity;
  }

  /**
   * Set Email Provider (for testing/override)
   */
  setEmailProvider(provider) {
    this.providers.email = provider;
  }

  /**
   * Set Storage Provider (for testing/override)
   */
  setStorageProvider(provider) {
    this.providers.storage = provider;
  }

  /**
   * Set Identity Provider (for testing/override)
   */
  setIdentityProvider(provider) {
    this.providers.identity = provider;
  }

  /**
   * Reset all providers (for testing)
   */
  reset() {
    this.providers = {
      email: null,
      storage: null,
      identity: null,
    };
    this.initialized = false;
  }

  /**
   * Get all provider names
   */
  getProviderNames() {
    return {
      email: this.providers.email?.getProviderName() || 'Not initialized',
      storage: this.providers.storage?.getProviderName() || 'Not initialized',
      identity: this.providers.identity?.getProviderName() || 'Not initialized',
    };
  }
}

// Singleton instance
const providerFactory = new ProviderFactory();

module.exports = providerFactory;
