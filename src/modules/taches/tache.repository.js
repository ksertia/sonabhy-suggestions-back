const prisma = require('../../config/database');

class TacheRepository {

  // ---------------------------------------------------
  // CREATE a single TACHE
  // ---------------------------------------------------
  async create(data) {
    return prisma.tache.create({
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

  async findPlanAction(id) {
    return await prisma.planAction.findUnique({
      where: { id },
    });
  }

  // ---------------------------------------------------
  // CREATE MULTIPLE TACHES (bulk)
  // ---------------------------------------------------
  async createMany(planActionId, taches = []) {
    if (!Array.isArray(taches) || taches.length === 0)
      throw new Error("taches doit être un tableau non vide");

    return prisma.tache.createMany({
      data: taches.map(t => ({
        ...t,
        planActionId,
      })),
    });
  }

  // ---------------------------------------------------
  // FIND ALL
  // ---------------------------------------------------
  async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(filters);

    const [taches, total] = await Promise.all([
      prisma.tache.findMany({
        where,
        skip,
        take: limit,
        include: {
          planAction: {
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
        orderBy: [
          { deadline: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.tache.count({ where }),
    ]);

    return {
      taches,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------------------------------
  // FIND BY ID
  // ---------------------------------------------------
  async findById(id) {
    return prisma.tache.findUnique({
      where: { id },
      include: {
        planAction: {
          include: {
            idea: true,
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
        comments: true,
      },
    });
  }

  // ---------------------------------------------------
  // FIND BY PLAN ACTION
  // ---------------------------------------------------
  async findByPlanActionId(planActionId) {
    return prisma.tache.findMany({
      where: { planActionId },
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
      orderBy: [
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // ---------------------------------------------------
  // UPDATE
  // ---------------------------------------------------
  async update(id, data) {
    return prisma.tache.update({
      where: { id },
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

  // ---------------------------------------------------
  // UPDATE PROGRESS
  // ---------------------------------------------------
  async updateProgress(id, progress) {
    return prisma.tache.update({
      where: { id },
      data: { progress },
      include: {
        assignees: true,
      },
    });
  }

  // ---------------------------------------------------
  // ASSIGN MULTIPLE USERS
  // ---------------------------------------------------
  async assignUsers(id, userIds = []) {
    if (!Array.isArray(userIds) || userIds.length === 0)
      throw new Error("userIds doit être un tableau non vide");

    return prisma.tache.update({
      where: { id },
      data: {
        assignee: {
          connect: userIds.map(uid => ({ id: uid })),
        },
      },
      include: {
        assignee: true,
      },
    });
  }

  // ---------------------------------------------------
  // REMOVE ASSIGNMENT OF USERS
  // ---------------------------------------------------
  async unassignUsers(id, userIds = []) {
    return prisma.tache.update({
      where: { id },
      data: {
        assignee: {
          disconnect: userIds.map(uid => ({ id: uid })),
        },
      },
      include: { assignee: true },
    });
  }

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------
  async delete(id) {
    return prisma.tache.delete({
      where: { id },
    });
  }

  // ---------------------------------------------------
  // INTERNAL: Build Filters
  // ---------------------------------------------------
  buildWhere(filters) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.planActionId) {
      where.planActionId = filters.planActionId;
    }
    if (filters.assigneeId) {
      // Many-to-Many filter
      where.assignee = {
        some: { id: filters.assigneeId },
      };
    }

    return where;
  }
}

export default new TacheRepository();
