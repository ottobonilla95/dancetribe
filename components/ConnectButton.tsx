"use client";

import { useState } from "react";
import { FaUserPlus, FaUserCheck, FaUserClock, FaCheck, FaTimes } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "./I18nProvider";
import { useRefreshFriendRequests } from "@/contexts/FriendRequestContext";

interface ConnectButtonProps {
  targetUserId: string;
  isFriend: boolean;
  hasSentRequest: boolean;
  hasReceivedRequest: boolean;
  isFeaturedProfessional?: boolean;
  isFollowing?: boolean;
  isCurrentUserFeatured?: boolean;
  className?: string;
}

export default function ConnectButton({ 
  targetUserId, 
  isFriend, 
  hasSentRequest, 
  hasReceivedRequest,
  isFeaturedProfessional = false,
  isFollowing = false,
  isCurrentUserFeatured = false,
  className = ""
}: ConnectButtonProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const refreshFriendRequests = useRefreshFriendRequests();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({
    isFriend,
    hasSentRequest,
    hasReceivedRequest,
    isFollowing
  });

  const handleFollow = async () => {
    if (!session) {
      window.location.href = '/api/auth/signin';
      return;
    }

    setLoading(true);
    try {
      if (status.isFollowing) {
        // Unfollow
        const response = await fetch(`/api/user/follow?userId=${targetUserId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setStatus(prev => ({ ...prev, isFollowing: false }));
        } else {
          alert(data.error || 'Something went wrong');
        }
      } else {
        // Follow
        const response = await fetch('/api/user/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: targetUserId }),
        });
        const data = await response.json();
        if (data.success) {
          setStatus(prev => ({ ...prev, isFollowing: true }));
        } else {
          alert(data.error || 'Something went wrong');
        }
      }
    } catch (error) {
      console.error('Error handling follow:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (action: string) => {
    if (!session) {
      window.location.href = '/api/auth/signin';
      return;
    }

    setLoading(true);
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
        // Update local state based on action
        switch (action) {
          case 'send':
            setStatus(prev => ({ ...prev, hasSentRequest: true }));
            break;
          case 'accept':
            setStatus(prev => ({ ...prev, isFriend: true, hasReceivedRequest: false }));
            // Refresh friend request count to update bell notification
            await refreshFriendRequests();
            break;
          case 'reject':
            setStatus(prev => ({ ...prev, hasReceivedRequest: false }));
            // Refresh friend request count to update bell notification
            await refreshFriendRequests();
            break;
          case 'cancel':
            setStatus(prev => ({ ...prev, hasSentRequest: false }));
            break;
        }
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error handling friend request:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Link href="/api/auth/signin" className={`btn btn-primary btn-sm gap-2 ${className}`}>
        <FaUserPlus className="text-sm" />
        {t('connect.connect')}
      </Link>
    );
  }

  // Featured Professional: Show BOTH Follow + Friend buttons (LinkedIn-style)
  if (isFeaturedProfessional) {
    return (
      <div className="flex gap-2 flex-wrap">
        {/* Primary: Follow Button */}
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`btn ${status.isFollowing ? 'btn-outline' : 'btn-primary'} btn-sm gap-2`}
        >
          <FaUserCheck className="text-sm" />
          {loading ? t('connect.loading') : (status.isFollowing ? t('connect.following') : t('connect.follow'))}
        </button>

        {/* Secondary: Friend Button */}
        {status.isFriend ? (
          <button className="btn btn-success btn-sm gap-2" disabled>
            <FaUserCheck className="text-sm" />
            {t('connect.friends')}
          </button>
        ) : status.hasReceivedRequest ? (
          <div className="flex gap-1">
            <button
              onClick={() => handleFriendRequest('accept')}
              disabled={loading}
              className="btn btn-success btn-sm"
              title={t('connect.acceptRequest')}
            >
              <FaCheck className="text-sm" />
            </button>
            <button
              onClick={() => handleFriendRequest('reject')}
              disabled={loading}
              className="btn btn-error btn-sm"
              title={t('connect.rejectRequest')}
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        ) : status.hasSentRequest ? (
          <button
            onClick={() => handleFriendRequest('cancel')}
            disabled={loading}
            className="btn btn-outline btn-sm gap-2"
          >
            <FaUserClock className="text-sm" />
            {t('connect.pending')}
          </button>
        ) : (
          <button
            onClick={() => handleFriendRequest('send')}
            disabled={loading}
            className="btn btn-outline btn-sm gap-2"
          >
            <FaUserPlus className="text-sm" />
            {t('connect.addFriend')}
          </button>
        )}
      </div>
    );
  }

  // FRIEND REQUEST SYSTEM: Normal users (no follow system)
  // Already friends
  if (status.isFriend) {
    return (
      <button className={`btn btn-success btn-sm gap-2 ${className}`} disabled>
        <FaUserCheck className="text-sm" />
        {t('connect.friends')}
      </button>
    );
  }

  // Has received a friend request (can accept/reject)
  if (status.hasReceivedRequest) {
    return (
      <div className="flex gap-1">
        <button
          onClick={() => handleFriendRequest('accept')}
          disabled={loading}
          className="btn btn-success btn-sm"
          title={t('connect.acceptRequest')}
        >
          <FaCheck className="text-sm" />
        </button>
        <button
          onClick={() => handleFriendRequest('reject')}
          disabled={loading}
          className="btn btn-error btn-sm"
          title={t('connect.rejectRequest')}
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    );
  }

  // Has sent a friend request (can cancel)
  if (status.hasSentRequest) {
    return (
      <button
        onClick={() => handleFriendRequest('cancel')}
        disabled={loading}
        className={`btn btn-outline btn-sm gap-2 ${className}`}
      >
        <FaUserClock className="text-sm" />
        {t('connect.pending')}
      </button>
    );
  }

  // Default: can send friend request
  return (
    <button
      onClick={() => handleFriendRequest('send')}
      disabled={loading}
      className={`btn btn-primary btn-sm gap-2 ${className}`}
    >
      <FaUserPlus className="text-sm" />
      {t('connect.connect')}
    </button>
  );
} 