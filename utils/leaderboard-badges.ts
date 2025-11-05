import connectMongo from "@/libs/mongoose";
import LeaderboardSnapshot from "@/models/LeaderboardSnapshot";
import mongoose from "mongoose";

export interface LeaderboardBadge {
  category: string;
  categoryLabel: string;
  rank: number;
  emoji: string;
  color: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  mostLiked: 'Most Liked',
  jjChampions: 'J&J Champions',
  jjPodium: 'J&J Podium',
  jjParticipation: 'J&J Participation',
  mostLikedTeachers: 'Most Liked Teachers',
  mostLikedDJs: 'Most Liked DJs',
  mostLikedPhotographers: 'Most Liked Photographers',
};

const RANK_STYLES = {
  1: { emoji: '🥇', color: 'badge-warning' },     // Gold
  2: { emoji: '🥈', color: 'badge-base-300' },    // Silver
  3: { emoji: '🥉', color: 'badge-accent' },      // Bronze
};

/**
 * Get all leaderboard badges for a user (top 3 positions only)
 */
export async function getUserLeaderboardBadges(userId: string): Promise<LeaderboardBadge[]> {
  try {
    await connectMongo();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get the most recent snapshots for all categories
    const latestSnapshots = await LeaderboardSnapshot.find({
      date: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    })
      .sort({ date: -1 })
      .lean();

    if (!latestSnapshots || latestSnapshots.length === 0) {
      return [];
    }

    // Group by category and get the most recent for each
    const latestByCategory = new Map<string, any>();
    for (const snapshot of latestSnapshots) {
      if (!latestByCategory.has(snapshot.category)) {
        latestByCategory.set(snapshot.category, snapshot);
      }
    }

    const badges: LeaderboardBadge[] = [];

    // Check each category for top 3 positions
    for (const [category, snapshot] of Array.from(latestByCategory.entries())) {
      const userRanking = snapshot.rankings.find(
        (r: any) => r.userId.toString() === userId
      );

      if (userRanking && userRanking.rank <= 3) {
        const rankStyle = RANK_STYLES[userRanking.rank as 1 | 2 | 3];
        badges.push({
          category,
          categoryLabel: CATEGORY_LABELS[category] || category,
          rank: userRanking.rank,
          emoji: rankStyle.emoji,
          color: rankStyle.color,
        });
      }
    }

    // Sort badges by rank (1st place first)
    badges.sort((a, b) => a.rank - b.rank);

    return badges;
  } catch (error) {
    console.error('Error fetching leaderboard badges:', error);
    return [];
  }
}

