const prisma = require('../../config/database');

class AuthRepository {
  async createUser(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findUserByEmail(login) {
    return prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { username: login },
          { phone: login }
        ]
      }
    });
  }

  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        comments: true,
        AssignedTaches: true,
        ideas: true,
        assignedActions: true,
        responsibleIdeas: true,
        qualifiedIdeas: true,
        approvedIdeas:true,
        _count: {
          select: {
            votes: true,
            comments: true,
            AssignedTaches: true,
            ideas: true,
            assignedActions: true,
            responsibleIdeas: true,
            qualifiedIdeas: true,
            approvedIdeas:true,
          }
        }
      }
    });
  }

  async createRefreshToken(data) {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  }

  async deleteRefreshToken(token) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

   async updateIsActive(id, data) {
      return prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          username: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

}

module.exports = new AuthRepository();
