"use client";

import { useState } from "react";
import { FaLink, FaCheck } from "react-icons/fa";

interface CopyProfileLinkProps {
  userId: string;
}

export default function CopyProfileLink({ userId }: CopyProfileLinkProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const profileUrl = `${window.location.origin}/dancer/${userId}`;
    
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
          Link Copied!
        </>
      ) : (
        <>
          <FaLink className="text-lg" />
          Copy Profile Link
        </>
      )}
    </button>
  );
} 