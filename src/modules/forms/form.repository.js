const prisma = require('../../config/database');

class FormRepository {
  // ============================================
  // FORM MODEL OPERATIONS
  // ============================================

  async createFormModel(data) {
    return prisma.formModel.create({
      data,
      include: {
        variants: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async findAllFormModels(filters = {}) {
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.formModel.findMany({
      where,
      include: {
        variants: {
          include: {
            _count: {
              select: {
                fields: true,
                ideas: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findFormModelById(id) {
    return prisma.formModel.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            fields: {
              orderBy: {
                order: 'asc',
              },
            },
            _count: {
              select: {
                ideas: true,
              },
            },
          },
        },
      },
    });
  }

  async updateFormModel(id, data) {
    return prisma.formModel.update({
      where: { id },
      data,
      include: {
        variants: true,
      },
    });
  }

  async deleteFormModel(id) {
    return prisma.formModel.delete({
      where: { id },
    });
  }

  // ============================================
  // FORM VARIANT OPERATIONS
  // ============================================

  async createFormVariant(data) {
    return prisma.formVariant.create({
      data,
      include: {
        model: true,
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findAllFormVariants(modelId) {
    return prisma.formVariant.findMany({
      where: { modelId },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            ideas: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findFormVariantById(id) {
    return prisma.formVariant.findUnique({
      where: { id },
      include: {
        model: true,
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            ideas: true,
          },
        },
      },
    });
  }

  async updateFormVariant(id, data) {
    return prisma.formVariant.update({
      where: { id },
      data,
      include: {
        model: true,
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async deleteFormVariant(id) {
    return prisma.formVariant.delete({
      where: { id },
    });
  }

  async setDefaultVariant(modelId, variantId) {
    // First, unset all defaults for this model
    await prisma.formVariant.updateMany({
      where: { modelId },
      data: { isDefault: false },
    });

    // Then set the new default
    return prisma.formVariant.update({
      where: { id: variantId },
      data: { isDefault: true },
    });
  }

  // ============================================
  // FORM FIELD OPERATIONS
  // ============================================

  async createFormField(data) {
    return prisma.formField.create({
      data,
      include: {
        variant: true,
      },
    });
  }

  async findAllFormFields(variantId) {
    return prisma.formField.findMany({
      where: { variantId },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findFormFieldById(id) {
    return prisma.formField.findUnique({
      where: { id },
      include: {
        variant: true,
      },
    });
  }

  async updateFormField(id, data) {
    return prisma.formField.update({
      where: { id },
      data,
    });
  }

  async deleteFormField(id) {
    return prisma.formField.delete({
      where: { id },
    });
  }

  async reorderFields(variantId, fieldOrders) {
    // fieldOrders is an array of { id, order }
    const updates = fieldOrders.map(({ id, order }) =>
      prisma.formField.update({
        where: { id },
        data: { order },
      })
    );

    await prisma.$transaction(updates);

    return this.findAllFormFields(variantId);
  }

  async bulkCreateFields(variantId, fields) {
    const createdFields = [];

    for (const field of fields) {
      const created = await prisma.formField.create({
        data: {
          ...field,
          variantId,
        },
      });
      createdFields.push(created);
    }

    return createdFields;
  }

  // ============================================
  // FORM STRUCTURE & VALIDATION
  // ============================================

  async getFormStructure(variantId) {
    return prisma.formVariant.findUnique({
      where: { id: variantId },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getDefaultVariant(modelId) {
    return prisma.formVariant.findFirst({
      where: {
        modelId,
        isDefault: true,
      },
      include: {
        fields: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }
}

module.exports = new FormRepository();
