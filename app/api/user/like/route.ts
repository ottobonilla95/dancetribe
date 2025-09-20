import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectMongo();

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Can't like yourself
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot like your own profile" },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const isAlreadyLiked = targetUser.likedBy.includes(currentUserId);

    if (isAlreadyLiked) {
      // Unlike - remove from likedBy array
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { likedBy: currentUserId }
      });

      return NextResponse.json({
        success: true,
        action: "unliked",
        likesCount: targetUser.likedBy.length - 1
      });
    } else {
      // Like - add to likedBy array
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { likedBy: currentUserId }
      });

      return NextResponse.json({
        success: true,
        action: "liked",
        likesCount: targetUser.likedBy.length + 1
      });
    }

  } catch (error) {
    console.error("Like API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 