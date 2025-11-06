import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import mongoose from "mongoose";

export async function POST() {
  try {
    await connectMongo();

    // Get all accounts
    const accountsCollection = mongoose.connection.collection("accounts");
    const accounts = await accountsCollection.find({}).toArray();

    // Get all user IDs that exist
    const usersCollection = mongoose.connection.collection("users");
    const existingUserIds = await usersCollection.distinct("_id");
    const existingUserIdStrings = existingUserIds.map((id: any) => id.toString());

    // Find orphaned accounts (accounts where userId doesn't exist in users collection)
    const orphanedAccounts = accounts.filter((account: any) => {
      const accountUserId = account.userId?.toString();
      return !existingUserIdStrings.includes(accountUserId);
    });

    console.log(`Found ${orphanedAccounts.length} orphaned accounts`);

    if (orphanedAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orphaned accounts found",
        deleted: 0,
      });
    }

    // Delete orphaned accounts
    const orphanedUserIds = orphanedAccounts.map((acc: any) => acc.userId);
    const result = await accountsCollection.deleteMany({
      userId: { $in: orphanedUserIds },
    });

    // Also clean up orphaned sessions
    const sessionsCollection = mongoose.connection.collection("sessions");
    await sessionsCollection.deleteMany({
      userId: { $in: orphanedUserIds },
    });

    console.log(`Deleted ${result.deletedCount} orphaned accounts`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${result.deletedCount} orphaned accounts`,
      deleted: result.deletedCount,
      orphanedAccounts: orphanedAccounts.map((acc: any) => ({
        provider: acc.provider,
        providerAccountId: acc.providerAccountId,
        userId: acc.userId?.toString(),
      })),
    });
  } catch (error) {
    console.error("Error cleaning up orphaned accounts:", error);
    return NextResponse.json(
      { error: "Failed to cleanup orphaned accounts" },
      { status: 500 }
    );
  }
}

