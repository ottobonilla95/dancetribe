import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import DanceStyle from "@/models/DanceStyle";
import { City as CityType } from "@/types";
import { DanceStyle as DanceStyleType } from "@/types/dance-style";
import DiscoveryFeed from "@/components/DiscoveryFeed";
import CityList from "@/components/organisims/CityList";
import HotDanceStyles from "@/components/HotDanceStyles";
import StatsPreview from "@/components/StatsPreview";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getInitialDancers(currentUserId: string) {
  try {
    await connectMongo();

    // Get current user's city
    const currentUser = await User.findById(currentUserId).select("city");

    // Simple: just get local dancers (since "Near Me" is default)
    const users = await User.find({
      _id: { $ne: currentUserId },
      isProfileComplete: true,
      city: currentUser?.city, // Only same city for initial load
    })
      .populate({
        path: "city",
        model: City,
        populate: {
          path: "country",
          model: Country,
          select: "name code",
        },
      })
      .select("-email -friendRequestsSent -friendRequestsReceived -friends")
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(12)
      .lean();

    // Get all dance styles for mapping
    const allDanceStyles = await DanceStyle.find({ isActive: true });
    const danceStyleMap = new Map(
      allDanceStyles.map((ds) => [ds._id.toString(), ds.name])
    );

    // Transform the data
    const transformedUsers = users.map((user: any) => {
      const danceStylesPopulated =
        user.danceStyles?.map((userStyle: any) => ({
          name: danceStyleMap.get(userStyle.danceStyle.toString()) || "Unknown",
          level: userStyle.level,
          _id: userStyle.danceStyle,
        })) || [];

      return {
        ...user,
        _id: user._id.toString(),
        city: user.city
          ? {
              ...user.city,
              _id: user.city._id.toString(),
              country: user.city.country
                ? {
                    ...user.city.country,
                    _id: user.city.country._id?.toString(),
                  }
                : null,
            }
          : null,
        danceStylesPopulated,
        likedBy: user.likedBy || [],
      };
    });

    return transformedUsers;
  } catch (error) {
    console.error("Error fetching initial dancers:", error);
    return [];
  }
}

