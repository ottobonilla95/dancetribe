"use client";

import { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaApple, FaAndroid } from "react-icons/fa";

interface InstallPromptProps {
  show: boolean;
  onClose: () => void;
}

export default function InstallPrompt({ show, onClose }: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasSeenPrompt, setHasSeenPrompt] = useState(false);

  useEffect(() => {
    console.log("📱 InstallPrompt: Component mounted, show prop =", show);
    
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detectedIOS = /iphone|ipad|ipod/.test(userAgent);
    const detectedAndroid = /android/.test(userAgent);
    
    setIsIOS(detectedIOS);
    setIsAndroid(detectedAndroid);

    console.log("📱 InstallPrompt: Platform detection", { 
      userAgent, 
      isIOS: detectedIOS, 
      isAndroid: detectedAndroid 
    });

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsInstalled(true);
      console.log("📱 InstallPrompt: Already installed (standalone mode)");
    }

    // Check if user has already seen this prompt
    const seen = localStorage.getItem("hasSeenInstallPrompt");
    if (seen) {
      setHasSeenPrompt(true);
      console.log("📱 InstallPrompt: User has already seen prompt");
    }
  }, []);

  useEffect(() => {
    console.log("📱 InstallPrompt: show prop changed to", show);
  }, [show]);

  const handleClose = () => {
    // Mark as seen
    localStorage.setItem("hasSeenInstallPrompt", "true");
    onClose();
  };

  const handleInstallClick = () => {
    // Mark as seen since they're taking action
    localStorage.setItem("hasSeenInstallPrompt", "true");
    // Close the prompt
    onClose();
    // Try to click the install button to show full instructions
    setTimeout(() => {
      const installButton = document.querySelector('[data-install-button]') as HTMLButtonElement;
      if (installButton) {
        installButton.click();
      }
    }, 300);
  };

  // Don't show if:
  // - Already installed
  // - User has already seen it
  // - Not on mobile (iOS or Android)
  // - Parent says don't show
  const shouldShow = show && !isInstalled && !hasSeenPrompt && (isIOS || isAndroid);
  
  console.log("📱 InstallPrompt: Render decision", {
    show,
    isInstalled,
    hasSeenPrompt,
    isIOS,
    isAndroid,
    shouldShow
  });

  if (!shouldShow) {
    console.log("📱 InstallPrompt: Not showing prompt");
    return null;
  }
  
  console.log("📱 InstallPrompt: Showing prompt! 🎉");

  return (
    <>
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

          {/* Platform-specific icon */}
          <div className="flex justify-center mb-4">
            {isIOS && (
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <FaApple className="text-2xl" />
                <span className="font-semibold">iOS</span>
              </div>
            )}
            {isAndroid && (
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                <FaAndroid className="text-2xl" />
                <span className="font-semibold">Android</span>
              </div>
            )}
          </div>

          {/* Quick Instructions */}
          <div className="bg-white/10 rounded-lg p-4 mb-4 text-sm">
            {isIOS && (
              <ol className="space-y-2 list-decimal list-inside">
                <li>Tap the <strong>Share</strong> button below</li>
                <li>Scroll and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong></li>
              </ol>
            )}
            {isAndroid && (
              <ol className="space-y-2 list-decimal list-inside">
                <li>Tap the <strong>Menu</strong> (⋮) button</li>
                <li>Tap <strong>"Install app"</strong></li>
                <li>Tap <strong>"Install"</strong></li>
              </ol>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleInstallClick}
              className="btn btn-white w-full gap-2 text-primary font-bold"
            >
              <FaDownload />
              Show Me How
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

