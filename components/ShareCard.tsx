"use client";

import React, { forwardRef } from "react";

interface ShareCardProps {
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
    nationality?: string;
    danceRole?: string;
    city: {
      name: string;
      country: { name: string };
      image?: string;
    };
    danceStyles: Array<{
      name: string;
      level: string;
    }>;
    yearsDancing?: number;
    citiesVisited?: number;
  };
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ userData }, ref) => {
    // Calculate age
    const birthDate = new Date(userData.dateOfBirth);
    const today = new Date();
    const age =
      today.getFullYear() -
      birthDate.getFullYear() -
      (today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())
        ? 1
        : 0);

    // Calculate zodiac sign
    const getZodiacSign = (dateOfBirth: string) => {
      const date = new Date(dateOfBirth);
      const month = date.getMonth() + 1;
      const day = date.getDate();

      if ((month == 3 && day >= 21) || (month == 4 && day <= 19))
        return { name: "Aries", emoji: "♈" };
      if ((month == 4 && day >= 20) || (month == 5 && day <= 20))
        return { name: "Taurus", emoji: "♉" };
      if ((month == 5 && day >= 21) || (month == 6 && day <= 20))
        return { name: "Gemini", emoji: "♊" };
      if ((month == 6 && day >= 21) || (month == 7 && day <= 22))
        return { name: "Cancer", emoji: "♋" };
      if ((month == 7 && day >= 23) || (month == 8 && day <= 22))
        return { name: "Leo", emoji: "♌" };
      if ((month == 8 && day >= 23) || (month == 9 && day <= 22))
        return { name: "Virgo", emoji: "♍" };
      if ((month == 9 && day >= 23) || (month == 10 && day <= 22))
        return { name: "Libra", emoji: "♎" };
      if ((month == 10 && day >= 23) || (month == 11 && day <= 21))
        return { name: "Scorpio", emoji: "♏" };
      if ((month == 11 && day >= 22) || (month == 12 && day <= 21))
        return { name: "Sagittarius", emoji: "♐" };
      if ((month == 12 && day >= 22) || (month == 1 && day <= 19))
        return { name: "Capricorn", emoji: "♑" };
      if ((month == 1 && day >= 20) || (month == 2 && day <= 18))
        return { name: "Aquarius", emoji: "♒" };
      return { name: "Pisces", emoji: "♓" };
    };

    const zodiac = getZodiacSign(userData.dateOfBirth);

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          height: "1080px",
          fontFamily: "Arial, sans-serif",
          background: "#2c3442",
          color: "#f3f4f6",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 60px",
        }}
      >
        {/* Header - Meet [Name] */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <span style={{ fontSize: "48px" }}>✨</span>
            Meet {userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}
            <span style={{ fontSize: "48px" }}>✨</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#9ca3af",
              fontWeight: "500",
            }}
          >
            Dancing their way through {userData.city.name}
          </div>
        </div>

        {/* Main Content - Profile Card */}
        <div
          style={{
            background: "#1f2937",
            borderRadius: "24px",
            padding: "40px",
            width: "100%",
            maxWidth: "900px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Profile Picture and Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              marginBottom: "40px",
            }}
          >
            {/* Profile Picture */}
            <div
              style={{
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "6px solid #374151",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                flexShrink: 0,
              }}
            >
              <img
                src={userData.profilePicture}
                alt={userData.name}
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {/* Name and Age */}
              <h1
                style={{
                  fontSize: "56px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  lineHeight: "1",
                }}
              >
                {userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}
                , {age}
              </h1>

              {/* Zodiac */}
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <span>{zodiac.emoji}</span>
                {zodiac.name}
              </div>

              {/* Location */}
              <div
                style={{
                  fontSize: "32px",
                  color: "#f3f4f6",
                  fontWeight: "500",
                }}
              >
                📍 {userData.city.name}, {userData.city.country.name}
              </div>
            </div>
          </div>

          {/* 2x2 Grid - All Info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              paddingTop: "24px",
            }}
          >
            {/* Nationality */}
            {userData.nationality && (
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                  }}
                >
                  Nationality
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "600",
                  }}
                >
                  🇨🇴 {userData.nationality}
                </div>
              </div>
            )}

            {/* Dance Role */}
            {userData.danceRole && (
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                  }}
                >
                  Dance Role
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "600",
                  }}
                >
                  {userData.danceRole === "leader"
                    ? "🕺 Leader"
                    : userData.danceRole === "follower"
                      ? "💃 Follower"
                      : "🔄 Both"}
                </div>
              </div>
            )}

            {/* Years Dancing */}
            {userData.yearsDancing && (
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                  }}
                >
                  Experience
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "600",
                  }}
                >
                  🎵 {userData.yearsDancing} {userData.yearsDancing === 1 ? 'year' : 'years'}
                </div>
              </div>
            )}

            {/* Cities Visited */}
            {userData.citiesVisited && (
              <div>
                <div
                  style={{
                    fontSize: "28px",
                    color: "#9ca3af",
                    marginBottom: "8px",
                  }}
                >
                  Danced In
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "600",
                  }}
                >
                  🌍 {userData.citiesVisited} {userData.citiesVisited === 1 ? 'city' : 'cities'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - DanceCircle Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            background: "#1f2937",
            padding: "20px 40px",
            borderRadius: "16px",
          }}
        >
          <img
            src="/icon.png"
            alt="DanceCircle"
            style={{
              width: "40px",
              height: "40px",
            }}
          />
          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#f3f4f6",
            }}
          >
            DanceCircle
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;

