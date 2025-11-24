# External API Providers - Dependency Injection

Complete guide for swappable mock services for external API calls.

## 📋 Overview

This system provides a **dependency injection pattern** for external service providers, making them easily swappable between mock and real implementations.

### Providers Available

1. **Email Provider** - Email sending (Mock / SMTP)
2. **Storage Provider** - File storage (Mock / AWS S3)
3. **Identity Provider** - External authentication (Mock / OAuth / SAML)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      Provider Factory (Singleton)       │
│         Dependency Injection            │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Email   │  │ Storage  │  │ Identity │
│ Provider │  │ Provider │  │ Provider │
└──────────┘  └──────────┘  └──────────┘
      │             │             │
   ┌──┴──┐       ┌──┴──┐       ┌──┴──┐
   │Mock │       │Mock │       │Mock │
   │SMTP │       │ S3  │       │OAuth│
   └─────┘       └─────┘       └─────┘
```

---

## 🚀 Quick Start

### 1. Initialize Providers

```javascript
const providerFactory = require('./services/providers/provider.factory');

// Initialize with default (mock) providers
providerFactory.initialize();

// Or initialize with specific providers
providerFactory.initialize({
  emailProvider: 'smtp',
  storageProvider: 's3',
  identityProvider: 'mock',
});
```

### 2. Use Providers

```javascript
// Get Email Provider
const emailProvider = providerFactory.getEmailProvider();
await emailProvider.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Welcome to Idea Box!</h1>',
});

// Get Storage Provider
const storageProvider = providerFactory.getStorageProvider();
const result = await storageProvider.uploadFile(file);

// Get Identity Provider
const identityProvider = providerFactory.getIdentityProvider();
const auth = await identityProvider.authenticate(credentials);
```

---

## 📧 Email Provider

### Interface

All email providers implement `IEmailProvider`:

```javascript
class IEmailProvider {
  async sendEmail(options)
  async verify()
  getProviderName()
}
```

### Mock Email Provider

**Features**:
- In-memory email storage
- Console logging
- Configurable delays
- Failure simulation
- Statistics tracking

**Usage**:
```javascript
const MockEmailProvider = require('./services/providers/email.provider.mock');
const emailProvider = new MockEmailProvider();

// Send email
await emailProvider.sendEmail({
  to: 'user@example.com',
  subject: 'Test Email',
  html: '<p>Hello World!</p>',
  from: 'noreply@ideabox.com',
});

// Get sent emails (testing)
const sentEmails = emailProvider.getSentEmails();

// Clear emails (testing)
emailProvider.clearSentEmails();

// Configure failure mode (testing)
emailProvider.setShouldFail(true);

// Get statistics
const stats = emailProvider.getStats();
```

### SMTP Email Provider

**Features**:
- Real email sending via SMTP
- Nodemailer integration
- Configuration via environment variables
- Connection verification

**Setup**:
```bash
npm install nodemailer
```

**Environment Variables**:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@ideabox.com
```

**Usage**:
```javascript
const SMTPEmailProvider = require('./services/providers/email.provider.smtp');
const emailProvider = new SMTPEmailProvider();

// Verify configuration
const isValid = await emailProvider.verify();

// Send email
await emailProvider.sendEmail({
  to: 'user@example.com',
  subject: 'Production Email',
  html: '<p>Real email via SMTP</p>',
});
```

---

## 📦 Storage Provider

### Interface

All storage providers implement `IStorageProvider`:

```javascript
class IStorageProvider {
  async uploadFile(file, options)
  async downloadFile(fileKey)
  async deleteFile(fileKey)
  async getFileUrl(fileKey, options)
  async fileExists(fileKey)
  getProviderName()
}
```

### Mock Storage Provider

**Features**:
- In-memory file storage
- Mock URLs generation
- Configurable delays
- Failure simulation
- Statistics tracking

