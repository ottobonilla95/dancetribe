"use client";

import { useEffect, useState } from "react";
import { FaApple, FaAndroid, FaTimes, FaPlus } from "react-icons/fa";
import { IoShareOutline } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { MdInstallMobile } from "react-icons/md";
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

          {/* Important Notice - Open in Browser */}
          <div className="alert alert-warning mb-4 shadow-lg">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-bold text-sm">
                  {isIOS ? t('installApp.openInSafari') : t('installApp.openInChrome')}
                </span>
              </div>
              <p className="text-xs text-left">
                {t('installApp.notFromInstagram')}
              </p>
            </div>
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
              <ol className="space-y-4 text-sm">
                {/* Step 0: Open in Safari from Instagram */}
                <li className="flex gap-3 items-start bg-info/10 p-3 rounded-lg border-2 border-info/30">
                  <span className="font-bold text-info">0.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-info">If you&apos;re on Instagram:</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p>• Tap the <span className="font-semibold">three dots</span> (⋯) in the top right</p>
                      <p>• Select <span className="font-semibold">&quot;Open in Safari&quot;</span></p>
                      <p className="text-info font-semibold mt-2">Then follow the steps below ⬇️</p>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">1.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span>In Safari, tap the</span>
                      <div className="inline-flex items-center justify-center bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <IoShareOutline className="text-2xl text-primary" />
                      </div>
                      <span className="font-semibold">Share button</span>
                    </div>
                    <p className="text-xs text-base-content/60">at the bottom of the screen</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">2.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span>Scroll down and tap</span>
                      <div className="inline-flex items-center gap-1 bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <FaPlus className="text-lg text-primary" />
                      </div>
                    </div>
                    <p className="font-semibold">&quot;Add to Home Screen&quot;</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">3.</span>
                  <div className="flex-1">
                    <span>Tap </span>
                    <span className="font-semibold text-primary">&quot;Add&quot;</span>
                    <span> in the top right corner</span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">4.</span>
                  <div className="flex-1">
                    <span>{t('installApp.iosStep4')}</span>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-4">
              <ol className="space-y-4 text-sm">
                {/* Step 0: Open in Chrome from Instagram */}
                <li className="flex gap-3 items-start bg-info/10 p-3 rounded-lg border-2 border-info/30">
                  <span className="font-bold text-info">0.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-info">If you&apos;re on Instagram:</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p>• Tap the <span className="font-semibold">three dots</span> (⋮) in the top right</p>
                      <p>• Select <span className="font-semibold">&quot;Open in external browser&quot;</span> or <span className="font-semibold">&quot;Open in Chrome&quot;</span></p>
                      <p className="text-info font-semibold mt-2">Then follow the steps below ⬇️</p>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">1.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span>In Chrome, tap the</span>
                      <div className="inline-flex items-center justify-center bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <HiOutlineDotsVertical className="text-2xl text-primary" />
                      </div>
                      <span className="font-semibold">Menu button</span>
                    </div>
                    <p className="text-xs text-base-content/60">in the top right corner</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">2.</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span>Tap</span>
                      <div className="inline-flex items-center gap-1 bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <MdInstallMobile className="text-xl text-primary" />
                      </div>
                    </div>
                    <p className="font-semibold">&quot;Install app&quot; or &quot;Add to Home screen&quot;</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">3.</span>
                  <div className="flex-1">
                    <span>Tap </span>
                    <span className="font-semibold text-primary">&quot;Install&quot;</span>
                    <span> to confirm</span>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">4.</span>
                  <div className="flex-1">
                    <span>{t('installApp.androidStep4')}</span>
                  </div>
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

