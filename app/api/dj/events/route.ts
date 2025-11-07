import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import DJEvent from "@/models/DJEvent";
import User from "@/models/User";

// GET /api/dj/events?djId=xxx - Get events for a specific DJ
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const djId = searchParams.get("djId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    if (!djId) {
      return NextResponse.json(
        { error: "DJ ID is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const skip = (page - 1) * limit;
    const events = await DJEvent.find({ djId })
      .sort({ eventDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DJEvent.countDocuments({ djId });

    return NextResponse.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching DJ events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/dj/events - Create a new event
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventName, venue, city, eventDate, description, imageUrl, genres } =
      body;

    // Validate required fields
    if (!eventName || !city || !eventDate) {
      return NextResponse.json(
        { error: "Missing required fields: eventName, city, eventDate" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Verify user is a DJ
    const user = await User.findById(session.user.id);
    if (!user?.isDJ) {
      return NextResponse.json(
        { error: "Only DJs can create events" },
        { status: 403 }
      );
    }

    const newEvent = await DJEvent.create({
      djId: session.user.id,
      eventName,
      venue: venue || "",
      city,
      eventDate: new Date(eventDate),
      description: description || "",
      imageUrl: imageUrl || "",
      genres: genres || [],
    });

    return NextResponse.json({
      success: true,
      event: newEvent,
    });
  } catch (error) {
    console.error("Error creating DJ event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

