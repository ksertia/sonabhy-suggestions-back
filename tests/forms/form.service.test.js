/**
 * Dynamic Form Service Tests
 */

const mockPrisma = require('../mocks/prisma.mock');

// Mock dependencies
jest.mock('../../src/config/database', () => mockPrisma);

const formService = require('../../src/modules/forms/form.service');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../src/utils/errors');

describe('Form Service', () => {
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockManager = {
    id: 'manager-id',
    email: 'manager@example.com',
    role: 'MANAGER',
  };

  const mockAdmin = {
    id: 'admin-id',
    email: 'admin@example.com',
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.resetMocks();
  });

  describe('createFormModel', () => {
    const modelData = {
      name: 'Test Form',
      description: 'Test Description',
    };

    it('should create form model successfully (ADMIN)', async () => {
      const mockModel = {
        id: 'model-id',
        ...modelData,
        createdAt: new Date(),
      };

      mockPrisma.formModel.create.mockResolvedValue(mockModel);

      const result = await formService.createFormModel(modelData, mockAdmin);

      expect(mockPrisma.formModel.create).toHaveBeenCalledWith({
        data: modelData,
      });
      expect(result).toEqual(mockModel);
    });

    it('should throw error if USER tries to create form model', async () => {
      await expect(formService.createFormModel(modelData, mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should throw error if MANAGER tries to create form model', async () => {
      await expect(formService.createFormModel(modelData, mockManager)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createFormVariant', () => {
    const variantData = {
      modelId: 'model-id',
      name: 'Standard Version',
      isDefault: true,
    };

    it('should create form variant successfully (MANAGER)', async () => {
      const mockVariant = {
        id: 'variant-id',
        ...variantData,
        createdAt: new Date(),
      };

      mockPrisma.formModel.findUnique.mockResolvedValue({ id: variantData.modelId });
      mockPrisma.formVariant.create.mockResolvedValue(mockVariant);

      const result = await formService.createFormVariant(variantData, mockManager);

      expect(mockPrisma.formModel.findUnique).toHaveBeenCalledWith({
        where: { id: variantData.modelId },
      });
      expect(mockPrisma.formVariant.create).toHaveBeenCalled();
      expect(result).toEqual(mockVariant);
    });

    it('should throw error if form model not found', async () => {
      mockPrisma.formModel.findUnique.mockResolvedValue(null);

      await expect(formService.createFormVariant(variantData, mockManager)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if USER tries to create variant', async () => {
      await expect(formService.createFormVariant(variantData, mockUser)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('createFormField', () => {
    const fieldData = {
      variantId: 'variant-id',
      label: 'Email',
      type: 'EMAIL',
      required: true,
      order: 1,
    };

    it('should create form field successfully (MANAGER)', async () => {
      const mockField = {
        id: 'field-id',
        ...fieldData,
        createdAt: new Date(),
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue({ id: fieldData.variantId });
      mockPrisma.formField.create.mockResolvedValue(mockField);

      const result = await formService.createFormField(fieldData, mockManager);

      expect(mockPrisma.formVariant.findUnique).toHaveBeenCalledWith({
        where: { id: fieldData.variantId },
      });
      expect(mockPrisma.formField.create).toHaveBeenCalled();
      expect(result).toEqual(mockField);
    });

    it('should validate field type', async () => {
      const invalidFieldData = {
        ...fieldData,
        type: 'INVALID_TYPE',
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue({ id: fieldData.variantId });

      await expect(formService.createFormField(invalidFieldData, mockManager)).rejects.toThrow(BadRequestError);
    });

    it('should validate options for SELECT field', async () => {
      const selectFieldData = {
        ...fieldData,
        type: 'SELECT',
        options: {}, // Missing choices
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue({ id: fieldData.variantId });

      await expect(formService.createFormField(selectFieldData, mockManager)).rejects.toThrow(BadRequestError);
    });

    it('should accept valid options for SELECT field', async () => {
      const selectFieldData = {
        ...fieldData,
        type: 'SELECT',
        options: {
          choices: ['Option 1', 'Option 2'],
        },
      };

      const mockField = {
        id: 'field-id',
        ...selectFieldData,
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue({ id: fieldData.variantId });
      mockPrisma.formField.create.mockResolvedValue(mockField);

      const result = await formService.createFormField(selectFieldData, mockManager);

      expect(result).toEqual(mockField);
    });
  });

  describe('getFormStructure', () => {
    it('should get form structure by variant id', async () => {
      const mockVariant = {
        id: 'variant-id',
        name: 'Standard Version',
        model: {
          id: 'model-id',
          name: 'Test Form',
        },
        fields: [
          {
            id: 'field-1',
            label: 'Name',
            type: 'TEXT',
            required: true,
            order: 1,
          },
          {
            id: 'field-2',
            label: 'Email',
            type: 'EMAIL',
            required: true,
            order: 2,
          },
        ],
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue(mockVariant);

      const result = await formService.getFormStructure('variant-id');

      expect(mockPrisma.formVariant.findUnique).toHaveBeenCalledWith({
        where: { id: 'variant-id' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockVariant);
    });

    it('should throw error if variant not found', async () => {
      mockPrisma.formVariant.findUnique.mockResolvedValue(null);

      await expect(formService.getFormStructure('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('validateFormSubmission', () => {
    const mockVariant = {
      id: 'variant-id',
      fields: [
        {
          id: 'field-1',
          label: 'Name',
          type: 'TEXT',
          required: true,
        },
        {
          id: 'field-2',
          label: 'Email',
          type: 'EMAIL',
          required: true,
        },
        {
          id: 'field-3',
          label: 'Age',
          type: 'NUMBER',
          required: false,
        },
      ],
    };

    it('should validate submission successfully', async () => {
      const submission = {
        Name: 'John Doe',
        Email: 'john@example.com',
        Age: '25',
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue(mockVariant);

      const result = await formService.validateFormSubmission('variant-id', submission);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.data).toBeDefined();
      expect(result.data['field-1']).toBe('John Doe');
      expect(result.data['field-2']).toBe('john@example.com');
      expect(result.data['field-3']).toBe(25);
    });

    it('should fail validation for missing required field', async () => {
      const submission = {
        Name: 'John Doe',
        // Email is missing
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue(mockVariant);

      const result = await formService.validateFormSubmission('variant-id', submission);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('Email');
    });

    it('should fail validation for invalid email', async () => {
      const submission = {
        Name: 'John Doe',
        Email: 'invalid-email',
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue(mockVariant);

      const result = await formService.validateFormSubmission('variant-id', submission);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'Email')).toBe(true);
    });

    it('should validate NUMBER field', async () => {
      const submission = {
        Name: 'John Doe',
        Email: 'john@example.com',
        Age: 'not-a-number',
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue(mockVariant);

      const result = await formService.validateFormSubmission('variant-id', submission);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'Age')).toBe(true);
    });

    it('should validate SELECT field with choices', async () => {
      const variantWithSelect = {
        ...mockVariant,
        fields: [
          ...mockVariant.fields,
          {
            id: 'field-4',
            label: 'Category',
            type: 'SELECT',
            required: true,
            options: {
              choices: ['Option 1', 'Option 2', 'Option 3'],
            },
          },
        ],
      };

      const submission = {
        Name: 'John Doe',
        Email: 'john@example.com',
        Category: 'Invalid Option',
      };

      mockPrisma.formVariant.findUnique.mockResolvedValue(variantWithSelect);

      const result = await formService.validateFormSubmission('variant-id', submission);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'Category')).toBe(true);
    });
  });

  describe('reorderFields', () => {
    it('should reorder fields successfully (MANAGER)', async () => {
      const fieldOrders = [
        { id: 'field-1', order: 2 },
        { id: 'field-2', order: 1 },
      ];

      mockPrisma.formVariant.findUnique.mockResolvedValue({ id: 'variant-id' });
      mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
      mockPrisma.formField.update.mockResolvedValue({});

      const result = await formService.reorderFields('variant-id', fieldOrders, mockManager);

      expect(mockPrisma.formField.update).toHaveBeenCalledTimes(2);
      expect(result.message).toBe('Fields reordered successfully');
    });

    it('should throw error if USER tries to reorder', async () => {
      const fieldOrders = [{ id: 'field-1', order: 1 }];

      await expect(formService.reorderFields('variant-id', fieldOrders, mockUser)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('bulkCreateFields', () => {
    it('should bulk create fields successfully (MANAGER)', async () => {
      const fields = [
        { label: 'Name', type: 'TEXT', required: true, order: 1 },
        { label: 'Email', type: 'EMAIL', required: true, order: 2 },
      ];

      const mockFields = fields.map((f, i) => ({ id: `field-${i}`, ...f }));

      mockPrisma.formVariant.findUnique.mockResolvedValue({ id: 'variant-id' });
      mockPrisma.$transaction.mockImplementation((callback) => callback(mockPrisma));
      mockPrisma.formField.create.mockImplementation((data) => 
        Promise.resolve({ id: 'field-id', ...data.data })
      );

      const result = await formService.bulkCreateFields('variant-id', fields, mockManager);

      expect(mockPrisma.formField.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });

    it('should throw error if USER tries to bulk create', async () => {
      const fields = [{ label: 'Name', type: 'TEXT', required: true, order: 1 }];

      await expect(formService.bulkCreateFields('variant-id', fields, mockUser)).rejects.toThrow(ForbiddenError);
    });
  });
});
