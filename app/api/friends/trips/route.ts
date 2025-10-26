import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectDB from "@/libs/mongoose";
import User from "@/models/User";

// GET - Get upcoming trips from user's friends
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get current user with friends list
    const currentUser: any = await User.findById(session.user.id)
      .select("friends")
      .lean();

    if (!currentUser || !currentUser.friends || currentUser.friends.length === 0) {
      return NextResponse.json({ trips: [] });
    }

    // Get all friends with their upcoming trips
    const now = new Date();
    
    const friendsWithTrips = await User.find({
      _id: { $in: currentUser.friends },
      isProfileComplete: true,
      "trips.0": { $exists: true }, // Only friends who have trips
    })
      .select("name username image trips")
      .populate({
        path: "trips.city",
        select: "name country image",
        populate: {
          path: "country",
          select: "name code"
        }
      })
      .lean();

    // Flatten and filter upcoming trips
    const upcomingTrips: any[] = [];
    
    friendsWithTrips.forEach((friend: any) => {
      if (friend.trips && Array.isArray(friend.trips)) {
        friend.trips.forEach((trip: any) => {
          // Only include future trips
          if (new Date(trip.endDate) >= now) {
            upcomingTrips.push({
              _id: trip._id,
              city: trip.city,
              startDate: trip.startDate,
              endDate: trip.endDate,
              dancer: {
                _id: friend._id,
                name: friend.name,
                username: friend.username,
                image: friend.image
              }
            });
          }
        });
      }
    });

    // Sort by start date (soonest first)
    upcomingTrips.sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return NextResponse.json({ trips: upcomingTrips });
  } catch (error) {
    console.error("Error fetching friends' trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends' trips" },
      { status: 500 }
    );
  }
}

