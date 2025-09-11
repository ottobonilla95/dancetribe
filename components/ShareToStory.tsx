"use client";

import { useState, useRef } from "react";
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

  const generateAndShare = async () => {
    if (!shareCardRef.current) return;

    setIsGenerating(true);
    
    try {
      // Generate the image
      const canvas = await html2canvas(shareCardRef.current, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const profileUrl = `${window.location.origin}/dancer/${userData.id}`;

        // Try Web Share API first (works on mobile)
        if (navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], 'dancetribe-profile.jpg', { type: 'image/jpeg' });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: `${userData.name}'s DanceTribe Profile`,
                text: `Check out ${userData.name || 'this dancer'}'s profile on DanceTribe! 💃🕺`,
                url: profileUrl,
                files: [file]
              });
              return;
            }
          } catch (err) {
            console.log('Web Share failed, trying fallback');
          }
        }

        // Fallback: Download image and copy link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dancetribe-profile-story.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Copy profile link to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(profileUrl);
          alert('📸 Image downloaded! Profile link copied to clipboard.\n\nShare the image on Instagram Stories and paste the link when prompted! 🎉');
        } else {
          alert(`📸 Image downloaded!\n\nProfile link: ${profileUrl}\n\nShare the image on Instagram Stories and add this link! 🎉`);
        }

      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Error generating share image:', error);
      alert('Failed to generate share image. Please try again.');
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
        className="btn btn-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg"
      >
        {isGenerating ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          "📱"
        )}
        {isGenerating ? "Generating..." : "Share to Instagram Story"}
      </button>

      {/* Hidden Share Card for Rendering */}
      <div className="fixed -top-[10000px] -left-[10000px] pointer-events-none">
        <ShareCard ref={shareCardRef} userData={userData} />
      </div>
    </div>
  );
} 