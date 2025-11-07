import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import mongoose from "mongoose";
import Notification from "@/models/Notification";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

// GET /api/user/status - Get notifications and unread message count in one call
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Fetch notifications
    const notifications = await Notification.find({
      recipient: session.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("sender", "name username image")
      .lean();

    // Count unread notifications
    const unreadNotificationsCount = await Notification.countDocuments({
      recipient: session.user.id,
      isRead: false,
    });

    // Calculate unread messages count - OPTIMIZED with ONE query
    const conversations = await Conversation.find({
      participants: session.user.id,
    })
      .select("_id")
      .lean();

    const conversationIds = conversations.map((c: any) => c._id);

    let unreadMessagesCount = 0;

    // Only query if user has conversations
    if (conversationIds.length > 0) {
      const conversationsWithUnread = await Message.aggregate([
        {
          $match: {
            conversationId: { $in: conversationIds },
            senderId: { $ne: new mongoose.Types.ObjectId(session.user.id) },
            isRead: false,
          },
        },
        {
          $group: {
            _id: "$conversationId",
          },
        },
      ]);

      unreadMessagesCount = conversationsWithUnread.length;
    }

    return NextResponse.json({
      notifications,
      unreadNotificationsCount,
      unreadMessagesCount,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { error: "Failed to fetch user status" },
      { status: 500 }
    );
  }
}

