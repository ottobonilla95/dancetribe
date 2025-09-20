"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaUserFriends, FaBell } from "react-icons/fa";

export default function FriendRequestNotification() {
  const { data: session } = useSession();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('/api/user/friend-requests-count');
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data.count || 0);
          setIsVisible(data.count > 0);
        }
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchPendingRequests();
    
    // Check for updates every 30 seconds
    const interval = setInterval(fetchPendingRequests, 30000);
    
    return () => clearInterval(interval);
  }, [session]);

  if (!session || !isVisible || pendingRequests === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-40">
      <Link 
        href="/friends"
        className="btn btn-secondary btn-sm gap-2 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
      >
        <FaBell className="text-sm" />
        <span className="hidden sm:inline">
          {pendingRequests} Friend Request{pendingRequests > 1 ? 's' : ''}
        </span>
        <span className="sm:hidden">
          {pendingRequests}
        </span>
      </Link>
    </div>
  );
} 