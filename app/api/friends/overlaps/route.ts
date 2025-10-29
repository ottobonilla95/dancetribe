import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectDB from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Country from "@/models/Country";

// Helper to check if two date ranges overlap
function datesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && start2 <= end1;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get current user with their trips and friends
    const user: any = await User.findById(session.user.id)
      .select("trips friends")
      .populate({
        path: "trips.city",
        select: "name image",
        populate: {
          path: "country",
          select: "name code",
        },
      })
      .lean();

    if (!user || !user.friends || user.friends.length === 0) {
      return NextResponse.json({ overlaps: [] });
    }

    // Get friends with their trips
    const friends: any[] = await User.find({
      _id: { $in: user.friends },
      "trips.0": { $exists: true },
    })
      .select("name image username trips")
      .populate({
        path: "trips.city",
        select: "name image",
        populate: {
          path: "country",
          select: "name code",
        },
      })
      .lean();

    // Find overlapping trips
    const overlaps: any[] = [];
    const now = new Date();

    // Only consider user's future trips
    const userUpcomingTrips = user.trips?.filter(
      (trip: any) => new Date(trip.endDate) >= now
    ) || [];

    userUpcomingTrips.forEach((userTrip: any) => {
      friends.forEach((friend) => {
        friend.trips?.forEach((friendTrip: any) => {
          // Check if it's the same city
          if (
            userTrip.city._id.toString() === friendTrip.city._id.toString()
          ) {
            // Check if dates overlap
            if (
              datesOverlap(
                new Date(userTrip.startDate),
                new Date(userTrip.endDate),
                new Date(friendTrip.startDate),
                new Date(friendTrip.endDate)
              )
            ) {
              // Calculate overlap period
              const overlapStart = new Date(
                Math.max(
                  new Date(userTrip.startDate).getTime(),
                  new Date(friendTrip.startDate).getTime()
                )
              );
              const overlapEnd = new Date(
                Math.min(
                  new Date(userTrip.endDate).getTime(),
                  new Date(friendTrip.endDate).getTime()
                )
              );

              // Calculate days overlapping
              const overlapDays =
                Math.floor(
                  (overlapEnd.getTime() - overlapStart.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;

              overlaps.push({
                _id: `${userTrip._id}-${friendTrip._id}`,
                city: {
                  _id: userTrip.city._id.toString(),
                  name: userTrip.city.name,
                  image: userTrip.city.image,
                  country: userTrip.city.country,
                },
                friend: {
                  _id: friend._id.toString(),
                  name: friend.name,
                  username: friend.username,
                  image: friend.image,
                },
                yourTrip: {
                  startDate: userTrip.startDate,
                  endDate: userTrip.endDate,
                },
                friendTrip: {
                  startDate: friendTrip.startDate,
                  endDate: friendTrip.endDate,
                },
                overlap: {
                  startDate: overlapStart,
                  endDate: overlapEnd,
                  days: overlapDays,
                },
              });
            }
          }
        });
      });
    });

    // Sort by overlap start date (soonest first)
    overlaps.sort(
      (a, b) =>
        new Date(a.overlap.startDate).getTime() -
        new Date(b.overlap.startDate).getTime()
    );

    return NextResponse.json({ overlaps });
  } catch (error) {
    console.error("Error finding trip overlaps:", error);
    return NextResponse.json(
      { error: "Failed to find trip overlaps" },
      { status: 500 }
    );
  }
}

