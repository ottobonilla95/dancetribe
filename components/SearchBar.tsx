"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { FaSearch, FaTimes, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { SearchUser, SearchResponse } from "@/types/search";

interface SearchBarProps {
  placeholder?: string;
  onUserSelect?: (user: SearchUser) => void;
  className?: string;
  compact?: boolean;
}

export default function SearchBar({
  placeholder = "Find dancers...",
  onUserSelect,
  className = "",
  compact = false
}: SearchBarProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function with debouncing
  const searchUsers = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data: SearchResponse = await response.json();

      if (response.ok) {
        setResults(data.users);
        if (data.users.length === 0 && searchQuery.length >= 2) {
          setError("No dancers found");
        }
      } else {
        setError(data.message || "Search failed");
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Network error");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  const handleUserClick = (user: SearchUser) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
    setQuery("");
    setIsOpen(false);
    setResults([]);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError("");
    inputRef.current?.focus();
  };

  // Don't show search for non-authenticated users
  if (!session) {
    return null;
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-base-content/50" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className={`input input-bordered w-full pl-10 pr-10 ${
            compact ? "input-sm" : ""
          } ${isOpen && results.length > 0 ? "rounded-b-none" : ""}`}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FaTimes className="h-4 w-4 text-base-content/50 hover:text-base-content" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-base-100 border border-base-300 border-t-0 rounded-b-lg shadow-lg z-50 max-h-96 overflow-y-auto min-w-[400px]">
          {isLoading && (
            <div className="p-4 text-center">
              <span className="loading loading-spinner loading-sm"></span>
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 text-center text-base-content/60">
              {error}
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="py-2">
              {results.map((user) => (
                <Link
                  key={user._id}
                  href={`/dancer/${user._id}`}
                  onClick={() => handleUserClick(user)}
                  className="block px-6 py-4 hover:bg-base-200 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="avatar flex-shrink-0">
                      <div className="w-12 h-12 rounded-full">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-base-300 flex items-center justify-center rounded-full">
                            <FaUser className="text-base-content/50" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      {/* Name and Username Row */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-base-content truncate flex-shrink">
                          {user.name}
                        </div>
                        <div className="text-sm text-base-content/60 flex-shrink-0">
                          @{user.username}
                        </div>
                      </div>
                      
                      {/* Location Row */}
                      {user.city && (
                        <div className="flex items-center gap-1 text-sm text-base-content/50 mb-1">
                          <FaMapMarkerAlt className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.city.name}</span>
                        </div>
                      )}
                      
                      {/* Dance Styles Row */}
                      {user.danceStyles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {user.danceStyles.slice(0, 3).map((ds, index) => (
                            <span 
                              key={index}
                              className="badge badge-outline badge-sm"
                            >
                              {ds.name}
                            </span>
                          ))}
                          {user.danceStyles.length > 3 && (
                            <span className="badge badge-ghost badge-sm">
                              +{user.danceStyles.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && !error && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-base-content/60">
              No dancers found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 