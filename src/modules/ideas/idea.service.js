const ideaRepository = require('./idea.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');
const path = require('path');
const fs = require('fs').promises;

class IdeaService {
  async createIdea(data, userId) {
    // If not anonymous, set userId
    if (!data.isAnonymous) {
      data.userId = userId;
    }

    const idea = await ideaRepository.create(data);
    return idea;
  }

  async getAllIdeas(filters, pagination, user) {
    // Regular users can only see their own ideas unless they're managers/admins
    if (user.role === 'USER' && !filters.userId) {
      filters.userId = user.id;
    }

    const result = await ideaRepository.findAll(filters, pagination);
    return result;
  }

  async getIdeaById(id, user) {
    const idea = await ideaRepository.findById(id);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions: owner, or manager/admin
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view this idea');
    }

    return idea;
  }

  async updateIdea(id, data, user) {
    const idea = await ideaRepository.findById(id);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions: owner can update, or manager/admin
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to update this idea');
    }

    // Users cannot change certain fields
    if (user.role === 'USER') {
      delete data.statusId;
      delete data.userId;
    }

    const updatedIdea = await ideaRepository.update(id, data);
    return updatedIdea;
  }

  async deleteIdea(id, user) {
    const idea = await ideaRepository.findById(id);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Only owner or admin can delete
    if (user.role !== 'ADMIN' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this idea');
    }

    // Delete associated file if exists
    if (idea.metadata) {
      try {
        await fs.unlink(idea.metadata.path);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    await ideaRepository.delete(id);
    return { message: 'Idea deleted successfully' };
  }

  async updateIdeaStatus(id, statusId, user) {
    // Only managers and admins can update status
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can update idea status');
    }

    const idea = await ideaRepository.findById(id);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    const updatedIdea = await ideaRepository.updateStatus(id, statusId);
    return updatedIdea;
  }

  async uploadFiles(id, files, user) {
    const idea = await ideaRepository.findById(id);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to upload files to this idea');
    }

    if (!files || files.length === 0) {
      throw new BadRequestError('No files provided');
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileMetadata = await this.createFileMetadata(file, user.id);
      uploadedFiles.push(fileMetadata);
    }

    // Attach the first file to the idea (if metadataId is not set)
    if (!idea.metadataId && uploadedFiles.length > 0) {
      await ideaRepository.attachFile(id, uploadedFiles[0].id);
    }

    return uploadedFiles;
  }

  async createFileMetadata(file, userId) {
    const prisma = require('../../config/database');
    
    return prisma.fileMetadata.create({
      data: {
        originalName: file.originalname,
        storageName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedById: userId,
      },
    });
  }

  async addComment(ideaId, content, user) {
    const idea = await ideaRepository.findById(ideaId);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to comment on this idea');
    }

    const comment = await ideaRepository.createComment({
      ideaId,
      userId: user.id,
      content,
    });

    return comment;
  }

  async getComments(ideaId, user) {
    const idea = await ideaRepository.findById(ideaId);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view comments on this idea');
    }

    const comments = await ideaRepository.findCommentsByIdeaId(ideaId);
    return comments;
  }

  async createPlanAction(ideaId, data, user) {
    // Only managers and admins can create plan actions
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can create plan actions');
    }

    const idea = await ideaRepository.findById(ideaId);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    const planAction = await ideaRepository.createPlanAction({
      ...data,
      ideaId,
    });

    return planAction;
  }

  async getPlanActions(ideaId, user) {
    const idea = await ideaRepository.findById(ideaId);
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view plan actions for this idea');
    }

    const planActions = await ideaRepository.findPlanActionsByIdeaId(ideaId);
    return planActions;
  }

  async getIdeaStats(user) {
    const prisma = require('../../config/database');

    const where = user.role === 'USER' ? { userId: user.id } : {};

    const [total, byStatus, byCategory, byUrgency, byImpact] = await Promise.all([
      prisma.idea.count({ where }),
      prisma.idea.groupBy({
        by: ['statusId'],
        where,
        _count: true,
      }),
      prisma.idea.groupBy({
        by: ['categoryId'],
        where,
        _count: true,
      }),
      prisma.idea.groupBy({
        by: ['urgency'],
        where,
        _count: true,
      }),
      prisma.idea.groupBy({
        by: ['impact'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus,
      byCategory,
      byUrgency,
      byImpact,
    };
  }

  async likeIdea(userId, ideaId) {
    if(!userId && !ideaId) {
        throw new NotFoundError('you are not pass userId and ideaId');
      }
    return await ideaRepository.likeIdea(userId, ideaId);
  }

  async updateLike(userId, ideaId) {
    if(!userId && !ideaId) {
        throw new NotFoundError('you are not pass userId and ideaId');
      }
    return await ideaRepository.updateLike(userId, ideaId);
  }

  async scoreIdea(ideaId) {
    if(!ideaId) {
        throw new NotFoundError('you are not pass userId and ideaId');
      }
    return await ideaRepository.countLike(ideaId);
  }
}

module.exports = new IdeaService();
