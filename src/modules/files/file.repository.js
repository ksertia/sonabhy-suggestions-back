const prisma = require('../../config/database');

class FileRepository {
  async create(data) {
    return prisma.fileMetadata.create({
      data,
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [files, total] = await Promise.all([
      prisma.fileMetadata.findMany({
        where,
        skip,
        take: limit,
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
              role: true,
            },
          },
          idea: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.fileMetadata.count({ where }),
    ]);

    return {
      files,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return prisma.fileMetadata.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
        idea: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  async findByIdeaId(ideaId) {
    return prisma.fileMetadata.findMany({
      where: {
        idea: {
          id: ideaId,
        },
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserId(userId) {
    return prisma.fileMetadata.findMany({
      where: { uploadedById: userId },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async delete(id) {
    return prisma.fileMetadata.delete({
      where: { id },
    });
  }

  async getStats(userId = null) {
    const where = userId ? { uploadedById: userId } : {};

    const [total, byMimeType, totalSize] = await Promise.all([
      prisma.fileMetadata.count({ where }),
      prisma.fileMetadata.groupBy({
        by: ['mimeType'],
        where,
        _count: true,
      }),
      prisma.fileMetadata.aggregate({
        where,
        _sum: {
          size: true,
        },
      }),
    ]);

    return {
      total,
      byMimeType,
      totalSize: totalSize._sum.size || 0,
    };
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.uploadedById) {
      where.uploadedById = filters.uploadedById;
    }

    if (filters.mimeType) {
      where.mimeType = { contains: filters.mimeType };
    }

    if (filters.search) {
      where.OR = [
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { storageName: { contains: filters.search, mode: 'insensitive' } },
      ];
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

module.exports = new FileRepository();
