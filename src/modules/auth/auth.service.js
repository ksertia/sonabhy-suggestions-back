const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../utils/jwt');
const { UnauthorizedError, ConflictError, BadRequestError } = require('../../utils/errors');
const authRepository = require('./auth.repository');
const notificationService = require('../notifications/notification.service')

class AuthService {
  async register(data) {
    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await authRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    const message = `Un nouveau utilisateur a créé son compte du nom de ${user.lastName} ${user.firstName}`
    await notificationService.createNotification({
      message,
      entityId: user.id,
      type: 'USER',
      title: 'creation d\'un utilisateur',
      target: 'SYSTEM'
    })

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(login, password) {
    // Find user
    const user = await authRepository.findUserByEmail(login);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    await authRepository.createRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find refresh token in database
    const storedToken = await authRepository.findRefreshToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      await authRepository.deleteRefreshToken(refreshToken);
      throw new UnauthorizedError('Refresh token expired');
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      role: storedToken.user.role,
    });

    return {
      accessToken,
      user: storedToken.user,
    };
  }

  async logout(refreshToken) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    try {
      await authRepository.deleteRefreshToken(refreshToken);
    } catch (error) {
      // Token might not exist, but that's okay for logout
      if (error.code !== 'P2025') {
        throw error;
      }
    }

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user;
  }

  async activeUser(id) {
    const user = await authRepository.updateIsActive(id);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const message = 'Votre compte a été active avec succes';

    await notificationService.createNotification({
      message,
      userId: user.id,
      title: 'Activation de compte',
      type: 'USER',
      // target: 'USER'
    });

    return 'active avec sucess'
  }
}

module.exports = new AuthService();
