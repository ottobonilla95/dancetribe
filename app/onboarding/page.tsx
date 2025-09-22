"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import apiClient from "@/libs/api";
import { User, DanceStyle, City, UserDanceStyle } from "@/types";
import { DANCE_LEVELS } from "@/constants/dance-levels";
import { COUNTRIES } from "@/constants/countries";
import { validateUsername, generateSuggestions } from "@/utils/username";
import CitySelector from "@/components/CitySelector";
import ImageCropPicker from "@/components/ImageCropPicker";
import CurrentLocationPicker from "@/components/CurrentLocationPicker";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function Onboarding() {
  const { update } = useSession();
  const searchParams = useSearchParams();

  // Check if we're in edit mode
  const isEditMode = searchParams.get("mode") === "edit";
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<User>(null);
  const [danceStylesOptions, setDanceStylesOptions] = useState<DanceStyle[]>(
    []
  );

  // Form states
  const [danceStyles, setDanceStyles] = useState<UserDanceStyle[]>([]);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    error: string;
    suggestions: string[];
  }>({
    checking: false,
    available: null,
    error: "",
    suggestions: [],
  });
  const usernameTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [savingStep, setSavingStep] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentLocation, setCurrentLocation] = useState<City | null>(null);
  const [citiesVisited, setCitiesVisited] = useState<City[]>([]);
  const [anthem, setAnthem] = useState({
    url: "",
    platform: "spotify" as "spotify" | "youtube",
    title: "",
    artist: "",
  });
  const [socialMedia, setSocialMedia] = useState({
    instagram: "",
    tiktok: "",
    youtube: "",
  });
  const [danceRole, setDanceRole] = useState<"follower" | "leader" | "both">(
    "both"
  );
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [nationality, setNationality] = useState("");

  const steps: OnboardingStep[] = [
    {
      id: "username",
      title: "Choose your username",
      description: "This will be your unique identifier on DanceTribe",
      completed: user?.onboardingSteps?.username || false,
    },
    {
      id: "profilePic",
      title: "Add a profile picture",
      description: "Help other dancers recognize you",
      completed: user?.onboardingSteps?.profilePic || false,
    },
    {
      id: "dateOfBirth",
      title: "When's your birthday?",
      description: "We'll use this to calculate your zodiac sign",
      completed: user?.onboardingSteps?.dateOfBirth || false,
    },
    {
      id: "gender",
      title: "What's your gender?",
      description: "Help other dancers connect with you",
      completed: user?.onboardingSteps?.gender || false,
    },
    {
      id: "nationality",
      title: "What's your nationality?",
      description: "Share your cultural background",
      completed: user?.onboardingSteps?.nationality || false,
    },
    {
      id: "danceStyles",
      title: "What do you love to dance?",
      description: "Select your favorite dance styles",
      completed: user?.onboardingSteps?.danceStyles || false,
    },
    {
      id: "danceRole",
      title: "What's your dance role?",
      description: "Do you prefer to lead, follow, or both?",
      completed: user?.onboardingSteps?.danceRole || false,
    },
    {
      id: "currentLocation",
      title: "Where do you live?",
      description: "Find dancers in your area",
      completed: user?.onboardingSteps?.currentLocation || false,
    },
    {
      id: "citiesVisited",
      title: "Where have you danced?",
      description: "Share your dance travel experiences",
      completed: user?.onboardingSteps?.citiesVisited || false,
    },
    {
      id: "anthem",
      title: "What's your dance anthem?",
      description: "Share a song that gets you moving",
      completed: user?.onboardingSteps?.anthem || false,
    },
    {
      id: "socialMedia",
      title: "Connect your socials",
      description: "Let other dancers find you online",
      completed: user?.onboardingSteps?.socialMedia || false,
    },
  ];

  // Username validation and checking

  const checkUsernameAvailability = async (value: string) => {
    const validationError = validateUsername(value);
    if (validationError) {
      setUsernameStatus({
        checking: false,
        available: false,
        error: validationError,
        suggestions: generateSuggestions(user?.name || ""),
      });
      return;
    }

    setUsernameStatus((prev) => ({ ...prev, checking: true, error: "" }));

    try {
      const response = await fetch("/api/user/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });

      const data = await response.json();

      setUsernameStatus({
        checking: false,
        available: data.available,
        error: data.available ? "" : "Username is already taken",
        suggestions: data.available
          ? []
          : generateSuggestions(user?.name || ""),
      });
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: false,
        error: "Error checking username availability",
        suggestions: generateSuggestions(user?.name || ""),
      });
    }
  };

  const handleUsernameChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(cleanValue);

    // Clear previous timeout
    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    // Debounce the availability check
    usernameTimeoutRef.current = setTimeout(() => {
      if (cleanValue) {
        checkUsernameAvailability(cleanValue);
      } else {
        setUsernameStatus({
          checking: false,
          available: null,
          error: "",
          suggestions: [],
        });
      }
    }, 500);
  };

  const fetchUserProfile = async () => {
    try {
      const data = (await apiClient.get("/user/profile")) as { user: User };
      const userData = data.user;
      setUser(userData);

      // Redirect completed users to dashboard (unless in edit mode)
      if (userData.isProfileComplete && !isEditMode) {
        console.log("🚀 Redirecting to dashboard...");
        window.location.href = "/dashboard";
        return;
      }

      // Pre-fill form with existing data
      if (userData.danceStyles?.length > 0) {
        // Normalize dance styles to ensure danceStyle field contains ID, not populated object
        const normalizedDanceStyles = userData.danceStyles.map(
          (userStyle: any) => ({
            danceStyle:
              typeof userStyle.danceStyle === "string"
                ? userStyle.danceStyle
                : userStyle.danceStyle?._id || userStyle.danceStyle?.id,
            level: userStyle.level,
          })
        );
        setDanceStyles(normalizedDanceStyles);
      }
      if (userData.username) {
        setUsername(userData.username);
        setUsernameStatus({
          checking: false,
          available: true,
          error: "",
          suggestions: [],
        });
      }
      if (userData.dateOfBirth) {
        setDateOfBirth(
          new Date(userData.dateOfBirth).toISOString().split("T")[0]
        );
      }
      // Handle current location - ensure it's a valid city object
      if (
        userData.city &&
        typeof userData.city === "object" &&
        (userData.city._id || (userData.city as any).id)
      ) {
        setCurrentLocation(userData.city as City);
      }

      // Handle cities visited - filter out null/invalid entries
      if (userData.citiesVisited?.length > 0) {
        const validCities = userData.citiesVisited.filter(
          (city): city is City =>
            city !== null &&
            typeof city === "object" &&
            !!(city._id || (city as any).id) &&
            !!city.name
        );
        setCitiesVisited(validCities);
      }
      if (userData.anthem) {
        setAnthem({
          url: userData.anthem.url,
          platform: userData.anthem.platform,
          title: userData.anthem.title || "",
          artist: userData.anthem.artist || "",
        });
      }
      if (userData.socialMedia) {
        setSocialMedia({
          instagram: userData.socialMedia.instagram || "",
          tiktok: userData.socialMedia.tiktok || "",
          youtube: userData.socialMedia.youtube || "",
        });
      }
      if (userData.danceRole) {
        setDanceRole(userData.danceRole);
      }
      if (userData.gender) {
        setGender(userData.gender);
      }
      if (userData.nationality) {
        setNationality(userData.nationality);
      }

      // Find the current step based on completion
      if (isEditMode) {
        // In edit mode, always start from the first step
        setCurrentStep(0);
      } else {
        // In onboarding mode, find the first incomplete step
        try {
          const incompleteStepIndex = steps.findIndex(
            (step) =>
              !userData.onboardingSteps?.[
                step.id as keyof typeof userData.onboardingSteps
              ]
          );
          setCurrentStep(
            incompleteStepIndex !== -1 ? incompleteStepIndex : steps.length - 1
          );
        } catch (stepError) {
          console.error("Error finding current step:", stepError);
          // Default to first step if there's an error
          setCurrentStep(0);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    }
  };

  const fetchDanceStyles = async () => {
    try {
      const data = (await apiClient.get("/dance-styles")) as {
        danceStyles: DanceStyle[];
      };
      setDanceStylesOptions(data.danceStyles);
    } catch (error) {
      console.error("Error fetching dance styles:", error);
    }
  };

  const handleNext = async () => {
    const step = steps[currentStep];
    let stepData: any = {};

    switch (step.id) {
      case "danceStyles":
        if (danceStyles.length === 0) {
          alert("Please select at least one dance style");
          return;
        }
        stepData = { danceStyles };
        break;
      case "username":
        if (!username) {
          alert("Please choose a username");
          return;
        }
        if (!usernameStatus.available) {
          alert("Please choose an available username");
          return;
        }
        stepData = { username };
        break;
      case "profilePic":
        // Profile pic is optional, but if they selected one, upload it
        if (profilePic) {
          try {
            const imageUrl = await uploadProfilePic(profilePic);
            stepData = { image: imageUrl };
          } catch (error) {
            console.error("Error uploading profile pic:", error);
            alert("Error uploading your profile picture. Please try again.");
            return;
          }
        } else {
          // No photo selected, that's okay - just continue
          stepData = { image: user?.image || null };
        }
        break;
      case "dateOfBirth":
        if (!dateOfBirth) {
          alert("Please enter your date of birth");
          return;
        }
        stepData = { dateOfBirth };
        break;
      case "currentLocation": {
        if (!currentLocation) {
          alert("Please select your current city");
          return;
        }
        // Handle both populated objects and ID strings
        const cityId =
          typeof currentLocation === "string"
            ? currentLocation
            : currentLocation._id || (currentLocation as any).id;
        stepData = { city: cityId };
        break;
      }
      case "citiesVisited": {
        // Handle both populated objects and ID strings
        const cityIds = citiesVisited.map((city) =>
          typeof city === "string" ? city : city._id || (city as any).id
        );
        stepData = { citiesVisited: cityIds };
        break;
      }
      case "anthem": {
        if (!anthem.url) {
          alert("Please enter your anthem URL");
          return;
        }
        const parsedMedia = parseMediaUrl(anthem.url);
        if (!parsedMedia) {
          alert("Please enter a valid Spotify or YouTube URL");
          return;
        }
        stepData = { anthem };
        break;
      }
      case "socialMedia":
        stepData = { socialMedia };
        break;
      case "danceRole":
        stepData = { danceRole };
        break;
      case "gender":
        if (!gender) {
          alert("Please select your gender");
          return;
        }
        stepData = { gender };
        break;
      case "nationality":
        if (!nationality) {
          alert("Please select your nationality");
          return;
        }
        stepData = { nationality };
        break;
      default:
        console.error("Unknown step:", step.id);
        return;
    }

    try {
      // Set saving state
      setSavingStep(true);

      // Set completing state if this is the last step
      if (currentStep === steps.length - 1) {
        setCompleting(true);
      }

      const response = await apiClient.put("/user/profile", {
        step: step.id,
        data: stepData,
      });

      console.log("🔍 API Response:", response);

      // Check if profile was just completed
      if (response.data?.profileCompleted) {
        console.log(
          "🎉 Profile completed! Updating session and redirecting..."
        );

        try {
          // Update the session to reflect profile completion
          await update();
          console.log("✅ Session updated successfully");
        } catch (sessionError) {
          console.error("❌ Failed to update session:", sessionError);
        }

        // Redirect to dashboard
        window.location.href = "/dashboard";
        return;
      }

      // Move to next step or complete onboarding
      if (currentStep < steps.length - 1) {
        console.log("📍 Moving to next step:", currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        if (isEditMode) {
          console.log("🎉 Profile updated! Redirecting to profile...");
          window.location.href = "/profile";
        } else {
          console.log("🎉 Onboarding complete! Redirecting to dashboard...");
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error saving your information. Please try again.");
    } finally {
      // Always reset states in finally block
      setSavingStep(false);
      setCompleting(false);
    }
  };

  // Helper functions for dance styles with levels
  const addDanceStyle = (styleId: string) => {
    const existingStyle = danceStyles.find((ds) => ds.danceStyle === styleId);
    if (!existingStyle) {
      setDanceStyles((prev) => [
        ...prev,
        { danceStyle: styleId, level: "beginner" as UserDanceStyle["level"] },
      ]);
    }
  };

  const removeDanceStyle = (styleId: string) => {
    setDanceStyles((prev) => prev.filter((ds) => ds.danceStyle !== styleId));
  };

  const updateDanceStyleLevel = (styleId: string, level: string) => {
    setDanceStyles((prev) =>
      prev.map((ds) =>
        ds.danceStyle === styleId
          ? { ...ds, level: level as UserDanceStyle["level"] }
          : ds
      )
    );
  };

  const isDanceStyleSelected = (styleId: string) => {
    return danceStyles.some((ds) => ds.danceStyle === styleId);
  };

  const getStyleNameById = (styleId: string) => {
    const style = danceStylesOptions.find((s) => (s._id || s.id) === styleId);
    return style?.name || "Unknown Style";
  };

  const uploadProfilePic = async (file: File): Promise<string> => {
    setUploadingProfilePic(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("/api/upload-profile-pic", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { imageUrl } = await response.json();
      return imageUrl;
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Function to extract platform and IDs from URL
  const parseMediaUrl = (url: string) => {
    if (!url) return null;

    // Spotify URL patterns
    const spotifyMatch = url.match(
      /(?:spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/
    );
    if (spotifyMatch) {
      return {
        platform: "spotify" as const,
        id: spotifyMatch[1],
        embedUrl: `https://open.spotify.com/embed/track/${spotifyMatch[1]}`,
      };
    }

    // YouTube URL patterns
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (youtubeMatch) {
      return {
        platform: "youtube" as const,
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      };
    }

    return null;
  };

  const mediaInfo = parseMediaUrl(anthem.url);

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchDanceStyles();
  }, []);

  // Add a refresh function for testing
  const refreshUserData = async () => {
    setLoading(true);
    await fetchUserProfile();
  };

  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {isEditMode ? "Edit Your Profile" : "Complete Your Profile"}
            </h1>
            <span className="text-sm text-base-content/70">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={currentStep + 1}
            max={steps.length}
          ></progress>
        </div>

        {/* Step Content */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-base-content/70 mb-6">
              {steps[currentStep].description}
            </p>

            {/* Dance Styles */}
            {steps[currentStep].id === "danceStyles" && (
              <div className="form-control space-y-6">
                <label className="label">
                  <span className="label-text">
                    Select your dance styles and skill levels
                  </span>
                </label>

                {/* Dance Style Selection */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {danceStylesOptions.map((style) => (
                    <div
                      key={style._id}
                      className={`cursor-pointer flex-col gap-2 rounded-lg p-4 border transition-colors text-center ${
                        isDanceStyleSelected(style._id || style.id)
                          ? "bg-primary text-primary-content border-primary shadow-lg"
                          : "bg-base-100 border-base-300 hover:bg-base-200"
                      }`}
                      onClick={() => {
                        if (isDanceStyleSelected(style._id || style.id)) {
                          removeDanceStyle(style._id || style.id);
                        } else {
                          addDanceStyle(style._id || style.id);
                        }
                      }}
                    >
                      <span className="font-medium">{style.name}</span>
                    </div>
                  ))}
                </div>

                {/* Level Selection for Selected Styles */}
                {danceStyles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-base-content">
                      Set your skill levels:
                    </h3>
                    {danceStyles.map((userStyle) => (
                      <div
                        key={userStyle.danceStyle}
                        className="bg-base-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">
                            {getStyleNameById(userStyle.danceStyle)}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() =>
                              removeDanceStyle(userStyle.danceStyle)
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {DANCE_LEVELS.map((level) => (
                            <label
                              key={level.value}
                              className={`label cursor-pointer flex-col gap-1 rounded-lg p-2 border transition-colors ${
                                userStyle.level === level.value
                                  ? "bg-primary text-primary-content border-primary"
                                  : "bg-base-100 border-base-300 hover:bg-base-200"
                              }`}
                            >
                              <span className="text-lg">{level.emoji}</span>
                              <span className="text-xs text-center">
                                {level.label}
                              </span>
                              <input
                                type="radio"
                                name={`level-${userStyle.danceStyle}`}
                                className="radio radio-primary radio-xs"
                                checked={userStyle.level === level.value}
                                onChange={() =>
                                  updateDanceStyleLevel(
                                    userStyle.danceStyle,
                                    level.value
                                  )
                                }
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {danceStyles.length === 0 && (
                  <div className="text-center text-base-content/60 py-4">
                    Select at least one dance style to continue
                  </div>
                )}
              </div>
            )}

            {/* Username */}
            {steps[currentStep].id === "username" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Choose your username</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`input input-bordered w-full ${
                      usernameStatus.error
                        ? "input-error"
                        : usernameStatus.available === true
                          ? "input-success"
                          : ""
                    }`}
                    placeholder="e.g., sarah_dancer"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {usernameStatus.checking && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                    {!usernameStatus.checking &&
                      usernameStatus.available === true && (
                        <span className="text-success">✓</span>
                      )}
                    {!usernameStatus.checking &&
                      usernameStatus.available === false && (
                        <span className="text-error">✗</span>
                      )}
                  </div>
                </div>

                {/* Error message */}
                {usernameStatus.error && (
                  <div className="label">
                    <span className="label-text-alt text-error">
                      {usernameStatus.error}
                    </span>
                  </div>
                )}

                {/* Success message */}
                {usernameStatus.available === true && !usernameStatus.error && (
                  <div className="label">
                    <span className="label-text-alt text-success">
                      Username is available!
                    </span>
                  </div>
                )}

                {/* Suggestions */}
                {usernameStatus.suggestions.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-base-content/70">
                      Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {usernameStatus.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setUsername(suggestion);
                            checkUsernameAvailability(suggestion);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="label">
                  <span className="label-text-alt">
                    Your profile will be available at: DanceTribe.co/
                    {username || "username"}
                  </span>
                </div>
              </div>
            )}

            {/* Profile Picture */}
            {steps[currentStep].id === "profilePic" && (
              <ImageCropPicker
                onImageSelect={setProfilePic}
                currentImage={user?.image}
                uploading={uploadingProfilePic}
              />
            )}

            {steps[currentStep].id === "dateOfBirth" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date of Birth</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
            )}

            {steps[currentStep].id === "currentLocation" && (
              <CurrentLocationPicker
                selectedCity={currentLocation}
                onCitySelect={setCurrentLocation}
                label="Where do you currently live?"
                placeholder="Search for your current city..."
              />
            )}

            {steps[currentStep].id === "citiesVisited" && (
              <CitySelector
                selectedCities={citiesVisited}
                onCitiesChange={setCitiesVisited}
                placeholder="Search for cities where you've danced..."
                label="Cities you've danced in (optional)"
              />
            )}

            {/* Rest of the existing form steps remain the same... */}
            {/* I'll continue with the rest but keeping it shorter for readability */}

            {steps[currentStep].id === "anthem" && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Song URL</span>
                  </label>
                  <input
                    type="url"
                    className="input input-bordered"
                    placeholder="Paste your Spotify or YouTube link here..."
                    value={anthem.url}
                    onChange={(e) => {
                      const url = e.target.value;
                      const parsedInfo = parseMediaUrl(url);

                      setAnthem((prev) => ({
                        ...prev,
                        url,
                        platform: parsedInfo?.platform || "spotify",
                        title: prev.title,
                        artist: prev.artist,
                      }));
                    }}
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Examples:
                      <br />
                      🎵 Spotify: https://open.spotify.com/track/...
                      <br />
                      📺 YouTube: https://www.youtube.com/watch?v=...
                    </span>
                  </label>
                </div>

                {!mediaInfo && anthem.url && (
                  <div className="alert alert-warning">
                    <span>Please enter a valid Spotify or YouTube URL</span>
                  </div>
                )}

                {mediaInfo && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-primary capitalize">
                        {mediaInfo.platform}
                      </span>
                      <span className="text-sm text-base-content/70">
                        Preview your anthem below
                      </span>
                    </div>
                    <div className="flex justify-center mt-4">
                      <iframe
                        src={mediaInfo.embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        className="rounded-2xl"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            )}

            {steps[currentStep].id === "socialMedia" && (
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Instagram (optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="@username or profile URL"
                    value={socialMedia.instagram}
                    onChange={(e) =>
                      setSocialMedia((prev) => ({
                        ...prev,
                        instagram: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">TikTok (optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="@username or profile URL"
                    value={socialMedia.tiktok}
                    onChange={(e) =>
                      setSocialMedia((prev) => ({
                        ...prev,
                        tiktok: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">YouTube (optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Channel URL"
                    value={socialMedia.youtube}
                    onChange={(e) =>
                      setSocialMedia((prev) => ({
                        ...prev,
                        youtube: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {steps[currentStep].id === "danceRole" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    What&apos;s your dance role?
                  </span>
                </label>
                <div className="flex flex-col gap-3">
                  {["leader", "follower", "both"].map((role) => (
                    <label key={role} className="label cursor-pointer">
                      <span className="label-text capitalize">{role}</span>
                      <input
                        type="radio"
                        name="danceRole"
                        className="radio radio-primary"
                        checked={danceRole === role}
                        onChange={() =>
                          setDanceRole(role as "follower" | "leader" | "both")
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Gender */}
            {steps[currentStep].id === "gender" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">What&apos;s your gender?</span>
                </label>
                <div className="flex flex-col gap-3">
                  {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ].map((option) => (
                    <label key={option.value} className="label cursor-pointer">
                      <span className="label-text">{option.label}</span>
                      <input
                        type="radio"
                        name="gender"
                        className="radio radio-primary"
                        checked={gender === option.value}
                        onChange={() =>
                          setGender(option.value as "male" | "female" | "other")
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Nationality */}
            {steps[currentStep].id === "nationality" && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    What&apos;s your nationality?
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                >
                  <option value="">Select your country...</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Navigation */}
            <div className="card-actions justify-between mt-8">
              <button
                className="btn btn-outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={
                  uploadingProfilePic ||
                  completing ||
                  savingStep ||
                  (steps[currentStep].id === "username" &&
                    usernameStatus.checking)
                }
              >
                {uploadingProfilePic ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Uploading...
                  </>
                ) : savingStep ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : completing ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Completing...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  isEditMode ? (
                    "Save Changes"
                  ) : (
                    "Complete"
                  )
                ) : (
                  "Next"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
