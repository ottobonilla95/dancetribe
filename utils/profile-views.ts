import User from "@/models/User";

/**
 * Get profile view count for a specific time period
 */
export async function getProfileViewCount(userId: string, daysAgo: number = 7): Promise<number> {
  try {
    const user = await User.findById(userId).select('profileViews').lean();
    if (!user || !user.profileViews) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const recentViews = user.profileViews.filter(
      (view: any) => new Date(view.viewedAt) >= cutoffDate
    );

    return recentViews.length;
  } catch (error) {
    console.error('Error getting profile view count:', error);
    return 0;
  }
}

/**
 * Get unique viewer count for a specific time period
 */
export async function getUniqueViewerCount(userId: string, daysAgo: number = 7): Promise<number> {
  try {
    const user = await User.findById(userId).select('profileViews').lean();
    if (!user || !user.profileViews) return 0;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const recentViews = user.profileViews.filter(
      (view: any) => new Date(view.viewedAt) >= cutoffDate
    );

    const uniqueViewers = new Set(
      recentViews.map((view: any) => view.viewer.toString())
    );

    return uniqueViewers.size;
  } catch (error) {
    console.error('Error getting unique viewer count:', error);
    return 0;
  }
}

/**
 * Get recent profile viewers (with user data)
 */
export async function getRecentViewers(userId: string, limit: number = 5, daysAgo: number = 7) {
  try {
    const user = await User.findById(userId)
      .select('profileViews')
      .populate({
        path: 'profileViews.viewer',
        select: 'name username image city',
        model: User,
      })
      .lean();

    if (!user || !user.profileViews) return [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const recentViews = user.profileViews
      .filter((view: any) => new Date(view.viewedAt) >= cutoffDate)
      .sort((a: any, b: any) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());

    // Get unique viewers (most recent view from each person)
    const uniqueViewers = new Map();
    recentViews.forEach((view: any) => {
      const viewerId = view.viewer?._id?.toString();
      if (viewerId && !uniqueViewers.has(viewerId)) {
        uniqueViewers.set(viewerId, view.viewer);
      }
    });

    return Array.from(uniqueViewers.values()).slice(0, limit);
  } catch (error) {
    console.error('Error getting recent viewers:', error);
    return [];
  }
}

/**
 * Get profile view stats for weekly digest
 */
export async function getWeeklyViewStats(userId: string) {
  try {
    const [viewCount, uniqueViewers, recentViewers] = await Promise.all([
      getProfileViewCount(userId, 7),
      getUniqueViewerCount(userId, 7),
      getRecentViewers(userId, 3, 7),
    ]);

    return {
      totalViews: viewCount,
      uniqueViewers,
      recentViewers,
    };
  } catch (error) {
    console.error('Error getting weekly view stats:', error);
    return {
      totalViews: 0,
      uniqueViewers: 0,
      recentViewers: [],
    };
  }
}

