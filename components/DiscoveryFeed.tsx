"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/types/user";
import { DanceStyle } from "@/types/dance-style";
import DancerCard from "./DancerCard";
import DancersMap from "./DancersMap";
import { FaFilter, FaSpinner, FaList, FaMap } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface DiscoveryFeedProps {
  initialDancers?: any[];
  danceStyles?: DanceStyle[];
  showViewAllLink?: boolean;
  isPreview?: boolean; // Hide filters when showing as a preview on dashboard
  initialFilter?: 'nearMe' | 'country' | 'worldwide'; // Initial filter from URL
}

export default function DiscoveryFeed({ initialDancers = [], danceStyles = [], showViewAllLink = false, isPreview = false, initialFilter }: DiscoveryFeedProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  
  // Read URL params for state restoration
  const urlView = searchParams.get('view') as 'list' | 'map' | null;
  const urlFilter = searchParams.get('filter') as 'nearMe' | 'country' | 'worldwide' | null;
  const urlLimit = searchParams.get('limit');
  
  const [dancers, setDancers] = useState(initialDancers);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(urlView || 'list');
  const [loadedCount, setLoadedCount] = useState(initialDancers.length);
  
  // Set initial filter based on URL parameter or default to nearMe
  const getInitialFilters = () => {
    const filterParam = urlFilter || initialFilter;
    if (filterParam === 'country') {
      return { danceStyle: "", danceRole: "", city: "", nearMe: false, inMyCountry: true };
    } else if (filterParam === 'worldwide') {
      return { danceStyle: "", danceRole: "", city: "", nearMe: false, inMyCountry: false };
    }
    return { danceStyle: "", danceRole: "", city: "", nearMe: true, inMyCountry: false };
  };
  
  const [filters, setFilters] = useState(getInitialFilters());
  const [showFilters, setShowFilters] = useState(false);
  
  // Update URL when state changes (only on full page, not preview)
  const updateURL = useCallback((newFilters: typeof filters, newViewMode: 'list' | 'map', limit?: number) => {
    if (isPreview) return; // Don't update URL in preview mode
    
    const params = new URLSearchParams();
    
    // Add filter param
    const filterParam = newFilters.nearMe ? 'nearMe' : newFilters.inMyCountry ? 'country' : 'worldwide';
    params.set('filter', filterParam);
    
    // Add view mode
    params.set('view', newViewMode);
    
    // Add limit (how many loaded) for list view
    if (newViewMode === 'list' && limit && limit > 16) {
      params.set('limit', limit.toString());
    }
    
    // Update URL without navigation (preserves history)
    const newUrl = `/discover?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [isPreview]);

  const fetchDancers = useCallback(async (skip = 0, append = false, targetLimit?: number) => {
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
      
      // 🗺️ For map view, load ALL dancers (no pagination)
      if (viewMode === 'map' && !append) {
        console.log('📍 MAP VIEW: Setting limit to 1000');
        params.append("limit", "1000"); // Get all (max 1000)
        params.append("skip", "0");
      } else if (targetLimit) {
        // Restore state: load up to target limit
        console.log('📄 Restoring pagination:', targetLimit);
        params.append("limit", targetLimit.toString());
        params.append("skip", "0");
      } else {
        console.log('📄 Normal pagination, skip:', skip);
        params.append("skip", skip.toString());
      }
      
      console.log('🔍 Fetch URL:', `/api/dancers/discover?${params.toString()}`);

      const response = await fetch(`/api/dancers/discover?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        
        if (append) {
          const newDancers = [...dancers, ...(data.dancers || [])];
          setDancers(newDancers);
          setLoadedCount(newDancers.length);
        } else {
          setDancers(data.dancers || []);
          setLoadedCount((data.dancers || []).length);
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
  }, [filters, viewMode, dancers]);

  const loadMore = () => {
    fetchDancers(dancers.length, true);
  };

  // Fetch dancers when filters or viewMode change
  useEffect(() => {
    // On mount or filter/view change: restore state from URL if available
    const targetLimit = urlLimit ? parseInt(urlLimit) : undefined;
    
    if (viewMode === 'map') {
      // Map view: fetch ALL dancers (up to 1000)
      console.log('🗺️ Fetching all dancers for map view...');
      fetchDancers(0, false);
    } else if (targetLimit && targetLimit > 16) {
      // List view: Restore pagination state
      fetchDancers(0, false, targetLimit);
    } else {
      // List view: Normal fetch (16 dancers)
      fetchDancers(0, false);
    }
  }, [filters, viewMode]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update URL whenever relevant state changes (not on initial mount)
  useEffect(() => {
    if (dancers.length > 0 && !loading) {
      updateURL(filters, viewMode, loadedCount);
    }
  }, [filters, viewMode, loadedCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFilters = () => {
    setFilters({ danceStyle: "", danceRole: "", city: "", nearMe: false, inMyCountry: false });
  };

  return (
    <div>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{t('discovery.title')}</h2>
            <p className="text-base-content/60 text-sm">
              {filters.nearMe ? t('discovery.dancersInYourCity') : 
               filters.inMyCountry ? t('discovery.dancersInYourCountry') :
               t('discovery.dancersAroundTheWorld')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* View Mode Toggle - Only show on full page (not preview) */}
            {!isPreview && (
              <div className="btn-group">
                <button
                  onClick={() => {
                    setViewMode('list');
                  }}
                  className={`btn btn-sm gap-1 ${viewMode === 'list' ? 'btn-active' : 'btn-outline'}`}
                  title="List View"
                >
                  <FaList />
                  <span>List</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('map');
                  }}
                  className={`btn btn-sm gap-1 ${viewMode === 'map' ? 'btn-active' : 'btn-outline'}`}
                  title="Map View"
                >
                  <FaMap />
                  <span>Map</span>
                </button>
              </div>
            )}
            {showViewAllLink && (
              <a
                href={`/discover?filter=${filters.nearMe ? 'nearMe' : filters.inMyCountry ? 'country' : 'worldwide'}`}
                className="btn btn-primary btn-sm gap-2 hidden sm:flex"
              >
                {t('discovery.viewAll')}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
            {/* More Filters button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-outline btn-sm gap-2 ${isPreview ? 'hidden md:flex' : ''}`}
            >
              <FaFilter />
              <span className="hidden sm:inline">{t('discovery.moreFilters')}</span>
            </button>
          </div>
        </div>

        {/* Location Toggle Buttons - Always show */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              const newFilters = {...filters, nearMe: true, inMyCountry: false};
              setFilters(newFilters);
              updateURL(newFilters, viewMode, 16); // Reset to default pagination
            }}
            className={`btn btn-sm ${filters.nearMe ? 'btn-primary' : 'btn-outline'}`}
          >
            📍 {t('discovery.nearMe')}
          </button>
          <button
            onClick={() => {
              const newFilters = {...filters, nearMe: false, inMyCountry: true};
              setFilters(newFilters);
              updateURL(newFilters, viewMode, 16); // Reset to default pagination
            }}
            className={`btn btn-sm ${filters.inMyCountry ? 'btn-primary' : 'btn-outline'}`}
          >
            🏳️ {t('discovery.myCountry')}
          </button>
          <button
            onClick={() => {
              const newFilters = {...filters, nearMe: false, inMyCountry: false};
              setFilters(newFilters);
              updateURL(newFilters, viewMode, 16); // Reset to default pagination
            }}
            className={`btn btn-sm ${(!filters.nearMe && !filters.inMyCountry) ? 'btn-primary' : 'btn-outline'}`}
          >
            🌍 {t('discovery.worldwide')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="card bg-base-200 p-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Dance Style Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('discovery.danceStyle')}</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.danceStyle}
                onChange={(e) => setFilters({ ...filters, danceStyle: e.target.value })}
              >
                <option value="">{t('discovery.allStyles')}</option>
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
                <span className="label-text">{t('discovery.danceRole')}</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filters.danceRole}
                onChange={(e) => setFilters({ ...filters, danceRole: e.target.value })}
              >
                <option value="">{t('discovery.allRoles')}</option>
                <option value="leader">{t('common.leaders')}</option>
                <option value="follower">{t('common.followers')}</option>
                <option value="both">{t('common.both')}</option>
              </select>
            </div>

            {/* City Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">{t('discovery.city')}</span>
              </label>
              <input
                type="text"
                placeholder={t('discovery.enterCityName')}
                className="input input-bordered input-sm"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filters.danceStyle || filters.danceRole || filters.city) && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">
              {t('discovery.clearAllFilters')}
            </button>
          )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-primary" />
        </div>
      )}

      {/* Dancers Grid */}
      {!loading && (
        <>
          {dancers.length === 0 ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
              <div className="text-6xl mb-4">💃</div>
              <h3 className="text-xl font-semibold mb-2">{t('discovery.noDancersFound')}</h3>
              <p className="text-base-content/60 mb-4">
                {filters.nearMe ? t('discovery.noDancersInCity') :
                 filters.inMyCountry ? t('discovery.noDancersInCountry') :
                 t('discovery.tryAdjustingFilters')}
              </p>
              
              {/* Expand Search Suggestions - Only show if NOT in preview mode */}
              {!isPreview && filters.nearMe && (
                <div className="space-y-2">
                  <p className="text-sm text-base-content/50">{t('discovery.tryExpanding')}</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setFilters({...filters, nearMe: false, inMyCountry: true})}
                      className="btn btn-outline btn-sm"
                    >
                      🏳️ {t('discovery.searchMyCountry')}
                    </button>
                    <button
                      onClick={() => setFilters({...filters, nearMe: false, inMyCountry: false})}
                      className="btn btn-outline btn-sm"
                    >
                      🌍 {t('discovery.goWorldwide')}
                    </button>
                  </div>
                </div>
              )}
              
              {!isPreview && filters.inMyCountry && (
                <div className="space-y-2">
                  <p className="text-sm text-base-content/50">{t('discovery.tryExpanding')}</p>
                  <button
                    onClick={() => setFilters({...filters, nearMe: false, inMyCountry: false})}
                    className="btn btn-outline btn-sm"
                  >
                    🌍 {t('discovery.searchWorldwide')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* View Mode: Map or List */}
              {viewMode === 'map' ? (
                <>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                    <p className="text-sm text-base-content/60">
                      {t('discovery.showing')} {dancers.length} {total !== 1 ? t('search.dancers').toLowerCase() : t('search.dancers').toLowerCase().replace('s', '')}
                    </p>
                  </div>
                  <DancersMap dancers={dancers} />
                </>
              ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-base-content/60">
                        {t('discovery.showing')} {dancers.length} {t('discovery.of')} {total} {total !== 1 ? t('search.dancers').toLowerCase() : t('search.dancers').toLowerCase().replace('s', '')}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {dancers.map((dancer) => (
                        <DancerCard key={dancer._id} dancer={dancer} />
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && !isPreview && (
                      <div className="flex justify-center mt-8">
                        <button
                          onClick={loadMore}
                          disabled={loadingMore}
                          className="btn btn-outline btn-wide"
                        >
                          {loadingMore ? (
                            <>
                              <FaSpinner className="animate-spin" />
                              {t('discovery.loading')}
                            </>
                          ) : (
                            t('discovery.loadMoreDancers')
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* View All Button for Preview Mode - Show regardless of dancers count */}
          {isPreview && showViewAllLink && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center mt-6">
                <a
                  href={`/discover?filter=${filters.nearMe ? 'nearMe' : filters.inMyCountry ? 'country' : 'worldwide'}`}
                  className="btn btn-outline btn-sm md:btn-md"
                >
                  {t('dashboard.viewAllDancers')}
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 