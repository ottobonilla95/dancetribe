"use client";

import { useState } from "react";
import { FaWhatsapp, FaEnvelope, FaTwitter, FaFacebook, FaCopy, FaCheck, FaShare, FaInstagram } from "react-icons/fa";

interface InviteFriendsProps {
  userName?: string;
}

export default function InviteFriends({ userName = "A friend" }: InviteFriendsProps) {
  const [copied, setCopied] = useState(false);

  // Simple URL - no referral codes
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://dancecircle.co';
  
  const shareUrl = baseUrl;

  // Pre-written viral messages
  const messages = {
    default: `Hey! You NEED to check out DanceCircle! 💃🕺\n\nIt's like Instagram meets LinkedIn but for DANCERS. Find dancers in any city, connect globally, share your journey.\n\nFREE to join: ${shareUrl}\n\nThe dance community is already there! 🔥`,
    
    whatsapp: `Yooo! 🔥\n\nJust found DanceCircle - it's basically the app we've been waiting for as dancers!\n\n✨ Find dancers in ANY city worldwide\n🌍 Connect with your dance fam globally  \n🎯 See who dances what and where\n🏆 Share your journey & get recognized\n\nIt's FREE and already has dancers from everywhere!\n\nJoin here: ${shareUrl}\n\nSee you there! 💃🕺`,
    
    sms: `Yo! Found the perfect app for dancers - DanceCircle. Connect with dancers worldwide, find people in any city. FREE! ${shareUrl}`,
    
    email: {
      subject: "Found THE app for dancers! 🔥",
      body: `Hey!\n\nOkay so I just discovered DanceCircle and had to share it with you!\n\nIt's like if Instagram and LinkedIn had a baby... but for dancers. 😄\n\nWhat makes it cool:\n✨ Find dancers in ANY city (super useful when traveling!)\n🌍 Global dance community - connect with dancers worldwide\n🎯 See people's dance styles, experience, and journey\n🏆 Achievement badges for your dance milestones\n💃 Share your story and connect with like-minded dancers\n\nIt's completely FREE and the community is already growing!\n\nCheck it out: ${shareUrl}\n\nHope to see you there!\n${userName}`
    },
    
    twitter: `Just discovered @DanceCircle - finally an app built FOR dancers! 💃🕺\n\nFind dancers worldwide, connect in any city, share your journey.\n\nFREE to join & already has amazing dancers: ${shareUrl}\n\n#DanceCircle #DanceCommunity #Dancers`,
    
    facebook: `Dancers! 🔥\n\nFound an app that's actually built for US - DanceCircle!\n\nConnect with dancers globally, find people in any city, share your journey. It's FREE and the community is already lit!\n\nJoin: ${shareUrl}`,
    
    instagram: `Found the app we've been waiting for! 💃🕺\n\nDanceCircle lets you:\n✨ Find dancers in any city\n🌍 Connect globally\n🎯 Share your dance journey\n\nFREE to join!\n\nLink: ${shareUrl}\n\n#DanceCircle #DanceCommunity #Dancers`
  };

  const copyToClipboard = async () => {
    try {
      // Copy a compelling message with the link
      const copyText = `Check out DanceCircle - the global community for dancers! 💃🕺\n\nFind dancers worldwide, connect in any city.\n\n${shareUrl}`;
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareViaWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(messages.whatsapp)}`;
    window.open(url, '_blank');
  };

  const shareViaSMS = () => {
    const url = `sms:?&body=${encodeURIComponent(messages.sms)}`;
    window.location.href = url;
  };

  const shareViaEmail = () => {
    const url = `mailto:?subject=${encodeURIComponent(messages.email.subject)}&body=${encodeURIComponent(messages.email.body)}`;
    window.location.href = url;
  };

  const shareViaTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(messages.twitter)}`;
    window.open(url, '_blank');
  };

  const shareViaFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(messages.facebook)}`;
    window.open(url, '_blank');
  };

  const shareViaInstagramStories = () => {
    alert('💡 Tip: Use "Share my profile" from your profile page to copy your link, then add it to your Instagram bio or share with friends!');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DanceCircle - Global Dance Community 💃🕺',
          text: messages.default,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Native share cancelled');
      }
    }
  };

  const shareViaInstagram = () => {
    // Instagram doesn't have a direct share URL, so copy the message
    copyToClipboard();
    alert('📋 Message copied! Paste it in your Instagram Story or post!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Spread the Word! 🔥</h2>
        <p className="text-lg text-base-content/80 mb-2">
          Help build the world&apos;s largest dance community
        </p>
        <p className="text-sm text-base-content/60">
          Every dancer you share this with helps connect our global community 🌍
        </p>
      </div>

      {/* Social Proof / Stats */}
      <div className="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <div>
          <h3 className="font-bold">DanceCircle is growing fast!</h3>
          <div className="text-sm">Dancers from every continent are already connecting 🌍</div>
        </div>
      </div>

      {/* Quick Copy Link */}
      <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <div className="card-body">
          <h3 className="card-title text-lg mb-2">🔗 Quick Share Link</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="input input-bordered flex-1 font-mono text-sm"
            />
            <button
              onClick={copyToClipboard}
              className={`btn ${copied ? 'btn-success' : 'btn-primary'} gap-2 sm:btn-wide`}
            >
              {copied ? (
                <>
                  <FaCheck />
                  Copied!
                </>
              ) : (
                <>
                  <FaCopy />
                  Copy Link
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-base-content/60 mt-2">
            💡 This copies a compelling message + link ready to share!
          </p>
        </div>
      </div>

      {/* Quick Share Buttons */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Share via:</h3>
        
        {/* Native Share (Mobile) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={shareNative}
            className="btn btn-lg btn-primary w-full gap-3"
          >
            <FaShare className="text-xl" />
            Share with Friends
          </button>
        )}

        {/* WhatsApp */}
        <button
          onClick={shareViaWhatsApp}
          className="btn btn-lg btn-outline w-full gap-3 hover:bg-green-500 hover:text-white hover:border-green-500"
        >
          <FaWhatsapp className="text-2xl" />
          <span className="flex-1 text-left">Share on WhatsApp</span>
          <span className="text-xs opacity-70">Most effective! 🔥</span>
        </button>

        {/* SMS */}
        <button
          onClick={shareViaSMS}
          className="btn btn-lg btn-outline w-full gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <span className="flex-1 text-left">Send via Text Message</span>
        </button>

        {/* Email */}
        <button
          onClick={shareViaEmail}
          className="btn btn-lg btn-outline w-full gap-3"
        >
          <FaEnvelope className="text-xl" />
          <span className="flex-1 text-left">Send via Email</span>
        </button>

        {/* Twitter */}
        <button
          onClick={shareViaTwitter}
          className="btn btn-lg btn-outline w-full gap-3 hover:bg-blue-400 hover:text-white hover:border-blue-400"
        >
          <FaTwitter className="text-xl" />
          <span className="flex-1 text-left">Share on Twitter</span>
        </button>

        {/* Facebook */}
        <button
          onClick={shareViaFacebook}
          className="btn btn-lg btn-outline w-full gap-3 hover:bg-blue-600 hover:text-white hover:border-blue-600"
        >
          <FaFacebook className="text-xl" />
          <span className="flex-1 text-left">Share on Facebook</span>
        </button>

        {/* Instagram */}
        <button
          onClick={shareViaInstagram}
          className="btn btn-lg btn-outline w-full gap-3 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500"
        >
          <FaInstagram className="text-xl" />
          <span className="flex-1 text-left">Share on Instagram</span>
          <span className="text-xs opacity-70">Story-ready! 📱</span>
        </button>
      </div>

      {/* Tips Section */}
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <h3 className="font-bold">🚀 Where to share for maximum impact:</h3>
          <ul className="text-sm mt-1 space-y-1">
            <li>• 💚 <strong>WhatsApp groups</strong> - Your dance class, workshop friends</li>
            <li>• 📱 <strong>Instagram Stories</strong> - Use your profile share card!</li>
            <li>• 🎯 <strong>Dance festivals</strong> - When you meet new dancers</li>
            <li>• 💬 <strong>Dance communities</strong> - Facebook groups, Discord servers</li>
            <li>• 🎪 <strong>After socials</strong> - &quot;Add me on DanceCircle!&quot;</li>
          </ul>
        </div>
      </div>

    </div>
  );
}

