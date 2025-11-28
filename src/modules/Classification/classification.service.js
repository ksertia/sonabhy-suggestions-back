const ClassificationRepository = require('./classification.repository');
const { NotFoundError, BadRequestError, ConflictError, ForbiddenError } = require('../../utils/errors');

class ClassificationService {
  // ============================================
  // FORM MODEL OPERATIONS
  // ============================================

  async createCategory(data, user) {
    // Only admins can create form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create categories');
    }

    // Check if name already exists
    const existing = await ClassificationRepository.findAllCategories({ search: data.name });
    if (existing.some(model => model.name === data.name)) {
      throw new ConflictError('categories with this name already exists');
    }

    const categories = await ClassificationRepository.createCategory(data);
    return categories;
  }

  async getAllCategories(filters) {
    const categories = await ClassificationRepository.findAllCategories(filters);
    return categories;
  }

  async getCategoryById(id, user) {
    const category = await ClassificationRepository.findCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async updateCategory(id, data, user) {
    // Only admins can update form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update category');
    }

    const category = await ClassificationRepository.findCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updated = await ClassificationRepository.updateCategory(id, data);
    return updated;
  }

  async deleteCategory(id, user) {
    // Only admins can delete form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete Categories');
    }

    const category = await ClassificationRepository.findCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    await ClassificationRepository.deleteCategory(id);
    return { message: 'Category deleted successfully' };
  }

  // ============================================
  // FORM VARIANT OPERATIONS
  // ============================================

  async createStatus(data, user) {
    // Only admins can create form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create status');
    }

    // Check if name already exists
    const existing = await ClassificationRepository.findAllStatuses({ search: data.name });
    if (existing.some(model => model.name === data.name)) {
      throw new ConflictError('Statuses with this name already exists');
    }

    const status = await ClassificationRepository.createStatus(data);
    return status;
  }

  async getAllStatuses(filters) {
    const statuses = await ClassificationRepository.findAllStatuses(filters);
    return statuses;
  }

  async getStatusById(id) {
    const status = await ClassificationRepository.findStatusById(id);
    
    if (!status) {
      throw new NotFoundError('Status not found');
    }

    return status;
  }

  async updateStatus(id, data, user) {
    // Only admins can update form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update statuses');
    }

    const status = await ClassificationRepository.findStatusById(id);
    
    if (!status) {
      throw new NotFoundError('Status not found');
    }

    const updated = await ClassificationRepository.updateStatus(id, data);
    return updated;
  }

  async deleteStatus(id, user) {
    // Only admins can delete form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete Statuses');
    }

    const status = await ClassificationRepository.findStatusById(id);
    
    if (!status) {
      throw new NotFoundError('Status not found');
    }

    await ClassificationRepository.deleteStatus(id);
    return { message: 'Status deleted successfully' };
  }


}

module.exports = new ClassificationService();
