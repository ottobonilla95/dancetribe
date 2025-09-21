"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface LikesContextType {
  likesCount: { [userId: string]: number };
  updateLikesCount: (userId: string, count: number) => void;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likesCount, setLikesCount] = useState<{ [userId: string]: number }>({});

  const updateLikesCount = (userId: string, count: number) => {
    setLikesCount(prev => ({
      ...prev,
      [userId]: count
    }));
  };

  return (
    <LikesContext.Provider value={{ likesCount, updateLikesCount }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
} 