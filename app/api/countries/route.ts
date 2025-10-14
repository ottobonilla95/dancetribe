import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
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
    const includeEmpty = searchParams.get("includeEmpty") === "true"; // Allow countries with 0 dancers
    
    const skip = (page - 1) * limit;

    // Build sort criteria
    let sortCriteria: any;
    switch (sortBy) {
      case "totalDancers":
        sortCriteria = { totalDancers: -1, name: 1 }; // Most dancers first, then by name
        break;
      case "name":
        sortCriteria = { name: 1 }; // Alphabetical
        break;
      default:
        sortCriteria = { totalDancers: -1, name: 1 };
    }

    // Build search criteria
    let searchCriteria: any = { 
      isActive: true
    };

    // Only filter by dancers if not including empty countries
    if (!includeEmpty) {
      searchCriteria.totalDancers = { $gt: 0 };
    }

    if (search) {
      // Use accent-insensitive search pattern
      const accentInsensitivePattern = createAccentInsensitivePattern(search);
      
      searchCriteria.$or = [
        { name: { $regex: accentInsensitivePattern, $options: "i" } },
        { "continent.name": { $regex: accentInsensitivePattern, $options: "i" } }
      ];
    }

    // Get total count for pagination
    const totalCount = await Country.countDocuments(searchCriteria);

    // Fetch countries with sorting, pagination, and search
    const countries = await Country.find(searchCriteria)
      .populate({ path: "continent", model: Continent, select: "name code" })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform the data
    const transformedCountries = countries.map((country: any) => ({
      ...country,
      _id: country._id.toString(),
      continent: { 
        name: country.continent?.name || "",
        code: country.continent?.code || ""
      },
    }));

    const hasMore = skip + limit < totalCount;

    return NextResponse.json({
      success: true,
      countries: transformedCountries,
      totalCount,
      hasMore,
      page,
      limit,
      sortBy,
      search
    });

  } catch (error) {
    console.error("Error in countries API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

