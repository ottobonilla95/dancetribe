"use client";

import { usePresence } from '@/hooks/usePresence';

/**
 * Silent component that tracks user presence in Firebase
 * Add this to your root layout to track all logged-in users
 */
export default function PresenceTracker(): null {
  // This hook automatically tracks presence
  usePresence();

  // This component renders nothing
  return null;
}

