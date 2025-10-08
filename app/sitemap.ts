import { MetadataRoute } from 'next';
import connectMongo from '@/libs/mongoose';
import User from '@/models/User';
import City from '@/models/City';
import DanceStyle from '@/models/DanceStyle';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dancetribe.co';

  try {
    await connectMongo();

    // Fetch all users with complete profiles for public profile pages
    const users = await User.find({ 
      isProfileComplete: true,
      username: { $exists: true, $ne: null }
    })
      .select('username updatedAt')
      .lean();

    // Fetch all cities
    const cities = await City.find({ rank: { $gt: 0 } })
      .select('_id updatedAt')
      .lean();

    // Fetch all dance styles
    const danceStyles = await DanceStyle.find({ isActive: true })
      .select('_id updatedAt')
      .lean();

    // Static pages (public pages only)
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/tos`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
    ];

    // User profile pages (public)
    const userPages = users.map((user: any) => ({
      url: `${baseUrl}/${user.username}`,
      lastModified: user.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // City pages (public)
    const cityPages = cities.map((city: any) => ({
      url: `${baseUrl}/city/${city._id.toString()}`,
      lastModified: city.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Dance style pages (note: these are now private, but keeping for when we make them public)
    // Commenting out for now since they require auth
    /*
    const danceStylePages = danceStyles.map((style: any) => ({
      url: `${baseUrl}/dance-style/${style._id.toString()}`,
      lastModified: style.updatedAt || new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));
    */

    return [
      ...staticPages,
      ...userPages,
      ...cityPages,
      // ...danceStylePages, // Uncomment when dance styles are public
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least static pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
    ];
  }
}

