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
      style={{ 
        width: '1080px',
        height: '1920px',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1 }}>
        <div style={{ position: 'absolute', top: '80px', left: '80px', fontSize: '128px' }}>💃</div>
        <div style={{ position: 'absolute', top: '160px', right: '128px', fontSize: '96px' }}>🕺</div>
        <div style={{ position: 'absolute', bottom: '320px', left: '64px', fontSize: '112px' }}>🎵</div>
        <div style={{ position: 'absolute', bottom: '240px', right: '80px', fontSize: '80px' }}>✨</div>
        <div style={{ position: 'absolute', top: '600px', left: '300px', fontSize: '144px', opacity: 0.05 }}>🌟</div>
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '64px' }}>
        
        {/* Profile Picture */}
        <div style={{ marginBottom: '48px', position: 'relative' }}>
          <div style={{ width: '288px', height: '288px', borderRadius: '50%', border: '8px solid white', overflow: 'hidden', backgroundColor: 'white' }}>
            {userData.image ? (
              <img 
                src={userData.image} 
                alt={userData.name || "Profile"} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
                          ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '128px', color: 'white' }}>
                  {userData.name?.charAt(0)?.toUpperCase() || "👤"}
                </span>
              </div>
            )}
          </div>
          
          {/* Zodiac Badge */}
          {userData.zodiac && (
            <div style={{ position: 'absolute', bottom: '-24px', right: '-24px', backgroundColor: 'white', color: '#7c3aed', padding: '12px 24px', borderRadius: '24px', fontWeight: 'bold', fontSize: '32px' }}>
              {userData.zodiac.emoji} {userData.zodiac.sign.split(' ')[0]}
            </div>
          )}
        </div>

        {/* Name */}
        <h1 style={{ fontSize: '112px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', color: 'white' }}>
          {userData.name || "Dance Lover"}
        </h1>

        {/* Location */}
        {userData.city && (
          <div style={{ fontSize: '48px', marginBottom: '32px', textAlign: 'center', opacity: 0.9 }}>
            📍 {userData.city.name}
            {userData.city.country && (
              <span>, {typeof userData.city.country === 'string' ? userData.city.country : userData.city.country.name}</span>
            )}
          </div>
        )}

        {/* Dance Role */}
        {userData.danceRole && (
          <div style={{ fontSize: '64px', marginBottom: '48px', textAlign: 'center', fontWeight: '600' }}>
            {getRoleDisplay(userData.danceRole)}
          </div>
        )}

        {/* Dance Styles */}
        {userData.danceStyles && userData.danceStyles.length > 0 && (
          <div style={{ marginBottom: '64px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '24px', fontWeight: '600' }}>Dance Styles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', maxWidth: '800px' }}>
              {userData.danceStyles.slice(0, 6).map((style, index) => (
                <span 
                  key={index}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px 24px', borderRadius: '24px', fontSize: '32px', fontWeight: '500', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                >
                  {style}
                </span>
              ))}
              {userData.danceStyles.length > 6 && (
                <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px 24px', borderRadius: '24px', fontSize: '32px', fontWeight: '500', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                  +{userData.danceStyles.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '16px' }}>Join the Dance Community!</div>
          <div style={{ fontSize: '32px', opacity: 0.9 }}>Tap the link to see my full profile</div>
        </div>

        {/* DanceTribe Branding */}
        <div style={{ position: 'absolute', bottom: '64px', left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '96px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '0.1em' }}>
            DANCETRIBE
          </div>
          <div style={{ fontSize: '32px', opacity: 0.8 }}>
            Where dancers connect 💃🕺
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '128px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '128px', background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}></div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 