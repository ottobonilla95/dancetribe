import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import DJEvent from "@/models/DJEvent";

// PUT /api/dj/events/[eventId] - Update an event
export async function PUT(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventName, venue, city, eventDate, description, imageUrl, genres } =
      body;

    await connectMongo();

    const event = await DJEvent.findById(params.eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify user owns this event
    if (event.djId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update fields
    if (eventName) event.eventName = eventName;
    if (venue) event.venue = venue;
    if (city) event.city = city;
    if (eventDate) event.eventDate = new Date(eventDate);
    if (description !== undefined) event.description = description;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (genres !== undefined) event.genres = genres;

    await event.save();

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Error updating DJ event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/dj/events/[eventId] - Delete an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const event = await DJEvent.findById(params.eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Verify user owns this event
    if (event.djId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await DJEvent.deleteOne({ _id: params.eventId });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting DJ event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}

