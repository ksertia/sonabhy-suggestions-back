const fs = require('fs').promises;
const path = require('path');
const fileRepository = require('./file.repository');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');

class FileService {
  async uploadFile(file, userId, ideaId = null) {
    if (!file) {
      throw new BadRequestError('No file provided');
    }

    const fileData = {
      originalName: file.originalname,
      storageName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      uploadedById: userId,
    };

    const savedFile = await fileRepository.create(fileData);
    return savedFile;
  }

  async uploadMultipleFiles(files, userId, ideaId = null) {
    if (!files || files.length === 0) {
      throw new BadRequestError('No files provided');
    }

    const uploadedFiles = [];

    for (const file of files) {
      const fileData = {
        originalName: file.originalname,
        storageName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        uploadedById: userId,
      };

      const savedFile = await fileRepository.create(fileData);
      uploadedFiles.push(savedFile);
    }

    return uploadedFiles;
  }

  async getFiles(filters, pagination, user) {
    // Regular users can only see their own files
    if (user.role === 'USER') {
      filters.uploadedById = user.id;
    }

    const result = await fileRepository.findAll(filters, pagination);
    return result;
  }

  async getFileById(id, user) {
    const file = await fileRepository.findById(id);
    
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Check permissions: owner, or manager/admin
    if (user.role === 'USER' && file.uploadedById !== user.id) {
      throw new ForbiddenError('You do not have permission to access this file');
    }

    return file;
  }

  async getFilesByIdea(ideaId, user) {
    const prisma = require('../../config/database');
    const idea = await prisma.idea.findUnique({ where: { id: ideaId } });
    
    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Check permissions
    if (user.role === 'USER' && idea.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view files for this idea');
    }

    const files = await fileRepository.findByIdeaId(ideaId);
    return files;
  }

  async getMyFiles(user) {
    const files = await fileRepository.findByUserId(user.id);
    return files;
  }

  async downloadFile(id, user) {
    const file = await fileRepository.findById(id);
    
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Check permissions: owner, or manager/admin
    if (user.role === 'USER' && file.uploadedById !== user.id) {
      throw new ForbiddenError('You do not have permission to download this file');
    }

    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch (error) {
      throw new NotFoundError('File not found on disk');
    }

    return file;
  }

  async deleteFile(id, user) {
    const file = await fileRepository.findById(id);
    
    if (!file) {
      throw new NotFoundError('File not found');
    }

    // Check permissions: owner or admin
    if (user.role !== 'ADMIN' && file.uploadedById !== user.id) {
      throw new ForbiddenError('You do not have permission to delete this file');
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Error deleting physical file:', error);
      // Continue with database deletion even if physical file deletion fails
    }

    // Delete from database
    await fileRepository.delete(id);
    
    return { message: 'File deleted successfully' };
  }

  async getStats(user) {
    const userId = user.role === 'USER' ? user.id : null;
    const stats = await fileRepository.getStats(userId);
    return stats;
  }
}

module.exports = new FileService();
