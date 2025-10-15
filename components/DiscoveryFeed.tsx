"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { DanceStyle } from "@/types/dance-style";
import DancerCard from "./DancerCard";
import { FaFilter, FaSpinner } from "react-icons/fa";

interface DiscoveryFeedProps {
  initialDancers?: any[];
  danceStyles?: DanceStyle[];
  showViewAllLink?: boolean;
  isPreview?: boolean; // Hide filters when showing as a preview on dashboard
}

export default function DiscoveryFeed({ initialDancers = [], danceStyles = [], showViewAllLink = false, isPreview = false }: DiscoveryFeedProps) {
  const [dancers, setDancers] = useState(initialDancers);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    danceStyle: "",
    danceRole: "",
    city: "",
    nearMe: true, // Default to showing local dancers first
    inMyCountry: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchDancers = async (skip = 0, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams();
      if (filters.danceStyle) params.append("danceStyle", filters.danceStyle);
      if (filters.danceRole) params.append("danceRole", filters.danceRole);
      if (filters.city) params.append("city", filters.city);
      if (filters.nearMe) params.append("nearMe", "true");
      if (filters.inMyCountry) params.append("inMyCountry", "true");
      params.append("skip", skip.toString());

      const response = await fetch(`/api/dancers/discover?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (append) {
          setDancers((prev) => [...prev, ...(data.dancers || [])]);
        } else {
          setDancers(data.dancers || []);
        }
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching dancers:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    fetchDancers(dancers.length, true);
  };

  useEffect(() => {
    // Always fetch fresh data when any filter changes
    fetchDancers(0, false);
  }, [filters]);

  const clearFilters = () => {
    setFilters({ danceStyle: "", danceRole: "", city: "", nearMe: false, inMyCountry: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discover Dancers</h2>
            <p className="text-base-content/60">
              {filters.nearMe ? "Dancers in your city" : 
               filters.inMyCountry ? "Dancers in your country" :
               "Dancers around the world"}
            </p>
          </div>
          <div className="flex gap-2">
            {showViewAllLink && (
              <a
                href="/discover"
                className="btn btn-primary btn-sm gap-2"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
            {/* Hide More Filters button on mobile when isPreview */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-outline btn-sm gap-2 ${isPreview ? 'hidden md:flex' : ''}`}
            >
              <FaFilter />
              More Filters
            </button>
          </div>
        </div>

        {/* Location Toggle Buttons - Always show */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilters({...filters, nearMe: true, inMyCountry: false})}
            className={`btn btn-sm ${filters.nearMe ? 'btn-primary' : 'btn-outline'}`}
          >
            📍 Near Me
          </button>
          <button
            onClick={() => setFilters({...filters, nearMe: false, inMyCountry: true})}
            className={`btn btn-sm ${filters.inMyCountry ? 'btn-primary' : 'btn-outline'}`}
          >
            🏳️ My Country
          </button>
          <button
            onClick={() => setFilters({...filters, nearMe: false, inMyCountry: false})}
            className={`btn btn-sm ${(!filters.nearMe && !filters.inMyCountry) ? 'btn-primary' : 'btn-outline'}`}
          >
            🌍 Worldwide
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card bg-base-200 p-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Dance Style Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Dance Style</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.danceStyle}
                onChange={(e) => setFilters({ ...filters, danceStyle: e.target.value })}
              >
                <option value="">All Styles</option>
                {danceStyles.map((style) => (
                  <option key={style._id || style.id} value={style.name}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dance Role Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Dance Role</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.danceRole}
                onChange={(e) => setFilters({ ...filters, danceRole: e.target.value })}
              >
                <option value="">All Roles</option>
                <option value="leader">Leaders</option>
                <option value="follower">Followers</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">City</span>
              </label>
              <input
                type="text"
                placeholder="Enter city name..."
                className="input input-bordered input-sm"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filters.danceStyle || filters.danceRole || filters.city) && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-primary" />
        </div>
      )}

      {/* Dancers Grid */}
      {!loading && (
        <>
          {dancers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💃</div>
              <h3 className="text-xl font-semibold mb-2">No dancers found</h3>
              <p className="text-base-content/60 mb-4">
                {filters.nearMe ? "No dancers in your city yet." :
                 filters.inMyCountry ? "No dancers in your country yet." :
                 "Try adjusting your filters or check back later for new dancers!"}
              </p>
              
              {/* Expand Search Suggestions */}
              {filters.nearMe && (
                <div className="space-y-2">
                  <p className="text-sm text-base-content/50">Try expanding your search:</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setFilters({...filters, nearMe: false, inMyCountry: true})}
                      className="btn btn-outline btn-sm"
                    >
                      🏳️ Search My Country
                    </button>
                    <button
                      onClick={() => setFilters({...filters, nearMe: false, inMyCountry: false})}
                      className="btn btn-outline btn-sm"
                    >
                      🌍 Go Worldwide
                    </button>
                  </div>
                </div>
              )}
              
              {filters.inMyCountry && (
                <div className="space-y-2">
                  <p className="text-sm text-base-content/50">Try expanding your search:</p>
                  <button
                    onClick={() => setFilters({...filters, nearMe: false, inMyCountry: false})}
                    className="btn btn-outline btn-sm"
                  >
                    🌍 Search Worldwide
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-base-content/60">
                  Showing {dancers.length} of {total} dancer{total !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {dancers.map((dancer) => (
                  <DancerCard key={dancer._id} dancer={dancer} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="btn btn-outline btn-wide"
                  >
                    {loadingMore ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Dancers"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
} 