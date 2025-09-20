import CityCard from "../molecules/CityCard";
import { City } from "@/types";

interface CityListProps {
  cities: City[];
}

const CityList = ({ cities }: CityListProps) => {
  return (
    <section className="bg-neutral text-neutral-content rounded-md">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-32">
        <h2 className="max-w-3xl font-extrabold text-xl md:text-4xl tracking-tight mb-2 md:mb-8">
          🔥 Hottest Dance Cities 🔥
        </h2>
        {/* <p className="max-w-xl mx-auto text md:text-lg opacity-90 leading-relaxed mb-4 md:mb-20">
          Where the dance scene is absolutely on fire! Join the most vibrant communities worldwide
        </p> */}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {cities.map((city, index) => (
            <CityCard key={city._id} city={city} index={index + 1} />
          ))}
        </div>

        {cities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg opacity-75">
              No cities available at the moment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CityList;
