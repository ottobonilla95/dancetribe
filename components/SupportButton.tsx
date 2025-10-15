"use client";

import { useState } from "react";
import { FaQuestionCircle, FaTimes, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import config from "@/config";

interface SupportButtonProps {
  variant?: "floating" | "inline";
  className?: string;
}

export default function SupportButton({ variant = "floating", className = "" }: SupportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const supportEmail = config.resend.supportEmail;

  if (!supportEmail) {
    return null;
  }

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}?subject=DanceTribe Support Request`;
    setShowOptions(false);
  };

  const handleWhatsAppSupport = () => {
    // Format email to WhatsApp number if needed, or use a dedicated WhatsApp number
    const message = encodeURIComponent("Hi! I need help with DanceTribe.");
    window.open(`https://wa.me/?text=${message}`, "_blank");
    setShowOptions(false);
  };

  if (variant === "inline") {
    return (
      <button
        onClick={handleEmailSupport}
        className={`btn btn-outline gap-2 ${className}`}
      >
        <FaQuestionCircle className="text-lg" />
        Need Help?
      </button>
    );
  }

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Options Menu */}
        {showOptions && (
          <div className="mb-4 bg-base-100 rounded-lg shadow-2xl border border-base-300 p-4 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Need Help?</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <FaTimes />
              </button>
            </div>
            
            <button
              onClick={handleEmailSupport}
              className="btn btn-sm btn-outline btn-block gap-2 justify-start"
            >
              <FaEnvelope />
              Email Support
            </button>

            <button
              onClick={handleWhatsAppSupport}
              className="btn btn-sm btn-outline btn-success btn-block gap-2 justify-start"
            >
              <FaWhatsapp />
              WhatsApp Us
            </button>

            <p className="text-xs text-base-content/60 mt-3 pt-2 border-t border-base-300">
              We typically respond within 24 hours
            </p>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="btn btn-circle btn-primary btn-lg shadow-lg hover:shadow-xl transition-all"
          aria-label="Get Support"
        >
          {showOptions ? (
            <FaTimes className="text-2xl" />
          ) : (
            <FaQuestionCircle className="text-2xl" />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

