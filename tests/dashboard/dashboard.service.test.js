/**
 * Dashboard Service Tests
 */

const mockPrisma = require('../mocks/prisma.mock');

// Mock dependencies
jest.mock('../../src/config/database', () => mockPrisma);

const dashboardService = require('../../src/modules/dashboard/dashboard.service');
const { ForbiddenError } = require('../../src/utils/errors');

describe('Dashboard Service', () => {
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

  describe('getOverviewStats', () => {
    it('should get overview stats successfully', async () => {
      const mockCategories = [
        { categoryId: 'cat-1', _count: { id: 10 } },
        { categoryId: 'cat-2', _count: { id: 5 } },
      ];

      const mockStatuses = [
        { statusId: 'status-1', _count: { id: 8 } },
        { statusId: 'status-2', _count: { id: 7 } },
      ];

      mockPrisma.idea.count.mockResolvedValue(15);
      mockPrisma.idea.groupBy
        .mockResolvedValueOnce(mockCategories)
        .mockResolvedValueOnce(mockStatuses);
      
      mockPrisma.category.findMany.mockResolvedValue([
        { id: 'cat-1', name: 'Category 1', color: '#blue' },
        { id: 'cat-2', name: 'Category 2', color: '#red' },
      ]);

      mockPrisma.status.findMany.mockResolvedValue([
        { id: 'status-1', name: 'Status 1', color: '#green' },
        { id: 'status-2', name: 'Status 2', color: '#yellow' },
      ]);

      // Mock other required calls
      mockPrisma.planAction.count.mockResolvedValue(10);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 60 } });

      const result = await dashboardService.getOverviewStats(mockAdmin, {});

      expect(mockPrisma.idea.count).toHaveBeenCalled();
      expect(mockPrisma.idea.groupBy).toHaveBeenCalled();
      expect(result.totalIdeas).toBe(15);
      expect(result.ideasByCategory).toHaveLength(2);
      expect(result.ideasByStatus).toHaveLength(2);
    });

    it('should restrict USER to see only their stats', async () => {
      mockPrisma.idea.count.mockResolvedValue(5);
      mockPrisma.idea.groupBy.mockResolvedValue([]);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.status.findMany.mockResolvedValue([]);
      mockPrisma.planAction.count.mockResolvedValue(0);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 0 } });

      const filters = {};
      await dashboardService.getOverviewStats(mockUser, filters);

      expect(filters.userId).toBe(mockUser.id);
    });

    it('should allow ADMIN to see all stats', async () => {
      mockPrisma.idea.count.mockResolvedValue(15);
      mockPrisma.idea.groupBy.mockResolvedValue([]);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.status.findMany.mockResolvedValue([]);
      mockPrisma.planAction.count.mockResolvedValue(0);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 0 } });

      const filters = {};
      await dashboardService.getOverviewStats(mockAdmin, filters);

      expect(filters.userId).toBeUndefined();
    });
  });

  describe('getMonthlyTrends', () => {
    it('should get monthly trends successfully', async () => {
      const mockIdeas = [
        { createdAt: new Date('2024-01-15') },
        { createdAt: new Date('2024-01-20') },
        { createdAt: new Date('2024-02-10') },
        { createdAt: new Date('2024-03-05') },
      ];

      mockPrisma.idea.findMany.mockResolvedValue(mockIdeas);

      const result = await dashboardService.getMonthlyTrends(mockAdmin, 12, {});

      expect(mockPrisma.idea.findMany).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('month');
      expect(result[0]).toHaveProperty('count');
    });

    it('should group ideas by month correctly', async () => {
      const now = new Date();
      const mockIdeas = [
        { createdAt: new Date(now.getFullYear(), now.getMonth(), 1) },
        { createdAt: new Date(now.getFullYear(), now.getMonth(), 15) },
        { createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10) },
      ];

      mockPrisma.idea.findMany.mockResolvedValue(mockIdeas);

      const result = await dashboardService.getMonthlyTrends(mockAdmin, 6, {});

      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentMonthData = result.find(r => r.month === currentMonth);
      
      expect(currentMonthData).toBeDefined();
      expect(currentMonthData.count).toBe(2);
    });
  });

  describe('getTopCategories', () => {
    it('should get top categories successfully', async () => {
      const mockCategories = [
        {
          id: 'cat-1',
          name: 'Innovation',
          description: 'Innovation ideas',
          color: '#blue',
          _count: { ideas: 15 },
        },
        {
          id: 'cat-2',
          name: 'Process',
          description: 'Process improvements',
          color: '#green',
          _count: { ideas: 10 },
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await dashboardService.getTopCategories(mockAdmin, 10, {});

      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].ideaCount).toBe(15);
      expect(result[1].ideaCount).toBe(10);
    });

    it('should limit results to specified limit', async () => {
      const mockCategories = Array.from({ length: 20 }, (_, i) => ({
        id: `cat-${i}`,
        name: `Category ${i}`,
        _count: { ideas: 20 - i },
      }));

      mockPrisma.category.findMany.mockResolvedValue(mockCategories.slice(0, 5));

      const result = await dashboardService.getTopCategories(mockAdmin, 5, {});

      expect(result).toHaveLength(5);
    });
  });

  describe('getStatusDistribution', () => {
    it('should get status distribution with percentages', async () => {
      const mockStatuses = [
        {
          id: 'status-1',
          name: 'Submitted',
          color: '#blue',
          _count: { ideas: 30 },
        },
        {
          id: 'status-2',
          name: 'Approved',
          color: '#green',
          _count: { ideas: 50 },
        },
        {
          id: 'status-3',
          name: 'Rejected',
          color: '#red',
          _count: { ideas: 20 },
        },
      ];

      mockPrisma.status.findMany.mockResolvedValue(mockStatuses);

      const result = await dashboardService.getStatusDistribution(mockAdmin, {});

      expect(result).toHaveLength(3);
      expect(result[0].count).toBe(30);
      expect(result[0].percentage).toBe(30); // 30/100 = 30%
      expect(result[1].percentage).toBe(50); // 50/100 = 50%
      expect(result[2].percentage).toBe(20); // 20/100 = 20%
    });

    it('should handle zero ideas gracefully', async () => {
      const mockStatuses = [
        {
          id: 'status-1',
          name: 'Submitted',
          color: '#blue',
          _count: { ideas: 0 },
        },
      ];

      mockPrisma.status.findMany.mockResolvedValue(mockStatuses);

      const result = await dashboardService.getStatusDistribution(mockAdmin, {});

      expect(result[0].percentage).toBe(0);
    });
  });

  describe('getPlanActionsProgress', () => {
    it('should get plan actions progress summary', async () => {
      mockPrisma.planAction.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(15) // completed
        .mockResolvedValueOnce(25) // in progress
        .mockResolvedValueOnce(10) // not started
        .mockResolvedValueOnce(5); // overdue

      mockPrisma.planAction.aggregate.mockResolvedValue({
        _avg: { progress: 60 },
      });

      const result = await dashboardService.getPlanActionsProgress(mockAdmin, {});

      expect(result.total).toBe(50);
      expect(result.completed).toBe(15);
      expect(result.inProgress).toBe(25);
      expect(result.notStarted).toBe(10);
      expect(result.overdue).toBe(5);
      expect(result.avgProgress).toBe(60);
      expect(result.completionRate).toBe(30); // 15/50 = 30%
    });

    it('should restrict USER to see only their actions', async () => {
      mockPrisma.planAction.count.mockResolvedValue(0);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 0 } });

      const filters = {};
      await dashboardService.getPlanActionsProgress(mockUser, filters);

      expect(filters.userId).toBe(mockUser.id);
    });
  });

  describe('getIdeasTransformedPercentage', () => {
    it('should calculate ideas transformed percentage', async () => {
      mockPrisma.idea.count
        .mockResolvedValueOnce(100) // total ideas
        .mockResolvedValueOnce(60); // ideas with actions

      const result = await dashboardService.getIdeasTransformedPercentage(mockAdmin, {});

      expect(result.totalIdeas).toBe(100);
      expect(result.ideasWithActions).toBe(60);
      expect(result.percentage).toBe(60);
    });

    it('should handle zero ideas gracefully', async () => {
      mockPrisma.idea.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await dashboardService.getIdeasTransformedPercentage(mockAdmin, {});

      expect(result.percentage).toBe(0);
    });
  });

  describe('getUserDashboard', () => {
    it('should get user-specific dashboard', async () => {
      mockPrisma.idea.count.mockResolvedValue(5);
      mockPrisma.planAction.count.mockResolvedValue(3);
      mockPrisma.comment.count.mockResolvedValue(10);
      mockPrisma.idea.findMany.mockResolvedValue([]);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 50 } });

      const result = await dashboardService.getUserDashboard(mockUser);

      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('recentIdeas');
      expect(result).toHaveProperty('planActionsProgress');
      expect(result).toHaveProperty('monthlyTrends');
      expect(result.stats.ideasCreated).toBe(5);
    });
  });

  describe('getAdminDashboard', () => {
    it('should get admin dashboard successfully (MANAGER)', async () => {
      // Mock all required calls
      mockPrisma.user.count.mockResolvedValue(50);
      mockPrisma.idea.count.mockResolvedValue(100);
      mockPrisma.category.count.mockResolvedValue(10);
      mockPrisma.status.count.mockResolvedValue(5);
      mockPrisma.planAction.count.mockResolvedValue(75);
      mockPrisma.comment.count.mockResolvedValue(200);
      mockPrisma.fileMetadata.count.mockResolvedValue(150);
      mockPrisma.idea.groupBy.mockResolvedValue([]);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.status.findMany.mockResolvedValue([]);
      mockPrisma.idea.findMany.mockResolvedValue([]);
      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 0 } });

      const result = await dashboardService.getAdminDashboard(mockManager);

      expect(result).toHaveProperty('overallStats');
      expect(result).toHaveProperty('overviewStats');
      expect(result).toHaveProperty('monthlyTrends');
      expect(result).toHaveProperty('topCategories');
      expect(result).toHaveProperty('ideasByRole');
      expect(result).toHaveProperty('recentIdeas');
      expect(result.overallStats.totalUsers).toBe(50);
      expect(result.overallStats.totalIdeas).toBe(100);
    });

    it('should throw error if USER tries to access admin dashboard', async () => {
      await expect(dashboardService.getAdminDashboard(mockUser)).rejects.toThrow(ForbiddenError);
    });

    it('should allow ADMIN to access admin dashboard', async () => {
      mockPrisma.user.count.mockResolvedValue(50);
      mockPrisma.idea.count.mockResolvedValue(100);
      mockPrisma.category.count.mockResolvedValue(10);
      mockPrisma.status.count.mockResolvedValue(5);
      mockPrisma.planAction.count.mockResolvedValue(75);
      mockPrisma.comment.count.mockResolvedValue(200);
      mockPrisma.fileMetadata.count.mockResolvedValue(150);
      mockPrisma.idea.groupBy.mockResolvedValue([]);
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.status.findMany.mockResolvedValue([]);
      mockPrisma.idea.findMany.mockResolvedValue([]);
      mockPrisma.user.groupBy.mockResolvedValue([]);
      mockPrisma.planAction.aggregate.mockResolvedValue({ _avg: { progress: 0 } });

      const result = await dashboardService.getAdminDashboard(mockAdmin);

      expect(result).toHaveProperty('overallStats');
    });
  });
});
