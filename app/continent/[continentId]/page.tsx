import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Continent from "@/models/Continent";
import Country from "@/models/Country";
import User from "@/models/User";
import City from "@/models/City";
import DanceStyle from "@/models/DanceStyle";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import Link from "next/link";
import DancersFilter from "@/components/DancersFilter";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaGlobeAmericas,
  FaHeart,
  FaMusic,
  FaCity,
  FaFlag,
} from "react-icons/fa";

interface Props {
  params: {
    continentId: string;
  };
}

export default async function ContinentPage({ params }: Props) {
  await connectMongo();

  // Check if the continentId is a valid ObjectId
  if (!isValidObjectId(params.continentId)) {
    notFound();
  }

  // Get current session
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  // Get current user's dance styles for filtering
  let userDanceStyles: string[] = [];
  if (session?.user?.id) {
    const currentUser: any = await User.findById(session.user.id)
      .select("danceStyles")
      .lean();
    if (currentUser?.danceStyles && Array.isArray(currentUser.danceStyles)) {
      userDanceStyles = currentUser.danceStyles.map((ds: any) => 
        ds.danceStyle.toString()
      );
    }
  }

  let continent: any;
  try {
    continent = await Continent.findById(params.continentId).lean();

    if (!continent) {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching continent:", error);
    notFound();
  }

  // Convert continentId to ObjectId for MongoDB queries
  const continentObjectId = new mongoose.Types.ObjectId(params.continentId);

  // Get all countries in this continent
  const countriesInContinent = await Country.find({
    continent: continentObjectId,
    isActive: true,
  })
    .select("_id")
    .lean();

  const countryIds = countriesInContinent.map((country: any) => country._id);

  // Get all cities in these countries
  const citiesInContinent = await City.find({
    country: { $in: countryIds },
    isActive: true,
  })
    .select("_id")
    .lean();

  const cityIds = citiesInContinent.map((city: any) => city._id);

  // Get ALL dancers in this continent (for client-side filtering)
  const dancers: any[] = await User.find({
    city: { $in: cityIds },
    isProfileComplete: true,
  })
    .select("name username image danceStyles city")
    .populate({
      path: "city",
      model: City,
      select: "name country",
      populate: {
        path: "country",
        model: Country,
        select: "name code"
      }
    })
    .populate({
      path: "danceStyles.danceStyle",
      model: DanceStyle,
      select: "name",
    })
    .lean();

  // Get dancers count for this continent
  const totalDancers = await User.countDocuments({
    city: { $in: cityIds },
    isProfileComplete: true,
  });

  // Get dance styles popular in this continent
  const danceStylesInContinent = await User.aggregate([
    { $match: { city: { $in: cityIds }, isProfileComplete: true } },
    { $unwind: "$danceStyles" },
    { $group: { _id: "$danceStyles.danceStyle", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "dancestyles",
        localField: "_id",
        foreignField: "_id",
        as: "style",
      },
    },
    { $unwind: "$style" },
    { $project: { name: "$style.name", count: 1 } },
  ]);

  // Get all countries in this continent
  const allCountries = await Country.find({
    continent: continentObjectId,
    isActive: true,
  })
    .select("name code")
    .lean();

  // Calculate dancers per country dynamically
  const countriesWithDancers = await Promise.all(
    allCountries.map(async (country: any) => {
      const citiesInCountry = await City.find({
        country: country._id,
        isActive: true,
      }).select("_id").lean();
      
      const cityIdsInCountry = citiesInCountry.map((c: any) => c._id);
      
      const dancerCount = await User.countDocuments({
        city: { $in: cityIdsInCountry },
        isProfileComplete: true,
      });

      return {
        ...country,
        totalDancers: dancerCount,
      };
    })
  );

  // Filter and sort countries with dancers
  const topCountries = countriesWithDancers
    .filter((c: any) => c.totalDancers > 0)
    .sort((a: any, b: any) => b.totalDancers - a.totalDancers)
    .slice(0, 10);

  // Get top cities in this continent
  const topCities = await City.find({
    country: { $in: countryIds },
    isActive: true,
    totalDancers: { $gt: 0 },
  })
    .select("name totalDancers image country")
    .populate({
      path: "country",
      model: Country,
      select: "name code"
    })
    .sort({ totalDancers: -1 })
    .limit(10)
    .lean();

  // Format numbers
  const formatNumber = (num: number | null | undefined) => {
    if (!num || num === 0) {
      return "0";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Get continent emoji
  const getContinentEmoji = (name: string) => {
    const emojiMap: { [key: string]: string } = {
      "Africa": "🌍",
      "Asia": "🌏",
      "Europe": "🌍",
      "North America": "🌎",
      "South America": "🌎",
      "Oceania": "🌏",
      "Antarctica": "🧊"
    };
    return emojiMap[name] || "🌐";
  };

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span>{getContinentEmoji(continent.name)}</span>
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              {continent.name}
            </span>
          </h1>
          <div className="flex items-center gap-4 text-base-content/70">
            <span className="flex items-center gap-1">
              <FaUsers />
              {formatNumber(totalDancers)} dancers
            </span>
            <span className="flex items-center gap-1">
              <FaFlag />
              {topCountries.length} countries
            </span>
            <span className="flex items-center gap-1">
              <FaCity />
              {citiesInContinent.length} cities
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-primary">
              <FaMusic className="text-3xl" />
            </div>
            <div className="stat-title">Total Dancers</div>
            <div className="stat-value text-primary">{formatNumber(totalDancers)}</div>
            <div className="stat-desc">Active dance community members</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-secondary">
              <FaFlag className="text-3xl" />
            </div>
            <div className="stat-title">Countries</div>
            <div className="stat-value text-secondary">{topCountries.length}</div>
            <div className="stat-desc">With active dancers</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-accent">
              <FaCity className="text-3xl" />
            </div>
            <div className="stat-title">Cities</div>
            <div className="stat-value text-accent">{formatNumber(citiesInContinent.length)}</div>
            <div className="stat-desc">Dance communities</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Popular Dance Styles */}
            <div className="card bg-base-200 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title mb-4">Popular Dance Styles</h2>
                {danceStylesInContinent.length > 0 ? (
                  <div className="space-y-3">
                    {danceStylesInContinent.map((style: any, index: number) => (
                      <Link
                        key={style._id}
                        href={`/dance-style/${style._id}`}
                        className="flex justify-between items-center hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <span className="text-sm font-medium hover:text-primary transition-colors">
                          {style.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/60">
                            {formatNumber(style.count)} dancer{style.count !== 1 ? "s" : ""}
                          </span>
                          <div className="badge badge-primary badge-sm">
                            #{index + 1}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-base-content/60 text-center py-4">
                    No dance styles data available yet
                  </p>
                )}
              </div>
            </div>

            {/* Top Countries */}
            {topCountries.length > 0 && (
              <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                  <h2 className="card-title mb-4">Top Countries</h2>
                  <div className="space-y-2">
                    {topCountries.map((country: any) => (
                      <Link
                        key={country._id}
                        href={`/country/${country._id}`}
                        className="flex justify-between items-center hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {String.fromCodePoint(...[...country.code].map((c: string) => 127397 + c.charCodeAt(0)))}
                          </span>
                          <span className="text-sm font-medium">
                            {country.name}
                          </span>
                        </div>
                        <span className="text-xs text-base-content/60">
                          {formatNumber(country.totalDancers)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top Cities */}
            {topCities.length > 0 && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title mb-4">Top Cities</h2>
                  <div className="space-y-2">
                    {topCities.map((city: any) => (
                      <Link
                        key={city._id}
                        href={`/city/${city._id}`}
                        className="flex justify-between items-center hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {city.image && (
                            <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={city.image}
                                alt={city.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {city.name}
                            </div>
                            <div className="text-xs text-base-content/60">
                              {city.country?.name}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-base-content/60">
                          {formatNumber(city.totalDancers)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dancers in this Continent */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-6">Dancers in {continent.name}</h2>

                {dancers.length > 0 ? (
                  <DancersFilter
                    dancers={dancers}
                    userDanceStyles={userDanceStyles}
                    locationName={continent.name}
                  />
                ) : (
                  <div className="text-center py-8 text-base-content/60">
                    <FaUsers className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>No dancers found in {continent.name} yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA for non-authenticated users */}
        {!isLoggedIn && (
          <div className="text-center mt-8">
            <div className="card bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title justify-center text-2xl mb-2">
                  Join the Dance Community in {continent.name}
                </h2>
                <p className="mb-4">
                  Connect with {formatNumber(totalDancers)} dancers across {topCountries.length} countries!
                </p>
                <div className="card-actions justify-center">
                  <Link href="/api/auth/signin" className="btn btn-white">
                    Join DanceCircle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

