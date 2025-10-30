import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectMongo();

    // Get current user to exclude them
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id ? new mongoose.Types.ObjectId(session.user.id) : null;

    // 1. Most Liked Dancers (Global) - Exclude current user
    const mostLikedDancers = await User.aggregate([
      { 
        $match: { 
          isProfileComplete: true,
          ...(currentUserId ? { _id: { $ne: currentUserId } } : {})
        } 
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likedBy", []] } }
        }
      },
      { $match: { likesCount: { $gt: 0 } } },
      { $sort: { likesCount: -1 } },
      { $limit: 50 },
      {
        $project: {
          name: 1,
          username: 1,
          image: 1,
          likesCount: 1
        }
      }
    ]);

    // 2. J&J Champions (Most 1st places) - Exclude current user
    const jjChampions = await User.aggregate([
      { $match: { 
        isProfileComplete: true, 
        jackAndJillCompetitions: { $exists: true, $ne: [] },
        ...(currentUserId ? { _id: { $ne: currentUserId } } : {})
      } },
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
      { $limit: 50 },
      {
        $project: {
          name: 1,
          username: 1,
          image: 1,
          firstPlaces: 1
        }
      }
    ]);

    // 3. Top Teachers (Most liked teachers) - Exclude current user
    const topTeachers = await User.aggregate([
      { 
        $match: { 
          isProfileComplete: true,
          isTeacher: true,
          ...(currentUserId ? { _id: { $ne: currentUserId } } : {})
        } 
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likedBy", []] } }
        }
      },
      { $match: { likesCount: { $gt: 0 } } },
      { $sort: { likesCount: -1 } },
      { $limit: 50 },
      {
        $project: {
          name: 1,
          username: 1,
          image: 1,
          likesCount: 1
        }
      }
    ]);

    // 4. Top DJs (Most liked DJs) - Exclude current user
    const topDJs = await User.aggregate([
      { 
        $match: { 
          isProfileComplete: true,
          isDJ: true,
          ...(currentUserId ? { _id: { $ne: currentUserId } } : {})
        } 
      },
      {
        $addFields: {
          likesCount: { $size: { $ifNull: ["$likedBy", []] } }
        }
      },
      { $match: { likesCount: { $gt: 0 } } },
      { $sort: { likesCount: -1 } },
      { $limit: 50 },
      {
        $project: {
          name: 1,
          username: 1,
          image: 1,
          likesCount: 1
        }
      }
    ]);

    return NextResponse.json({
      mostLiked: mostLikedDancers,
      jjChampions,
      topTeachers,
      topDJs,
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboards' }, { status: 500 });
  }
}

