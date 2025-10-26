"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaInstagram, FaCompass, FaCopy } from "react-icons/fa";
import SharePreviewModal from "./SharePreviewModal";
import InstallPrompt from "./InstallPrompt";

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
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
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
    console.log("🚪 WelcomeModal: Closing modal");
    setIsOpen(false);
    // Show install prompt after closing welcome modal
    setTimeout(() => {
      console.log("📱 WelcomeModal: Setting showInstallPrompt to true");
      setShowInstallPrompt(true);
    }, 500); // Small delay for smooth transition
    // Redirect to dashboard to explore the app
    router.push("/dashboard");
  };

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${userUsername}`;

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      
      {/* Install Prompt - Shows after welcome modal is closed */}
      <InstallPrompt
        show={showInstallPrompt}
        onClose={() => setShowInstallPrompt(false)}
      />

      {/* Only render welcome modal if isOpen */}
      {!isOpen ? null : (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleClose} />
      
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md sm:max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost z-10"
              >
                ✕
              </button>

              <div className="p-6 sm:p-8 md:p-10">
                {/* Celebration Header */}
                <div className="text-center mb-6 sm:mb-8">
              <div className="text-6xl sm:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 px-2">
                Welcome to DanceCircle, {userName}!
              </h2>
              <p className="text-base sm:text-lg text-base-content/60">
                Your dance profile is live! 🌍
              </p>
            </div>

            {/* Main Actions */}
            <div className="space-y-3 sm:space-y-4 mb-6">
              {/* Instagram Story - Primary Action */}
              <button
                onClick={() => setShowSharePreview(true)}
                className="btn btn-primary btn-lg btn-block gap-2 sm:gap-3 text-base sm:text-lg h-14 sm:h-16"
              >
                <FaInstagram className="text-xl sm:text-2xl" />
                Share To Instagram Story
              </button>

              {/* Copy Link for Instagram Bio */}
              <button
                onClick={copyProfileLink}
                className="btn btn-outline btn-lg btn-block gap-2 sm:gap-3 text-base sm:text-lg h-14 sm:h-16"
              >
                <FaCopy className="text-xl sm:text-2xl" />
                {copied ? "Copied! ✓" : "Copy Link for Bio"}
              </button>

              {/* Start Discovering - Secondary Action */}
              <Link
                href="/discover"
                className="btn btn-outline btn-lg btn-block gap-2 sm:gap-3 text-base sm:text-lg h-14 sm:h-16"
                onClick={handleClose}
              >
                <FaCompass className="text-xl sm:text-2xl" />
                <span>Start Discovering Dancers!</span>
              </Link>
            </div>

            {/* Skip Button */}
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-block text-sm sm:text-base text-base-content/60"
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </>
  );
}

