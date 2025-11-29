import { Metadata } from 'next';
import Link from 'next/link';
import { fetchMembershipPlansServer } from './plans/ApiServerActions';

export const metadata: Metadata = {
  title: 'Membership',
  description: 'Join our membership program and enjoy exclusive benefits',
};

export default async function MembershipPage() {
  let plans = [];
  let error = null;

  try {
    plans = await fetchMembershipPlansServer({ isActive: true, sort: 'price,asc' });
  } catch (err) {
    console.error('Failed to fetch membership plans:', err);
    error = err instanceof Error ? err.message : 'Failed to load membership plans';
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Membership
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-3xl mx-auto">
            Join our community and unlock exclusive benefits, access to events, and more.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-body">{error}</p>
          </div>
        )}

        {/* Membership Plans Preview */}
        {plans.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
              Available Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {plans.slice(0, 3).map((plan: any) => (
                <div
                  key={plan.id}
                  className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    ${plan.price}
                    {plan.billingPeriod && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.billingPeriod}
                      </span>
                    )}
                  </p>
                  {plan.description && (
                    <p className="text-sm font-body text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/membership/plans"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                View All Plans
              </Link>
            </div>
          </div>
        )}

        {/* Membership Benefits Section */}
        <div className="bg-card rounded-lg p-8 border border-border">
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
            Membership Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Exclusive Access
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Get early access to events, workshops, and special programs
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Member Discounts
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Enjoy special pricing on events, merchandise, and services
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Community Network
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Connect with like-minded individuals and expand your network
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-1">
                  Priority Support
                </h3>
                <p className="text-sm font-body text-muted-foreground">
                  Receive priority customer support and assistance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link
            href="/membership/plans"
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition-colors"
          >
            Explore Membership Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

