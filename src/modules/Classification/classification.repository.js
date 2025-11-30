const prisma = require('../../config/database');

class ClassificationRepository {
  // ============================================
  // Categories OPERATIONS
  // ============================================

  async createCategory(data) {
    return prisma.category.create({
      data
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
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findCategoryById(id) {
    return prisma.category.findUnique({
      where: { id },
    });
  }

  async updateCategory(id, data) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id) {
    return prisma.category.delete({
      where: { id },
    });
  }

  // ============================================
  // Kinds OPERATIONS
  // ============================================

  async createKind(data) {
    return prisma.kind.create({
      data,
    });
  }

  async findAllKinds(filters = {}) {
    const where = {};

    // if (filters.search) {
    //   where.OR = [
    //     { name: { contains: filters.search, mode: 'insensitive' } },
    //     { description: { contains: filters.search, mode: 'insensitive' } },
    //     { order: { contains: filters.search, mode: 'insensitive' } },
    //     { color: { contains: filters.search, mode: 'insensitive' } },
    //   ];
    // }

    return prisma.kind.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findKindById(id) {
    return prisma.kind.findUnique({
      where: { id },
    });
  }

  async updateKind(id, data) {
    return prisma.kind.update({
      where: { id },
      data,
    });
  }

  async deleteKind(id) {
    return prisma.kind.delete({
      where: { id },
    });
  }


}

module.exports = new ClassificationRepository();
