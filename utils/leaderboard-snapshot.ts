import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import LeaderboardSnapshot from "@/models/LeaderboardSnapshot";
import mongoose from "mongoose";
import config from "@/config";

export type LeaderboardCategory =
  | 'mostLiked'
  | 'jjChampions'
  | 'jjPodium'
  | 'jjParticipation'
  | 'mostLikedTeachers'
  | 'mostLikedDJs'
  | 'mostLikedPhotographers';

interface RankingEntry {
  userId: mongoose.Types.ObjectId;
  rank: number;
  score: number;
}

/**
 * Calculate rankings for a specific leaderboard category
 */
export async function calculateRankings(category: LeaderboardCategory): Promise<RankingEntry[]> {
  await connectMongo();

  // Admin is included in leaderboards
  const adminId: any = null;

  let aggregationPipeline: any[] = [];

  switch (category) {
    case 'mostLiked':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true,
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$likedBy", []] } }
          }
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $sort: { likesCount: -1 } },
        { $limit: 100 }, // Top 100 for snapshot
        {
          $project: {
            _id: 1,
            likesCount: 1
          }
        }
      ];
      break;

    case 'jjChampions':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true, 
            jackAndJillCompetitions: { $exists: true, $ne: [] },
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            firstPlaces: {
              $size: {
                $filter: {
                  input: "$jackAndJillCompetitions",
                  as: "comp",
                  cond: { $eq: ["$$comp.placement", "1st"] }
                }
              }
            }
          }
        },
        { $match: { firstPlaces: { $gt: 0 } } },
        { $sort: { firstPlaces: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            firstPlaces: 1
          }
        }
      ];
      break;

    case 'jjPodium':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true, 
            jackAndJillCompetitions: { $exists: true, $ne: [] },
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            podiumFinishes: {
              $size: {
                $filter: {
                  input: "$jackAndJillCompetitions",
                  as: "comp",
                  cond: { $in: ["$$comp.placement", ["1st", "2nd", "3rd"]] }
                }
              }
            }
          }
        },
        { $match: { podiumFinishes: { $gt: 0 } } },
        { $sort: { podiumFinishes: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            podiumFinishes: 1
          }
        }
      ];
      break;

    case 'jjParticipation':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true, 
            jackAndJillCompetitions: { $exists: true, $ne: [] },
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            competitionsCount: { $size: "$jackAndJillCompetitions" }
          }
        },
        { $match: { competitionsCount: { $gt: 0 } } },
        { $sort: { competitionsCount: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            competitionsCount: 1
          }
        }
      ];
      break;

    case 'mostLikedTeachers':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true,
            isTeacher: true,
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$likedBy", []] } }
          }
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $sort: { likesCount: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            likesCount: 1
          }
        }
      ];
      break;

    case 'mostLikedDJs':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true,
            isDJ: true,
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$likedBy", []] } }
          }
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $sort: { likesCount: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            likesCount: 1
          }
        }
      ];
      break;

    case 'mostLikedPhotographers':
      aggregationPipeline = [
        { 
          $match: { 
            isProfileComplete: true,
            isPhotographer: true,
            ...(adminId && { _id: { $ne: adminId } })
          } 
        },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ["$likedBy", []] } }
          }
        },
        { $match: { likesCount: { $gt: 0 } } },
        { $sort: { likesCount: -1 } },
        { $limit: 100 },
        {
          $project: {
            _id: 1,
            likesCount: 1
          }
        }
      ];
      break;

    default:
      throw new Error(`Unknown leaderboard category: ${category}`);
  }

  const results = await User.aggregate(aggregationPipeline);

  // Convert to RankingEntry format with ranks
  return results.map((result, index) => {
    const scoreField = 
      category === 'mostLiked' || category === 'mostLikedTeachers' || category === 'mostLikedDJs' || category === 'mostLikedPhotographers'
        ? 'likesCount'
        : category === 'jjChampions'
        ? 'firstPlaces'
        : category === 'jjPodium'
        ? 'podiumFinishes'
        : 'competitionsCount';

    return {
      userId: result._id,
      rank: index + 1,
      score: result[scoreField]
    };
  });
}

