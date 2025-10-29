import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import config from "@/config";

// GET: Fetch countries and continents for dropdowns
export async function GET() {
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

    const [countries, continents] = await Promise.all([
      Country.find({ isActive: true })
        .select("_id name code")
        .sort({ name: 1 })
        .lean(),
      Continent.find({ isActive: true })
        .select("_id name code")
        .sort({ name: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      countries,
      continents,
    });
  } catch (error) {
    console.error("Error fetching reference data:", error);
    return NextResponse.json(
      { error: "Failed to fetch reference data" },
      { status: 500 }
    );
  }
}

