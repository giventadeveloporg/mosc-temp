'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { MembershipPlanDTO } from '@/types';
import {
  deleteMembershipPlanServer,
  togglePlanActiveStatusServer,
} from '@/app/admin/membership/plans/ApiServerActions';
import { useRouter } from 'next/navigation';

interface MembershipPlanListProps {
  plans: MembershipPlanDTO[];
  onEdit: (plan: MembershipPlanDTO) => void;
}

export function MembershipPlanList({ plans, onEdit }: MembershipPlanListProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      setIsLoading(planId);
      await deleteMembershipPlanServer(planId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete plan');
    } finally {
      setIsLoading(null);
    }
  };

  const handleToggleActive = async (planId: number, currentStatus: boolean) => {
    try {
      setIsLoading(planId);
      await togglePlanActiveStatusServer(planId, !currentStatus);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update plan status');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Plan Name</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Plan Code</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Type</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Billing</th>
            <th className="text-right py-3 px-4 font-heading font-semibold text-foreground">Price</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Status</th>
            <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4 font-body text-sm text-foreground">{plan.planName}</td>
              <td className="py-3 px-4 font-body text-sm text-muted-foreground">{plan.planCode}</td>
              <td className="py-3 px-4 font-body text-sm text-foreground">{plan.planType}</td>
              <td className="py-3 px-4 font-body text-sm text-foreground">{plan.billingInterval}</td>
              <td className="py-3 px-4 font-body text-sm text-right text-foreground">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency }).format(plan.price)}
              </td>
              <td className="py-3 px-4 font-body text-sm">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {plan.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4 font-body text-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(plan)}
                    className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit"
                    disabled={isLoading === plan.id}
                  >
                    <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan.id!, plan.isActive)}
                    disabled={isLoading === plan.id}
                    className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.isActive 
                        ? 'bg-green-100 hover:bg-green-200' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={plan.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {plan.isActive ? (
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id!)}
                    disabled={isLoading === plan.id}
                    className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


