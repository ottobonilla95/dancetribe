import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { snapshotAllLeaderboards } from "@/utils/leaderboard-snapshot";
import connectMongo from "@/libs/mongoose";
import AdminTask from "@/models/AdminTask";
import config from "@/config";

/**
 * POST /api/admin/snapshot-leaderboards
 * 
 * Manually trigger a snapshot of all leaderboard rankings.
 * This should typically be run weekly via a cron job.
 * 
 * Admin-only endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin permission
    if (session.user.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Snapshot all leaderboards
    const result = await snapshotAllLeaderboards();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to snapshot leaderboards" },
        { status: 500 }
      );
    }

    // Track last run in AdminTask
    await connectMongo();
    await AdminTask.findOneAndUpdate(
      { taskName: "snapshot-leaderboards" },
      {
        taskName: "snapshot-leaderboards",
        lastRunAt: new Date(),
        lastRunBy: session.user.email,
        status: "success",
        details: {
          snapshots: result.snapshots,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Successfully created ${result.snapshots} leaderboard snapshots`,
      snapshots: result.snapshots,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Error in snapshot-leaderboards API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

