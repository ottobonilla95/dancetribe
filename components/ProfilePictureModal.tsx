"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface ProfilePictureModalProps {
  imageUrl?: string;
  name: string;
}

export default function ProfilePictureModal({ imageUrl, name }: ProfilePictureModalProps) {
  const [showModal, setShowModal] = useState(false);

  if (!imageUrl) {
    // If no image, just show the placeholder (not clickable)
    return (
      <div className="avatar">
        <div className="w-28 h-28 rounded-full">
          <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
            <span className="text-4xl">
              {name?.charAt(0)?.toUpperCase() || "👤"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Clickable Avatar */}
      <div className="avatar cursor-pointer group" onClick={() => setShowModal(true)}>
        <div className="w-28 h-28 rounded-full relative">
          <img
            src={imageUrl}
            alt={name || "Profile"}
            className="w-full h-full object-cover rounded-full transition-opacity group-hover:opacity-80"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              🔍 View
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open overflow-hidden" onClick={() => setShowModal(false)}>
          <div 
            className="modal-box max-w-[90vw] max-h-[90vh] bg-transparent shadow-none p-0 relative overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Full size image */}
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={imageUrl}
                alt={name || "Profile"}
                className="max-h-[85vh] max-w-[85vw] object-cover rounded-full aspect-square"
              />
              
              {/* Close button on top of image */}
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-circle btn-sm absolute top-4 right-4 z-10 bg-base-100/90 hover:bg-base-100 border-2 border-base-300"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          {/* Backdrop */}
          <div className="modal-backdrop bg-black/80" onClick={() => setShowModal(false)} />
        </div>
      )}
    </>
  );
}

