'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  type DefaultHeroDisplayMode,
  MAX_TENANT_HERO_SLIDES,
  mergeHeroUrlLines,
  parseTenantDefaultHeroUrls,
  serializeDefaultHeroImageUrls,
} from '@/lib/hero/defaultHeroImages';
import { uploadDefaultHeroImageClient } from '@/app/admin/tenant-management/settings/ApiServerActions';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const PREVIEW_ROTATION_MS = 4000;

export interface HeroSlide {
  id: string;
  url: string;
  fileName?: string;
}

function slideId(): string {
  return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function urlsToSlides(urls: string[]): HeroSlide[] {
  return urls.map((url) => ({ id: slideId(), url }));
}

interface TenantDefaultHeroManagerProps {
  settingsId?: number;
  mode: 'create' | 'edit';
  tenantIdForUpload?: string;
  initialUrlsJson?: string;
  displayMode: DefaultHeroDisplayMode;
  includeWithEvents: boolean;
  onUrlsJsonChange: (json: string) => void;
  onDisplayModeChange: (mode: DefaultHeroDisplayMode) => void;
  onIncludeWithEventsChange: (value: boolean) => void;
  onPersistUrls: (urls: string[]) => Promise<void>;
}

export default function TenantDefaultHeroManager({
  settingsId,
  mode,
  tenantIdForUpload,
  initialUrlsJson,
  displayMode,
  includeWithEvents,
  onUrlsJsonChange,
  onDisplayModeChange,
  onIncludeWithEventsChange,
  onPersistUrls,
}: TenantDefaultHeroManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() =>
    urlsToSlides(parseTenantDefaultHeroUrls(initialUrlsJson ?? null))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showManualUrls, setShowManualUrls] = useState(false);
  const [manualUrlText, setManualUrlText] = useState('');

  const uploadEnabled = mode === 'edit' && !!settingsId;

  const walkthroughKey = settingsId
    ? `tenantHeroWalkthroughDismissed:${settingsId}`
    : 'tenantHeroWalkthroughDismissed:new';

  useEffect(() => {
    if (mode !== 'edit' || heroSlides.length > 0) {
      setShowWalkthrough(false);
      return;
    }
    try {
      const dismissed = localStorage.getItem(walkthroughKey) === '1';
      setShowWalkthrough(!dismissed);
    } catch {
      setShowWalkthrough(true);
    }
  }, [mode, heroSlides.length, walkthroughKey]);

  const previewUrls = useMemo(() => heroSlides.map((s) => s.url), [heroSlides]);

  useEffect(() => {
    if (displayMode !== 'slideshow' || previewUrls.length < 2) {
      setPreviewIndex(0);
      return;
    }
    const timer = window.setInterval(() => {
      setPreviewIndex((i) => (i + 1) % previewUrls.length);
    }, PREVIEW_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [displayMode, previewUrls.length]);

  const syncUrls = useCallback(
    async (slides: HeroSlide[], persist: boolean) => {
      const urls = slides.map((s) => s.url);
      const json = serializeDefaultHeroImageUrls(urls);
      onUrlsJsonChange(json);
      if (persist && settingsId) {
        await onPersistUrls(urls);
      }
    },
    [onPersistUrls, onUrlsJsonChange, settingsId]
  );

  const validateFiles = (files: File[]): { valid: File[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: File[] = [];
    const remaining = MAX_TENANT_HERO_SLIDES - heroSlides.length;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: not an image file`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: exceeds 10 MB limit`);
        continue;
      }
      if (valid.length >= remaining) {
        errors.push(`Maximum ${MAX_TENANT_HERO_SLIDES} slides allowed`);
        break;
      }
      valid.push(file);
    }
    return { valid, errors };
  };

  const processUpload = async (files: File[]) => {
    if (!uploadEnabled) return;
    const { valid, errors } = validateFiles(files);
    if (errors.length > 0) {
      setUploadMessage({ type: 'error', text: errors.join('; ') });
    }
    if (valid.length === 0) return;

    setUploading(true);
    setUploadMessage(null);
    const newSlides: HeroSlide[] = [];
    let failed = 0;

    try {
      for (let i = 0; i < valid.length; i++) {
        setUploadProgress({ current: i + 1, total: valid.length });
        try {
          const { url } = await uploadDefaultHeroImageClient(valid[i], tenantIdForUpload);
          if (!url) throw new Error('No URL returned');
          newSlides.push({ id: slideId(), url, fileName: valid[i].name });
        } catch (err) {
          failed += 1;
          console.error('[TenantDefaultHeroManager] upload failed:', err);
        }
      }

      if (newSlides.length > 0) {
        const merged = [...heroSlides, ...newSlides];
        setHeroSlides(merged);
        await syncUrls(merged, true);
        setUploadMessage({
          type: failed > 0 ? 'error' : 'success',
          text:
            failed > 0
              ? `Uploaded ${newSlides.length} of ${valid.length} image(s). ${failed} failed.`
              : `Successfully uploaded ${newSlides.length} image(s).`,
        });
      } else {
        setUploadMessage({ type: 'error', text: 'Upload failed. Please try again.' });
      }
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list?.length) void processUpload(Array.from(list));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!uploadEnabled || uploading) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) void processUpload(files);
  };

  const handleRemove = async (index: number) => {
    const next = heroSlides.filter((_, i) => i !== index);
    setHeroSlides(next);
    try {
      await syncUrls(next, true);
      setUploadMessage({ type: 'success', text: 'Slide removed.' });
    } catch {
      setUploadMessage({ type: 'error', text: 'Failed to save after remove.' });
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...heroSlides];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setHeroSlides(next);
    await syncUrls(next, true);
  };

  const handleMergeManualUrls = async () => {
    const existing = heroSlides.map((s) => s.url);
    const merged = mergeHeroUrlLines(existing, manualUrlText);
    const next = urlsToSlides(merged);
    setHeroSlides(next);
    setManualUrlText('');
    await syncUrls(next, true);
    setUploadMessage({ type: 'success', text: 'URLs merged into slide list.' });
  };

  const dismissWalkthrough = (permanent: boolean) => {
    setShowWalkthrough(false);
    if (permanent) {
      try {
        localStorage.setItem(walkthroughKey, '1');
      } catch {
        /* ignore */
      }
    }
  };

  const largePreviewUrl =
    displayMode === 'single'
      ? previewUrls[0]
      : previewUrls[previewIndex] ?? previewUrls[0];

  return (
    <div className="space-y-6">
      {showWalkthrough && (
        <div className="rounded-lg border-2 border-teal-300 bg-teal-50 p-4">
          <h4 className="font-semibold text-teal-800 mb-2">Get started with homepage hero slides</h4>
          <ol className="list-decimal pl-5 text-sm text-teal-900 space-y-1 mb-3">
            <li>Upload one or more landscape images (recommended 2000×800, 5:2 ratio).</li>
            <li>Choose display mode: slideshow, random, or single.</li>
            <li>Save settings or rely on auto-save after each upload, then view your homepage.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dismissWalkthrough(true)}
              className="px-4 py-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 text-sm font-semibold transition-all"
            >
              Don&apos;t show again
            </button>
            <button
              type="button"
              onClick={() => dismissWalkthrough(false)}
              className="px-4 py-2 rounded-lg border border-teal-300 text-teal-700 text-sm font-medium hover:bg-teal-100 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {!uploadEnabled && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Save tenant settings first, then return to edit mode to upload homepage hero images.
        </div>
      )}

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-2">Upload hero slides</h4>
        <p className="text-sm text-gray-500 mb-3">
          Up to {MAX_TENANT_HERO_SLIDES} images, 10 MB each. Recommended 2000×800 (5:2 landscape).
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={!uploadEnabled || uploading}
          className="hidden"
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (uploadEnabled && !uploading) fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (uploadEnabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => uploadEnabled && !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors w-full ${
            isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
          } ${!uploadEnabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Upload hero images"
          aria-label="Upload hero images — click or drag and drop"
        >
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-xl mx-auto mb-2 flex items-center justify-center ${
              isDragging ? 'bg-teal-100' : 'bg-gray-100'
            }`}
          >
            <svg
              className={`w-10 h-10 ${isDragging ? 'text-teal-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <p className={`text-sm ${isDragging ? 'text-teal-700 font-semibold' : 'text-gray-600'}`}>
            {uploading && uploadProgress
              ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}…`
              : isDragging
                ? 'Drop images here'
                : 'Click or drag and drop one or more hero images'}
          </p>
        </div>
        {uploadMessage && (
          <div
            className={`mt-2 p-2 rounded text-sm ${
              uploadMessage.type === 'success'
                ? 'bg-green-100 text-green-800'
                : uploadMessage.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }`}
          >
            {uploadMessage.text}
          </div>
        )}
      </div>

      {heroSlides.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Slides ({heroSlides.length}/{MAX_TENANT_HERO_SLIDES}) — drag to reorder
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                draggable={!uploading}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) {
                    void handleReorder(dragIndex, index);
                    setDragIndex(null);
                  }
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`relative bg-white rounded-lg border-2 shadow-sm overflow-hidden ${
                  dragIndex === index ? 'border-teal-500 opacity-70' : 'border-gray-200'
                }`}
              >
                <span className="absolute top-1 left-1 z-10 bg-teal-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="relative w-full h-20 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.url}
                    alt={slide.fileName || `Hero slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-2 flex justify-between items-center gap-1">
                  <span
                    className="text-xs text-gray-500 truncate flex-1 cursor-grab"
                    title="Drag to reorder"
                  >
                    {slide.fileName || 'Slide'}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleRemove(index)}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title="Remove slide"
                    aria-label={`Remove slide ${index + 1}`}
                  >
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Display mode</label>
          <select
            value={displayMode}
            onChange={(e) =>
              onDisplayModeChange(e.target.value as DefaultHeroDisplayMode)
            }
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base"
          >
            <option value="slideshow">Slideshow (ordered rotation)</option>
            <option value="random">Random (shuffle each visit)</option>
            <option value="single">Single (first slide only)</option>
          </select>
        </div>
        <div className="flex items-start pt-8">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeWithEvents}
              onChange={(e) => onIncludeWithEventsChange(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-400 text-teal-600 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700">
              Include default hero slides when upcoming events also have hero images (appended after
              event heroes).
            </span>
          </label>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-2">Live preview</h4>
          <div
            className="relative w-full rounded-lg overflow-hidden"
            style={{ background: '#1a0a2e', aspectRatio: '5 / 2' }}
          >
            {largePreviewUrl && (
              <Image
                src={largePreviewUrl}
                alt="Hero preview"
                fill
                className="object-contain"
                sizes="(min-width: 768px) 800px, 100vw"
                unoptimized
              />
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {previewUrls.map((url, i) => (
              <div key={url + i} className="relative w-32 h-20 rounded border border-gray-200 overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowManualUrls((v) => !v)}
          className="text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-2"
          aria-expanded={showManualUrls}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Add URLs manually (advanced)
        </button>
        {showManualUrls && (
          <div className="mt-3 space-y-2">
            <textarea
              value={manualUrlText}
              onChange={(e) => setManualUrlText(e.target.value)}
              rows={4}
              placeholder="One HTTPS URL per line"
              className="w-full border border-gray-400 rounded-xl focus:border-teal-500 focus:ring-teal-500 px-4 py-3 text-base font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => void handleMergeManualUrls()}
              className="px-4 py-2 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-800 font-semibold text-sm transition-all"
            >
              Merge URLs into slides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
