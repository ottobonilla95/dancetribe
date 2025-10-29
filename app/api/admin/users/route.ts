import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";

// GET: Fetch all users with pagination
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongo();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const filterShared = searchParams.get("filterShared"); // "true", "false", or null (all)
    const filterProfileComplete = searchParams.get("filterProfileComplete"); // "true", "false", or null (all)

    // Build search query
    const query: any = {};
    
    // Search by name or username
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by shared status
    if (filterShared === "true") {
      query.sharedOnSocialMedia = true;
    } else if (filterShared === "false") {
      query.sharedOnSocialMedia = { $ne: true }; // false or undefined
    }

    // Filter by profile completion status
    if (filterProfileComplete === "true") {
      query.isProfileComplete = true;
    } else if (filterProfileComplete === "false") {
      query.isProfileComplete = { $ne: true }; // false or undefined
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("_id name username image sharedOnSocialMedia isProfileComplete createdAt")
        .sort({ createdAt: -1 }) // Newest users first
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

