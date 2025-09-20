import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import DanceStyle from "@/models/DanceStyle";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    await connectMongo();

    const user = await User.findById(session.user.id)
      .select(
        "name username email image dateOfBirth city citiesVisited danceStyles anthem socialMedia danceRole gender nationality onboardingSteps isProfileComplete createdAt"
      )
      .populate({
        path: "city",
        model: City,
        select: "name country continent rank image",
      })
      .populate({
        path: "citiesVisited",
        model: City,
        select: "name country continent rank image",
      })
      .populate({
        path: "danceStyles.danceStyle",
        model: DanceStyle,
        select: "name description category",
      });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    await connectMongo();

    const body = await req.json();
    const { step, data } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update specific onboarding step
    switch (step) {
      case "danceStyles":
        user.danceStyles = data.danceStyles;
        user.onboardingSteps.danceStyles = true;
        break;

      case "username":
        user.username = data.username;
        user.onboardingSteps.username = true;
        break;

      case "profilePic":
        user.image = data.image;
        user.onboardingSteps.profilePic = true;
        break;

      case "dateOfBirth":
        user.dateOfBirth = new Date(data.dateOfBirth);
        user.onboardingSteps.dateOfBirth = true;
        break;

      case "currentLocation": {
        // Handle totalDancers count when changing cities
        const oldCityId = user.city;
        const newCityId = data.city;

        // If user had a previous city, decrement its totalDancers
        if (oldCityId && oldCityId.toString() !== newCityId) {
          await City.findByIdAndUpdate(oldCityId, {
            $inc: { totalDancers: -1 },
          });
        }

        // If new city is different from old city, increment its totalDancers
        if (newCityId && (!oldCityId || oldCityId.toString() !== newCityId)) {
          await City.findByIdAndUpdate(newCityId, {
            $inc: { totalDancers: 1 },
          });
        }

        user.city = newCityId;
        user.onboardingSteps.currentLocation = true;
        break;
      }

      case "citiesVisited":
        user.citiesVisited = data.citiesVisited;
        user.onboardingSteps.citiesVisited = true;
        break;

      case "anthem":
        user.anthem = {
          url: data.anthem.url,
          platform: data.anthem.platform,
          title: data.anthem.title,
          artist: data.anthem.artist,
        };
        user.onboardingSteps.anthem = true;
        break;

      case "socialMedia":
        user.socialMedia = {
          instagram: data.socialMedia.instagram || "",
          tiktok: data.socialMedia.tiktok || "",
          youtube: data.socialMedia.youtube || "",
        };
        user.onboardingSteps.socialMedia = true;
        break;

      case "danceRole":
        user.danceRole = data.danceRole;
        user.onboardingSteps.danceRole = true;
        break;

      case "gender":
        user.gender = data.gender;
        user.onboardingSteps.gender = true;
        break;

      case "nationality":
        user.nationality = data.nationality;
        user.onboardingSteps.nationality = true;
        break;

      default:
        return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Check if profile is complete
    const steps = user.onboardingSteps;
    const isComplete = Object.values(steps).every((step) => step === true);
    user.isProfileComplete = isComplete;

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        isProfileComplete: user.isProfileComplete,
        onboardingSteps: user.onboardingSteps,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
