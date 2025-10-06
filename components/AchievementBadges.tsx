"use client";

import { Badge, TIER_COLORS, TIER_LABELS } from "@/constants/badges";

interface AchievementBadgesProps {
  badges: Badge[];
  maxDisplay?: number;
  showAll?: boolean;
}

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="card bg-base-100 border border-base-300 hover:border-primary transition-all hover:shadow-lg group"
          >
            <div className="card-body p-4 text-center">
              <div className="text-4xl mb-2">{badge.icon}</div>
              <h4 className="font-semibold text-sm mb-1">{badge.name}</h4>
              <p className="text-xs text-base-content/60 mb-2">
                {badge.description}
              </p>
              <div className={`badge badge-sm ${TIER_COLORS[badge.tier]}`}>
                {TIER_LABELS[badge.tier]}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <p className="text-sm text-base-content/60">
            +{badges.length - maxDisplay} more badge
            {badges.length - maxDisplay !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

