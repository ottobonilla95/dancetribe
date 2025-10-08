"use client";

import { useState, useEffect } from "react";
import { FaDownload, FaTimes } from "react-icons/fa";
import InstallInstructionsModal from "./InstallInstructionsModal";

interface InstallPromptProps {
  show: boolean;
  onClose: () => void;
}

export default function InstallPrompt({ show, onClose }: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detectedIOS = /iphone|ipad|ipod/.test(userAgent);
    const detectedAndroid = /android/.test(userAgent);
    
    setIsIOS(detectedIOS);
    setIsAndroid(detectedAndroid);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Check if user has already seen this prompt
    const seen = localStorage.getItem("hasSeenInstallPrompt");
    if (seen) {
      setHasSeenPrompt(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("hasSeenInstallPrompt", "true");
    onClose();
  };

  const handleInstallClick = () => {
    setShowInstructionsModal(true);
  };

  // Don't show if already installed, seen, or not on mobile
  const shouldShow = show && !isInstalled && !hasSeenPrompt && (isIOS || isAndroid);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Instructions Modal */}
      <InstallInstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => {
          setShowInstructionsModal(false);
          handleClose(); // Also close the prompt
        }}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Prompt Card */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-2xl shadow-2xl max-w-md mx-auto p-6 relative">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost text-primary-content"
          >
            <FaTimes />
          </button>

          {/* Content */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">📱</div>
            <h3 className="text-2xl font-bold mb-2">Install DanceTribe!</h3>
            <p className="text-sm opacity-90">
              Get faster access and a native app experience
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleInstallClick}
              className="btn btn-white w-full gap-2 text-primary font-bold"
            >
              <FaDownload />
              Install App
            </button>
            <button
              onClick={handleClose}
              className="btn btn-ghost w-full text-primary-content opacity-80 hover:opacity-100"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
}

