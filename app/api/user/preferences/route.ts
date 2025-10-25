import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      openToMeetTravelers, 
      lookingForPracticePartners,
      activeCity
    } = body;

    await connectMongo();

    const updateData: any = {};
    
    if (typeof openToMeetTravelers === "boolean") {
      updateData.openToMeetTravelers = openToMeetTravelers;
    }
    
    if (typeof lookingForPracticePartners === "boolean") {
      updateData.lookingForPracticePartners = lookingForPracticePartners;
    }

    if (activeCity !== undefined) {
      updateData.activeCity = activeCity;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    ).select("openToMeetTravelers lookingForPracticePartners activeCity");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        openToMeetTravelers: updatedUser.openToMeetTravelers,
        lookingForPracticePartners: updatedUser.lookingForPracticePartners,
        activeCity: updatedUser.activeCity,
      },
    });
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update preferences" },
      { status: 500 }
    );
  }
}

