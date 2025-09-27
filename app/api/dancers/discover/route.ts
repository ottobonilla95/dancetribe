import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import DanceStyle from "@/models/DanceStyle";
import City from "@/models/City";
import Country from "@/models/Country";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    const { searchParams } = new URL(req.url);
    const danceStyle = searchParams.get("danceStyle");
    const danceRole = searchParams.get("danceRole");
    const city = searchParams.get("city");
    const nearMe = searchParams.get("nearMe") === "true";
    const inMyCountry = searchParams.get("inMyCountry") === "true";
    const limit = parseInt(searchParams.get("limit") || "16");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Get current user's info for smart filtering
    const currentUser = await User.findById(session.user.id).select("city danceStyles");

    // Build the query
    const query: any = {
      _id: { $ne: session.user.id }, // Exclude current user
      isProfileComplete: true, // Only show completed profiles
    };

    // Location filtering
    if (nearMe && currentUser?.city && !city) {
      query.city = currentUser.city; // ONLY same city
    } else if (inMyCountry && currentUser?.city && !city) {
      // Find all cities in user's country
      const userCityWithCountry = await City.findById(currentUser.city).populate('country');
      if (userCityWithCountry?.country) {
        const citiesInCountry = await City.find({ 
          country: userCityWithCountry.country._id 
        }).select('_id');
        query.city = { $in: citiesInCountry.map(c => c._id) };
      }
    }
    // Filter by dance role
    if (danceRole && danceRole !== "all") {
      query.danceRole = danceRole;
    }

    // Filter by city (case-insensitive search)
    if (city && city.trim()) {
      const cityRegex = new RegExp(city.trim(), "i");
      
      // Find cities that match the search
      const matchingCities = await City.find({
        name: cityRegex
      }).select("_id");
      
      if (matchingCities.length > 0) {
        query.city = { $in: matchingCities.map(c => c._id) };
      } else {
        // No matching cities found, return empty result
        return NextResponse.json({
          success: true,
          dancers: [],
          total: 0,
          hasMore: false
        });
      }
    }

    // Get all dance styles for filtering
    const allDanceStyles = await DanceStyle.find({ isActive: true });
    const danceStyleMap = new Map(allDanceStyles.map(ds => [ds._id.toString(), ds.name]));

    // Smart sorting based on context
    let sortCriteria: any;
    if (nearMe || (!danceStyle && !danceRole && !city)) {
      // For "near me" or default view: prioritize engagement and recency
      sortCriteria = { 
        updatedAt: -1,  // Recently active users first
        createdAt: -1   // Then newest users
      };
    } else {
      // For filtered views: prioritize most liked/popular
      sortCriteria = { createdAt: -1 };
    }

    // Base query to get users
    let usersQuery = User.find(query)
      .populate({
        path: "city",
        model: City,
        populate: {
          path: "country",
          model: Country,
          select: "name code"
        }
      })
      .select("-email -friendRequestsSent -friendRequestsReceived -friends")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    let users = await usersQuery.lean();

    // Filter by dance style if specified
    if (danceStyle && danceStyle !== "all") {
      // Find the dance style ID
      const targetDanceStyle = allDanceStyles.find(ds => 
        ds.name.toLowerCase() === danceStyle.toLowerCase()
      );
      
      if (targetDanceStyle) {
        users = users.filter(user => 
          user.danceStyles?.some((userStyle: any) => 
            userStyle.danceStyle.toString() === targetDanceStyle._id.toString()
          )
        );
      } else {
        users = [];
      }
    }

    // Transform the data and populate dance styles
    const transformedUsers = users.map((user: any) => {
      // Map dance style IDs to names
      const danceStylesPopulated = user.danceStyles?.map((userStyle: any) => ({
        name: danceStyleMap.get(userStyle.danceStyle.toString()) || "Unknown",
        level: userStyle.level,
        _id: userStyle.danceStyle
      })) || [];

      return {
        ...user,
        _id: user._id.toString(),
        city: user.city ? {
          ...user.city,
          _id: user.city._id.toString(),
          country: user.city.country ? {
            ...user.city.country,
            _id: user.city.country._id?.toString()
          } : null
        } : null,
        danceStylesPopulated,
        likedBy: user.likedBy || []
      };
    });

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const hasMore = skip + users.length < total;

    return NextResponse.json({
      success: true,
      dancers: transformedUsers,
      total,
      hasMore,
      pagination: {
        limit,
        skip,
        total
      }
    });

  } catch (error) {
    console.error("Error in discover API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 