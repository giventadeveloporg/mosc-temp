'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { TenantEmailAddressDTO } from '@/types';
import { fetchTenantEmailAddressesServer } from '@/app/admin/tenant-email-addresses/ApiServerActions';

interface FromEmailSelectProps {
  value?: string;
  onChange: (email: string | undefined) => void;
  required?: boolean;
  filterByType?: TenantEmailAddressDTO['emailType']; // Optional: filter by email type
  showDisplayName?: boolean; // Show display name in dropdown
}

export default function FromEmailSelect({
  value,
  onChange,
  required = false,
  filterByType,
  showDisplayName = true,
}: FromEmailSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [emailAddresses, setEmailAddresses] = useState<TenantEmailAddressDTO[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<TenantEmailAddressDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<TenantEmailAddressDTO | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load tenant email addresses on mount
    loadEmailAddresses();
  }, []);

  useEffect(() => {
    // Filter emails based on search term and optional type filter
    let filtered = emailAddresses;

    // Filter by type if specified
    if (filterByType) {
      filtered = filtered.filter(email => email.emailType === filterByType);
    }

    // Filter by active status (only show active emails)
    filtered = filtered.filter(email => email.isActive === true);

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(email =>
        email.emailAddress.toLowerCase().includes(term) ||
        (email.displayName?.toLowerCase().includes(term) ?? false) ||
        email.emailType.toLowerCase().includes(term)
      );
    }

    // Sort: default emails first, then by email type, then by email address
    filtered.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      if (a.emailType !== b.emailType) {
        return a.emailType.localeCompare(b.emailType);
      }
      return a.emailAddress.localeCompare(b.emailAddress);
    });

    setFilteredEmails(filtered.slice(0, 10)); // Max 10 items in dropdown
  }, [searchTerm, emailAddresses, filterByType]);

  useEffect(() => {
    // Find selected email when value changes
    if (value) {
      const email = emailAddresses.find(e => e.emailAddress === value);
      setSelectedEmail(email || null);
      if (email) {
        setSearchTerm(email.emailAddress);
      }
    } else {
      setSelectedEmail(null);
      setSearchTerm('');
    }
  }, [value, emailAddresses]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEmailAddresses = async () => {
    setLoading(true);
    try {
      const addresses = await fetchTenantEmailAddressesServer();
      setEmailAddresses(addresses);
    } catch (err: any) {
      console.error('Failed to load tenant email addresses:', err);
      setEmailAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
  };

  const handleSelectEmail = (email: TenantEmailAddressDTO) => {
    setSelectedEmail(email);
    setSearchTerm(email.emailAddress);
    onChange(email.emailAddress);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedEmail(null);
    setSearchTerm('');
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" style={{ isolation: 'isolate' }}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        From Email {required && <span className="text-red-500">*</span>}
      </label>

      {/* Search Input */}
      <div className="relative" style={{ zIndex: 1 }}>
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search email addresses..."
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 pl-10 pr-10 px-4 py-2 text-base"
          required={required}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          name="fromEmailSearch"
          id="fromEmailSearch"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {selectedEmail && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (filteredEmails.length > 0 || loading) && (
        <div 
          className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg" 
          style={{ 
            maxHeight: 'calc(10 * 3.5rem)', 
            overflowY: 'auto',
            zIndex: 9999
          }}
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading email addresses...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No email addresses found</div>
          ) : (
            <ul className="py-1">
              {filteredEmails.map((email) => (
                <li
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedEmail?.id === email.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {email.emailAddress}
                        {email.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                        )}
                      </div>
                      {showDisplayName && email.displayName && (
                        <div className="text-sm text-gray-500">{email.displayName}</div>
                      )}
                      <div className="text-xs text-gray-400">
                        Type: {email.emailType}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected Email Display */}
      {selectedEmail && !isOpen && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900">
            Selected: {selectedEmail.emailAddress}
          </div>
          {showDisplayName && selectedEmail.displayName && (
            <div className="text-xs text-blue-700">{selectedEmail.displayName}</div>
          )}
          <div className="text-xs text-blue-700">
            Type: {selectedEmail.emailType}
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="mt-1 text-sm text-gray-500">
        Select a verified email address from your tenant configuration. Only active addresses are shown.
      </p>
    </div>
  );
}

