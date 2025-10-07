"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaInstagram, FaWhatsapp, FaCopy, FaUserFriends, FaCompass } from "react-icons/fa";
import SharePreviewModal from "./SharePreviewModal";

interface WelcomeModalProps {
  userName: string;
  userUsername: string;
  userImage?: string;
  userData: any; // Full user data for ShareToStory
  showWelcome: boolean;
}

export default function WelcomeModal({ userName, userUsername, userImage, userData, showWelcome }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("🎉 WelcomeModal: showWelcome =", showWelcome);
    // Show modal when showWelcome is true (from URL param)
    if (showWelcome) {
      console.log("✅ Opening welcome modal!");
      setIsOpen(true);
      // Mark as seen in localStorage
      localStorage.setItem("hasSeenWelcome", "true");
    }
  }, [showWelcome]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove the welcome param from URL
    router.replace("/profile");
  };

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${userUsername}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const text = `Check out my dance profile on DanceTribe! 🕺💃\n${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Share Preview Modal */}
      {userData && (
        <SharePreviewModal
          isOpen={showSharePreview}
          onClose={() => setShowSharePreview(false)}
          userData={userData}
          profileUrl={profileUrl}
        />
      )}
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 md:p-8">
            {/* Celebration Header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome to DanceTribe, {userName}!
              </h2>
              <p className="text-lg text-base-content/70">
                Your dance profile is live! Share it with the world 🌍
              </p>
            </div>

            {/* Profile Preview */}
            {/* <div className="mb-6 bg-base-200 rounded-lg p-4">
              <p className="text-sm text-base-content/60 mb-3 text-center">Your profile is ready!</p>
              <div className="text-center py-6">
                <div className="text-5xl mb-3">🎴</div>
                <p className="font-bold text-lg">@{userUsername}</p>
                <p className="text-sm text-base-content/60">
                  Your dance profile card is ready to share
                </p>
              </div>
            </div> */}

            {/* Share Actions */}
            <div className="space-y-3 mb-6">
              <h3 className="font-bold text-lg mb-3 text-center">📢 Share your profile now!</h3>
              
              {/* View Profile & Share */}
              {/* Instagram - Open Share Preview Modal */}
              <button
                onClick={() => setShowSharePreview(true)}
                className="btn btn-primary btn-block gap-2"
              >
                <FaInstagram className="text-xl" />
                Share to Instagram Story
              </button>

              {/* WhatsApp */}
              <button
                onClick={shareToWhatsApp}
                className="btn btn-success btn-block gap-2"
              >
                <FaWhatsapp className="text-xl" />
                Share on WhatsApp
              </button>

              {/* Copy Link */}
              <button
                onClick={copyProfileLink}
                className="btn btn-outline btn-block gap-2"
              >
                <FaCopy className="text-lg" />
                {copied ? "Copied! ✓" : "Copy Profile Link"}
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link
                href="/invite"
                className="btn btn-outline flex-1 gap-2"
                onClick={handleClose}
              >
                <FaUserFriends className="text-lg" />
                Invite Friends
              </Link>
              
              <Link
                href="/dashboard"
                className="btn btn-outline flex-1 gap-2"
                onClick={handleClose}
              >
                <FaCompass className="text-lg" />
                Explore Dancers
              </Link>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-block"
            >
              I&apos;ll share later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

