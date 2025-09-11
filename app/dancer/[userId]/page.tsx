import { notFound } from "next/navigation";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import City from "@/models/City";
import Link from "next/link";
import { getZodiacSign } from "@/utils/zodiac";

interface Props {
  params: {
    userId: string;
  };
}

export default async function PublicProfile({ params }: Props) {
  await connectMongo();
  
  const user = await User.findById(params.userId)
    .populate({
      path: "city",
      model: City,
      select: "name country continent",
    })
    .populate({
      path: "citiesVisited",
      model: City,
      select: "name country",
    })
    .lean();

  if (!user) {
    notFound();
  }

  const userData = user as any;
  const zodiac = userData.dateOfBirth ? getZodiacSign(userData.dateOfBirth) : null;
  const age = userData.dateOfBirth ? Math.floor((Date.now() - new Date(userData.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  const getRoleDisplay = (role: string) => {
    const roleMap = {
      leader: "Leader 👑",
      follower: "Follower 💃",
      both: "Both (Leader & Follower) 🔄"
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">DanceTribe Profile</h1>
          <p className="text-white opacity-80">Discover amazing dancers in our community</p>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card bg-white shadow-2xl">
            <div className="card-body p-8">
              
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="avatar mb-4">
                  <div className="w-32 h-32 rounded-full">
                    {userData.image ? (
                      <img 
                        src={userData.image} 
                        alt={userData.name || "Profile"} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-full w-full h-full flex items-center justify-center">
                        <span className="text-4xl">
                          {userData.name?.charAt(0)?.toUpperCase() || "👤"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {userData.name || "Dance Lover"}
                </h2>
                
                {age && (
                  <p className="text-lg text-gray-600">
                    {age} years old
                  </p>
                )}
                
                {zodiac && (
                  <div className="mt-3">
                    <span className="badge badge-primary badge-lg">
                      {zodiac.emoji} {zodiac.sign}
                    </span>
                  </div>
                )}
              </div>

              {/* Current Location */}
              {userData.city && (
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-gray-500">Currently in</div>
                  <div className="text-xl font-semibold text-gray-800">
                    📍 {userData.city.name}
                    {userData.city.country && (
                      <span className="text-gray-600">
                        , {typeof userData.city.country === 'string' ? userData.city.country : userData.city.country.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Dance Role */}
              {userData.danceRole && (
                <div className="text-center mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-1">Dance Role</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {getRoleDisplay(userData.danceRole)}
                  </div>
                </div>
              )}

              {/* Dance Styles */}
              {userData.danceStyles && userData.danceStyles.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-500 mb-3 text-center">Dance Styles</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {userData.danceStyles.map((style: string, index: number) => (
                      <div key={index} className="badge badge-primary badge-lg">
                        {style}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cities Visited */}
              {userData.citiesVisited && userData.citiesVisited.length > 0 && (
                <div className="mb-8">
                  <div className="text-sm font-medium text-gray-500 mb-3 text-center">Cities Danced In</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {userData.citiesVisited.slice(0, 8).map((city: any, index: number) => (
                      <div key={index} className="badge badge-outline">
                        🌍 {typeof city === 'string' ? city : city.name}
                      </div>
                    ))}
                    {userData.citiesVisited.length > 8 && (
                      <div className="badge badge-outline">
                        +{userData.citiesVisited.length - 8} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Call to Action */}
              <div className="text-center">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Join DanceTribe Community!
                  </h3>
                  <p className="text-gray-600">
                    Connect with dancers worldwide, share your passion, and discover new dance experiences.
                  </p>
                </div>
                
                <Link 
                  href="/api/auth/signin" 
                  className="btn btn-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg"
                >
                  🕺 Join DanceTribe 💃
                </Link>
                
                <div className="mt-4">
                  <Link href="/" className="link link-primary text-sm">
                    Learn more about DanceTribe
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white opacity-80">
          <p>&copy; 2024 DanceTribe - Where dancers connect</p>
        </div>
      </div>
    </div>
  );
} 