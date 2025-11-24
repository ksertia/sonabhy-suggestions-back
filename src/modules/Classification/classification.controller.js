const ClassificationService = require('./classification.service');
const { successResponse } = require('../../utils/response');

class ClassificationController {
  // ============================================
  // FORM MODEL CONTROLLERS
  // ============================================

  async createCategory(req, res, next) {
    try {
      const category = await ClassificationService.createCategory(req.body, req.user);
      successResponse(res, { category }, 'Form model created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
      };
      const categories = await ClassificationService.getAllCategories(filters, req.user);
      successResponse(res, { categories }, 'Form models retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await ClassificationService.getCategoryById(req.params.id, req.user);
      successResponse(res, { category }, 'Form model retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await ClassificationService.updateCategory(req.params.id, req.body, req.user);
      successResponse(res, { category }, 'Form model updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await ClassificationService.deleteCategory(req.params.id, req.user);
      successResponse(res, result, 'Form model deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // FORM VARIANT CONTROLLERS
  // ============================================

  async createStatus(req, res, next) {
    try {
      const status = await ClassificationService.createStatus(req.body, req.user);
      successResponse(res, { status }, 'Form model created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllStatuses(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
      };
      const statuses = await ClassificationService.getAllStatuses(filters, req.user);
      successResponse(res, { statuses }, 'Form models retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStatusById(req, res, next) {
    try {
      const status = await ClassificationService.getStatusById(req.params.id, req.user);
      successResponse(res, { status }, 'Form model retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const status = await ClassificationService.updateStatus(req.params.id, req.body, req.user);
      successResponse(res, { status }, 'Form model updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteStatus(req, res, next) {
    try {
      const result = await ClassificationService.deleteStatus(req.params.id, req.user);
      successResponse(res, result, 'Form model deleted successfully');
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new ClassificationController();
