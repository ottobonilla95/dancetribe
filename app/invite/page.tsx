import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import InviteFriends from "@/components/InviteFriends";
import BackButton from "@/components/BackButton";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export const metadata = {
  title: "Invite Friends | DanceCircle",
  description:
    "Invite your dance friends to join DanceCircle and grow the global dance community",
};

export default async function InvitePage() {
  // Session is already validated in layout
  const session = await getServerSession(authOptions);

  // Fetch user data
  await connectMongo();
  const user = await User.findById(session!.user.id).select("name").lean();

  if (!user) {
    redirect("/dashboard");
  }

  // Type cast to avoid Mongoose lean() typing issues
  const userData = user as any;

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton label="Back" href="/dashboard" />
        </div>

        {/* Main Content */}
        <InviteFriends userName={userData.name} />

        {/* Additional CTA */}
        <div className="mt-8 space-y-6">
          {/* Main Vision */}
          <div className="card bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30">
            <div className="card-body">
              <h3 className="card-title justify-center text-2xl mb-2">
                🌍 Building Something Special
              </h3>
              <p className="text-base-content/80 mb-4">
                Imagine a world where any dancer can land in ANY city and
                instantly connect with the local dance scene. Where language and
                borders don&apos;t matter because dance is our universal
                language. That&apos;s what we&apos;re building together! 🔥
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-sm">
                <div className="badge badge-lg badge-primary gap-2">
                  🕺 Connect Globally
                </div>
                <div className="badge badge-lg badge-secondary gap-2">
                  🌎 Dance Locally
                </div>
                <div className="badge badge-lg badge-accent gap-2">
                  💃 Unite Dancers
                </div>
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-200">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-2">💬</div>
                <h4 className="font-bold">Share Daily</h4>
                <p className="text-sm text-base-content/70">
                  Post about DanceCircle in your dance groups
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-2">🎪</div>
                <h4 className="font-bold">Invite In Person</h4>
                <p className="text-sm text-base-content/70">
                  Tell dancers you meet at events & socials
                </p>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body items-center text-center">
                <div className="text-4xl mb-2">📱</div>
                <h4 className="font-bold">Share Your Profile</h4>
                <p className="text-sm text-base-content/70">
                  Post your profile card to Instagram Stories
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
