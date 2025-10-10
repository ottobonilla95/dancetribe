import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { 
  FaUsers, 
  FaGlobeAmericas, 
  FaMusic, 
  FaTrophy,
  FaMapMarkerAlt
} from "react-icons/fa";
import WorldMap from "@/components/WorldMap";
import { getCountryCode } from "@/utils/countries";

export const dynamic = "force-dynamic";

async function getDetailedStats() {
  try {
    await connectMongo();

    // Basic stats
    const totalDancers = await User.countDocuments({ isProfileComplete: true });
    
    // Countries with dancer counts
    const countryStats = await User.aggregate([
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

    // Cities with dancer counts
    const cityStats = await User.aggregate([
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
          _id: "$cityData._id",
          name: { $first: "$cityData.name" },
          country: { $first: "$countryData.name" },
          countryCode: { $first: "$countryData.code" },
          image: { $first: "$cityData.image" },
          dancerCount: { $sum: 1 },
        },
      },
      { $sort: { dancerCount: -1 } },
      { $limit: 20 },
    ]);

    // Dance styles with counts
    const danceStyleStats = await User.aggregate([
      { $match: { isProfileComplete: true } },
      { $unwind: "$danceStyles" },
      { $group: { _id: "$danceStyles.danceStyle", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "dancestyles",
          localField: "_id",
          foreignField: "_id",
          as: "styleDetails",
        },
      },
      { $unwind: "$styleDetails" },
      {
        $project: {
          name: "$styleDetails.name",
          category: "$styleDetails.category",
          emoji: "$styleDetails.emoji",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Role distribution
    const roleStats = await User.aggregate([
      { $match: { isProfileComplete: true } },
      { $group: { _id: "$danceRole", count: { $sum: 1 } } },
    ]);

    // Age distribution
    const ageStats = await User.aggregate([
      { $match: { isProfileComplete: true, age: { $exists: true } } },
      {
        $bucket: {
          groupBy: "$age",
          boundaries: [18, 25, 30, 35, 40, 45, 50, 60, 100],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    // Gender distribution
    const genderStats = await User.aggregate([
      { $match: { isProfileComplete: true } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Nationality distribution (top 15) - using actual nationality field
    const nationalityStats = await User.aggregate([
      { $match: { isProfileComplete: true, nationality: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$nationality",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
      {
        $project: {
          name: "$_id",
          count: 1,
        },
      },
    ]);



    // Process role data
    const roleData = { leaders: 0, followers: 0, both: 0 };
    roleStats.forEach((role: any) => {
      if (role._id === "leader") roleData.leaders = role.count;
      else if (role._id === "follower") roleData.followers = role.count;
      else if (role._id === "both") roleData.both = role.count;
    });

    return {
      totalDancers,
      totalCountries: countryStats.length,
      totalCities: cityStats.length,
      countryStats,
      cityStats,
      danceStyleStats,
      roleStats: roleData,
      ageStats,
      genderStats,
      nationalityStats,
    };
  } catch (error) {
    console.error("Error fetching detailed stats:", error);
          return {
        totalDancers: 0,
        totalCountries: 0,
        totalCities: 0,
        countryStats: [],
        cityStats: [],
        danceStyleStats: [],
        roleStats: { leaders: 0, followers: 0, both: 0 },
        ageStats: [],
        genderStats: [],
        nationalityStats: [],
      };
  }
}

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/");
  }

  const stats = await getDetailedStats();

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const totalRoles = stats.roleStats.leaders + stats.roleStats.followers + stats.roleStats.both;

  return (
    <main className="min-h-screen pb-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          {/* Back link - above title on mobile, inline on desktop */}
          <div className="mb-4 md:mb-0">
            <BackButton label="Back" className="md:hidden" />
          </div>
          
          <div className="flex items-center gap-4">
            <BackButton label="Back" className="hidden md:flex" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Community Analytics
              </h1>
              <p className="text-base-content/60 mt-2">
                Comprehensive insights into our global dance community
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-lg p-6">
            <div className="stat-figure text-primary">
              <FaUsers className="text-3xl" />
            </div>
            <div className="stat-title">Total Dancers</div>
            <div className="stat-value text-primary text-2xl">
              {formatNumber(stats.totalDancers)}
            </div>
            <div className="stat-desc">Active community members</div>
          </div>

          <div className="stat bg-base-200 rounded-lg p-6">
            <div className="stat-figure text-secondary">
              <FaGlobeAmericas className="text-3xl" />
            </div>
            <div className="stat-title">Countries</div>
            <div className="stat-value text-secondary text-2xl">
              {stats.totalCountries}
            </div>
            <div className="stat-desc">Global presence</div>
          </div>

          <div className="stat bg-base-200 rounded-lg p-6">
            <div className="stat-figure text-accent">
              <FaMapMarkerAlt className="text-3xl" />
            </div>
            <div className="stat-title">Cities</div>
            <div className="stat-value text-accent text-2xl">
              {stats.totalCities}
            </div>
            <div className="stat-desc">Urban communities</div>
          </div>

          <div className="stat bg-base-200 rounded-lg p-6">
            <div className="stat-figure text-info">
              <FaMusic className="text-3xl" />
            </div>
            <div className="stat-title">Dance Styles</div>
            <div className="stat-value text-info text-2xl">
              {stats.danceStyleStats.length}
            </div>
            <div className="stat-desc">Different styles practiced</div>
          </div>
        </div>

        {/* Demographics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Role Distribution */}
          <div className="bg-base-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💃🕺</span>
              Role Distribution
            </h2>
            {totalRoles > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Leaders</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {getPercentage(stats.roleStats.leaders, totalRoles)}%
                    </span>
                    <div className="text-xs text-base-content/60">
                      ({stats.roleStats.leaders})
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Followers</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-secondary">
                      {getPercentage(stats.roleStats.followers, totalRoles)}%
                    </span>
                    <div className="text-xs text-base-content/60">
                      ({stats.roleStats.followers})
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Both</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-accent">
                      {getPercentage(stats.roleStats.both, totalRoles)}%
                    </span>
                    <div className="text-xs text-base-content/60">
                      ({stats.roleStats.both})
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-base-content/60">No role data available yet</p>
            )}
          </div>

          {/* Gender Distribution */}
          <div className="bg-base-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">👥</span>
              Gender Distribution
            </h2>
            {stats.genderStats.length > 0 ? (
              <div className="space-y-3">
                {stats.genderStats.map((gender: any) => (
                  <div key={gender._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {gender._id || 'Not specified'}
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        {getPercentage(gender.count, stats.totalDancers)}%
                      </span>
                      <div className="text-xs text-base-content/60">
                        ({gender.count})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-base-content/60">No gender data available yet</p>
            )}
          </div>
        </div>

        {/* Top Dance Styles */}
        <div className="bg-base-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Most Popular Dance Styles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.danceStyleStats.slice(0, 9).map((style: any, index: number) => (
              <Link key={style._id} href={`/dance-style/${style._id}`}>
                <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{style.emoji || "💃"}</span>
                    <div>
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-base-content/60 capitalize">{style.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{style.count}</div>
                    <div className="text-xs text-base-content/60">dancers</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Nationality Breakdown */}
        <div className="bg-base-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaGlobeAmericas className="text-blue-500" />
            Dancers by Nationality
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.nationalityStats.map((country: any, index: number) => {
              // Convert country code to flag emoji
              const getCountryFlag = (countryName: string) => {
                const countryCode = getCountryCode(countryName);
                if (!countryCode || countryCode.length !== 2) return "🌍";
                const codePoints = countryCode
                  .toUpperCase()
                  .split('')
                  .map(char => 127397 + char.charCodeAt(0));
                return String.fromCodePoint(...codePoints);
              };

              return (
                <div key={country._id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getCountryFlag(country.name)}</span>
                    <div>
                      <div className="font-medium text-sm">{country.name}</div>
                      <div className="text-xs text-base-content/60">#{index + 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{country.count}</div>
                    <div className="text-xs text-base-content/60">
                      {getPercentage(country.count, stats.totalDancers)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-base-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-green-500" />
            Hottest Dance Cities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.cityStats.slice(0, 10).map((city: any, index: number) => (
              <Link key={city._id} href={`/city/${city._id}`}>
                <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg hover:bg-base-200 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {city.image ? (
                        <img
                          src={city.image}
                          alt={city.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                          <span className="text-lg">🏙️</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{city.name}</div>
                      <div className="text-xs text-base-content/60">{city.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{city.dancerCount}</div>
                    <div className="text-xs text-base-content/60">dancers</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* World Map */}
        {stats.countryStats.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaGlobeAmericas className="text-purple-500" />
              Global Distribution
            </h2>
            <WorldMap countryData={stats.countryStats} />
          </div>
        )}


      </div>
    </main>
  );
} 