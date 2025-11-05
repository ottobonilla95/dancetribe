import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Admin-only endpoint
    if (!session || session.user?.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 403 }
      );
    }

    await connectMongo();

    const { task } = await req.json();

    let result;

    switch (task) {
      case "old-trips": {
        // Delete trips that ended 30+ days ago
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        result = await User.updateMany(
          { "trips.endDate": { $lt: cutoffDate } },
          { $pull: { trips: { endDate: { $lt: cutoffDate } } } }
        );

        return NextResponse.json({
          success: true,
          task: "old-trips",
          message: `Cleaned up old trips`,
          usersAffected: result.modifiedCount,
        });
      }

      // Removed: old-profile-views task
      // Profile views are already auto-cleaned by $slice: -100 in the profile-view API

      case "orphaned-friend-requests": {
        // Remove friend requests where the other user no longer exists
        const allUsers = await User.find({}).select("_id").lean();
        const validUserIds = new Set(allUsers.map((u: any) => u._id.toString()));

        // Clean up friendRequestsSent
        const sentResult = await User.updateMany(
          {},
          {
            $pull: {
              friendRequestsSent: {
                user: { $nin: Array.from(validUserIds) },
              },
            },
          }
        );

        // Clean up friendRequestsReceived
        const receivedResult = await User.updateMany(
          {},
          {
            $pull: {
              friendRequestsReceived: {
                user: { $nin: Array.from(validUserIds) },
              },
            },
          }
        );

        return NextResponse.json({
          success: true,
          task: "orphaned-friend-requests",
          message: `Cleaned up orphaned friend requests`,
          usersAffected: sentResult.modifiedCount + receivedResult.modifiedCount,
        });
      }

      case "all": {
        // Run all cleanup tasks
        const results = [];

        // 1. Old trips
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        const tripsResult = await User.updateMany(
          { "trips.endDate": { $lt: cutoffDate } },
          { $pull: { trips: { endDate: { $lt: cutoffDate } } } }
        );
        results.push({ task: "old-trips", affected: tripsResult.modifiedCount });

        // 2. Profile views - Skipped (auto-cleaned by $slice in API)

        // 3. Orphaned requests
        const allUsers = await User.find({}).select("_id").lean();
        const validUserIds = allUsers.map((u: any) => u._id.toString());
        const sentResult = await User.updateMany(
          {},
          {
            $pull: {
              friendRequestsSent: {
                user: { $nin: validUserIds },
              },
            },
          }
        );
        const receivedResult = await User.updateMany(
          {},
          {
            $pull: {
              friendRequestsReceived: {
                user: { $nin: validUserIds },
              },
            },
          }
        );
        results.push({
          task: "orphaned-friend-requests",
          affected: sentResult.modifiedCount + receivedResult.modifiedCount,
        });

        return NextResponse.json({
          success: true,
          task: "all",
          message: "Ran all cleanup tasks",
          results,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid cleanup task" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to run cleanup task" },
      { status: 500 }
    );
  }
}

