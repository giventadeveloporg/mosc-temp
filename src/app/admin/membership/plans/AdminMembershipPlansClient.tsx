'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading font-semibold text-3xl text-foreground">Membership Plans</h1>
        <Button
          onClick={() => {
            setEditingPlan(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          + Create Plan
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            + Create Your First Plan
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

