const { NotFoundError, ForbiddenError, BadRequestError, } = require('../../utils/errors');
const tacheRepository = require('./tache.repository');
const notificationService = require('../notifications/notification.service');
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
    const planAction = tacheRepository.findPlanAction(data.planActionId);

    if (!planAction) {
      throw new NotFoundError('PlanAction not found');
    }

    // Validate progress
    if ( data.progress !== undefined && (data.progress < 0 || data.progress > 100) ) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    // Create task
    const tache = await tacheRepository.create(data);

    await notificationService.createNotification({
      userId: data.assignee,
      title: 'tache assigne',
      type: 'TACHE',
      entityId: tache.id,
      message: `une tache a été créé et vous est assigné du nom de ${tache.title}`
    })

    await this.updatePlanActionProgress(data.planActionId);

    return tache;
  }

  // ---------------------------------------------------
  // CREATE MULTIPLE
  // ---------------------------------------------------
  async createMultipleTaches(planActionId, taches, user) {
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can create tasks (taches)');
    }

    // Validate existence of PlanAction
   const exists = await tacheRepository.findPlanAction(planActionId);
      if (!exists) {
        throw new NotFoundError('PlanAction not found');
      }

      const result = await tacheRepository.createMany(planActionId, taches);

      if (!Array.isArray(result)) {
        throw new Error('createMany must return an array of created tasks');
      }

      await Promise.all(
        result
          .filter(t => t.assignedTo)
          .map(t =>
            notificationService.createNotification({
              userId: t.assignedTo,
              title: 'Tâche assignée',
              type: 'TACHE',
              entityId: t.id,
              message: `Une tâche "${t.title}" vous a été assignée`
            })
          )
      );


    await this.updatePlanActionProgress(planActionId);

    return result;
  }

  async updateMultipleTaches(planActionId, taches, user) {
  if (user.role === 'USER') {
    throw new ForbiddenError('Only managers and admins can update tasks (taches)');
  }

  // Vérifier si le planAction existe
  const exists = await tacheRepository.findPlanAction(planActionId);
  if (!exists) {
    throw new NotFoundError('PlanAction not found');
  }

  // Vérification du tableau
  if (!Array.isArray(taches) || taches.length === 0) {
    throw new BadRequestError('taches doit être un tableau non vide');
  }

  // Chaque tâche doit impérativement avoir un ID
  if (taches.some(t => !t.id)) {
    throw new BadRequestError('Chaque tache doit contenir un id pour être mise à jour');
  }

  const updated = await tacheRepository.updateMany(planActionId, taches);

  await this.updatePlanActionProgress(planActionId);

  return updated;
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
    if ( user.role === 'USER' && !tache.assignee === user.id ) {
      throw new ForbiddenError('You do not have permission to view this task');
    }
    return tache;
  }

  // ---------------------------------------------------
  // GET BY PLAN ACTION
  // ---------------------------------------------------
  async getTachesByPlanAction(planActionId, user) {
    const plan = await tacheRepository.findByPlanActionId(planActionId);

    if (!plan) {
      throw new NotFoundError('PlanAction not found');
    }

    // Users can only see if they belong to one of the taches OR assigned to planAction
    // if (user.role === 'USER') {
    //   const hasAccess = await prisma.tache.findFirst({
    //     where: {
    //       planActionId,
    //       assignee: {
    //         some: { id: user.id },
    //       },
    //     },
    //   });

    //   if (!hasAccess) {
    //     throw new ForbiddenError(
    //       'You do not have permission to view tasks of this planAction'
    //     );
    //   }
    // }

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
      const isAssignee = tache.assignee.id === user.id;
      if (!isAssignee) {
        throw new ForbiddenError('You do not have permission to update this task');
      }

      const allowed = ['progress', 'description'];
      const invalid = Object.keys(data).some((k) => !allowed.includes(k));

      if (invalid) {
        throw new ForbiddenError('Users can only update progress and description');
      }
    }

    // Validate progress
    if ( data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    return await tacheRepository.update(id, data);
  }

  async changeStatus(id, status, user) {
    const tache = await tacheRepository.findById(id);
    if (!tache) {
      throw new NotFoundError('Tache not found');
    }

    if (user.role === 'USER') {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    await notificationService.createNotification({
      // userId: data.assignee,
      title: 'tache status',
      type: 'TACHE',
      entityId: tache.id,
      message: `la tache ${tache.title} change de status ${tache.status} à ${status}`,
      target: 'SYSTEM'
    })

    return await tacheRepository.changeStatus(id, status);
  }

  async completeTache(id) {
    // 1) Mise à jour de la tâche
    const tache = await tacheRepository.update(id, {
      progress: 100,
      status: "COMPLETED"
    });

    await notificationService.createNotification({
      // userId: data.assignee,
      title: 'tache complete',
      type: 'TACHE',
      entityId: tache.id,
      message: `la tache ${tache.title} est terminée`,
      target: 'SYSTEM'
    })

    // 2) Recalcul automatique
    await this.updatePlanActionProgress(tache.planActionId);

    return tache;
  }

  async updatePlanActionProgress(planActionId) {
    const taches = await tacheRepository.findProgressByPlanActionId(planActionId);

    const average = taches.length
      ? Math.round(taches.reduce((a, t) => a + t.progress, 0) / taches.length)
      : 0;

    await tacheRepository.updatePlanAction(planActionId, {
      progress: average
    });
  }

  // ---------------------------------------------------
  // UPDATE PROGRESS ONLY
  // ---------------------------------------------------
  async updateProgress(id, progress, user) {
    // const tache = await tacheRepository.findById(id);
    // console.log(tache)
    // if (!tache) {
    //   throw new NotFoundError('Tache not found');
    // }

    // const isAssignee = tache.assignee.id ? tache.assignee.id === user.id : false;

    if (user.role === 'USER') { 
      throw new ForbiddenError('You do not have permission to update this task');
    }

    // Validate progress
    if (progress < 0 || progress > 100) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    return await tacheRepository.updateProgress(id, progress);
  }


  async addComment(tacheId, content, user) {
      const tache = await tacheRepository.findById(tacheId);
      
      if (!tache) {
        throw new NotFoundError('Idea not found');
      }
  
      // Check permissions
      // if (user.role === 'USER' && idea.userId !== user.id) {
      //   throw new ForbiddenError('You do not have permission to comment on this idea');
      // }
  
      const comment = await tacheRepository.createComment({
        tacheId,
        userId: user.id,
        content,
      });
  
      return comment;
    }
  
    async getComments(tacheId, user) {
      console
      const tache = await tacheRepository.findById(tacheId);
      
      if (!tache) {
        throw new NotFoundError('tache not found');
      }
  
      // Check permissions
      if (user.role === 'USER' && tache.userId !== user.id) {
        throw new ForbiddenError('You do not have permission to view comments on this tache');
      }
  
      const comments = await tacheRepository.findCommentsByTacheId(tacheId);
      return comments;
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

    await tacheRepository.delete(id);
    return { message: 'Tache deleted successfully' };
  }

  async assignUser(id, userId, user) {
      // Only managers and admins can assign users
      if (user.role === 'USER') {
        throw new ForbiddenError('Only managers and admins can assign users to taches');
      }
  
      const tache = await tacheRepository.findById(id);
      
      if (!tache) {
        throw new NotFoundError('Tache not found');
      }
  
      // Verify user exists
      const prisma = require('../../config/database');
      const assignee = await prisma.user.findUnique({ where: { id: userId } });
      
      if (!assignee) {
        throw new NotFoundError('User not found');
      }
  
      const updated = await tacheRepository.assignUser(id, userId);
      return updated;
    }
}

module.exports = new TacheService();
