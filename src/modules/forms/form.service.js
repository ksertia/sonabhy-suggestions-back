const formRepository = require('./form.repository');
const { NotFoundError, BadRequestError, ConflictError, ForbiddenError } = require('../../utils/errors');

class FormService {
  // ============================================
  // FORM MODEL OPERATIONS
  // ============================================

  async createFormModel(data, user) {
    // Only admins can create form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can create form models');
    }

    // Check if name already exists
    const existing = await formRepository.findAllFormModels({ search: data.name });
    if (existing.some(model => model.name === data.name)) {
      throw new ConflictError('Form model with this name already exists');
    }

    const formModel = await formRepository.createFormModel(data);
    return formModel;
  }

  async getAllFormModels(filters, user) {
    const formModels = await formRepository.findAllFormModels(filters);
    return formModels;
  }

  async getFormModelById(id, user) {
    const formModel = await formRepository.findFormModelById(id);
    
    if (!formModel) {
      throw new NotFoundError('Form model not found');
    }

    return formModel;
  }

  async updateFormModel(id, data, user) {
    // Only admins can update form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can update form models');
    }

    const formModel = await formRepository.findFormModelById(id);
    
    if (!formModel) {
      throw new NotFoundError('Form model not found');
    }

    const updated = await formRepository.updateFormModel(id, data);
    return updated;
  }

  async deleteFormModel(id, user) {
    // Only admins can delete form models
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete form models');
    }

    const formModel = await formRepository.findFormModelById(id);
    
    if (!formModel) {
      throw new NotFoundError('Form model not found');
    }

    // Check if any variants have associated ideas
    const hasIdeas = formModel.variants.some(variant => variant._count.ideas > 0);
    if (hasIdeas) {
      throw new BadRequestError('Cannot delete form model with variants that have associated ideas');
    }

    await formRepository.deleteFormModel(id);
    return { message: 'Form model deleted successfully' };
  }

  // ============================================
  // FORM VARIANT OPERATIONS
  // ============================================

  async createFormVariant(data, user) {
    // Only admins and managers can create variants
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can create form variants');
    }

    // Verify model exists
    const model = await formRepository.findFormModelById(data.modelId);
    if (!model) {
      throw new NotFoundError('Form model not found');
    }

    // If this is the first variant, make it default
    if (model.variants.length === 0) {
      data.isDefault = true;
    }

    const variant = await formRepository.createFormVariant(data);
    return variant;
  }

  async getAllFormVariants(modelId, user) {
    const variants = await formRepository.findAllFormVariants(modelId);
    return variants;
  }

  async getFormVariantById(id, user) {
    const variant = await formRepository.findFormVariantById(id);
    
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    return variant;
  }

  async updateFormVariant(id, data, user) {
    // Only admins and managers can update variants
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can update form variants');
    }

    const variant = await formRepository.findFormVariantById(id);
    
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    const updated = await formRepository.updateFormVariant(id, data);
    return updated;
  }

  async deleteFormVariant(id, user) {
    // Only admins can delete variants
    if (user.role !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete form variants');
    }

    const variant = await formRepository.findFormVariantById(id);
    
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    // Check if variant has associated ideas
    if (variant._count.ideas > 0) {
      throw new BadRequestError('Cannot delete form variant with associated ideas');
    }

    await formRepository.deleteFormVariant(id);
    return { message: 'Form variant deleted successfully' };
  }

  async setDefaultVariant(modelId, variantId, user) {
    // Only admins and managers can set default
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can set default variant');
    }

    const variant = await formRepository.findFormVariantById(variantId);
    
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    if (variant.modelId !== modelId) {
      throw new BadRequestError('Variant does not belong to this model');
    }

    const updated = await formRepository.setDefaultVariant(modelId, variantId);
    return updated;
  }

  // ============================================
  // FORM FIELD OPERATIONS
  // ============================================

  async createFormField(data, user) {
    // Only admins and managers can create fields
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can create form fields');
    }

    // Verify variant exists
    const variant = await formRepository.findFormVariantById(data.variantId);
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    // Validate field type
    const validTypes = ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE'];
    if (!validTypes.includes(data.type)) {
      throw new BadRequestError(`Invalid field type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate options for select/radio/checkbox fields
    if (['SELECT', 'MULTISELECT', 'RADIO', 'CHECKBOX'].includes(data.type)) {
      if (!data.options || !data.options.choices || !Array.isArray(data.options.choices)) {
        throw new BadRequestError('Select, radio, and checkbox fields must have options.choices array');
      }
    }

    // If no order specified, add to end
    if (!data.order) {
      const fields = await formRepository.findAllFormFields(data.variantId);
      data.order = fields.length + 1;
    }

    const field = await formRepository.createFormField(data);
    return field;
  }

  async getAllFormFields(variantId, user) {
    const fields = await formRepository.findAllFormFields(variantId);
    return fields;
  }

  async getFormFieldById(id, user) {
    const field = await formRepository.findFormFieldById(id);
    
    if (!field) {
      throw new NotFoundError('Form field not found');
    }

    return field;
  }

  async updateFormField(id, data, user) {
    // Only admins and managers can update fields
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can update form fields');
    }

    const field = await formRepository.findFormFieldById(id);
    
    if (!field) {
      throw new NotFoundError('Form field not found');
    }

    // Validate field type if being updated
    if (data.type) {
      const validTypes = ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'DATE', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'FILE'];
      if (!validTypes.includes(data.type)) {
        throw new BadRequestError(`Invalid field type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    const updated = await formRepository.updateFormField(id, data);
    return updated;
  }

  async deleteFormField(id, user) {
    // Only admins and managers can delete fields
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can delete form fields');
    }

    const field = await formRepository.findFormFieldById(id);
    
    if (!field) {
      throw new NotFoundError('Form field not found');
    }

    await formRepository.deleteFormField(id);
    return { message: 'Form field deleted successfully' };
  }

  async reorderFields(variantId, fieldOrders, user) {
    // Only admins and managers can reorder fields
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can reorder form fields');
    }

    const variant = await formRepository.findFormVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    // Validate all field IDs belong to this variant
    const variantFieldIds = variant.fields.map(f => f.id);
    const invalidFields = fieldOrders.filter(fo => !variantFieldIds.includes(fo.id));
    
    if (invalidFields.length > 0) {
      throw new BadRequestError('Some field IDs do not belong to this variant');
    }

    const reordered = await formRepository.reorderFields(variantId, fieldOrders);
    return reordered;
  }

  async bulkCreateFields(variantId, fields, user) {
    // Only admins and managers can bulk create fields
    if (user.role === 'USER') {
      throw new ForbiddenError('Only admins and managers can create form fields');
    }

    const variant = await formRepository.findFormVariantById(variantId);
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    const created = await formRepository.bulkCreateFields(variantId, fields);
    return created;
  }

  async bulkUpdateFields(variantId, fields, user) {
  // Only admins and managers can bulk update fields
  if (user.role === 'USER') {
    throw new ForbiddenError('Only admins and managers can update form fields');
  }

  const variant = await formRepository.findFormVariantById(variantId);
  if (!variant) {
    throw new NotFoundError('Form variant not found');
  }

  const updated = await formRepository.bulkUpdateFields(fields);
  return updated;
}


  // ============================================
  // FORM STRUCTURE & VALIDATION
  // ============================================

  async getFormStructure(variantId) {
    const structure = await formRepository.getFormStructure(variantId);
    
    if (!structure) {
      throw new NotFoundError('Form variant not found');
    }

    return structure;
  }

  async getDefaultFormStructure(modelId) {
    const structure = await formRepository.getDefaultVariant(modelId);
    
    if (!structure) {
      throw new NotFoundError('No default variant found for this model');
    }

    return structure;
  }

  async validateSubmission(variantId, submission) {
    const variant = await formRepository.getFormStructure(variantId);
    
    if (!variant) {
      throw new NotFoundError('Form variant not found');
    }

    const errors = [];
    const validatedData = {};

    for (const field of variant.fields) {
      const value = submission[field.label] || submission[field.id];

      // Check required fields
      if (field.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: field.label,
          fieldId: field.id,
          message: `${field.label} is required`,
        });
        continue;
      }

      // Skip validation if field is not required and empty
      if (!field.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type-specific validation
      switch (field.type) {
        case 'NUMBER':
          if (isNaN(value)) {
            errors.push({
              field: field.label,
              fieldId: field.id,
              message: `${field.label} must be a number`,
            });
          } else {
            validatedData[field.id] = Number(value);
          }
          break;

        case 'EMAIL':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              field: field.label,
              fieldId: field.id,
              message: `${field.label} must be a valid email`,
            });
          } else {
            validatedData[field.id] = value;
          }
          break;

        case 'DATE':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors.push({
              field: field.label,
              fieldId: field.id,
              message: `${field.label} must be a valid date`,
            });
          } else {
            validatedData[field.id] = date.toISOString();
          }
          break;

        case 'SELECT':
        case 'RADIO':
          if (field.options && field.options.choices) {
            if (!field.options.choices.includes(value)) {
              errors.push({
                field: field.label,
                fieldId: field.id,
                message: `${field.label} must be one of: ${field.options.choices.join(', ')}`,
              });
            } else {
              validatedData[field.id] = value;
            }
          } else {
            validatedData[field.id] = value;
          }
          break;

        case 'MULTISELECT':
        case 'CHECKBOX':
          if (!Array.isArray(value)) {
            errors.push({
              field: field.label,
              fieldId: field.id,
              message: `${field.label} must be an array`,
            });
          } else if (field.options && field.options.choices) {
            const invalidChoices = value.filter(v => !field.options.choices.includes(v));
            if (invalidChoices.length > 0) {
              errors.push({
                field: field.label,
                fieldId: field.id,
                message: `${field.label} contains invalid choices: ${invalidChoices.join(', ')}`,
              });
            } else {
              validatedData[field.id] = value;
            }
          } else {
            validatedData[field.id] = value;
          }
          break;

        case 'TEXT':
        case 'TEXTAREA':
          validatedData[field.id] = String(value);
          break;

        case 'FILE':
          // File validation would be handled separately during upload
          validatedData[field.id] = value;
          break;

        default:
          validatedData[field.id] = value;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data: validatedData,
    };
  }
}

module.exports = new FormService();
