import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import EventComment from "@/models/EventComment";
import DJEvent from "@/models/DJEvent";
import User from "@/models/User";

// GET /api/events/[eventId]/comments - Get all comments for an event
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    await connectMongo();

    const comments = await EventComment.find({ eventId: params.eventId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/events/[eventId]/comments - Add a comment to an event
export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { comment, rating } = body;

    // Validate
    if (!comment || !rating) {
      return NextResponse.json(
        { error: "Comment and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Check if event exists
    const event = await DJEvent.findById(params.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user already commented
    const existingComment = await EventComment.findOne({
      eventId: params.eventId,
      userId: session.user.id,
    });

    if (existingComment) {
      return NextResponse.json(
        { error: "You have already commented on this event" },
        { status: 400 }
      );
    }

    // Get user info
    const user = await User.findById(session.user.id).select("name image");

    // Create comment
    const newComment = await EventComment.create({
      eventId: params.eventId,
      userId: session.user.id,
      userName: user?.name || "Anonymous",
      userImage: user?.image || "",
      comment: comment.trim(),
      rating,
    });

    // Update event statistics
    const allComments = await EventComment.find({ eventId: params.eventId });
    const avgRating =
      allComments.reduce((sum, c) => sum + c.rating, 0) / allComments.length;

    event.averageRating = avgRating;
    event.totalComments = allComments.length;
    await event.save();

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error: any) {
    console.error("Error adding comment:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You have already commented on this event" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

