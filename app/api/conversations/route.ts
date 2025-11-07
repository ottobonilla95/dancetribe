import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

// GET /api/conversations - Get all conversations for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    const conversations = await Conversation.find({
      participants: session.user.id,
    })
      .populate({
        path: "participants",
        model: User,
        select: "name username image",
      })
      .populate({
        path: "lastMessageBy",
        model: User,
        select: "name",
      })
      .sort({ lastMessageAt: -1 })
      .lean();

    // Get conversation IDs
    const conversationIds = conversations.map((c: any) => c._id);

    let conversationsWithUnreadSet = new Set<string>();

    // Only query if user has conversations
    if (conversationIds.length > 0) {
      // ONE query to find all unread messages across ALL conversations
      const unreadMessages = await Message.find({
        conversationId: { $in: conversationIds },
        senderId: { $ne: session.user.id },
        isRead: false,
      })
        .select("conversationId")
        .lean();

      // Create a Set of conversation IDs with unread messages (fast lookup)
      conversationsWithUnreadSet = new Set(
        unreadMessages.map((msg: any) => msg.conversationId.toString())
      );
    }

    // Add hasUnread flag to each conversation
    const conversationsWithUnread = conversations.map((conversation: any) => ({
      ...conversation,
      hasUnread: conversationsWithUnreadSet.has(conversation._id.toString()),
    }));

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create or get existing conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { error: "Other user ID is required" },
        { status: 400 }
      );
    }

    if (otherUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [session.user.id, otherUserId] },
    })
      .populate({
        path: "participants",
        model: User,
        select: "name username image",
      })
      .populate({
        path: "lastMessageBy",
        model: User,
        select: "name",
      });

    if (existingConversation) {
      return NextResponse.json({
        conversation: existingConversation,
        isNew: false,
      });
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      participants: [session.user.id, otherUserId],
    });

    await newConversation.populate({
      path: "participants",
      model: User,
      select: "name username image",
    });

    return NextResponse.json({
      conversation: newConversation,
      isNew: true,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

