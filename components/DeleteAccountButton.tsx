"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signOut } from "next-auth/react";
import { FaTrash, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useTranslation } from "./I18nProvider";

interface DeleteAccountButtonProps {
  variant?: 'normal' | 'danger';
}

export default function DeleteAccountButton({ variant = 'normal' }: DeleteAccountButtonProps) {
  const { t, locale } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [mounted, setMounted] = useState(false);

  // Confirmation word changes based on language
  const confirmWord = locale === 'es' ? 'ELIMINAR' : 'DELETE';

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    if (confirmText !== confirmWord) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        // Sign out and redirect to home
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete account");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    if (!isDeleting) {
      setIsModalOpen(false);
      setConfirmText("");
    }
  };

  // Render modal content
  const modalContent = isModalOpen && mounted ? (
    <div className="modal modal-open" style={{ zIndex: 9999 }}>
      <div className="modal-box max-w-md">
        {/* Close button */}
        <button
          onClick={closeModal}
          disabled={isDeleting}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <FaTimes />
        </button>

        {/* Modal content */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
              <FaExclamationTriangle className="text-error text-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl mb-2">
              {t('profile.deleteAccountWarning') || 'Delete Account?'}
            </h3>
            <p className="text-sm text-base-content/70">
              {t('profile.deleteAccountDescription') || 
                'This action is permanent and cannot be undone. All your data, connections, and content will be permanently deleted.'}
            </p>
          </div>
        </div>

        <div className="divider my-4"></div>

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text font-medium">
              {t('profile.deleteAccountConfirm') || 
                `Type "${confirmWord}" to confirm:`}
            </span>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            placeholder={confirmWord}
            className="input input-bordered"
            disabled={isDeleting}
            autoFocus
          />
        </div>

        <div className="modal-action mt-6">
          <button
            onClick={closeModal}
            className="btn btn-ghost"
            disabled={isDeleting}
          >
            {t('common.cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== confirmWord || isDeleting}
            className="btn btn-error gap-2"
          >
            {isDeleting ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {t('profile.deleting') || 'Deleting...'}
              </>
            ) : (
              <>
                <FaTrash />
                {t('profile.deleteAccount') || 'Delete Account'}
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Modal backdrop */}
      <div className="modal-backdrop" onClick={closeModal}></div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`btn ${variant === 'danger' ? 'btn-error btn-outline' : 'btn-ghost'} btn-sm w-full gap-2`}
      >
        <FaTrash className="w-3 h-3" />
        {t('profile.deleteAccount') || 'Delete Account'}
      </button>

      {/* Render modal in portal at document body level */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}

