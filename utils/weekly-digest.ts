import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { getWeeklyViewStats } from "./profile-views";
import { getAllRankChanges } from "./leaderboard-snapshot";
import mongoose from "mongoose";
import config from "@/config";

export interface WeeklyDigestData {
  user: {
    id: string;
    name: string;
    email: string;
    username?: string;
    notificationSettings?: {
      weeklyDigest?: boolean;
    };
  };
  profileActivity: {
    views: number;
    uniqueViewers: number;
    newLikes: number;
    followersCount: number;
    isFeaturedProfessional: boolean;
  };
  leaderboardChanges: {
    mostLiked?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    jjChampions?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    jjPodium?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    jjParticipation?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    mostLikedTeachers?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    mostLikedDJs?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    mostLikedPhotographers?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
    mostLikedProducers?: {
      current: number | null;
      previous: number | null;
      change: number;
      improved: boolean;
      isNew: boolean;
      droppedOut: boolean;
    };
  };
  friendActivity: {
    friendsWithUpcomingTrips: number;
  };
  tripActivity: {
    upcomingTripOverlaps: number;
    friendsInSameCities: Array<{
      friendName: string;
      cityName: string;
      dates: string;
    }>;
  };
}

/**
 * Get all weekly digest data for a user
 */
export async function getWeeklyDigestData(userId: string): Promise<WeeklyDigestData | null> {
  try {
    await connectMongo();

    const user = await User.findById(userId)
      .select('name email username profileViews likedBy friendRequestsReceived friends trips notificationSettings isFeaturedProfessional followers')
      .lean() as any;

    if (!user || !user.email) {
      return null;
    }

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Profile Activity
    const weeklyViews = await getWeeklyViewStats(userId);
    
    // Count new likes in the last week
    const newLikes = user.likedBy?.filter((like: any) => {
      const likedAt = like.likedAt || like.createdAt;
      return likedAt && new Date(likedAt) >= oneWeekAgo;
    }).length || 0;

    // 2. Leaderboard Changes
    const leaderboardChanges = await getAllRankChanges(userId);

    // 3. Friend Activity
    // Get friends with upcoming trips
    const friendIds = user.friends || [];
    const friendsWithTrips = await User.find({
      _id: { $in: friendIds },
      'trips.startDate': { $gte: now },
    }).countDocuments();

    // 4. Trip Overlaps
    const userUpcomingTrips = user.trips?.filter((trip: any) => 
      new Date(trip.startDate) >= now
    ) || [];

    let tripOverlaps = 0;
    const friendsInSameCities: Array<{
      friendName: string;
      cityName: string;
      dates: string;
    }> = [];

    if (userUpcomingTrips.length > 0 && friendIds.length > 0) {
      // Get friends' trips
      const friendsTrips = await User.find({
        _id: { $in: friendIds },
        'trips.startDate': { $gte: now },
      })
        .select('name trips')
        .populate('trips.city', 'name')
        .lean() as any[];

      // Find overlaps
      for (const userTrip of userUpcomingTrips) {
        const userStart = new Date(userTrip.startDate);
        const userEnd = new Date(userTrip.endDate);

        for (const friend of friendsTrips) {
          const friendTrips = friend.trips?.filter((ft: any) => 
            new Date(ft.startDate) >= now
          ) || [];

          for (const friendTrip of friendTrips) {
            const friendStart = new Date(friendTrip.startDate);
            const friendEnd = new Date(friendTrip.endDate);

            // Check if same city and overlapping dates
            const sameCityId = userTrip.city?.toString() === friendTrip.city?._id?.toString();
            const datesOverlap = userStart <= friendEnd && userEnd >= friendStart;

            if (sameCityId && datesOverlap) {
              tripOverlaps++;
              
              const cityName = friendTrip.city?.name || 'Unknown';
              const startDate = friendStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const endDate = friendEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              friendsInSameCities.push({
                friendName: friend.name,
                cityName,
                dates: `${startDate} - ${endDate}`,
              });
            }
          }
        }
      }
    }

    return {
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        username: user.username,
        notificationSettings: user.notificationSettings,
      },
      profileActivity: {
        views: weeklyViews.totalViews,
        uniqueViewers: weeklyViews.uniqueViewers,
        newLikes,
        followersCount: user.followers?.length || 0,
        isFeaturedProfessional: user.isFeaturedProfessional || false,
      },
      leaderboardChanges,
      friendActivity: {
        friendsWithUpcomingTrips: friendsWithTrips,
      },
      tripActivity: {
        upcomingTripOverlaps: tripOverlaps,
        friendsInSameCities: friendsInSameCities.slice(0, 5), // Limit to 5
      },
    };
  } catch (error) {
    console.error('Error getting weekly digest data:', error);
    return null;
  }
}

/**
 * Check if user should receive weekly digest
 */
export function shouldSendDigest(data: WeeklyDigestData): boolean {
  // Don't send if no activity at all
  const hasProfileActivity = 
    data.profileActivity.views > 0 ||
    data.profileActivity.newLikes > 0;

  const hasLeaderboardChanges = Object.values(data.leaderboardChanges).some(
    (change: any) => change?.improved || change?.isNew || change?.droppedOut
  );

  const hasFriendActivity = 
    data.friendActivity.friendsWithUpcomingTrips > 0;

  const hasTripActivity = 
    data.tripActivity.upcomingTripOverlaps > 0;

  return hasProfileActivity || hasLeaderboardChanges || hasFriendActivity || hasTripActivity;
}

/**
 * Get all active users for weekly digest
 * (users who have completed profiles and logged in within last 30 days)
 */
export async function getActiveUsersForDigest(): Promise<string[]> {
  try {
    await connectMongo();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await User.find({
      isProfileComplete: true,
      email: { $exists: true, $nin: [null, config.admin.email] }, // Exclude admin
      lastLogin: { $gte: thirtyDaysAgo },
    })
      .select('_id')
      .lean();

    return users.map((u: any) => u._id.toString());
  } catch (error) {
    console.error('Error getting active users:', error);
    return [];
  }
}

