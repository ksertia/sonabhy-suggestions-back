const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

class DashboardController {
  async getOverviewStats(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        categoryId: req.query.categoryId,
        statusId: req.query.statusId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const stats = await dashboardService.getOverviewStats(req.user, filters);
      successResponse(res, { stats }, 'Overview statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrends(req, res, next) {
    try {
      const months = parseInt(req.query.months) || 12;
      const filters = {
        userId: req.query.userId,
        categoryId: req.query.categoryId,
        statusId: req.query.statusId,
      };

      const trends = await dashboardService.getMonthlyTrends(req.user, months, filters);
      successResponse(res, { trends }, 'Monthly trends retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTopCategories(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const categories = await dashboardService.getTopCategories(req.user, limit, filters);
      successResponse(res, { categories }, 'Top categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatusDistribution(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        categoryId: req.query.categoryId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const distribution = await dashboardService.getStatusDistribution(req.user, filters);
      successResponse(res, { distribution }, 'Status distribution retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPlanActionsProgress(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        ideaId: req.query.ideaId,
      };

      const progress = await dashboardService.getPlanActionsProgress(req.user, filters);
      successResponse(res, { progress }, 'Plan actions progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getIdeasTransformedPercentage(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        categoryId: req.query.categoryId,
        statusId: req.query.statusId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const result = await dashboardService.getIdeasTransformedPercentage(req.user, filters);
      successResponse(res, result, 'Ideas transformation percentage retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRecentIdeas(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const filters = {
        userId: req.query.userId,
        categoryId: req.query.categoryId,
        statusId: req.query.statusId,
      };

      const ideas = await dashboardService.getRecentIdeas(req.user, limit, filters);
      successResponse(res, { ideas }, 'Recent ideas retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getUserDashboard(req.user);
      successResponse(res, { dashboard }, 'User dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAdminDashboard(req, res, next) {
    try {
      const dashboard = await dashboardService.getAdminDashboard(req.user);
      successResponse(res, { dashboard }, 'Admin dashboard retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
