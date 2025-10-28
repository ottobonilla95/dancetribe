"use client";

import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import { CONTACT } from "@/constants/contact";
import { useEffect, useRef } from "react";
import { useTranslation } from "./I18nProvider";

interface HeroProps {
  featuredUsers?: Array<{
    _id: string;
    image?: string;
    name?: string;
  }>;
}

const Hero = ({ featuredUsers = [] }: HeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set attributes to ensure autoplay
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.muted = true;
      
      // Try to play immediately
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Video autoplay prevented:", error);
          // Auto-play on first user interaction
          const playOnInteraction = () => {
            video.play();
            document.removeEventListener('touchstart', playOnInteraction, { capture: true });
            document.removeEventListener('click', playOnInteraction, { capture: true });
            document.removeEventListener('scroll', playOnInteraction, { capture: true });
          };
          document.addEventListener('touchstart', playOnInteraction, { capture: true });
          document.addEventListener('click', playOnInteraction, { capture: true });
          document.addEventListener('scroll', playOnInteraction, { capture: true });
        });
      }
    }
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden text-white">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/75 to-black/85 z-10"></div>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover [&::-webkit-media-controls]:hidden [&::-webkit-media-controls-enclosure]:hidden"
          style={{ pointerEvents: 'none' }}
        >
          <source 
            src="https://res.cloudinary.com/daenzc7ix/video/upload/q_auto,f_auto/v1760362543/Ya_esta%CC%81_aqui%CC%81_nuestro_nuevo_tema_Bachata_Bolero_Es_un_honor_tener_a_los_increi%CC%81bles_ata_t1kkhl.mp4" 
            type="video/mp4" 
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 mt-4">
          💃 {t('hero.title')}
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-white/95 max-w-3xl mx-auto leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* User Avatars */}
        {featuredUsers.length > 0 && (
          <div className="flex justify-center mb-6 sm:mb-8 -space-x-2 sm:-space-x-3">
            {featuredUsers.slice(0, 8).map((user) => (
              <div
                key={user._id}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white overflow-hidden bg-base-200"
                title={user.name}
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'Dancer'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0) || 'D'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Key Features */}
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 text-left md:text-center max-w-2xl mx-auto">
          <div className="flex items-start md:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
            <span className="text-2xl sm:text-3xl flex-shrink-0">✨</span>
            <span><strong>{t('hero.feature1')}</strong> {t('hero.feature1b')}</span>
          </div>
          <div className="flex items-start md:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
            <span className="text-2xl sm:text-3xl flex-shrink-0">🌍</span>
            <span><strong>{t('hero.feature2')}</strong> {t('hero.feature2b')}</span>
          </div>
          <div className="flex items-start md:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
            <span className="text-2xl sm:text-3xl flex-shrink-0">👯</span>
            <span><strong>{t('hero.feature3')}</strong></span>
          </div>
          <div className="flex items-start md:items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
            <span className="text-2xl sm:text-3xl flex-shrink-0">🔥</span>
            <span><strong>{t('hero.feature4')}</strong></span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <ButtonSignin
            text={t('hero.ctaButton')}
            extraStyle="btn-primary btn-md sm:btn-lg text-base sm:text-lg px-8 sm:px-12"
          />
          <p className="text-sm sm:text-base text-white/80">
            {t('hero.alreadyMember')}
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-1 sm:gap-2 mt-8 sm:mt-12 animate-bounce">
          <span className="text-xs sm:text-sm text-white/70">{t('hero.exploreMore')}</span>
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
