"use client";

import { useState } from "react";
import { FaLink, FaCheck } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface CopyProfileLinkProps {
  username: string;
}

export default function CopyProfileLink({ username }: CopyProfileLinkProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const profileUrl = `${window.location.origin}/${username}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`btn btn-sm w-full ${
        copied ? "btn-success" : "btn-outline btn-primary"
      }`}
    >
      {copied ? (
        <>
          <FaCheck className="text-lg" />
          {t('profile.linkCopied')}
        </>
      ) : (
        <>
          <FaLink className="text-lg" />
          {t('profile.copyProfileLink')}
        </>
      )}
    </button>
  );
} 