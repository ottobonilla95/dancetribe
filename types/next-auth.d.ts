import NextAuth, { DefaultSession, DefaultJWT } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;
      /** Whether the user has completed their profile onboarding. */
      isProfileComplete: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    /** Whether the user has completed their profile onboarding. */
    isProfileComplete: boolean;
  }
}
