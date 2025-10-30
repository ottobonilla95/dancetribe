import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import DanceStyle from "@/models/DanceStyle";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import Link from "next/link";
import { getZodiacSign } from "@/utils/zodiac";
import { getCountryCode } from "@/utils/countries";
import { DANCE_LEVELS } from "@/constants/dance-levels";
import { isValidObjectId } from "mongoose";
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaHeart,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import Flag from "@/components/Flag";
import DanceStyleCard from "@/components/DanceStyleCard";
import LikeButton from "@/components/LikeButton";
import LikesDisplay from "@/components/LikesDisplay";
import ConnectButton from "@/components/ConnectButton";
import { LikesProvider } from "@/contexts/LikesContext";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import AchievementBadges from "@/components/AchievementBadges";
import { calculateUserBadges } from "@/utils/badges";
import FriendsListSection from "@/components/FriendsListSection";
import { getMessages, getTranslation } from "@/lib/i18n";

interface Props {
  params: {
    userId: string;
  };
}

export default async function PublicProfile({ params }: Props) {
  await connectMongo();

  // Get translations
  const messages = await getMessages();
  const t = (key: string) => getTranslation(messages, key);

  // Check if the userId is a valid ObjectId
  if (!isValidObjectId(params.userId)) {
    notFound();
  }

  // Get current session to check if user is logged in
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;
  const isOwnProfile = session?.user?.id === params.userId;

  let user;
  try {
    user = await User.findById(params.userId)
      .select(
        "name username email image dateOfBirth hideAge dancingStartYear city citiesVisited trips danceStyles anthem socialMedia danceRole gender nationality relationshipStatus createdAt likedBy friends friendRequestsSent friendRequestsReceived isTeacher isDJ isPhotographer teacherProfile djProfile photographerProfile professionalContact jackAndJillCompetitions"
      )
      .populate({
        path: "friends",
        model: User,
        select: "name username image city",
        populate: {
          path: "city",
          model: City,
          select: "name country",
          populate: {
            path: "country",
            model: Country,
            select: "name code",
          },
        },
      })
      .populate({
        path: "city",
        model: City,
        select: "name country continent rank image population",
        populate: [
          {
            path: "country",
            model: Country,
            select: "name code",
          },
          {
            path: "continent",
            model: Continent,
            select: "name code",
          },
        ],
      })
      .populate({
        path: "citiesVisited",
        model: City,
        select: "name country continent rank image",
        populate: [
          {
            path: "country",
            model: Country,
            select: "name code",
          },
          {
            path: "continent",
            model: Continent,
            select: "name code",
          },
        ],
      })
      .populate({
        path: "trips.city",
        model: City,
        select: "name country image",
        populate: {
          path: "country",
          model: Country,
          select: "name code",
        },
      })
      .populate({
        path: "danceStyles.danceStyle",
        model: DanceStyle,
        select: "name description category",
      })
      .populate({
        path: "jackAndJillCompetitions.danceStyle",
        model: DanceStyle,
        select: "name",
      })
      .lean();

    if (!user) {
      notFound();
    }
  } catch (error) {
    // Handle any database errors
    console.error("Error fetching user:", error);
    notFound();
  }

  const danceStyles = await DanceStyle.find({}).lean();

  // Calculate age from date of birth
  const getAge = (dateOfBirth: Date | string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getDanceStylesWithLevels = (userDanceStyles: any[]) => {
    return userDanceStyles.map((userStyle) => {
      const levelInfo = DANCE_LEVELS.find((l) => l.value === userStyle.level);

      // Handle both populated objects and ID strings
      let styleName: string;
      let styleDescription: string;

      if (
        typeof userStyle.danceStyle === "object" &&
        userStyle.danceStyle?.name
      ) {
        // Already populated
        styleName = userStyle.danceStyle.name;
        styleDescription = userStyle.danceStyle.description || "";
      } else {
        // Just an ID, look it up in danceStyles array
        const styleId = userStyle.danceStyle;
        const foundStyle = danceStyles.find(
          (style: any) => style._id === styleId || style.id === styleId
        );
        styleName = foundStyle?.name || "Unknown Style";
        styleDescription = foundStyle?.description || "";
      }

      return {
        id:
          typeof userStyle.danceStyle === "object"
            ? userStyle.danceStyle._id
            : userStyle.danceStyle,
        name: styleName,
        level: userStyle.level,
        levelLabel: levelInfo?.label || "Beginner",
        levelEmoji: levelInfo?.emoji || "🌱",
        description: styleDescription,
      };
    });
  };

  // Helper function to construct social media URLs
  const getSocialUrl = (platform: string, value: string) => {
    if (!value) return "";

    // If it's already a full URL, return as-is
    if (value.startsWith("http")) {
      return value;
    }

    // Otherwise, construct the URL based on platform
    const cleanValue = value.replace("@", "");
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${cleanValue}`;
      case "tiktok":
        return `https://tiktok.com/@${cleanValue}`;
      case "youtube":
        return value; // YouTube URLs are usually full URLs
      default:
        return value;
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      leader: `${t('profile.leader')} 🕺`,
      follower: `${t('profile.follower')} 💃`,
      both: `${t('common.both')} (${t('profile.leader')} & ${t('profile.follower')})`,
    };
    return roleMap[role] || role;
  };

  const getRelationshipStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      single: `${t('profile.single')} 💙`,
      in_a_relationship: `${t('profile.relationship')} 💕`,
      married: `${t('profile.married')} 💍`,
      its_complicated: "It's complicated 🤷",
      prefer_not_to_say: "Prefer not to say",
    };
    return statusMap[status] || status;
  };

  // Type cast to avoid Mongoose lean() typing issues
  const userData = user as any;
  const zodiac = userData.dateOfBirth
    ? getZodiacSign(userData.dateOfBirth)
    : null;
  const age = userData.dateOfBirth ? getAge(userData.dateOfBirth) : null;

  // Social status calculations
  const likesCount = userData.likedBy?.length || 0;
  const isLikedByCurrentUser = isLoggedIn
    ? userData.likedBy?.includes(session?.user?.id)
    : false;
  
  // Separate populated friends from IDs
  // When populate has a limit, some entries stay as IDs while others become objects
  // Filter out null/undefined friends (deleted users)
  const allFriends = (userData.friends || []).filter((f: any) => f != null);
  const populatedFriends = allFriends.filter((f: any) => typeof f === 'object' && f !== null && f._id);
  const friendIds = allFriends.map((f: any) => typeof f === 'object' && f !== null ? f._id.toString() : f.toString());
  const friendsCount = friendIds.length;

  // Friend request status
  const hasSentFriendRequest = isLoggedIn
    ? userData.friendRequestsReceived?.some(
        (request: any) => request.user.toString() === session?.user?.id
      )
    : false;
  const hasReceivedFriendRequest = isLoggedIn
    ? userData.friendRequestsSent?.some(
        (request: any) => request.user.toString() === session?.user?.id
      )
    : false;
  // Check if current user's ID is in the friends list (handles both populated objects and IDs)
  const isFriend = isLoggedIn
    ? friendIds.includes(session?.user?.id)
    : false;

  return (
    <LikesProvider>
      <div className="min-h-screen p-4 bg-base-100">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              ✨ {t('profile.meet')} {userData.name?.split(" ")[0] || "This Amazing Dancer"} ✨
            </h1>
            <p className="text-lg text-base-content/80 font-medium">
              {userData.city?.name
                ? `${t('profile.dancingTheirWayThrough')} ${userData.city.name}`
                : "Spreading the love of dance worldwide"}
            </p>
          </div>

          {/* CTA Banner for non-authenticated users */}
          {!isLoggedIn && (
            <div className="alert alert-info shadow-lg mb-6">
              <div className="flex gap-2 items-center">
                <FaHeart className="text-lg" />

                <h3 className="font-bold">
                  {t('dancer.wantToConnect').replace('{name}', userData.name?.split(" ")[0] || '')}
                </h3>
              </div>
              {/* </div> */}
              <div className="flex-none">
                <Link
                  href="/api/auth/signin"
                  className="btn btn-sm btn-primary"
                >
                  {t('dancer.createProfile')}
                </Link>
              </div>
            </div>
          )}

          {/* Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-row sm:flex-col gap-4">
                    <div className="avatar">
                      <div className="w-28 h-28 rounded-full">
                        {userData.image ? (
                          <img
                            src={userData.image}
                            alt={userData.name || "Profile"}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                            <span className="text-4xl">
                              {userData.name?.charAt(0)?.toUpperCase() || "👤"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="card-title text-2xl mb-1">
                          {`${userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}${age && !userData.hideAge ? `, ${age}` : ""}`}
                        </h2>
                        {userData.isTeacher && (
                          <div className="badge badge-primary badge-lg gap-1">
                            🎓 {t('profile.teacher')}
                          </div>
                        )}
                        {userData.isDJ && (
                          <div className="badge badge-secondary badge-lg gap-1">
                            🎵 {t('profile.dj')}
                          </div>
                        )}
                        {userData.isPhotographer && (
                          <div className="badge badge-accent badge-lg gap-1">
                            📷 {t('profile.photographer')}
                          </div>
                        )}
                      </div>
                      {zodiac && !userData.hideAge && (
                        <div className="mt-1 text-small">
                          <span className="">{zodiac.sign}</span>
                        </div>
                      )}
                      
                      {/* Bio */}
                      {userData.bio && (
                        <div className="mt-2">
                          <p className="text-base italic text-base-content/80">
                            "{userData.bio}"
                          </p>
                        </div>
                      )}

                      {/* Social Stats */}
                      <div className="mt-2 flex gap-2 sm:gap-4 text-xs sm:text-sm text-base-content/60">
                        <LikesDisplay
                          targetUserId={params.userId}
                          initialLikesCount={likesCount}
                        />
                        <span className="whitespace-nowrap">
                          👥 {friendsCount} {t('profile.friends').toLowerCase()}
                        </span>
                      </div>
                      {/* Current Location */}
                      {userData.city && typeof userData.city === "object" && (
                        <div className="mt-1">
                          <span>📍 </span>
                          <Link
                            href={`/city/${userData.city._id}`}
                            className="link link-primary hover:link-accent"
                          >
                            {userData.city.name}
                          </Link>
                          {userData.city.country && (
                            <>
                              <span>, </span>
                              <Link
                                href={`/country/${userData.city.country._id || userData.city.country.id}`}
                                className="link link-primary hover:link-accent"
                              >
                                {userData.city.country.name}
                              </Link>
                            </>
                          )}
                        </div>
                      )}
                      {/* Nationality */}
                      {userData.nationality && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-base-content/60">
                            {t('profile.nationality')}
                          </div>
                          <div className="text-md flex items-center gap-2">
                            <Flag
                              countryCode={getCountryCode(userData.nationality)}
                              size="md"
                            />
                            {userData.nationality}
                          </div>
                        </div>
                      )}

                      {/* Connect Button - show for all users except own profile */}
                      {!isOwnProfile && (
                        <div className="mt-4">
                          <ConnectButton
                            targetUserId={params.userId}
                            isFriend={isFriend}
                            hasSentRequest={hasSentFriendRequest}
                            hasReceivedRequest={hasReceivedFriendRequest}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Info - Prominent (Full Width) */}
                  {userData.isTeacher && userData.teacherProfile && (
                    <div className="mt-4 -mx-[2rem] px-8 py-3 sm:rounded-lg sm:mx-0 sm:px-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-y-2 sm:border-2 border-primary/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🎓</span>
                        <h3 className="font-bold">{t('profile.danceTeacher')}</h3>
                      </div>

                      {userData.teacherProfile.yearsOfExperience !==
                        undefined && (
                        <div className="mb-2">
                          <div className="text-sm text-base-content/70">
                            <span className="font-semibold text-primary">
                              {userData.teacherProfile.yearsOfExperience}
                            </span>{" "}
                            year
                            {userData.teacherProfile.yearsOfExperience !== 1
                              ? "s"
                              : ""}{" "}
                            of teaching
                          </div>
                        </div>
                      )}

                      {userData.teacherProfile.bio && (
                        <div className="mb-2">
                          <p className="text-sm text-base-content/80 italic line-clamp-3">
                            &quot;{userData.teacherProfile.bio}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DJ Info */}
                  {userData.isDJ && userData.djProfile && (
                    <div className="mt-4 -mx-[2rem] px-8 py-3 sm:rounded-lg sm:mx-0 sm:px-6 bg-gradient-to-br from-secondary/20 to-accent/20 border-y-2 sm:border-2 border-secondary/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🎵</span>
                        <h3 className="font-bold">DJ</h3>
                      </div>

                      {userData.djProfile.djName && (
                        <div className="mb-2">
                          <div className="text-sm text-base-content/70">
                            Known as: <span className="font-semibold text-secondary">{userData.djProfile.djName}</span>
                          </div>
                        </div>
                      )}

                      {userData.djProfile.genres && (
                        <div className="mb-2">
                          <div className="text-sm text-base-content/70">
                            Genres: <span className="font-medium">{userData.djProfile.genres}</span>
                          </div>
                        </div>
                      )}

                      {userData.djProfile.bio && (
                        <div className="mb-2">
                          <p className="text-sm text-base-content/80 italic line-clamp-3">
                            &quot;{userData.djProfile.bio}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Photographer Info */}
                  {userData.isPhotographer && userData.photographerProfile && (
                    <div className="mt-4 -mx-[2rem] px-8 py-3 sm:rounded-lg sm:mx-0 sm:px-6 bg-gradient-to-br from-accent/20 to-info/20 border-y-2 sm:border-2 border-accent/40 overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📷</span>
                          <h3 className="font-bold">{t('profile.photographer')}</h3>
                        </div>
                      </div>

                      {userData.photographerProfile.specialties && (
                        <div className="mb-2">
                          <div className="text-sm text-base-content/70">
                            Specialties: <span className="font-medium">{userData.photographerProfile.specialties}</span>
                          </div>
                        </div>
                      )}

                      {userData.photographerProfile.portfolioLink && (
                        <div className="mb-2">
                          <a
                            href={userData.photographerProfile.portfolioLink.startsWith('http')
                              ? userData.photographerProfile.portfolioLink
                              : `https://${userData.photographerProfile.portfolioLink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm link link-accent"
                          >
                            📸 View Portfolio
                          </a>
                        </div>
                      )}

                      {userData.photographerProfile.bio && (
                        <div className="mb-2">
                          <p className="text-sm text-base-content/80 italic line-clamp-3">
                            &quot;{userData.photographerProfile.bio}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Shared Professional Contact */}
                  {(userData.isTeacher || userData.isDJ || userData.isPhotographer) && userData.professionalContact && (
                    <div className="mt-4 flex flex-wrap gap-2 px-4">
                      {userData.professionalContact.whatsapp && (
                        <a
                          href={`https://wa.me/${userData.professionalContact.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-success btn-sm gap-2 flex-1"
                        >
                          <FaWhatsapp />
                          WhatsApp
                        </a>
                      )}
                      {userData.professionalContact.email && (
                        <a
                          href={`mailto:${userData.professionalContact.email}`}
                          className="btn btn-outline btn-sm gap-2 flex-1"
                        >
                          <FaEnvelope />
                          Email
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dance Information */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-4">{t('profile.danceProfile')}</h3>

                  {/* Dance Role */}
                  {userData.danceRole && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-base-content/60 mb-1">
                        {t('profile.danceRole')}
                      </div>
                      <div className="text-lg">
                        {getRoleDisplay(userData.danceRole)}
                      </div>
                    </div>
                  )}

                  {/* Relationship Status */}
                  {userData.relationshipStatus && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-base-content/60 mb-1">
                        {t('profile.relationshipStatus')}
                      </div>
                      <div className="text-lg">
                        {getRelationshipStatusDisplay(userData.relationshipStatus)}
                      </div>
                    </div>
                  )}

                  {/* Dancing Experience */}
                  {userData.dancingStartYear && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-base-content/60 mb-1">
                        {t('profile.dancingExperience')}
                      </div>
                      <div className="text-lg">
                        {new Date().getFullYear() - userData.dancingStartYear} {t('profile.years')} ({t('profile.since')} {userData.dancingStartYear})
                      </div>
                    </div>
                  )}

                  {/* Dance Styles */}
                  {userData.danceStyles && userData.danceStyles.length > 0 && (
                    <DanceStyleCard
                      danceStyles={getDanceStylesWithLevels(
                        userData.danceStyles
                      )}
                      title={t('profile.danceStylesLevels')}
                    />
                  )}

                  {/* Cities Visited */}
                  {userData.citiesVisited &&
                    userData.citiesVisited.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-base-content/60 mb-2">
                          {t('profile.citiesDancedIn')}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {userData.citiesVisited.map(
                            (city: any, index: number) => (
                              <Link
                                key={index}
                                href={`/city/${city._id || city}`}
                                className="group"
                              >
                                <div className="flex items-center gap-2 bg-base-300 rounded-md h-10 hover:bg-base-200 transition-colors cursor-pointer">
                                  {city.image ? (
                                    <img
                                      src={city.image}
                                      alt={city.name}
                                      className="h-full aspect-square rounded object-cover"
                                    />
                                  ) : (
                                    <div className="h-full aspect-square rounded bg-primary/20 flex items-center justify-center">
                                      <span className="text-xs">🌍</span>
                                    </div>
                                  )}
                                  <span className="text-sm font-medium pl-2 pr-4 py-2 group-hover:text-primary">
                                    {typeof city === "string"
                                      ? city
                                      : city.name}
                                  </span>
                                </div>
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-4">
                    🏆 {t('profile.achievementBadges')}
                  </h3>
                  <AchievementBadges
                    badges={calculateUserBadges(userData)}
                    maxDisplay={6}
                  />
                </div>
              </div>

              {/* Jack & Jill Competitions - Read Only Display */}
              {userData.jackAndJillCompetitions && userData.jackAndJillCompetitions.length > 0 && (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-xl mb-4">🏅 {t('profile.jackAndJill')}</h3>
                    <div className="space-y-3">
                      {userData.jackAndJillCompetitions
                        .sort((a: any, b: any) => {
                          const placementOrder: {[key: string]: number} = { '1st': 1, '2nd': 2, '3rd': 3, 'participated': 4 };
                          const placementDiff = (placementOrder[a.placement] || 5) - (placementOrder[b.placement] || 5);
                          if (placementDiff !== 0) return placementDiff;
                          return b.year - a.year;
                        })
                        .map((comp: any, index: number) => {
                          const placementEmoji = comp.placement === '1st' ? '🥇' : comp.placement === '2nd' ? '🥈' : comp.placement === '3rd' ? '🥉' : '🎯';
                          const danceStyleName = typeof comp.danceStyle === 'object' && comp.danceStyle?.name ? comp.danceStyle.name : 'Dance';
                          
                          return (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-base-300/50 hover:bg-base-300 transition-colors">
                              <div className="text-3xl flex-shrink-0">{placementEmoji}</div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-base truncate">{comp.eventName}</h4>
                                <p className="text-sm text-base-content/70">
                                  {danceStyleName} · {comp.year}
                                  {comp.placement !== 'participated' && (
                                    <span className="ml-1 font-semibold text-primary">· {comp.placement} {t('profile.place')}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

              {/* Friends List */}
              <FriendsListSection friends={populatedFriends} totalCount={friendsCount} />

              {/* Social Media */}
              {userData.socialMedia &&
                (userData.socialMedia.instagram ||
                  userData.socialMedia.tiktok ||
                  userData.socialMedia.youtube) && (
                  <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title text-xl mb-4">
                        🌐 {t('profile.socialMedia')}
                      </h3>
                      <div className="flex gap-3">
                        {userData.socialMedia.instagram && (
                          <a
                            href={getSocialUrl(
                              "instagram",
                              userData.socialMedia.instagram
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-circle btn-outline hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500"
                            title={`@${userData.socialMedia.instagram.replace("@", "")} on Instagram`}
                          >
                            <FaInstagram className="text-xl" />
                          </a>
                        )}
                        {userData.socialMedia.tiktok && (
                          <a
                            href={getSocialUrl(
                              "tiktok",
                              userData.socialMedia.tiktok
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-circle btn-outline hover:bg-black hover:text-white hover:border-black"
                            title={`@${userData.socialMedia.tiktok.replace("@", "")} on TikTok`}
                          >
                            <FaTiktok className="text-xl" />
                          </a>
                        )}
                        {userData.socialMedia.youtube && (
                          <a
                            href={getSocialUrl(
                              "youtube",
                              userData.socialMedia.youtube
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-circle btn-outline hover:bg-red-600 hover:text-white hover:border-red-600"
                            title="YouTube Channel"
                          >
                            <FaYoutube className="text-xl" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* Upcoming Trips */}
              {(() => {
                const now = new Date();
                const upcomingTrips = userData.trips?.filter(
                  (trip: any) => new Date(trip.endDate) >= now
                ) || [];
                
                if (upcomingTrips.length === 0) return null;

                return (
                  <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title text-xl mb-4">✈️ Upcoming Trips</h3>
                      <div className="space-y-3">
                        {upcomingTrips.map((trip: any) => (
                          <Link
                            key={trip._id}
                            href={`/city/${trip.city._id}`}
                            className="card bg-base-300 overflow-hidden hover:bg-base-200 transition-colors cursor-pointer block"
                          >
                            <div className="flex items-stretch">
                              {/* City Image or Flag - Full bleed on left */}
                              <div className="w-24 h-24 flex-shrink-0 relative">
                                {trip.city.image ? (
                                  <img
                                    src={trip.city.image}
                                    alt={trip.city.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-base-200">
                                    <div className="text-5xl">
                                      <Flag countryCode={trip.city.country.code} size="lg" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Text Content with Padding */}
                              <div className="flex-1 p-4">
                                <h4 className="font-semibold">
                                  {trip.city.name}, {trip.city.country.name}
                                </h4>
                                <p className="text-sm text-base-content/70 mt-1">
                                  {new Date(trip.startDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })} - {new Date(trip.endDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Dance Anthem */}
              {userData.anthem && userData.anthem.url && (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-xl mb-4">🎵 {t('profile.danceAnthem')}</h3>
                    <div className="rounded-lg">
                      {/* Iframe for Spotify/YouTube */}
                      {(() => {
                        const url = userData.anthem.url;
                        let embedUrl = "";

                        if (userData.anthem.platform === "spotify") {
                          const spotifyMatch = url.match(
                            /(?:spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/
                          );
                          if (spotifyMatch) {
                            embedUrl = `https://open.spotify.com/embed/track/${spotifyMatch[1]}`;
                          }
                        } else if (userData.anthem.platform === "youtube") {
                          const youtubeMatch = url.match(
                            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
                          );
                          if (youtubeMatch) {
                            embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                          }
                        }

                        return embedUrl ? (
                          <div
                            className="rounded-lg overflow-hidden"
                            style={{ height: "152px" }}
                          >
                            <iframe
                              src={embedUrl}
                              width="100%"
                              height="152"
                              frameBorder="0"
                              scrolling="no"
                              className="rounded-2xl"
                              style={{ overflow: "hidden" }}
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-xs btn-primary"
                          >
                            🎧 Listen
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - only show for non-logged-in users */}
          {!isLoggedIn && (
            <div className="alert alert-info shadow-lg mt-4">
              <div className="flex-1 text-center">
                <h3 className="font-bold text-lg mb-3">
                  ⭐️ Create your dance profile now
                </h3>
                <Link
                  href="/api/auth/signin"
                  className="btn btn-primary btn-sm gap-2"
                >
                  <FaHeart className="text-sm" />
                  Get Started Free
                </Link>
              </div>
            </div>
          )}

          <div className="h-10" />
          {/* Floating Like Button - for all users */}
          {!isOwnProfile && (
            <div className="fixed bottom-6 right-6 z-50">
              <LikeButton
                targetUserId={params.userId}
                initialLikesCount={likesCount}
                initialIsLiked={isLikedByCurrentUser}
                className="btn btn-lg btn-circle shadow-2xl hover:shadow-3xl bg-white border-2 border-red-200 hover:border-red-300"
              />
            </div>
          )}
        </div>
      </div>
    </LikesProvider>
  );
}
