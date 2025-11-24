/**
 * Idea Service Tests
 */

const mockPrisma = require('../mocks/prisma.mock');

// Mock dependencies
jest.mock('../../src/config/database', () => mockPrisma);

const ideaService = require('../../src/modules/ideas/idea.service');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../src/utils/errors');

describe('Idea Service', () => {
  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    firstname: 'John',
    lastname: 'Doe',
    role: 'USER',
  };

  const mockAdmin = {
    id: 'admin-id',
    email: 'admin@example.com',
    firstname: 'Admin',
    lastname: 'User',
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.resetMocks();
  });

  describe('createIdea', () => {
    const ideaData = {
      title: 'Test Idea',
      description: 'Test Description',
      categoryId: 'category-id',
      statusId: 'status-id',
    };

    it('should create idea successfully', async () => {
      const mockIdea = {
        id: 'idea-id',
        ...ideaData,
        userId: mockUser.id,
        createdAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue({ id: ideaData.categoryId });
      mockPrisma.status.findUnique.mockResolvedValue({ id: ideaData.statusId });
      mockPrisma.idea.create.mockResolvedValue(mockIdea);

      const result = await ideaService.createIdea(ideaData, mockUser);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: ideaData.categoryId },
      });
      expect(mockPrisma.status.findUnique).toHaveBeenCalledWith({
        where: { id: ideaData.statusId },
      });
      expect(mockPrisma.idea.create).toHaveBeenCalled();
      expect(result).toEqual(mockIdea);
    });

    it('should throw error if category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(ideaService.createIdea(ideaData, mockUser)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if status not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue({ id: ideaData.categoryId });
      mockPrisma.status.findUnique.mockResolvedValue(null);

      await expect(ideaService.createIdea(ideaData, mockUser)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllIdeas', () => {
    it('should get all ideas with pagination', async () => {
      const mockIdeas = [
        { id: 'idea-1', title: 'Idea 1', userId: mockUser.id },
        { id: 'idea-2', title: 'Idea 2', userId: mockUser.id },
      ];

      mockPrisma.idea.findMany.mockResolvedValue(mockIdeas);
      mockPrisma.idea.count.mockResolvedValue(2);

      const result = await ideaService.getAllIdeas({}, { page: 1, limit: 10 }, mockUser);

      expect(mockPrisma.idea.findMany).toHaveBeenCalled();
      expect(mockPrisma.idea.count).toHaveBeenCalled();
      expect(result.ideas).toEqual(mockIdeas);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter ideas by category', async () => {
      const filters = { categoryId: 'category-id' };
      mockPrisma.idea.findMany.mockResolvedValue([]);
      mockPrisma.idea.count.mockResolvedValue(0);

      await ideaService.getAllIdeas(filters, { page: 1, limit: 10 }, mockUser);

      expect(mockPrisma.idea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: filters.categoryId }),
        })
      );
    });

    it('should restrict USER role to see only their ideas', async () => {
      mockPrisma.idea.findMany.mockResolvedValue([]);
      mockPrisma.idea.count.mockResolvedValue(0);

      await ideaService.getAllIdeas({}, { page: 1, limit: 10 }, mockUser);

      expect(mockPrisma.idea.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: mockUser.id }),
        })
      );
    });

    it('should allow ADMIN to see all ideas', async () => {
      mockPrisma.idea.findMany.mockResolvedValue([]);
      mockPrisma.idea.count.mockResolvedValue(0);

      await ideaService.getAllIdeas({}, { page: 1, limit: 10 }, mockAdmin);

      expect(mockPrisma.idea.findMany).toHaveBeenCalledWith(
        expect.not.objectContaining({
          where: expect.objectContaining({ userId: expect.anything() }),
        })
      );
    });
  });

  describe('getIdeaById', () => {
    it('should get idea by id successfully', async () => {
      const mockIdea = {
        id: 'idea-id',
        title: 'Test Idea',
        userId: mockUser.id,
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      const result = await ideaService.getIdeaById('idea-id', mockUser);

      expect(mockPrisma.idea.findUnique).toHaveBeenCalledWith({
        where: { id: 'idea-id' },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockIdea);
    });

    it('should throw error if idea not found', async () => {
      mockPrisma.idea.findUnique.mockResolvedValue(null);

      await expect(ideaService.getIdeaById('non-existent-id', mockUser)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if USER tries to access others idea', async () => {
      const mockIdea = {
        id: 'idea-id',
        title: 'Test Idea',
        userId: 'other-user-id',
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      await expect(ideaService.getIdeaById('idea-id', mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should allow ADMIN to access any idea', async () => {
      const mockIdea = {
        id: 'idea-id',
        title: 'Test Idea',
        userId: 'other-user-id',
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      const result = await ideaService.getIdeaById('idea-id', mockAdmin);

      expect(result).toEqual(mockIdea);
    });
  });

  describe('updateIdea', () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    it('should update idea successfully', async () => {
      const mockIdea = {
        id: 'idea-id',
        title: 'Original Title',
        userId: mockUser.id,
      };

      const updatedIdea = {
        ...mockIdea,
        ...updateData,
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);
      mockPrisma.idea.update.mockResolvedValue(updatedIdea);

      const result = await ideaService.updateIdea('idea-id', updateData, mockUser);

      expect(mockPrisma.idea.update).toHaveBeenCalledWith({
        where: { id: 'idea-id' },
        data: updateData,
        include: expect.any(Object),
      });
      expect(result).toEqual(updatedIdea);
    });

    it('should throw error if USER tries to update others idea', async () => {
      const mockIdea = {
        id: 'idea-id',
        userId: 'other-user-id',
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      await expect(ideaService.updateIdea('idea-id', updateData, mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should restrict USER from updating certain fields', async () => {
      const mockIdea = {
        id: 'idea-id',
        userId: mockUser.id,
      };

      const restrictedUpdate = {
        statusId: 'new-status-id',
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      await expect(ideaService.updateIdea('idea-id', restrictedUpdate, mockUser)).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteIdea', () => {
    it('should delete idea successfully', async () => {
      const mockIdea = {
        id: 'idea-id',
        userId: mockUser.id,
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);
      mockPrisma.idea.delete.mockResolvedValue(mockIdea);

      const result = await ideaService.deleteIdea('idea-id', mockUser);

      expect(mockPrisma.idea.delete).toHaveBeenCalledWith({
        where: { id: 'idea-id' },
      });
      expect(result.message).toBe('Idea deleted successfully');
    });

    it('should throw error if USER tries to delete others idea', async () => {
      const mockIdea = {
        id: 'idea-id',
        userId: 'other-user-id',
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      await expect(ideaService.deleteIdea('idea-id', mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should allow ADMIN to delete any idea', async () => {
      const mockIdea = {
        id: 'idea-id',
        userId: 'other-user-id',
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);
      mockPrisma.idea.delete.mockResolvedValue(mockIdea);

      const result = await ideaService.deleteIdea('idea-id', mockAdmin);

      expect(result.message).toBe('Idea deleted successfully');
    });
  });

  describe('changeIdeaStatus', () => {
    it('should change idea status successfully (MANAGER)', async () => {
      const mockManager = { ...mockUser, role: 'MANAGER' };
      const mockIdea = {
        id: 'idea-id',
        statusId: 'old-status-id',
        userId: 'other-user-id',
      };

      const newStatusId = 'new-status-id';

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);
      mockPrisma.status.findUnique.mockResolvedValue({ id: newStatusId });
      mockPrisma.idea.update.mockResolvedValue({ ...mockIdea, statusId: newStatusId });

      const result = await ideaService.changeIdeaStatus('idea-id', newStatusId, mockManager);

      expect(mockPrisma.idea.update).toHaveBeenCalledWith({
        where: { id: 'idea-id' },
        data: { statusId: newStatusId },
        include: expect.any(Object),
      });
      expect(result.statusId).toBe(newStatusId);
    });

    it('should throw error if USER tries to change status', async () => {
      const mockIdea = {
        id: 'idea-id',
        statusId: 'old-status-id',
        userId: mockUser.id,
      };

      mockPrisma.idea.findUnique.mockResolvedValue(mockIdea);

      await expect(ideaService.changeIdeaStatus('idea-id', 'new-status-id', mockUser)).rejects.toThrow(ForbiddenError);
    });
  });
});
