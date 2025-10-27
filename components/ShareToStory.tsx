"use client";

import React, { useState } from 'react';
import { FaLink, FaCheck } from 'react-icons/fa';

interface ShareToStoryProps {
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
    hideAge?: boolean;
    nationality?: string;
    danceRole?: string;
    city: {
      name: string;
      country: { name: string };
      image?: string;
    };
    danceStyles: Array<{
      name: string;
      level: string;
    }>;
    yearsDancing?: number;
    citiesVisited?: number;
  };
}

const ShareToStory: React.FC<ShareToStoryProps> = ({ userData }) => {
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${userData.username || userData.id}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleShareClick}
        className="btn btn-primary gap-2 w-full"
      >
        {copied ? (
          <>
            <FaCheck />
            Link Copied!
          </>
        ) : (
          <>
            <FaLink />
            Share my profile
          </>
        )}
      </button>
      {copied && (
        <p className="text-xs text-center mt-2 text-success">
          ✨ Add to your bio or share with friends!
        </p>
      )}
    </div>
  );
};

export default ShareToStory;
