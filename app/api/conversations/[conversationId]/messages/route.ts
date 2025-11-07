import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

// GET /api/conversations/[conversationId]/messages - Get all messages in a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongo();

    // Verify user is part of conversation
    const conversation = await Conversation.findById(params.conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get messages
    const messages = await Message.find({
      conversationId: params.conversationId,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: params.conversationId,
        senderId: { $ne: session.user.id },
        isRead: false,
      },
      { isRead: true }
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[conversationId]/messages - Send a message
export async function POST(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Message text is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Verify user is part of conversation
    const conversation = await Conversation.findById(params.conversationId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const isParticipant = conversation.participants.some(
      (p: any) => p.toString() === session.user.id
    );

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get sender info
    const sender = await User.findById(session.user.id).select("name image");

    // Create message
    const message = await Message.create({
      conversationId: params.conversationId,
      senderId: session.user.id,
      senderName: sender?.name || "Unknown",
      senderImage: sender?.image || "",
      text: text.trim(),
    });

    // Update conversation
    conversation.lastMessage = text.trim().substring(0, 100);
    conversation.lastMessageAt = new Date();
    conversation.lastMessageBy = session.user.id;
    await conversation.save();

    // Note: We don't create notifications for messages anymore
    // Messages are tracked via unread count on the Messages link instead

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

