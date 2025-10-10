"use client";

import { useState, useEffect } from "react";
import CityCard from "../molecules/CityCard";
import { City } from "@/types";
import { FaSort, FaSpinner } from "react-icons/fa";

interface CityListProps {
  initialCities: City[];
}

const CityList = ({ initialCities }: CityListProps) => {
  const [cities, setCities] = useState(initialCities);
  const [sortBy, setSortBy] = useState<"rank" | "totalDancers">("totalDancers");
  const [loading, setLoading] = useState(false);
  
  const fetchSortedCities = async (sortOption: "rank" | "totalDancers") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cities?sortBy=${sortOption}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities || []);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort: "rank" | "totalDancers") => {
    setSortBy(newSort);
    fetchSortedCities(newSort);
  };

  return (
    <section className="text-neutral-content">
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-base-content/60">
          {cities.length} cities {loading && "(updating...)"}
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <FaSpinner className="animate-spin text-sm text-base-content/60" />
          ) : (
            <FaSort className="text-sm text-base-content/60" />
          )}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as "rank" | "totalDancers")}
            className="select select-bordered select-sm text-base-content bg-base-100"
            disabled={loading}
          >
            <option value="rank">Most Popular</option>
            <option value="totalDancers">Most Dancers</option>
          </select>
        </div>
      </div>

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
    </section>
  );
};

export default CityList;
