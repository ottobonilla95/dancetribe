import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Notification from "@/models/Notification";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// GET /api/notifications - Fetch user's notifications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongo();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = { recipient: session.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    // Fetch notifications
    const notifications = await Notification.find(query)
      .populate({
        path: "sender",
        select: "name username image isFeaturedProfessional",
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      recipient: session.user.id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n: any) => ({
        ...n,
        _id: n._id.toString(),
        recipient: n.recipient.toString(),
        sender: n.sender ? {
          ...n.sender,
          _id: n.sender._id.toString(),
        } : null,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark notification(s) as read
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongo();

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      // Mark all as read
      await Notification.updateMany(
        {
          recipient: session.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    } else if (notificationId) {
      // Mark single notification as read
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipient: session.user.id, // Security: only mark your own notifications
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
        { new: true }
      );

      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        notification,
      });
    } else {
      return NextResponse.json(
        { error: "Missing notificationId or markAllRead" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 }
    );
  }
}

