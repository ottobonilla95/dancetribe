"use client";

import { Badge, CATEGORY_IMAGES } from "@/constants/badges";
import Image from "next/image";

interface AchievementBadgesProps {
  badges: Badge[];
  maxDisplay?: number;
  showAll?: boolean;
}

// Tier styling with custom medal images and ring colors
const getTierStyle = (tier: string) => {
  const styles = {
    bronze: {
      ring: "ring-orange-400",
      medal: "/img/badges/medals/bronze.png",
    },
    silver: {
      ring: "ring-slate-400",
      medal: "/img/badges/medals/silver.png",
    },
    gold: {
      ring: "ring-yellow-400",
      medal: "/img/badges/medals/gold.png",
    },
    platinum: {
      ring: "ring-cyan-400",
      medal: "/img/badges/medals/platinum.png",
    },
    diamond: {
      ring: "ring-purple-500",
      medal: "/img/badges/medals/diamond.png",
    },
  };
  return styles[tier as keyof typeof styles] || styles.bronze;
};

export default function AchievementBadges({
  badges,
  maxDisplay = 6,
  showAll = false,
}: AchievementBadgesProps) {
  const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);
  const hasMore = !showAll && badges.length > maxDisplay;

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        <p className="text-lg mb-2">🏆</p>
        <p>No badges earned yet</p>
        <p className="text-sm">Keep dancing to unlock achievements!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-8 md:gap-10 lg:gap-12">
        {displayBadges.map((badge) => {
          const tierStyle = getTierStyle(badge.tier);
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center group w-[120px] md:w-[130px]"
            >
              {/* Clean Circle Badge */}
              <div className="relative mb-3">
                {/* Main Circle Container */}
                <div
                  className={`
                    w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
                    rounded-full
                    bg-gradient-to-br from-gray-100 to-gray-200
                    ring-[3px] ${tierStyle.ring}
                    flex items-center justify-center
                    transform transition-all duration-300
                    active:scale-95 md:hover:scale-105
                    cursor-pointer
                    shadow-lg
                    relative
                    overflow-hidden
                  `}
                >
                  {/* Category Image or Icon */}
                  {CATEGORY_IMAGES[badge.category] ? (
                    <Image
                      src={CATEGORY_IMAGES[badge.category]}
                      alt={badge.category}
                      width={96}
                      height={96}
                      className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                    />
                  ) : (
                    // Fallback to emoji icon if no image
                    <div className="text-3xl md:text-4xl lg:text-5xl">
                      {badge.icon}
                    </div>
                  )}
                </div>

                {/* Tier Medal Badge - Larger and more prominent */}
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 z-10">
                  <Image
                    src={tierStyle.medal}
                    alt={`${badge.tier} medal`}
                    width={40}
                    height={40}
                    className="w-8 h-8 md:w-9 md:h-9 lg:w-11 lg:h-11 drop-shadow-xl"
                  />
                </div>
              </div>

              {/* Badge Info */}
              <div className="flex flex-col items-center w-full">
                {/* Badge Name */}
                <h4 className="font-bold text-xs md:text-sm text-center text-base-content leading-tight mb-1 px-2">
                  {badge.name}
                </h4>
                
                {/* Description */}
                <p className="text-[10px] md:text-xs text-base-content/60 text-center leading-snug line-clamp-2 px-1">
                  {badge.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <button className="btn btn-sm btn-outline">
            View all {badges.length} badges
          </button>
        </div>
      )}
    </div>
  );
}

