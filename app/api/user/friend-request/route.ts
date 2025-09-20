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

    const { action, targetUserId } = await req.json();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // Can't friend yourself
    if (session.user.id === targetUserId) {
      return NextResponse.json(
        { error: "Cannot send friend request to yourself" },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = await User.findById(currentUserId);

    switch (action) {
      case "send": {
        // Check if already friends
        if (currentUser.friends.includes(targetUserId)) {
          return NextResponse.json(
            { error: "Already friends with this user" },
            { status: 400 }
          );
        }

        // Check if request already sent
        const existingRequest = currentUser.friendRequestsSent.find(
          (request: any) => request.user.toString() === targetUserId
        );
        if (existingRequest) {
          return NextResponse.json(
            { error: "Friend request already sent" },
            { status: 400 }
          );
        }

        // Check if they already sent you a request (can accept instead)
        const incomingRequest = currentUser.friendRequestsReceived.find(
          (request: any) => request.user.toString() === targetUserId
        );
        if (incomingRequest) {
          return NextResponse.json(
            {
              error:
                "This user already sent you a friend request. Accept it instead!",
            },
            { status: 400 }
          );
        }

        // Send friend request
        await User.findByIdAndUpdate(currentUserId, {
          $push: {
            friendRequestsSent: {
              user: targetUserId,
              sentAt: new Date(),
            },
          },
        });

        await User.findByIdAndUpdate(targetUserId, {
          $push: {
            friendRequestsReceived: {
              user: currentUserId,
              sentAt: new Date(),
            },
          },
        });

        return NextResponse.json({
          success: true,
          action: "request_sent",
          message: "Friend request sent successfully",
        });
      }
      case "accept": {
        // Check if there's a pending request
        const pendingRequest = currentUser.friendRequestsReceived.find(
          (request: any) => request.user.toString() === targetUserId
        );
        if (!pendingRequest) {
          return NextResponse.json(
            { error: "No pending friend request from this user" },
            { status: 400 }
          );
        }

        // Add to friends list for both users
        await User.findByIdAndUpdate(currentUserId, {
          $push: { friends: targetUserId },
          $pull: { friendRequestsReceived: { user: targetUserId } },
        });

        await User.findByIdAndUpdate(targetUserId, {
          $push: { friends: currentUserId },
          $pull: { friendRequestsSent: { user: currentUserId } },
        });

        return NextResponse.json({
          success: true,
          action: "request_accepted",
          message: "Friend request accepted",
        });
      }
      case "reject": {
        // Remove the friend request
        await User.findByIdAndUpdate(currentUserId, {
          $pull: { friendRequestsReceived: { user: targetUserId } },
        });

        await User.findByIdAndUpdate(targetUserId, {
          $pull: { friendRequestsSent: { user: currentUserId } },
        });

        return NextResponse.json({
          success: true,
          action: "request_rejected",
          message: "Friend request rejected",
        });
      }
      case "cancel":
        // Cancel sent request
        await User.findByIdAndUpdate(currentUserId, {
          $pull: { friendRequestsSent: { user: targetUserId } },
        });

        await User.findByIdAndUpdate(targetUserId, {
          $pull: { friendRequestsReceived: { user: currentUserId } },
        });

        return NextResponse.json({
          success: true,
          action: "request_cancelled",
          message: "Friend request cancelled",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: send, accept, reject, or cancel" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Friend request API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
