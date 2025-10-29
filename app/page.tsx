import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import { redirect } from "next/navigation";
import Hero from "@/components/Hero";
import CityList from "@/components/organisims/CityList";
import Footer from "@/components/Footer";
import connectMongo from "@/libs/mongoose";
import City from "@/models/City";
import Country from "@/models/Country";
import Continent from "@/models/Continent";
import { City as CityType } from "@/types";
import Link from "next/link";
import HotDanceStyles from "@/components/HotDanceStyles";
import { DanceStyle as DanceStyleType } from "@/types/dance-style";
import User from "@/models/User";
import DanceStyle from "@/models/DanceStyle";
import ButtonSignin from "@/components/ButtonSignin";
import DancerCard from "@/components/DancerCard";
import TrendyMusicPreview from "@/components/TrendyMusicPreview";
import DancersMap from "@/components/DancersMap";
import AnimatedCounter from "@/components/AnimatedCounter";
import { getMessages, getTranslation } from "@/lib/i18n";
import { unstable_cache } from "next/cache";

// Note: Using data-level caching via unstable_cache instead of page-level revalidate
// This gives us more granular control over cache times per data source

// Cached: Hot dance styles - expensive aggregation
const getHotDanceStyles = unstable_cache(
  async (): Promise<(DanceStyleType & { userCount: number })[]> => {
    try {
      await connectMongo();

    // Aggregate to count users per dance style
    const hotStyles = await User.aggregate([
      // Only count users with complete profiles
      { $match: { isProfileComplete: true } },
      // Unwind the danceStyles array to get individual style documents
      { $unwind: "$danceStyles" },
      // Group by dance style and count users
      {
        $group: {
          _id: "$danceStyles.danceStyle",
          userCount: { $sum: 1 },
        },
      },
      // Sort by user count (most popular first)
      { $sort: { userCount: -1 } },
      // Limit to top 4
      { $limit: 4 },
      // Lookup dance style details
      {
        $lookup: {
          from: "dancestyles",
          localField: "_id",
          foreignField: "_id",
          as: "styleDetails",
        },
      },
      // Unwind style details
      { $unwind: "$styleDetails" },
      // Only include active styles
      { $match: { "styleDetails.isActive": true } },
      // Project final structure
      {
        $project: {
          _id: "$styleDetails._id",
          name: "$styleDetails.name",
          category: "$styleDetails.category",
          isActive: "$styleDetails.isActive",
          userCount: 1,
        },
      },
    ]);

    return hotStyles.map((style: any) => ({
      ...style,
      _id: style._id.toString(),
      id: style._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching hot dance styles:", error);
    return [];
  }
},
["hot-dance-styles"],
{ revalidate: 300, tags: ["hot-dance-styles"] } // 5 minutes - shared with dashboard
);

// Cached: Cities for landing page
const getCities = unstable_cache(
  async (): Promise<CityType[]> => {
  console.log("🚀 getCities FUNCTION CALLED");
  try {
    await connectMongo();

    const cities = await City.find({ totalDancers: { $gt: 0 } })
      .populate({ path: "country", model: Country, select: "name code" })
      .populate({ path: "continent", model: Continent, select: "name" })
      .sort({ totalDancers: -1 })
      .limit(10)
      .lean();

    const result = cities.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
      country: { name: doc.country?.name || "", code: doc.country?.code || "" },
      continent: { name: doc.continent?.name || "" },
    }));

    return result;
  } catch (error) {
    return [];
  }
},
["hot-cities"],
{ revalidate: 60, tags: ["hot-cities"] } // 1 minute - shared with dashboard
);

