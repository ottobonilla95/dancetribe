import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import DanceStyle from "@/models/DanceStyle";

export async function GET() {
  try {
    await connectMongo();
    
    const danceStyles = await DanceStyle.find({ isActive: true })
      .sort({ name: 1 })
      .select('name description image category isPartnerDance');

    return NextResponse.json({ danceStyles });
  } catch (error) {
    console.error("Error fetching dance styles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 