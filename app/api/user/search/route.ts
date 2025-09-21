import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import DanceStyle from "@/models/DanceStyle";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    await connectMongo();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        users: [], 
        total: 0,
        message: "Query must be at least 2 characters" 
      });
    }

    // Create search conditions
    const searchConditions = {
      $and: [
        // Exclude current user
        { _id: { $ne: session.user.id } },
        // Only search users with complete profiles
        { isProfileComplete: true },
        // Search criteria
        {
          $or: [
            { username: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } },
          ]
        }
      ]
    };

    // Get total count for pagination
    const total = await User.countDocuments(searchConditions);

    // Find users with pagination
    const users = await User.find(searchConditions)
      .select("name username image city danceStyles gender nationality createdAt")
      .populate({
        path: "city",
        model: City,
        select: "name country continent"
      })
      .populate({
        path: "danceStyles.danceStyle",
        model: DanceStyle,
        select: "name"
      })
      .sort({ 
        // Prioritize exact username matches
        username: query.toLowerCase() === query ? 1 : -1,
        createdAt: -1 
      })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Format results for frontend
    const formattedUsers = users.map((user: any) => ({
      _id: user._id,
      name: user.name,
      username: user.username,
      image: user.image,
      city: user.city ? {
        name: user.city.name || '',
        country: user.city.country || '',
        continent: user.city.continent || ''
      } : null,
      danceStyles: user.danceStyles?.slice(0, 3).map((ds: any) => ({
        name: ds.danceStyle?.name,
        level: ds.level
      })) || [],
      gender: user.gender,
      nationality: user.nationality
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });

  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 