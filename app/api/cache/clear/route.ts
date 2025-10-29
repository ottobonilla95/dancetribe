import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";

// API route to manually clear dashboard caches
// This is useful in production if cache gets into a bad state
export async function POST() {
  try {
    // Optional: Add authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Revalidate all dashboard cache tags
    const tags = [
      "dance-styles",
      "hot-dance-styles", 
      "hot-cities",
      "community-stats",
      "trending-songs",
      "trendy-countries",
    ];

    for (const tag of tags) {
      revalidateTag(tag);
    }

    console.log("✅ Cache cleared for tags:", tags);

    return NextResponse.json({ 
      success: true, 
      message: "Cache cleared successfully",
      tags 
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}

