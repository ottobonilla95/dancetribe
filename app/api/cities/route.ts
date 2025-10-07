import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import { createAccentInsensitivePattern } from "@/utils/search";

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "totalDancers";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const includeEmpty = searchParams.get("includeEmpty") === "true"; // Allow cities with 0 dancers
    
    const skip = (page - 1) * limit;

    // Build sort criteria
    let sortCriteria: any;
    switch (sortBy) {
      case "totalDancers":
        sortCriteria = { totalDancers: -1, name: 1 }; // Most dancers first, then by name
        break;
      case "rank":
        sortCriteria = { rank: 1, totalDancers: -1 }; // Lower rank first, then by dancers
        break;
      case "name":
        sortCriteria = { name: 1 }; // Alphabetical
        break;
      case "population":
        sortCriteria = { population: -1, totalDancers: -1 }; // Largest cities first
        break;
      default:
        sortCriteria = { totalDancers: -1, name: 1 };
    }

    // Build search criteria
    let searchCriteria: any = { 
      isActive: true
    };

    // Only filter by dancers if not including empty cities
    if (!includeEmpty) {
      searchCriteria.totalDancers = { $gt: 0 };
    }

    if (search) {
      // Use accent-insensitive search pattern
      const accentInsensitivePattern = createAccentInsensitivePattern(search);
      
      searchCriteria.$or = [
        { name: { $regex: accentInsensitivePattern, $options: "i" } },
        { "country.name": { $regex: accentInsensitivePattern, $options: "i" } },
        { "continent.name": { $regex: accentInsensitivePattern, $options: "i" } }
      ];
    }

    // Get total count for pagination
    const totalCount = await City.countDocuments(searchCriteria);

    // Fetch cities with sorting, pagination, and search
    const cities = await City.find(searchCriteria)
      .populate({ path: "country", model: Country, select: "name code" })
      .populate({ path: "continent", model: Continent, select: "name" })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data
    const transformedCities = cities.map((city: any) => ({
      ...city,
      _id: city._id.toString(),
      country: { 
        name: city.country?.name || "", 
        code: city.country?.code || "" 
      },
      continent: { 
        name: city.continent?.name || "" 
      },
    }));

    const hasMore = skip + limit < totalCount;

    return NextResponse.json({
      success: true,
      cities: transformedCities,
      totalCount,
      hasMore,
      page,
      limit,
      sortBy,
      search
    });

  } catch (error) {
    console.error("Error in cities API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