// Extract Spotify track ID from URL
function extractSpotifyTrackId(url: string): string | null {
  const match = url.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

// Determine platform from URL
function detectPlatform(url: string): 'spotify' | 'youtube' | null {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return null;
}

// Cached: Trending songs
const getTrendingSongs = unstable_cache(
  async () => {
    try {
      await connectMongo();

    // Get all users with anthem URLs
    const users = await User.find({ 
      "anthem.url": { $exists: true, $ne: "" } 
    })
      .select("anthem")
      .lean();

    // Count occurrences of each song
    const songCounts: { [key: string]: number } = {};
    users.forEach((user: any) => {
      if (user.anthem?.url) {
        songCounts[user.anthem.url] = (songCounts[user.anthem.url] || 0) + 1;
      }
    });

    // Convert to array and sort by count
    const trendingSongs = Object.entries(songCounts)
      .map(([url, count]) => {
        const platform = detectPlatform(url);
        return {
          url,
          count,
          platform,
          spotifyTrackId: platform === 'spotify' ? extractSpotifyTrackId(url) : null,
          youtubeVideoId: platform === 'youtube' ? extractYouTubeVideoId(url) : null,
        };
      })
      .filter((song) => song.spotifyTrackId || song.youtubeVideoId) // Only valid URLs
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10

    return trendingSongs;
  } catch (error) {
    console.error("Error fetching trending songs:", error);
    return [];
  }
},
["landing-trending-songs"],
{ revalidate: 900, tags: ["landing-trending-songs"] } // 15 minutes
);

// Cached: Featured users for hero section
const getFeaturedUsers = unstable_cache(
  async () => {
  try {
    await connectMongo();

    const users = await User.find({
      isProfileComplete: true,
      image: { 
        $exists: true, 
        $ne: null,
        // Exclude Google's default avatar images (with initials)
        $not: { $regex: /googleusercontent\.com.*[?&]d=/ }
      },
    })
      .select("name image")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      image: user.image,
    }));
  } catch (error) {
    console.error("Error fetching featured users:", error);
    return [];
  }
},
["landing-featured-users"],
{ revalidate: 600, tags: ["landing-featured-users"] } // 10 minutes
);

// Cached: Recent dancers for landing page
const getRecentDancers = unstable_cache(
  async () => {
  try {
    await connectMongo();

    const users = await User.find({
      isProfileComplete: true,
    })
      .populate({
        path: "city",
        model: City,
        populate: {
          path: "country",
          model: Country,
          select: "name code",
        },
      })
      .select("name username image danceStyles city likedBy dateOfBirth nationality dancingStartYear socialMedia danceRole isTeacher isDJ isPhotographer jackAndJillCompetitions openToMeetTravelers lookingForPracticePartners")
      .sort({ createdAt: -1 })
      .limit(16)
      .lean();

    // Get all dance styles for mapping
    const allDanceStyles = await DanceStyle.find({ isActive: true });
    const danceStyleMap = new Map(
      allDanceStyles.map((ds) => [ds._id.toString(), ds.name])
    );

    // Transform the data
    const transformedUsers = users.map((user: any) => {
      const danceStylesPopulated =
        user.danceStyles?.map((userStyle: any) => ({
          name: danceStyleMap.get(userStyle.danceStyle.toString()) || "Unknown",
          level: userStyle.level,
          _id: userStyle.danceStyle,
        })) || [];

      return {
        ...user,
        _id: user._id.toString(),
        city: user.city
          ? {
              ...user.city,
              _id: user.city._id.toString(),
              country: user.city.country
                ? {
                    ...user.city.country,
                    _id: user.city.country._id?.toString(),
                  }
                : null,
            }
          : null,
        danceStylesPopulated,
      };
    });

    return transformedUsers;
  } catch (error) {
    console.error("Error fetching recent dancers:", error);
    return [];
  }
},
["landing-recent-dancers"],
{ revalidate: 300, tags: ["landing-recent-dancers"] } // 5 minutes
);

// Cached: Community map data - most expensive query
const getCommunityMapData = unstable_cache(
  async () => {
  try {
    await connectMongo();

    // 🚀 OPTIMIZED: Run only 2 queries in parallel (down from 4!)
    const [totalDancers, dancersForMap] = await Promise.all([
      // Query 1: Fast count
      User.countDocuments({ isProfileComplete: true }),
      
      // Query 2: Get dancers with city data
      User.find({
        isProfileComplete: true,
        city: { $exists: true },
      })
        .select("name image username city")
        .populate({
          path: "city",
          select: "name coordinates country",
        })
        .limit(500)
        .lean()
    ]);

    // Calculate unique cities and countries from already-fetched data (no extra queries!)
    const uniqueCities = new Set();
    const uniqueCountries = new Set();
    
    dancersForMap.forEach((dancer: any) => {
      if (dancer.city?._id) {
        uniqueCities.add(dancer.city._id.toString());
      }
      if (dancer.city?.country) {
        uniqueCountries.add(dancer.city.country.toString());
      }
    });

    return {
      dancersForMap,
      totalDancers,
      totalCountries: uniqueCountries.size,
      totalCities: uniqueCities.size,
    };
  } catch (error) {
    console.error("Error fetching community map data:", error);
    return {
      dancersForMap: [],
      totalDancers: 0,
      totalCountries: 0,
      totalCities: 0,
    };
  }
},
["landing-community-map"],
{ revalidate: 600, tags: ["landing-community-map"] } // 10 minutes - expensive query
);

