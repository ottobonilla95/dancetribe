import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import config from "@/config";
import connectMongo from "./mongo";

interface NextAuthOptionsExtended extends NextAuthOptions {
  adapter: any;
}

export const authOptions: NextAuthOptionsExtended = {
  // Set any random key in .env.local
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      // Follow the "Login with Google" tutorial to get your credentials
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        // Google provides locale info
        const browserLocale = profile.locale || 'en';
        const detectedLang = browserLocale.toLowerCase().includes('es') ? 'es' : 'en';
        
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
          preferredLanguage: detectedLang,
        };
      },
    }),
    // Follow the "Login with Email" tutorial to set up your email server
    // Requires a MongoDB database. Set MONOGODB_URI env variable.
    ...(connectMongo
      ? [
          EmailProvider({
            server: {
              host: "smtp.resend.com",
              port: 465,
              auth: {
                user: "resend",
                pass: process.env.RESEND_API_KEY,
              },
            },
            from: config.resend.fromNoReply,
          }),
        ]
      : []),
  ],
  // New users will be saved in Database (MongoDB Atlas). Each user (model) has some fields like name, email, image, etc..
  // Requires a MongoDB database. Set MONOGODB_URI env variable.
  // Learn more about the model type: https://next-auth.js.org/v3/adapters/models
  ...(connectMongo && { adapter: MongoDBAdapter(connectMongo) }),

  events: {
    createUser: async ({ user }) => {
      // Initialize onboarding fields when a new user is created
      try {
        const connectMongoose = (await import('@/libs/mongoose')).default;
        await connectMongoose();
        
        const User = (await import('@/models/User')).default;
        
        // Detect language from Google profile if available
        let detectedLanguage = 'en';
        const googleLocale = (user as any).preferredLanguage;
        if (googleLocale) {
          detectedLanguage = googleLocale;
        }
        
        // Update the newly created user with onboarding fields and language
        await User.findByIdAndUpdate(user.id, {
          $set: {
            isProfileComplete: false,
            preferredLanguage: detectedLanguage,
            onboardingSteps: {
              nameDetails: false,
              danceStyles: false,
              username: false,
              profilePic: false,
              dateOfBirth: false,
              currentLocation: false,
              citiesVisited: false,
              anthem: false,
              socialMedia: false,
              danceRole: false,
              gender: false,
              nationality: false,
            }
          }
        });
        
        console.log(`✅ Initialized onboarding fields for new user: ${user.email} with language: ${detectedLanguage}`);
      } catch (error) {
        console.error('Error initializing new user onboarding fields:', error);
      }
    },
  },
  callbacks: {
    jwt: async ({ token, user, trigger, account }) => {
      // ALWAYS check the database for profile completion status to avoid stale JWT tokens
      // This ensures the middleware gets the most up-to-date profile status
      try {
        // Use mongoose for database operations
        const connectMongoose = (await import('@/libs/mongoose')).default;
        await connectMongoose();
        
        const User = (await import('@/models/User')).default;
        const userData = await User.findById(token.sub || user?.id).select('isProfileComplete onboardingSteps image name preferredLanguage');
        
        console.log('🔍 JWT Callback - User data:', {
          userId: token.sub || user?.id,
          isProfileComplete: userData?.isProfileComplete,
          hasCustomImage: !!userData?.image,
          trigger,
          tokenWas: token.isProfileComplete
        });
        
        // If user exists but doesn't have isProfileComplete field, they need onboarding
        if (userData && userData.isProfileComplete === undefined) {
          token.isProfileComplete = false;
        } else {
          token.isProfileComplete = userData?.isProfileComplete || false;
        }
        
        
        // Update token with current user image, name, and language preference
        if (userData?.image) {
          token.picture = userData.image;
        }
        if (userData?.name) {
          token.name = userData.name;
        }
        if (userData?.preferredLanguage) {
          token.preferredLanguage = userData.preferredLanguage;
        }
        
        console.log('🔍 JWT Callback - Token updated:', {
          isProfileComplete: token.isProfileComplete,
          picture: token.picture,
          preferredLanguage: token.preferredLanguage,
          changed: token.isProfileComplete !== (userData?.isProfileComplete || false)
        });
      } catch (error) {
        console.error('Error fetching user profile in JWT callback:', error);
        token.isProfileComplete = false;
      }
      
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.isProfileComplete = token.isProfileComplete || false;
        // Update session with current user image and name from token
        if (token.picture) {
          session.user.image = token.picture;
        }
        if (token.name) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `https://${config.domainName}/icon-512.png`,
  },
};

export default NextAuth(authOptions);
