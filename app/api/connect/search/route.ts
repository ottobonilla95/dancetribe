import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Country from "@/models/Country";
import DanceStyle from "@/models/DanceStyle";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("mode"); // "travelers" or "practice"
    const cityId = searchParams.get("cityId");

    if (!mode || !cityId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await connectMongo();

    // Get the current user to find compatible dance styles
    const currentUser: any = await User.findOne({ email: session.user.email })
      .select("danceStyles")
      .lean();

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let dancers: any[] = [];

    if (mode === "travelers") {
      // Find solo dancers who are:
      // 1. Open to meeting other solo dancers AND
      // 2. Have their activeCity set to the searched city

      dancers = await User.aggregate([
        {
          $match: {
            isProfileComplete: true,
            email: { $ne: session.user.email }, // Exclude current user
            openToMeetTravelers: true,
            activeCity: new mongoose.Types.ObjectId(cityId),
          },
        },
        // Lookup city details
        {
          $lookup: {
            from: "cities",
            localField: "city",
            foreignField: "_id",
            as: "cityData",
          },
        },
        {
          $unwind: {
            path: "$cityData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup country for the city
        {
          $lookup: {
            from: "countries",
            localField: "cityData.country",
            foreignField: "_id",
            as: "countryData",
          },
        },
        {
          $unwind: {
            path: "$countryData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Project fields
        {
          $project: {
            name: 1,
            username: 1,
            image: 1,
            danceStyles: 1,
            city: {
              _id: "$cityData._id",
              name: "$cityData.name",
              country: {
                _id: "$countryData._id",
                name: "$countryData.name",
                code: "$countryData.code",
              },
            },
            likedBy: 1,
            dateOfBirth: 1,
            nationality: 1,
            dancingStartYear: 1,
            socialMedia: 1,
            danceRole: 1,
            openToMeetTravelers: 1,
            lookingForPracticePartners: 1,
            trips: 1,
          },
        },
        { $limit: 100 },
      ]);
    } else if (mode === "practice") {
      // Find dancers who are:
      // 1. Looking for practice partners AND
      // 2. Have their activeCity set to the searched city AND
      // 3. Have at least one compatible dance style

      // Get current user's dance style IDs
      const currentUserStyleIds = currentUser.danceStyles.map(
        (ds: any) => ds.danceStyle.toString()
      );

      dancers = await User.aggregate([
        {
          $match: {
            isProfileComplete: true,
            email: { $ne: session.user.email },
            lookingForPracticePartners: true,
            activeCity: new mongoose.Types.ObjectId(cityId),
            // Has at least one compatible dance style
            "danceStyles.danceStyle": {
              $in: currentUserStyleIds.map(
                (id: string) => new mongoose.Types.ObjectId(id)
              ),
            },
          },
        },
        // Lookup city details
        {
          $lookup: {
            from: "cities",
            localField: "city",
            foreignField: "_id",
            as: "cityData",
          },
        },
        {
          $unwind: {
            path: "$cityData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup country for the city
        {
          $lookup: {
            from: "countries",
            localField: "cityData.country",
            foreignField: "_id",
            as: "countryData",
          },
        },
        {
          $unwind: {
            path: "$countryData",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Project fields
        {
          $project: {
            name: 1,
            username: 1,
            image: 1,
            danceStyles: 1,
            city: {
              _id: "$cityData._id",
              name: "$cityData.name",
              country: {
                _id: "$countryData._id",
                name: "$countryData.name",
                code: "$countryData.code",
              },
            },
            likedBy: 1,
            dateOfBirth: 1,
            nationality: 1,
            dancingStartYear: 1,
            socialMedia: 1,
            danceRole: 1,
            openToMeetTravelers: 1,
            lookingForPracticePartners: 1,
          },
        },
        { $limit: 100 },
      ]);
    }

    // Get all dance styles to populate the names
    const allDanceStyles = await DanceStyle.find({ isActive: true }).lean();
    const danceStyleMap = new Map(
      allDanceStyles.map((ds) => [ds._id.toString(), ds.name])
    );

    // Transform dancers data
    const transformedDancers = dancers.map((dancer) => {
      const danceStylesPopulated =
        dancer.danceStyles?.map((userStyle: any) => ({
          name:
            danceStyleMap.get(userStyle.danceStyle.toString()) || "Unknown",
          level: userStyle.level,
          _id: userStyle.danceStyle,
        })) || [];

      return {
        ...dancer,
        _id: dancer._id.toString(),
        city: dancer.city
          ? {
              ...dancer.city,
              _id: dancer.city._id?.toString(),
              country: dancer.city.country
                ? {
                    ...dancer.city.country,
                    _id: dancer.city.country._id?.toString(),
                  }
                : null,
            }
          : null,
        danceStylesPopulated,
      };
    });

    return NextResponse.json({
      success: true,
      dancers: transformedDancers,
      count: transformedDancers.length,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search dancers" },
      { status: 500 }
    );
  }
}

