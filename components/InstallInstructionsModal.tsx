"use client";

import { useEffect, useState } from "react";
import { FaApple, FaAndroid, FaTimes } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface InstallInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallInstructionsModal({ isOpen, onClose }: InstallInstructionsModalProps) {
  const { t } = useTranslation();
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
            <h3 className="text-2xl font-bold mb-2">{t('installApp.title')}</h3>
            <p className="text-sm text-base-content/70">
              {t('installApp.subtitleAlt')}
            </p>
          </div>

          {/* Platform-specific icon */}
          <div className="flex justify-center mb-4">
            {isIOS && (
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2">
                <FaApple className="text-2xl" />
                <span className="font-semibold">{t('installApp.iosInstructions')}</span>
              </div>
            )}
            {isAndroid && (
              <div className="flex items-center gap-2 bg-primary/10 rounded-lg px-4 py-2">
                <FaAndroid className="text-2xl" />
                <span className="font-semibold">{t('installApp.androidInstructions')}</span>
              </div>
            )}
          </div>

          {/* Instructions based on platform */}
          {isIOS && (
            <div className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span dangerouslySetInnerHTML={{ __html: t('installApp.iosStep1') }} />
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span dangerouslySetInnerHTML={{ __html: t('installApp.iosStep2') }} />
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span dangerouslySetInnerHTML={{ __html: t('installApp.iosStep3') }} />
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>{t('installApp.iosStep4')}</span>
                </li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-bold">1.</span>
                  <span dangerouslySetInnerHTML={{ __html: t('installApp.androidStep1') }} />
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">2.</span>
                  <span dangerouslySetInnerHTML={{ __html: t('installApp.androidStep2') }} />
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">3.</span>
                  <span dangerouslySetInnerHTML={{ __html: t('installApp.androidStep3') }} />
                </li>
                <li className="flex gap-3">
                  <span className="font-bold">4.</span>
                  <span>{t('installApp.androidStep4')}</span>
                </li>
              </ol>
            </div>
          )}

          {!isIOS && !isAndroid && (
            <div className="space-y-4">
              <div className="alert alert-info">
                <div>
                  <p className="font-semibold">{t('installApp.desktopInstructions')}</p>
                  <ol className="list-decimal ml-4 mt-2 text-sm">
                    <li>{t('installApp.desktopStep1')}</li>
                    <li>{t('installApp.desktopStep2')}</li>
                    <li>{t('installApp.desktopStep3')}</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-base-300">
            <p className="text-xs text-center text-base-content/60">
              {t('installApp.footer')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

