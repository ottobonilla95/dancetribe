import Link from "next/link";
import { DanceStyle } from "@/types/dance-style";

interface HotDanceStyleCardProps {
  danceStyle: DanceStyle & { userCount: number };
  index: number;
}

export default function HotDanceStyleCard({ danceStyle, index }: HotDanceStyleCardProps) {
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
      case 'latin': return 'from-red-500/20 to-orange-500/20 border-red-500/30';
      case 'ballroom': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'street': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'contemporary': return 'from-green-500/20 to-teal-500/20 border-green-500/30';
      case 'traditional': return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
      default: return 'from-primary/20 to-secondary/20 border-primary/30';
    }
  };

  return (
    <Link
      href={`/dance-style/${danceStyle._id}`}
      className={`card bg-gradient-to-br ${getCategoryColor(danceStyle.category)} border hover:scale-105 transition-all duration-300 p-4 text-center relative overflow-hidden`}
    >
      {/* Rank Badge */}
      <div className="absolute top-2 left-2 bg-primary text-primary-content text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
        {index}
      </div>

      <div className="space-y-2">
        {/* Category Emoji */}
        <div className="text-2xl">
          {getCategoryEmoji(danceStyle.category)}
        </div>

        {/* Dance Style Name */}
        <h3 className="font-bold text-lg truncate">
          {danceStyle.name}
        </h3>

        {/* User Count */}
        <div className="text-sm text-base-content/70">
          <span className="font-medium">{danceStyle.userCount}</span> dancers
        </div>

        {/* Category Badge */}
        <span className="badge badge-outline badge-xs capitalize">
          {danceStyle.category}
        </span>
      </div>
    </Link>
  );
} 