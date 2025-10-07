import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CityList from "@/components/organisims/CityList";
import Footer from "@/components/Footer";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import { City as CityType } from "@/types";
import Link from "next/link";
import HotDanceStyles from "@/components/HotDanceStyles";
import { DanceStyle as DanceStyleType } from "@/types/dance-style";
import User from "@/models/User";
import DanceStyle from "@/models/DanceStyle";
import ButtonSignin from "@/components/ButtonSignin";
import { CONTACT } from "@/constants/contact";
import DancerCard from "@/components/DancerCard";

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
async function getCities(): Promise<CityType[]> {
  console.log("🚀 getCities FUNCTION CALLED");
  try {
    await connectMongo();

    const cities = await City.find({ rank: { $gt: 0 } })
      .populate({ path: "country", model: Country, select: "name code" })
      .populate({ path: "continent", model: Continent, select: "name" })
      .sort({ rank: 1 })
      .limit(10)
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

async function getRecentDancers() {
  try {
    await connectMongo();

    const users = await User.find({
      isProfileComplete: true,
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
      .select("name username image danceStyles city likedBy")
      .sort({ createdAt: -1 })
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
      };
    });

    return transformedUsers;
  } catch (error) {
    console.error("Error fetching recent dancers:", error);
    return [];
  }
}

export default async function Home() {
  // Check if user is logged in and redirect to dashboard
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  // Fetch data in parallel
  const [cities, hotDanceStyles, recentDancers] = await Promise.all([
    getCities(),
    getHotDanceStyles(),
    getRecentDancers(),
  ]);

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl font-extrabold text-xl md:text-2xl tracking-tight mb-2 md:mb-8">
            Hottest Dance Cities 🔥
          </h2>
          <CityList initialCities={cities} />
          {/* <div className="flex justify-center mt-6">
            <Link href="/cities" className="btn btn-outline btn-sm md:btn-md">
              View All Cities
            </Link>
          </div> */}
          {/* Hot Dance Styles Section */}
          <div className="mt-12">
            <HotDanceStyles danceStyles={hotDanceStyles} />
          </div>

          {/* Meet Our Community Section */}
          {recentDancers.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="max-w-3xl font-extrabold text-xl md:text-2xl tracking-tight">
                    Meet Dancers, Make Friends 🌍
                  </h2>
                  <p className="text-base-content/60 mt-1">
                    Connect with dancers from around the world
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentDancers.map((dancer) => (
                  <DancerCard key={dancer._id} dancer={dancer} showLikeButton={false} showFlag={true} />
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-8">
                <ButtonSignin 
                  text="Join the Community" 
                  extraStyle="btn-primary btn-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-10" />

        {/* <CTA /> */}
      </main>
      <Footer />
    </>
  );
}
