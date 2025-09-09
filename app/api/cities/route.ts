import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";

// GET /api/cities - Fetch cities, optionally filtered by country or continent
export async function GET(request: Request) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('country');
    const continentId = searchParams.get('continent');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query: any = { isActive: true };
    if (countryId) {
      query.country = countryId;
    }
    if (continentId) {
      query.continent = continentId;
    }

    const cities = await City.find(query)
      .populate('country', 'name code')
      .populate('continent', 'name code')
      .sort({ rank: 1, population: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}
