import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import DanceStyle from "@/models/DanceStyle";
import Link from "next/link";
import { getZodiacSign } from "@/utils/zodiac";
import ShareToStory from "@/components/ShareToStory";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

export default async function Profile() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch user data server-side
  await connectMongo();
  
  const user = await User.findById(session.user.id)
    .populate({
      path: "city",
      model: City,
      select: "name country continent rank image population",
    })
    .populate({
      path: "citiesVisited",
      model: City,
      select: "name country continent rank",
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
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDanceStyleNames = (styleNames: string[]) => {
    return styleNames.map(styleName => {
      const style = danceStyles.find((s: any) => s.name === styleName);
      return style || { name: styleName, description: "" };
    });
  };

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      leader: "Leader 👑",
      follower: "Follower 💃",
      both: "Both (Leader & Follower) 🔄"
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  // Type cast to avoid Mongoose lean() typing issues
  const userData = user as any;
  const zodiac = userData.dateOfBirth ? getZodiacSign(userData.dateOfBirth) : null;
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
              <div className="card-body text-center">
                <div className="avatar mx-auto mb-4">
                  <div className="w-32 h-32 rounded-full">
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
                
                <h2 className="card-title text-2xl justify-center mb-2">
                  {userData.name || "Dance Lover"}
                </h2>
                
                {age && (
                  <p className="text-lg text-base-content/80">
                    {age} years old
                  </p>
                )}
                
                {zodiac && (
                  <div className="text-center mt-3">
                    <span className="badge badge-primary badge-lg">
                      {zodiac.emoji} {zodiac.sign}
                    </span>
                  </div>
                )}

                {/* Current Location */}
                {userData.city && typeof userData.city === 'object' && (
                  <div className="mt-4">
                    <div className="text-sm text-base-content/60">Currently in</div>
                    <div className="font-semibold">
                      📍 {userData.city.name}
                      {userData.city.country && (
                        <span className="text-base-content/60">
                          , {typeof userData.city.country === 'string' ? userData.city.country : userData.city.country.name}
                        </span>
                      )}
                    </div>
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
                <h3 className="card-title text-xl mb-4">🕺 Dance Profile</h3>
                
                {/* Dance Role */}
                {userData.danceRole && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-base-content/60 mb-1">Dance Role</div>
                    <div className="text-lg">{getRoleDisplay(userData.danceRole)}</div>
                  </div>
                )}

                {/* Dance Styles */}
                {userData.danceStyles && userData.danceStyles.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-base-content/60 mb-2">Dance Styles</div>
                    <div className="flex flex-wrap gap-2">
                      {getDanceStyleNames(userData.danceStyles).map((style: any, index: number) => (
                        <div key={index} className="badge badge-primary badge-lg" title={style.description}>
                          {style.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cities Visited */}
                {userData.citiesVisited && userData.citiesVisited.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-base-content/60 mb-2">Cities Danced In</div>
                    <div className="flex flex-wrap gap-2">
                      {userData.citiesVisited.map((city: any, index: number) => (
                        <div key={index} className="badge badge-outline">
                          🌍 {typeof city === 'string' ? city : city.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Member Since */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">📅 Membership</h3>
                <div>
                  <div className="text-sm font-medium text-base-content/60">Member Since</div>
                  <div className="text-lg font-semibold">{formatDate(userData.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Social & Music */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">🎵 Music & Social</h3>
                
                {/* Dance Anthem */}
                {userData.anthem && userData.anthem.url && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-base-content/60 mb-2">Dance Anthem</div>
                    <div className="bg-base-300 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge badge-primary capitalize">
                          {userData.anthem.platform}
                        </span>
                        <span className="font-medium">{userData.anthem.title || "My Dance Anthem"}</span>
                      </div>
                      {userData.anthem.artist && (
                        <div className="text-sm text-base-content/70 mb-3">by {userData.anthem.artist}</div>
                      )}
                      
                      {/* Iframe for Spotify/YouTube */}
                      {(() => {
                        const url = userData.anthem.url;
                        let embedUrl = '';
                        
                        if (userData.anthem.platform === 'spotify') {
                          const spotifyMatch = url.match(/(?:spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/);
                          if (spotifyMatch) {
                            embedUrl = `https://open.spotify.com/embed/track/${spotifyMatch[1]}`;
                          }
                        } else if (userData.anthem.platform === 'youtube') {
                          const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
                          if (youtubeMatch) {
                            embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
                          }
                        }
                        
                        return embedUrl ? (
                          <div className="rounded-lg overflow-hidden" style={{ height: '152px' }}>
                            <iframe
                              src={embedUrl}
                              width="100%"
                              height="152"
                              frameBorder="0"
                              className="rounded-lg"
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
                )}

                {/* Social Media */}
                {userData.socialMedia && (userData.socialMedia.instagram || userData.socialMedia.tiktok || userData.socialMedia.youtube) && (
                  <div>
                    <div className="text-sm font-medium text-base-content/60 mb-3">Social Media</div>
                    <div className="flex gap-3">
                      {userData.socialMedia.instagram && (
                        <a 
                          href={`https://instagram.com/${userData.socialMedia.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-outline hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500"
                          title={`@${userData.socialMedia.instagram.replace('@', '')} on Instagram`}
                        >
                          <FaInstagram className="text-xl" />
                        </a>
                      )}
                      {userData.socialMedia.tiktok && (
                        <a 
                          href={`https://tiktok.com/@${userData.socialMedia.tiktok.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-circle btn-outline hover:bg-black hover:text-white hover:border-black"
                          title={`@${userData.socialMedia.tiktok.replace('@', '')} on TikTok`}
                        >
                          <FaTiktok className="text-xl" />
                        </a>
                      )}
                      {userData.socialMedia.youtube && (
                        <a 
                          href={userData.socialMedia.youtube}
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center mt-8 space-y-4">
          <div>
            <ShareToStory userData={{
              id: userData._id,
              name: userData.name,
              image: userData.image,
              danceStyles: userData.danceStyles,
              danceRole: userData.danceRole,
              city: userData.city,
              zodiac: zodiac
            }} />
          </div>
          
          <div>
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 