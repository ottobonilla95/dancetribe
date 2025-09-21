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
        return {
          id: profile.sub,
          name: profile.given_name ? profile.given_name : profile.name,
          email: profile.email,
          image: profile.picture,
          createdAt: new Date(),
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
        
        // Update the newly created user with onboarding fields
        await User.findByIdAndUpdate(user.id, {
          $set: {
            isProfileComplete: false,
            onboardingSteps: {
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
        
        console.log(`✅ Initialized onboarding fields for new user: ${user.email}`);
      } catch (error) {
        console.error('Error initializing new user onboarding fields:', error);
      }
    },
  },
  callbacks: {
    jwt: async ({ token, user, trigger }) => {
      // When user signs in or token is updated, fetch their profile completion status
      if (user?.id || trigger === 'update') {
        try {
          // Use mongoose for database operations
          const connectMongoose = (await import('@/libs/mongoose')).default;
          await connectMongoose();
          
          const User = (await import('@/models/User')).default;
          const userData = await User.findById(token.sub || user?.id).select('isProfileComplete onboardingSteps');
          
          console.log('🔍 JWT Callback - User data:', {
            userId: token.sub || user?.id,
            isProfileComplete: userData?.isProfileComplete,
            trigger
          });
          
          // If user exists but doesn't have isProfileComplete field, they need onboarding
          if (userData && userData.isProfileComplete === undefined) {
            token.isProfileComplete = false;
          } else {
            token.isProfileComplete = userData?.isProfileComplete || false;
          }
          
          console.log('🔍 JWT Callback - Token updated:', {
            isProfileComplete: token.isProfileComplete
          });
        } catch (error) {
          console.error('Error fetching user profile in JWT callback:', error);
          token.isProfileComplete = false;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
        session.user.isProfileComplete = token.isProfileComplete || false;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  theme: {
    brandColor: config.colors.main,
    // Add you own logo below. Recommended size is rectangle (i.e. 200x50px) and show your logo + name.
    // It will be used in the login flow to display your logo. If you don't add it, it will look faded.
    logo: `https://${config.domainName}/logoAndName.png`,
  },
};

export default NextAuth(authOptions);
