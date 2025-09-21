"use client";

import { useState } from "react";
import LikeButton from "./LikeButton";

interface LikeSectionProps {
  targetUserId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  showStaticCount?: boolean;
}

export default function LikeSection({
  targetUserId,
  initialLikesCount,
  initialIsLiked,
  showStaticCount = false
}: LikeSectionProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleLikeUpdate = (newLikesCount: number, newIsLiked: boolean) => {
    setLikesCount(newLikesCount);
    setIsLiked(newIsLiked);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Static Count Display */}
      {showStaticCount && (
        <span>❤️ {likesCount} like{likesCount !== 1 ? 's' : ''}</span>
      )}
      
      {/* Like Button */}
      <LikeButton
        targetUserId={targetUserId}
        initialLikesCount={likesCount}
        initialIsLiked={isLiked}
        onLikeUpdate={handleLikeUpdate}
      />
    </div>
  );
} 