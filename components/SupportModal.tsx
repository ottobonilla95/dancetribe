"use client";

import { FaEnvelope, FaInstagram, FaTimes } from "react-icons/fa";
import config from "@/config";
import { useTranslation } from "@/components/I18nProvider";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { t } = useTranslation();
  const supportEmail = config.resend.supportEmail;
  const instagramHandle = config.social?.instagram;

  if (!isOpen) return null;

  const handleEmailSupport = () => {
    window.location.href = `mailto:${supportEmail}?subject=${config.appName} Support Request`;
    onClose();
  };

  const handleInstagramSupport = () => {
    if (instagramHandle) {
      window.open(`https://instagram.com/${instagramHandle}`, "_blank");
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-base-100 rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4 pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t('support.needHelp')}</h2>
              <p className="text-sm text-base-content/60 mt-1">
                {t('support.chooseContact')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Support Options */}
          <div className="space-y-3 pt-2">
            {supportEmail && (
              <button
                onClick={handleEmailSupport}
                className="btn btn-outline btn-block gap-3 h-auto py-4 justify-start"
              >
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FaEnvelope className="text-xl text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t('support.emailSupport')}</div>
                  <div className="text-xs text-base-content/60">{supportEmail}</div>
                </div>
              </button>
            )}

            {instagramHandle && (
              <button
                onClick={handleInstagramSupport}
                className="btn btn-outline btn-secondary btn-block gap-3 h-auto py-4 justify-start"
              >
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <FaInstagram className="text-xl text-secondary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t('support.instagramDM')}</div>
                  <div className="text-xs text-base-content/60">@{instagramHandle}</div>
                </div>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-base-300">
            <p className="text-xs text-base-content/60 text-center">
              {t('support.responseTime')}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

