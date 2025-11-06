import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.email || session.user.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { userId, isFeaturedProfessional } = await req.json();

    if (!userId || typeof isFeaturedProfessional !== 'boolean') {
      return NextResponse.json(
        { error: "userId and isFeaturedProfessional (boolean) are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const user = await User.findByIdAndUpdate(
      userId,
      { isFeaturedProfessional },
      { new: true }
    ).select('name username isFeaturedProfessional');

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        isFeaturedProfessional: user.isFeaturedProfessional
      },
      message: `User ${isFeaturedProfessional ? 'marked as' : 'removed from'} featured professional`
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return NextResponse.json(
      { error: "Failed to toggle featured status" },
      { status: 500 }
    );
  }
}

