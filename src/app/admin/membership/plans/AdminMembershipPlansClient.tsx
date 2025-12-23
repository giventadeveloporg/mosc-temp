'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AdminNavigation from '@/components/AdminNavigation';
import { MembershipPlanList } from '@/components/admin/membership/MembershipPlanList';
import { MembershipPlanForm } from '@/components/admin/membership/MembershipPlanForm';
import {
  createMembershipPlanServer,
  updateMembershipPlanServer,
} from './ApiServerActions';
import type { MembershipPlanDTO } from '@/types';
import { useRouter } from 'next/navigation';

interface AdminMembershipPlansClientProps {
  plans: MembershipPlanDTO[];
  error: string | null;
}

export function AdminMembershipPlansClient({ plans: initialPlans, error }: AdminMembershipPlansClientProps) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlanDTO | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const handleEdit = (plan: MembershipPlanDTO) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormError(null);
  };

  const handleSubmit = async (formData: Partial<MembershipPlanDTO>) => {
    startTransition(async () => {
      try {
        setFormError(null);

        // Clean up form data - remove undefined values and ensure proper types
        const cleanedData: Partial<MembershipPlanDTO> = {
          ...formData,
          // Ensure number fields are properly handled
          maxEventsPerMonth: formData.maxEventsPerMonth === undefined || formData.maxEventsPerMonth === null || formData.maxEventsPerMonth === ''
            ? undefined
            : Number(formData.maxEventsPerMonth),
          maxAttendeesPerEvent: formData.maxAttendeesPerEvent === undefined || formData.maxAttendeesPerEvent === null || formData.maxAttendeesPerEvent === ''
            ? undefined
            : Number(formData.maxAttendeesPerEvent),
          // Ensure price is a number
          price: Number(formData.price) || 0,
          // Ensure trialDays is a number
          trialDays: Number(formData.trialDays) || 0,
          // Keep featuresJson as object - server action will convert to string for backend
          featuresJson: (() => {
            if (typeof formData.featuresJson === 'string') {
              try {
                return JSON.parse(formData.featuresJson);
              } catch {
                return {};
              }
            }
            return formData.featuresJson || {};
          })(),
          // Ensure Stripe IDs are strings or undefined
          stripePriceId: formData.stripePriceId || undefined,
          stripeProductId: formData.stripeProductId || undefined,
        };

        let updatedPlan: MembershipPlanDTO;

        if (editingPlan?.id) {
          // For update, include id and remove undefined fields
          const { id, createdAt, updatedAt, ...updateData } = cleanedData;
          updatedPlan = await updateMembershipPlanServer(editingPlan.id, updateData);
        } else {
          // For create, exclude id and ensure all required fields are present
          const { id, createdAt, updatedAt, ...createData } = cleanedData;
          // Remove empty string Stripe IDs
          if (createData.stripePriceId === '') delete createData.stripePriceId;
          if (createData.stripeProductId === '') delete createData.stripeProductId;
          updatedPlan = await createMembershipPlanServer(createData as Omit<MembershipPlanDTO, 'id' | 'createdAt' | 'updatedAt'>);
        }

        setPlans((prev) => {
          if (editingPlan?.id) {
            return prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
          }
          return [...prev, updatedPlan];
        });

        handleCloseModal();
        router.refresh();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Failed to save plan');
      }
    });
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center mb-8">
        <Link
          href="/admin"
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Admin"
          aria-label="Back to Admin"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Back to Admin</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership Plans</h1>
          <p className="text-gray-600">
            Create, edit, and manage all membership plans in the system.
          </p>
        </div>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="membership-plans" />

      {/* Create Plan Button */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105"
          title="Create Plan"
          aria-label="Create Plan"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Create Plan</span>
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="font-body text-lg text-muted-foreground mb-6">No membership plans found.</p>
          <Button
            onClick={() => {
              setEditingPlan(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 transition-all duration-300 hover:scale-105 mx-auto"
            title="Create Your First Plan"
            aria-label="Create Your First Plan"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Create Your First Plan</span>
          </Button>
        </div>
      ) : (
        <MembershipPlanList
          plans={plans}
          onEdit={handleEdit}
          onPlanUpdate={(updatedPlan) => {
            setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
          }}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              {editingPlan ? 'Edit Plan' : 'Create Plan'}
            </h2>
            {formError && (
              <div className="mb-4 p-3 text-sm text-red-800 bg-red-100 rounded-md">
                {formError}
              </div>
            )}
            <MembershipPlanForm
              plan={editingPlan}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              isLoading={isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

