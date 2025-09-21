"use client";

import { useState, useEffect } from "react";
import { useLikes } from "@/contexts/LikesContext";

interface LikesDisplayProps {
  targetUserId: string;
  initialLikesCount: number;
}

export default function LikesDisplay({
  targetUserId,
  initialLikesCount
}: LikesDisplayProps) {
  const { likesCount: contextLikesCount } = useLikes();
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  // Update local state when context changes
  useEffect(() => {
    if (contextLikesCount[targetUserId] !== undefined) {
      setLikesCount(contextLikesCount[targetUserId]);
    }
  }, [contextLikesCount, targetUserId]);

  return (
    <span>❤️ {likesCount} like{likesCount !== 1 ? 's' : ''}</span>
  );
} 