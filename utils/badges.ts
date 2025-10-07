import { BADGES, Badge } from "@/constants/badges";

interface UserBadgeData {
  dancingStartYear?: number;
  citiesVisited?: any[];
  danceStyles?: any[];
  friends?: any[];
  likedBy?: any[];
  isTeacher?: boolean;
  teacherProfile?: {
    yearsOfExperience?: number;
  };
}

export function calculateUserBadges(userData: UserBadgeData): Badge[] {
  const earnedBadges: Badge[] = [];

  // Calculate metrics
  const currentYear = new Date().getFullYear();
  const yearsOfDancing = userData.dancingStartYear
    ? currentYear - userData.dancingStartYear
    : 0;
  
  const citiesVisitedCount = userData.citiesVisited?.length || 0;
  
  // Calculate unique continents from cities visited
  const uniqueContinents = new Set(
    userData.citiesVisited
      ?.map((city: any) => {
        // Handle both populated and non-populated continent data
        if (city.continent) {
          if (typeof city.continent === 'string') {
            return city.continent;
          } else if (city.continent._id) {
            return city.continent._id;
          } else if (city.continent.id) {
            return city.continent.id;
          }
        }
        return null;
      })
      .filter(Boolean) || []
  );
  const continentsVisitedCount = uniqueContinents.size;
  
  const danceStylesCount = userData.danceStyles?.length || 0;
  
  // Count expert level styles
  const expertStylesCount = userData.danceStyles?.filter(
    (style: any) => style.level === "expert"
  ).length || 0;
  
  const friendsCount = userData.friends?.length || 0;
  const likesCount = userData.likedBy?.length || 0;
  const teachingYears = userData.teacherProfile?.yearsOfExperience || 0;

  // Check each badge
  for (const badge of BADGES) {
    let earned = false;

    switch (badge.requirement.type) {
      case "yearsOfDancing":
        earned = yearsOfDancing >= badge.requirement.value;
        break;

      case "citiesVisited":
        earned = citiesVisitedCount >= badge.requirement.value;
        break;

      case "continentsVisited":
        earned = continentsVisitedCount >= badge.requirement.value;
        break;

      case "danceStyles":
        earned = danceStylesCount >= badge.requirement.value;
        break;

      case "expertStyles":
        earned = expertStylesCount >= badge.requirement.value;
        break;

      case "friends":
        earned = friendsCount >= badge.requirement.value;
        break;

      case "likes":
        earned = likesCount >= badge.requirement.value;
        break;

      case "isTeacher":
        earned = userData.isTeacher === true;
        break;

      case "teachingYears":
        earned = userData.isTeacher === true && teachingYears >= badge.requirement.value;
        break;

      default:
        earned = false;
    }

    if (earned) {
      earnedBadges.push(badge);
    }
  }

  // Filter to show only the highest tier badge per category
  const tierOrder = { diamond: 0, platinum: 1, gold: 2, silver: 3, bronze: 4 };
  const badgesByCategory = new Map<string, Badge>();

  for (const badge of earnedBadges) {
    const existing = badgesByCategory.get(badge.category);
    if (!existing || tierOrder[badge.tier] < tierOrder[existing.tier]) {
      badgesByCategory.set(badge.category, badge);
    }
  }

  // Convert back to array and sort by tier
  const filteredBadges = Array.from(badgesByCategory.values());
  filteredBadges.sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.category.localeCompare(b.category);
  });

  return filteredBadges;
}

export function getNextBadges(userData: UserBadgeData, limit: number = 3): Array<Badge & { progress: number }> {
  const earnedBadges = calculateUserBadges(userData);
  const earnedBadgeIds = new Set(earnedBadges.map(b => b.id));
  
  // Calculate current metrics
  const currentYear = new Date().getFullYear();
  const yearsOfDancing = userData.dancingStartYear
    ? currentYear - userData.dancingStartYear
    : 0;
  const citiesVisitedCount = userData.citiesVisited?.length || 0;
  const uniqueContinents = new Set(
    userData.citiesVisited
      ?.map((city: any) => {
        if (city.continent) {
          if (typeof city.continent === 'string') return city.continent;
          return city.continent._id || city.continent.id;
        }
        return null;
      })
      .filter(Boolean) || []
  );
  const continentsVisitedCount = uniqueContinents.size;
  const danceStylesCount = userData.danceStyles?.length || 0;
  const expertStylesCount = userData.danceStyles?.filter(
    (style: any) => style.level === "expert"
  ).length || 0;
  const friendsCount = userData.friends?.length || 0;
  const likesCount = userData.likedBy?.length || 0;
  const teachingYears = userData.teacherProfile?.yearsOfExperience || 0;

  const nextBadges = BADGES
    .filter(badge => !earnedBadgeIds.has(badge.id))
    .map(badge => {
      let currentValue = 0;
      let targetValue = badge.requirement.value;

      switch (badge.requirement.type) {
        case "yearsOfDancing":
          currentValue = yearsOfDancing;
          break;
        case "citiesVisited":
          currentValue = citiesVisitedCount;
          break;
        case "continentsVisited":
          currentValue = continentsVisitedCount;
          break;
        case "danceStyles":
          currentValue = danceStylesCount;
          break;
        case "expertStyles":
          currentValue = expertStylesCount;
          break;
        case "friends":
          currentValue = friendsCount;
          break;
        case "likes":
          currentValue = likesCount;
          break;
        case "isTeacher":
          currentValue = userData.isTeacher ? 1 : 0;
          break;
        case "teachingYears":
          currentValue = teachingYears;
          break;
      }

      const progress = Math.min((currentValue / targetValue) * 100, 99);
      
      return {
        ...badge,
        progress,
      };
    })
    .filter(badge => badge.progress > 0) // Only show badges with some progress
    .sort((a, b) => b.progress - a.progress) // Sort by progress descending
    .slice(0, limit);

  return nextBadges;
}

