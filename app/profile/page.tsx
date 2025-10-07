import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
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
import ShareToStory from "@/components/ShareToStory";
import { FaInstagram, FaTiktok, FaYoutube, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import Flag from "@/components/Flag";
import DanceStyleCard from "@/components/DanceStyleCard";
import CopyProfileLink from "@/components/CopyProfileLink";
import AchievementBadges from "@/components/AchievementBadges";
import { calculateUserBadges } from "@/utils/badges";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch user data server-side
  await connectMongo();

  const user = await User.findById(session.user.id)
    .select(
      "name firstName lastName username email image dateOfBirth dancingStartYear city citiesVisited danceStyles anthem socialMedia danceRole gender nationality isTeacher teacherProfile friends likedBy createdAt"
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

  const danceStyles = await DanceStyle.find({}).lean();

  if (!user) {
    redirect("/dashboard");
  }

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

  const formatDate = (date: Date | string) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
        name: styleName,
        level: userStyle.level,
        levelLabel: levelInfo?.label || "Beginner",
        levelEmoji: levelInfo?.emoji || "🌱",
        description: styleDescription,
        id: typeof userStyle.danceStyle === "object" 
          ? userStyle.danceStyle._id || userStyle.danceStyle.id
          : userStyle.danceStyle,
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

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-base-content/70">Your dance journey details</p>
        </div>

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
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="card-title text-2xl mb-1">
                        {userData.firstName && userData.lastName 
                          ? `${userData.firstName} ${userData.lastName}, ${age}`
                          : `${userData.name?.charAt(0)?.toUpperCase() + userData.name?.slice(1)}, ${age}`
                        }
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
                    {/* Current Location */}
                    {userData.city && typeof userData.city === "object" && (
                      <div className="mt-1">
                        <span>📍 </span>
                        <Link 
                          href={`/city/${userData.city._id || userData.city.id}`}
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
                  </div>
                </div>

                {/* Teacher Info - Prominent */}
                {userData.isTeacher && userData.teacherProfile && (
                  <div className="mt-6 -mx-8 sm:mx-0 px-8 py-4 sm:px-4 bg-gradient-to-br from-primary/20 to-secondary/20 sm:rounded-lg border-y-2 sm:border-2 border-primary/40">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🎓</span>
                      <h3 className="font-bold text-lg">Dance Teacher</h3>
                    </div>

                    {userData.teacherProfile.yearsOfExperience !== undefined && (
                      <div className="mb-3">
                        <div className="text-sm text-base-content/70">
                          <span className="font-semibold text-primary">
                            {userData.teacherProfile.yearsOfExperience}
                          </span>{" "}
                          year{userData.teacherProfile.yearsOfExperience !== 1 ? "s" : ""} of teaching experience
                        </div>
                      </div>
                    )}

                    {userData.teacherProfile.bio && (
                      <div className="mb-3">
                        <p className="text-sm text-base-content/80 italic">
                          &quot;{userData.teacherProfile.bio}&quot;
                        </p>
                      </div>
                    )}

                    {userData.teacherProfile.contact &&
                      (userData.teacherProfile.contact.whatsapp ||
                        userData.teacherProfile.contact.email) && (
                        <div className="space-y-2">
                          <div className="text-xs text-base-content/60 mb-1">
                            Contact Information:
                          </div>
                          {userData.teacherProfile.contact.whatsapp && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaWhatsapp className="text-success" />
                              <span className="font-mono">{userData.teacherProfile.contact.whatsapp}</span>
                            </div>
                          )}
                          {userData.teacherProfile.contact.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaEnvelope className="text-info" />
                              <span className="font-mono">{userData.teacherProfile.contact.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
                
                {/* Profile Actions */}
                <div className="mt-6 space-y-3">
                  <Link href="/onboarding?mode=edit" className="btn btn-secondary btn-sm w-full">
                    ✏️ Edit Profile
                  </Link>
                  <CopyProfileLink userId={userData._id} />
                  <div className="w-full">
                    <ShareToStory
                      userData={{
                        id: userData._id,
                        name: userData.name,
                        username: userData.username,
                        profilePicture: userData.image,
                        dateOfBirth: userData.dateOfBirth,
                        nationality: userData.nationality,
                        danceRole: userData.danceRole,
                        city: userData.city,
                        danceStyles:
                          userData.danceStyles?.map((userStyle: any) => ({
                            name: userStyle.danceStyle?.name || userStyle.danceStyle,
                            level: userStyle.level || "beginner",
                          })) || [],
                      }}
                    />
                  </div>
                </div>
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
                  <DanceStyleCard danceStyles={getDanceStylesWithLevels(userData.danceStyles)} />
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
                              href={`/city/${city._id || city.id || city}`}
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

            {/* Member Since */}
            {/* <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">📅 Membership</h3>
                <div>
                  <div className="text-sm font-medium text-base-content/60">
                    Member Since
                  </div>
                  <div className="text-lg font-semibold">
                    {formatDate(userData.createdAt)}
                  </div>
                </div>
              </div>
            </div> */}

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

        {/* Actions */}
        <div className="text-center mt-8">
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
