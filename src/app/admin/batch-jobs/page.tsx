'use client';

import React, { useState } from 'react';
import AdminNavigation from '@/components/AdminNavigation';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import { FaPlay, FaSync, FaInfoCircle } from 'react-icons/fa';
import { triggerSubscriptionRenewalBatchJobServer, type BatchJobRequest, type BatchJobResponse } from './ApiServerActions';

export default function BatchJobsPage() {
  const [formData, setFormData] = useState<BatchJobRequest>({
    tenantId: '',
    stripeSubscriptionId: '',
    batchSize: 100,
    maxSubscriptions: 10000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<SaveStatus>('idle');
  const [jobMessage, setJobMessage] = useState<string>('');
  const [jobResponse, setJobResponse] = useState<BatchJobResponse | null>(null);

  const handleInputChange = (field: keyof BatchJobRequest, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJobStatus('saving');
    setJobMessage('Triggering batch job...');
    setLoading(true);

    try {
      // Build request - only include fields that have values
      const request: BatchJobRequest = {};
      if (formData.tenantId) request.tenantId = formData.tenantId;
      if (formData.stripeSubscriptionId) request.stripeSubscriptionId = formData.stripeSubscriptionId;
      if (formData.batchSize) request.batchSize = formData.batchSize;
      if (formData.maxSubscriptions) request.maxSubscriptions = formData.maxSubscriptions;

      const response = await triggerSubscriptionRenewalBatchJobServer(request);

      setJobResponse(response);
      setJobStatus('success');
      setJobMessage(`Batch job triggered successfully! Job ID: ${response.jobId}`);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          tenantId: '',
          stripeSubscriptionId: '',
          batchSize: 100,
          maxSubscriptions: 10000,
        });
        setJobStatus('idle');
        setJobMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to trigger batch job');
      setJobStatus('error');
      setJobMessage(err.message || 'Failed to trigger batch job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ paddingTop: '118px' }}>
      <AdminNavigation currentPage="batch-jobs" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
            Batch Jobs Management
          </h1>
          <p className="text-muted-foreground mb-8">
            Trigger subscription renewal batch jobs on demand for testing and manual execution.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-2">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All fields are optional - leave empty to use defaults</li>
                  <li><strong>Tenant ID:</strong> Filter by specific tenant (if empty, processes all tenants)</li>
                  <li><strong>Subscription ID:</strong> Filter by specific subscription for testing (bypasses 7-day filter)</li>
                  <li><strong>Batch Size:</strong> Number of subscriptions to process per batch (default: 100)</li>
                  <li><strong>Max Subscriptions:</strong> Maximum total subscriptions to process (default: 10000)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tenant ID */}
            <div>
              <label htmlFor="tenantId" className="block text-sm font-medium text-foreground mb-2">
                Tenant ID <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                id="tenantId"
                value={formData.tenantId || ''}
                onChange={(e) => handleInputChange('tenantId', e.target.value)}
                placeholder="e.g., tenant_demo_002"
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave empty to process all tenants. Specify to filter by tenant.
              </p>
            </div>

            {/* Stripe Subscription ID */}
            <div>
              <label htmlFor="stripeSubscriptionId" className="block text-sm font-medium text-foreground mb-2">
                Stripe Subscription ID <span className="text-muted-foreground text-xs">(Optional - for testing)</span>
              </label>
              <input
                type="text"
                id="stripeSubscriptionId"
                value={formData.stripeSubscriptionId || ''}
                onChange={(e) => handleInputChange('stripeSubscriptionId', e.target.value)}
                placeholder="e.g., sub_1SeifsK5BrggeAHMBvg2XE93"
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Specify a subscription ID to test a specific subscription. This bypasses the 7-day expiration filter.
              </p>
            </div>

            {/* Batch Size */}
            <div>
              <label htmlFor="batchSize" className="block text-sm font-medium text-foreground mb-2">
                Batch Size <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                id="batchSize"
                value={formData.batchSize || ''}
                onChange={(e) => handleInputChange('batchSize', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="100"
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Number of subscriptions to process per batch. Default: 100
              </p>
            </div>

            {/* Max Subscriptions */}
            <div>
              <label htmlFor="maxSubscriptions" className="block text-sm font-medium text-foreground mb-2">
                Max Subscriptions <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <input
                type="number"
                id="maxSubscriptions"
                value={formData.maxSubscriptions || ''}
                onChange={(e) => handleInputChange('maxSubscriptions', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="10000"
                min="1"
                max="100000"
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Maximum total subscriptions to process. Default: 10000
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSync className="animate-spin" />
                    <span>Triggering...</span>
                  </>
                ) : (
                  <>
                    <FaPlay />
                    <span>Trigger Batch Job</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Job Response */}
          {jobResponse && (
            <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h3 className="font-semibold text-green-800 mb-2">Batch Job Triggered Successfully</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Status:</strong> {jobResponse.status}</p>
                <p><strong>Job ID:</strong> {jobResponse.jobId}</p>
                <p><strong>Job Name:</strong> {jobResponse.jobName}</p>
                <p><strong>Message:</strong> {jobResponse.message}</p>
                {jobResponse.estimatedDuration && (
                  <p><strong>Estimated Duration:</strong> {jobResponse.estimatedDuration}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Dialog */}
      <SaveStatusDialog
        status={jobStatus}
        message={jobMessage}
        title={jobStatus === 'success' ? 'Batch Job Triggered' : jobStatus === 'error' ? 'Error' : 'Processing'}
        onClose={() => {
          setJobStatus('idle');
          setJobMessage('');
        }}
      />
    </div>
  );
}


