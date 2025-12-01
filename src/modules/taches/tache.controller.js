const tacheService = require('./tache.service');
const { successResponse } = require('../../utils/response');

class TacheController {
  // ---------------------------------------------------
  // CREATE ONE TACHE
  // ---------------------------------------------------
  async createTache(req, res, next) {
    try {
      const tache = await tacheService.createTache(req.body, req.user);
      successResponse(res, { tache }, 'Tache created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // CREATE MULTIPLE TACHES
  // ---------------------------------------------------
  async createMultipleTaches(req, res, next) {
    try {
      const { planActionId } = req.params;
      const { taches } = req.body;

      const created = await tacheService.createMultipleTaches(
        planActionId,
        taches,
        req.user
      );

      successResponse(
        res,
        { created },
        'Taches created successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // LIST ALL TACHES (with filters)
  // ---------------------------------------------------
  async getAllTaches(req, res, next) {
    try {
      const filters = {
        planActionId: req.query.planActionId,
        status: req.query.status,
        progressMin: req.query.progressMin,
        progressMax: req.query.progressMax,
        deadlineStart: req.query.deadlineStart,
        deadlineEnd: req.query.deadlineEnd,
        search: req.query.search,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await tacheService.getAllTaches(
        filters,
        pagination,
        req.user
      );

      successResponse(res, result, 'Taches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // GET ONE BY ID
  // ---------------------------------------------------
  async getTacheById(req, res, next) {
    try {
      const tache = await tacheService.getTacheById(
        req.params.id,
        req.user
      );

      successResponse(res, { tache }, 'Tache retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // GET BY PLAN ACTION
  // ---------------------------------------------------
  async getTachesByPlanAction(req, res, next) {
    try {
      const taches = await tacheService.getTachesByPlanAction(
        req.params.planActionId,
        req.user
      );

      successResponse(res, { taches }, 'Taches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // GET MY TACHES (assignee)
  // ---------------------------------------------------
  async getMyTaches(req, res, next) {
    try {
      const taches = await tacheService.getMyTaches(req.user);
      successResponse(res, { taches }, 'Your taches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // UPDATE TACHE
  // ---------------------------------------------------
  async updateTache(req, res, next) {
    try {
      const updated = await tacheService.updateTache(
        req.params.id,
        req.body,
        req.user
      );

      successResponse(res, { updated }, 'Tache updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // UPDATE PROGRESS
  // ---------------------------------------------------
  async updateProgress(req, res, next) {
    try {
      const { progress } = req.body;

      const updated = await tacheService.updateProgress(
        req.params.id,
        progress,
        req.user
      );

      successResponse(res, { updated }, 'Progress updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // ASSIGN USERS
  // ---------------------------------------------------
  async assignUsers(req, res, next) {
    try {
      const { userIds } = req.body;

      const result = await tacheService.assignUsers(
        req.params.id,
        userIds,
        req.user
      );

      successResponse(res, { result }, 'Users assigned successfully');
    } catch (error) {
      next(error);
    }
  }

  // ---------------------------------------------------
  // DELETE
  // ---------------------------------------------------
  async deleteTache(req, res, next) {
    try {
      const deleted = await tacheService.deleteTache(
        req.params.id,
        req.user
      );

      successResponse(res, { deleted }, 'Tache deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TacheController();
