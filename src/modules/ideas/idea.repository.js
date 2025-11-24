const prisma = require('../../config/database');

class IdeaRepository {
  async create(data) {
    return prisma.idea.create({
      data,
      include: {
        category: true,
        status: true,
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
        formVariant: {
          include: {
            model: true,
          },
        },
        metadata: true,
      },
    });
  }

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          status: true,
          user: {
            select: {
              id: true,
              email: true,
              firstname: true,
              lastname: true,
              role: true,
            },
          },
          formVariant: {
            include: {
              model: true,
            },
          },
          metadata: true,
          _count: {
            select: {
              planActions: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.idea.count({ where }),
    ]);

    return {
      ideas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return prisma.idea.findUnique({
      where: { id },
      include: {
        category: true,
        status: true,
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
        formVariant: {
          include: {
            model: true,
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        metadata: true,
        planActions: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.idea.update({
      where: { id },
      data,
      include: {
        category: true,
        status: true,
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
        formVariant: true,
        metadata: true,
      },
    });
  }

  async delete(id) {
    return prisma.idea.delete({
      where: { id },
    });
  }

  async updateStatus(id, statusId) {
    return prisma.idea.update({
      where: { id },
      data: { statusId },
      include: {
        status: true,
      },
    });
  }

  async attachFile(id, metadataId) {
    return prisma.idea.update({
      where: { id },
      data: { metadataId },
      include: {
        metadata: true,
      },
    });
  }

  async createComment(data) {
    return prisma.comment.create({
      data,
      include: {
        user: {
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

  async createPlanAction(data) {
    return prisma.planAction.create({
      data,
      include: {
        assignee: {
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

  async findCommentsByIdeaId(ideaId) {
    return prisma.comment.findMany({
      where: { ideaId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findPlanActionsByIdeaId(ideaId) {
    return prisma.planAction.findMany({
      where: { ideaId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.statusId) {
      where.statusId = filters.statusId;
    }

    if (filters.urgency) {
      where.urgency = filters.urgency;
    }

    if (filters.impact) {
      where.impact = filters.impact;
    }

    if (filters.formVariantId) {
      where.formVariantId = filters.formVariantId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.isAnonymous !== undefined) {
      where.isAnonymous = filters.isAnonymous === 'true' || filters.isAnonymous === true;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    return where;
  }
}

module.exports = new IdeaRepository();