**Usage**:
```javascript
const MockStorageProvider = require('./services/providers/storage.provider.mock');
const storageProvider = new MockStorageProvider();

// Upload file
const result = await storageProvider.uploadFile(file, {
  folder: 'uploads',
  metadata: { userId: 'user-123' },
});
// Returns: { success, key, url, size, mimetype }

// Download file
const buffer = await storageProvider.downloadFile(result.key);

// Get file URL
const url = await storageProvider.getFileUrl(result.key, {
  expiresIn: 3600, // 1 hour
});

// Check if file exists
const exists = await storageProvider.fileExists(result.key);

// Delete file
await storageProvider.deleteFile(result.key);

// Get all files (testing)
const files = storageProvider.getAllFiles();

// Get statistics
const stats = storageProvider.getStats();
```

### AWS S3 Storage Provider

**Features**:
- Real cloud storage via AWS S3
- Presigned URLs
- Metadata support
- AWS SDK v3

**Setup**:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Environment Variables**:
```env
STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

**Usage**:
```javascript
const S3StorageProvider = require('./services/providers/storage.provider.s3');
const storageProvider = new S3StorageProvider();

// Upload file
const result = await storageProvider.uploadFile(file, {
  folder: 'uploads',
  metadata: { userId: 'user-123' },
});

// Get presigned URL (expires in 1 hour)
const url = await storageProvider.getFileUrl(result.key, {
  expiresIn: 3600,
});

// Download file
const buffer = await storageProvider.downloadFile(result.key);

// Delete file
await storageProvider.deleteFile(result.key);
```

---

## 🔐 Identity Provider

### Interface

All identity providers implement `IIdentityProvider`:

```javascript
class IIdentityProvider {
  async authenticate(credentials)
  async verifyToken(token)
  async getUserProfile(userId)
  async refreshAccessToken(refreshToken)
  async revokeToken(token)
  getProviderName()
}
```

### Mock Identity Provider

**Features**:
- In-memory user storage
- Mock token generation
- Pre-seeded test users
- Token expiration simulation
- Statistics tracking

**Pre-seeded Users**:
```javascript
{
  email: 'user@example.com',
  password: 'any-password-6-chars+',
  role: 'USER'
}
{
  email: 'manager@example.com',
  password: 'any-password-6-chars+',
  role: 'MANAGER'
}
{
  email: 'admin@example.com',
  password: 'any-password-6-chars+',
  role: 'ADMIN'
}
```

**Usage**:
```javascript
const MockIdentityProvider = require('./services/providers/identity.provider.mock');
const identityProvider = new MockIdentityProvider();

// Authenticate user
const auth = await identityProvider.authenticate({
  email: 'user@example.com',
  password: 'password123',
});
// Returns: { user, accessToken, refreshToken, expiresIn }

// Verify token
const verification = await identityProvider.verifyToken(auth.accessToken);
// Returns: { valid, userId, email, role }

// Get user profile
const profile = await identityProvider.getUserProfile(auth.user.id);

// Refresh access token
const newTokens = await identityProvider.refreshAccessToken(auth.refreshToken);

// Revoke token
await identityProvider.revokeToken(auth.accessToken);

// Add test user (testing)
identityProvider.addTestUser({
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'User',
  role: 'USER',
});

// Get statistics
const stats = identityProvider.getStats();
```

---

## 🔧 Provider Factory (Dependency Injection)

### Configuration

**Via Environment Variables**:
```env
NODE_ENV=production
EMAIL_PROVIDER=smtp
STORAGE_PROVIDER=s3
IDENTITY_PROVIDER=mock
```

**Via Code**:
```javascript
const providerFactory = require('./services/providers/provider.factory');

providerFactory.initialize({
  env: 'production',
  emailProvider: 'smtp',
  storageProvider: 's3',
  identityProvider: 'mock',
});
```

### Usage in Application

```javascript
// In your service/controller
const providerFactory = require('./services/providers/provider.factory');

class NotificationService {
  async sendNotification(user, message) {
    const emailProvider = providerFactory.getEmailProvider();
    
    await emailProvider.sendEmail({
      to: user.email,
      subject: 'Notification',
      html: message,
    });
  }
}

