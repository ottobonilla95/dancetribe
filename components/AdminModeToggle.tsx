"use client";

import { useState, useEffect } from "react";
import { FaShieldAlt } from "react-icons/fa";
import Cookies from "js-cookie";

export default function AdminModeToggle() {
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    // Check cookie on mount
    const savedMode = Cookies.get("adminMode");
    setAdminMode(savedMode === "true");
  }, []);

  const toggleAdminMode = () => {
    const newMode = !adminMode;
    setAdminMode(newMode);
    
    // Save to cookie (expires in 30 days)
    if (newMode) {
      Cookies.set("adminMode", "true", { expires: 30 });
    } else {
      Cookies.remove("adminMode");
    }
    
    // Refresh the page to apply changes
    window.location.reload();
  };

  return (
    <div className="form-control">
      <label className="label cursor-pointer gap-2">
        <span className="label-text flex items-center gap-2">
          <FaShieldAlt className="text-warning" />
          <span className="font-medium">Admin Mode</span>
        </span>
        <input
          type="checkbox"
          className="toggle toggle-warning"
          checked={adminMode}
          onChange={toggleAdminMode}
        />
      </label>
    </div>
  );
}

