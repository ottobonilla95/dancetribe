"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface FriendRequestContextType {
  pendingCount: number;
  refreshCount: () => Promise<void>;
}

const FriendRequestContext = createContext<FriendRequestContextType>({
  pendingCount: 0,
  refreshCount: async () => {},
});

export function FriendRequestProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const isFetchingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPendingRequests = useCallback(async () => {
    if (isFetchingRef.current || !session?.user?.id) {
      console.log('⏭️ Skipping fetch - already fetching or no session');
      return;
    }
    
    console.log('🔄 Fetching friend requests count...');
    isFetchingRef.current = true;
    try {
      const response = await fetch('/api/user/friend-requests-count', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Friend requests fetched:', data.count);
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching friend requests:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [session?.user?.id]);

  useEffect(() => {
    console.log('🔵 FriendRequestContext: useEffect triggered', { userId: session?.user?.id });
    
    // Clear any existing interval
    if (intervalRef.current) {
      console.log('🧹 Clearing existing interval');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!session?.user?.id) {
      console.log('⚠️ No session, resetting count');
      setPendingCount(0);
      return;
    }

    console.log('🎯 Setting up friend requests polling');
    // Initial fetch
    fetchPendingRequests();
    
    // Poll every 60 seconds (increased from 30s to reduce load)
    intervalRef.current = setInterval(() => {
      console.log('⏰ Interval tick - fetching friend requests');
      fetchPendingRequests();
    }, 60000);
    
    return () => {
      console.log('🔴 FriendRequestContext: cleanup');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [session?.user?.id, fetchPendingRequests]); // Dependencies

  const refreshCount = async () => {
    await fetchPendingRequests();
  };

  return (
    <FriendRequestContext.Provider value={{ pendingCount, refreshCount }}>
      {children}
    </FriendRequestContext.Provider>
  );
}

export function useFriendRequestCount() {
  const context = useContext(FriendRequestContext);
  if (!context) {
    throw new Error('useFriendRequestCount must be used within FriendRequestProvider');
  }
  return context.pendingCount;
}

export function useRefreshFriendRequests() {
  const context = useContext(FriendRequestContext);
  if (!context) {
    throw new Error('useRefreshFriendRequests must be used within FriendRequestProvider');
  }
  return context.refreshCount;
}

