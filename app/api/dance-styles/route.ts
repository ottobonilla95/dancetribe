import { NextResponse } from "next/server";
import connectMongo from "@/libs/mongoose";
import DanceStyle from "@/models/DanceStyle";

// Disable caching for this route to always get fresh dance styles
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectMongo();
    
    let danceStyles = await DanceStyle.find({ isActive: true })
      .select('name description image category isPartnerDance sequence')
      .lean();

    // Sort: null/undefined sequences go last, then by sequence number, then by name
    danceStyles = danceStyles.sort((a: any, b: any) => {
      const seqA = a.sequence ?? Infinity; // null/undefined becomes Infinity (goes last)
      const seqB = b.sequence ?? Infinity;
      
      if (seqA !== seqB) {
        return seqA - seqB; // Sort by sequence
      }
      
      return a.name.localeCompare(b.name); // Then by name
    });

    return NextResponse.json({ danceStyles }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    console.error("Error fetching dance styles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 