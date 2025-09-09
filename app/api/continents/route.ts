import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import Continent from "@/models/Continent";

// GET /api/continents - Fetch all continents
export async function GET() {
  try {
    await connectMongo();

    const continents = await Continent.find({ isActive: true })
      .sort({ totalDancers: -1, name: 1 })
      .lean();

    return NextResponse.json({ continents });
  } catch (error) {
    console.error("Error fetching continents:", error);
    return NextResponse.json(
      { error: "Failed to fetch continents" },
      { status: 500 }
    );
  }
}
