import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Notification from "@/models/Notification";
import config from "@/config";

export const dynamic = "force-dynamic";

// POST /api/admin/test-notification - Send test notification to current user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectMongo();

    const body = await req.json();
    const { type, songTitle } = body;

    // Validate type
    const validTypes = ["new_music", "new_follower", "profile_liked", "friend_request", "friend_accepted"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Build notification data based on type
    let notificationData: any = {};
    
    if (type === "new_music") {
      notificationData = {
        songTitle: songTitle || "Test Song",
        actionUrl: "/release/test-release-id", // Generic actionUrl for testing
      };
    } else {
      // For other notification types, provide generic actionUrl
      notificationData = {
        actionUrl: "/profile", // Default test URL
      };
    }

    // Create test notification
    const notification = await Notification.create({
      recipient: session.user.id,
      type,
      sender: session.user.id, // Self-notification for testing
      data: notificationData,
      isRead: false,
    });

    console.log(`✅ Test notification sent to ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `Test "${type}" notification sent! Check the bell icon.`,
      notification: {
        _id: notification._id.toString(),
        type: notification.type,
        data: notification.data,
      },
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}

