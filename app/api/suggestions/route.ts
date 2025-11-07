import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import Suggestion from "@/models/Suggestion";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { suggestion, category } = body;

    if (!suggestion || suggestion.trim().length === 0) {
      return NextResponse.json(
        { error: "Suggestion is required" },
        { status: 400 }
      );
    }

    // Get user info
    const userName = session.user.name || "Anonymous";
    const userEmail = session.user.email || "Not provided";
    const userId = session.user.id;

    // Save to database
    await connectMongo();
    const newSuggestion = await Suggestion.create({
      userId,
      userName,
      userEmail,
      category: category || "other",
      suggestion: suggestion.trim(),
      status: "pending",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Suggestion submitted successfully",
      id: newSuggestion._id,
    });
  } catch (error) {
    console.error("Error submitting suggestion:", error);
    return NextResponse.json(
      { error: "Failed to submit suggestion" },
      { status: 500 }
    );
  }
}

