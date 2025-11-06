"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import config from "@/config";

interface User {
  _id: string;
  name: string;
  username: string;
  email?: string;
  isFeaturedProfessional?: boolean;
  isTeacher?: boolean;
  isDJ?: boolean;
  isPhotographer?: boolean;
  isEventOrganizer?: boolean;
  isProducer?: boolean;
  followersCount?: number;
}

export default function FeaturedProfessionalsAdmin() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | "professionals">("all");

  // Check if user is admin
  if (status === "unauthenticated" || (session && session.user?.email !== config.admin.email)) {
    redirect("/");
  }

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = "/api/admin/users?";
      if (filter === "featured") {
        query += "isFeaturedProfessional=true";
      } else if (filter === "professionals") {
        query += "isProfessional=true";
      }
      
      const response = await fetch(query);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/toggle-featured", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          isFeaturedProfessional: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isFeaturedProfessional: !currentStatus }
            : user
        ));
        alert(data.message);
      } else {
        alert(data.error || "Failed to update user");
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      alert("Network error. Please try again.");
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const isProfessional = (user: User) => {
    return user.isTeacher || user.isDJ || user.isPhotographer || user.isEventOrganizer || user.isProducer;
  };

  const getProfessionalRoles = (user: User) => {
    const roles = [];
    if (user.isTeacher) roles.push("🎓 Teacher");
    if (user.isDJ) roles.push("🎵 DJ");
    if (user.isPhotographer) roles.push("📷 Photographer");
    if (user.isEventOrganizer) roles.push("🎪 Event Organizer");
    if (user.isProducer) roles.push("🎹 Producer");
    return roles.join(", ");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-base-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Featured Professionals Management</h1>
        
        <div className="alert alert-info mb-6">
          <span>
            ⭐ Featured professionals receive <strong>follows</strong> instead of friend requests from normal users.
            They can still send/receive friend requests with other featured professionals and normal users.
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            className="input input-bordered flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="btn-group">
            <button
              className={`btn ${filter === "all" ? "btn-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Users
            </button>
            <button
              className={`btn ${filter === "professionals" ? "btn-active" : ""}`}
              onClick={() => setFilter("professionals")}
            >
              Professionals Only
            </button>
            <button
              className={`btn ${filter === "featured" ? "btn-active" : ""}`}
              onClick={() => setFilter("featured")}
            >
              Featured Only
            </button>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Professional Roles</th>
                  <th>⭐ Followers</th>
                  <th>Featured Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-base-content/60">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold flex items-center gap-1">
                              {user.name}
                              {user.isFeaturedProfessional && (
                                <span className="text-blue-500" title="Verified Professional">✓</span>
                              )}
                            </div>
                            <div className="text-sm opacity-50">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isProfessional(user) ? (
                          <div className="text-sm">{getProfessionalRoles(user)}</div>
                        ) : (
                          <span className="text-base-content/40">Not a professional</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-ghost">⭐ {user.followersCount || 0}</span>
                      </td>
                      <td>
                        {user.isFeaturedProfessional ? (
                          <span className="badge badge-success">⭐ Featured</span>
                        ) : (
                          <span className="badge badge-ghost">Regular</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            user.isFeaturedProfessional ? "btn-warning" : "btn-primary"
                          }`}
                          onClick={() => toggleFeatured(user._id, user.isFeaturedProfessional || false)}
                        >
                          {user.isFeaturedProfessional ? "Remove Featured" : "Make Featured"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

