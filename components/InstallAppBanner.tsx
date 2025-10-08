"use client";

import { useState, useEffect } from "react";
import { FaDownload, FaTimes } from "react-icons/fa";

export default function InstallAppBanner() {
  const [show, setShow] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed the banner and if it's still valid
    const dismissedUntil = localStorage.getItem("hasDismissedInstallBanner");
    if (dismissedUntil) {
      const expiryDate = new Date(dismissedUntil);
      if (expiryDate > new Date()) {
        setIsDismissed(true);
        return;
      } else {
        // Expired, clear it
        localStorage.removeItem("hasDismissedInstallBanner");
      }
    }

    // Only show on mobile
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    
    if (isMobile) {
      // Show banner after a short delay
      setTimeout(() => {
        setShow(true);
      }, 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    // Remember dismissal for 7 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem("hasDismissedInstallBanner", expiryDate.toISOString());
  };

  const handleInstallClick = () => {
    // Hide the banner temporarily
    setShow(false);
    // Click the install button to show full instructions
    const installButton = document.querySelector('[data-install-button]') as HTMLButtonElement;
    if (installButton) {
      // First scroll to it (in case it's in a collapsed menu)
      installButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Then click it after a short delay
      setTimeout(() => {
        installButton.click();
      }, 300);
    }
  };

  if (!show || isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 lg:hidden animate-slide-up">
      <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl shadow-lg p-4 flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-3 flex-1">
          <FaDownload className="text-2xl flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Install DanceTribe</p>
            <p className="text-xs opacity-90">Get the full app experience</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="btn btn-sm btn-white text-primary font-bold"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="btn btn-sm btn-ghost btn-circle text-primary-content"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <style jsx>{`
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
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

