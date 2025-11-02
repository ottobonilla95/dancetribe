"use client";

import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";
import InstallInstructionsModal from "./InstallInstructionsModal";

export default function InstallAppButton() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Install Button - Only show on mobile/tablet */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-primary btn-block gap-2 lg:hidden"
        data-install-button
      >
        <FaDownload className="text-lg" />
        {t('nav.installApp')}
      </button>

      {/* Use the centralized InstallInstructionsModal component */}
      <InstallInstructionsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}

