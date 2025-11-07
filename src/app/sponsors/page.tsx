'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { EventSponsorsDTO } from "@/types";
import { getAppUrl } from '@/lib/env';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSponsors, setFilteredSponsors] = useState<EventSponsorsDTO[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; // Standard page size

  // Array of modern background colors
  const cardBackgrounds = [
    'bg-gradient-to-br from-blue-50 to-blue-100',
    'bg-gradient-to-br from-green-50 to-green-100',
    'bg-gradient-to-br from-purple-50 to-purple-100',
    'bg-gradient-to-br from-pink-50 to-pink-100',
    'bg-gradient-to-br from-yellow-50 to-yellow-100',
    'bg-gradient-to-br from-indigo-50 to-indigo-100',
    'bg-gradient-to-br from-teal-50 to-teal-100',
    'bg-gradient-to-br from-orange-50 to-orange-100',
    'bg-gradient-to-br from-cyan-50 to-cyan-100',
    'bg-gradient-to-br from-rose-50 to-rose-100'
  ];

  const getRandomBackground = (index: number) => {
    return cardBackgrounds[index % cardBackgrounds.length];
  };

  useEffect(() => {
    fetchSponsors();
  }, [currentPage, searchTerm]); // Refetch when page or search changes

  async function fetchSponsors() {
    setLoading(true);
    setFetchError(false);
    try {
      // Fetch sponsors with pagination and search
      const params = new URLSearchParams({
        sort: 'priorityRanking,asc',
        page: (currentPage - 1).toString(), // Convert to 0-based for backend
        size: pageSize.toString(),
        'isActive.equals': 'true'
      });

      // Add search filter if provided
      if (searchTerm.trim()) {
        params.append('name.contains', searchTerm.trim());
      }

      const baseUrl = getAppUrl();
      const response = await fetch(`${baseUrl}/api/proxy/event-sponsors?${params.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        const sponsorsList = Array.isArray(data) ? data : [];

        // Get total count from x-total-count header as per UI style guide
        const totalCountHeader = response.headers.get('x-total-count');
        const count = totalCountHeader ? parseInt(totalCountHeader, 10) : sponsorsList.length;
        const pages = Math.ceil(count / pageSize);

        console.log('✅ Fetched sponsors:', {
          page: currentPage,
          count: sponsorsList.length,
          totalCount: count,
          totalPages: pages
        });

        setSponsors(sponsorsList);
        setFilteredSponsors(sponsorsList);
        setTotalCount(count);
        setTotalPages(pages);
      } else {
        console.warn('Failed to fetch sponsors:', response.status);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate pagination info
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = (currentPage - 1) * pageSize + filteredSponsors.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Home</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Our Sponsors</h1>
              <p className="text-lg text-gray-600 mt-2">
                Meet the organizations that support our community initiatives
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search sponsors..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : fetchError ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Sponsors</h3>
              <p className="text-gray-500">Please try refreshing the page or contact us if the problem persists.</p>
            </div>
          </div>
        ) : filteredSponsors.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No Sponsors Found' : 'No Sponsors Available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No sponsors match "${searchTerm}". Try a different search term.`
                  : 'We\'re currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="text-center mb-8">
              <p className="text-gray-600">
                {searchTerm
                  ? `Found ${totalCount} sponsor${totalCount !== 1 ? 's' : ''} matching "${searchTerm}"`
                  : `Showing ${totalCount} sponsor${totalCount !== 1 ? 's' : ''}`
                }
              </p>
            </div>

            {/* Sponsors List - Single column stacked layout */}
            <div className="space-y-8">
              {filteredSponsors.map((sponsor, index) => (
                <div
                  key={sponsor.id}
                  className={`${getRandomBackground(index)} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="flex flex-col h-full">
                    {/* Image Section - Matching events page style */}
                    <div className="relative w-full h-auto rounded-t-2xl overflow-hidden">
                      {sponsor.bannerImageUrl ? (
                        <Image
                          src={sponsor.bannerImageUrl}
                          alt={sponsor.name}
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                          style={{
                            backgroundColor: 'transparent',
                            borderRadius: '1rem 1rem 0 0'
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-80 flex items-center justify-center"
                          style={{
                            backgroundColor: 'transparent',
                            borderRadius: '1rem 1rem 0 0'
                          }}
                        >
                          <span className="text-gray-400 text-4xl">🏢</span>
                        </div>
                      )}
                      {/* Sponsor Type Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                          {sponsor.type}
                        </span>
                      </div>
                    </div>

                    {/* Content Section - Compact header */}
                    <div className="p-5 border-t border-white/20">
                      {/* Sponsor Name */}
                      <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {sponsor.name}
                      </h2>

                      {/* Company Name */}
                      {sponsor.companyName && (
                        <p className="text-gray-600 text-base mb-2">
                          {sponsor.companyName}
                        </p>
                      )}

                      {/* Tagline/Description - Compact */}
                      {sponsor.tagline && (
                        <div className="mb-3">
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {sponsor.tagline}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Details Section - Matching home page style */}
                    <div className="px-4 pb-4 border-t border-white/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2 pt-3">
                        {/* Company Name */}
                        {sponsor.companyName && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {sponsor.companyName}
                            </span>
                          </div>
                        )}

                        {/* Sponsor Type */}
                        {sponsor.type && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {sponsor.type}
                            </span>
                          </div>
                        )}

                        {/* Contact Email */}
                        {sponsor.contactEmail && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {sponsor.contactEmail}
                            </span>
                          </div>
                        )}

                        {/* Contact Phone */}
                        {sponsor.contactPhone && (
                          <div className="flex items-center gap-3 text-gray-700">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {sponsor.contactPhone}
                            </span>
                          </div>
                        )}

                        {/* Website - Centers if it's the only item in the last row */}
                        {sponsor.websiteUrl && (
                          <div className="flex items-center gap-3 text-gray-700 lg:justify-self-center lg:col-start-2">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9" />
                              </svg>
                            </div>
                            <span className="text-lg font-semibold">
                              {sponsor.websiteUrl.replace(/^https?:\/\//, '')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tagline/Description - Minimal bottom spacing */}
                      {sponsor.tagline && (
                        <div className="mb-1">
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {sponsor.tagline}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls - Matching admin home page style */}
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <FaChevronLeft />
                  Previous
                </button>
                <div className="text-sm font-semibold">
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Showing {filteredSponsors.length > 0 ? startItem : 0} to {filteredSponsors.length > 0 ? endItem : 0} of {totalCount} sponsors
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
