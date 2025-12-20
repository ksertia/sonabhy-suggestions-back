const prisma = require('../../config/database');

class NotificationRepository {
  async create(data) {
    return prisma.notification.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId, filters = {}, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // const where = {
    //   userId,
    //   ...this.buildWhereClause(filters),
    // };

    const where = {
      OR: [
        { userId },
        this.buildWhereClause(filters),
      ],
    };

    console.log(where)
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return prisma.notification.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async markAsRead(id) {
    return prisma.notification.update({
      where: { id },
      data: {
        read: true,
      },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  async getUnreadCount(where) {
    return prisma.notification.count({
      where
    });
  }

  async delete(id) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAll(userId) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.read !== undefined) {
      where.read = filters.read === 'true' || filters.read === true;
    }

    if (filters.role !== 'USER') {
      where.target = 'SYSTEM';
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
    }

    return where;
  }
}

module.exports = new NotificationRepository();
