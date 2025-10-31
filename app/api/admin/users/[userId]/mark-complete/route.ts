import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";

// PATCH: Mark user profile as complete
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectMongo();

    // Update user's profile completion status
    const user = await User.findByIdAndUpdate(
      params.userId,
      { isProfileComplete: true },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User profile marked as complete",
      user: {
        _id: user._id,
        name: user.name,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error("Error marking profile complete:", error);
    return NextResponse.json(
      { error: "Failed to mark profile as complete" },
      { status: 500 }
    );
  }
}

