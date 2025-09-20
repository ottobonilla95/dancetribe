"use client";

import { useState } from "react";
import { FaUserPlus, FaUserMinus, FaCheck, FaTimes, FaHeart, FaEye } from "react-icons/fa";
import Link from "next/link";

interface FriendsContentProps {
  userData: any;
}

export default function FriendsContent({ userData }: FriendsContentProps) {
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState<string | null>(null);

  const handleFriendRequest = async (action: string, targetUserId: string) => {
    setLoading(targetUserId);
    try {
      const response = await fetch('/api/user/friend-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, targetUserId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh the page to update the lists
        window.location.reload();
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const sentDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderUserCard = (user: any, actions?: React.ReactNode, timestamp?: string) => (
    <div key={user._id} className="card bg-base-200 shadow-lg">
      <div className="card-body p-4">
        <div className="flex items-center gap-4">
          <Link href={`/dancer/${user._id}`}>
            <div className="avatar cursor-pointer">
              <div className="w-16 h-16 rounded-full">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                    <span className="text-xl">{user.name?.charAt(0)?.toUpperCase() || "?"}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
          
          <div className="flex-1">
            <Link href={`/dancer/${user._id}`} className="hover:text-primary">
              <h3 className="font-bold text-lg">{user.name}</h3>
              {user.username && <p className="text-sm text-base-content/60">@{user.username}</p>}
            </Link>
            
                         {user.city && (
               <p className="text-sm text-base-content/70">
                 📍 {typeof user.city === 'string' ? user.city : user.city.name || user.city}
               </p>
             )}
            
            {timestamp && (
              <p className="text-xs text-base-content/50 mt-1">{formatTimeAgo(timestamp)}</p>
            )}
          </div>
          
          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
             {/* Tabs */}
       <div className="tabs tabs-boxed mb-6 justify-center">
         <button 
           className={`tab ${activeTab === 'requests' ? 'tab-active' : ''}`}
           onClick={() => setActiveTab('requests')}
         >
           <span className="hidden sm:inline">📥 Requests</span>
           <span className="sm:hidden">📥</span>
           <span className="ml-1">({userData.friendRequestsReceived?.length || 0})</span>
         </button>
         <button 
           className={`tab ${activeTab === 'friends' ? 'tab-active' : ''}`}
           onClick={() => setActiveTab('friends')}
         >
           <span className="hidden sm:inline">👥 Friends</span>
           <span className="sm:hidden">👥</span>
           <span className="ml-1">({userData.friends?.length || 0})</span>
         </button>
         <button 
           className={`tab ${activeTab === 'sent' ? 'tab-active' : ''}`}
           onClick={() => setActiveTab('sent')}
         >
           <span className="hidden sm:inline">📤 Sent</span>
           <span className="sm:hidden">📤</span>
           <span className="ml-1">({userData.friendRequestsSent?.length || 0})</span>
         </button>
         <button 
           className={`tab ${activeTab === 'likes' ? 'tab-active' : ''}`}
           onClick={() => setActiveTab('likes')}
         >
           <span className="hidden sm:inline">❤️ Likes</span>
           <span className="sm:hidden">❤️</span>
           <span className="ml-1">({userData.likedBy?.length || 0})</span>
         </button>
       </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Incoming Friend Requests</h2>
            {userData.friendRequestsReceived?.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <FaUserPlus className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No pending friend requests</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {userData.friendRequestsReceived?.map((request: any) =>
                  renderUserCard(
                    request.user,
                    <>
                      <button
                        onClick={() => handleFriendRequest('accept', request.user._id)}
                        disabled={loading === request.user._id}
                        className="btn btn-success btn-sm"
                      >
                        <FaCheck />
                      </button>
                      <button
                        onClick={() => handleFriendRequest('reject', request.user._id)}
                        disabled={loading === request.user._id}
                        className="btn btn-error btn-sm"
                      >
                        <FaTimes />
                      </button>
                    </>,
                    request.sentAt
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Dance Friends</h2>
            {userData.friends?.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <FaUserPlus className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No friends yet. Start connecting with dancers!</p>
                <Link href="/" className="btn btn-primary btn-sm mt-4">
                  Discover Dancers
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {userData.friends?.map((friend: any) =>
                  renderUserCard(
                    friend,
                    <Link href={`/dancer/${friend._id}`} className="btn btn-primary btn-sm">
                      <FaEye /> View Profile
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Sent Friend Requests</h2>
            {userData.friendRequestsSent?.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <FaUserPlus className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No pending sent requests</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {userData.friendRequestsSent?.map((request: any) =>
                  renderUserCard(
                    request.user,
                    <button
                      onClick={() => handleFriendRequest('cancel', request.user._id)}
                      disabled={loading === request.user._id}
                      className="btn btn-outline btn-sm"
                    >
                      <FaUserMinus /> Cancel
                    </button>,
                    request.sentAt
                  )
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">People Who Liked Your Profile</h2>
            {userData.likedBy?.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                <FaHeart className="mx-auto text-4xl mb-4 opacity-50" />
                <p>No likes yet. Share your profile to get more likes!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {userData.likedBy?.map((user: any) =>
                  renderUserCard(
                    user,
                    <Link href={`/dancer/${user._id}`} className="btn btn-secondary btn-sm">
                      <FaEye /> View Profile
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 