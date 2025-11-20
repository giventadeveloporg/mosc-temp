'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaImage, FaTimes, FaSpinner, FaCheck, FaEnvelope } from 'react-icons/fa';

interface EmailHeaderImageUploadProps {
  eventId: number;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function EmailHeaderImageUpload({
  eventId,
  currentImageUrl,
  onImageUploaded,
  onError,
  disabled = false,
  className = ''
}: EmailHeaderImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file (JPEG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Build API URL for email header image upload
      const apiUrl = `/api/proxy/event-medias/upload/email-header-image?eventId=${eventId}&title=Email Header Image&description=Email header image for ticket confirmation emails&isPublic=true`;

      console.log('📧 EmailHeaderImageUpload: Uploading to URL:', apiUrl);
      console.log('📧 EmailHeaderImageUpload: Event ID:', eventId);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      console.log('📧 EmailHeaderImageUpload: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('📧 EmailHeaderImageUpload: Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      const imageUrl = result.fileUrl || result.url || result.imageUrl;

      if (!imageUrl) {
        throw new Error('Upload succeeded but no image URL returned');
      }

      console.log('📧 EmailHeaderImageUpload: Upload success, image URL:', imageUrl);
      onImageUploaded(imageUrl);

      // Show success message
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Email header image upload error:', error);
      onError(error.message || 'Failed to upload email header image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
          ${showSuccess ? 'border-green-500 bg-green-50' :
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <FaSpinner className="animate-spin text-2xl mb-2" />
            <p className="text-sm">Uploading email header image...</p>
          </div>
        ) : showSuccess ? (
          <div className="flex flex-col items-center justify-center text-green-600">
            <FaCheck className="text-2xl mb-2" />
            <p className="text-sm font-medium">Upload successful!</p>
            <p className="text-xs text-gray-500">Email header image updated</p>
          </div>
        ) : currentImageUrl ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <img
                src={currentImageUrl}
                alt="Email header preview"
                className="w-full max-w-md h-auto object-contain rounded-lg border border-gray-200 shadow-sm"
                style={{ maxHeight: '200px' }}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaEnvelope className="text-blue-500" />
              <span>Click to change email header image</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">or drag and drop a new image</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <FaEnvelope className="text-4xl mb-3 text-blue-500" />
            <p className="text-sm font-medium mb-1">Upload Email Header Image</p>
            <p className="text-xs text-gray-400 mb-2">This image will be used in ticket confirmation emails</p>
            <p className="text-xs text-gray-400">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">(JPEG, PNG, GIF - Max 10MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}


