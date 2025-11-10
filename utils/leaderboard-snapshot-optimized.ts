/**
 * OPTIMIZED version of getAllRankChanges
 * Fetches all snapshots ONCE instead of 16 queries per user
 */

import connectMongo from "@/libs/mongoose";
import LeaderboardSnapshot from "@/models/LeaderboardSnapshot";

export type LeaderboardCategory =
  | 'mostLiked'
  | 'jjChampions'
  | 'jjPodium'
  | 'jjParticipation'
  | 'mostLikedTeachers'
  | 'mostLikedDJs'
  | 'mostLikedPhotographers'
  | 'mostLikedProducers';

// Cache for snapshots - fetched ONCE and reused
let snapshotCache: {
  current: Map<LeaderboardCategory, any>;
  previous: Map<LeaderboardCategory, any>;
  lastFetch?: Date;
} | null = null;

/**
 * Fetch all snapshots ONCE and cache them
 * This reduces 16 queries per user to just 2 queries total!
 */
export async function fetchAllSnapshots() {
  await connectMongo();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const categories: LeaderboardCategory[] = [
    'mostLiked',
    'jjChampions',
    'jjPodium',
    'jjParticipation',
    'mostLikedTeachers',
    'mostLikedDJs',
    'mostLikedPhotographers',
    'mostLikedProducers'
  ];

  // Fetch all current snapshots in ONE query
  const currentSnapshots = await LeaderboardSnapshot.find({
    category: { $in: categories },
    date: { $gte: sevenDaysAgo }
  }).sort({ date: -1 }).lean();

  // Fetch all previous snapshots in ONE query
  const previousSnapshots = await LeaderboardSnapshot.find({
    category: { $in: categories },
    date: { $lt: sevenDaysAgo }
  }).sort({ date: -1 }).lean();

  // Build maps for quick lookup
  const currentMap = new Map<LeaderboardCategory, any>();
  const previousMap = new Map<LeaderboardCategory, any>();

  // Get most recent snapshot for each category
  for (const cat of categories) {
    const current = currentSnapshots.find(s => s.category === cat);
    const previous = previousSnapshots.find(s => s.category === cat);
    if (current) currentMap.set(cat, current);
    if (previous) previousMap.set(cat, previous);
  }

  snapshotCache = {
    current: currentMap,
    previous: previousMap,
    lastFetch: now,
  };

  console.log(`📸 Fetched snapshots for ${categories.length} leaderboards`);
  return snapshotCache;
}

/**
 * Get rank changes for ONE user from cached snapshots
 * NO DB queries! Just memory lookups
 */
export function getUserRankChangeFromCache(userId: string, category: LeaderboardCategory) {
  if (!snapshotCache) {
    throw new Error('Snapshots not cached! Call fetchAllSnapshots() first');
  }

  const currentSnapshot = snapshotCache.current.get(category);
  const previousSnapshot = snapshotCache.previous.get(category);

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
}

/**
 * Get all rank changes for a user from cached snapshots
 * NO DB queries! Just memory lookups
 */
export function getAllRankChangesFromCache(userId: string) {
  const categories: LeaderboardCategory[] = [
    'mostLiked',
    'jjChampions',
    'jjPodium',
    'jjParticipation',
    'mostLikedTeachers',
    'mostLikedDJs',
    'mostLikedPhotographers',
    'mostLikedProducers'
  ];

  const changes: Record<string, any> = {};

  for (const category of categories) {
    changes[category] = getUserRankChangeFromCache(userId, category);
  }

  return changes;
}

/**
 * Clear the snapshot cache
 */
export function clearSnapshotCache() {
  snapshotCache = null;
}

