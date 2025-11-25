const prisma = require('../../config/database');

class DashboardRepository {
  // Get total ideas count
  async getTotalIdeas(filters = {}) {
    const where = this.buildWhereClause(filters);
    return prisma.idea.count({ where });
  }

  // Get ideas by category
  async getIdeasByCategory(filters = {}) {
    const where = this.buildWhereClause(filters);
    
    return prisma.idea.groupBy({
      by: ['categoryId'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });
  }

  // Get ideas by status
  async getIdeasByStatus(filters = {}) {
    const where = this.buildWhereClause(filters);
    
    return prisma.idea.groupBy({
      by: ['statusId'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });
  }

  // Get monthly trends (last 12 months)
  async getMonthlyTrends(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const ideas = await prisma.idea.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
      },
    });

    return ideas;
  }

  // Get top categories with idea count
  async getTopCategories(limit = 10, filters = {}) {
    const where = this.buildWhereClause(filters);

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        _count: {
          select: {
            ideas: {
              where: where,
            },
          },
        },
      },
      orderBy: {
        ideas: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return categories;
  }

  // Get ideas with plan actions (transformed into actions)
  async getIdeasWithActions(filters = {}) {
    const where = this.buildWhereClause(filters);

    const [totalIdeas, ideasWithActions] = await Promise.all([
      prisma.idea.count({ where }),
      prisma.idea.count({
        where: {
          ...where,
          planActions: {
            some: {},
          },
        },
      }),
    ]);

    return {
      totalIdeas,
      ideasWithActions,
      percentage: totalIdeas > 0 ? Math.round((ideasWithActions / totalIdeas) * 100) : 0,
    };
  }

  // Get plan actions progress summary
  async getPlanActionsProgress(filters = {}) {
    const where = {};
    
    if (filters.userId) {
      where.assignedTo = filters.userId;
    }

    if (filters.ideaId) {
      where.ideaId = filters.ideaId;
    }

    const [total, completed, inProgress, notStarted, overdue, avgProgress] = await Promise.all([
      prisma.planAction.count({ where }),
      prisma.planAction.count({
        where: {
          ...where,
          progress: 100,
        },
      }),
      prisma.planAction.count({
        where: {
          ...where,
          progress: {
            gt: 0,
            lt: 100,
          },
        },
      }),
      prisma.planAction.count({
        where: {
          ...where,
          progress: 0,
        },
      }),
      prisma.planAction.count({
        where: {
          ...where,
          deadline: {
            lt: new Date(),
          },
          progress: {
            lt: 100,
          },
        },
      }),
      prisma.planAction.aggregate({
        where,
        _avg: {
          progress: true,
        },
      }),
    ]);

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      avgProgress: Math.round(avgProgress._avg.progress || 0),
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  // Get recent ideas
  async getRecentIdeas(limit = 5, filters = {}) {
    const where = this.buildWhereClause(filters);

    return prisma.idea.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            username: true,
            phone: true,
          },
        },
        category: {
          select: {
            name: true,
            color: true,
          },
        },
        status: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    });
  }

  // Get user statistics
  async getUserStats(userId) {
    const [ideasCreated, ideasAssigned, actionsAssigned, commentsCount] = await Promise.all([
      prisma.idea.count({
        where: { userId },
      }),
      prisma.planAction.count({
        where: { assignedTo: userId },
      }),
      prisma.planAction.count({
        where: {
          assignedTo: userId,
          progress: 100,
        },
      }),
      prisma.comment.count({
        where: { userId },
      }),
    ]);

    return {
      ideasCreated,
      actionsAssigned: ideasAssigned,
      actionsCompleted: actionsAssigned,
      commentsCount,
    };
  }

  // Get status distribution with details
  async getStatusDistribution(filters = {}) {
    const where = this.buildWhereClause(filters);

    const statuses = await prisma.status.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            ideas: {
              where: where,
            },
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    const total = statuses.reduce((sum, status) => sum + status._count.ideas, 0);

    return statuses.map(status => ({
      id: status.id,
      name: status.name,
      color: status.color,
      count: status._count.ideas,
      percentage: total > 0 ? Math.round((status._count.ideas / total) * 100) : 0,
    }));
  }

  // Get overall system statistics
  async getOverallStats() {
    const [
      totalUsers,
      totalIdeas,
      totalCategories,
      totalStatuses,
      totalPlanActions,
      totalComments,
      totalFiles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.idea.count(),
      prisma.category.count(),
      prisma.status.count(),
      prisma.planAction.count(),
      prisma.comment.count(),
      prisma.fileMetadata.count(),
    ]);

    return {
      totalUsers,
      totalIdeas,
      totalCategories,
      totalStatuses,
      totalPlanActions,
      totalComments,
      totalFiles,
    };
  }

  // Get ideas by user role
  async getIdeasByUserRole() {
    const users = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const ideasByRole = await Promise.all(
      users.map(async (user) => {
        const count = await prisma.idea.count({
          where: {
            user: {
              role: user.role,
            },
          },
        });

        return {
          role: user.role,
          userCount: user._count.id,
          ideaCount: count,
        };
      })
    );

    return ideasByRole;
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.statusId) {
      where.statusId = filters.statusId;
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

module.exports = new DashboardRepository();
