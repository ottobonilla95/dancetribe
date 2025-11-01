"use client";

import { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

interface AdminSharedCheckboxProps {
  userId: string;
  initialSharedStatus: boolean;
}

export default function AdminSharedCheckbox({ userId, initialSharedStatus }: AdminSharedCheckboxProps) {
  const [sharedOnSocialMedia, setSharedOnSocialMedia] = useState(initialSharedStatus);
  const [updating, setUpdating] = useState(false);

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
      </div>
    </div>
  );
}

