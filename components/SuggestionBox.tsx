"use client";

import React, { useState } from "react";
import { FaLightbulb, FaTimes, FaPaperPlane } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/components/I18nProvider";

export default function SuggestionBox() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [category, setCategory] = useState("feature");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Only show for logged-in users
  if (!session?.user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suggestion.trim()) {
      alert("Please enter your suggestion");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion: suggestion.trim(),
          category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit suggestion");
      }

      setSubmitted(true);
      setSuggestion("");
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("Failed to submit suggestion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Suggestion Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-circle btn-accent btn-lg shadow-lg hover:shadow-xl transition-all group"
          aria-label="Share Suggestion"
          title="Share your ideas!"
        >
          <FaLightbulb className="text-2xl group-hover:animate-pulse" />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
            onClick={() => !submitting && setShowModal(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-base-100 rounded-2xl shadow-2xl max-w-lg w-full p-6 pointer-events-auto animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {submitted ? (
                // Success State
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold mb-2">{t('suggestions.thankYou')}</h3>
                  <p className="text-base-content/70">
                    {t('suggestions.submitted')}
                  </p>
                </div>
              ) : (
                // Form State
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <FaLightbulb className="text-accent" />
                      {t('suggestions.title')}
                    </h3>
                    <p className="text-sm text-base-content/60 mt-1">
                      {t('suggestions.subtitle')}
                    </p>
                  </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="btn btn-ghost btn-sm btn-circle"
                      disabled={submitting}
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category Selection */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">{t('suggestions.category')}</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "feature", label: `✨ ${t('suggestions.categoryFeature')}`, color: "btn-primary" },
                          { value: "improvement", label: `🚀 ${t('suggestions.categoryImprovement')}`, color: "btn-accent" },
                          { value: "bug", label: `🐛 Bug`, color: "btn-error" },
                          { value: "other", label: `💭 ${t('suggestions.categoryOther')}`, color: "btn-secondary" },
                        ].map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`btn btn-sm ${
                              category === cat.value ? cat.color : "btn-outline"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suggestion Textarea */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">{t('suggestions.yourSuggestion')}</span>
                        <span className="label-text-alt text-base-content/50">
                          {suggestion.length}/500
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-32 resize-none"
                        placeholder={t('suggestions.placeholder')}
                        value={suggestion}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setSuggestion(e.target.value);
                          }
                        }}
                        maxLength={500}
                        disabled={submitting}
                        required
                      />
                    </div>

                    {/* User Info Display (if logged in) */}
                    {session?.user && (
                      <div className="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs">
                          {t('suggestions.submittingAs')} <strong>{session.user.name}</strong> ({session.user.email})
                        </span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting || !suggestion.trim()}
                      className="btn btn-accent btn-block gap-2"
                    >
                      {submitting ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          {t('suggestions.submitting')}
                        </>
                      ) : (
                        <>
                          <FaPaperPlane />
                          {t('suggestions.send')}
                        </>
                      )}
                    </button>

                    <p className="text-xs text-center text-base-content/50 pt-2">
                      {t('suggestions.appreciation')}
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes scale-in {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.2s ease-out;
            }
            .animate-scale-in {
              animation: scale-in 0.3s ease-out;
            }
          `}</style>
        </>
      )}
    </>
  );
}

