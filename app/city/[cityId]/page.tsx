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
import DancersFilter from "@/components/DancersFilter";
import { getMessages, getTranslation } from "@/lib/i18n";
import {
  FaMapMarkerAlt,
  FaUsers,
  FaGlobeAmericas,
  FaHeart,
  FaMusic,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";
import { SiLine, SiTelegram } from "react-icons/si";

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

  // Get translations
  const messages = await getMessages();
  const t = (key: string) => getTranslation(messages, key);

  // Check if the cityId is a valid ObjectId
  if (!isValidObjectId(params.cityId)) {
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

  // Get ALL dancers in this city (locals + travelers)
  // Locals: home city matches
  // Travelers: activeCity matches AND openToMeetTravelers = true
  const dancers: any[] = await User.find({
    isProfileComplete: true,
    $or: [
      { city: cityObjectId }, // Locals
      { activeCity: cityObjectId, openToMeetTravelers: true }, // Travelers
    ],
  })
    .select("name username image danceStyles dateOfBirth hideAge nationality dancingStartYear danceRole socialMedia likedBy openToMeetTravelers lookingForPracticePartners activeCity city isTeacher isDJ isPhotographer jackAndJillCompetitions")
    .populate({
      path: "danceStyles.danceStyle",
      model: DanceStyle,
      select: "name",
    })
    .lean();

  // Get dance styles popular in this city
  const danceStylesInCity = await User.aggregate([
    { $match: { city: cityObjectId, isProfileComplete: true } },
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

  // Calculate some stats
  const totalDancers = await User.countDocuments({
    city: cityObjectId,
    isProfileComplete: true,
  });

  const totalDancersWhoVisited = await User.countDocuments({
    citiesVisited: cityObjectId,
    isProfileComplete: true,
  });

  // Get role distribution
  const roleDistribution = await User.aggregate([
    { $match: { city: cityObjectId, isProfileComplete: true } },
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

  // Get teachers in this city
  const teachers = await User.find({
    city: cityObjectId,
    isProfileComplete: true,
    isTeacher: true,
  })
    .select("name username image danceStyles teacherProfile")
    .populate({
      path: "danceStyles.danceStyle",
      model: DanceStyle,
      select: "name",
    })
    .limit(10)
    .lean();

  // Get DJs in this city
  const djs = await User.find({
    city: cityObjectId,
    isProfileComplete: true,
    isDJ: true,
  })
    .select("name username image djProfile")
    .limit(10)
    .lean();

  // Get photographers in this city
  const photographers = await User.find({
    city: cityObjectId,
    isProfileComplete: true,
    isPhotographer: true,
  })
    .select("name username image photographerProfile")
    .limit(10)
    .lean();

  // Get most liked dancers in this city
  const mostLikedDancers = await User.aggregate([
    { 
      $match: { 
        city: cityObjectId, 
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
      $project: {
        name: 1,
        username: 1,
        image: 1,
        likesCount: 1
      }
    }
  ]);

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
                  <Link 
                    href={`/country/${city.country?._id || city.country?.id}`}
                    className="link link-primary hover:link-accent"
                  >
                    {city.country?.name}
                  </Link>
                  {city.continent && (
                    <>
                      {", "}
                      <Link 
                        href={`/continent/${city.continent?._id || city.continent?.id}`}
                        className="link link-primary hover:link-accent"
                      >
                        {city.continent?.name}
                      </Link>
                    </>
                  )}
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
            <div className="stat-title">{t('city.dancersLivingHere')}</div>
            <div className="stat-value text-primary">{totalDancers}</div>
            <div className="stat-desc">{t('city.activeCommunity')}</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-secondary">
              <FaGlobeAmericas className="text-3xl" />
            </div>
            <div className="stat-title">{t('city.visitors')}</div>
            <div className="stat-value text-secondary">
              {totalDancersWhoVisited}
            </div>
            <div className="stat-desc">{t('city.visitedForDance')}</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-accent">
              <FaHeart className="text-3xl" />
            </div>
            <div className="stat-title">{t('city.mostCommonRole')}</div>
            <div className="stat-value text-accent">
              {roleLabel}
            </div>
            <div className="stat-desc">{rolePercentage}% {t('city.ofDancers')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Dance Styles */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">{t('city.popularDanceStyles')}</h2>
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

            {/* Teachers in this City */}
            {teachers.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    🎓 {t('city.teachers')}
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
                          {teacher.teacherProfile?.yearsOfExperience && (
                            <p className="text-xs text-base-content/60">
                              {teacher.teacherProfile.yearsOfExperience} year
                              {teacher.teacherProfile.yearsOfExperience !== 1 ? "s" : ""} exp.
                            </p>
                          )}
                        </div>
                        <div className="badge badge-primary badge-sm">{t('city.view')}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DJs in this City */}
            {djs.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    🎵 {t('city.djs')}
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
                          {dj.djProfile?.genres && (
                            <p className="text-xs text-base-content/60 truncate">
                              {dj.djProfile.genres}
                            </p>
                          )}
                        </div>
                        <div className="badge badge-secondary badge-sm">{t('city.view')}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photographers in this City */}
            {photographers.length > 0 && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4 flex items-center gap-2">
                    📷 {t('city.photographers')}
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
                          {photographer.photographerProfile?.specialties && (
                            <p className="text-xs text-base-content/60 truncate">
                              {photographer.photographerProfile.specialties}
                            </p>
                          )}
                        </div>
                        <div className="badge badge-accent badge-sm">{t('city.view')}</div>
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
                    ❤️ {t('city.mostLikedDancers')}
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
                              ❤️ {dancer.likesCount} {dancer.likesCount === 1 ? 'like' : 'likes'}
                            </p>
                          </div>
                        </div>
                        <div className="badge badge-error badge-sm">{t('city.view')}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* City Dance Groups */}
            {(city.socialGroups?.whatsapp || city.socialGroups?.line || city.socialGroups?.telegram || city.socialGroups?.facebook || city.socialGroups?.instagram) && (
              <div className="card bg-base-200 shadow-xl mt-6">
                <div className="card-body">
                  <h2 className="card-title mb-4">💬 {t('city.communityGroups')}</h2>
                  <p className="text-sm text-base-content/70 mb-4">
                    {t('city.joinCommunity')}
                  </p>
                  <div className="space-y-2">
                    {city.socialGroups.whatsapp && (
                      <a
                        href={city.socialGroups.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-success btn-sm gap-2 w-full"
                      >
                        <FaWhatsapp className="text-lg" />
                        WhatsApp
                      </a>
                    )}
                    {city.socialGroups.telegram && (
                      <a
                        href={city.socialGroups.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-info btn-sm gap-2 w-full"
                      >
                        <SiTelegram className="text-lg" />
                        Telegram
                      </a>
                    )}
                    {city.socialGroups.facebook && (
                      <a
                        href={city.socialGroups.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm gap-2 w-full"
                        style={{ backgroundColor: '#1877F2', color: 'white' }}
                      >
                        <FaFacebook className="text-lg" />
                        Facebook Group
                      </a>
                    )}
                    {city.socialGroups.instagram && (
                      <a
                        href={city.socialGroups.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm gap-2 w-full"
                        style={{ background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', color: 'white' }}
                      >
                        <FaInstagram className="text-lg" />
                        Instagram
                      </a>
                    )}
                    {city.socialGroups.line && (
                      <a
                        href={city.socialGroups.line}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm gap-2 w-full"
                        style={{ backgroundColor: '#00B900', color: 'white' }}
                      >
                        <SiLine className="text-lg" />
                        LINE
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dancers in this City */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-6">{t('city.dancersIn')} {city.name}</h2>

                {dancers.length > 0 ? (
                  <DancersFilter
                    dancers={dancers}
                    userDanceStyles={userDanceStyles}
                    locationName={city.name}
                    currentCityId={params.cityId}
                  />
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
                  {t('city.joinDanceCommunityIn')} {city.name}
                </h2>
                <p className="mb-4">
                  Connect with {totalDancers} dancers and discover the amazing
                  dance scene in your city!
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
