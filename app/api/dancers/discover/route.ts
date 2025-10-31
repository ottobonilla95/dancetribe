import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import DanceStyle from "@/models/DanceStyle";
import City from "@/models/City";
import Country from "@/models/Country";
import { createAccentInsensitivePattern } from "@/utils/search";

export const dynamic = 'force-dynamic';

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
    const danceLevel = searchParams.get("danceLevel");
    const city = searchParams.get("city");
    const pickCityId = searchParams.get("pickCityId"); // Specific city ID
    const pickCountryId = searchParams.get("pickCountryId"); // Specific country ID
    const nearMe = searchParams.get("nearMe") === "true";
    const inMyCountry = searchParams.get("inMyCountry") === "true";
    const showTravelers = searchParams.get("showTravelers") === "true";
    const lookingForPractice = searchParams.get("lookingForPractice") === "true";
    const isTeacher = searchParams.get("isTeacher") === "true";
    const isDJ = searchParams.get("isDJ") === "true";
    const isPhotographer = searchParams.get("isPhotographer") === "true";
    const limit = parseInt(searchParams.get("limit") || "16");
    const skip = parseInt(searchParams.get("skip") || "0");

    // Get current user's info for smart filtering
    const currentUser = await User.findById(session.user.id).select("city danceStyles");

    // Build the query
    const query: any = {
      _id: { $ne: session.user.id }, // Exclude current user
      isProfileComplete: true, // Only show completed profiles
    };

    // Determine scope city for travelers filter
    let scopeCityId = null;
    
    // Location filtering (scopes are mutually exclusive)
    if (pickCityId) {
      // Pick a City tab - specific city selected
      query.city = pickCityId;
      scopeCityId = pickCityId;
    } else if (pickCountryId) {
      // Pick a Country tab - specific country selected
      const citiesInCountry = await City.find({ 
        country: pickCountryId 
      }).select('_id');
      query.city = { $in: citiesInCountry.map(c => c._id) };
      // For travelers, we can't determine a single scope city
      scopeCityId = null; // Will allow travelers per city if needed
    } else if (nearMe && currentUser?.city && !city) {
      // Near Me tab
      query.city = currentUser.city;
      scopeCityId = currentUser.city;
    } else if (inMyCountry && currentUser?.city && !city) {
      // My Country tab
      const userCityWithCountry = await City.findById(currentUser.city).populate('country');
      if (userCityWithCountry?.country) {
        const citiesInCountry = await City.find({ 
          country: userCityWithCountry.country._id 
        }).select('_id');
        query.city = { $in: citiesInCountry.map(c => c._id) };
        // For travelers, we'll use user's home city
        scopeCityId = currentUser.city;
      }
    }
    // Worldwide tab = no city filter
    
    // TRAVELERS FILTER (separate toggle that works with any scope)
    if (showTravelers && scopeCityId) {
      // Show people whose activeCity matches scope but it's not their home
      query.activeCity = scopeCityId;
      query.openToMeetTravelers = true;
      query.$expr = { $ne: ["$activeCity", "$city"] };
    }
    
    // OTHER FILTERS
    if (lookingForPractice) {
      query.lookingForPracticePartners = true;
    }
    
    if (isTeacher) {
      query.isTeacher = true;
    }
    
    if (isDJ) {
      query.isDJ = true;
    }
    
    if (isPhotographer) {
      query.isPhotographer = true;
    }
    
    // Filter by dance role
    if (danceRole && danceRole !== "all") {
      query.danceRole = danceRole;
    }
    
    // Filter by dance level
    if (danceLevel && danceLevel !== "all") {
      query.danceLevel = danceLevel;
    }

    // Filter by city (accent-insensitive search)
    if (city && city.trim()) {
      const accentInsensitivePattern = createAccentInsensitivePattern(city.trim());
      
      // Find cities that match the search (with accent-insensitive matching)
      const matchingCities = await City.find({
        name: { $regex: accentInsensitivePattern, $options: "i" }
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

    // Base query to get users (fetch more than needed for sorting professionals)
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
      .sort(sortCriteria);

    let users = await usersQuery.lean();

    // Sort: professionals (teachers, DJs, photographers) by likes first, then regular dancers
    users.sort((a: any, b: any) => {
      const aIsProfessional = a.isTeacher || a.isDJ || a.isPhotographer;
      const bIsProfessional = b.isTeacher || b.isDJ || b.isPhotographer;
      const aLikes = a.likedBy?.length || 0;
      const bLikes = b.likedBy?.length || 0;

      // If both are professionals or both are not, sort by likes
      if (aIsProfessional === bIsProfessional) {
        return bLikes - aLikes; // Descending order (most likes first)
      }
      
      // Professionals come first
      return aIsProfessional ? -1 : 1;
    });

    // Apply pagination after sorting
    users = users.slice(skip, skip + limit);

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
        likedBy: user.likedBy || [],
        jackAndJillCompetitions: user.jackAndJillCompetitions || []
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