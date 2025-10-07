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

interface Props {
  params: {
    userId: string;
  };
}

export default async function PublicProfile({ params }: Props) {
  await connectMongo();

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
        "name username email image dateOfBirth dancingStartYear city citiesVisited danceStyles anthem socialMedia danceRole gender nationality createdAt likedBy friends friendRequestsSent friendRequestsReceived isTeacher teacherProfile"
      )
      .populate({
        path: "city",
        model: City,
        select: "name country continent rank image population",
        populate: [
          {
            path: "country",
            model: Country,
            select: "name code"
          },
          {
            path: "continent",
            model: Continent,
            select: "name code"
          }
        ]
      })
      .populate({
        path: "citiesVisited",
        model: City,
        select: "name country continent rank image",
        populate: [
          {
            path: "country",
            model: Country,
            select: "name code"
          },
          {
            path: "continent",
            model: Continent,
            select: "name code"
          }
        ]
      })
      .populate({
        path: "danceStyles.danceStyle",
        model: DanceStyle,
        select: "name description category",
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
        id: typeof userStyle.danceStyle === "object" 
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
    const roleMap = {
      leader: "Leader 🕺",
      follower: "Follower 💃",
      both: "Both (Leader & Follower)",
    };
    return roleMap[role as keyof typeof roleMap] || role;
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
  const friendsCount = userData.friends?.length || 0;

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
  const isFriend = isLoggedIn
    ? userData.friends?.some(
        (friendId: any) => friendId.toString() === session?.user?.id
      )
    : false;

  return (
    <LikesProvider>
      <div className="min-h-screen p-4 bg-base-100">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              ✨ Meet {userData.name?.split(" ")[0] || "This Amazing Dancer"} ✨
            </h1>
            <p className="text-lg text-base-content/80 font-medium">
              {userData.city?.name
                ? `Dancing their way through ${userData.city.name}`
                : "Spreading the love of dance worldwide"}
            </p>
          </div>

          {/* CTA Banner for non-authenticated users */}
          {!isLoggedIn && (
            <div className="alert alert-info shadow-lg mb-6">
              <div>
                <FaHeart className="text-lg" />
                <div>
                  <h3 className="font-bold">Inspired by this dancer?</h3>
                  <div className="text-xs">
                    Join DanceTribe to connect with amazing dancers like this
                    around the world!
                  </div>
                </div>
              </div>
              <div className="flex-none">
                <Link
                  href="/api/auth/signin"
                  className="btn btn-sm btn-primary"
                >
                  Join DanceTribe
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
                          {`${userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}${age ? `, ${age}` : ""}`}
                        </h2>
                        {userData.isTeacher && (
                          <div className="badge badge-primary badge-lg gap-1">
                            🎓 Teacher
                          </div>
                        )}
                      </div>
                      {zodiac && (
                        <div className="mt-1 text-small">
                          <span className="">{zodiac.sign}</span>
                        </div>
                      )}

                      {/* Social Stats */}
                      <div className="mt-2 flex gap-4 text-sm text-base-content/60">
                        <LikesDisplay
                          targetUserId={params.userId}
                          initialLikesCount={likesCount}
                        />
                        <span>
                          👥 {friendsCount} friend
                          {friendsCount !== 1 ? "s" : ""}
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
                        </div>
                      )}
                      {/* Nationality */}
                      {userData.nationality && (
                        <div className="mt-4">
                          <div className="text-sm font-medium text-base-content/60">
                            Nationality
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

                  {/* Teacher Info - Prominent (Full Width on Mobile) */}
                  {userData.isTeacher && userData.teacherProfile && (
                    <div className="mt-4 -mx-[2rem] px-8 py-3 sm:rounded-lg sm:mx-6 sm:px-3 bg-gradient-to-br from-primary/20 to-secondary/20 border-y-2 sm:border-2 border-primary/40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🎓</span>
                        <h3 className="font-bold">Dance Teacher</h3>
                      </div>

                      {userData.teacherProfile.yearsOfExperience !== undefined && (
                        <div className="mb-2">
                          <div className="text-sm text-base-content/70">
                            <span className="font-semibold text-primary">
                              {userData.teacherProfile.yearsOfExperience}
                            </span>{" "}
                            year{userData.teacherProfile.yearsOfExperience !== 1 ? "s" : ""} of teaching
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

                      {userData.teacherProfile.contact &&
                        (userData.teacherProfile.contact.whatsapp ||
                          userData.teacherProfile.contact.email) && (
                          <div className="flex flex-wrap gap-2">
                            {userData.teacherProfile.contact.whatsapp && (
                              <a
                                href={`https://wa.me/${userData.teacherProfile.contact.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-success btn-xs gap-1 flex-1"
                              >
                                <FaWhatsapp />
                                WhatsApp
                              </a>
                            )}
                            {userData.teacherProfile.contact.email && (
                              <a
                                href={`mailto:${userData.teacherProfile.contact.email}`}
                                className="btn btn-info btn-xs gap-1 flex-1"
                              >
                                <FaEnvelope />
                                Email
                              </a>
                            )}
                          </div>
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
                  <h3 className="card-title text-xl mb-4">Dance Profile</h3>

                  {/* Dance Role */}
                  {userData.danceRole && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-base-content/60 mb-1">
                        Dance Role
                      </div>
                      <div className="text-lg">
                        {getRoleDisplay(userData.danceRole)}
                      </div>
                    </div>
                  )}

                  {/* Dancing Experience */}
                  {userData.dancingStartYear && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-base-content/60 mb-1">
                        Dancing Experience
                      </div>
                      <div className="text-lg">
                        {new Date().getFullYear() - userData.dancingStartYear} years (since {userData.dancingStartYear})
                      </div>
                    </div>
                  )}

                  {/* Dance Styles */}
                  {userData.danceStyles && userData.danceStyles.length > 0 && (
                    <DanceStyleCard
                      danceStyles={getDanceStylesWithLevels(
                        userData.danceStyles
                      )}
                    />
                  )}

                  {/* Cities Visited */}
                  {userData.citiesVisited &&
                    userData.citiesVisited.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-base-content/60 mb-2">
                          Cities Danced In
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
                                  {typeof city === "string" ? city : city.name}
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
                  <h3 className="card-title text-xl mb-4">🏆 Achievement Badges</h3>
                  <AchievementBadges badges={calculateUserBadges(userData)} maxDisplay={6} />
                </div>
              </div>

              {/* Social Media */}
              {userData.socialMedia &&
                (userData.socialMedia.instagram ||
                  userData.socialMedia.tiktok ||
                  userData.socialMedia.youtube) && (
                  <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <h3 className="card-title text-xl mb-4">🌐 Social Media</h3>
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

              {/* Dance Anthem */}
              {userData.anthem && userData.anthem.url && (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-xl mb-4">🎵 Dance Anthem</h3>
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
            <div className="text-center mt-8 space-y-4">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-base-content mb-2">
                  Join DanceTribe Community!
                </h3>
                <p className="text-base-content/70">
                  Connect with dancers worldwide, share your passion, and
                  discover new dance experiences.
                </p>
              </div>

              <div>
                <Link
                  href="/api/auth/signin"
                  className="btn btn-primary btn-lg"
                >
                  🕺 Join DanceTribe 💃
                </Link>
              </div>

              <div>
                <Link href="/" className="link link-primary text-sm">
                  Learn more about DanceTribe
                </Link>
              </div>
            </div>
          )}

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
