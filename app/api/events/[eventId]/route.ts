import { NextRequest, NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import DJEvent from "@/models/DJEvent";
import User from "@/models/User";
import City from "@/models/City";

// GET /api/events/[eventId] - Get event details
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await connectMongo();

    const event = await DJEvent.findById(params.eventId)
      .populate({
        path: "djId",
        model: User,
        select: "name username image city",
        populate: {
          path: "city",
          model: City,
          select: "name",
        },
      })
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

