import Image from "next/image";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";
import { unstable_cache } from "next/cache";

// Cached: Get random active dancers with profile pictures
const getRandomDancers = unstable_cache(
  async () => {
    try {
      await connectMongo();
      
      // Get 5 random dancers with images
      const dancers = await User.aggregate([
        { 
          $match: { 
            image: { $exists: true, $ne: "" },
            isProfileComplete: true
          } 
        },
        { $sample: { size: 5 } },
        { $project: { name: 1, image: 1 } }
      ]);
      
      // Get total dancer count
      const totalDancers = await User.countDocuments({ 
        isProfileComplete: true 
      });
      
      return { dancers, totalDancers };
    } catch (error) {
      console.error("Error fetching dancers:", error);
      return { dancers: [], totalDancers: 0 };
    }
  },
  ["testimonials-avatars"],
  { revalidate: 3600 } // 1 hour cache
);

const TestimonialsAvatars = async ({ priority }: { priority?: boolean }) => {
  const { dancers, totalDancers } = await getRandomDancers();
  // Format the number with commas
  const formattedTotal = totalDancers.toLocaleString();

  return (
    <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-3">
      {/* AVATARS */}
      <div className={`-space-x-5 avatar-group justy-start`}>
        {dancers.length > 0 ? (
          dancers.map((dancer: any) => (
            <div className="avatar w-12 h-12" key={dancer._id}>
              <Image
                src={dancer.image || '/default-avatar.png'}
                alt={dancer.name}
                priority={priority}
                width={50}
                height={50}
                className="rounded-full object-cover"
              />
            </div>
          ))
        ) : (
          // Fallback if no dancers found
          [...Array(5)].map((_, i) => (
            <div className="avatar w-12 h-12" key={i}>
              <div className="bg-base-300 rounded-full w-12 h-12" />
            </div>
          ))
        )}
      </div>

      {/* RATING */}
      <div className="flex flex-col justify-center items-center md:items-start gap-1">
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-yellow-500"
              key={i}
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>

        <div className="text-base text-neutral-content/80">
          <span className="font-semibold text-neutral-content">{formattedTotal}</span> dancers connected
        </div>
      </div>
    </div>
  );
};

export default TestimonialsAvatars;
