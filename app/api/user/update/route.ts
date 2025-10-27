import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import DanceStyle from "@/models/DanceStyle";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    await connectMongo();

    const body = await req.json();
    const userId = session.user.id;

    // Only allow updating specific fields
    const allowedUpdates = [
      'jackAndJillCompetitions',
      'openToMeetTravelers',
      'lookingForPracticePartners',
      'citiesVisited',
    ];

    const updateData: any = {};

    // Filter only allowed fields from the request
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = body[key];
      }
    });

    // If no valid updates, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate({
        path: "jackAndJillCompetitions.danceStyle",
        model: DanceStyle,
        select: "name",
      })
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