class FileService {
  async uploadFile(file) {
    const storageProvider = providerFactory.getStorageProvider();
    
    const result = await storageProvider.uploadFile(file, {
      folder: 'uploads',
    });
    
    return result;
  }
}
```

### Override Providers (Testing)

```javascript
const providerFactory = require('./services/providers/provider.factory');
const MockEmailProvider = require('./services/providers/email.provider.mock');

// Override for testing
const mockEmail = new MockEmailProvider();
providerFactory.setEmailProvider(mockEmail);

// Run tests
await myService.sendEmail(...);

// Check sent emails
const sentEmails = mockEmail.getSentEmails();
expect(sentEmails).toHaveLength(1);

// Reset
providerFactory.reset();
```

---

## 🧪 Testing with Mock Providers

### Email Provider Testing

```javascript
describe('Email Service', () => {
  let emailProvider;

  beforeEach(() => {
    emailProvider = new MockEmailProvider();
    providerFactory.setEmailProvider(emailProvider);
    emailProvider.clearSentEmails();
  });

  it('should send email successfully', async () => {
    await emailService.sendWelcomeEmail(user);

    const sentEmails = emailProvider.getSentEmails();
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].to).toBe(user.email);
    expect(sentEmails[0].subject).toContain('Welcome');
  });

  it('should handle email failure', async () => {
    emailProvider.setShouldFail(true);

    await expect(
      emailService.sendWelcomeEmail(user)
    ).rejects.toThrow();
  });
});
```

### Storage Provider Testing

```javascript
describe('File Service', () => {
  let storageProvider;

  beforeEach(() => {
    storageProvider = new MockStorageProvider();
    providerFactory.setStorageProvider(storageProvider);
    storageProvider.clearAllFiles();
  });

  it('should upload file successfully', async () => {
    const result = await fileService.uploadFile(mockFile);

    expect(result.success).toBe(true);
    expect(result.key).toBeDefined();
    expect(result.url).toBeDefined();

    const files = storageProvider.getAllFiles();
    expect(files).toHaveLength(1);
  });

  it('should delete file successfully', async () => {
    const upload = await fileService.uploadFile(mockFile);
    await fileService.deleteFile(upload.key);

    const exists = await storageProvider.fileExists(upload.key);
    expect(exists).toBe(false);
  });
});
```

### Identity Provider Testing

```javascript
describe('Auth Service', () => {
  let identityProvider;

  beforeEach(() => {
    identityProvider = new MockIdentityProvider();
    providerFactory.setIdentityProvider(identityProvider);
  });

  it('should authenticate user successfully', async () => {
    const auth = await authService.login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(auth.user).toBeDefined();
    expect(auth.accessToken).toBeDefined();
    expect(auth.refreshToken).toBeDefined();
  });

  it('should verify token successfully', async () => {
    const auth = await authService.login({
      email: 'user@example.com',
      password: 'password123',
    });

    const verification = await identityProvider.verifyToken(
      auth.accessToken
    );

    expect(verification.valid).toBe(true);
    expect(verification.email).toBe('user@example.com');
  });
});
```

---

## 🔄 Switching Between Mock and Real Providers

### Development (Mock)

```env
NODE_ENV=development
EMAIL_PROVIDER=mock
STORAGE_PROVIDER=mock
IDENTITY_PROVIDER=mock
```

### Staging (Mixed)

```env
NODE_ENV=staging
EMAIL_PROVIDER=smtp
STORAGE_PROVIDER=s3
IDENTITY_PROVIDER=mock
```

### Production (Real)

```env
NODE_ENV=production
EMAIL_PROVIDER=smtp
STORAGE_PROVIDER=s3
IDENTITY_PROVIDER=oauth
```

---

## 📊 Provider Statistics

All mock providers include statistics tracking:

```javascript
// Email Provider Stats
const emailStats = emailProvider.getStats();
// {
//   totalSent: 10,
//   byRecipient: { 'user@example.com': 5 },
//   bySubject: { 'Welcome': 3 },
//   recentEmails: [...]
// }

