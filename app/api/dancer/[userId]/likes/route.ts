import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectMongo();

    const user = await User.findById(params.userId).select('likedBy').lean();
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const likesCount = (user as any).likedBy?.length || 0;

    return NextResponse.json({ likesCount });
  } catch (error) {
    console.error("Error fetching likes count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 