const prisma = require('../../config/database');

class ClassificationRepository {
  // ============================================
  // Categories OPERATIONS
  // ============================================

  async createCategory(data) {
    return prisma.category.create({
      data,
      include: {
        variants: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async findAllCategories(filters = {}) {
    const where = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.category.findMany({
      where,
      include: {
        variants: {
          include: {
            _count: {
              select: {
                fields: true,
                ideas: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findCategoryById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
            _count: {
              select: {
                ideas: true,
              },
            },
          },
        },
      },
    });
  }

  async updateCategory(id, data) {
    return prisma.category.update({
      where: { id },
      data,
      include: {
        variants: true,
      },
    });
  }

  async deleteCategory(id) {
    return prisma.category.delete({
      where: { id },
    });
  }

  // ============================================
  // Statuses OPERATIONS
  // ============================================

  async createStatus(data) {
    return prisma.status.create({
      data,
      include: {
        variants: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async findAllStatuses(filters = {}) {
    const where = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { order: { contains: filters.search, mode: 'insensitive' } },
        { color: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.status.findMany({
      where,
      include: {
        variants: {
          include: {
            _count: {
              select: {
                fields: true,
                ideas: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findStatusById(id) {
    return prisma.status.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
            _count: {
              select: {
                ideas: true,
              },
            },
          },
        },
      },
    });
  }

  async updateStatus(id, data) {
    return prisma.status.update({
      where: { id },
      data,
      include: {
        variants: true,
      },
    });
  }

  async deleteStatus(id) {
    return prisma.status.delete({
      where: { id },
    });
  }


}

module.exports = new ClassificationRepository();
