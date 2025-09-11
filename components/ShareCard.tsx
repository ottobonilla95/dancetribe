"use client";

import { forwardRef } from "react";

interface ShareCardProps {
  userData: {
    name?: string;
    image?: string;
    danceStyles?: string[];
    danceRole?: string;
    city?: {
      name: string;
      country?: any;
    };
    zodiac?: {
      sign: string;
      emoji: string;
    };
  };
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ userData }, ref) => {
  const getRoleDisplay = (role: string) => {
    const roleMap = {
      leader: "Leader 👑",
      follower: "Follower 💃",
      both: "Both Leader & Follower 🔄"
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <div 
      ref={ref}
      className="w-[1080px] h-[1920px] bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white relative overflow-hidden"
      style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-8xl">💃</div>
        <div className="absolute top-40 right-32 text-6xl">🕺</div>
        <div className="absolute bottom-80 left-16 text-7xl">🎵</div>
        <div className="absolute bottom-60 right-20 text-5xl">✨</div>
        <div className="absolute top-[600px] left-[300px] text-9xl opacity-5">🌟</div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-16">
        
        {/* Profile Picture */}
        <div className="mb-12 relative">
          <div className="w-72 h-72 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-white">
            {userData.image ? (
              <img 
                src={userData.image} 
                alt={userData.name || "Profile"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-8xl text-white">
                  {userData.name?.charAt(0)?.toUpperCase() || "👤"}
                </span>
              </div>
            )}
          </div>
          
          {/* Zodiac Badge */}
          {userData.zodiac && (
            <div className="absolute -bottom-6 -right-6 bg-white text-purple-600 px-6 py-3 rounded-full shadow-lg font-bold text-2xl">
              {userData.zodiac.emoji} {userData.zodiac.sign.split(' ')[0]}
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-7xl font-bold text-center mb-8 text-white drop-shadow-lg">
          {userData.name || "Dance Lover"}
        </h1>

        {/* Location */}
        {userData.city && (
          <div className="text-3xl mb-8 text-center opacity-90">
            📍 {userData.city.name}
            {userData.city.country && (
              <span>, {typeof userData.city.country === 'string' ? userData.city.country : userData.city.country.name}</span>
            )}
          </div>
        )}

        {/* Dance Role */}
        {userData.danceRole && (
          <div className="text-4xl mb-12 text-center font-semibold">
            {getRoleDisplay(userData.danceRole)}
          </div>
        )}

        {/* Dance Styles */}
        {userData.danceStyles && userData.danceStyles.length > 0 && (
          <div className="mb-16 text-center">
            <div className="text-3xl mb-6 font-semibold">Dance Styles</div>
            <div className="flex flex-wrap justify-center gap-4 max-w-[800px]">
              {userData.danceStyles.slice(0, 6).map((style, index) => (
                <span 
                  key={index}
                  className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full text-2xl font-medium border border-white border-opacity-30"
                >
                  {style}
                </span>
              ))}
              {userData.danceStyles.length > 6 && (
                <span className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full text-2xl font-medium border border-white border-opacity-30">
                  +{userData.danceStyles.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mb-12">
          <div className="text-4xl font-bold mb-4">Join the Dance Community!</div>
          <div className="text-2xl opacity-90">Tap the link to see my full profile</div>
        </div>

        {/* DanceTribe Branding */}
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <div className="text-6xl font-bold mb-4 tracking-wider">
            DANCETRIBE
          </div>
          <div className="text-2xl opacity-80">
            Where dancers connect 💃🕺
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black from-opacity-20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black from-opacity-20 to-transparent"></div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 