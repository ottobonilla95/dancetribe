import { City } from "./city";
import { UserDanceStyle } from "./dance-style";

export type User = {
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  image?: string;
  username?: string;
  dateOfBirth?: Date;
  city?: City;
  citiesVisited?: City[];
  danceStyles?: UserDanceStyle[];
  anthem?: {
    url: string;
    platform: "spotify" | "youtube";
    title?: string;
    artist?: string;
  };
  socialMedia?: SocialMedia;
  danceRole?: "follower" | "leader" | "both";
  gender?: "male" | "female" | "other";
  nationality?: string;
  isProfileComplete?: boolean;
  onboardingSteps?: OnboardingSteps;
  customerId?: string;
  priceId?: string;
  hasAccess?: boolean;
  isTeacher?: boolean;
  teacherProfile?: TeacherProfile;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OnboardingSteps {
  nameDetails: boolean;
  danceStyles: boolean;
  username: boolean;
  profilePic: boolean;
  dateOfBirth: boolean;
  currentLocation: boolean;
  citiesVisited: boolean;
  anthem: boolean;
  socialMedia: boolean;
  danceRole: boolean;
  gender: boolean;
  nationality: boolean;
  teacherInfo: boolean;
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

export interface TeacherProfile {
  bio?: string;
  yearsOfExperience?: number;
  danceStylesTaught?: string[]; // Array of DanceStyle IDs
  contact?: {
    whatsapp?: string;
    email?: string;
  };
}

export type DanceRole = "follower" | "leader" | "both";
