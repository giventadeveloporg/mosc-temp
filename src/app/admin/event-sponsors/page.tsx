'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import AdminNavigation from '@/components/AdminNavigation';
import SponsorImageUploadDialog from '@/components/sponsors/SponsorImageUploadDialog';
import SponsorMediaGallery from '@/components/sponsors/SponsorMediaGallery';
import type { EventSponsorsDTO } from '@/types';
import {
  fetchEventSponsorsServer,
  createEventSponsorServer,
  updateEventSponsorServer,
  deleteEventSponsorServer,
} from './ApiServerActions';
import { fetchAdminProfileServer } from '../manage-usage/ApiServerActions';

export default function EventSponsorsPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // User role state
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<EventSponsorsDTO | null>(null);

  // Form state - aligned with DTO schema
  const [formData, setFormData] = useState<Partial<EventSponsorsDTO>>({
    name: '',
    type: '',
    companyName: '',
    tagline: '',
    description: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
    logoUrl: '',
    heroImageUrl: '',
    bannerImageUrl: '',
    isActive: true,
    priorityRanking: 1,
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    instagramUrl: '',
  });

  // Upload dialog states
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [heroUploadOpen, setHeroUploadOpen] = useState(false);
  const [bannerUploadOpen, setBannerUploadOpen] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (userId) {
      checkUserRole();
      loadSponsors();
    }
  }, [userId, page]);

  const checkUserRole = async () => {
    if (!userId) return;
    try {
      const profile = await fetchAdminProfileServer(userId);
      setIsAdmin(profile?.userRole === 'ADMIN');
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadSponsors = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchEventSponsorsServer(page, pageSize);
      setSponsors(result.data || []);
      setTotalCount(result.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load sponsors');
      setToastMessage({ type: 'error', message: err.message || 'Failed to load sponsors' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor name is required' });
        return;
      }
      if (!formData.type?.trim()) {
        setToastMessage({ type: 'error', message: 'Sponsor type is required' });
        return;
      }

      setLoading(true);
      const sponsorData: Omit<EventSponsorsDTO, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name!.trim(),
        type: formData.type!.trim(),
        companyName: formData.companyName?.trim() || undefined,
        tagline: formData.tagline?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        websiteUrl: formData.websiteUrl?.trim() || undefined,
        contactEmail: formData.contactEmail?.trim() || undefined,
        contactPhone: formData.contactPhone?.trim() || undefined,
        logoUrl: formData.logoUrl?.trim() || undefined,
        heroImageUrl: formData.heroImageUrl?.trim() || undefined,
        bannerImageUrl: formData.bannerImageUrl?.trim() || undefined,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
        priorityRanking: formData.priorityRanking || 1,
        facebookUrl: formData.facebookUrl?.trim() || undefined,
        twitterUrl: formData.twitterUrl?.trim() || undefined,
        linkedinUrl: formData.linkedinUrl?.trim() || undefined,
        instagramUrl: formData.instagramUrl?.trim() || undefined,
      };

      const newSponsor = await createEventSponsorServer(sponsorData);
      setIsCreateModalOpen(false);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor created successfully. You can now upload images when editing the sponsor.' });
      // Reload sponsors to ensure fresh data
      await loadSponsors();
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to create sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      const updatedSponsor = await updateEventSponsorServer(selectedSponsor.id!, formData);
      setSponsors(prev => prev.map(s => s.id === selectedSponsor.id ? updatedSponsor : s));
      setIsEditModalOpen(false);
      setSelectedSponsor(null);
      resetForm();
      setToastMessage({ type: 'success', message: 'Sponsor updated successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to update sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSponsor) return;

    try {
      setLoading(true);
      await deleteEventSponsorServer(selectedSponsor.id!);
      setSponsors(prev => prev.filter(s => s.id !== selectedSponsor.id));
      setIsDeleteModalOpen(false);
      setSelectedSponsor(null);
      setToastMessage({ type: 'success', message: 'Sponsor deleted successfully' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete sponsor' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      companyName: '',
      tagline: '',
      description: '',
      websiteUrl: '',
      contactEmail: '',
      contactPhone: '',
      logoUrl: '',
      heroImageUrl: '',
      bannerImageUrl: '',
      isActive: true,
      priorityRanking: 1,
      facebookUrl: '',
      twitterUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
    });
  };

  const openEditModal = (sponsor: EventSponsorsDTO) => {
    // Navigate to detail/edit page instead of opening modal
    router.push(`/admin/event-sponsors/${sponsor.id}`);
  };

  const openDeleteModal = (sponsor: EventSponsorsDTO) => {
    setSelectedSponsor(sponsor);
    setIsDeleteModalOpen(true);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  // Filter sponsors based on search and filters
  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = !searchTerm ||
      sponsor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || sponsor.type === filterType;
    const matchesActive = filterActive === 'all' ||
      (filterActive === 'active' && sponsor.isActive) ||
      (filterActive === 'inactive' && !sponsor.isActive);

    return matchesSearch && matchesType && matchesActive;
  });

  // Sort filtered sponsors
  const sortedSponsors = [...filteredSponsors].sort((a, b) => {
    if (!sortKey) return 0;

    const aVal = a[sortKey as keyof EventSponsorsDTO];
    const bVal = b[sortKey as keyof EventSponsorsDTO];

    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Get unique sponsor types for filter
  const sponsorTypes = Array.from(new Set(sponsors.map(s => s.type).filter(Boolean))).sort();

  const columns: Column<EventSponsorsDTO>[] = [
    {
      key: 'name',
      label: 'Sponsor Name',
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
      render: (value) => value || '-'
    },
    {
      key: 'priorityRanking',
      label: 'Priority',
      sortable: true,
      render: (value) => value || 0
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="font-body text-lg text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      <h1 className="font-heading font-semibold text-3xl text-foreground mb-2">Global Sponsors</h1>
      <p className="font-body text-muted-foreground mb-8">(You can add or disassociate these items with any events. Please go to the corresponding event page to manage these associated entities.)</p>
      <AdminNavigation currentPage="event-sponsors" />

      {/* Toast Message */}
      {toastMessage && (
        <div className={`mb-4 p-4 rounded-lg sacred-shadow ${
          toastMessage.type === 'success'
            ? 'bg-success/10 border border-success/20 text-success'
            : 'bg-destructive/10 border border-destructive/20 text-destructive'
        }`}>
          {toastMessage.message}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-card rounded-lg sacred-shadow border border-border p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sponsors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-border rounded-lg bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <FaFilter className="text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            >
              <option value="">All Types</option>
              {sponsorTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg sacred-shadow font-medium flex items-center gap-2 reverent-transition"
          >
            <FaPlus />
            Add Sponsor
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <DataTable
        data={sortedSponsors}
        columns={columns}
        loading={loading}
        onSort={handleSort}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        onView={openEditModal} // Use onView for row clicks to navigate
        sortKey={sortKey}
        sortDirection={sortDirection}
        emptyMessage="No sponsors found"
      />

      {/* Pagination Controls - Matching admin home page style */}
      {!loading && totalCount > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <FaChevronLeft />
              Previous
            </button>
            <div className="text-sm font-semibold">
              Page {page + 1} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </div>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={page >= Math.ceil(totalCount / pageSize) - 1}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            Showing {totalCount > 0 ? page * pageSize + 1 : 0} to {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} sponsors
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
          setLogoUploadOpen(false);
          setHeroUploadOpen(false);
          setBannerUploadOpen(false);
        }}
        title="Add Event Sponsor"
        size="xl"
      >
        <SponsorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          loading={loading}
          submitText="Create Sponsor"
          onLogoUploadClick={() => setLogoUploadOpen(true)}
          onHeroUploadClick={() => setHeroUploadOpen(true)}
          onBannerUploadClick={() => setBannerUploadOpen(true)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSponsor(null);
          resetForm();
          setLogoUploadOpen(false);
          setHeroUploadOpen(false);
          setBannerUploadOpen(false);
        }}
        title="Edit Event Sponsor"
        size="xl"
      >
        <SponsorForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEdit}
          loading={loading}
          submitText="Update Sponsor"
          onLogoUploadClick={() => setLogoUploadOpen(true)}
          onHeroUploadClick={() => setHeroUploadOpen(true)}
          onBannerUploadClick={() => setBannerUploadOpen(true)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSponsor(null);
        }}
        onConfirm={handleDelete}
        title="Delete Sponsor"
        message={`Are you sure you want to delete "${selectedSponsor?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Upload Dialogs */}
      {formData.id && (
        <>
          <SponsorImageUploadDialog
            sponsor={formData as EventSponsorsDTO}
            imageType="logo"
            isOpen={logoUploadOpen}
            onClose={() => setLogoUploadOpen(false)}
            onUploadSuccess={async (imageUrl) => {
              setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
              await loadSponsors(); // Refresh to get updated data
            }}
            eventId={0}
          />
          <SponsorImageUploadDialog
            sponsor={formData as EventSponsorsDTO}
            imageType="hero"
            isOpen={heroUploadOpen}
            onClose={() => setHeroUploadOpen(false)}
            onUploadSuccess={async (imageUrl) => {
              setFormData(prev => ({ ...prev, heroImageUrl: imageUrl }));
              await loadSponsors(); // Refresh to get updated data
            }}
            eventId={0}
          />
          <SponsorImageUploadDialog
            sponsor={formData as EventSponsorsDTO}
            imageType="banner"
            isOpen={bannerUploadOpen}
            onClose={() => setBannerUploadOpen(false)}
            onUploadSuccess={async (imageUrl) => {
              setFormData(prev => ({ ...prev, bannerImageUrl: imageUrl }));
              await loadSponsors(); // Refresh to get updated data
            }}
            eventId={0}
          />
        </>
      )}
    </div>
  );
}

// Sponsor Form Component
interface SponsorFormProps {
  formData: Partial<EventSponsorsDTO>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<EventSponsorsDTO>>>;
  onSubmit: () => void;
  loading: boolean;
  submitText: string;
  onLogoUploadClick?: () => void;
  onHeroUploadClick?: () => void;
  onBannerUploadClick?: () => void;
}

function SponsorForm({ formData, setFormData, onSubmit, loading, submitText, onLogoUploadClick, onHeroUploadClick, onBannerUploadClick }: SponsorFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const sponsorTypes = [
    'Platinum',
    'Gold',
    'Silver',
    'Bronze',
    'Community Partner',
    'Media Partner',
    'Food & Beverage',
    'Entertainment',
    'Other'
  ];

  // Note: ImageUpload requires eventId. For main sponsors page, we'll use a default eventId of 0
  // or only show image uploads after sponsor is created (when formData.id exists)
  // For now, we'll show image uploads only when editing (formData.id exists)
  const canUploadImages = !!formData.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Sponsor Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            required
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter sponsor name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Type *
          </label>
          <select
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            required
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
          >
            <option value="">Select sponsor type</option>
            {sponsorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Priority Ranking *
          </label>
          <input
            type="number"
            name="priorityRanking"
            value={formData.priorityRanking || 1}
            onChange={handleChange}
            min="1"
            required
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter priority ranking (1 = highest priority)"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers indicate higher priority (1 = highest priority)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Contact Email
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter contact email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Contact Phone
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="Enter contact phone"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Website URL
          </label>
          <input
            type="url"
            name="websiteUrl"
            value={formData.websiteUrl || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive || false}
            onChange={handleChange}
            className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
          />
          <label className="ml-2 block text-sm text-foreground">
            Active Sponsor
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Tagline
        </label>
        <input
          type="text"
          name="tagline"
          value={formData.tagline || ''}
          onChange={handleChange}
          maxLength={500}
          className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
          placeholder="Enter sponsor tagline (max 500 characters)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={4}
          className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
          placeholder="Enter detailed description about the sponsor"
        />
      </div>

      {/* Social Media Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Facebook URL
          </label>
          <input
            type="url"
            name="facebookUrl"
            value={formData.facebookUrl || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://facebook.com/sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Twitter URL
          </label>
          <input
            type="url"
            name="twitterUrl"
            value={formData.twitterUrl || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://twitter.com/sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            LinkedIn URL
          </label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://linkedin.com/company/sponsor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Instagram URL
          </label>
          <input
            type="url"
            name="instagramUrl"
            value={formData.instagramUrl || ''}
            onChange={handleChange}
            className="w-full border border-border rounded-lg px-3 py-2 bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring reverent-transition"
            placeholder="https://instagram.com/sponsor"
          />
        </div>
      </div>

      {/* Image Upload Section - Only show when editing (sponsor ID exists) */}
      {canUploadImages && (
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-heading font-medium text-foreground mb-4">Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Logo Image
              </label>
              {formData.logoUrl && (
                <div className="mb-2">
                  <img
                    src={formData.logoUrl}
                    alt="Logo"
                    className="h-20 w-auto rounded border border-border"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onLogoUploadClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                disabled={loading || !formData.id}
              >
                {formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hero Image
              </label>
              {formData.heroImageUrl && (
                <div className="mb-2">
                  <img
                    src={formData.heroImageUrl}
                    alt="Hero"
                    className="h-20 w-auto rounded border border-border"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onHeroUploadClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                disabled={loading || !formData.id}
              >
                {formData.heroImageUrl ? 'Change Hero Image' : 'Upload Hero Image'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Banner Image
              </label>
              {formData.bannerImageUrl && (
                <div className="mb-2">
                  <img
                    src={formData.bannerImageUrl}
                    alt="Banner"
                    className="h-20 w-auto rounded border border-border"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onBannerUploadClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md reverent-transition text-sm"
                disabled={loading || !formData.id}
              >
                {formData.bannerImageUrl ? 'Change Banner' : 'Upload Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!canUploadImages && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Image uploads will be available after the sponsor is created. Save the sponsor first, then edit it to upload images.
          </p>
        </div>
      )}

      {/* Media Gallery Section */}
      {canUploadImages && formData.id && (
        <div className="border-t border-border pt-6 mt-6">
          <h3 className="text-lg font-heading font-medium text-foreground mb-4">Media Gallery</h3>
          <p className="text-sm font-body text-muted-foreground mb-4">
            Upload and manage multiple media files for this sponsor. Files are sorted by priority ranking (lower = higher priority).
          </p>
          <SponsorMediaGallery
            sponsorId={formData.id}
            showPriorityControls={true}
            allowUpload={false}
            onPriorityChange={async (mediaId, priorityRanking) => {
              // Priority change handled by component
            }}
          />
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring reverent-transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring reverent-transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
}
