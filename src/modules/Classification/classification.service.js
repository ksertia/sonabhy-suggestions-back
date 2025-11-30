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
  // Kinds OPERATIONS
  // ============================================

  async createKind(data, user) {
    // Only admins can create form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create Kind');
    }

    // Check if name already exists
    const existing = await ClassificationRepository.findAllKinds({ search: data.name });
    if (existing.some(model => model.name === data.name)) {
      throw new ConflictError('Kind with this name already exists');
    }

    const kind = await ClassificationRepository.createKind(data);
    return kind;
  }

  async getAllKinds(filters) {
    const kinds = await ClassificationRepository.findAllKinds(filters);
    return kinds;
  }

  async getKindById(id) {
    const kind = await ClassificationRepository.findKindById(id);
    
    if (!kind) {
      throw new NotFoundError('Kind not found');
    }

    return kind;
  }

  async updateKind(id, data, user) {
    // Only admins can update form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update Kind');
    }

    const kind = await ClassificationRepository.findKindById(id);
    
    if (!kind) {
      throw new NotFoundError('Kind not found');
    }

    const updated = await ClassificationRepository.updateKind(id, data);
    return updated;
  }

  async deleteKind(id, user) {
    // Only admins can delete form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete Kind');
    }

    const kind = await ClassificationRepository.findKindById(id);
    
    if (!kind) {
      throw new NotFoundError('Kind not found');
    }

    await ClassificationRepository.deleteKind(id);
    return { message: 'Kind deleted successfully' };
  }


}

module.exports = new ClassificationService();
