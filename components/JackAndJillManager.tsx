"use client";

import { useState } from "react";
import { FaPlus, FaTimes, FaEdit, FaCheck } from "react-icons/fa";

interface JackAndJillCompetition {
  _id?: string;
  eventName: string;
  danceStyle: any;
  placement: "participated" | "1st" | "2nd" | "3rd";
  year: number;
}

interface JackAndJillManagerProps {
  competitions: JackAndJillCompetition[];
  danceStyles: Array<{ _id: string; name: string }>;
  isOwnProfile: boolean;
}

export default function JackAndJillManager({ 
  competitions: initialCompetitions, 
  danceStyles,
  isOwnProfile 
}: JackAndJillManagerProps) {
  const [competitions, setCompetitions] = useState<JackAndJillCompetition[]>(initialCompetitions || []);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newComp, setNewComp] = useState({
    eventName: "",
    danceStyle: "",
    placement: "participated" as const,
    year: new Date().getFullYear(),
  });

  const handleAdd = async () => {
    if (!newComp.eventName || !newComp.danceStyle) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jackAndJillCompetitions: [
            ...competitions.map(c => ({
              eventName: c.eventName,
              danceStyle: typeof c.danceStyle === 'object' ? c.danceStyle._id : c.danceStyle,
              placement: c.placement,
              year: c.year,
            })),
            newComp,
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCompetitions(data.user.jackAndJillCompetitions || []);
        setNewComp({
          eventName: "",
          danceStyle: "",
          placement: "participated",
          year: new Date().getFullYear(),
        });
        setIsAdding(false);
        window.location.reload(); // Reload to show updated data
      } else {
        alert("Failed to save competition");
      }
    } catch (error) {
      console.error("Error saving competition:", error);
      alert("Failed to save competition");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this competition?")) return;

    setIsSaving(true);
    try {
      const updatedComps = competitions.filter((_, i) => i !== index);
      const response = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jackAndJillCompetitions: updatedComps.map(c => ({
            eventName: c.eventName,
            danceStyle: typeof c.danceStyle === 'object' ? c.danceStyle._id : c.danceStyle,
            placement: c.placement,
            year: c.year,
          })),
        }),
      });

      if (response.ok) {
        setCompetitions(updatedComps);
        window.location.reload();
      } else {
        alert("Failed to delete competition");
      }
    } catch (error) {
      console.error("Error deleting competition:", error);
      alert("Failed to delete competition");
    } finally {
      setIsSaving(false);
    }
  };

  const placementEmoji = (placement: string) => {
    switch (placement) {
      case '1st': return '🥇';
      case '2nd': return '🥈';
      case '3rd': return '🥉';
      default: return '🎯';
    }
  };

  const sortedCompetitions = [...competitions].sort((a, b) => {
    const placementOrder: {[key: string]: number} = { '1st': 1, '2nd': 2, '3rd': 3, 'participated': 4 };
    const placementDiff = (placementOrder[a.placement] || 5) - (placementOrder[b.placement] || 5);
    if (placementDiff !== 0) return placementDiff;
    return b.year - a.year;
  });

  // Show empty state if no competitions and not own profile
  if (competitions.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="card-title text-xl">🏅 Jack & Jill Competitions</h3>
          {isOwnProfile && !isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="btn btn-primary btn-sm gap-2"
              disabled={isSaving}
            >
              <FaPlus /> Add
            </button>
          )}
        </div>

        {competitions.length === 0 && isOwnProfile && !isAdding ? (
          <div className="text-center py-8 text-base-content/60">
            <p className="mb-2">No competitions added yet</p>
            <p className="text-sm">Showcase your Jack & Jill achievements!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCompetitions.map((comp, index) => {
              const danceStyleName = typeof comp.danceStyle === 'object' && comp.danceStyle?.name 
                ? comp.danceStyle.name 
                : danceStyles.find(ds => ds._id === comp.danceStyle)?.name || 'Dance';
              
              return (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-base-300/50 hover:bg-base-300 transition-colors">
                  <div className="text-3xl flex-shrink-0">{placementEmoji(comp.placement)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{comp.eventName}</h4>
                    <p className="text-sm text-base-content/70">
                      {danceStyleName} · {comp.year}
                      {comp.placement !== 'participated' && (
                        <span className="ml-1 font-semibold text-primary">· {comp.placement} Place</span>
                      )}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <button
                      onClick={() => handleDelete(index)}
                      className="btn btn-ghost btn-sm btn-circle"
                      disabled={isSaving}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Competition Form */}
        {isAdding && (
          <div className="mt-4 p-4 rounded-lg bg-base-300 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Add Competition</h4>
              <button
                onClick={() => setIsAdding(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <FaTimes />
              </button>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Event/Festival Name *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="e.g., Barcelona Salsa Congress"
                value={newComp.eventName}
                onChange={(e) => setNewComp({ ...newComp, eventName: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Dance Style *</span>
              </label>
              <select
                className="select select-bordered"
                value={newComp.danceStyle}
                onChange={(e) => setNewComp({ ...newComp, danceStyle: e.target.value })}
              >
                <option value="">Select style...</option>
                {danceStyles.map((style) => (
                  <option key={style._id} value={style._id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Placement *</span>
              </label>
              <select
                className="select select-bordered"
                value={newComp.placement}
                onChange={(e) => setNewComp({ ...newComp, placement: e.target.value as any })}
              >
                <option value="participated">Participated</option>
                <option value="1st">1st Place 🥇</option>
                <option value="2nd">2nd Place 🥈</option>
                <option value="3rd">3rd Place 🥉</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Year *</span>
              </label>
              <select
                className="select select-bordered"
                value={newComp.year}
                onChange={(e) => setNewComp({ ...newComp, year: parseInt(e.target.value) })}
              >
                {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="btn btn-primary btn-sm flex-1"
                disabled={isSaving}
              >
                {isSaving ? <span className="loading loading-spinner loading-sm"></span> : <><FaCheck /> Save</>}
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="btn btn-ghost btn-sm"
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

