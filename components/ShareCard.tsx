"use client";

import React, { forwardRef } from "react";
import QRCode from "qrcode";
import { getCountryCode } from "../utils/countries";

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
    const topDanceStyle = userData.danceStyles[0];

    // Capitalize level for display
    const formatLevel = (level: string) => {
      return level.charAt(0).toUpperCase() + level.slice(1);
    };

    // Create short URL for both display and QR code
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "https://dancetribe.co"
        : "http://localhost:3000";
    const displayUrl =
      process.env.NODE_ENV === "production"
        ? "DanceTribe.co"
        : "localhost:3000";

    // Use username-based short URL if available, otherwise fallback to long URL
    const shortUrl = userData.username
      ? `${displayUrl}/${userData.username}`
      : `${displayUrl}/dancer/${userData.id}`;

    const fullShortUrl = userData.username
      ? `${baseUrl}/${userData.username}`
      : `${baseUrl}/dancer/${userData.id}`;

    // Generate QR code data URL synchronously - using the SHORT URL for QR
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("");
    const [isQrReady, setIsQrReady] = React.useState(false);

    React.useEffect(() => {
      QRCode.toDataURL(fullShortUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
        .then((url) => {
          setQrCodeUrl(url);
          setIsQrReady(true);
          console.log("QR Code generated:", url.substring(0, 50) + "...");
        })
        .catch((error) => {
          console.error("QR Code generation failed:", error);
        });
    }, [fullShortUrl]);

    return (
      <div
        ref={ref}
        style={{
          width: "1080px",
          fontFamily: "Arial, sans-serif",
          background: "#191e25", // site background color
          color: "#f3f4f6", // base-content equivalent
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "60px 60px",
          height: "1620px",
        }}
        data-qr-ready={isQrReady ? "true" : "false"}
      >
        {/* Top Section - Profile Info + QR */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "40px",
            marginBottom: "40px",
            marginTop: "50px",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          {/* Left: Profile Picture + Data */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              flex: 1,
            }}
          >
            {/* Profile Picture */}
            <div
              style={{
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "8px solid #374151", // base-300 equivalent
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
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

            {/* Profile Data */}
            <div style={{ flex: 1, textAlign: "left" }}>
              {/* Name and Age */}
              <h1
                style={{
                  fontSize: "64px",
                  fontWeight: "bold",
                  textShadow: "none",
                  marginBottom: "12px",
                  lineHeight: "1.1",
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
                }}
              >
                <span>{zodiac.emoji}</span>
                {zodiac.name}
              </div>

              {/* Location */}
              <div
                style={{
                  fontSize: "28px",
                  opacity: "0.9",
                  fontWeight: "400",
                  marginBottom: "12px",
                }}
              >
                📍 {userData.city.name}
              </div>
            </div>
            <div style={{ height: "100%" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "inline-block",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                }}
              >
                {isQrReady && qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{
                      width: "160px",
                      height: "160px",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Loading QR...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
        </div>

        {/* Dance Styles with Levels */}
        {userData.danceStyles && userData.danceStyles.length > 0 && (
          <div style={{ flex: 1, width: "100%" }}>
            <div
              style={{
                background: "#15191e",
                borderRadius: "15px",
                padding: "30px",
                maxWidth: "900px",
                margin: "0 auto 10px auto",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "24px",
                  opacity: "0.6",
                }}
              >
                Dance Profile
              </div>

              {/* Dance Role */}
              {userData.danceRole && (
                <>
                  <div
                    style={{
                      fontSize: "16px",
                      opacity: "0.6",
                      fontWeight: "500",
                      marginBottom: "8px",
                    }}
                  >
                    Dance Role
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "600",
                      marginBottom: "40px",
                    }}
                  >
                    {userData.danceRole === "leader"
                      ? "🕺 Leader"
                      : userData.danceRole === "follower"
                        ? "💃 Follower"
                        : "🔄 Both (Leader & Follower)"}
                  </div>
                </>
              )}

              <div
                style={{
                  fontSize: "16px",
                  opacity: "0.6",
                  fontWeight: "500",
                  marginBottom: "16px",
                }}
              >
                Dance Styles & Levels
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {userData.danceStyles.slice(0, 3).map((style, index) => {
                  // Convert level to number (1-4)
                  const levelMap: { [key: string]: number } = {
                    beginner: 1,
                    intermediate: 2,
                    advanced: 3,
                    expert: 4,
                  };
                  const levelNum = levelMap[style.level] || 1;

                  // Get emoji based on level
                  const getEmoji = (level: string) => {
                    switch (level) {
                      case "beginner":
                        return "🌱";
                      case "intermediate":
                        return "⭐";
                      case "advanced":
                        return "🔥";
                      case "expert":
                        return "👑";
                      default:
                        return "🌱";
                    }
                  };

                  return (
                    <div
                      key={index}
                      style={{
                        background: "#191e25",
                        borderRadius: "12px",
                        padding: "24px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <span style={{ fontSize: "32px" }}>
                            {getEmoji(style.level)}
                          </span>
                          <span
                            style={{
                              fontSize: "32px",
                              fontWeight: "600",
                            }}
                          >
                            {style.name}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "24px",
                            opacity: "0.7",
                            textTransform: "capitalize",
                          }}
                        >
                          {style.level}
                        </span>
                      </div>
                      {/* Level Progress Bar */}
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                        }}
                      >
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            style={{
                              height: "12px",
                              flex: "1",
                              borderRadius: "6px",
                              background:
                                bar <= levelNum
                                  ? "#7480ff"
                                  : "rgba(116,128,255,0.2)",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Hook Title */}
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #7480ff, #ff6b6b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "12px",
              lineHeight: "1.2",
            }}
          >
            ✨ Let's connect! ✨
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            👆 Scan to connect or visit:
          </div>
        </div>

        {/* Bottom Section - Community Info */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "50px",
          }}
        >
          {/* Website Link */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              background: "#7480ff",
              color: "white",
              padding: "12px 24px",
              borderRadius: "25px",
              display: "inline-block",
              marginBottom: "70px",
            }}
          >
            🌐 DanceTribe.co
          </div>
          <div
            style={{
              fontSize: "32px",
              opacity: "0.8",
              fontWeight: "500",
              textShadow: "none",
            }}
          >
            Connect with dancers worldwide! 🌍💃🕺
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
