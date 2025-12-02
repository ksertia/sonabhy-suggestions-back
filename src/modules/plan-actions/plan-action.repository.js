const prisma = require('../../config/database');

class PlanActionRepository {
  async create(data) {
    return prisma.planAction.create({
      data,
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
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

  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = this.buildWhereClause(filters);

    const [planActions, total] = await Promise.all([
      prisma.planAction.findMany({
        where,
        skip,
        take: limit,
        include: {
          taches:true,
          idea: {
            select: {
              id: true,
              title: true,
              status: {
                select: {
                  name: true,
                  color: true,
                },
              },
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
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
        orderBy: [
          { deadline: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.planAction.count({ where }),
    ]);

    return {
      planActions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id) {
    return prisma.planAction.findUnique({
      where: { id },
      include: {
        taches:true,
        idea: {
          include: {
            kind: true,
            category: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
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

  async findByIdeaId(ideaId) {
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

  async findByAssigneeId(assigneeId) {
    return prisma.planAction.findMany({
      where: { assignedTo: assigneeId },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async update(id, data) {
    return prisma.planAction.update({
      where: { id },
      data,
      include: {
        taches:true,
        idea: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
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

  async updateProgress(id, progress) {
    return prisma.planAction.update({
      where: { id },
      data: { progress },
      include: {
        assignee: {
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

  async assignUser(id, userId) {
    return prisma.planAction.update({
      where: { id },
      data: { assignedTo: userId },
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

  async delete(id) {
    return prisma.planAction.delete({
      where: { id },
    });
  }

  async getStatsByIdea(ideaId) {
    const actions = await prisma.planAction.findMany({
      where: { ideaId },
      select: {
        progress: true,
        deadline: true,
      },
    });

    const total = actions.length;
    const completed = actions.filter(a => a.progress === 100).length;
    const inProgress = actions.filter(a => a.progress > 0 && a.progress < 100).length;
    const notStarted = actions.filter(a => a.progress === 0).length;
    const overdue = actions.filter(a => a.deadline && new Date(a.deadline) < new Date() && a.progress < 100).length;
    const avgProgress = total > 0 ? Math.round(actions.reduce((sum, a) => sum + a.progress, 0) / total) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
      avgProgress,
    };
  }

  async getStatsByUser(userId) {
    const actions = await prisma.planAction.findMany({
      where: { assignedTo: userId },
      select: {
        progress: true,
        deadline: true,
      },
    });

    const total = actions.length;
    const completed = actions.filter(a => a.progress === 100).length;
    const inProgress = actions.filter(a => a.progress > 0 && a.progress < 100).length;
    const notStarted = actions.filter(a => a.progress === 0).length;
    const overdue = actions.filter(a => a.deadline && new Date(a.deadline) < new Date() && a.progress < 100).length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      overdue,
    };
  }

  buildWhereClause(filters) {
    const where = {};

    if (filters.ideaId) {
      where.ideaId = filters.ideaId;
    }

    if (filters.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters.progressMin !== undefined) {
      where.progress = { ...where.progress, gte: parseInt(filters.progressMin) };
    }

    if (filters.progressMax !== undefined) {
      where.progress = { ...where.progress, lte: parseInt(filters.progressMax) };
    }

    if (filters.status) {
      if (filters.status === 'completed') {
        where.progress = 100;
      } else if (filters.status === 'in_progress') {
        where.progress = { gt: 0, lt: 100 };
      } else if (filters.status === 'not_started') {
        where.progress = 0;
      }
    }

    if (filters.overdue === 'true' || filters.overdue === true) {
      where.deadline = { lt: new Date() };
      where.progress = { lt: 100 };
    }

    if (filters.deadlineStart) {
      where.deadline = { ...where.deadline, gte: new Date(filters.deadlineStart) };
    }

    if (filters.deadlineEnd) {
      where.deadline = { ...where.deadline, lte: new Date(filters.deadlineEnd) };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}

module.exports = new PlanActionRepository();