async function getDanceStyles(): Promise<DanceStyleType[]> {
  try {
    await connectMongo();

    const danceStyles = await DanceStyle.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return danceStyles.map((style: any) => ({
      ...style,
      _id: style._id.toString(),
      id: style._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching dance styles:", error);
    return [];
  }
}

async function getHotDanceStyles(): Promise<
  (DanceStyleType & { userCount: number })[]
> {
  try {
    await connectMongo();

    // Aggregate to count users per dance style
    const hotStyles = await User.aggregate([
      // Only count users with complete profiles
      { $match: { isProfileComplete: true } },
      // Unwind the danceStyles array to get individual style documents
      { $unwind: "$danceStyles" },
      // Group by dance style and count users
      {
        $group: {
          _id: "$danceStyles.danceStyle",
          userCount: { $sum: 1 },
        },
      },
      // Sort by user count (most popular first)
      { $sort: { userCount: -1 } },
      // Limit to top 6
      { $limit: 6 },
      // Lookup dance style details
      {
        $lookup: {
          from: "dancestyles",
          localField: "_id",
          foreignField: "_id",
          as: "styleDetails",
        },
      },
      // Unwind style details
      { $unwind: "$styleDetails" },
      // Only include active styles
      { $match: { "styleDetails.isActive": true } },
      // Project final structure
      {
        $project: {
          _id: "$styleDetails._id",
          name: "$styleDetails.name",
          category: "$styleDetails.category",
          isActive: "$styleDetails.isActive",
          userCount: 1,
        },
      },
    ]);

    return hotStyles.map((style: any) => ({
      ...style,
      _id: style._id.toString(),
      id: style._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching hot dance styles:", error);
    return [];
  }
}

async function getCommunityStats() {
  try {
    await connectMongo();

    // Get total dancers
    const totalDancers = await User.countDocuments({ isProfileComplete: true });

    // Get unique countries count
    const countries = await User.aggregate([
      { $match: { isProfileComplete: true, city: { $exists: true } } },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "cityData",
        },
      },
      { $unwind: "$cityData" },
      {
        $lookup: {
          from: "countries",
          localField: "cityData.country",
          foreignField: "_id",
          as: "countryData",
        },
      },
      { $unwind: "$countryData" },
      { $group: { _id: "$countryData._id" } },
      { $count: "totalCountries" },
    ]);

    // Get unique cities count
    const cities = await User.aggregate([
      { $match: { isProfileComplete: true, city: { $exists: true } } },
      { $group: { _id: "$city" } },
      { $count: "totalCities" },
    ]);

    // Get top dance style
    const topStyle = await User.aggregate([
      { $match: { isProfileComplete: true } },
      { $unwind: "$danceStyles" },
      { $group: { _id: "$danceStyles.danceStyle", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "dancestyles",
          localField: "_id",
          foreignField: "_id",
          as: "styleDetails",
        },
      },
      { $unwind: "$styleDetails" },
    ]);

    // Get leader/follower ratio - simplified query
    const roleStats = await User.aggregate([
      { $match: { isProfileComplete: true } },
      { $group: { _id: "$danceRole", count: { $sum: 1 } } },
    ]);

    // Process role stats with correct mapping
    const roleData = { leaders: 0, followers: 0, both: 0 };
    roleStats.forEach((role: any) => {
      console.log("Processing role:", role); // Debug each role
      if (role._id === "leader") {
        roleData.leaders = role.count;
      } else if (role._id === "follower") {
        roleData.followers = role.count;
      } else if (role._id === "both") {
        roleData.both = role.count;
      }
    });

    // Debug log
    console.log("Role stats debug:", {
      roleStats,
      roleData,
      totalUsers: totalDancers,
    });

    // Get category emoji for top style
    const getCategoryEmoji = (category: string) => {
      switch (category) {
        case "latin":
          return "🌶️";
        case "ballroom":
          return "👑";
        case "street":
          return "🏙️";
        case "contemporary":
          return "🎨";
        case "traditional":
          return "🏛️";
        default:
          return "💃";
      }
    };

    // Get country breakdown for map
    const countryBreakdown = await User.aggregate([
      { $match: { isProfileComplete: true, city: { $exists: true } } },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "cityData",
        },
      },
      { $unwind: "$cityData" },
      {
        $lookup: {
          from: "countries",
          localField: "cityData.country",
          foreignField: "_id",
          as: "countryData",
        },
      },
      { $unwind: "$countryData" },
      {
        $group: {
          _id: "$countryData._id",
          name: { $first: "$countryData.name" },
          code: { $first: "$countryData.code" },
          dancerCount: { $sum: 1 },
        },
      },
      { $sort: { dancerCount: -1 } },
    ]);

    return {
      totalDancers,
      totalCountries: countries[0]?.totalCountries || 0,
      totalCities: cities[0]?.totalCities || 0,
      topDanceStyle: {
        name: topStyle[0]?.styleDetails?.name || "Bachata",
        count: topStyle[0]?.count || 0,
        emoji: getCategoryEmoji(topStyle[0]?.styleDetails?.category || "latin"),
      },
      leaderFollowerRatio: roleData,
      countryData: countryBreakdown,
    };
  } catch (error) {
    console.error("Error fetching community stats:", error);
    return {
      totalDancers: 0,
      totalCountries: 0,
      totalCities: 0,
      topDanceStyle: { name: "Bachata", count: 0, emoji: "🌶️" },
      leaderFollowerRatio: { leaders: 0, followers: 0, both: 0 },
      countryData: [],
    };
  }
}

async function getCities(): Promise<CityType[]> {
  console.log("🚀 getCities FUNCTION CALLED");
  try {
    await connectMongo();

    const cities = await City.find({ rank: { $gt: 0 } })
      .populate({ path: "country", model: Country, select: "name code" })
      .populate({ path: "continent", model: Continent, select: "name" })
      .sort({ rank: 1 })
      .limit(6) // Reduced to show fewer cities since we have the discovery feed
      .lean();

    const result = cities.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      country: { name: doc.country?.name || "", code: doc.country?.code || "" },
      continent: { name: doc.continent?.name || "" },
    }));

    return result;
  } catch (error) {
    return [];
  }
}

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Check if user profile is complete
  try {
    await connectMongo();
    const user = await User.findById(session.user.id);

    if (user && !user.isProfileComplete) {
      // Redirect to onboarding if profile is not complete
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("Error checking user profile:", error);
  }

  // Fetch data in parallel
  const [initialDancers, danceStyles, cities, hotDanceStyles, communityStats] =
    await Promise.all([
      getInitialDancers(session.user.id),
      getDanceStyles(),
      getCities(),
      getHotDanceStyles(),
      getCommunityStats(),
    ]);

  return (
    <main className="min-h-screen pb-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hot Cities Section */}
        <h2 className="max-w-3xl font-extrabold text-xl md:text-2xl tracking-tight mb-2 md:mb-8">
          Hottest Dance Cities 🔥
        </h2>
        <CityList initialCities={cities} />
        <div className="flex justify-center mt-6">
          <Link
            href="/cities"
            className="btn btn-outline btn-sm md:btn-md"
          >
            View All Cities
          </Link>
        </div>

        {/* Hot Dance Styles Section */}
        <div className="mt-12">
          <HotDanceStyles danceStyles={hotDanceStyles} />
        </div>

        {/* Community Stats Section */}
        <div className="mt-12">
          <StatsPreview
            stats={communityStats}
            countryData={communityStats.countryData}
          />
        </div>

        {/* Discovery Feed */}
        <div className="mt-12">
          <DiscoveryFeed
            initialDancers={initialDancers}
            danceStyles={danceStyles}
          />
        </div>
      </div>
    </main>
  );
}
