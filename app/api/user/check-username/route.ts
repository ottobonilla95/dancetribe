import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/libs/mongoose";
import User from "@/models/User";
import { isValidUsername } from "@/utils/username";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if username is valid format
    if (!isValidUsername(username)) {
      return NextResponse.json(
        { 
          available: false, 
          error: "Username must be 3-20 characters, lowercase letters, numbers, and underscores only" 
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if username already exists
    const existingUser = await User.findOne({ 
      username: username.toLowerCase() 
    }).select('_id');

    return NextResponse.json({
      available: !existingUser,
      username: username.toLowerCase()
    });

  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
} 