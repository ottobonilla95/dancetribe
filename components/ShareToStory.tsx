"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import ShareCard from "./ShareCard";

interface ShareToStoryProps {
  userData: {
    id?: string;
    name?: string;
    image?: string;
    danceStyles?: string[];
    danceRole?: string;
    city?: {
      name: string;
      country?: any;
    };
    zodiac?: {
      sign: string;
      emoji: string;
    };
  };
}

export default function ShareToStory({ userData }: ShareToStoryProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Add CSS animation for spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const generateAndShare = async () => {
    if (!shareCardRef.current) return;

    setIsGenerating(true);

    try {
      // Create a clean iframe to render the card
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '1080px';
      iframe.style.height = '1920px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument!;
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
          ${shareCardRef.current.outerHTML}
        </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for iframe to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate the image from iframe content
      console.log("Starting image generation...", iframe.contentDocument!.body.firstElementChild);
      const canvas = await html2canvas(iframe.contentDocument!.body.firstElementChild as HTMLElement, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#667eea',
        logging: false,
      });
      console.log("Canvas generated successfully:", canvas);

      // Clean up iframe
      document.body.removeChild(iframe);

      // Convert to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) return;

          const profileUrl = `${window.location.origin}/dancer/${userData.id}`;

          // Try Web Share API first (works on mobile)
          if (navigator.share && navigator.canShare) {
            try {
              const file = new File([blob], "dancetribe-profile.jpg", {
                type: "image/jpeg",
              });

              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: `${userData.name}'s DanceTribe Profile`,
                  text: `Check out ${userData.name || "this dancer"}'s profile on DanceTribe! 💃🕺`,
                  url: profileUrl,
                  files: [file],
                });
                return;
              }
            } catch (err) {
              console.log("Web Share failed, trying fallback");
            }
          }

          // Fallback: Download image and copy link
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "dancetribe-profile-story.jpg";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          // Copy profile link to clipboard
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(profileUrl);
            alert(
              "📸 Image downloaded! Profile link copied to clipboard.\n\nShare the image on Instagram Stories and paste the link when prompted! 🎉"
            );
          } else {
            alert(
              `📸 Image downloaded!\n\nProfile link: ${profileUrl}\n\nShare the image on Instagram Stories and add this link! 🎉`
            );
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("Error generating share image:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Failed to generate share image: ${error.message}\n\nPlease check the browser console for more details.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Share Button */}
      <button
        onClick={generateAndShare}
        disabled={isGenerating}
        style={{
          background: 'linear-gradient(to right, #a855f7, #ec4899)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          opacity: isGenerating ? 0.7 : 1,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        {isGenerating ? (
          <span style={{ 
            display: 'inline-block',
            width: '20px', 
            height: '20px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '8px'
          }}></span>
        ) : (
          "📱"
        )}
        {isGenerating ? "Generating..." : "Share to Instagram Story"}
      </button>

      {/* Hidden Share Card for Rendering */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '-10000px', 
          left: '-10000px', 
          pointerEvents: 'none',
          isolation: 'isolate',
          contain: 'layout style paint',
          zIndex: -9999
        }}
      >
        <div style={{ all: 'initial', fontFamily: 'Arial, sans-serif' }}>
          <ShareCard ref={shareCardRef} userData={userData} />
        </div>
      </div>
    </div>
  );
}
