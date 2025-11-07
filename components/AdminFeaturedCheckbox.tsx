"use client";

import { useState } from "react";
import { FaStar } from "react-icons/fa";

interface AdminFeaturedCheckboxProps {
  userId: string;
  initialFeaturedStatus: boolean;
}

export default function AdminFeaturedCheckbox({ 
  userId, 
  initialFeaturedStatus 
}: AdminFeaturedCheckboxProps) {
  const [isFeatured, setIsFeatured] = useState(initialFeaturedStatus);
  const [updating, setUpdating] = useState(false);

  const toggleFeaturedStatus = async () => {
    setUpdating(true);
    
    try {
      const res = await fetch(`/api/admin/toggle-featured`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          isFeaturedProfessional: !isFeatured 
        }),
      });

      if (res.ok) {
        setIsFeatured(!isFeatured);
        // Reload to show/hide verified badge
        window.location.reload();
      } else {
        alert("Failed to update featured status");
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      alert("Error updating featured status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="card bg-primary/10 border-2 border-primary shadow-lg">
      <div className="card-body p-4">
        <h3 className="card-title text-sm flex items-center gap-2">
          <FaStar className="text-primary" />
          Featured Professional
        </h3>
        
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={toggleFeaturedStatus}
              disabled={updating}
              className="checkbox checkbox-primary"
            />
            <span className="label-text font-medium">
              Mark as Featured Professional
            </span>
            {updating && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
          </label>
        </div>

        <p className="text-xs text-base-content/60 mt-2">
          {isFeatured 
            ? "✅ This user will show the verified badge and appear in featured sections" 
            : "This user is not featured"}
        </p>
      </div>
    </div>
  );
}

