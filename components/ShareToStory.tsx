"use client";

import React, { useState } from 'react';
import SharePreviewModal from './SharePreviewModal';

interface ShareToStoryProps {
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
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
  const [showModal, setShowModal] = useState(false);

  const handleShareClick = () => {
    setShowModal(true);
  };

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${userData.username || userData.id}`;

  return (
    <>
      {/* Share Preview Modal */}
      <SharePreviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userData={userData}
        profileUrl={profileUrl}
      />

      {/* Share Button */}
      <div className="w-full">
        <button
          onClick={handleShareClick}
          className="btn btn-primary gap-2 w-full"
        >
          📱 Share my profile
        </button>
      </div>
    </>
  );
};

export default ShareToStory;
