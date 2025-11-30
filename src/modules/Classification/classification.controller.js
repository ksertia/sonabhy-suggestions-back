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
  // Kinds CONTROLLERS
  // ============================================

  async createKind(req, res, next) {
    try {
      const kind = await ClassificationService.createKind(req.body, req.user);
      successResponse(res, { kind }, 'Kind created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllKinds(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
      };
      const kinds = await ClassificationService.getAllKinds(filters);
      successResponse(res, { kinds }, 'Kinds retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getKindById(req, res, next) {
    try {
      const kind = await ClassificationService.getKindById(req.params.id, req.user);
      successResponse(res, { kind }, 'Kind retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateKind(req, res, next) {
    try {
      const kind = await ClassificationService.updateKind(req.params.id, req.body, req.user);
      successResponse(res, { kind }, 'Kind updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteKind(req, res, next) {
    try {
      const result = await ClassificationService.deleteKind(req.params.id, req.user);
      successResponse(res, result, 'Kind deleted successfully');
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new ClassificationController();
