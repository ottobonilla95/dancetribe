"use client";

import { useState } from "react";
import { FaCheck, FaTimes, FaInstagram } from "react-icons/fa";

interface AdminSharedCheckboxProps {
  userId: string;
  initialSharedStatus: boolean;
  instagramHandle?: string;
}

export default function AdminSharedCheckbox({ userId, initialSharedStatus, instagramHandle }: AdminSharedCheckboxProps) {
  const [sharedOnSocialMedia, setSharedOnSocialMedia] = useState(initialSharedStatus);
  const [updating, setUpdating] = useState(false);

  // Helper function to get Instagram URL
  const getInstagramUrl = () => {
    if (!instagramHandle) return "";
    const cleanHandle = instagramHandle.replace("@", "");
    if (instagramHandle.startsWith("http")) return instagramHandle;
    return `https://instagram.com/${cleanHandle}`;
  };

  const toggleSharedStatus = async () => {
    setUpdating(true);
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedOnSocialMedia: !sharedOnSocialMedia }),
      });

      if (res.ok) {
        setSharedOnSocialMedia(!sharedOnSocialMedia);
      } else {
        alert("Failed to update shared status");
      }
    } catch (error) {
      console.error("Error updating shared status:", error);
      alert("Error updating shared status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card bg-warning/10 border-2 border-warning shadow-lg">
      <div className="card-body p-4">
        <h3 className="card-title text-sm flex items-center gap-2">
          <FaCheck className="text-warning" />
          Admin Controls
        </h3>
        
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              checked={sharedOnSocialMedia}
              onChange={toggleSharedStatus}
              disabled={updating}
              className="checkbox checkbox-warning"
            />
            <span className="label-text font-medium">
              Shared on Social Media
            </span>
            {updating ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : sharedOnSocialMedia ? (
              <FaCheck className="text-success" />
            ) : (
              <FaTimes className="text-base-content/30" />
            )}
          </label>
        </div>

        {/* Instagram Info */}
        {instagramHandle && (
          <div className="mt-4 pt-4 border-t border-warning/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FaInstagram className="text-pink-500 text-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-base-content/60">Instagram</div>
                  <div className="font-medium truncate">
                    @{instagramHandle.replace("@", "")}
                  </div>
                </div>
              </div>
              <a
                href={getInstagramUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline gap-2 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-purple-500"
              >
                <FaInstagram />
                Visit
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

