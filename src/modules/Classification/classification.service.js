const ClassificationRepository = require('./classification.repository');
const { NotFoundError, BadRequestError, ConflictError, ForbiddenError } = require('../../utils/errors');

class ClassificationService {
  // ============================================
  // FORM MODEL OPERATIONS
  // ============================================

  async createCategory(data, user) {
    // Only admins can create form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create form models');
    }

    // Check if name already exists
    const existing = await ClassificationRepository.findAllCategories({ search: data.name });
    if (existing.some(model => model.name === data.name)) {
      throw new ConflictError('Form model with this name already exists');
    }

    const categories = await ClassificationRepository.createCategory(data);
    return categories;
  }

  async getAllCategories(filters, user) {
    const categories = await ClassificationRepository.findAllCategories(filters);
    return categories;
  }

  async getCategoryById(id, user) {
    const category = await ClassificationRepository.findCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Form model not found');
    }

    return category;
  }

  async updateFormModel(id, data, user) {
    // Only admins can update form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update form models');
    }

    const category = await ClassificationRepository.findCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Form model not found');
    }

    const updated = await ClassificationRepository.updateCategory(id, data);
    return updated;
  }

  async deleteCategory(id, user) {
    // Only admins can delete form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete form models');
    }

    const category = await ClassificationRepository.findCategoryById(id);
    
    if (!category) {
      throw new NotFoundError('Form model not found');
    }

    // Check if any variants have associated ideas
    const hasIdeas = category.variants.some(variant => variant._count.ideas > 0);
    if (hasIdeas) {
      throw new BadRequestError('Cannot delete form model with variants that have associated ideas');
    }

    await ClassificationRepository.deleteCategory(id);
    return { message: 'Form model deleted successfully' };
  }

  // ============================================
  // FORM VARIANT OPERATIONS
  // ============================================

  async createStatus(data, user) {
    // Only admins can create form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create form models');
    }

    // Check if name already exists
    const existing = await ClassificationRepository.findAllStatuses({ search: data.name });
    if (existing.some(model => model.name === data.name)) {
      throw new ConflictError('Form model with this name already exists');
    }

    const categories = await ClassificationRepository.createStatus(data);
    return categories;
  }

  async getAllStatuses(filters, user) {
    const categories = await ClassificationRepository.findAllStatuses(filters);
    return categories;
  }

  async getStatusById(id, user) {
    const category = await ClassificationRepository.findStatusById(id);
    
    if (!category) {
      throw new NotFoundError('Form model not found');
    }

    return category;
  }

  async updateStatus(id, data, user) {
    // Only admins can update form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update form models');
    }

    const category = await ClassificationRepository.findStatusById(id);
    
    if (!category) {
      throw new NotFoundError('Form model not found');
    }

    const updated = await ClassificationRepository.updateStatus(id, data);
    return updated;
  }

  async deleteStatus(id, user) {
    // Only admins can delete form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete form models');
    }

    const category = await ClassificationRepository.findStatusById(id);
    
    if (!category) {
      throw new NotFoundError('Form model not found');
    }

    // Check if any variants have associated ideas
    const hasIdeas = category.variants.some(variant => variant._count.ideas > 0);
    if (hasIdeas) {
      throw new BadRequestError('Cannot delete form model with variants that have associated ideas');
    }

    await ClassificationRepository.deleteStatus(id);
    return { message: 'Form model deleted successfully' };
  }


}

module.exports = new ClassificationService();
