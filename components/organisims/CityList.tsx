import CityCard from "../molecules/CityCard";
import { City } from "@/types";

interface CityListProps {
  cities: City[];
}

const CityList = ({ cities }: CityListProps) => {
  return (
    <section className="bg-neutral text-neutral-content">
      <div className="max-w-7xl mx-auto px-8 py-16 md:py-32">
        <h2 className="max-w-3xl font-extrabold text-4xl md:text-5xl tracking-tight mb-6 md:mb-8">
          Top Cities
        </h2>
        <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed mb-12 md:mb-20">
          Discover the most vibrant dance communities around the world
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
