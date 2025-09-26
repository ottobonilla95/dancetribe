import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import User from "@/models/User";
import DanceStyle from "@/models/DanceStyle";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaGlobeAmericas,
  FaHeart,
  FaMusic,
} from "react-icons/fa";

interface Props {
  params: {
    cityId: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  await connectMongo();

  // Check if the cityId is a valid ObjectId
  if (!isValidObjectId(params.cityId)) {
    notFound();
  }

  // Get current session
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  // Pagination setup
  const currentPage = parseInt(searchParams.page || "1");
  const dancersPerPage = 12;
  const skip = (currentPage - 1) * dancersPerPage;

  let city: any;
  try {
    city = await City.findById(params.cityId)
      .populate({
        path: "country",
        model: Country,
        select: "name code",
      })
      .populate({
        path: "continent",
        model: Continent,
        select: "name",
      })
      .lean();

    if (!city) {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching city:", error);
    notFound();
  }

  // Convert cityId to ObjectId for MongoDB queries
  const cityObjectId = new mongoose.Types.ObjectId(params.cityId);

  // Get dancers in this city (with pagination)
  const dancers = await User.find({
    city: cityObjectId,
    isProfileComplete: true,
  })
    .select("name username image danceStyles")
    .populate({
      path: "danceStyles.danceStyle",
      model: DanceStyle,
      select: "name",
    })
    .skip(skip)
    .limit(dancersPerPage)
    .lean();

  // Get dance styles popular in this city
  const danceStylesInCity = await User.aggregate([
    { $match: { city: cityObjectId, isProfileComplete: true } },
    { $unwind: "$danceStyles" },
    { $group: { _id: "$danceStyles.danceStyle", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
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

  // Calculate some stats
  const totalDancers = await User.countDocuments({
    city: cityObjectId,
    isProfileComplete: true,
  });

  const totalDancersWhoVisited = await User.countDocuments({
    citiesVisited: cityObjectId,
    isProfileComplete: true,
  });

  // Pagination calculations
  const totalPages = Math.ceil(totalDancers / dancersPerPage);

  // Format population
  const formatNumber = (num: number | null | undefined) => {
    if (!num || num === 0) {
      return "Unknown";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {city.image && (
              <div className="w-20 h-20 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                {city.name}
              </h1>
              <div className="flex items-center gap-4 text-base-content/70">
                <span className="flex items-center gap-1">
                  <FaMapMarkerAlt />
                  {city.country?.name}, {city.continent?.name}
                </span>
                <span className="flex items-center gap-1">
                  <FaUsers />
                  {formatNumber(totalDancers)} dancers
                </span>
              </div>
            </div>
          </div>

          {city.description && (
            <p className="text-lg text-base-content/80 max-w-3xl">
              {city.description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-primary">
              <FaMusic className="text-3xl" />
            </div>
            <div className="stat-title">Dancers Living Here</div>
            <div className="stat-value text-primary">{totalDancers}</div>
            <div className="stat-desc">Active dance community members</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-secondary">
              <FaGlobeAmericas className="text-3xl" />
            </div>
            <div className="stat-title">Visitors</div>
            <div className="stat-value text-secondary">
              {totalDancersWhoVisited}
            </div>
            <div className="stat-desc">Dancers who&apos;ve visited for dance</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-accent">
              <FaHeart className="text-3xl" />
            </div>
            <div className="stat-title">Dance Density</div>
            <div className="stat-value text-accent">
              {totalDancers > 0
                ? Math.round((totalDancers / city.population) * 100000)
                : 0}
            </div>
            <div className="stat-desc">Dancers per 100K people</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Dance Styles */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Popular Dance Styles</h2>
                {danceStylesInCity.length > 0 ? (
                  <div className="space-y-3">
                    {danceStylesInCity.map((style: any, index: number) => (
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
                            {style.count} dancer{style.count !== 1 ? "s" : ""}
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
          </div>

          {/* Dancers in this City */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Dancers in {city.name}</h2>
                  <span className="text-sm text-base-content/60">
                    Page {currentPage} of {totalPages} (
                    {formatNumber(totalDancers)} total)
                  </span>
                </div>

                {dancers.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {dancers.map((dancer: any) => (
                        <Link
                          key={dancer._id}
                          href={`/dancer/${dancer._id}`}
                          className="group"
                        >
                          <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
                            <div className="card-body p-3">
                              <div className="flex flex-col items-center text-center">
                                <div className="avatar mb-2">
                                  <div className="w-12 h-12 rounded-full">
                                    {dancer.image ? (
                                      <img
                                        src={dancer.image}
                                        alt={dancer.name}
                                        className="w-full h-full object-cover rounded-full"
                                      />
                                    ) : (
                                      <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                                        <span className="text-sm">
                                          {dancer.name
                                            ?.charAt(0)
                                            ?.toUpperCase() || "?"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <h3 className="font-medium text-sm truncate w-full">
                                  {dancer.name}
                                </h3>
                                {dancer.username && (
                                  <p className="text-xs text-base-content/60 truncate w-full">
                                    @{dancer.username}
                                  </p>
                                )}
                                {dancer.danceStyles &&
                                  dancer.danceStyles.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                      {dancer.danceStyles
                                        .slice(0, 2)
                                        .map((ds: any, index: number) => (
                                          <span
                                            key={index}
                                            className="badge badge-xs badge-outline"
                                          >
                                            {ds.danceStyle?.name}
                                          </span>
                                        ))}
                                      {dancer.danceStyles.length > 2 && (
                                        <span className="badge badge-xs badge-outline">
                                          +{dancer.danceStyles.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={`/city/${params.cityId}`}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-base-content/60">
                    <FaUsers className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>No dancers found in {city.name} yet</p>
                    {isLoggedIn && (
                      <p className="text-sm mt-2">
                        Be the first to{" "}
                        <Link href="/profile" className="link link-primary">
                          set this as your location
                        </Link>
                        !
                      </p>
                    )}
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
                  Join the Dance Community in {city.name}
                </h2>
                <p className="mb-4">
                  Connect with {totalDancers} dancers and discover the amazing
                  dance scene in your city!
                </p>
                <div className="card-actions justify-center">
                  <Link href="/api/auth/signin" className="btn btn-white">
                    Join DanceTribe
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
