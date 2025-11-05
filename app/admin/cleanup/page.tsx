"use client";

import { useState } from "react";
import { FaTrash, FaCheckCircle, FaSpinner } from "react-icons/fa";

interface CleanupResult {
  success: boolean;
  task: string;
  message: string;
  usersAffected?: number;
  results?: Array<{ task: string; affected: number }>;
}

export default function AdminCleanupPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<CleanupResult | null>(null);

  const runCleanup = async (task: string) => {
    if (!confirm(`Are you sure you want to run cleanup for: ${task}?`)) {
      return;
    }

    setLoading(task);
    setResults(null);

    try {
      const response = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Cleanup error:", error);
      alert("Failed to run cleanup task");
    } finally {
      setLoading(null);
    }
  };

  const cleanupTasks = [
    {
      id: "old-trips",
      name: "Old Trips",
      description: "Remove trips that ended 30+ days ago",
      icon: "✈️",
      color: "btn-primary",
    },
    {
      id: "orphaned-friend-requests",
      name: "Orphaned Friend Requests",
      description: "Remove friend requests from deleted users",
      icon: "👥",
      color: "btn-accent",
    },
    {
      id: "all",
      name: "Run All Cleanups",
      description: "Execute all cleanup tasks at once",
      icon: "🧹",
      color: "btn-success",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Cleanup</h1>
        <p className="text-base-content/70">
          Maintain database health by removing old or orphaned data
        </p>
      </div>

      {/* Results Card */}
      {results && (
        <div className="alert alert-success mb-6">
          <FaCheckCircle className="text-2xl" />
          <div className="flex-1">
            <h3 className="font-bold">{results.message}</h3>
            {results.results ? (
              <div className="text-sm mt-2">
                {results.results.map((r, i) => (
                  <div key={i}>
                    • {r.task}: {r.affected} users affected
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm">
                {results.usersAffected} users affected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cleanup Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cleanupTasks.map((task) => (
          <div key={task.id} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{task.icon}</div>
                <div className="flex-1">
                  <h2 className="card-title">{task.name}</h2>
                  <p className="text-sm text-base-content/70 mb-4">
                    {task.description}
                  </p>

                  <button
                    onClick={() => runCleanup(task.id)}
                    disabled={loading !== null}
                    className={`btn ${task.color} btn-sm gap-2 ${
                      loading === task.id ? "loading" : ""
                    }`}
                  >
                    {loading === task.id ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        Run Cleanup
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="alert alert-info mt-8">
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
        <div>
          <h3 className="font-bold">Cleanup Information</h3>
          <div className="text-xs">
            • These tasks can be run manually or via Lambda/cron
            <br />
            • API endpoint: POST /api/admin/cleanup (admin auth required)
            <br />• Safe to run multiple times - idempotent operations
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="mt-6 p-4 bg-base-200 rounded-lg">
        <h3 className="font-bold mb-2">API Usage (Lambda/Cron)</h3>
        <pre className="text-xs bg-base-300 p-3 rounded overflow-x-auto">
          {`// Example: Call from Lambda function
fetch('https://dancecircle.co/api/admin/cleanup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'your-admin-session-cookie'
  },
  body: JSON.stringify({ 
    task: 'all' // or 'old-trips', 'old-profile-views', etc.
  })
})`}
        </pre>
      </div>
    </div>
  );
}

