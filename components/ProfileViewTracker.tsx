"use client";

import { useEffect } from 'react';

interface ProfileViewTrackerProps {
  profileUserId: string;
}

export default function ProfileViewTracker({ profileUserId }: ProfileViewTrackerProps): null {
  useEffect(() => {
    // Track view after 3 seconds (avoid counting quick bounces)
    const timer = setTimeout(() => {
      fetch('/api/user/profile-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileUserId }),
      }).catch(err => console.error('Failed to track profile view:', err));
    }, 3000);

    return () => clearTimeout(timer);
  }, [profileUserId]);

  return null; // Invisible tracker
}

