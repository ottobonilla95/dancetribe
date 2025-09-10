"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/libs/api";
import { User, DanceStyle, City } from "@/types";
import CitySelector from "@/components/CitySelector";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function Onboarding() {
  const router = useRouter();
  //   const { data: status } = useSession();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState<User>(null);
  const [danceStylesOptions, setDanceStylesOptions] = useState<DanceStyle[]>(
    []
  );

  // Form states
  const [danceStyles, setDanceStyles] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
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

  const steps: OnboardingStep[] = [
    {
      id: "danceStyles",
      title: "What dance styles do you love?",
      description: "Select all the dance styles you practice or want to learn",
      completed: user?.onboardingSteps?.danceStyles || false,
    },
    {
      id: "profilePic",
      title: "Add your profile picture",
      description: "Help other dancers recognize you in the community (optional)",
      completed: user?.onboardingSteps?.profilePic || false,
    },
    {
      id: "dateOfBirth",
      title: "When's your birthday?",
      description: "Help us connect you with dancers in your age group",
      completed: user?.onboardingSteps?.dateOfBirth || false,
    },
    {
      id: "citiesVisited",
      title: "Where have you danced?",
      description: "Tell us about the cities where you've experienced dance",
      completed: user?.onboardingSteps?.citiesVisited || false,
    },
    {
      id: "anthem",
      title: "What's your dance anthem?",
      description: "Share a Spotify track or YouTube video that gets you moving",
      completed: user?.onboardingSteps?.anthem || false,
    },
    {
      id: "socialMedia",
      title: "Connect your socials",
      description: "Let other dancers find you (optional)",
      completed: user?.onboardingSteps?.socialMedia || false,
    },
    {
      id: "danceRole",
      title: "How do you like to dance?",
      description: "Are you a follower, leader, or both?",
      completed: user?.onboardingSteps?.danceRole || false,
    },
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchDanceStyles();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = (await apiClient.get("/user/profile")) as { user: User };

      console.log(data);
      setUser(data.user);

      // Set form states from user data if they exist
      if (data.user.danceStyles) {
        setDanceStyles(data.user.danceStyles);
      }
      if (data.user.dateOfBirth) {
        setDateOfBirth(
          new Date(data.user.dateOfBirth).toISOString().split("T")[0]
        );
      }
      if (data.user.citiesVisited && Array.isArray(data.user.citiesVisited)) {
        // Handle both populated City objects and string IDs
        const cities = data.user.citiesVisited.filter(
          (city): city is City =>
            typeof city === "object" && city !== null && "_id" in city
        );
        setCitiesVisited(cities);
      }
      if (data.user.anthem) {
        setAnthem(data.user.anthem);
      }
      if (data.user.socialMedia) {
        setSocialMedia({
          instagram: data.user.socialMedia.instagram || "",
          tiktok: data.user.socialMedia.tiktok || "",
          youtube: data.user.socialMedia.youtube || "",
        });
      }
      if (data.user.danceRole) {
        setDanceRole(data.user.danceRole);
      }

      // If profile is already complete, redirect to dashboard
      if (data.user.isProfileComplete) {
        router.push("/dashboard");
        return;
      }

      // Set current step based on completion
      const firstIncompleteStep = steps.findIndex(
        (step) =>
          !data.user.onboardingSteps[
            step.id as keyof typeof data.user.onboardingSteps
          ]
      );

      setCurrentStep(firstIncompleteStep >= 0 ? firstIncompleteStep : 0);

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
      case "citiesVisited":
        stepData = { citiesVisited: citiesVisited.map((city) => city._id) };
        break;
      case "anthem":
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
      case "socialMedia":
        stepData = { socialMedia };
        break;
      case "danceRole":
        stepData = { danceRole };
        break;
    }

    try {
      setLoading(true);
      const responseData = (await apiClient.put("/user/profile", {
        step: step.id,
        data: stepData,
      })) as {
        success: boolean;
        user: { id: string; isProfileComplete: boolean; onboardingSteps: any };
      };

      if (responseData.user.isProfileComplete) {
        router.push("/dashboard");
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error saving your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDanceStyle = (style: string) => {
    setDanceStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      setProfilePic(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePic = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setUploadingProfilePic(true);
      // For now, we'll use a placeholder upload endpoint
      // In production, you'd implement actual file upload to your storage service
      const response = await fetch('/api/upload-profile-pic', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingProfilePic(false);
    }
  };

  // Function to extract platform and IDs from URL
  const parseMediaUrl = (url: string) => {
    if (!url) return null;

    // Spotify URL patterns
    const spotifyMatch = url.match(/(?:spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
      return {
        platform: 'spotify' as const,
        id: spotifyMatch[1],
        embedUrl: `https://open.spotify.com/embed/track/${spotifyMatch[1]}`
      };
    }

    // YouTube URL patterns
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return {
        platform: 'youtube' as const,
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`
      };
    }

    return null;
  };

  const mediaInfo = parseMediaUrl(anthem.url);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-base-content/60 mb-2">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={progress}
            max="100"
          ></progress>
        </div>

        {/* Current step content */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-3xl mb-2">
              {steps[currentStep].title}
            </h1>
            <p className="text-base-content/70 mb-6">
              {steps[currentStep].description}
            </p>

            {/* Step-specific content */}
            {steps[currentStep].id === "danceStyles" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {danceStylesOptions.length > 0
                    ? danceStylesOptions.map((style) => (
                        <button
                          key={style.id}
                          className={`btn btn-outline ${
                            danceStyles.includes(style.name)
                              ? "btn-primary"
                              : ""
                          }`}
                          onClick={() => toggleDanceStyle(style.name)}
                          title={style.description}
                        >
                          {style.name}
                        </button>
                      ))
                    : // Loading placeholder skeletons
                      Array.from({ length: 12 }).map((_, index) => (
                        <div
                          key={index}
                          className="btn btn-outline animate-pulse"
                        >
                          <div className="h-4 bg-base-300 rounded w-16"></div>
                        </div>
                      ))}
                </div>
              </div>
            )}

            {steps[currentStep].id === "profilePic" && (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Profile picture preview */}
                  <div className="avatar">
                    <div className="w-32 h-32 rounded-full">
                      {profilePicPreview ? (
                        <img 
                          src={profilePicPreview} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : user?.image ? (
                        <img 
                          src={user.image} 
                          alt="Current profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-full h-full flex items-center justify-center">
                          <span className="text-4xl">
                            {user?.name?.charAt(0)?.toUpperCase() || "👤"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-base-content/70">
                      Your profile picture helps other dancers recognize you in the community.
                    </p>
                    <p className="text-sm text-base-content/50">
                      Supported formats: JPEG, PNG, WebP (max 5MB)
                    </p>
                  </div>

                  {/* File upload button */}
                  <div className="space-y-3">
                    <input
                      type="file"
                      id="profilePicInput"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profilePicInput"
                      className="btn btn-primary cursor-pointer"
                    >
                      📷 {profilePic || user?.image ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    
                    {profilePic && (
                      <p className="text-sm text-success">
                        ✓ Photo ready to upload: {profilePic.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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

            {steps[currentStep].id === "citiesVisited" && (
              <CitySelector
                selectedCities={citiesVisited}
                onCitiesChange={setCitiesVisited}
                placeholder="Search for cities where you've danced..."
                label="Cities you've danced in (optional)"
              />
            )}

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
                        // Auto-populate basic info when we have a valid URL
                        title: parsedInfo ? "Song from " + parsedInfo.platform : prev.title,
                        artist: parsedInfo ? "Artist" : prev.artist
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
                        className="rounded-xl"
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
                    <span className="label-text">Instagram Username</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="@yourusername"
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
                    <span className="label-text">TikTok Username</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="@yourusername"
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
                    <span className="label-text">YouTube Channel</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Channel URL or name"
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
                  <span className="label-text">I prefer to dance as a...</span>
                </label>
                <div className="flex flex-col gap-3">
                  <label className="label cursor-pointer justify-start">
                    <input
                      type="radio"
                      name="danceRole"
                      className="radio radio-primary"
                      checked={danceRole === "leader"}
                      onChange={() => setDanceRole("leader")}
                    />
                    <span className="label-text ml-3">
                      <strong>Leader</strong> - I enjoy guiding the dance and
                      creating the connection
                    </span>
                  </label>

                  <label className="label cursor-pointer justify-start">
                    <input
                      type="radio"
                      name="danceRole"
                      className="radio radio-primary"
                      checked={danceRole === "follower"}
                      onChange={() => setDanceRole("follower")}
                    />
                    <span className="label-text ml-3">
                      <strong>Follower</strong> - I love to follow the lead and
                      express the music
                    </span>
                  </label>

                  <label className="label cursor-pointer justify-start">
                    <input
                      type="radio"
                      name="danceRole"
                      className="radio radio-primary"
                      checked={danceRole === "both"}
                      onChange={() => setDanceRole("both")}
                    />
                    <span className="label-text ml-3">
                      <strong>Both</strong> - I love switching between leading
                      and following
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="card-actions justify-end mt-8">
              {currentStep > 0 && (
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : currentStep === steps.length - 1 ? (
                  "Complete Profile"
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