export default async function Home() {
  // Check if user is logged in and redirect to dashboard
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  // Get translations
  const messages = await getMessages();
  const t = (key: string) => getTranslation(messages, key);

  // Fetch data in parallel
  const [cities, hotDanceStyles, recentDancers, trendingSongs, featuredUsers, communityMapData] = await Promise.all([
    getCities(),
    getHotDanceStyles(),
    getRecentDancers(),
    getTrendingSongs(),
    getFeaturedUsers(),
    getCommunityMapData(),
  ]);

  return (
    <>
      <main>
        <Hero featuredUsers={featuredUsers} />
        
        {/* Global Community Map Section */}
        {communityMapData.dancersForMap.length > 0 && (
          <div className="mt-8 md:mt-12">
            {/* Stats Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
              <div className="grid grid-cols-3 gap-4 md:gap-8">
                <div className="text-center">
                  <AnimatedCounter 
                    end={communityMapData.totalDancers} 
                    suffix="+"
                    className="text-3xl md:text-5xl font-extrabold text-primary"
                  />
                  <div className="text-sm md:text-base text-base-content/70 mt-1">
                    {t('common.dancers')}
                  </div>
                </div>
                <div className="text-center">
                  <AnimatedCounter 
                    end={communityMapData.totalCountries}
                    className="text-3xl md:text-5xl font-extrabold text-secondary"
                  />
                  <div className="text-sm md:text-base text-base-content/70 mt-1">
                    {t('common.countries')}
                  </div>
                </div>
                <div className="text-center">
                  <AnimatedCounter 
                    end={communityMapData.totalCities}
                    suffix="+"
                    className="text-3xl md:text-5xl font-extrabold text-accent"
                  />
                  <div className="text-sm md:text-base text-base-content/70 mt-1">
                    {t('common.cities')}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive 3D Globe Map */}
            <div className="mb-8">
              <div className="text-center mb-12 sm:mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  {t('landing.joinDancersWorldwide')}
                </h2>
                <p className="text-base-content/60 mt-2">
                  {t('landing.connectWithDancersInCountries').replace('{count}', String(communityMapData.totalCountries))}
                </p>
              </div>
              <div className="w-full">
                <DancersMap 
                  dancers={JSON.parse(JSON.stringify(communityMapData.dancersForMap))} 
                  autoSpin={true}
                  disableMobileDrag={true}
                />
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
          <h2 className="max-w-3xl font-extrabold text-xl md:text-2xl tracking-tight mb-2 md:mb-8">
            {t('landing.hottestCities')}
          </h2>
          <CityList initialCities={cities} />
          {/* <div className="flex justify-center mt-6">
            <Link href="/cities" className="btn btn-outline btn-sm md:btn-md">
              View All Cities
            </Link>
          </div> */}
          {/* Hot Dance Styles Section */}
          <div className="mt-12">
            <HotDanceStyles danceStyles={hotDanceStyles} />
          </div>

          {/* Trendy Music Section */}
          <TrendyMusicPreview songs={trendingSongs} />

          {/* Meet Our Community Section */}
          {recentDancers.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="max-w-3xl font-extrabold text-xl md:text-2xl tracking-tight">
                    {t('landing.meetDancers')}
                  </h2>
                  <p className="text-base-content/60 mt-1">
                    {t('landing.meetDancersSubtitle')}
                  </p>
                </div>
                <ButtonSignin 
                  text={t('landing.discoverAll')}
                  extraStyle="btn-primary btn-sm md:btn-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recentDancers.map((dancer) => (
                  <DancerCard key={dancer._id} dancer={dancer} showLikeButton={false} showFlag={true} />
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-8">
                <ButtonSignin 
                  text={t('landing.joinCommunity')}
                  extraStyle="btn-primary btn-lg"
                />
              </div>
            </div>
          )}
        </div>

        <div className="h-10" />

        {/* <CTA /> */}
      </main>
      <Footer />
    </>
  );
}
