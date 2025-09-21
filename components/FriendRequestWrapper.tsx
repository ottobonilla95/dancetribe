"use client";

import { useFriendRequestCount } from "@/libs/hooks";
import FriendRequestNotification from "./FriendRequestNotification";

export default function FriendRequestWrapper() {
  const pendingRequests = useFriendRequestCount();
  
  return <FriendRequestNotification pendingRequests={pendingRequests} />;
} 