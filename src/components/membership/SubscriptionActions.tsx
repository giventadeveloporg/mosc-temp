'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { MembershipSubscriptionDTO } from '@/types';
import { cancelSubscriptionServer } from '@/app/membership/manage/ApiServerActions';
import { useRouter } from 'next/navigation';

interface SubscriptionActionsProps {
  subscription: MembershipSubscriptionDTO;
}

export function SubscriptionActions({ subscription }: SubscriptionActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!subscription.id) return;

    try {
      setIsLoading(true);
      setError(null);
      await cancelSubscriptionServer(subscription.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}
      {subscription.cancelAtPeriodEnd ? (
        <div className="p-3 text-sm text-orange-800 bg-orange-100 rounded-md">
          Your subscription is scheduled to be cancelled at the end of the current billing period.
        </div>
      ) : (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading}>
              Cancel Subscription
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your subscription? Your subscription will remain active until the end of
                the current billing period ({subscription.currentPeriodEnd}), after which you will lose access to
                premium features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
                {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}



