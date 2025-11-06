"use client";

import { useState, FormEvent } from "react";
import { FaPlus, FaSpotify, FaYoutube } from "react-icons/fa";

interface AddReleaseProps {
  onReleaseAdded: () => void;
}

export default function AddRelease({ onReleaseAdded }: AddReleaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/releases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          url,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Release added! Your followers have been notified.");
        setTitle("");
        setDescription("");
        setUrl("");
        setIsOpen(false);
        onReleaseAdded(); // Refresh releases list
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("Error adding release:", error);
      alert("❌ Failed to add release");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Add Release Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary btn-sm gap-2"
      >
        <FaPlus />
        Add New Release
      </button>

      {/* Modal */}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              🎵 Add New Release
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-semibold">
                    Title <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter song/track title"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* URL */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-semibold">
                    Spotify or YouTube URL <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/track/... or https://youtube.com/watch?v=..."
                  className="input input-bordered w-full"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt flex items-center gap-2">
                    <FaSpotify className="text-green-500" /> Spotify or{" "}
                    <FaYoutube className="text-red-500" /> YouTube links supported
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="form-control w-full mb-4">
                <label className="label">
                  <span className="label-text font-semibold">
                    Message to fans (optional)
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Share a message about this release..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                ></textarea>
                <label className="label">
                  <span className="label-text-alt">
                    {description.length}/500 characters
                  </span>
                </label>
              </div>

              {/* Info Alert */}
              <div className="alert alert-info mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-sm">
                  Your followers and friends will be notified about this new release!
                </span>
              </div>

              {/* Actions */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Publish Release
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsOpen(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}

