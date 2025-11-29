'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cancelUserSubscriptionServer, getSubscriptionDetailsServer } from './ApiServerActions';
import type { MembershipSubscriptionDTO } from '@/types';

interface AdminSubscriptionsClientProps {
  subscriptions: MembershipSubscriptionDTO[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  error: string | null;
}

export function AdminSubscriptionsClient({
  subscriptions,
  totalCount,
  currentPage,
  pageSize,
  error,
}: AdminSubscriptionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<MembershipSubscriptionDTO | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const currentStatus = searchParams.get('status') || '';

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = (currentPage - 1) * pageSize + subscriptions.length;

  const handleCancel = async (subscriptionId: number) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;
    try {
      setIsLoading(subscriptionId);
      await cancelUserSubscriptionServer(subscriptionId);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(null);
    }
  };

  const handleViewDetails = async (subscriptionId: number) => {
    try {
      setIsLoading(subscriptionId);
      const details = await getSubscriptionDetailsServer(subscriptionId);
      if (details) {
        setSelectedSubscription(details);
        setShowDetailsModal(true);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load subscription details');
    } finally {
      setIsLoading(null);
    }
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1'); // Reset to first page when filtering
    router.push(`/admin/membership/subscriptions?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
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
        <h1 className="font-heading font-semibold text-3xl text-foreground">User Subscriptions</h1>
      </div>

      {/* Status Filter */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select
          value={currentStatus}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="border border-gray-400 rounded-xl px-4 py-2 text-base focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="TRIAL">Trial</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PAST_DUE">Past Due</option>
          <option value="EXPIRED">Expired</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="font-body text-muted-foreground">No subscriptions found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">User</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Plan</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Period Start</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Period End</th>
                  <th className="text-left py-3 px-4 font-heading font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {subscription.userProfile?.firstName} {subscription.userProfile?.lastName}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-muted-foreground">
                      {subscription.userProfile?.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {subscription.membershipPlan?.planName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-body text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          subscription.subscriptionStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : subscription.subscriptionStatus === 'TRIAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscription.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {formatDate(subscription.currentPeriodStart)}
                    </td>
                    <td className="py-3 px-4 font-body text-sm text-foreground">
                      {formatDate(subscription.currentPeriodEnd)}
                    </td>
                    <td className="py-3 px-4 font-body text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => subscription.id && handleViewDetails(subscription.id)}
                          disabled={isLoading === subscription.id}
                          className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View Details"
                          aria-label="View subscription details"
                        >
                          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {subscription.subscriptionStatus === 'ACTIVE' || subscription.subscriptionStatus === 'TRIAL' ? (
                          <button
                            onClick={() => subscription.id && handleCancel(subscription.id)}
                            disabled={isLoading === subscription.id}
                            className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel Subscription"
                            aria-label="Cancel subscription"
                          >
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <button
                  disabled={!hasPrevPage}
                  onClick={() => router.push(`/admin/membership/subscriptions?page=${currentPage - 1}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <div className="text-sm font-semibold">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  disabled={!hasNextPage}
                  onClick={() => router.push(`/admin/membership/subscriptions?page=${currentPage + 1}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Showing {startItem} to {endItem} of {totalCount} items
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-2xl text-foreground">Subscription Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSubscription(null);
                }}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="text-sm text-foreground">
                    {selectedSubscription.userProfile?.firstName} {selectedSubscription.userProfile?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedSubscription.userProfile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan</label>
                  <p className="text-sm text-foreground">{selectedSubscription.membershipPlan?.planName || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-sm text-foreground">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        selectedSubscription.subscriptionStatus === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : selectedSubscription.subscriptionStatus === 'TRIAL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedSubscription.subscriptionStatus}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Cancel at Period End</label>
                  <p className="text-sm text-foreground">{selectedSubscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Period Start</label>
                  <p className="text-sm text-foreground">{formatDate(selectedSubscription.currentPeriodStart)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Period End</label>
                  <p className="text-sm text-foreground">{formatDate(selectedSubscription.currentPeriodEnd)}</p>
                </div>
              </div>

              {selectedSubscription.trialStart && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trial Start</label>
                    <p className="text-sm text-foreground">{formatDate(selectedSubscription.trialStart)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Trial End</label>
                    <p className="text-sm text-foreground">{formatDate(selectedSubscription.trialEnd || '')}</p>
                  </div>
                </div>
              )}

              {selectedSubscription.cancelledAt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Cancelled At</label>
                  <p className="text-sm text-foreground">{formatDate(selectedSubscription.cancelledAt)}</p>
                  {selectedSubscription.cancellationReason && (
                    <>
                      <label className="text-sm font-medium text-gray-700 mt-2 block">Cancellation Reason</label>
                      <p className="text-sm text-foreground">{selectedSubscription.cancellationReason}</p>
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Stripe Subscription ID</label>
                  <p className="text-sm text-foreground font-mono">{selectedSubscription.stripeSubscriptionId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Stripe Customer ID</label>
                  <p className="text-sm text-foreground font-mono">{selectedSubscription.stripeCustomerId || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-sm text-foreground">{formatDate(selectedSubscription.createdAt || '')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Updated At</label>
                  <p className="text-sm text-foreground">{formatDate(selectedSubscription.updatedAt || '')}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSubscription(null);
                }}
                variant="outline"
                className="bg-teal-100 hover:bg-teal-200 text-teal-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

