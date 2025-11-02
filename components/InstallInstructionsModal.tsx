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
                      <span className="font-bold text-info">{t('installApp.step0Title')}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p>{t('installApp.step0iOS1')}</p>
                      <p>{t('installApp.step0iOS2')}</p>
                      <p className="text-info font-semibold mt-2">{t('installApp.step0Footer')}</p>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">1.</span>
                  <div className="flex-1">
                    <p className="mb-2">{t('installApp.step1iOS')}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="inline-flex items-center justify-center bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <IoShareOutline className="text-2xl text-primary" />
                      </div>
                      <span className="font-semibold">{t('installApp.shareButton')}</span>
                    </div>
                    <p className="text-xs text-base-content/60">{t('installApp.atBottom')}</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">2.</span>
                  <div className="flex-1">
                    <p className="mb-2">{t('installApp.step2iOS')}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="inline-flex items-center justify-center bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <FaPlus className="text-lg text-primary" />
                      </div>
                      <span className="font-semibold">&quot;{t('installApp.addToHomeScreen')}&quot;</span>
                    </div>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">3.</span>
                  <div className="flex-1">
                    <span>{t('installApp.step3iOS')}</span>
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
                      <span className="font-bold text-info">{t('installApp.step0Title')}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <p>{t('installApp.step0Android1')}</p>
                      <p>{t('installApp.step0Android2')}</p>
                      <p className="text-info font-semibold mt-2">{t('installApp.step0Footer')}</p>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">1.</span>
                  <div className="flex-1">
                    <p className="mb-2">{t('installApp.step1Android')}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="inline-flex items-center justify-center bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <HiOutlineDotsVertical className="text-2xl text-primary" />
                      </div>
                      <span className="font-semibold">{t('installApp.menuButton')}</span>
                    </div>
                    <p className="text-xs text-base-content/60">{t('installApp.atTopRight')}</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">2.</span>
                  <div className="flex-1">
                    <p className="mb-2">{t('installApp.step2Android')}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="inline-flex items-center justify-center bg-primary/20 rounded-lg px-3 py-2 border-2 border-primary/30">
                        <MdInstallMobile className="text-xl text-primary" />
                      </div>
                      <span className="font-semibold">&quot;{t('installApp.installOrAdd')}&quot;</span>
                    </div>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-bold text-primary">3.</span>
                  <div className="flex-1">
                    <span>{t('installApp.step3Android')}</span>
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

