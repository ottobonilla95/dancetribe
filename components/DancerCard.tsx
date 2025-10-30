"use client";

import Image from "next/image";
import Link from "next/link";
import { User } from "@/types/user";
import { FaMapMarkerAlt, FaHeart, FaInstagram, FaTiktok, FaYoutube, FaGraduationCap, FaHeadphones, FaCamera } from "react-icons/fa";
import { getZodiacSign } from "@/utils/zodiac";
import { getCountryCode } from "@/utils/countries";
import { useTranslation } from "@/components/I18nProvider";

interface DancerCardProps {
  dancer: User & { 
    likedBy?: string[]; 
    danceStylesPopulated?: Array<{ name: string; _id: string }>;
    openToMeetTravelers?: boolean;
    lookingForPracticePartners?: boolean;
    activeCity?: any;
    isTeacher?: boolean;
    isDJ?: boolean;
    isPhotographer?: boolean;
    jackAndJillCompetitions?: Array<{
      placement: string;
      year: number;
    }>;
  };
  showLikeButton?: boolean;
  showFlag?: boolean;
  showHomeCity?: boolean; // Show home city for travelers
}

export default function DancerCard({ dancer, showLikeButton = true, showFlag = false, showHomeCity = false }: DancerCardProps) {
  const { t } = useTranslation();
  const zodiacInfo = dancer.dateOfBirth ? getZodiacSign(new Date(dancer.dateOfBirth)) : null;
  
  // Check if dancer is traveling (activeCity different from home city)
  const isTraveling = dancer.openToMeetTravelers && 
    dancer.activeCity && 
    dancer.city && 
    dancer.activeCity._id !== dancer.city._id;
  
  // Generate flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return null;
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Calculate J&J competition stats
  const getJJStats = () => {
    if (!dancer.jackAndJillCompetitions || dancer.jackAndJillCompetitions.length === 0) {
      return null;
    }
    const first = dancer.jackAndJillCompetitions.filter(c => c.placement === '1st').length;
    const second = dancer.jackAndJillCompetitions.filter(c => c.placement === '2nd').length;
    const third = dancer.jackAndJillCompetitions.filter(c => c.placement === '3rd').length;
    const total = dancer.jackAndJillCompetitions.length;
    
    return { first, second, third, total };
  };

  const jjStats = getJJStats();

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
                {dancer.nationality && (
                  <span className="text-xl">{getFlagEmoji(getCountryCode(dancer.nationality))}</span>
                )}
                <h3 className="font-bold text-lg truncate">{dancer.name}</h3>
              </div>
              <p className="text-sm text-base-content/60">@{dancer.username}</p>
              
              {/* Location - Show home city for travelers, otherwise show city */}
              {dancer.city && dancer.city.name && (showHomeCity || !isTraveling) && (
                <div className="flex items-center gap-1 text-sm text-base-content/70 mt-1">
                  <FaMapMarkerAlt className="text-xs" />
                  {isTraveling && showHomeCity && <span className="text-xs opacity-70">From: </span>}
                  <span className="truncate">{dancer.city.name}</span>
                </div>
              )}
            </div>

            {/* Age, Zodiac, and Experience */}
            <div className="flex flex-col items-end text-sm text-base-content/60 gap-0.5">
              {dancer.dateOfBirth && !dancer.hideAge && (
                <span className="font-semibold">{new Date().getFullYear() - new Date(dancer.dateOfBirth).getFullYear()}</span>
              )}
              {zodiacInfo && <span className="text-lg">{zodiacInfo.emoji}</span>}
              {dancer.dancingStartYear && (
                <span className="text-xs font-medium flex items-center gap-0.5">
                  💃 {new Date().getFullYear() - dancer.dancingStartYear}y
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          {dancer.bio && (
            <p className="text-sm text-base-content/80 italic line-clamp-2 mb-2">
              "{dancer.bio}"
            </p>
          )}

          {/* Dance Role Badge */}
          {dancer.danceRole && (
            <div className="">
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

          {/* Professional Roles - Prominent Display */}
          {(dancer.isTeacher || dancer.isDJ || dancer.isPhotographer) && (
            <div className="flex flex-wrap gap-2">
              {dancer.isTeacher && (
                <span className="badge badge-sm badge-primary gap-1.5 font-semibold">
                  <FaGraduationCap className="text-sm" />
                  Teacher
                </span>
              )}
              {dancer.isDJ && (
                <span className="badge badge-sm badge-secondary gap-1.5 font-semibold">
                  <FaHeadphones className="text-sm" />
                  DJ
                </span>
              )}
              {dancer.isPhotographer && (
                <span className="badge badge-sm badge-accent gap-1.5 font-semibold">
                  <FaCamera className="text-sm" />
                  Photographer
                </span>
              )}
            </div>
          )}

          {/* J&J Competition Achievements */}
          {jjStats && jjStats.total > 0 && (
            <div className="flex flex-wrap gap-2">
              {jjStats.first > 0 || jjStats.second > 0 || jjStats.third > 0 ? (
                <>
                  {jjStats.first > 0 && (
                    <span className="badge badge-sm bg-yellow-500/90 text-white border-0 gap-1 font-bold">
                      🥇 {jjStats.first}
                    </span>
                  )}
                  {jjStats.second > 0 && (
                    <span className="badge badge-sm bg-gray-400/90 text-white border-0 gap-1 font-bold">
                      🥈 {jjStats.second}
                    </span>
                  )}
                  {jjStats.third > 0 && (
                    <span className="badge badge-sm bg-orange-600/90 text-white border-0 gap-1 font-bold">
                      🥉 {jjStats.third}
                    </span>
                  )}
                </>
              ) : (
                <span className="badge badge-sm badge-outline gap-1">
                  🏅 J&J {jjStats.total}
                </span>
              )}
            </div>
          )}

          {/* Connect Preferences */}
          {(dancer.openToMeetTravelers || dancer.lookingForPracticePartners) && (
            <div className="flex flex-wrap gap-2">
              {dancer.openToMeetTravelers && (
                <span className="badge badge-sm badge-info gap-1">
                  ✈️ {t('dancerCard.traveler')}
                </span>
              )}
              {dancer.lookingForPracticePartners && (
                <span className="badge badge-sm badge-success gap-1">
                  🤝 {t('dancerCard.openToPractice')}
                </span>
              )}
            </div>
          )}

          {/* Dance Styles */}
          {dancer.danceStylesPopulated && dancer.danceStylesPopulated.length > 0 && (
            <div className="mb-1.5">
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