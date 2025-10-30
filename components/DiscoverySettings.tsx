"use client";

import { useState } from "react";
import { FaMapMarkerAlt, FaHandshake } from "react-icons/fa";
import CitySelector from "@/components/CitySelector";
import { City } from "@/types";
import { useTranslation } from "@/components/I18nProvider";

interface DiscoverySettingsProps {
  initialActiveCity?: any;
  initialTravelMode?: boolean;
  initialOpenToPractice?: boolean;
}

export default function DiscoverySettings({
  initialActiveCity,
  initialTravelMode = false,
  initialOpenToPractice = false,
}: DiscoverySettingsProps) {
  const { t } = useTranslation();
  const [activeCity, setActiveCity] = useState<City | null>(initialActiveCity || null);
  const [travelMode, setTravelMode] = useState(initialTravelMode);
  const [openToPractice, setOpenToPractice] = useState(initialOpenToPractice);
  const [showCitySelector, setShowCitySelector] = useState(false);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        if (key === "openToMeetTravelers") {
          setTravelMode(value);
        } else if (key === "lookingForPracticePartners") {
          setOpenToPractice(value);
        }
      }
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  const handleCitySelect = async (cities: City[]) => {
    // CitySelector adds to array, so get the last selected city
    const city = cities[cities.length - 1];
    if (!city) return;
    
    try {
      const cityId = city._id || city.id;
      
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeCity: cityId }),
      });

      if (response.ok) {
        setActiveCity(city);
        setShowCitySelector(false);
      }
    } catch (error) {
      console.error("Error updating city:", error);
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-8">
      <h3 className="font-bold text-base mb-3 flex items-center gap-2">
        <FaMapMarkerAlt className="text-primary" />
        {t('dashboard.discoverySettings')}
      </h3>

      <div className="space-y-3">
        {/* Travel Mode */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm mt-0.5"
            checked={travelMode}
            onChange={(e) => {
              updatePreference("openToMeetTravelers", e.target.checked);
              // Close city selector when disabling
              if (!e.target.checked) {
                setShowCitySelector(false);
              }
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm transition-opacity ${!travelMode ? 'opacity-40' : ''}`}>
                  {t('dashboard.travelMode')}
                </p>
                <p className={`text-xs text-base-content/60 truncate transition-opacity ${!travelMode ? 'opacity-40' : ''}`}>
                  {activeCity?.name || "..."}
                </p>
              </div>
              <button
                onClick={() => setShowCitySelector(!showCitySelector)}
                className={`btn btn-xs btn-ghost gap-1 shrink-0 transition-opacity ${!travelMode ? 'opacity-40' : ''}`}
                disabled={!travelMode}
              >
                <FaMapMarkerAlt className="text-xs" />
                {t('dashboard.changeCity')}
              </button>
            </div>

            {/* City Selector */}
            {showCitySelector && travelMode && (
              <div className="mt-3 p-3 bg-base-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium">
                    {t('dashboard.selectYourCity')}
                  </p>
                  <button
                    onClick={() => setShowCitySelector(false)}
                    className="btn btn-xs btn-ghost"
                  >
                    {t('dashboard.cancel')}
                  </button>
                </div>
                <CitySelector
                  selectedCities={[]}
                  onCitiesChange={handleCitySelect}
                  placeholder={t('dashboard.searchCity')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Open to Practice */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm mt-0.5"
            checked={openToPractice}
            onChange={(e) => updatePreference("lookingForPracticePartners", e.target.checked)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className={`font-medium text-sm transition-opacity ${!openToPractice ? 'opacity-40' : ''}`}>
                {t('dashboard.openToPractice')}
              </p>
              <FaHandshake className={`text-sm text-primary transition-opacity ${!openToPractice ? 'opacity-40' : ''}`} />
            </div>
            <p className={`text-xs text-base-content/60 mt-0.5 transition-opacity ${!openToPractice ? 'opacity-40' : ''}`}>
              {t('dashboard.openToPracticeDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

