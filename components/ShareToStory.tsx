"use client";

import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import ShareCard from './ShareCard';

interface ShareToStoryProps {
  userData: {
    id: string;
    name: string;
    username?: string;
    profilePicture: string;
    dateOfBirth: string;
    city: {
      name: string;
      country: { name: string };
      image?: string;
    };
    danceStyles: Array<{
      name: string;
      level: string;
    }>;
  };
}

const ShareToStory: React.FC<ShareToStoryProps> = ({ userData }) => {
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareImage = async () => {
    if (!shareCardRef.current) return null;

    try {
      console.log('Starting image generation...');
      setIsGenerating(true);

      // Wait for QR code to be ready
      const waitForQR = () => {
        return new Promise<void>((resolve) => {
          const checkQR = () => {
            const shareCard = shareCardRef.current;
            if (shareCard && shareCard.getAttribute('data-qr-ready') === 'true') {
              console.log('QR code is ready!');
              resolve();
            } else {
              console.log('Waiting for QR code...');
              setTimeout(checkQR, 100);
            }
          };
          checkQR();
        });
      };

      await waitForQR();

      // Additional wait to ensure rendering is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create a temporary iframe for clean rendering
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-10000px';
      iframe.style.top = '-10000px';
      iframe.style.width = '1080px';
      iframe.style.height = '1920px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      // Wait for iframe to load
      await new Promise((resolve) => {
        iframe.onload = resolve;
        // Set a basic HTML structure
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

      // Wait a bit more for iframe content to render
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture the iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');

      const element = iframeDoc.body.firstElementChild as HTMLElement;
      if (!element) throw new Error('No element found to capture');

      console.log('Capturing element:', element);

      const canvas = await html2canvas(element, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: true,
        foreignObjectRendering: false
      });

      console.log('Canvas generated successfully');

      // Clean up iframe
      document.body.removeChild(iframe);

      // Convert to blob
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Image blob created:', blob.size, 'bytes');
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 1.0);
      });

    } catch (error) {
      console.error('Error generating share image:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      const imageBlob = await generateShareImage();
      if (!imageBlob) {
        throw new Error('Failed to generate image');
      }

      const file = new File([imageBlob], 'dancetribe-profile.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        console.log('Using Web Share API');
        await navigator.share({
          title: `${userData.name}'s DanceTribe Profile`,
          text: `Check out ${userData.name}'s dance profile on DanceTribe!`,
          files: [file]
        });
      } else {
        console.log('Web Share API not available, using fallback');
        // Create download link as fallback
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'dancetribe-profile.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Image saved! You can now share it on Instagram Stories 📱');
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to generate share image. Please try again.');
    }
  };

  return (
    <div>
      {/* Hidden ShareCard for rendering */}
      <div style={{ position: 'absolute', left: '-10000px', top: '-10000px' }}>
        <ShareCard ref={shareCardRef} userData={userData} />
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        disabled={isGenerating}
        style={{
          background: isGenerating 
            ? 'linear-gradient(45deg, #ccc, #999)' 
            : 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          opacity: isGenerating ? 0.7 : 1
        }}
      >
        {isGenerating ? (
          <>
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            />
            Generating...
          </>
        ) : (
          <>
            📱 Share to Story
          </>
        )}
      </button>

      {/* Add CSS animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ShareToStory;
