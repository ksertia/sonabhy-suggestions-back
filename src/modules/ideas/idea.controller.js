const ideaService = require('./idea.service');
const { successResponse } = require('../../utils/response');

class IdeaController {
  async createIdea(req, res, next) {
    try {
      const idea = await ideaService.createIdea(req.body);
      successResponse(res, { idea }, 'Idea created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllIdeas(req, res, next) {
    try {
      const filters = {
        formVariantId: req.query.formVariantId,
        userId: req.query.userId,
        isAnonymous: req.query.isAnonymous,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await ideaService.getAllIdeas(filters, pagination);
      successResponse(res, result, 'Ideas retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getIdeaById(req, res, next) {
    try {
      const idea = await ideaService.getIdeaById(req.params.id, req.user);
      successResponse(res, { idea }, 'Idea retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateIdea(req, res, next) {
    try {
      const idea = await ideaService.updateIdea(req.params.id, req.body, req.user);
      successResponse(res, { idea }, 'Idea updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteIdea(req, res, next) {
    try {
      const result = await ideaService.deleteIdea(req.params.id, req.user);
      successResponse(res, result, 'Idea deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const idea = await ideaService.updateIdeaStatus(req.params.id, req.body.status, req.user);
      successResponse(res, { idea }, 'Idea status updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async uploadFiles(req, res, next) {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      const uploadedFiles = await ideaService.uploadFiles(req.params.id, files, req.user);
      successResponse(res, { files: uploadedFiles }, 'Files uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async addComment(req, res, next) {
    try {
      const comment = await ideaService.addComment(req.params.id, req.body.content, req.user);
      successResponse(res, { comment }, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const comments = await ideaService.getComments(req.params.id, req.user);
      successResponse(res, { comments }, 'Comments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createPlanAction(req, res, next) {
    try {
      const planAction = await ideaService.createPlanAction(req.params.id, req.body, req.user);
      successResponse(res, { planAction }, 'Plan action created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getPlanActions(req, res, next) {
    try {
      const planActions = await ideaService.getPlanActions(req.params.id, req.user);
      successResponse(res, { planActions }, 'Plan actions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await ideaService.getIdeaStats(req.user);
      successResponse(res, { stats }, 'Idea statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async like(req, res, next) {
    try {
      const userId = req.params.userId;
      const ideaId = req.params.ideaId;

      const like = await ideaService.likeIdea(userId, ideaId);
      successResponse(res, { like }, "like succeful");
    }catch (error) {
      next(error);
    }
  }

  async updateLike(req, res, next) {
    try {
      const userId = req.params.userId;
      const ideaId = req.params.ideaId;

      const like = await ideaService.updateLike(userId, ideaId);
      successResponse(res, { like }, "like update");
    }catch (error) {
      next(error);
    }
  }

  async score(req, res, next) {
    try {
      const ideaId = req.params.ideaId;

      const count = await ideaService.scoreIdea(ideaId);
      successResponse(res, { count }, "like succeful");
    }catch (error) {
      next(error);
    }
  }

}

module.exports = new IdeaController();
