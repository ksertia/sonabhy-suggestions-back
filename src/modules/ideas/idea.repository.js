const prisma = require('../../config/database');

class IdeaRepository {
  async create(data) {
    return prisma.idea.create({
      data,
      include: {
          category: true,
          kind:true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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
          category:true,
          kind:true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
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
              votes:true
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
        kind:true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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
        responsibleUsers: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        },

        planActions: {
          include: {
            assignee: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
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
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
            select: {
              planActions: true,
              comments: true,
              votes:true
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
        kind: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
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

  async updateStatus(id, status) {
    return prisma.idea.update({
      where: { id },
      data: { status },
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
            firstName: true,
            lastName: true,
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
            firstName: true,
            lastName: true,
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
            firstName: true,
            lastName: true,
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
            firstName: true,
            lastName: true,
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

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.forVote) {
      where.forVote = filters.forVote;
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
        { title: { contains: filters.search, sensitivity: 'insensitive' } },
        { description: { contains: filters.search, sensitivity: 'insensitive' } },
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

  async likeIdea (userId, ideaId){
      return await prisma.vote.create({
        data: {
          value: 1,
          userId,
          ideaId,
        }
    });
  }

  async updateLike(userId, ideaId) {
    return await prisma.vote.update({
      where: { userId_ideaId: { userId, ideaId } },
      data: { value: -1 },
    });
  }

  async countLike(ideaId) {
    const score = await prisma.vote.aggregate({
      where: { ideaId },
      _sum: { value: true },
    });
    return score
  }

  async responsibilizeUser(ideaId, userIds) {
    return await prisma.idea.update({
      where: {id: ideaId},
      data: {
        responsibleUsers: {
          connect: userIds.map(id => ({ id }))
        }
      },
      include:{
        responsibleUsers:true
      }
    })
  }
}

module.exports = new IdeaRepository();
