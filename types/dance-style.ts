export interface DanceStyle {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  category: 'latin' | 'ballroom' | 'street' | 'contemporary' | 'traditional';
  isPartnerDance: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
} 