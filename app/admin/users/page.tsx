"use client";

import { useState, useEffect } from "react";
import { FaUsers, FaSearch, FaCheck, FaTimes, FaInstagram, FaFacebook, FaTwitter, FaUserPlus, FaEnvelope } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  username?: string;
  image?: string;
  sharedOnSocialMedia: boolean;
  isProfileComplete?: boolean;
  createdAt: string;
  city?: {
    _id: string;
    name: string;
    country?: {
      _id: string;
      name: string;
      code: string;
    };
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShared, setFilterShared] = useState<"all" | "shared" | "not-shared">("all");
  const [showOnlyNotShared, setShowOnlyNotShared] = useState(false);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, filterShared, showOnlyNotShared, showOnlyIncomplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "100",
        search: searchTerm,
      });

      // Add filter parameter for shared status
      if (showOnlyNotShared) {
        params.append("filterShared", "false");
      } else if (filterShared === "shared") {
        params.append("filterShared", "true");
      } else if (filterShared === "not-shared") {
        params.append("filterShared", "false");
      }

      // Add filter parameter for profile completion
      if (showOnlyIncomplete) {
        params.append("filterProfileComplete", "false");
      }

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
        setTotalUsers(data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSharedStatus = async (userId: string, currentStatus: boolean) => {
    // Add to updating set
    setUpdatingUsers(prev => new Set(prev).add(userId));

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sharedOnSocialMedia: !currentStatus }),
      });

      if (res.ok) {
        // Update local state
        setUsers(prev =>
          prev.map(user =>
            user._id === userId
              ? { ...user, sharedOnSocialMedia: !currentStatus }
              : user
          )
        );
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user status");
    } finally {
      // Remove from updating set
      setUpdatingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setInviteError("Please enter a valid email address");
      return;
    }

    setInviting(true);
    setInviteError("");
    setInviteSuccess(false);

    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setInviteSuccess(true);
        setInviteEmail("");
        // Refresh user list
        setTimeout(() => {
          fetchUsers();
          setShowInviteModal(false);
          setInviteSuccess(false);
        }, 2000);
      } else {
        setInviteError(data.error || "Failed to invite user");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      setInviteError("Error sending invite");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 mb-2">
            <FaUsers className="text-primary text-3xl" />
            <div>
              <h1 className="text-3xl font-bold">Social Media Tracker</h1>
              <p className="text-base-content/70">
                Track which users you&apos;ve shared on social media
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="btn btn-primary gap-2"
          >
            <FaUserPlus />
            Invite User
          </button>
        </div>
        <div className="flex gap-2 mt-4 text-sm">
          <div className="badge badge-outline gap-1">
            <FaInstagram /> Instagram
          </div>
          <div className="badge badge-outline gap-1">
            <FaFacebook /> Facebook
          </div>
          <div className="badge badge-outline gap-1">
            <FaTwitter /> Twitter/X
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{totalUsers}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Shared</div>
          <div className="stat-value text-success">
            {users.filter(u => u.sharedOnSocialMedia).length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Not Shared</div>
          <div className="stat-value text-warning">
            {users.filter(u => !u.sharedOnSocialMedia).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="tabs tabs-boxed">
          <button
            className={`tab ${filterShared === "all" ? "tab-active" : ""}`}
            onClick={() => {
              setFilterShared("all");
              setPage(1);
            }}
          >
            All Users
          </button>
          <button
            className={`tab ${filterShared === "shared" ? "tab-active" : ""}`}
            onClick={() => {
              setFilterShared("shared");
              setPage(1);
            }}
          >
            Shared ✅
          </button>
          <button
            className={`tab ${filterShared === "not-shared" ? "tab-active" : ""}`}
            onClick={() => {
              setFilterShared("not-shared");
              setPage(1);
            }}
          >
            Not Shared
          </button>
        </div>

        {/* Filter Checkboxes */}
        <div className="space-y-2">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                checked={showOnlyNotShared}
                onChange={(e) => {
                  setShowOnlyNotShared(e.target.checked);
                  setPage(1);
                }}
                className="checkbox checkbox-warning"
              />
              <span className="label-text font-medium">
                Show only users NOT shared on social media
              </span>
            </label>
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                checked={showOnlyIncomplete}
                onChange={(e) => {
                  setShowOnlyIncomplete(e.target.checked);
                  setPage(1);
                }}
                className="checkbox checkbox-error"
              />
              <span className="label-text font-medium">
                Show only users with incomplete profiles
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-base-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>User</th>
                <th>Username</th>
                <th>Location</th>
                <th>Profile Status</th>
                <th>Joined</th>
                <th>Shared on Social Media</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-base-content/60">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr 
                    key={user._id} 
                    className="cursor-pointer hover:bg-base-300 transition-colors"
                    onClick={() => window.open(`/dancer/${user._id}`, '_blank')}
                  >
                    <td>{(page - 1) * 100 + index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full">
                            {user.image ? (
                              <img src={user.image} alt={user.name} />
                            ) : (
                              <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center text-xl font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold">{user.name}</span>
                      </div>
                    </td>
                    <td>
                      {user.username ? (
                        <span className="font-mono text-sm">@{user.username}</span>
                      ) : (
                        <span className="text-base-content/50 text-sm italic">No username</span>
                      )}
                    </td>
                    <td>
                      {user.city ? (
                        <div className="text-sm">
                          <div className="font-medium">{user.city.name}</div>
                          {user.city.country && (
                            <div className="text-base-content/60 text-xs">
                              {user.city.country.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-base-content/50 text-sm italic">No location</span>
                      )}
                    </td>
                    <td>
                      {user.isProfileComplete ? (
                        <span className="badge badge-success gap-1">
                          <FaCheck className="text-xs" /> Complete
                        </span>
                      ) : (
                        <span className="badge badge-warning gap-1">
                          <FaTimes className="text-xs" /> Incomplete
                        </span>
                      )}
                    </td>
                    <td className="text-sm">{formatDate(user.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-2">
                          <input
                            type="checkbox"
                            checked={user.sharedOnSocialMedia}
                            onChange={() => toggleSharedStatus(user._id, user.sharedOnSocialMedia)}
                            disabled={updatingUsers.has(user._id)}
                            className="checkbox checkbox-success"
                          />
                          {updatingUsers.has(user._id) ? (
                            <span className="loading loading-spinner loading-sm"></span>
                          ) : user.sharedOnSocialMedia ? (
                            <span className="badge badge-success gap-1">
                              <FaCheck className="text-xs" /> Shared
                            </span>
                          ) : (
                            <span className="badge badge-ghost gap-1">
                              <FaTimes className="text-xs" /> Not shared
                            </span>
                          )}
                        </label>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-sm"
            >
              Previous
            </button>
            <span className="flex items-center px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        )}

        {/* Total count */}
        <div className="text-center text-sm text-base-content/60 pb-4">
          Showing {(page - 1) * 100 + 1} - {Math.min(page * 100, totalUsers)} of {totalUsers} users
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <FaUserPlus className="text-primary" />
              Invite New User
            </h3>

            <p className="text-sm text-base-content/70 mb-4">
              Enter the user&apos;s email address. They will receive an invitation email with a login link.
            </p>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setInviteError("");
                  }}
                  className="input input-bordered w-full pl-10"
                  disabled={inviting}
                />
              </div>
            </div>

            {inviteError && (
              <div className="alert alert-error mt-4">
                <FaTimes />
                <span>{inviteError}</span>
              </div>
            )}

            {inviteSuccess && (
              <div className="alert alert-success mt-4">
                <FaCheck />
                <span>Invite sent successfully! 🎉</span>
              </div>
            )}

            <div className="modal-action">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                  setInviteError("");
                  setInviteSuccess(false);
                }}
                className="btn btn-ghost"
                disabled={inviting}
              >
                Cancel
              </button>
              <button
                onClick={handleInviteUser}
                className="btn btn-primary gap-2"
                disabled={inviting || !inviteEmail}
              >
                {inviting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaEnvelope />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !inviting && setShowInviteModal(false)} />
        </div>
      )}
    </div>
  );
}
