"use client";

import React from 'react';
import ShareCard from '@/components/ShareCard';

// Mock user data for testing
const mockUserData = {
  id: "test123",
  name: "otto",
  username: "otto_dancer", 
  profilePicture: "https://res.cloudinary.com/daenzc7ix/image/upload/v1757604427/profile-pictures/profile-68bd87f6c289fea2b22d27de-1757604425448.jpg",
  dateOfBirth: "1994-03-25",
  nationality: "Colombia",
  danceRole: "leader",
  city: {
    name: "Bangkok",
    country: { name: "Thailand" },
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=100&h=100&fit=crop"
  },
  danceStyles: [
    { name: "Bachata", level: "advanced" },
    { name: "Salsa", level: "intermediate" },
    { name: "Kizomba", level: "beginner" }
  ]
};

export default function ShareCardDev() {
  return (
    <div className="bg-gray-100 flex ">
      <div className="relative" style={{ 
        width: '270px', 
        height: '480px', 
        transform: 'scale(0.5)', 
        // transformOrigin: 'center',
      }}>
        <ShareCard userData={mockUserData} />
      </div>
    </div>
  );
} 