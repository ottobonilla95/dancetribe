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
  hideAge?: boolean;
  dancingStartYear?: number;
  city?: City;
  activeCity?: City;
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
  relationshipStatus?: "single" | "in_a_relationship" | "married" | "its_complicated" | "prefer_not_to_say";
  isProfileComplete?: boolean;
  onboardingSteps?: OnboardingSteps;
  customerId?: string;
  priceId?: string;
  hasAccess?: boolean;
  isTeacher?: boolean;
  isDJ?: boolean;
  isPhotographer?: boolean;
  teacherProfile?: TeacherProfile;
  djProfile?: DJProfile;
  photographerProfile?: PhotographerProfile;
  professionalContact?: ProfessionalContact;
  trips?: Trip[];
  openToMeetTravelers?: boolean;
  lookingForPracticePartners?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Trip {
  _id?: string;
  city: City | string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
}

export interface OnboardingSteps {
  nameDetails: boolean;
  danceStyles: boolean;
  username: boolean;
  profilePic: boolean;
  dateOfBirth: boolean;
  dancingStartYear: boolean;
  currentLocation: boolean;
  citiesVisited: boolean;
  anthem: boolean;
  socialMedia: boolean;
  danceRole: boolean;
  gender: boolean;
  nationality: boolean;
  relationshipStatus: boolean;
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
}

export interface DJProfile {
  djName?: string;
  genres?: string;
  bio?: string;
}

export interface PhotographerProfile {
  portfolioLink?: string;
  specialties?: string;
  bio?: string;
}

export interface ProfessionalContact {
  whatsapp?: string;
  email?: string;
}

export type DanceRole = "follower" | "leader" | "both";