/**
 * Snapshot all leaderboard categories
 * Uses upsert to prevent duplicate snapshots on the same day
 */
export async function snapshotAllLeaderboards(): Promise<{ success: boolean; snapshots: number; error?: string }> {
  try {
    await connectMongo();

    const categories: LeaderboardCategory[] = [
      'mostLiked',
      'jjChampions',
      'jjPodium',
      'jjParticipation',
      'mostLikedTeachers',
      'mostLikedDJs',
      'mostLikedPhotographers'
    ];

    let snapshotsCreated = 0;
    const now = new Date();
    
    // Get start and end of today for deduplication
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    for (const category of categories) {
      const rankings = await calculateRankings(category);

      if (rankings.length > 0) {
        // Use updateOne with upsert to prevent duplicates on the same day
        const result = await LeaderboardSnapshot.updateOne(
          {
            category,
            date: { $gte: startOfDay, $lte: endOfDay }
          },
          {
            $set: {
              date: now,
              category,
              rankings
            }
          },
          { upsert: true }
        );
        
        // Count as created if it was a new snapshot or updated
        if (result.upsertedCount > 0 || result.modifiedCount > 0) {
          snapshotsCreated++;
        }
      }
    }

    return { success: true, snapshots: snapshotsCreated };
  } catch (error: any) {
    console.error('Error snapshotting leaderboards:', error);
    return { success: false, snapshots: 0, error: error.message };
  }
}

/**
 * Get user's rank change for a specific category
 */
export async function getUserRankChange(userId: string, category: LeaderboardCategory) {
  await connectMongo();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Get this week's snapshot (most recent)
    const currentSnapshot = await LeaderboardSnapshot.findOne({
      category,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).lean() as any;

    // Get last week's snapshot (before 7 days ago)
    const previousSnapshot = await LeaderboardSnapshot.findOne({
      category,
      date: { $lt: sevenDaysAgo }
    }).sort({ date: -1 }).lean() as any;

    const currentRank = currentSnapshot?.rankings?.find(
      (r: any) => r.userId.toString() === userId
    )?.rank;

    const previousRank = previousSnapshot?.rankings?.find(
      (r: any) => r.userId.toString() === userId
    )?.rank;

    const currentScore = currentSnapshot?.rankings?.find(
      (r: any) => r.userId.toString() === userId
    )?.score;

    return {
      current: currentRank || null,
      previous: previousRank || null,
      score: currentScore || null,
      change: currentRank && previousRank ? previousRank - currentRank : 0,
      improved: currentRank && previousRank ? currentRank < previousRank : false,
      isNew: currentRank && !previousRank,
      droppedOut: !currentRank && previousRank
    };
  } catch (error) {
    console.error('Error getting rank change:', error);
    return {
      current: null,
      previous: null,
      score: null,
      change: 0,
      improved: false,
      isNew: false,
      droppedOut: false
    };
  }
}

/**
 * Get all rank changes for a user across all categories
 */
export async function getAllRankChanges(userId: string) {
  const categories: LeaderboardCategory[] = [
    'mostLiked',
    'jjChampions',
    'jjPodium',
    'jjParticipation',
    'mostLikedTeachers',
    'mostLikedDJs',
    'mostLikedPhotographers'
  ];

  const changes: Record<string, any> = {};

  for (const category of categories) {
    changes[category] = await getUserRankChange(userId, category);
  }

  return changes;
}

/**
 * Clean up old snapshots (keep last 12 weeks)
 */
export async function cleanupOldSnapshots(): Promise<{ success: boolean; deleted: number; error?: string }> {
  try {
    await connectMongo();

    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const result = await LeaderboardSnapshot.deleteMany({
      date: { $lt: twelveWeeksAgo }
    });

    return { success: true, deleted: result.deletedCount || 0 };
  } catch (error: any) {
    console.error('Error cleaning up old snapshots:', error);
    return { success: false, deleted: 0, error: error.message };
  }
}

