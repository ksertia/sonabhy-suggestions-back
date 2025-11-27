const formService = require('./form.service');
const { successResponse } = require('../../utils/response');

class FormController {
  // ============================================
  // FORM MODEL CONTROLLERS
  // ============================================

  async createFormModel(req, res, next) {
    try {
      const formModel = await formService.createFormModel(req.body, req.user);
      successResponse(res, { formModel }, 'Form model created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllFormModels(req, res, next) {
    try {
      const filters = {
        isActive: req.query.isActive,
        search: req.query.search,
      };
      const formModels = await formService.getAllFormModels(filters, req.user);
      successResponse(res, { formModels }, 'Form models retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFormModelById(req, res, next) {
    try {
      const formModel = await formService.getFormModelById(req.params.id, req.user);
      successResponse(res, { formModel }, 'Form model retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateFormModel(req, res, next) {
    try {
      const formModel = await formService.updateFormModel(req.params.id, req.body, req.user);
      successResponse(res, { formModel }, 'Form model updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteFormModel(req, res, next) {
    try {
      const result = await formService.deleteFormModel(req.params.id, req.user);
      successResponse(res, result, 'Form model deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // FORM VARIANT CONTROLLERS
  // ============================================

  async createFormVariant(req, res, next) {
    try {
      const variant = await formService.createFormVariant(req.body, req.user);
      successResponse(res, { variant }, 'Form variant created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllFormVariants(req, res, next) {
    try {
      const variants = await formService.getAllFormVariants(req.params.modelId, req.user);
      successResponse(res, { variants }, 'Form variants retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFormVariantById(req, res, next) {
    try {
      const variant = await formService.getFormVariantById(req.params.id, req.user);
      successResponse(res, { variant }, 'Form variant retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateFormVariant(req, res, next) {
    try {
      const variant = await formService.updateFormVariant(req.params.id, req.body, req.user);
      successResponse(res, { variant }, 'Form variant updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteFormVariant(req, res, next) {
    try {
      const result = await formService.deleteFormVariant(req.params.id, req.user);
      successResponse(res, result, 'Form variant deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async setDefaultVariant(req, res, next) {
    try {
      const variant = await formService.setDefaultVariant(req.params.modelId, req.params.variantId, req.user);
      successResponse(res, { variant }, 'Default variant set successfully');
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // FORM FIELD CONTROLLERS
  // ============================================

  async createFormField(req, res, next) {
    try {
      const field = await formService.createFormField(req.body, req.user);
      successResponse(res, { field }, 'Form field created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllFormFields(req, res, next) {
    try {
      const fields = await formService.getAllFormFields(req.params.variantId, req.user);
      successResponse(res, { fields }, 'Form fields retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFormFieldById(req, res, next) {
    try {
      const field = await formService.getFormFieldById(req.params.id, req.user);
      successResponse(res, { field }, 'Form field retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateFormField(req, res, next) {
    try {
      const field = await formService.updateFormField(req.params.id, req.body, req.user);
      successResponse(res, { field }, 'Form field updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteFormField(req, res, next) {
    try {
      const result = await formService.deleteFormField(req.params.id, req.user);
      successResponse(res, result, 'Form field deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async reorderFields(req, res, next) {
    try {
      const fields = await formService.reorderFields(req.params.variantId, req.body.fieldOrders, req.user);
      successResponse(res, { fields }, 'Fields reordered successfully');
    } catch (error) {
      next(error);
    }
  }

  async bulkCreateFields(req, res, next) {
    try {
      const fields = await formService.bulkCreateFields(req.params.variantId, req.body.fields, req.user);
      successResponse(res, { fields }, 'Fields created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpdateFields(req, res, next) {
  try {
    const fields = await formService.bulkUpdateFields(
      req.params.variantId,
      req.body.fields,
      req.user
    );

    successResponse(res, { fields }, 'Fields updated successfully', 200);
  } catch (error) {
    next(error);
  }
}


  // ============================================
  // FORM STRUCTURE & VALIDATION CONTROLLERS
  // ============================================

  async getFormStructure(req, res, next) {
    try {
      const structure = await formService.getFormStructure(req.params.variantId);
      successResponse(res, { structure }, 'Form structure retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDefaultFormStructure(req, res, next) {
    try {
      const structure = await formService.getDefaultFormStructure(req.params.modelId);
      successResponse(res, { structure }, 'Default form structure retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async validateSubmission(req, res, next) {
    try {
      const result = await formService.validateSubmission(req.params.variantId, req.body.submission);
      
      if (result.valid) {
        successResponse(res, result, 'Submission is valid');
      } else {
        successResponse(res, result, 'Submission validation failed', 400);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FormController();
