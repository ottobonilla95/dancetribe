"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaMapMarkerAlt, FaSearch, FaEdit } from "react-icons/fa";
import DancerCard from "@/components/DancerCard";
import CitySelector from "@/components/CitySelector";
import { City } from "@/types";

export default function ConnectPage() {
  const { data: session, status } = useSession();
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [userHomeCity, setUserHomeCity] = useState<City | null>(null);
  const [dancers, setDancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isChangingCity, setIsChangingCity] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });
  const [userPreferences, setUserPreferences] = useState({
    openToMeetTravelers: false,
    lookingForPracticePartners: false,
  });

  // Fetch user's profile, home city, active city, and preferences
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          
          // Set home city
          if (data.user.city) {
            setUserHomeCity(data.user.city);
          }
          
          // Set active city (where user currently is) - defaults to home city if not set
          const currentCity = data.user.activeCity || data.user.city;
          if (currentCity) {
            setSelectedCity(currentCity);
          }
          
          // Set preferences
          setUserPreferences({
            openToMeetTravelers: data.user.openToMeetTravelers || false,
            lookingForPracticePartners: data.user.lookingForPracticePartners || false,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const searchDancers = async () => {
    if (!selectedCity) {
      showToast("Please select a city first");
      return;
    }

    if (!userPreferences.openToMeetTravelers && !userPreferences.lookingForPracticePartners) {
      showToast("Please enable at least one option");
      setDancers([]);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const cityId = typeof selectedCity === "string" ? selectedCity : selectedCity.id;
      const allDancers: any[] = [];
      const seenIds = new Set();

      // Search for solo dancers if user has that preference enabled
      if (userPreferences.openToMeetTravelers) {
        const response = await fetch(`/api/connect/search?mode=travelers&cityId=${cityId}`);
        if (response.ok) {
          const data = await response.json();
          data.dancers?.forEach((dancer: any) => {
            if (!seenIds.has(dancer._id)) {
              seenIds.add(dancer._id);
              allDancers.push(dancer);
            }
          });
        }
      }

      // Search for practice partners if user has that preference enabled
      if (userPreferences.lookingForPracticePartners) {
        const response = await fetch(`/api/connect/search?mode=practice&cityId=${cityId}`);
        if (response.ok) {
          const data = await response.json();
          data.dancers?.forEach((dancer: any) => {
            if (!seenIds.has(dancer._id)) {
              seenIds.add(dancer._id);
              allDancers.push(dancer);
            }
          });
        }
      }

      setDancers(allDancers);
    } catch (error) {
      console.error("Error searching dancers:", error);
      showToast("Failed to search dancers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast({ message: "", show: false });
    }, 3000);
  };

  const togglePreference = async (preference: "openToMeetTravelers" | "lookingForPracticePartners") => {
    const newValue = !userPreferences[preference];
    
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [preference]: newValue }),
      });

      if (response.ok) {
        setUserPreferences((prev) => ({
          ...prev,
          [preference]: newValue,
        }));
        
        // Show success notification
        const message = preference === "openToMeetTravelers"
          ? newValue 
            ? "You're now visible to solo dancers! 💃" 
            : "Solo dancers can't see you anymore"
          : newValue
            ? "You're now visible to practice partners! 🤝"
            : "Practice partners can't see you anymore";
        
        showToast(message);
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      showToast("Failed to update preference. Please try again.");
    }
  };

  const updateActiveCity = async (city: City) => {
    try {
      const cityId = typeof city === "string" ? city : city.id;
      
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeCity: cityId }),
      });

      if (response.ok) {
        setSelectedCity(city);
        setIsChangingCity(false);
        showToast(`Location changed to ${city.name}! 📍`);
      }
    } catch (error) {
      console.error("Error updating active city:", error);
      showToast("Failed to update city. Please try again.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Connect with Dancers 🌍
          </h1>
          <p className="text-base-content/70">
            Find solo dancers or practice partners in any city
          </p>
        </div>

        {/* Your Location & Preferences */}
        <div className="bg-base-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-primary" />
            Your Location
          </h3>
          
          {selectedCity ? (
            <>
              {!isChangingCity ? (
                <>
                  <div className="mb-4 p-3 bg-base-100 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-base-content/60 mb-1">Currently in</div>
                        <div className="font-semibold text-lg">
                          {selectedCity.name}, {selectedCity.country?.name || 'Unknown'}
                        </div>
                        {userHomeCity && selectedCity.id === userHomeCity.id && (
                          <div className="badge badge-sm badge-primary mt-1">Home City</div>
                        )}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={() => setIsChangingCity(true)}
                      >
                        <FaEdit />
                        Change
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-base-content/60 mb-3">
                      Select the city where you currently are:
                    </p>
                    <CitySelector
                      selectedCities={[]}
                      onCitiesChange={(cities) => {
                        if (cities.length > 0) {
                          // Take the last city (the newly selected one)
                          updateActiveCity(cities[cities.length - 1]);
                        }
                      }}
                      placeholder="Search for a city (e.g., Bangkok, Berlin)..."
                      label=""
                    />
                    <button
                      className="btn btn-ghost btn-sm mt-2"
                      onClick={() => setIsChangingCity(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              <div className="divider"></div>

              <h4 className="font-semibold mb-4">
                Make yourself discoverable in {selectedCity.name}
              </h4>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-3 bg-base-300 rounded-lg">
                  <div>
                    <span className="font-medium block">Meet solo dancers</span>
                    <p className="text-xs text-base-content/60 mt-1">
                      Connect with solo dancers visiting {selectedCity.name}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={userPreferences.openToMeetTravelers}
                    onChange={() => togglePreference("openToMeetTravelers")}
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 bg-base-300 rounded-lg">
                  <div>
                    <span className="font-medium block">Find practice partners</span>
                    <p className="text-xs text-base-content/60 mt-1">
                      Match with dancers for practice sessions in {selectedCity.name}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={userPreferences.lookingForPracticePartners}
                    onChange={() => togglePreference("lookingForPracticePartners")}
                  />
                </label>
              </div>

              {(userPreferences.openToMeetTravelers || userPreferences.lookingForPracticePartners) && (
                <button
                  className="btn btn-primary w-full mt-6"
                  onClick={searchDancers}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" />
                      Find Dancers in {selectedCity.name}
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="alert alert-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>Please set your home city in your profile first!</span>
            </div>
          )}
        </div>

        {/* Results */}
        {dancers.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-4">
              Found {dancers.length} dancer{dancers.length !== 1 ? "s" : ""}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dancers.map((dancer) => (
                <DancerCard
                  key={dancer._id}
                  dancer={dancer}
                  showLikeButton={true}
                  showFlag={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && hasSearched && dancers.length === 0 && selectedCity && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold mb-2">No dancers found</h3>
            <p className="text-base-content/70 mb-4">
              No dancers matching your criteria in {selectedCity.name} yet.
            </p>
            <p className="text-sm text-base-content/60">
              Try selecting a different city or check back later!
            </p>
          </div>
        )}

        {/* Info about discoverability */}
        {selectedCity && (userPreferences.openToMeetTravelers || userPreferences.lookingForPracticePartners) && (
          <div className="mt-8 text-center">
            <div className="alert alert-success max-w-2xl mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-sm">
                ✨ You&apos;re now discoverable in {selectedCity.name}! Other dancers can find you.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

