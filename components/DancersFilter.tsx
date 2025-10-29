"use client";

import { useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";
import DancerCard from "./DancerCard";

interface Dancer {
  _id: string;
  name: string;
  username?: string;
  image?: string;
  city?: any;
  dateOfBirth?: string;
  hideAge?: boolean;
  nationality?: string;
  dancingStartYear?: number;
  danceRole?: "follower" | "leader" | "both";
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  likedBy?: string[];
  openToMeetTravelers?: boolean;
  lookingForPracticePartners?: boolean;
  isTeacher?: boolean;
  isDJ?: boolean;
  isPhotographer?: boolean;
  jackAndJillCompetitions?: Array<{
    placement: string;
    year: number;
  }>;
  danceStyles: Array<{
    danceStyle: {
      _id: string;
      name: string;
    };
  }>;
}

interface DancersFilterProps {
  dancers: Dancer[];
  userDanceStyles?: string[]; // IDs of user's dance styles
  locationName: string; // Can be city, country, or continent name
}

export default function DancersFilter({
  dancers,
  userDanceStyles,
  locationName,
}: DancersFilterProps) {
  const { t } = useTranslation();
  const [showMyStyles, setShowMyStyles] = useState(false);
  const [showOnlyTeachers, setShowOnlyTeachers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dancersPerPage = 24;

  // Filter dancers based on multiple criteria
  const filteredDancers = dancers.filter((dancer) => {
    // Dance styles filter
    if (showMyStyles && userDanceStyles && userDanceStyles.length > 0) {
      const dancerStyleIds = dancer.danceStyles.map((ds) => ds.danceStyle._id.toString());
      const hasMatchingStyle = dancerStyleIds.some((id) => userDanceStyles.includes(id));
      if (!hasMatchingStyle) return false;
    }

    // Teachers filter
    if (showOnlyTeachers && !dancer.isTeacher) {
      return false;
    }

    return true;
  });

  // Reset to page 1 when any filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setShowMyStyles(false);
    setShowOnlyTeachers(false);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredDancers.length / dancersPerPage);
  const startIndex = (currentPage - 1) * dancersPerPage;
  const endIndex = startIndex + dancersPerPage;
  const paginatedDancers = filteredDancers.slice(startIndex, endIndex);

  return (
    <div>
      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        {/* Dance Styles Filter */}
        {userDanceStyles && userDanceStyles.length > 0 && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showMyStyles}
              onChange={() => {
                setShowMyStyles(!showMyStyles);
                handleFilterChange();
              }}
              className="toggle toggle-primary"
            />
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="font-medium">{t('filters.showMyDancers')}</span>
            </div>
          </label>
        )}

        {/* Teachers Filter */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyTeachers}
            onChange={() => {
              setShowOnlyTeachers(!showOnlyTeachers);
              handleFilterChange();
            }}
            className="toggle toggle-primary"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <span className="font-medium">Teachers Only</span>
          </div>
        </label>

        {/* Results Count */}
        {(showMyStyles || showOnlyTeachers) && (
          <div className="text-sm text-base-content/60">
            {t('filters.found')} <span className="font-bold text-primary">{filteredDancers.length}</span> {t('filters.of')} {dancers.length} {t('filters.dancers')}
          </div>
        )}
      </div>

      {/* Dancers Grid - Using DancerCard for better UI */}
      {filteredDancers.length > 0 ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {paginatedDancers.map((dancer) => {
            // Transform dancer data to include danceStylesPopulated
            const transformedDancer = {
              ...dancer,
              danceStylesPopulated: dancer.danceStyles.map(ds => ({
                name: ds.danceStyle.name,
                _id: ds.danceStyle._id,
              })),
            };
            
            return (
              <DancerCard
                key={dancer._id}
                dancer={transformedDancer as any}
                showLikeButton={true}
                showFlag={true}
              />
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-outline"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn btn-sm ${
                      currentPage === pageNum ? 'btn-primary' : 'btn-outline'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-outline"
            >
              Next
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="text-center py-12 text-base-content/60">
          <FaFilter className="mx-auto text-4xl mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No dancers found</p>
          <p className="text-sm">
            No dancers in {locationName} match your dance styles
          </p>
          <button
            onClick={clearAllFilters}
            className="btn btn-outline btn-sm mt-4"
          >
            Show All Dancers
          </button>
        </div>
      )}
    </div>
  );
}

