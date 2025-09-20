"use client";

import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface LikeButtonProps {
  targetUserId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  className?: string;
}

export default function LikeButton({ 
  targetUserId, 
  initialLikesCount, 
  initialIsLiked,
  className = ""
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!session) {
      // Redirect to sign in
      window.location.href = '/api/auth/signin';
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLiked(data.action === 'liked');
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error liking profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <Link 
        href="/api/auth/signin"
        className={`${className} transition-all duration-300 hover:scale-110`}
        title="Sign up to like this dancer"
      >
        <FaHeart className={`text-2xl ${isLiked ? 'text-red-500' : 'text-gray-400'} animate-pulse`} />
        {likesCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {likesCount}
          </span>
        )}
      </Link>
    );
  }

  return (
    <button 
      onClick={handleLike}
      disabled={isLoading}
      className={`${className} transition-all duration-300 hover:scale-110 relative`}
      title={isLiked ? "Unlike this dancer" : "Like this dancer"}
    >
      <FaHeart 
        className={`text-2xl transition-colors ${
          isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
        } ${isLoading ? 'animate-pulse' : ''}`} 
      />
      {likesCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
          {likesCount}
        </span>
      )}
    </button>
  );
} 