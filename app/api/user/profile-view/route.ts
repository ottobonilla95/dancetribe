import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only track logged-in users viewing profiles
    if (!session?.user?.id) {
      return NextResponse.json({ success: true }); // Don't track anonymous views
    }

    await connectMongo();

    const { profileUserId } = await req.json();

    if (!profileUserId) {
      return NextResponse.json(
        { error: "Profile user ID required" },
        { status: 400 }
      );
    }

    const viewerId = session.user.id;

    // Don't track own profile views
    if (viewerId === profileUserId) {
      return NextResponse.json({ success: true });
    }

    // Check if user exists
    const profileUser = await User.findById(profileUserId);
    if (!profileUser) {
      return NextResponse.json(
        { error: "Profile user not found" },
        { status: 404 }
      );
    }

    // Check if this viewer already viewed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingViewToday = profileUser.profileViews?.find((view: any) => {
      const viewDate = new Date(view.viewedAt);
      viewDate.setHours(0, 0, 0, 0);
      return (
        view.viewer.toString() === viewerId &&
        viewDate.getTime() === today.getTime()
      );
    });

    // If already viewed today, skip (no need to track again)
    if (existingViewToday) {
      return NextResponse.json({ success: true });
    }

    // Add new view (MongoDB automatically keeps last 100 with $slice)
    await User.findByIdAndUpdate(profileUserId, {
      $push: {
        profileViews: {
          $each: [{ viewer: viewerId, viewedAt: new Date() }],
          $slice: -100, // Automatic cleanup: keep only last 100 views
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile view tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

