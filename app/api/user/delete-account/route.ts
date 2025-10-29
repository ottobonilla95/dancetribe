import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongo();

    // Find the user
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove user from friends' friend lists
    await User.updateMany(
      { friends: session.user.id },
      { $pull: { friends: session.user.id } }
    );

    // Remove user from friend requests
    await User.updateMany(
      { $or: [
        { friendRequestsSent: session.user.id },
        { friendRequestsReceived: session.user.id }
      ]},
      { 
        $pull: { 
          friendRequestsSent: session.user.id,
          friendRequestsReceived: session.user.id
        } 
      }
    );

    // Remove user from likes
    await User.updateMany(
      { likedBy: session.user.id },
      { $pull: { likedBy: session.user.id } }
    );

    // Delete the user account
    await User.findByIdAndDelete(session.user.id);

    return NextResponse.json(
      { success: true, message: "Account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}

