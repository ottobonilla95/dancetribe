import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { notifyNewFollower } from "@/utils/notifications";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Get both users
    const currentUser = await User.findById(session.user.id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if target user is featured professional
    if (!targetUser.isFeaturedProfessional) {
      return NextResponse.json(
        { error: "Can only follow featured professionals" },
        { status: 400 }
      );
    }

    // Check if current user is featured and trying to follow another featured user
    if (currentUser.isFeaturedProfessional && targetUser.isFeaturedProfessional) {
      return NextResponse.json(
        { error: "Featured professionals should send friend requests to each other" },
        { status: 400 }
      );
    }

    // Check if already following
    if (currentUser.following?.includes(userId)) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    // Add to following list
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { following: userId }
    });

    // Add to target user's followers list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { followers: session.user.id }
    });

    // Send in-app notification
    await notifyNewFollower(userId, session.user.id, `/${currentUser.username || session.user.id}`);

    return NextResponse.json({ 
      success: true,
      message: "Successfully followed user"
    });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Remove from following list
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { following: userId }
    });

    // Remove from target user's followers list
    await User.findByIdAndUpdate(userId, {
      $pull: { followers: session.user.id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Successfully unfollowed user"
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}

