"use client";

import { useState, useEffect } from "react";
import { useLikes } from "@/contexts/LikesContext";
import { useTranslation } from "./I18nProvider";

interface LikesDisplayProps {
  targetUserId: string;
  initialLikesCount: number;
}

export default function LikesDisplay({
  targetUserId,
  initialLikesCount
}: LikesDisplayProps) {
  const { t } = useTranslation();
  const { likesCount: contextLikesCount } = useLikes();
  const [likesCount, setLikesCount] = useState(initialLikesCount);

  // Update local state when context changes
  useEffect(() => {
    if (contextLikesCount[targetUserId] !== undefined) {
      setLikesCount(contextLikesCount[targetUserId]);
    }
  }, [contextLikesCount, targetUserId]);

  return (
    <span>❤️ {likesCount} {t('profile.likes')}</span>
  );
} 