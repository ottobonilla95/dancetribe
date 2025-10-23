"use client";

import { useRef, useState } from "react";
import { FaDownload, FaCopy, FaTimes, FaInstagram } from "react-icons/fa";
import html2canvas from "html2canvas";
import ShareCard from "./ShareCard";

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
    nationality?: string;
    danceRole?: string;
    city: {
      name: string;
      country: { name: string };
      image?: string;
    };
    danceStyles: Array<{
      name: string;
      level: string;
    }>;
    yearsDancing?: number;
    citiesVisited?: number;
  };
  profileUrl: string;
}

export default function SharePreviewModal({
  isOpen,
  onClose,
  userData,
  profileUrl,
}: SharePreviewModalProps) {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!shareCardRef.current) return;

    try {
      setIsGenerating(true);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create iframe for clean rendering
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-10000px';
      iframe.style.top = '-10000px';
      iframe.style.width = '1080px';
      iframe.style.height = '1080px';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      
      document.body.appendChild(iframe);
      
      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: Arial, sans-serif; }
                </style>
              </head>
              <body>
                ${shareCardRef.current!.outerHTML}
              </body>
            </html>
          `);
          iframeDoc.close();
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');

      const element = iframeDoc.body.firstElementChild as HTMLElement;
      if (!element) throw new Error('No element found to capture');

      const canvas = await html2canvas(element, {
        width: 1080,
        height: 1080,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        foreignObjectRendering: false
      });

      // Clean up iframe
      document.body.removeChild(iframe);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `dancecircle-${userData.username || "profile"}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
        setIsGenerating(false);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
      setIsGenerating(false);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Hidden Full-Size Card for Download */}
      <div style={{ position: 'absolute', left: '-10000px', top: '-10000px' }}>
        <ShareCard ref={shareCardRef} userData={userData} />
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-[60]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost z-10"
          >
            <FaTimes />
          </button>

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="text-2xl font-bold mb-2">Share to Instagram</h3>
              <p className="text-sm text-base-content/70">
                Download your profile card and upload it to your Instagram Story!
              </p>
            </div>

            {/* Profile Card Preview */}
            <div className="flex justify-center mb-4 overflow-hidden" style={{ height: '240px' }}>
              <div className="transform scale-[0.2] pointer-events-none origin-top">
                <ShareCard userData={userData} />
              </div>
            </div>

            {/* Instructions */}
            <div className="alert alert-info mb-6">
              <div>
                <FaInstagram className="text-xl" />
                <div className="text-sm">
                  <p className="font-semibold">How to share:</p>
                  <ol className="list-decimal ml-4 mt-1">
                    <li>Download your card</li>
                    <li>Open Instagram</li>
                    <li>Upload to your Story</li>
                    <li>Copy link and add to your bio or story</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="btn btn-primary btn-block gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Download Card for Instagram
                  </>
                )}
              </button>

              <button
                onClick={copyProfileLink}
                className="btn btn-outline btn-block gap-2"
              >
                <FaCopy />
                {copied ? "Link Copied! ✓" : "Copy Profile Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

