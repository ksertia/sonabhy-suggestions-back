const fs = require('fs');
const fileService = require('./file.service');
const { successResponse } = require('../../utils/response');
const path = require('path');

class FileController {
  async uploadFile(req, res, next) {
    try {
      const file = await fileService.uploadFile(req.file, req.user.id);
      successResponse(res, { file }, 'File uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async uploadMultipleFiles(req, res, next) {
    try {
      const files = req.files || [];
      const uploadedFiles = await fileService.uploadMultipleFiles(files, req.user.id);
      successResponse(res, { files: uploadedFiles }, 'Files uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req, res, next) {
    try {
      const filters = {
        uploadedById: req.query.uploadedById,
        mimeType: req.query.mimeType,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };
      
      const result = await fileService.getFiles(filters, pagination, req.user);
      successResponse(res, result, 'Files retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFileById(req, res, next) {
    try {
      const file = await fileService.getFileById(req.params.id, req.user);
      successResponse(res, { file }, 'File retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getFilesByIdea(req, res, next) {
    try {
      const files = await fileService.getFilesByIdea(req.params.ideaId, req.user);
      successResponse(res, { files }, 'Files retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyFiles(req, res, next) {
    try {
      const files = await fileService.getMyFiles(req.user);
      successResponse(res, { files }, 'Your files retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async downloadFile(req, res, next) {
    try {
      const file = await fileService.downloadFile(req.params.id, req.user);
      
      // Set headers for file download
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Length', file.size);
      
      // Send file
      res.sendFile(path.resolve(file.path));
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const result = await fileService.deleteFile(req.params.id, req.user);
      successResponse(res, result, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await fileService.getStats(req.user);
      successResponse(res, { stats }, 'File statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FileController();
