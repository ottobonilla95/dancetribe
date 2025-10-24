"use client";

import React, { forwardRef } from "react";

interface ShareCardProps {
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
    hideAge?: boolean;
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
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          padding: "40px 50px",
        }}
      >
        {/* Header - Meet [Name] */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "900",
              color: "#ec4899",
              margin: "0 0 10px 0",
              padding: 0,
              textShadow: "2px 2px 8px rgba(236, 72, 153, 0.3)",
              letterSpacing: "-1px",
            }}
          >
            ✨ Meet {userData.name.charAt(0).toUpperCase() + userData.name.slice(1)} ✨
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#9ca3af",
              fontWeight: "600",
            }}
          >
            Dancing their way through {userData.city.name}
          </div>
        </div>

        {/* Main Content - Profile Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            borderRadius: "24px",
            padding: "50px 50px 55px 50px",
            width: "100%",
            maxWidth: "900px",
            boxShadow: "0 25px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Profile Picture and Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "20px",
            }}
          >
            {/* Profile Picture */}
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                overflow: "hidden",
                // border: "5px solid #ec4899",
                // boxShadow: "0 15px 40px rgba(236, 72, 153, 0.4), 0 0 20px rgba(236, 72, 153, 0.2)",
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
                  fontSize: "40px",
                  fontWeight: "900",
                  marginBottom: "10px",
                  lineHeight: "1",
                  color: "#ffffff",
                  textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                }}
              >
                {userData.name.charAt(0).toUpperCase() + userData.name.slice(1)}
                {!userData.hideAge && `, ${age}`}
              </h1>

              {/* Zodiac */}
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                  color: "#e5e7eb",
                }}
              >
                <span>{zodiac.emoji}</span>
                {zodiac.name}
              </div>

              {/* Location */}
              <div
                style={{
                  fontSize: "24px",
                  // color: "#60a5fa",
                  fontWeight: "600",
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
              gridTemplateRows: "auto auto",
              gap: "22px 28px",
              paddingTop: "24px",
            }}
          >
            {/* Nationality */}
            {userData.nationality && (
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    color: "#9ca3af",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Nationality
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#f3f4f6",
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
                    fontSize: "18px",
                    color: "#9ca3af",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Dance Role
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#f3f4f6",
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
                    fontSize: "18px",
                    color: "#9ca3af",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Experience
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#f3f4f6",
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
                    fontSize: "18px",
                    color: "#9ca3af",
                    marginBottom: "6px",
                    fontWeight: "500",
                  }}
                >
                  Danced In
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#f3f4f6",
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
            background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            padding: "16px 40px 46px 40px",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <img
            src="/icon.png"
            alt="DanceCircle"
            style={{
              marginTop:"20px",
              width: "40px",
              height: "40px",
              filter: "drop-shadow(0 2px 4px rgba(236, 72, 153, 0.3))",
            }}
          />
          <div
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#ffffff",
              textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
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