// Storage Provider Stats
const storageStats = storageProvider.getStats();
// {
//   totalFiles: 20,
//   totalSize: 1048576,
//   byMimeType: { 'image/jpeg': 10 },
//   recentFiles: [...]
// }

// Identity Provider Stats
const identityStats = identityProvider.getStats();
// {
//   totalUsers: 3,
//   totalTokens: 5,
//   activeTokens: 3,
//   expiredTokens: 2
// }
```

---

## 🎯 Best Practices

### 1. Always Use Provider Factory

```javascript
// ✅ Good
const emailProvider = providerFactory.getEmailProvider();

// ❌ Bad
const emailProvider = new MockEmailProvider();
```

### 2. Initialize Early

```javascript
// In app.js or index.js
const providerFactory = require('./services/providers/provider.factory');
providerFactory.initialize();
```

### 3. Use Interfaces

```javascript
// Define your service to accept any provider implementing the interface
class EmailService {
  constructor(emailProvider) {
    this.emailProvider = emailProvider;
  }

  async send(options) {
    return this.emailProvider.sendEmail(options);
  }
}
```

### 4. Test with Mocks

```javascript
// Always use mock providers in tests
beforeEach(() => {
  const mockEmail = new MockEmailProvider();
  providerFactory.setEmailProvider(mockEmail);
});
```

### 5. Handle Errors Gracefully

```javascript
try {
  await emailProvider.sendEmail(options);
} catch (error) {
  console.error('Email sending failed:', error);
  // Fallback or retry logic
}
```

---

## 📚 Adding New Providers

### 1. Create Interface

```javascript
// my-provider.interface.js
class IMyProvider {
  async myMethod() {
    throw new Error('myMethod() must be implemented');
  }
  
  getProviderName() {
    throw new Error('getProviderName() must be implemented');
  }
}

module.exports = IMyProvider;
```

### 2. Create Mock Implementation

```javascript
// my-provider.mock.js
const IMyProvider = require('./my-provider.interface');

class MockMyProvider extends IMyProvider {
  async myMethod() {
    // Mock implementation
  }
  
  getProviderName() {
    return 'MockMyProvider';
  }
}

module.exports = MockMyProvider;
```

### 3. Create Real Implementation

```javascript
// my-provider.real.js
const IMyProvider = require('./my-provider.interface');

class RealMyProvider extends IMyProvider {
  async myMethod() {
    // Real implementation
  }
  
  getProviderName() {
    return 'RealMyProvider';
  }
}

module.exports = RealMyProvider;
```

### 4. Add to Factory

```javascript
// provider.factory.js
const MockMyProvider = require('./my-provider.mock');
const RealMyProvider = require('./my-provider.real');

class ProviderFactory {
  initialize(config = {}) {
    // ...
    this.providers.myProvider = this.createMyProvider(
      config.myProvider || 'mock'
    );
  }
  
  createMyProvider(type) {
    switch (type.toLowerCase()) {
      case 'real':
        return new RealMyProvider();
      case 'mock':
      default:
        return new MockMyProvider();
    }
  }
  
  getMyProvider() {
    return this.providers.myProvider;
  }
}
```

---

## ✅ Summary

✅ **3 Provider Types** (Email, Storage, Identity)
✅ **Mock Implementations** for development/testing
✅ **Real Implementations** for production
✅ **Dependency Injection** via Provider Factory
✅ **Swappable** via environment variables
✅ **Interface-based** design
✅ **Statistics Tracking** in mock providers
✅ **Testing Support** with override methods
✅ **Easy to Extend** with new providers

**Initialize providers**:
```javascript
const providerFactory = require('./services/providers/provider.factory');
providerFactory.initialize();
```

**Use providers**:
```javascript
const emailProvider = providerFactory.getEmailProvider();
const storageProvider = providerFactory.getStorageProvider();
const identityProvider = providerFactory.getIdentityProvider();
```

🎉 **Swappable providers ready!**
