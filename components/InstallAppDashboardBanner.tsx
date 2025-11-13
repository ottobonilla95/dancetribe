"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaDownload, FaMobileAlt } from "react-icons/fa";
import InstallInstructionsModal from "./InstallInstructionsModal";

export default function InstallAppDashboardBanner() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if already installed (running as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed the banner
    const dismissedUntil = localStorage.getItem("installDashboardBannerDismissed");
    if (dismissedUntil) {
      const expiryDate = new Date(dismissedUntil);
      if (expiryDate > new Date()) {
        setIsDismissed(true);
      } else {
        localStorage.removeItem("installDashboardBannerDismissed");
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember dismissal for 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem("installDashboardBannerDismissed", expiryDate.toISOString());
  };

  const handleInstallClick = () => {
    setShowInstructionsModal(true);
  };

  // Don't render until client-side hydration is complete
  if (!isClient || isInstalled || isDismissed) return null;

  return (
    <>
      {/* Instructions Modal */}
      <InstallInstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => {
          setShowInstructionsModal(false);
          handleDismiss(); // Dismiss banner when modal closes
        }}
      />

      {/* Inline Banner */}
      <div className="relative bg-gradient-to-r from-secondary/5 to-accent/5 border border-secondary/20 rounded-lg p-4 mb-6">
        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle opacity-50 hover:opacity-100"
          aria-label="Dismiss"
        >
          <FaTimes className="text-xs" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          {/* Icon */}
          <div className="flex-shrink-0 text-2xl">
            📱
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-base-content/90">
              <span className="font-semibold">Install DanceCircle</span> - Get the full app experience! 
              <span className="hidden sm:inline"> Faster, works offline, and feels native.</span>
            </p>
          </div>

          {/* Quick action button */}
          <div className="flex flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="btn btn-secondary btn-xs sm:btn-sm gap-1"
            >
              <FaDownload className="text-xs" />
              <span className="hidden sm:inline">Install</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

