const dashboardRepository = require('./dashboard.repository');
const { ForbiddenError } = require('../../utils/errors');

class DashboardService {
  async getOverviewStats(user, filters = {}) {
    // Regular users can only see their own stats
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const [
      totalIdeas,
      ideasByCategory,
      ideasByStatus,
      ideasWithActions,
      planActionsProgress,
      topCategories,
      statusDistribution,
    ] = await Promise.all([
      dashboardRepository.getTotalIdeas(filters),
      dashboardRepository.getIdeasByCategory(filters),
      dashboardRepository.getIdeasByStatus(filters),
      dashboardRepository.getIdeasWithActions(filters),
      dashboardRepository.getPlanActionsProgress(filters),
      dashboardRepository.getTopCategories(10, filters),
      dashboardRepository.getStatusDistribution(filters),
    ]);

    // Enrich category data
    const prisma = require('../../config/database');
    const categoryDetails = await prisma.category.findMany({
      where: {
        id: {
          in: ideasByCategory.map(c => c.categoryId),
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const categoryMap = Object.fromEntries(
      categoryDetails.map(c => [c.id, c])
    );

    const enrichedCategories = ideasByCategory.map(item => ({
      categoryId: item.categoryId,
      categoryName: categoryMap[item.categoryId]?.name || 'Unknown',
      color: categoryMap[item.categoryId]?.color || '#gray',
      count: item._count.id,
    }));

    // Enrich status data
    const statusDetails = await prisma.status.findMany({
      where: {
        id: {
          in: ideasByStatus.map(s => s.statusId),
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const statusMap = Object.fromEntries(
      statusDetails.map(s => [s.id, s])
    );

    const enrichedStatuses = ideasByStatus.map(item => ({
      statusId: item.statusId,
      statusName: statusMap[item.statusId]?.name || 'Unknown',
      color: statusMap[item.statusId]?.color || '#gray',
      count: item._count.id,
    }));

    return {
      totalIdeas,
      ideasByCategory: enrichedCategories,
      ideasByStatus: enrichedStatuses,
      ideasWithActions,
      planActionsProgress,
      topCategories: topCategories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        color: c.color,
        ideaCount: c._count.ideas,
      })),
      statusDistribution,
    };
  }

  async getMonthlyTrends(user, months = 12, filters = {}) {
    // Regular users can only see their own trends
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const ideas = await dashboardRepository.getMonthlyTrends(months);

    // Group by month
    const monthlyData = {};
    const now = new Date();

    // Initialize all months
    for (let i = 0; i < months; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = 0;
    }

    // Count ideas per month
    ideas.forEach(idea => {
      const date = new Date(idea.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData.hasOwnProperty(key)) {
        monthlyData[key]++;
      }
    });

    // Convert to array and sort
    const trends = Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return trends;
  }

  async getTopCategories(user, limit = 10, filters = {}) {
    // Regular users can only see their own data
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const categories = await dashboardRepository.getTopCategories(limit, filters);

    return categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      color: c.color,
      ideaCount: c._count.ideas,
    }));
  }

  async getStatusDistribution(user, filters = {}) {
    // Regular users can only see their own data
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const distribution = await dashboardRepository.getStatusDistribution(filters);
    return distribution;
  }

  async getPlanActionsProgress(user, filters = {}) {
    // Regular users can only see their assigned actions
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const progress = await dashboardRepository.getPlanActionsProgress(filters);
    return progress;
  }

  async getIdeasTransformedPercentage(user, filters = {}) {
    // Regular users can only see their own data
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const result = await dashboardRepository.getIdeasWithActions(filters);
    return result;
  }

  async getRecentIdeas(user, limit = 5, filters = {}) {
    // Regular users can only see their own ideas
    if (user.role === 'USER') {
      filters.userId = user.id;
    }

    const ideas = await dashboardRepository.getRecentIdeas(limit, filters);
    return ideas;
  }

  async getUserDashboard(user) {
    const stats = await dashboardRepository.getUserStats(user.id);
    const recentIdeas = await dashboardRepository.getRecentIdeas(5, { userId: user.id });
    const planActionsProgress = await dashboardRepository.getPlanActionsProgress({ userId: user.id });
    const monthlyTrends = await this.getMonthlyTrends(user, 6, { userId: user.id });

    return {
      stats,
      recentIdeas,
      planActionsProgress,
      monthlyTrends,
    };
  }

  async getAdminDashboard(user) {
    // Only admins and managers can access
    if (user.role === 'USER') {
      throw new ForbiddenError('Only managers and admins can access admin dashboard');
    }

    const [
      overallStats,
      overviewStats,
      monthlyTrends,
      topCategories,
      ideasByRole,
      recentIdeas,
    ] = await Promise.all([
      dashboardRepository.getOverallStats(),
      this.getOverviewStats(user),
      this.getMonthlyTrends(user, 12),
      this.getTopCategories(user, 10),
      dashboardRepository.getIdeasByUserRole(),
      dashboardRepository.getRecentIdeas(10),
    ]);

    return {
      overallStats,
      overviewStats,
      monthlyTrends,
      topCategories,
      ideasByRole,
      recentIdeas,
    };
  }
}

module.exports = new DashboardService();
