"use client";

import { useState } from "react";
import Link from "next/link";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface Dancer {
  _id: string;
  name: string;
  username?: string;
  image?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const dancersPerPage = 24;

  // Filter dancers based on user's dance styles
  const filteredDancers = dancers.filter((dancer) => {
    if (!showMyStyles || !userDanceStyles || userDanceStyles.length === 0) {
      return true; // Show all if filter is off
    }

    const dancerStyleIds = dancer.danceStyles.map((ds) => ds.danceStyle._id.toString());
    return dancerStyleIds.some((id) => userDanceStyles.includes(id));
  });

  // Reset to page 1 when filter changes
  const toggleFilter = () => {
    setShowMyStyles(!showMyStyles);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredDancers.length / dancersPerPage);
  const startIndex = (currentPage - 1) * dancersPerPage;
  const endIndex = startIndex + dancersPerPage;
  const paginatedDancers = filteredDancers.slice(startIndex, endIndex);

  return (
    <div>
      {/* Filter Toggle */}
      {userDanceStyles && userDanceStyles.length > 0 && (
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showMyStyles}
              onChange={toggleFilter}
              className="toggle toggle-primary"
            />
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="font-medium">{t('filters.showMyDancers')}</span>
            </div>
          </label>
          
          {showMyStyles && (
            <div className="text-sm text-base-content/60 mt-2">
              {t('filters.found')} {filteredDancers.length} {t('filters.of')} {dancers.length} {t('filters.dancers')}
            </div>
          )}
        </div>
      )}

      {/* Dancers Grid */}
      {filteredDancers.length > 0 ? (
        <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {paginatedDancers.map((dancer) => (
            <Link
              key={dancer._id}
              href={`/dancer/${dancer._id}`}
              className="group"
            >
              <div className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <div className="card-body p-3">
                  <div className="flex flex-col items-center text-center">
                    <div className="avatar mb-2">
                      <div className="w-12 h-12 rounded-full">
                        {dancer.image ? (
                          <img
                            src={dancer.image}
                            alt={dancer.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="bg-primary text-primary-content rounded-full w-full h-full flex items-center justify-center">
                            <span className="text-sm">
                              {dancer.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium text-sm truncate w-full">
                      {dancer.name}
                    </h3>
                    {dancer.username && (
                      <p className="text-xs text-base-content/60 truncate w-full">
                        @{dancer.username}
                      </p>
                    )}
                    {dancer.danceStyles && dancer.danceStyles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 justify-center">
                        {dancer.danceStyles
                          .slice(0, 2)
                          .map((ds, index) => (
                            <span
                              key={index}
                              className="badge badge-xs badge-outline"
                            >
                              {ds.danceStyle?.name}
                            </span>
                          ))}
                        {dancer.danceStyles.length > 2 && (
                          <span className="badge badge-xs badge-outline">
                            +{dancer.danceStyles.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
            onClick={toggleFilter}
            className="btn btn-outline btn-sm mt-4"
          >
            Show All Dancers
          </button>
        </div>
      )}
    </div>
  );
}

