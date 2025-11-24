const planActionService = require('./plan-action.service');
const { successResponse } = require('../../utils/response');

class PlanActionController {
  async createPlanAction(req, res, next) {
    try {
      const planAction = await planActionService.createPlanAction(req.body, req.user);
      successResponse(res, { planAction }, 'Plan action created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllPlanActions(req, res, next) {
    try {
      const filters = {
        ideaId: req.query.ideaId,
        assignedTo: req.query.assignedTo,
        progressMin: req.query.progressMin,
        progressMax: req.query.progressMax,
        status: req.query.status,
        overdue: req.query.overdue,
        deadlineStart: req.query.deadlineStart,
        deadlineEnd: req.query.deadlineEnd,
        search: req.query.search,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await planActionService.getAllPlanActions(filters, pagination, req.user);
      successResponse(res, result, 'Plan actions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPlanActionById(req, res, next) {
    try {
      const planAction = await planActionService.getPlanActionById(req.params.id, req.user);
      successResponse(res, { planAction }, 'Plan action retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPlanActionsByIdea(req, res, next) {
    try {
      const planActions = await planActionService.getPlanActionsByIdea(req.params.ideaId, req.user);
      successResponse(res, { planActions }, 'Plan actions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyPlanActions(req, res, next) {
    try {
      const planActions = await planActionService.getMyPlanActions(req.user);
      successResponse(res, { planActions }, 'Your plan actions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updatePlanAction(req, res, next) {
    try {
      const planAction = await planActionService.updatePlanAction(req.params.id, req.body, req.user);
      successResponse(res, { planAction }, 'Plan action updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProgress(req, res, next) {
    try {
      const planAction = await planActionService.updateProgress(req.params.id, req.body.progress, req.user);
      successResponse(res, { planAction }, 'Progress updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async assignUser(req, res, next) {
    try {
      const planAction = await planActionService.assignUser(req.params.id, req.body.userId, req.user);
      successResponse(res, { planAction }, 'User assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  async deletePlanAction(req, res, next) {
    try {
      const result = await planActionService.deletePlanAction(req.params.id, req.user);
      successResponse(res, result, 'Plan action deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatsByIdea(req, res, next) {
    try {
      const stats = await planActionService.getStatsByIdea(req.params.ideaId, req.user);
      successResponse(res, { stats }, 'Statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyStats(req, res, next) {
    try {
      const stats = await planActionService.getMyStats(req.user);
      successResponse(res, { stats }, 'Your statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getOverallStats(req, res, next) {
    try {
      const stats = await planActionService.getOverallStats(req.user);
      successResponse(res, { stats }, 'Overall statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlanActionController();
