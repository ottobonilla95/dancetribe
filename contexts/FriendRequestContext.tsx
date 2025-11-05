"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
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

  const fetchPendingRequests = useCallback(async () => {
    if (isFetchingRef.current || !session?.user?.id) {
      return;
    }
    
    isFetchingRef.current = true;
    try {
      const response = await fetch('/api/user/friend-requests-count', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setPendingCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [session?.user?.id]);

  // Fetch once on mount/session change (no polling)
  useEffect(() => {
    if (!session?.user?.id) {
      setPendingCount(0);
      return;
    }

    // Fetch friend requests count once
    fetchPendingRequests();
  }, [session?.user?.id, fetchPendingRequests]);

  const refreshCount = useCallback(async () => {
    await fetchPendingRequests();
  }, [fetchPendingRequests]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ pendingCount, refreshCount }),
    [pendingCount, refreshCount]
  );

  return (
    <FriendRequestContext.Provider value={contextValue}>
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

