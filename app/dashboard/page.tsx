import ButtonAccount from "@/components/ButtonAccount";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  // Check if user profile is complete
  try {
    await connectMongo();
    const user = await User.findById(session.user.id);

    if (user && !user.isProfileComplete) {
      // Redirect to onboarding if profile is not complete
      redirect("/onboarding");
    }
  } catch (error) {
    console.error("Error checking user profile:", error);
  }

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Welcome to DanceTribe!
        </h1>
        <p className="text-base-content/80">
          Your profile is complete. Welcome to your dashboard where you can
          manage your dance journey.
        </p>
      </section>
    </main>
  );
}
