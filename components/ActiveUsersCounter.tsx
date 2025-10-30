"use client";

import { usePresence } from '@/hooks/usePresence';
import { FaCircle } from 'react-icons/fa';

export default function ActiveUsersCounter() {
  const { activeUsers } = usePresence();

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-success/20 text-success rounded-lg border border-success/30">
      <FaCircle className="text-xs animate-pulse" />
      <span className="font-semibold text-sm">
        {activeUsers} {activeUsers === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
}

