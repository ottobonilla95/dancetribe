import React, { useState } from "react";
import { City } from "@/types";
import CityDropdown from "./CityDropdown";
import { useTranslation } from "./I18nProvider";

interface CurrentLocationPickerProps {
  selectedCity: City | null;
  onCitySelect: (city: City | null) => void;
  label?: string;
  placeholder?: string;
}

export default function CurrentLocationPicker({
  selectedCity,
  onCitySelect,
  label = "Where do you live?",
  placeholder = "Search for your current city...",
}: CurrentLocationPickerProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const handleCitySelect = (city: City) => {
    onCitySelect(city);
  };

  const handleRemoveCity = () => {
    onCitySelect(null);
  };

  // Mock dancer count - in real app this would come from the city data or a separate API
  const getDancerCount = (city: City) => {
    // For demo purposes, generate a count based on city population
    if (city.population) {
      return Math.floor(city.population / 50000); // Rough estimate
    }
    return 0;
  };

  const getDancerMessage = (count: number) => {
    if (count >= 30) {
      return t('onboarding.dancersInArea').replace('{count}', String(count));
    }
    return t('onboarding.growingCommunity');
  };

  return (
    <div className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>

        {!selectedCity ? (
          <CityDropdown
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCitySelect={handleCitySelect}
            placeholder={placeholder}
            selectedCities={[]}
          />
        ) : (
          <div className="space-y-4">
            {/* Selected City Display */}
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-start gap-4">
                  {/* City Image */}
                  <div className="avatar">
                    <div className="w-16 h-16 rounded-lg">
                      {selectedCity.image ? (
                        <img
                          src={selectedCity.image}
                          alt={selectedCity.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="bg-primary text-primary-content rounded-lg w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🏙️</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* City Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{selectedCity.name}</h3>
                    <p className="text-base-content/70 text-sm">
                      {typeof selectedCity.country === "string"
                        ? selectedCity.country
                        : selectedCity.country?.name}
                    </p>

                    {/* Dancer Count */}
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">💃</span>
                        <span className="text-sm font-medium text-primary">
                          {getDancerMessage(getDancerCount(selectedCity))}
                        </span>
                      </div>
                    </div>

                    {/* Population (optional additional info) */}
                    {selectedCity.population && (
                      <p className="text-xs text-base-content/50 mt-1">
                        {t('onboarding.population')}: {selectedCity.population.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={handleRemoveCity}
                    title={t('onboarding.changeLocation')}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Change City Option */}
            <div className="text-center">
              <button
                className="btn btn-outline btn-sm"
                onClick={handleRemoveCity}
              >
                📍 {t('onboarding.changeLocation')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
