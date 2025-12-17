'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import type { PromotionEmailTemplateDTO, EventDetailsDTO } from '@/types';
import { FaEdit, FaTrashAlt, FaCopy, FaEnvelope, FaEnvelopeOpen, FaBan, FaChevronLeft, FaChevronRight, FaUsers } from 'react-icons/fa';
import {
  fetchNewsletterEmailTemplatesServer,
  deleteNewsletterEmailTemplateServer,
} from '../ApiServerActions';

interface NewsletterEmailTemplateListProps {
  eventId?: number;
  onEdit: (template: PromotionEmailTemplateDTO) => void;
  onDuplicate: (template: PromotionEmailTemplateDTO) => void;
  onSendTest: (template: PromotionEmailTemplateDTO) => void;
  onSendBulk: (template: PromotionEmailTemplateDTO) => void;
  onSendToSubscribed: (template: PromotionEmailTemplateDTO) => void;
  events: EventDetailsDTO[];
  refreshKey?: number; // Force refresh when this changes
}

function TemplateDetailsTooltip({
  template,
  anchorRect,
  onClose
}: {
  template: PromotionEmailTemplateDTO,
  anchorRect: DOMRect | null,
  onClose: () => void
}) {
  if (!anchorRect) return null;

  const tooltipWidth = 450;
  const spacing = 12;

  // Always show tooltip to the right of the anchor cell, never above the columns
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  // Clamp position to stay within the viewport
  const estimatedHeight = 400;
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left + tooltipWidth > window.innerWidth - spacing) {
    left = window.innerWidth - tooltipWidth - spacing;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    width: `${tooltipWidth}px`,
    fontSize: '14px',
    maxHeight: '500px',
    overflowY: 'auto',
    transition: 'opacity 0.1s ease-in-out',
  };

  return ReactDOM.createPortal(
    <div
      style={style}
      tabIndex={-1}
      className="admin-tooltip"
    >
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end" style={{ minHeight: 0 }}>
        <button
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          &times;
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-2">Template Details</h3>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Template Name:</span>
            <span className="ml-2 text-gray-900">{template.templateName}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Subject:</span>
            <span className="ml-2 text-gray-900">{template.subject}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Event ID:</span>
            <span className="ml-2 text-gray-900">{template.eventId}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              template.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {template.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {template.promotionCode && (
            <div>
              <span className="font-semibold text-gray-700">Promotion Code:</span>
              <span className="ml-2 text-gray-900">{template.promotionCode}</span>
            </div>
          )}
          {template.headerImageUrl && (
            <div>
              <span className="font-semibold text-gray-700">Header Image:</span>
              <span className="ml-2 text-blue-600 break-all">{template.headerImageUrl}</span>
            </div>
          )}
          {template.footerImageUrl && (
            <div>
              <span className="font-semibold text-gray-700">Footer Image:</span>
              <span className="ml-2 text-blue-600 break-all">{template.footerImageUrl}</span>
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-700">Created:</span>
            <span className="ml-2 text-gray-900">{new Date(template.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Updated:</span>
            <span className="ml-2 text-gray-900">{new Date(template.updatedAt).toLocaleString()}</span>
          </div>
          {template.bodyHtml && (
            <div>
              <span className="font-semibold text-gray-700">Body HTML Preview:</span>
              <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded max-h-40 overflow-y-auto">
                <div
                  className="text-xs text-gray-700"
                  dangerouslySetInnerHTML={{ __html: template.bodyHtml.substring(0, 500) + (template.bodyHtml.length > 500 ? '...' : '') }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function NewsletterEmailTemplateList({
  eventId,
  onEdit,
  onDuplicate,
  onSendTest,
  onSendBulk,
  onSendToSubscribed,
  events,
  refreshKey,
}: NewsletterEmailTemplateListProps) {
  const [templates, setTemplates] = useState<PromotionEmailTemplateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(eventId);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [hoveredTemplate, setHoveredTemplate] = useState<PromotionEmailTemplateDTO | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PromotionEmailTemplateDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [selectedEventId, filterActive, refreshKey, page]);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        sort: 'createdAt,desc',
        page,
        size: pageSize,
      };
      if (selectedEventId) {
        params.eventId = selectedEventId;
      }
      if (filterActive !== undefined) {
        params.isActive = filterActive;
      }
      const { templates: templatesData, totalCount: fetchedTotalCount } = await fetchNewsletterEmailTemplatesServer(params);
      setTemplates(templatesData);
      setTotalCount(fetchedTotalCount);
    } catch (err: any) {
      // Only show error for non-404 errors (404 is handled as empty list)
      const errorMessage = err.message || 'Unable to load templates';
      if (!errorMessage.includes('404')) {
        setError('Unable to load email templates. Please try again later.');
      } else {
        // Clear error for 404 - let empty state message show instead
        setError(null);
        setTemplates([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePrevPage = () => {
    setPage((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setPage((p) => p + 1);
  };

  const handleDeleteClick = (template: PromotionEmailTemplateDTO) => {
    if (!template.id) return;
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete?.id) return;

    setDeleting(true);
    setError(null);

    try {
      await deleteNewsletterEmailTemplateServer(templateToDelete.id);
      // Reload templates to ensure consistency with backend
      // Reset to first page if current page becomes empty after deletion
      if (templates.length === 1 && page > 0) {
        setPage(0);
      } else {
        await loadTemplates();
      }
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setTemplateToDelete(null);
  };

  const filteredTemplates = templates.filter(template => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        template.templateName.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const isPrevDisabled = page === 0 || loading;
  const isNextDisabled = page >= totalPages - 1 || loading;
  const displayPage = page + 1; // Display as 1-based
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? page * pageSize + Math.min(pageSize, totalCount - page * pageSize) : 0;

  const getEventName = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    return event?.title || `Event ${eventId}`;
  };

  const handleTemplateMouseEnter = (template: PromotionEmailTemplateDTO, e: React.MouseEvent) => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    setHoveredTemplate(template);
    setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  const handleTemplateMouseLeave = () => {
    tooltipTimer.current = setTimeout(() => {
      setHoveredTemplate(null);
      setTooltipAnchor(null);
    }, 200);
  };

  const handleTooltipClose = () => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    setHoveredTemplate(null);
    setTooltipAnchor(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Email Templates</h2>

        {/* Configuration Note */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 space-y-2">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Email header images can only be added to a template after it has been created. Once you create the template, edit it to upload header and footer images for the newsletter email.
              </p>
              <p className="text-sm text-blue-800">
                <strong>From Email Field:</strong> The email address used in the "From Email" field must be registered and verified with AWS SES (Amazon Simple Email Service). AWS SES requires the "From" address to be verified in SES for production use. <strong>Please contact your administrator</strong> - only verified emails can be used as the From email field.
              </p>
              <p className="text-sm text-blue-800">
                <strong>Domain Verification:</strong> Your domain can be registered in AWS SES in the Identity section. Once your domain is verified, any valid email address from that domain can be used as the From email field (e.g., if your domain "example.com" is verified, you can use "noreply@example.com", "support@example.com", etc.).
              </p>
              <p className="text-sm text-blue-800">
                <strong>Email Restrictions:</strong> You cannot send an email to yourself where both the "From" and "To" email addresses are the same. Additionally, Hotmail accounts do not work as the From email field.
              </p>
              <p className="text-sm text-blue-800">
                Both email logo and email footer can be configured in the <strong>Tenant Settings → Customization</strong> tab.
              </p>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-blue-900 mb-2">Email Action Icons:</p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                      <FaEnvelope className="w-6 h-6 text-yellow-700" />
                    </div>
                    <div className="flex-1 pt-1">
                      <span className="font-semibold mr-2">Send Test:</span>
                      <span>Send a test email to yourself to verify the contents</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                      <FaEnvelopeOpen className="w-6 h-6 text-green-700" />
                    </div>
                    <div className="flex-1 pt-1">
                      <span className="font-semibold mr-2">Send Bulk:</span>
                      <span>Sends email to all the event attendees registered for the event or pertinent to this event only.</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                      <FaUsers className="w-6 h-6 text-indigo-700" />
                    </div>
                    <div className="flex-1 pt-1">
                      <span className="font-semibold mr-2">Send to All Members:</span>
                      <span>This is global email to all members of the organisation</span>
                    </div>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-blue-800 mt-3 italic">
                <strong>Note:</strong> Sometimes the first email may take a minute or two to get delivered.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Event
            </label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(e.target.value ? Number(e.target.value) : undefined)}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterActive === undefined ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="mb-2">
              <p className="text-xs text-gray-500 italic">
                💡 Tip: Search by promotion name or title
              </p>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or subject..."
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!error && filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm || selectedEventId || filterActive !== undefined
            ? 'No templates match your filters'
            : 'No templates found. Create your first template to get started.'}
        </div>
      )}

      {!error && filteredTemplates.length > 0 && (
        <>
          {/* Rainbow Gradient Scrollbar Styles */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .table-scroll-container {
                overflow-x: scroll !important;
                overflow-y: visible !important;
                scrollbar-width: thin !important;
                scrollbar-color: #EC4899 #FCE7F3 !important; /* Pink thumb, pink track (Firefox) */
                -ms-overflow-style: -ms-autohiding-scrollbar !important;
              }

              /* WebKit browsers (Chrome, Safari, Edge) */
              .table-scroll-container::-webkit-scrollbar {
                height: 20px !important; /* Larger for visibility */
                display: block !important;
                -webkit-appearance: none !important;
                appearance: none !important;
              }

              .table-scroll-container::-webkit-scrollbar-track {
                background: linear-gradient(90deg, #DBEAFE, #E9D5FF, #FCE7F3, #FED7AA) !important;
                border-radius: 10px !important;
                -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
                box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
              }

              .table-scroll-container::-webkit-scrollbar-thumb {
                background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F97316) !important;
                border-radius: 10px !important;
                border: 4px solid #F3F4F6 !important;
                -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
                box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
                min-width: 50px !important; /* CRITICAL: Ensures thumb is always visible */
                background-clip: padding-box !important;
              }

              .table-scroll-container::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(90deg, #2563EB, #7C3AED, #DB2777, #EA580C) !important;
                border-color: #E5E7EB !important;
              }

              .table-scroll-container::-webkit-scrollbar-thumb:active {
                background: linear-gradient(90deg, #1D4ED8, #6D28D9, #BE185D, #C2410C) !important;
                border-color: #D1D5DB !important;
              }

              .table-scroll-container::-webkit-scrollbar-button {
                display: none !important;
              }

              .table-scroll-container::-webkit-scrollbar-corner {
                background: #E0E7FF !important;
              }

              /* Flexbox spacer for right-side centering */
              .table-scroll-container::after {
                content: '';
                display: block;
                width: 100vw; /* Full viewport width of scrollable space */
                height: 1px;
                flex-shrink: 0;
              }

              .table-scroll-container {
                display: flex !important;
              }
            `
          }} />

          {/* Outer wrapper with gradient border */}
          <div className="rounded-lg shadow w-full overflow-hidden" style={{
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
            padding: '4px'
          }}>
            {/* Inner scroll container with gradient background */}
            <div
              className="w-full table-scroll-container"
              style={{
                overflowX: 'scroll',
                overflowY: 'visible',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
                display: 'flex',
                position: 'relative',
                width: '100%',
                minHeight: '1px',
                scrollbarGutter: 'stable',
                background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
                borderRadius: '8px',
                padding: '20px'
              }}
            >
              <div className="w-full">
                <div className="mb-3 text-sm text-gray-600 italic">
                  💡 <strong>Tip:</strong> Hover over a template name to see detailed information in a popup tooltip.
                </div>
                {/* Table with semi-transparent white background */}
                <table
                  className="divide-y divide-gray-200"
                  style={{
                    width: 'max-content',
                    minWidth: 'fit-content', /* Responsive: fits content naturally */
                    flexShrink: 0,
                    background: 'rgba(255, 255, 255, 0.95)', /* Semi-transparent white */
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTemplates.map((template) => (
                <React.Fragment key={template.id}>
                  {/* Data Row */}
                  <tr className="hover:bg-gray-50">
                    <td
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onMouseEnter={(e) => handleTemplateMouseEnter(template, e)}
                      onMouseLeave={handleTemplateMouseLeave}
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {template.templateName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getEventName(template.eventId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {template.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          template.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                  {/* Actions Row with Labels */}
                  <tr className="hover:bg-gray-50 border-t border-gray-100">
                    <td colSpan={5} className="px-6 py-3">
                      <div className="flex justify-start gap-4 flex-wrap">
                        {template.id ? (
                          <Link
                            href={`/admin/newsletter-emails/${template.id}`}
                            className="flex flex-col items-center gap-1 group"
                            title="Edit (Right-click to open in new tab)"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors">
                              <FaEdit className="w-6 h-6 text-blue-700" />
                            </div>
                            <span className="text-xs text-gray-600 group-hover:text-gray-900">Edit</span>
                          </Link>
                        ) : (
                          <button
                            className="flex flex-col items-center gap-1 group"
                            title="Edit"
                            disabled
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center opacity-50">
                              <FaEdit className="w-6 h-6 text-gray-500" />
                            </div>
                            <span className="text-xs text-gray-400">Edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDuplicate(template)}
                          className="flex flex-col items-center gap-1 group"
                          title="Duplicate"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-colors">
                            <FaCopy className="w-6 h-6 text-purple-700" />
                          </div>
                          <span className="text-xs text-gray-600 group-hover:text-gray-900">Duplicate</span>
                        </button>
                        <button
                          onClick={() => onSendTest(template)}
                          className="flex flex-col items-center gap-1 group"
                          title="Send Test"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-colors">
                            <FaEnvelope className="w-6 h-6 text-yellow-700" />
                          </div>
                          <span className="text-xs text-gray-600 group-hover:text-gray-900">Send Test</span>
                        </button>
                        <button
                          onClick={() => onSendBulk(template)}
                          className="flex flex-col items-center gap-1 group"
                          title="Send Bulk"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors">
                            <FaEnvelopeOpen className="w-6 h-6 text-green-700" />
                          </div>
                          <span className="text-xs text-gray-600 group-hover:text-gray-900">Send Bulk</span>
                        </button>
                        <button
                          onClick={() => onSendToSubscribed(template)}
                          className="flex flex-col items-center gap-1 group"
                          title="Send to Subscribed Members"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors">
                            <FaUsers className="w-6 h-6 text-indigo-700" />
                          </div>
                          <span className="text-xs text-gray-600 group-hover:text-gray-900">Send to All Members</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(template)}
                          className="flex flex-col items-center gap-1 group"
                          title="Delete"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors">
                            <FaTrashAlt className="w-6 h-6 text-red-700" />
                          </div>
                          <span className="text-xs text-gray-600 group-hover:text-gray-900">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevPage}
            disabled={isPrevDisabled}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <FaChevronLeft className="h-5 w-5" />
            Previous
          </button>
          <div className="text-sm font-semibold text-gray-700">
            Page {displayPage} of {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={isNextDisabled}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            Next
            <FaChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          {totalCount > 0 ? (
            <>Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of <span className="font-medium">{totalCount}</span> templates</>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>No templates found</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                [No templates match your criteria]
              </span>
            </div>
          )}
        </div>
      </div>

      {hoveredTemplate && (
        <div
          onMouseEnter={() => {
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
          }}
          onMouseLeave={() => {
            tooltipTimer.current = setTimeout(() => {
              setHoveredTemplate(null);
              setTooltipAnchor(null);
            }, 200);
          }}
        >
          <TemplateDetailsTooltip
            template={hoveredTemplate}
            anchorRect={tooltipAnchor}
            onClose={handleTooltipClose}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && templateToDelete && (
        <DeleteConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          templateName={templateToDelete.templateName}
          deleting={deleting}
        />
      )}
    </div>
  );
}

// Delete Confirmation Dialog Component
function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  templateName,
  deleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  templateName: string;
  deleting: boolean;
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing during delete operation
    if (deleting) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Only close if clicking directly on backdrop, not on modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 min-w-[400px] max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          onClick={onClose}
          aria-label="Close"
          disabled={deleting}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6 pr-8">Delete Template</h2>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-medium mb-2">
                Are you sure you want to delete this template?
              </p>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                {templateName}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This action cannot be undone. The template will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={deleting}
              className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaBan />
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaTrashAlt />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : null;
}

