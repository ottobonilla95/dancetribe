import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import config from "@/config";

// POST: Sync totalDancers count for all cities based on actual user data
export async function POST(req: Request) {
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

    // Get all users with their cities - ONLY count completed profiles
    const users = await User.find({ 
      city: { $exists: true, $ne: null },
      isProfileComplete: true 
    })
      .select("city")
      .lean();

    // Count dancers per city
    const cityDancerCounts = new Map<string, number>();
    
    users.forEach((user) => {
      if (user.city) {
        const cityId = user.city.toString();
        cityDancerCounts.set(cityId, (cityDancerCounts.get(cityId) || 0) + 1);
      }
    });

    // Update all cities
    const updatePromises: Promise<any>[] = [];
    
    // First, reset all cities to 0
    await City.updateMany({}, { totalDancers: 0 });

    // Then update cities that have dancers
    const cityCountsArray: Array<{ cityId: string; dancers: number }> = [];
    cityDancerCounts.forEach((count, cityId) => {
      updatePromises.push(
        City.findByIdAndUpdate(cityId, { totalDancers: count })
      );
      cityCountsArray.push({ cityId, dancers: count });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "City dancer counts synced successfully",
      stats: {
        totalCitiesWithDancers: cityDancerCounts.size,
        totalDancersProcessed: users.length,
        cityCounts: cityCountsArray,
      },
    });
  } catch (error) {
    console.error("Error syncing city dancers:", error);
    return NextResponse.json(
      { error: "Failed to sync city dancers" },
      { status: 500 }
    );
  }
}

