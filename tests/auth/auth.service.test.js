/**
 * Auth Service Tests
 */

const bcrypt = require('bcryptjs');
const mockPrisma = require('../mocks/prisma.mock');

// Mock dependencies
jest.mock('../../src/config/database', () => mockPrisma);
jest.mock('bcryptjs');

const authService = require('../../src/modules/auth/auth.service');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../../src/utils/errors');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.resetMocks();
  });

  describe('register', () => {
    const registerData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstname: 'John',
      lastname: 'Doe',
      role: 'USER',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user-id',
        email: registerData.email,
        firstname: registerData.firstname,
        lastname: registerData.lastname,
        role: registerData.role,
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await authService.register(registerData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(registerData)).rejects.toThrow(BadRequestError);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed_password',
        firstname: 'John',
        lastname: 'Doe',
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login(loginData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(result.user).toBeDefined();
      expect(result.user.password).toBeUndefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error if password is incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        email: loginData.email,
        password: 'hashed_password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.refreshToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if refresh token not found', async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw error if refresh token is expired', async () => {
      const refreshToken = 'expired-token';

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        userId: 'user-id',
        expiresAt: new Date(Date.now() - 86400000), // Expired
      });

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const userId = 'user-id';
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await authService.logout(userId);

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const userId = 'user-id';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        firstname: 'John',
        lastname: 'Doe',
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.getProfile(userId);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getProfile('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });
});
