const planActionRepository = require('./plan-action.repository');
const tacheService = require('../taches/tache.service');
const notificationService = require('../notifications/notification.service')
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');

class PlanActionService {
  async createPlanAction(data, user) {
    // Only managers and admins can create plan actions
    const taches = data.taches;
    delete data.taches;
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can create plan actions');
    }

    // Verify idea exists
    const prisma = require('../../config/database');
    const idea = await prisma.idea.findUnique({ where: { id: data.ideaId } });
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Verify assignee exists if provided
    if (data.assignedTo) {
      const assignee = await prisma.user.findUnique({ where: { id: data.assignedTo } });
      if (!assignee) {
        throw new NotFoundError('Assignee user not found');
      }
    }

    // Validate progress
    if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    const planAction = await planActionRepository.create(data);

    if (Array.isArray(taches) || taches.length !== 0) {
      await tacheService.createMultipleTaches(planAction.id, taches, user);
    }
    
    await notificationService.createNotification({
          userId: data.assignedTo,
          type:'PLAN',
          title: 'assigné à un plan d\'action',
          entityId: planAction.id,
          message: `On vous a assigné le plan d'action ${planAction.title}`,
        })

    return planAction;
  }

  async getAllPlanActions(filters, pagination, user) {
    // Regular users can only see actions assigned to them
    if (user.role === 'USER') {
      filters.assignedTo = user.id;
    }

    const result = await planActionRepository.findAll(filters, pagination);
    return result;
  }

  async getPlanActionById(id, user) {
    const planAction = await planActionRepository.findById(id);
    
    if (!planAction) {
      throw new NotFoundError('Plan action not found');
    }

    // ADMIN / MANAGER : accès total
    if (user.role !== 'USER') {
      return planAction;
    }

    // // Check permissions: assignee, or manager/admin
    // if (user.role === 'USER' && planAction.assignedTo !== user.id) {
    //   throw new ForbiddenError('You do not have permission to view this plan action');
    // }

  const isPlanActionAssignee = planAction.assignedTo === user.id;

  const userTasks = planAction.taches?.filter(
    task => task.assignedTo === user.id
  ) ?? [];

  // USER non lié du tout
  if (!isPlanActionAssignee && userTasks.length === 0) {
    throw new ForbiddenError(
      'You do not have permission to view this plan action'
    );
  }

  // USER assigné uniquement à des tâches → on filtre
  if (!isPlanActionAssignee) {
    return {
      ...planAction,
      tasks: userTasks,
    };
  }

    return planAction;
  }

  async getPlanActionsByIdea(ideaId, user) {
    const prisma = require('../../config/database');
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view plan actions for this idea');
    }

    const planActions = await planActionRepository.findByIdeaId(ideaId);
    return planActions;
  }

  async getMyPlanActions(user) {
    const planActions = await planActionRepository.findByAssigneeId(user.id);
    return planActions;
  }

  async updatePlanAction(id, data, user) {
    const taches = data.taches;
    delete data.taches;
    delete data.progress;
    const planAction = await planActionRepository.findById(id);
    
    if (!planAction) {
      throw new NotFoundError('Plan action not found');
    }

    // Check permissions
    // Assignee can update progress and description
    // Managers/Admins can update everything
    if (user.role === 'USER') {
      if (planAction.assignedTo !== user.id) {
        throw new ForbiddenError('You do not have permission to update this plan action');
      }
      // Users can only update progress and description
      const allowedFields = ['progress', 'description'];
      const updateKeys = Object.keys(data);
      const hasDisallowedFields = updateKeys.some(key => !allowedFields.includes(key));
      
      if (hasDisallowedFields) {
        throw new ForbiddenError('You can only update progress and description');
      }
    }

    // Validate progress
    if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    // Verify assignee exists if being updated
    if (data.assignedTo) {
      const prisma = require('../../config/database');
      const assignee = await prisma.user.findUnique({ where: { id: data.assignedTo } });
      if (!assignee) {
        throw new NotFoundError('Assignee user not found');
      }
    }
    
    if (Array.isArray(taches) || taches.length !== 0) {
      await tacheService.createMultipleTaches(planAction.id, taches, user);
    }

    const updated = await planActionRepository.update(id, data);

    // await tacheService.createMultipleTaches(id, taches, user);

    return updated;
  }

  async completePlanAction(id) {
  // 1) Mise à jour de la tâche
    const plan = await planActionRepository.update(id, {
      progress: 100,
      status: "COMPLETED"
    });

    await notificationService.createNotification({
      title:'Plan complete',
      type:'PLAN',
      target: 'SYSTEM',
      message: `le plan d'actions ${plan.title} est terminé`,
      entityId: plan.id,
    })
  }

  async updateProgress(id, progress, user) {
    const planAction = await planActionRepository.findById(id);
    
    if (!planAction) {
      throw new NotFoundError('Plan action not found');
    }

    // Assignee or manager/admin can update progress
    if (user.role === 'USER' && planAction.assignedTo !== user.id) {
      throw new ForbiddenError('You do not have permission to update this plan action');
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    const updated = await planActionRepository.updateProgress(id, progress);
    return updated;
  }

  async assignUser(id, userId, user) {
    // Only managers and admins can assign users
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can assign users to plan actions');
    }

    const planAction = await planActionRepository.findById(id);
    
    if (!planAction) {
      throw new NotFoundError('Plan action not found');
    }

    // Verify user exists
    const prisma = require('../../config/database');
    const assignee = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!assignee) {
      throw new NotFoundError('User not found');
    }

    const updated = await planActionRepository.assignUser(id, userId);

    await notificationService.createNotification({
          userId,
          type:'PLAN',
          title: 'assigné à un plan d\'action',
          entityId: updated.id,
          message: `on vous assigné le plan d'action ${updated.title}`,
        })
    return updated;
  }

  async deletePlanAction(id, user) {
    // Only managers and admins can delete plan actions
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can delete plan actions');
    }

    const planAction = await planActionRepository.findById(id);
    
    if (!planAction) {
      throw new NotFoundError('Plan action not found');
    }

    await planActionRepository.delete(id);
    return { message: 'Plan action deleted successfully' };
  }

  async getStatsByIdea(ideaId, user) {
    const prisma = require('../../config/database');
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view statistics for this idea');
    }

    const stats = await planActionRepository.getStatsByIdea(ideaId);
    return stats;
  }

  async getMyStats(user) {
    const stats = await planActionRepository.getStatsByUser(user.id);
    return stats;
  }

  async getOverallStats(user) {
    // Only managers and admins can view overall stats
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can view overall statistics');
    }

    const prisma = require('../../config/database');

    const [
      totalActions,
      completedActions,
      inProgressActions,
      notStartedActions,
      overdueActions,
      actionsByUser,
    ] = await Promise.all([
      prisma.planAction.count(),
      prisma.planAction.count({ where: { progress: 100 } }),
      prisma.planAction.count({ where: { progress: { gt: 0, lt: 100 } } }),
      prisma.planAction.count({ where: { progress: 0 } }),
      prisma.planAction.count({
        where: {
          deadline: { lt: new Date() },
          progress: { lt: 100 },
        },
      }),
      prisma.planAction.groupBy({
        by: ['assignedTo'],
        _count: true,
        where: { assignedTo: { not: null } },
      }),
    ]);

    return {
      total: totalActions,
      completed: completedActions,
      inProgress: inProgressActions,
      notStarted: notStartedActions,
      overdue: overdueActions,
      byUser: actionsByUser,
    };
  }
}

module.exports = new PlanActionService();
