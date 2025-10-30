"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { database } from '@/libs/firebase';

export function usePresence() {
  const { data: session } = useSession();
  const [activeUsers, setActiveUsers] = useState<number>(0);

  useEffect(() => {
    if (!session?.user?.id || !database) return;

    const userId = session.user.id;
    const userStatusRef = ref(database, `/status/${userId}`);
    const connectedRef = ref(database, '.info/connected');

    // Track connection status
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // User is online
        set(userStatusRef, {
          state: 'online',
          lastChanged: serverTimestamp(),
          userId: userId,
          name: session.user.name || 'Anonymous',
        });

        // Remove user from active list when they disconnect
        onDisconnect(userStatusRef).remove();
      }
    });

    return () => {
      // Cleanup: mark as offline when component unmounts
      set(userStatusRef, {
        state: 'offline',
        lastChanged: serverTimestamp(),
      });
      unsubscribe();
    };
  }, [session]);

  // Count active users (admin only will call this)
  useEffect(() => {
    if (!database) return;

    const statusRef = ref(database, 'status');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      let count = 0;
      snapshot.forEach((childSnapshot) => {
        const status = childSnapshot.val();
        if (status?.state === 'online') {
          count++;
        }
      });
      setActiveUsers(count);
    });

    return () => unsubscribe();
  }, []);

  return { activeUsers };
}

