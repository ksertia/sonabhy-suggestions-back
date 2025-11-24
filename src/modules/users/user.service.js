const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const { NotFoundError, ForbiddenError, ConflictError } = require('../../utils/errors');

class UserService {
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const { users, total } = await userRepository.findAll(skip, limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUser(id, data, requestingUser) {
    // Check if user exists
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Only allow users to update their own profile unless they're an admin
    if (requestingUser.id !== id && requestingUser.role !== 'ADMIN') {
      throw new ForbiddenError('You can only update your own profile');
    }

    // Only admins can change roles
    if (data.role && requestingUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can change user roles');
    }

    // If email is being changed, check if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }

    // Hash password if it's being updated
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return userRepository.update(id, data);
  }

  async deleteUser(id, requestingUser) {
    // Check if user exists
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Only admins can delete users
    if (requestingUser.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete users');
    }

    // Prevent self-deletion
    if (requestingUser.id === id) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    await userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();
