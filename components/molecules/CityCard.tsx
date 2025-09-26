import Flag from "../Flag";
import { City } from "@/types";
import Link from "next/link";

interface CityCardProps {
  city: City;
  index: number;
}

const CityCard = ({ city, index }: CityCardProps) => {
  return (
    <Link href={`/city/${city._id}`}>
      <div className="relative group cursor-pointer bg-base-100 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {city.image && (
          <img
            src={city.image}
            alt={`${city.name}, ${city.country}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-b from-black/10 to-black/100" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex flex-col h-full">
            <div className="flex flex-1 justify-end">
              <div>
                <div className="bg-black py-1 px-2 ">
                  <span className="text-sm font-bold">#{index}</span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <div className="flex gap-2 items-center">
                <Flag countryCode={city.country.code} size="sm" />
                <h3 className="text-xl font-bold">{city.name}</h3>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm">Dancers:</span>
                {city.totalDancers >= 30 ? (
                  <span className="text-sm">{city.totalDancers}</span>
                ) : (
                  <span className="text-sm text-orange-400 animate-pulse font-medium">
                    Growing...
                  </span>
                )}
              </div>
              {city.danceStyles.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm">Popular styles:</span>
                  <span className="text-sm">
                    {city.danceStyles.map((style) => style.style).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CityCard;
