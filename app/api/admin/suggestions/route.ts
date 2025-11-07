import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Suggestion from "@/models/Suggestion";
import config from "@/config";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email || session.user.email !== config.admin.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }
    if (category && category !== "all") {
      query.category = category;
    }

    // Get total count
    const total = await Suggestion.countDocuments(query);

    // Get suggestions with pagination
    const suggestions = await Suggestion.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get stats
    const stats = await Suggestion.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      pending: 0,
      "in-progress": 0,
      completed: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
    });

    return NextResponse.json({
      success: true,
      suggestions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: statusCounts,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

