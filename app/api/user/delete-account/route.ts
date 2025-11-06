import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import LeaderboardSnapshot from "@/models/LeaderboardSnapshot";
import mongoose from "mongoose";

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

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(session.user.id);

    // Find the user
    const user = await User.findById(userObjectId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Starting account deletion cleanup for user:", session.user.id);

    // 0. Delete OAuth account records (Google, Email, etc.)
    console.log("Deleting OAuth accounts...");
    const accountsCollection = mongoose.connection.collection("accounts");
    await accountsCollection.deleteMany({ userId: userObjectId });

    // Also delete sessions
    console.log("Deleting sessions...");
    const sessionsCollection = mongoose.connection.collection("sessions");
    await sessionsCollection.deleteMany({ userId: userObjectId });

    // Delete verification tokens (if any)
    console.log("Deleting verification tokens...");
    const tokensCollection = mongoose.connection.collection("verification_tokens");
    await tokensCollection.deleteMany({ identifier: user.email });

    // 1. Remove user from friends' friend lists
    console.log("Cleaning up friends lists...");
    await User.updateMany(
      { friends: userObjectId },
      { $pull: { friends: userObjectId } }
    );

    // 2. Remove user from friend requests
    console.log("Cleaning up friend requests...");
    await User.updateMany(
      { $or: [
        { friendRequestsSent: userObjectId },
        { friendRequestsReceived: userObjectId }
      ]},
      { 
        $pull: { 
          friendRequestsSent: userObjectId,
          friendRequestsReceived: userObjectId
        } 
      }
    );

    // 3. Remove user from likes
    console.log("Cleaning up likes...");
    await User.updateMany(
      { likedBy: userObjectId },
      { $pull: { likedBy: userObjectId } }
    );

    // 4. Remove user from followers/following lists
    console.log("Cleaning up followers/following...");
    await User.updateMany(
      { followers: userObjectId },
      { $pull: { followers: userObjectId } }
    );

    await User.updateMany(
      { following: userObjectId },
      { $pull: { following: userObjectId } }
    );

    // 5. Remove user from profile views
    console.log("Cleaning up profile views...");
    await User.updateMany(
      { "profileViews.viewer": userObjectId },
      { $pull: { profileViews: { viewer: userObjectId } } }
    );

    // 6. Remove user from leaderboard snapshots
    console.log("Cleaning up leaderboard snapshots...");
    await LeaderboardSnapshot.updateMany(
      { "rankings.userId": userObjectId },
      { $pull: { rankings: { userId: userObjectId } } }
    );

    // 7. Finally, delete the user account from the database
    console.log("Deleting user account from users collection...");
    const usersCollection = mongoose.connection.collection("users");
    const deleteResult = await usersCollection.deleteOne({ _id: userObjectId });
    console.log(`Deleted ${deleteResult.deletedCount} user(s) from users collection`);

    // Also try Mongoose delete in case the collection name is different
    console.log("Attempting Mongoose findByIdAndDelete...");
    const mongooseResult = await User.findByIdAndDelete(userObjectId);
    console.log(`Mongoose delete result:`, mongooseResult ? "User deleted" : "User not found");

    console.log("Account deletion completed successfully");

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

