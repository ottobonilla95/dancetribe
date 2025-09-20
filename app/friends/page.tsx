import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import FriendsContent from "./FriendsContent";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  await connectMongo();

  // Fetch user data with all social connections
  let user;
  try {
    user = await User.findById(session.user.id)
      .populate("friends", "name image username city")
      .populate("friendRequestsReceived.user", "name image username city")
      .populate("friendRequestsSent.user", "name image username city")
      .populate("likedBy", "name image username")
      .lean();
  } catch (error) {
    console.error("Population error:", error);
    // Fallback: get user without population
    user = await User.findById(session.user.id).lean();
  }

  if (!user) {
    redirect("/dashboard");
  }

  // Convert to plain object for client component
  const userData = JSON.parse(JSON.stringify(user));

  return (
    <div className="min-h-screen p-4 bg-base-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Your Dance Network</h1>
          <p className="text-base-content/70">Connect with dancers, manage friendships, and grow your community</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Friends</div>
            <div className="stat-value text-primary">{userData.friends?.length || 0}</div>
            <div className="stat-desc">Connected dancers</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Pending Requests</div>
            <div className="stat-value text-warning">{userData.friendRequestsReceived?.length || 0}</div>
            <div className="stat-desc">Awaiting your response</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Sent Requests</div>
            <div className="stat-value text-info">{userData.friendRequestsSent?.length || 0}</div>
            <div className="stat-desc">Waiting for response</div>
          </div>
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Profile Likes</div>
            <div className="stat-value text-secondary">{userData.likedBy?.length || 0}</div>
            <div className="stat-desc">People who liked you</div>
          </div>
        </div>

        {/* Main Content */}
        <FriendsContent userData={userData} />
      </div>
    </div>
  );
} 