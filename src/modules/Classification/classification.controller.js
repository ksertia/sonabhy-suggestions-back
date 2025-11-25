const ClassificationService = require('./classification.service');
const { successResponse } = require('../../utils/response');

class ClassificationController {
  // ============================================
  // FORM MODEL CONTROLLERS
  // ============================================

  async createCategory(req, res, next) {
    try {
      const category = await ClassificationService.createCategory(req.body, req.user);
      successResponse(res, { category }, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
      };
      const categories = await ClassificationService.getAllCategories(filters);
      successResponse(res, { categories }, 'Categories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await ClassificationService.getCategoryById(req.params.id, req.user);
      successResponse(res, { category }, 'Category retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await ClassificationService.updateCategory(req.params.id, req.body, req.user);
      successResponse(res, { category }, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await ClassificationService.deleteCategory(req.params.id, req.user);
      successResponse(res, result, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // Statuses CONTROLLERS
  // ============================================

  async createStatus(req, res, next) {
    try {
      const status = await ClassificationService.createStatus(req.body, req.user);
      successResponse(res, { status }, 'Status created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllStatuses(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
      };
      const statuses = await ClassificationService.getAllStatuses(filters);
      successResponse(res, { statuses }, 'Statuses retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatusById(req, res, next) {
    try {
      const status = await ClassificationService.getStatusById(req.params.id, req.user);
      successResponse(res, { status }, 'Status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const status = await ClassificationService.updateStatus(req.params.id, req.body, req.user);
      successResponse(res, { status }, 'Status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteStatus(req, res, next) {
    try {
      const result = await ClassificationService.deleteStatus(req.params.id, req.user);
      successResponse(res, result, 'Status deleted successfully');
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new ClassificationController();
