import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectDB from "@/libs/mongoose";
import User from "@/models/User";
import config from "@/config";
import { revalidateTag } from "next/cache";

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user?.email !== config.admin.email) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const shouldClear = searchParams.get("clear") === "true";

    if (shouldClear) {
      // Clear the heroSequence field
      await User.findByIdAndUpdate(params.userId, {
        $unset: { heroSequence: "" }
      });
    } else {
      // Update with new value
      const formData = await req.formData();
      const heroSequence = formData.get("heroSequence");

      if (!heroSequence) {
        return NextResponse.json(
          { error: "heroSequence is required" },
          { status: 400 }
        );
      }

      const sequenceNumber = parseInt(heroSequence as string);

      if (isNaN(sequenceNumber) || sequenceNumber < 1) {
        return NextResponse.json(
          { error: "Invalid sequence number" },
          { status: 400 }
        );
      }

      await User.findByIdAndUpdate(params.userId, {
        heroSequence: sequenceNumber
      });
    }

    // Revalidate the landing page cache to show updated featured dancers
    revalidateTag("landing-featured-users");

    // Redirect back to the user's profile
    return NextResponse.redirect(
      new URL(`/dancer/${params.userId}`, req.url)
    );
  } catch (error) {
    console.error("Error updating hero sequence:", error);
    return NextResponse.json(
      { error: "Failed to update hero sequence" },
      { status: 500 }
    );
  }
}

