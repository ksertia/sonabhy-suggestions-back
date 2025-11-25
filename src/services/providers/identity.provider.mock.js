/**
 * Mock Identity Provider
 * Simulates external identity provider (OAuth, SAML, etc.)
 */

const IIdentityProvider = require('./identity.provider.interface');

class MockIdentityProvider extends IIdentityProvider {
  constructor() {
    super();
    this.users = new Map();
    this.tokens = new Map();
    this.shouldFail = false;
    this.delay = 100;

    // Seed with test users
    this.seedTestUsers();
  }

  /**
   * Seed test users
   */
  seedTestUsers() {
    const testUsers = [
      {
        id: 'mock-user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER',
        provider: 'mock',
      },
      {
        id: 'mock-user-2',
        email: 'manager@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'MANAGER',
        provider: 'mock',
      },
      {
        id: 'mock-user-3',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        provider: 'mock',
      },
    ];

    testUsers.forEach(user => {
      this.users.set(user.email, user);
    });
  }

  /**
   * Authenticate user (mock implementation)
   */
  async authenticate(credentials) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock identity provider: Simulated authentication failure');
    }

    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user exists
    const user = this.users.get(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Mock password validation (accept any password in mock)
    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateToken('access', user.id);
    const refreshToken = this.generateToken('refresh', user.id);

    // Store tokens
    this.tokens.set(accessToken, {
      type: 'access',
      userId: user.id,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    this.tokens.set(refreshToken, {
      type: 'refresh',
      userId: user.id,
      expiresAt: Date.now() + 604800000, // 7 days
    });

    console.log('🔐 [MOCK IDENTITY PROVIDER] User authenticated:');
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        provider: 'mock',
      },
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  /**
   * Verify access token (mock implementation)
   */
  async verifyToken(token) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock identity provider: Simulated token verification failure');
    }

    const tokenData = this.tokens.get(token);

    if (!tokenData) {
      throw new Error('Invalid token');
    }

    if (tokenData.expiresAt < Date.now()) {
      this.tokens.delete(token);
      throw new Error('Token expired');
    }

    const user = Array.from(this.users.values()).find(u => u.id === tokenData.userId);

    if (!user) {
      throw new Error('User not found');
    }

    console.log('✅ [MOCK IDENTITY PROVIDER] Token verified:');
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);

    return {
      valid: true,
      userId: user.id,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Get user profile (mock implementation)
   */
  async getUserProfile(userId) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock identity provider: Simulated get profile failure');
    }

    const user = Array.from(this.users.values()).find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    console.log('👤 [MOCK IDENTITY PROVIDER] User profile retrieved:');
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      provider: 'mock',
      emailVerified: true,
      createdAt: new Date(),
    };
  }

  /**
   * Refresh access token (mock implementation)
   */
  async refreshAccessToken(refreshToken) {
    await this.simulateDelay();

    if (this.shouldFail) {
      throw new Error('Mock identity provider: Simulated refresh failure');
    }

    const tokenData = this.tokens.get(refreshToken);

    if (!tokenData || tokenData.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    if (tokenData.expiresAt < Date.now()) {
      this.tokens.delete(refreshToken);
      throw new Error('Refresh token expired');
    }

    // Generate new access token
    const newAccessToken = this.generateToken('access', tokenData.userId);

    this.tokens.set(newAccessToken, {
      type: 'access',
      userId: tokenData.userId,
      expiresAt: Date.now() + 3600000, // 1 hour
    });

    console.log('🔄 [MOCK IDENTITY PROVIDER] Token refreshed:');
    console.log(`   User ID: ${tokenData.userId}`);

    return {
      accessToken: newAccessToken,
      expiresIn: 3600,
    };
  }

  /**
   * Revoke token (mock implementation)
   */
  async revokeToken(token) {
    await this.simulateDelay();

    const existed = this.tokens.has(token);
    this.tokens.delete(token);

    console.log('🚫 [MOCK IDENTITY PROVIDER] Token revoked:');
    console.log(`   Token existed: ${existed}`);

    return existed;
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'MockIdentityProvider';
  }

  /**
   * Generate mock token
   */
  generateToken(type, userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 16);
    return `mock_${type}_${userId}_${timestamp}_${random}`;
  }

  /**
   * Simulate network delay
   */
  async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  /**
   * Add test user (for testing)
   */
  addTestUser(user) {
    this.users.set(user.email, {
      id: user.id || `mock-user-${Date.now()}`,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'USER',
      provider: 'mock',
    });
  }

  /**
   * Remove test user (for testing)
   */
  removeTestUser(email) {
    this.users.delete(email);
  }

  /**
   * Get all users (for testing)
   */
  getAllUsers() {
    return Array.from(this.users.values());
  }

  /**
   * Get all tokens (for testing)
   */
  getAllTokens() {
    return Array.from(this.tokens.entries()).map(([token, data]) => ({
      token,
      ...data,
    }));
  }

  /**
   * Clear all tokens (for testing)
   */
  clearAllTokens() {
    this.tokens.clear();
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
   * Get statistics
   */
  getStats() {
    const activeTokens = Array.from(this.tokens.values()).filter(
      t => t.expiresAt > Date.now()
    );

    return {
      totalUsers: this.users.size,
      totalTokens: this.tokens.size,
      activeTokens: activeTokens.length,
      expiredTokens: this.tokens.size - activeTokens.length,
    };
  }
}

module.exports = MockIdentityProvider;
