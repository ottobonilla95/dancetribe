import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import DanceStyle from "@/models/DanceStyle";

export async function GET() {
  try {
    await connectMongo();
    
    const danceStyles = await DanceStyle.find({ isActive: true })
      .sort({ sequence: 1, name: 1 }) // Sort by sequence first, then name
      .select('name description image category isPartnerDance sequence');

    return NextResponse.json({ danceStyles });
  } catch (error) {
    console.error("Error fetching dance styles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 