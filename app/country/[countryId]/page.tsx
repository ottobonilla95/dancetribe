import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import User from "@/models/User";
import City from "@/models/City";
import DanceStyle from "@/models/DanceStyle";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import Flag from "@/components/Flag";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaGlobeAmericas,
  FaHeart,
  FaMusic,
  FaCity,
} from "react-icons/fa";

interface Props {
  params: {
    countryId: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function CountryPage({ params, searchParams }: Props) {
  await connectMongo();

  // Check if the countryId is a valid ObjectId
  if (!isValidObjectId(params.countryId)) {
    notFound();
  }

  // Get current session
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  // Pagination setup
  const currentPage = parseInt(searchParams.page || "1");
  const dancersPerPage = 12;
  const skip = (currentPage - 1) * dancersPerPage;

  let country: any;
  try {
    country = await Country.findById(params.countryId)
      .populate({
        path: "continent",
        model: Continent,
        select: "name code",
      })
      .lean();

    if (!country) {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching country:", error);
    notFound();
  }

  // Convert countryId to ObjectId for MongoDB queries
  const countryObjectId = new mongoose.Types.ObjectId(params.countryId);

  // Get all cities in this country first
  const citiesInCountry = await City.find({
    country: countryObjectId,
    isActive: true,
  })
    .select("_id")
    .lean();

  const cityIds = citiesInCountry.map((city: any) => city._id);

  // Get dancers in this country (with pagination)
  const dancers = await User.find({
    city: { $in: cityIds },
    isProfileComplete: true,
  })
    .select("name username image danceStyles city")
    .populate({
      path: "city",
      model: City,
      select: "name",
    })
    .populate({
      path: "danceStyles.danceStyle",
      model: DanceStyle,
      select: "name",
    })
    .skip(skip)
    .limit(dancersPerPage)
    .lean();

  // Get dancers count for this country
  const totalDancers = await User.countDocuments({
    city: { $in: cityIds },
    isProfileComplete: true,
  });

  // Get dancers who have visited cities in this country
  const totalDancersWhoVisited = await User.countDocuments({
    citiesVisited: { $in: cityIds },
    isProfileComplete: true,
  });

  // Get dance styles popular in this country
  const danceStylesInCountry = await User.aggregate([
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

  // Get role distribution
  const roleDistribution = await User.aggregate([
    { $match: { city: { $in: cityIds }, isProfileComplete: true } },
    { $group: { _id: "$danceRole", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Find most common role
  const mostCommonRole = roleDistribution.length > 0 ? roleDistribution[0] : null;
  const rolePercentage = mostCommonRole && totalDancers > 0 
    ? Math.round((mostCommonRole.count / totalDancers) * 100) 
    : 0;
  const roleLabel = mostCommonRole?._id 
    ? mostCommonRole._id.charAt(0).toUpperCase() + mostCommonRole._id.slice(1)
    : "N/A";

  // Get teachers in this country
  const teachers = await User.find({
    city: { $in: cityIds },
    isProfileComplete: true,
    isTeacher: true,
  })
    .select("name username image danceStyles teacherProfile city")
    .populate({
      path: "city",
      model: City,
      select: "name",
    })
    .populate({
      path: "danceStyles.danceStyle",
      model: DanceStyle,
      select: "name",
    })
    .limit(10)
    .lean();

  // Get DJs in this country
  const djs = await User.find({
    city: { $in: cityIds },
    isProfileComplete: true,
    isDJ: true,
  })
    .select("name username image djProfile city")
    .populate({
      path: "city",
      model: City,
      select: "name",
    })
    .limit(10)
    .lean();

  // Get photographers in this country
  const photographers = await User.find({
    city: { $in: cityIds },
    isProfileComplete: true,
    isPhotographer: true,
  })
    .select("name username image photographerProfile city")
    .populate({
      path: "city",
      model: City,
      select: "name",
    })
    .limit(10)
    .lean();

  // Get most liked dancers in this country
  const mostLikedDancers = await User.aggregate([
    { 
      $match: { 
        city: { $in: cityIds },
        isProfileComplete: true 
      } 
    },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likedBy", []] } }
      }
    },
    { $match: { likesCount: { $gt: 0 } } },
    { $sort: { likesCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "cities",
        localField: "city",
        foreignField: "_id",
        as: "city"
      }
    },
    { $unwind: "$city" },
    {
      $project: {
        name: 1,
        username: 1,
        image: 1,
        likesCount: 1,
        "city.name": 1
      }
    }
  ]);

  // Get top cities in this country
  const topCities = await City.find({
    country: countryObjectId,
    isActive: true,
    totalDancers: { $gt: 0 },
  })
    .select("name totalDancers image")
    .sort({ totalDancers: -1 })
    .limit(10)
    .lean();

  // Pagination calculations
  const totalPages = Math.ceil(totalDancers / dancersPerPage);

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

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">
              <Flag countryCode={country.code} size="lg" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                {country.name}
              </h1>
              <div className="flex items-center gap-4 text-base-content/70">
                <span className="flex items-center gap-1">
                  <FaGlobeAmericas />
                  {country.continent?.name}
                </span>
                <span className="flex items-center gap-1">
                  <FaUsers />
                  {formatNumber(totalDancers)} dancers
                </span>
              </div>
            </div>
          </div>
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
            <div className="stat-title">Most Common Role</div>
            <div className="stat-value text-accent">
              {roleLabel}
            </div>
            <div className="stat-desc">{rolePercentage}% of dancers</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Top Cities */}
            {topCities.length > 0 && (
              <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    <FaCity /> Top Cities
                  </h2>
                  <div className="space-y-3">
                    {topCities.map((city: any, index: number) => (
                      <Link
                        key={city._id}
                        href={`/city/${city._id}`}
                        className="flex items-center justify-between hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {city.image && (
                            <img
                              src={city.image}
                              alt={city.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="text-sm font-medium hover:text-primary transition-colors">
                            {city.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-base-content/60">
                            {city.totalDancers} dancer{city.totalDancers !== 1 ? "s" : ""}
                          </span>
                          <div className="badge badge-primary badge-sm">
                            #{index + 1}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Popular Dance Styles */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">Popular Dance Styles</h2>
                {danceStylesInCountry.length > 0 ? (
                  <div className="space-y-3">
                    {danceStylesInCountry.map((style: any, index: number) => (
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

            {/* Teachers in this Country */}
            {teachers.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    🎓 Dance Teachers
                  </h2>
                  <div className="space-y-3">
                    {teachers.map((teacher: any) => (
                      <Link
                        key={teacher._id}
                        href={`/dancer/${teacher._id}`}
                        className="flex items-center gap-3 hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            {teacher.image ? (
                              <img
                                src={teacher.image}
                                alt={teacher.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                                <span className="text-sm">
                                  {teacher.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {teacher.name}
                          </h3>
                          {teacher.city && (
                            <p className="text-xs text-base-content/60">
                              {teacher.city.name}
                            </p>
                          )}
                        </div>
                        <div className="badge badge-primary badge-sm">View</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DJs in this Country */}
            {djs.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    🎵 DJs
                  </h2>
                  <div className="space-y-3">
                    {djs.map((dj: any) => (
                      <Link
                        key={dj._id}
                        href={`/dancer/${dj._id}`}
                        className="flex items-center gap-3 hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            {dj.image ? (
                              <img
                                src={dj.image}
                                alt={dj.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="bg-secondary text-secondary-content rounded-full w-full h-full flex items-center justify-center">
                                <span className="text-sm">
                                  {dj.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {dj.djProfile?.djName || dj.name}
                          </h3>
                          {dj.city && (
                            <p className="text-xs text-base-content/60">
                              {dj.city.name}
                            </p>
                          )}
                        </div>
                        <div className="badge badge-secondary badge-sm">View</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photographers in this Country */}
            {photographers.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    📷 Photographers
                  </h2>
                  <div className="space-y-3">
                    {photographers.map((photographer: any) => (
                      <Link
                        key={photographer._id}
                        href={`/dancer/${photographer._id}`}
                        className="flex items-center gap-3 hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="avatar">
                          <div className="w-10 h-10 rounded-full">
                            {photographer.image ? (
                              <img
                                src={photographer.image}
                                alt={photographer.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="bg-accent text-accent-content rounded-full w-full h-full flex items-center justify-center">
                                <span className="text-sm">
                                  {photographer.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {photographer.name}
                          </h3>
                          {photographer.city && (
                            <p className="text-xs text-base-content/60">
                              {photographer.city.name}
                            </p>
                          )}
                        </div>
                        <div className="badge badge-accent badge-sm">View</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Most Liked Dancers */}
            {mostLikedDancers.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    ❤️ Most Liked Dancers
                  </h2>
                  <div className="space-y-3">
                    {mostLikedDancers.map((dancer: any, index: number) => (
                      <Link
                        key={dancer._id}
                        href={`/dancer/${dancer._id}`}
                        className="flex items-center gap-3 hover:bg-base-300 rounded p-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="badge badge-lg badge-ghost">
                            #{index + 1}
                          </div>
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full">
                              {dancer.image ? (
                                <img
                                  src={dancer.image}
                                  alt={dancer.name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <div className="bg-error text-error-content rounded-full w-full h-full flex items-center justify-center">
                                  <span className="text-sm">
                                    {dancer.name?.charAt(0)?.toUpperCase() || "?"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {dancer.name}
                            </h3>
                            <p className="text-xs text-base-content/60">
                              {dancer.city?.name} • ❤️ {dancer.likesCount} {dancer.likesCount === 1 ? 'like' : 'likes'}
                            </p>
                          </div>
                        </div>
                        <div className="badge badge-error badge-sm">View</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dancers in this Country */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Dancers in {country.name}</h2>
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
                                {dancer.city && (
                                  <p className="text-xs text-base-content/60 truncate w-full">
                                    {dancer.city.name}
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
                      baseUrl={`/country/${params.countryId}`}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-base-content/60">
                    <FaUsers className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>No dancers found in {country.name} yet</p>
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
                  Join the Dance Community in {country.name}
                </h2>
                <p className="mb-4">
                  Connect with {totalDancers} dancers and discover the amazing
                  dance scene in {country.name}!
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

