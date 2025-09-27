import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";

export async function GET(req: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "rank";
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build sort criteria
    let sortCriteria: any;
    switch (sortBy) {
      case "totalDancers":
        sortCriteria = { totalDancers: -1 }; // Descending - most dancers first
        break;
      case "rank":
      default:
        sortCriteria = { rank: 1 }; // Ascending - lower rank = higher position
        break;
    }

    // Fetch cities with sorting
    const cities = await City.find({ rank: { $gt: 0 } })
      .populate({ path: "country", model: Country, select: "name code" })
      .populate({ path: "continent", model: Continent, select: "name" })
      .sort(sortCriteria)
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

    return NextResponse.json({
      success: true,
      cities: transformedCities,
      total: transformedCities.length,
      sortBy
    });

  } catch (error) {
    console.error("Error in cities API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
