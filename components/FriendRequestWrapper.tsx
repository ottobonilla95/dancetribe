"use client";

import { useFriendRequestCount } from "@/contexts/FriendRequestContext";
import FriendRequestNotification from "./FriendRequestNotification";

export default function FriendRequestWrapper() {
  const pendingRequests = useFriendRequestCount();
  
  return <FriendRequestNotification pendingRequests={pendingRequests} />;
} 