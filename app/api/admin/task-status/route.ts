import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import AdminTask from "@/models/AdminTask";
import config from "@/config";

export const dynamic = "force-dynamic";

// GET /api/admin/task-status - Get last run dates for admin tasks
export async function GET() {
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

    const tasks = await AdminTask.find({})
      .sort({ lastRunAt: -1 })
      .lean();

    const tasksFormatted = tasks.map((task: any) => ({
      taskName: task.taskName,
      lastRunAt: task.lastRunAt,
      lastRunBy: task.lastRunBy,
      status: task.status,
      details: task.details,
    }));

    return NextResponse.json({
      success: true,
      tasks: tasksFormatted,
    });
  } catch (error) {
    console.error("Error fetching task status:", error);
    return NextResponse.json(
      { error: "Failed to fetch task status" },
      { status: 500 }
    );
  }
}

