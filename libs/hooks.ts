import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Custom hook to manage friend request count with polling
 */
export function useFriendRequestCount() {
  const { data: session } = useSession();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('/api/user/friend-requests-count');
        if (response.ok) {
          const data = await response.json();
          setPendingRequests(data.count || 0);
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

  return pendingRequests;
} 