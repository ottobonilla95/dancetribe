"use client";

import React, { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropPickerProps {
  currentImage?: string;
  userName?: string;
  onImageSelect: (file: File) => void;
  uploading?: boolean;
  selectedFileName?: string;
}

export default function ImageCropPicker({
  currentImage,
  userName,
  onImageSelect,
  uploading = false,
  selectedFileName,
}: ImageCropPickerProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imgSrc, setImgSrc] = useState<string>("");
  const [showCropModal, setShowCropModal] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Calculate the initial crop in pixels based on the default percentage crop
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: (width * crop.x) / 100,
      y: (height * crop.y) / 100,
      width: (width * crop.width) / 100,
      height: (height * crop.height) / 100,
    };
    
    setCompletedCrop(pixelCrop);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("Image size must be less than 5MB");
        return;
      }

      // Create preview for cropping
      const reader = new FileReader();
      reader.onload = (e) => {
        setImgSrc(e.target?.result as string);
        setShowCropModal(true);
        // Reset completedCrop when new image is loaded
        setCompletedCrop(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          }
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageBlob = await getCroppedImg(
          imgRef.current,
          completedCrop
        );
        const croppedFile = new File(
          [croppedImageBlob],
          "cropped-profile.jpg",
          { type: "image/jpeg" }
        );

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfilePicPreview(e.target?.result as string);
        };
        reader.readAsDataURL(croppedFile);

        setShowCropModal(false);
        onImageSelect(croppedFile);
      } catch (error) {
        console.error("Error cropping image:", error);
        alert("Error cropping image. Please try again.");
      }
    }
  };

  return (
    <div className="text-center py-8">
      <div className="flex flex-col items-center space-y-6">
        {/* Profile picture preview */}
        <div className="avatar">
          <div className="w-32 h-32 rounded-full relative">
            {uploading ? (
              <div className="w-full h-full rounded-full bg-base-300 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : profilePicPreview ? (
              <img
                src={profilePicPreview}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full"
              />
            ) : currentImage ? (
              <img
                src={currentImage}
                alt="Current profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="bg-neutral-focus text-neutral-content rounded-full w-full h-full flex items-center justify-center">
                <span className="text-4xl">
                  {userName?.charAt(0)?.toUpperCase() || "👤"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base-content/70">
            Your profile picture helps other dancers recognize you in the
            community.
          </p>
          <p className="text-sm text-base-content/50">
            Supported formats: JPEG, PNG, WebP (max 5MB)
          </p>
        </div>

        {/* File upload button */}
        <div className="space-y-3">
          <input
            type="file"
            id="profilePicInput"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="profilePicInput"
            className={`btn btn-primary cursor-pointer ${uploading ? "btn-disabled" : ""}`}
          >
            📷{" "}
            {profilePicPreview || currentImage
              ? "Change Photo"
              : "Upload Photo"}
          </label>

          {selectedFileName && !uploading && (
            <p className="text-sm text-success">
              ✓ Photo ready to upload: {selectedFileName}
            </p>
          )}

          {uploading && (
            <p className="text-sm text-info">📤 Uploading your photo...</p>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-base-100 rounded-lg w-full max-w-md flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-4 border-b border-base-300">
              <h3 className="text-lg font-bold">Crop Your Photo</h3>
              <p className="text-sm text-base-content/70 mt-1">
                Drag to select the area you want to use as your profile picture.
              </p>
            </div>

            {/* Image area - scrollable if needed */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={setCrop}
                  onComplete={setCompletedCrop}
                  aspect={1}
                  className="max-w-full"
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Crop preview"
                    className="max-w-full max-h-[40vh] w-auto h-auto object-contain"
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            </div>

            {/* Buttons - always visible */}
            <div className="p-4 border-t border-base-300 flex gap-3 justify-end">
              <button
                className="btn btn-outline"
                onClick={() => setShowCropModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCropComplete}
                disabled={!completedCrop}
              >
                Use This Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
