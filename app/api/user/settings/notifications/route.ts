import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emailNotifications, friendRequestNotifications, profileLikedNotifications, messageNotifications, weeklyDigest } = body;

    await connectMongo();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'notificationSettings.emailNotifications': emailNotifications,
          'notificationSettings.friendRequestNotifications': friendRequestNotifications,
          'notificationSettings.profileLikedNotifications': profileLikedNotifications,
          'notificationSettings.messageNotifications': messageNotifications,
          'notificationSettings.weeklyDigest': weeklyDigest,
        }
      },
      { new: true }
    ).select('notificationSettings');

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}

