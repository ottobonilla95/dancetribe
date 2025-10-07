"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "@/types/user";
import { FaMapMarkerAlt, FaHeart, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { getZodiacSign } from "@/utils/zodiac";

interface DancerCardProps {
  dancer: User & { 
    likedBy?: string[]; 
    danceStylesPopulated?: Array<{ name: string; _id: string }>;
  };
  showLikeButton?: boolean;
  showFlag?: boolean;
}

export default function DancerCard({ dancer, showLikeButton = true, showFlag = false }: DancerCardProps) {
  const zodiacInfo = dancer.dateOfBirth ? getZodiacSign(new Date(dancer.dateOfBirth)) : null;
  
  // Generate flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return null;
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-200">
      <Link href={`/dancer/${dancer._id}`} className="block">
        <div className="card-body p-4">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start gap-3 mb-3">
            <div className="avatar">
              <div className="w-16 h-16 rounded-full">
                {dancer.image ? (
                  <Image
                    src={dancer.image}
                    alt={dancer.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center rounded-full">
                    <span className="text-xl font-bold">
                      {dancer.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg truncate">{dancer.name}</h3>
                {showFlag && dancer.city?.country?.code && (
                  <span className="text-xl">{getFlagEmoji(dancer.city.country.code)}</span>
                )}
              </div>
              <p className="text-sm text-base-content/60">@{dancer.username}</p>
              
              {/* Location */}
              {dancer.city && (
                <div className="flex items-center gap-1 text-sm text-base-content/70 mt-1">
                  <FaMapMarkerAlt className="text-xs" />
                  <span className="truncate">{dancer.city.name}</span>
                </div>
              )}
            </div>

            {/* Age and Zodiac */}
            <div className="flex flex-col items-end text-sm text-base-content/60">
              {dancer.dateOfBirth && (
                <span>{new Date().getFullYear() - new Date(dancer.dateOfBirth).getFullYear()}</span>
              )}
              {zodiacInfo && <span className="text-lg">{zodiacInfo.emoji}</span>}
            </div>
          </div>

          {/* Dance Role Badge */}
          {dancer.danceRole && (
            <div className="mb-3">
              <span className={`badge badge-sm ${
                dancer.danceRole === 'leader' ? 'badge-primary' : 
                dancer.danceRole === 'follower' ? 'badge-secondary' : 
                'badge-accent'
              }`}>
                {dancer.danceRole === 'both' ? 'Leader & Follower' : 
                 dancer.danceRole.charAt(0).toUpperCase() + dancer.danceRole.slice(1)}
              </span>
            </div>
          )}

          {/* Dance Styles */}
          {dancer.danceStylesPopulated && dancer.danceStylesPopulated.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {dancer.danceStylesPopulated.slice(0, 3).map((style, index) => (
                  <span key={index} className="badge badge-outline badge-sm">
                    {style.name}
                  </span>
                ))}
                {dancer.danceStylesPopulated.length > 3 && (
                  <span className="badge badge-outline badge-sm">
                    +{dancer.danceStylesPopulated.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Anthem Preview */}
          {dancer.anthem && (
            <div className="mb-3 p-2 bg-base-200 rounded-lg">
              <p className="text-xs text-base-content/60 mb-1">Dance Anthem</p>
              <p className="text-sm font-medium truncate">
                {dancer.anthem.title} {dancer.anthem.artist && `- ${dancer.anthem.artist}`}
              </p>
            </div>
          )}

          {/* Social Media Icons */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-2">
              {dancer.socialMedia?.instagram && (
                <div className="text-pink-500">
                  <FaInstagram className="text-lg" />
                </div>
              )}
              {dancer.socialMedia?.tiktok && (
                <div className="text-black">
                  <FaTiktok className="text-lg" />
                </div>
              )}
              {dancer.socialMedia?.youtube && (
                <div className="text-red-500">
                  <FaYoutube className="text-lg" />
                </div>
              )}
            </div>

            {/* Like Count */}
            <div className="flex items-center gap-1 text-sm text-base-content/60">
              <FaHeart className="text-red-500" />
              <span>{dancer.likedBy?.length || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 