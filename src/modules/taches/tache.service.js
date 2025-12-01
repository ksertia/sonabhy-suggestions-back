const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require('../../utils/errors');

const tacheRepository = require('./tache.repository');
const prisma = require('../../config/database');

class TacheService {
  // ---------------------------------------------------
  // CREATE ONE
  // ---------------------------------------------------
  async createTache(data, user) {
    // Only ADMIN / MANAGER can create taches
    if (user.role === 'USER') {
      throw new ForbiddenError(
        'Only managers and admins can create tasks (taches)'
      );
    }

    // Check if PlanAction exists
    const planAction = await prisma.planAction.findUnique({
      where: { id: data.planActionId },
    });

    if (!planAction) {
      throw new NotFoundError('PlanAction not found');
    }

    // Validate progress
    if (
      data.progress !== undefined &&
      (data.progress < 0 || data.progress > 100)
    ) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    // Create task
    const tache = await tacheRepository.create(data);
    return tache;
  }

  // ---------------------------------------------------
  // CREATE MULTIPLE
  // ---------------------------------------------------
  async createMultipleTaches(planActionId, taches, user) {
    if (user.role === 'USER') {
      throw new ForbiddenError(
        'Only managers and admins can create tasks (taches)'
      );
    }

    // Validate existence of PlanAction
    const exists = await prisma.planAction.findUnique({
      where: { id: planActionId },
    });

    if (!exists) {
      throw new NotFoundError('PlanAction not found');
    }

    if (!Array.isArray(taches) || taches.length === 0) {
      throw new BadRequestError('taches doit être un tableau non vide');
    }

    // Bulk create
    const result = await tacheRepository.createMany(planActionId, taches);
    return result;
  }

  // ---------------------------------------------------
  // GET ALL (with restrictions)
  // ---------------------------------------------------
  async getAllTaches(filters, pagination, user) {
    // Regular users only see tasks assigned to them
    if (user.role === 'USER') {
      filters.assigneeId = user.id;
    }

    return await tacheRepository.findAll(filters, pagination);
  }

  // ---------------------------------------------------
  // GET BY ID
  // ---------------------------------------------------
  async getTacheById(id, user) {
    const tache = await tacheRepository.findById(id);

    if (!tache) {
      throw new NotFoundError('Tache not found');
    }

    // Permission: user must be one of assignees OR admin/manager
    if (
      user.role === 'USER' &&
      !tache.assignees.some((u) => u.id === user.id)
    ) {
      throw new ForbiddenError(
        'You do not have permission to view this task'
      );
    }

    return tache;
  }

  // ---------------------------------------------------
  // GET BY PLAN ACTION
  // ---------------------------------------------------
  async getTachesByPlanAction(planActionId, user) {
    const plan = await prisma.planAction.findUnique({
      where: { planActionId },
    });

    if (!plan) {
      throw new NotFoundError('PlanAction not found');
    }

    // Users can only see if they belong to one of the taches OR assigned to planAction
    if (user.role === 'USER') {
      const hasAccess = await prisma.tache.findFirst({
        where: {
          planActionId,
          assignees: {
            some: { id: user.id },
          },
        },
      });

      if (!hasAccess) {
        throw new ForbiddenError(
          'You do not have permission to view tasks of this planAction'
        );
      }
    }

    return await tacheRepository.findByPlanActionId(planActionId);
  }

  // ---------------------------------------------------
  // UPDATE
  // ---------------------------------------------------
  async updateTache(id, data, user) {
    const tache = await tacheRepository.findById(id);

    if (!tache) {
      throw new NotFoundError('Tache not found');
    }

    // USER can ONLY update progress + description
    if (user.role === 'USER') {
      const isAssignee = tache.assignees.some((u) => u.id === user.id);
      if (!isAssignee) {
        throw new ForbiddenError('You do not have permission to update this task');
      }

      const allowed = ['progress', 'description'];
      const invalid = Object.keys(data).some((k) => !allowed.includes(k));

      if (invalid) {
        throw new ForbiddenError(
          'Users can only update progress and description'
        );
      }
    }

    // Validate progress
    if (
      data.progress !== undefined &&
      (data.progress < 0 || data.progress > 100)
    ) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    return await tacheRepository.update(id, data);
  }

  // ---------------------------------------------------
  // UPDATE PROGRESS ONLY
  // ---------------------------------------------------
  async updateProgress(id, progress, user) {
    const tache = await tacheRepository.findById(id);

    if (!tache) {
      throw new NotFoundError('Tache not found');
    }

    const isAssignee = tache.assignees.some((u) => u.id === user.id);

    if (user.role === 'USER' && !isAssignee) {
      throw new ForbiddenError(
        'You do not have permission to update this task'
      );
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    return await tacheRepository.updateProgress(id, progress);
  }

  // ---------------------------------------------------
  // ASSIGN MULTIPLE USERS
  // ---------------------------------------------------
  async assignUsers(id, userIds, user) {
    const tache = await tacheRepository.findById(id);

    if (!tache) {
      throw new NotFoundError('Tache not found');
    }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestError('userIds doit être un tableau non vide');
    }

    // Only manager/admin can assign
    if (user.role === 'USER') {
      throw new ForbiddenError(
        'Only managers and admins can assign users to tasks'
      );
    }

    // Verify all users exist
    for (const uid of userIds) {
      const exists = await prisma.user.findUnique({ where: { id: uid } });
      if (!exists) {
        throw new NotFoundError(`User not found: ${uid}`);
      }
    }

    return await tacheRepository.assignUsers(id, userIds);
  }

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------
  async deleteTache(id, user) {
    const tache = await tacheRepository.findById(id);

    if (!tache) {
      throw new NotFoundError('Tache not found');
    }

    if (user.role === 'USER') {
      throw new ForbiddenError(
        'Only managers and admins can delete tasks'
      );
    }

    return await tacheRepository.delete(id);
  }
}

module.exports = new TacheService();
