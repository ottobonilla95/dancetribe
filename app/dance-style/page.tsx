import { Suspense } from "react";
import connectMongo from "@/libs/mongoose";
import DanceStyle from "@/models/DanceStyle";
import User from "@/models/User";
import { DanceStyle as DanceStyleType } from "@/types/dance-style";
import Link from "next/link";
import { 
  FaSearch, 
  FaFilter, 
  FaUsers, 
  FaFire, 
  FaCrown, 
  FaSeedling,
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaHeart
} from "react-icons/fa";

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'latin': return '🌶️';
    case 'ballroom': return '👑';
    case 'street': return '🏙️';
    case 'contemporary': return '🎨';
    case 'traditional': return '🏛️';
    default: return '💃';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'latin': return 'bg-red-500';
    case 'ballroom': return 'bg-purple-500';
    case 'street': return 'bg-gray-600';
    case 'contemporary': return 'bg-blue-500';
    case 'traditional': return 'bg-amber-600';
    default: return 'bg-gray-500';
  }
};

const getCategoryDescription = (category: string) => {
  switch (category) {
    case 'latin': return 'Passionate and rhythmic dances from Latin America';
    case 'ballroom': return 'Elegant and structured partner dances';
    case 'street': return 'Urban and freestyle dance styles';
    case 'contemporary': return 'Modern and expressive dance forms';
    case 'traditional': return 'Cultural and folk dance traditions';
    default: return 'Various dance styles and forms';
  }
};

async function getAllDanceStyles(): Promise<(DanceStyleType & { userCount: number })[]> {
  try {
    await connectMongo();

    // Get all active dance styles
    const danceStyles = await DanceStyle.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    // Get user count for each dance style
    const stylesWithCount = await Promise.all(
      danceStyles.map(async (style) => {
        const userCount = await User.countDocuments({
          "danceStyles.danceStyle": style._id,
          isProfileComplete: true
        });

        return {
          ...style,
          _id: style._id.toString(),
          id: style._id.toString(),
          userCount
        };
      })
    );

    return stylesWithCount;
  } catch (error) {
    console.error("Error fetching dance styles:", error);
    return [];
  }
}

async function getCategoryStats() {
  try {
    await connectMongo();

    const categoryStats = await User.aggregate([
      { $match: { isProfileComplete: true } },
      { $unwind: "$danceStyles" },
      {
        $lookup: {
          from: "dancestyles",
          localField: "danceStyles.danceStyle",
          foreignField: "_id",
          as: "styleDetails"
        }
      },
      { $unwind: "$styleDetails" },
      { $match: { "styleDetails.isActive": true } },
      {
        $group: {
          _id: "$styleDetails.category",
          userCount: { $sum: 1 },
          styleCount: { $addToSet: "$styleDetails._id" }
        }
      },
      {
        $project: {
          category: "$_id",
          userCount: 1,
          styleCount: { $size: "$styleCount" }
        }
      },
      { $sort: { userCount: -1 } }
    ]);

    return categoryStats;
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return [];
  }
}

export default async function DanceStylesPage() {
  const [danceStyles, categoryStats] = await Promise.all([
    getAllDanceStyles(),
    getCategoryStats()
  ]);

  // Group styles by category
  const stylesByCategory = danceStyles.reduce((acc, style) => {
    if (!acc[style.category]) {
      acc[style.category] = [];
    }
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, (DanceStyleType & { userCount: number })[]>);

  // Sort categories by popularity
  const sortedCategories = Object.keys(stylesByCategory).sort((a, b) => {
    const aStats = categoryStats.find(stat => stat.category === a);
    const bStats = categoryStats.find(stat => stat.category === b);
    return (bStats?.userCount || 0) - (aStats?.userCount || 0);
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            All Dance Styles
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Discover the incredible variety of dance styles practiced by our community. 
            From passionate Latin rhythms to elegant ballroom moves, find your perfect dance match.
          </p>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {categoryStats.map((stat) => (
            <div key={stat.category} className="stat bg-base-200 rounded-lg">
              <div className="stat-title flex items-center gap-2">
                <span className="text-lg">{getCategoryEmoji(stat.category)}</span>
                <span className="capitalize">{stat.category}</span>
              </div>
              <div className="stat-value text-primary">{formatNumber(stat.userCount)}</div>
              <div className="stat-desc">{stat.styleCount} styles</div>
            </div>
          ))}
        </div>

        {/* Dance Styles by Category */}
        <div className="space-y-12">
          {sortedCategories.map((category) => {
            const styles = stylesByCategory[category];
            const categoryStat = categoryStats.find(stat => stat.category === category);
            
            return (
              <section key={category} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <span className="text-3xl">{getCategoryEmoji(category)}</span>
                        <span className="capitalize">{category} Dance</span>
                      </h2>
                      <div className={`badge badge-lg ${getCategoryColor(category)} text-white whitespace-nowrap text-xs sm:text-sm`}>
                        {formatNumber(categoryStat?.userCount || 0)} dancers
                      </div>
                    </div>
                    <p className="text-base-content/70 mt-1">
                      {getCategoryDescription(category)}
                    </p>
                  </div>
                </div>

                {/* Styles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {styles
                    .sort((a, b) => b.userCount - a.userCount)
                    .map((style) => (
                    <Link
                      key={style._id}
                      href={`/dance-style/${style._id}`}
                      className="card bg-base-200 hover:bg-base-300 transition-all duration-200 hover:shadow-lg group"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="card-title text-lg group-hover:text-primary transition-colors">
                            {style.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-base-content/60">
                            <FaUsers className="w-3 h-3" />
                            <span>{formatNumber(style.userCount)}</span>
                          </div>
                        </div>

                        {style.description && (
                          <p className="text-sm text-base-content/70 mb-3 line-clamp-2">
                            {style.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              {style.isPartnerDance ? "👫 Partner" : "🕺 Solo"}
                            </span>
                            {style.isActive && (
                              <span className="badge badge-success badge-sm">Active</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <span className="text-sm font-medium">Explore</span>
                            <FaHeart className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Empty State */}
        {danceStyles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">��</div>
            <h3 className="text-2xl font-bold mb-2">No Dance Styles Available</h3>
            <p className="text-base-content/70">
              We&apos;re working on adding more dance styles to our platform.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Don&apos;t See Your Dance Style?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            We&apos;re constantly adding new dance styles to our platform. 
            Let us know what you&apos;d like to see!
          </p>
          <button className="btn btn-white btn-lg">
            Request a Dance Style
          </button>
        </div>
      </div>
    </div>
  );
}
