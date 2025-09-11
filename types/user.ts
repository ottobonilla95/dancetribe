import { City } from "./city";

export interface OnboardingSteps {
  danceStyles: boolean;
  profilePic: boolean;
  dateOfBirth: boolean;
  currentLocation: boolean;
  citiesVisited: boolean;
  anthem: boolean;
  socialMedia: boolean;
  danceRole: boolean;
}

export interface Anthem {
  url: string;
  platform: "spotify" | "youtube";
  title: string;
  artist: string;
}

export interface SocialMedia {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
}

export type DanceRole = "follower" | "leader" | "both";

export type User = {
  id: string;
  _id?: string;
  name?: string;
  email?: string;
  image?: string;
  customerId?: string;
  priceId?: string;
  hasAccess: boolean;
  city?: City | string | null;
  danceStyles: string[];
  dateOfBirth?: Date | string;
  citiesVisited: (City | string)[];
  anthem?: Anthem;
  socialMedia?: SocialMedia;
  danceRole?: DanceRole;
  isProfileComplete: boolean;
  onboardingSteps: OnboardingSteps;
  createdAt: Date | string;
  updatedAt: Date | string;
  emailVerified?: Date | string | null;
};
