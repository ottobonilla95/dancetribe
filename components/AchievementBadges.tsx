"use client";

import { Badge } from "@/constants/badges";
import Image from "next/image";
import { useTranslation } from "./I18nProvider";

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
  const { t } = useTranslation();
  const displayBadges = showAll ? badges : badges.slice(0, maxDisplay);
  const hasMore = !showAll && badges.length > maxDisplay;

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        <p className="text-lg mb-2">🏆</p>
        <p>{t('profile.noBadgesYet')}</p>
        <p className="text-sm">{t('profile.keepDancing')}</p>
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
              className="flex flex-col items-center group w-[100px] md:w-[110px]"
            >
              {/* Medal Badge Only */}
              <div className="relative mb-3">
                <Image
                  src={tierStyle.medal}
                  alt={`${badge.tier} medal`}
                  width={96}
                  height={96}
                  className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 drop-shadow-2xl transform transition-all duration-300 active:scale-95 md:hover:scale-110 cursor-pointer"
                />
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
            {t('profile.viewAllBadges')} {badges.length} {t('common.badges')}
          </button>
        </div>
      )}
    </div>
  );
}

