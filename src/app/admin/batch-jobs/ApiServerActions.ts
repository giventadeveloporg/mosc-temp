"use server";
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl } from '@/lib/env';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface BatchJobRequest {
  tenantId?: string;
  stripeSubscriptionId?: string;
  batchSize?: number;
  maxSubscriptions?: number;
}

export interface BatchJobResponse {
  status: string;
  jobId: string;
  jobName: string;
  message: string;
  estimatedDuration?: string;
  request?: BatchJobRequest;
}

/**
 * Trigger subscription renewal batch job
 */
export async function triggerSubscriptionRenewalBatchJobServer(
  request: BatchJobRequest
): Promise<BatchJobResponse> {
  if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable is not set');
  }

  const response = await fetchWithJwtRetry(
    `${API_BASE_URL}/api/cron/subscription-renewal`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': request.tenantId || '',
      },
      body: JSON.stringify(request),
      cache: 'no-store',
    },
    'batch-job-trigger'
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to trigger batch job: ${response.status} ${errorText}`);
  }

  return await response.json();
}

