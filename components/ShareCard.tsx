"use client";

import React, { forwardRef } from 'react';
import QRCode from 'qrcode';

interface ShareCardProps {
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
    city: {
      name: string;
      country: { name: string };
      image?: string;
    };
    danceStyles: Array<{
      name: string;
      level: string;
    }>;
  };
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ userData }, ref) => {
  // Calculate age
  const birthDate = new Date(userData.dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear() - 
    (today.getMonth() < birthDate.getMonth() || 
     (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);

  // Calculate zodiac sign
  const getZodiacSign = (dateOfBirth: string) => {
    const date = new Date(dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return { name: "Aries", emoji: "♈" };
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return { name: "Taurus", emoji: "♉" };
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return { name: "Gemini", emoji: "♊" };
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return { name: "Cancer", emoji: "♋" };
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return { name: "Leo", emoji: "♌" };
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return { name: "Virgo", emoji: "♍" };
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return { name: "Libra", emoji: "♎" };
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return { name: "Scorpio", emoji: "♏" };
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return { name: "Sagittarius", emoji: "♐" };
    if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return { name: "Capricorn", emoji: "♑" };
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return { name: "Aquarius", emoji: "♒" };
    return { name: "Pisces", emoji: "♓" };
  };

  const zodiac = getZodiacSign(userData.dateOfBirth);
  const topDanceStyle = userData.danceStyles[0];
  
  // Create profile URL and generate QR code
  const profileUrl = `${process.env.NODE_ENV === 'production' ? 'https://dancetribe.co' : 'http://localhost:3000'}/dancer/${userData.id}`;
  
  // Use username if available, otherwise fallback to ID-based URL
  const shortUrl = userData.username 
    ? `${process.env.NODE_ENV === 'production' ? 'DanceTribe.co' : 'localhost:3000'}/${userData.username}`
    : `${process.env.NODE_ENV === 'production' ? 'DanceTribe.co' : 'localhost:3000'}/dancer/${userData.id}`;
  
  // Generate QR code data URL synchronously
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');
  const [isQrReady, setIsQrReady] = React.useState(false);
  
  React.useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then((url) => {
      setQrCodeUrl(url);
      setIsQrReady(true);
      console.log('QR Code generated:', url.substring(0, 50) + '...');
    }).catch((error) => {
      console.error('QR Code generation failed:', error);
    });
  }, [profileUrl]);

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
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 60px'
      }}
      data-qr-ready={isQrReady ? 'true' : 'false'}
    >
      {/* Top Section - Profile Info */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        {/* Profile Picture */}
        <div style={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          overflow: 'hidden',
          margin: '0 auto 40px',
          border: '8px solid rgba(255,255,255,0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}>
          <img
            src={userData.profilePicture}
            alt={userData.name}
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Name and Age */}
        <h1 style={{
          fontSize: '72px',
          fontWeight: 'bold',
          margin: '0 0 20px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          {userData.name}, {age}
        </h1>

        {/* Zodiac and Dance Style */}
        <div style={{
          fontSize: '42px',
          margin: '0 0 20px 0',
          fontWeight: '500'
        }}>
          {zodiac.emoji} {zodiac.name} • {topDanceStyle?.name} {topDanceStyle?.level}
        </div>

        {/* Location */}
        <div style={{
          fontSize: '36px',
          opacity: '0.9',
          fontWeight: '400'
        }}>
          📍 {userData.city.name}, {userData.city.country.name}
        </div>
      </div>

      {/* Middle Section - QR Code */}
      <div style={{
        textAlign: 'center',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: '30px',
        padding: '60px',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* QR Code */}
        {isQrReady && qrCodeUrl ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            margin: '0 auto 40px',
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              style={{
                width: '240px',
                height: '240px',
                display: 'block'
              }}
            />
          </div>
                  ) : (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              margin: '0 auto 40px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              width: '240px',
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📱</div>
              <div style={{ fontSize: '16px' }}>Loading QR...</div>
            </div>
          </div>
        )}

        {/* Scan Instructions */}
        <div style={{
          fontSize: '38px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>
          👆 Scan to see profile
        </div>

        {/* Short URL */}
        <div style={{
          fontSize: '32px',
          fontWeight: '600',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '15px',
          padding: '15px 30px',
          display: 'inline-block',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          {shortUrl}
        </div>
      </div>

      {/* Bottom Section - Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '60px'
      }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          lineHeight: '1.2'
        }}>
          Join the dance community
        </div>
        
        <div style={{
          fontSize: '36px',
          opacity: '0.9',
          fontWeight: '500',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>
          Find dancers near you! 💃🕺
        </div>
      </div>

      {/* Background Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 