"use client";

import { useEffect, useState } from "react";
import { FaApple, FaAndroid, FaTimes } from "react-icons/fa";

interface InstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallInstructionsModal({ isOpen, onClose }: InstallInstructionsModalProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost"
          >
            <FaTimes />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-2xl font-bold mb-2">Install DanceTribe</h3>
            <p className="text-sm text-base-content/70">
              Get faster access and a native app experience
            </p>
          </div>

          {/* Platform-specific icon */}
          <div className="flex justify-center mb-4">
            {isIOS && (
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2">
                <FaApple className="text-2xl" />
                <span className="font-semibold">iOS Instructions</span>
              </div>
            )}
            {isAndroid && (
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2">
                <FaAndroid className="text-2xl" />
                <span className="font-semibold">Android Instructions</span>
              </div>
            )}
          </div>

          {/* Instructions based on platform */}
          {isIOS && (
            <div className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>Tap the <strong>Share</strong> button <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg> at the bottom of Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span>Tap <strong>&quot;Add&quot;</strong> in the top right</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>The DanceTribe app will appear on your home screen! 🎉</span>
                </li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span>Tap the <strong>Menu</strong> button (⋮) in Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span>Tap <strong>&quot;Install&quot;</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>The DanceTribe app will appear on your home screen! 🎉</span>
                </li>
              </ol>
            </div>
          )}

          {!isIOS && !isAndroid && (
            <div className="space-y-4">
              <div className="alert alert-info">
                <div>
                  <p className="font-semibold">Desktop Instructions</p>
                  <ol className="list-decimal ml-4 mt-2 text-sm">
                    <li>Look for an install icon in your browser&apos;s address bar</li>
                    <li>Or check your browser menu for &quot;Install DanceTribe&quot;</li>
                    <li>Click it to install the app on your computer</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-base-300">
            <p className="text-xs text-center text-base-content/60">
              ✨ Enjoy offline access and faster loading
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

