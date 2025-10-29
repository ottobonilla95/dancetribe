import connectDB from "@/libs/mongoose";
import User from "@/models/User";
import { FaMusic, FaSpotify, FaFire, FaUsers, FaYoutube } from "react-icons/fa";
import { getMessages, getTranslation } from "@/lib/i18n";

export const metadata = {
  title: "Trending Dance Music | DanceCircle",
  description: "Discover the most popular dance anthems from our community",
};

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
function detectPlatform(url: string): "spotify" | "youtube" | null {
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return null;
}

export default async function MusicPage() {
  // Get translations
  const messages = await getMessages();
  const t = (key: string) => getTranslation(messages, key);

  await connectDB();

  // Get all users with anthem URLs
  const users = await User.find({
    "anthem.url": { $exists: true, $ne: "" },
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
        spotifyTrackId:
          platform === "spotify" ? extractSpotifyTrackId(url) : null,
        youtubeVideoId:
          platform === "youtube" ? extractYouTubeVideoId(url) : null,
      };
    })
    .filter((song) => song.spotifyTrackId || song.youtubeVideoId) // Only valid URLs
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return (
    <div className="bg-base-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <FaFire className="text-error" />
            {t('musicPage.title')}
          </h1>
          <p className="text-lg text-base-content/80">
            {t('musicPage.subtitle')} 🎵
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {trendingSongs.length === 0 ? (
          <div className="text-center py-12">
            <FaMusic className="text-6xl text-base-content/20 mx-auto mb-4" />
            <p className="text-xl text-base-content/60">
              {t('musicPage.noSongsYet')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {trendingSongs.map((song, index) => (
              <div key={song.url} className="card bg-base-300 shadow-xl overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-primary">
                      #{index + 1}
                    </div>
                    <div className="badge badge-primary gap-2">
                      <FaUsers className="text-xs" />
                      {song.count} {song.count === 1 ? t('musicPage.dancer') : t('musicPage.dancers')}
                    </div>
                  </div>
                </div>

                {/* Spotify Embed */}
                {song.platform === "spotify" && song.spotifyTrackId && (
                  <div className="w-full rounded-xl overflow-hidden" style={{ height: "152px" }}>
                    <iframe
                      src={`https://open.spotify.com/embed/track/${song.spotifyTrackId}?utm_source=generator`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      scrolling="no"
                      style={{ overflow: "hidden" }}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                )}

                {/* YouTube Embed */}
                {song.platform === "youtube" && song.youtubeVideoId && (
                  <div className="w-full aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${song.youtubeVideoId}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
