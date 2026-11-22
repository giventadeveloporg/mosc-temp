'use client';

import { useEffect, useState } from 'react';
import type { EventDetailsDTO, GalleryAlbumDTO } from '@/types';
import PublicListSearchCombobox from '@/components/public/PublicListSearchCombobox';
import {
  fetchPublicTypeahead,
  PUBLIC_EVENT_SEARCH_FIELDS,
  PUBLIC_GALLERY_ALBUM_SEARCH_FIELDS,
} from '@/lib/publicTypeaheadSearch';

type GallerySearchMode = 'albums' | 'events';

interface GallerySearchProps {
  onSearch: (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  loading?: boolean;
  placeholder?: string;
  mode?: GallerySearchMode;
  /** Local items already loaded on the page (for instant local suggestions). */
  localItems?: Array<Record<string, unknown>>;
  /** Parent-committed filters (keeps UI in sync across album/event tab switches). */
  committedSearchTerm?: string;
  committedStartDate?: string;
  committedEndDate?: string;
}

export function GallerySearch({
  onSearch,
  loading = false,
  placeholder = 'Search by title…',
  mode = 'albums',
  localItems = [],
  committedSearchTerm = '',
  committedStartDate = '',
  committedEndDate = '',
}: GallerySearchProps) {
  const [searchDraft, setSearchDraft] = useState(committedSearchTerm);
  const [searchTerm, setSearchTerm] = useState(committedSearchTerm);
  const [startDate, setStartDate] = useState(committedStartDate);
  const [endDate, setEndDate] = useState(committedEndDate);
  const [showDateFilters, setShowDateFilters] = useState(
    Boolean(committedStartDate || committedEndDate),
  );

  useEffect(() => {
    setSearchDraft(committedSearchTerm);
    setSearchTerm(committedSearchTerm);
  }, [committedSearchTerm]);

  useEffect(() => {
    setStartDate(committedStartDate);
    setEndDate(committedEndDate);
    setShowDateFilters(Boolean(committedStartDate || committedEndDate));
  }, [committedStartDate, committedEndDate]);

  const commitFilters = (title: string) => {
    const next = title.trim();
    setSearchDraft(next);
    setSearchTerm(next);
    onSearch({
      searchTerm: next,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitFilters(searchDraft);
  };

  const handleClear = () => {
    setSearchDraft('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setShowDateFilters(false);
    onSearch({
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasFilters = Boolean(searchTerm || startDate || endDate);

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative max-w-md">
          <label htmlFor="gallerySearchTitle" className="sr-only">
            Search by title
          </label>
          {mode === 'albums' ? (
            <PublicListSearchCombobox<GalleryAlbumDTO & Record<string, unknown>>
              items={localItems as (GalleryAlbumDTO & Record<string, unknown>)[]}
              committedValue={searchTerm}
              onCommit={commitFilters}
              onInputChange={setSearchDraft}
              inputId="gallerySearchTitle"
              placeholder={placeholder}
              disabled={loading}
              searchRemote={(query) =>
                fetchPublicTypeahead<GalleryAlbumDTO & Record<string, unknown>>({
                  resource: 'gallery-albums',
                  query,
                  containsFields: PUBLIC_GALLERY_ALBUM_SEARCH_FIELDS,
                  extraParams: {
                    'isPublic.equals': 'true',
                    sort: 'eventDateStart,desc',
                  },
                })
              }
              getSearchFields={(a) => [a.searchText, a.title, a.description, a.id]}
              getCommitValue={(a) => a.title || ''}
              formatPrimary={(a) => a.title || 'Untitled album'}
              formatSecondary={(a) =>
                [a.description, a.id != null ? `ID: ${a.id}` : null]
                  .filter(Boolean)
                  .join(' · ')
              }
            />
          ) : (
            <PublicListSearchCombobox<EventDetailsDTO & Record<string, unknown>>
              items={localItems as (EventDetailsDTO & Record<string, unknown>)[]}
              committedValue={searchTerm}
              onCommit={commitFilters}
              onInputChange={setSearchDraft}
              inputId="gallerySearchTitle"
              placeholder={placeholder}
              disabled={loading}
              searchRemote={(query) =>
                fetchPublicTypeahead<EventDetailsDTO & Record<string, unknown>>({
                  resource: 'event-details',
                  query,
                  containsFields: PUBLIC_EVENT_SEARCH_FIELDS,
                  extraParams: {
                    'isActive.equals': 'true',
                    sort: 'startDate,desc',
                  },
                })
              }
              getSearchFields={(ev) => [ev.searchText, ev.title, ev.caption, ev.description, ev.id]}
              getCommitValue={(ev) => ev.title || ''}
              formatPrimary={(ev) => ev.title || 'Untitled event'}
              formatSecondary={(ev) =>
                [ev.caption, ev.id != null ? `ID: ${ev.id}` : null]
                  .filter(Boolean)
                  .join(' · ')
              }
            />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowDateFilters(!showDateFilters)}
            className="flex-shrink-0 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-4"
            title="Toggle Date Filters"
            aria-label="Toggle Date Filters"
            disabled={loading}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-700 text-sm">Date Filters</span>
            <svg className={`w-4 h-4 text-gray-600 transition-transform ${showDateFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-shrink-0 h-12 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Search"
            aria-label="Search"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700 text-sm">{loading ? 'Searching…' : 'Search'}</span>
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-4"
              title="Clear search"
              aria-label="Clear search"
              disabled={loading}
            >
              <span className="font-semibold text-gray-700 text-sm">Clear</span>
            </button>
          )}
        </div>

        {showDateFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Filter by start date. Leave blank to include all dates.
            </p>
          </div>
        )}

        {hasFilters && (
          <p className="text-sm text-blue-800 bg-blue-50 rounded-lg px-3 py-2">
            <strong>Search active:</strong>
            {searchTerm && ` Title contains "${searchTerm}"`}
            {searchTerm && (startDate || endDate) && ' and'}
            {startDate && endDate && ` date between "${startDate}" and "${endDate}"`}
            {startDate && !endDate && ` date from "${startDate}" onwards`}
            {!startDate && endDate && ` date until "${endDate}"`}
          </p>
        )}
      </form>
    </div>
  );
}
