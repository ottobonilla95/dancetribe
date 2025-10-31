"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface Anthem {
  url: string;
  platform: string;
  title?: string;
  artist?: string;
}

interface AnthemSectionProps {
  initialAnthem?: Anthem;
}

export default function AnthemSection({ initialAnthem }: AnthemSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [anthem, setAnthem] = useState<Anthem>(initialAnthem || {
    url: "",
    platform: "",
    title: "",
    artist: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Auto-detect platform from URL
      let platform = "spotify";
      if (anthem.url.includes("youtube.com") || anthem.url.includes("youtu.be")) {
        platform = "youtube";
      }
      
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          step: "anthem", 
          data: { 
            anthem: {
              ...anthem,
              platform
            }
          } 
        }),
      });

      if (!response.ok) throw new Error("Failed to update anthem");
      
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving anthem:", error);
      alert("Failed to save anthem");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAnthem(initialAnthem || { url: "", platform: "", title: "", artist: "" });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <div className="space-y-3 mb-3">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Song URL (Spotify or YouTube)</span>
            </label>
            <input
              type="url"
              value={anthem.url}
              onChange={(e) => setAnthem({ ...anthem, url: e.target.value })}
              className="input input-bordered input-sm"
              placeholder="Paste Spotify or YouTube link"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !anthem.url}
            className="btn btn-primary btn-sm gap-2"
          >
            {saving ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave /> Save
              </>
            )}
          </button>
          <button onClick={handleCancel} className="btn btn-ghost btn-sm gap-2">
            <FaTimes /> Cancel
          </button>
        </div>
      </div>
    );
  }

  const hasAnthem = anthem?.url;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="card-title text-xl">🎵 Dance Anthem</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="btn btn-ghost btn-xs gap-1"
        >
          <FaEdit /> Edit
        </button>
      </div>
      {hasAnthem ? (
        <div className="rounded-lg">
          {(() => {
            const url = anthem.url;
            let embedUrl = "";

            if (anthem.platform === "spotify") {
              const spotifyMatch = url.match(
                /(?:spotify\.com\/track\/|spotify:track:)([a-zA-Z0-9]+)/
              );
              if (spotifyMatch) {
                embedUrl = `https://open.spotify.com/embed/track/${spotifyMatch[1]}`;
              }
            } else if (anthem.platform === "youtube") {
              const youtubeMatch = url.match(
                /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
              );
              if (youtubeMatch) {
                embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
              }
            }

            return embedUrl ? (
              <div
                className="rounded-lg overflow-hidden"
                style={{ height: "152px" }}
              >
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  scrolling="no"
                  className="rounded-2xl"
                  style={{ overflow: "hidden" }}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              </div>
            ) : (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-xs btn-primary"
              >
                🎧 Listen
              </a>
            );
          })()}
        </div>
      ) : (
        <p className="text-base-content/50 italic">No anthem added yet. Click edit to add your favorite dance song.</p>
      )}
    </div>
  );
}

