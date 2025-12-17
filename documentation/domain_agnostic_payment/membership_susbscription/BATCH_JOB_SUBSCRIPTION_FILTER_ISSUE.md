# Batch Job Subscription Filter Issue - Analysis and Solution

## Problem Summary

When triggering the batch job with a specific `stripeSubscriptionId`, the batch job:
1. **Received `stripeSubscriptionId: null`** - The parameter was not passed from backend to batch job service
2. **Loaded 0 subscriptions** - The query only processes subscriptions expiring within 7 days
3. **Did not update the database** - No subscriptions were found to process

## Root Causes

### Issue 1: `stripeSubscriptionId` Filter Not Supported

**Backend Log:**
```
WARN: stripeSubscriptionId parameter is provided but not yet supported by batch job service.
The batch job will process all subscriptions for the tenant.
stripeSubscriptionId: sub_1SeifsK5BrggeAHMBvg2XE93
```

**Batch Job Log:**
```
Received request to trigger subscription renewal job for tenant: tenant_demo_002,
stripeSubscriptionId: null
```

**Problem:** The backend receives the `stripeSubscriptionId` parameter but doesn't pass it to the batch job service.

### Issue 2: Query Filter Too Restrictive

**Current Batch Job Query:**
```sql
SELECT * FROM membership_subscription
WHERE subscription_status IN ('ACTIVE', 'TRIAL')
AND current_period_end <= CURRENT_DATE + INTERVAL '7 days'  -- Only 7 days ahead
AND cancel_at_period_end = false
ORDER BY current_period_end ASC
```

**Problem:** The query only processes subscriptions expiring within 7 days. Your subscription has:
- `current_period_end: 2026-01-14` (29 days away)
- Won't be picked up by the query

**Batch Job Log:**
```
Loaded 0 subscriptions for renewal processing
```

## Solutions

### Solution 1: Support `stripeSubscriptionId` Filter in Batch Job (Recommended)

**Location:** Batch Job Project (`E:\project_workspace\event-site-manager-batch-jobs`)

**Changes Required:**

1. **Update Batch Job Query to Support Subscription ID Filter:**

```java
@Bean
public ItemReader<MembershipSubscription> subscriptionReader() {
    JdbcCursorItemReaderBuilder<MembershipSubscription> builder =
        new JdbcCursorItemReaderBuilder<MembershipSubscription>()
            .dataSource(dataSource)
            .rowMapper(new BeanPropertyRowMapper<>(MembershipSubscription.class));

    // Build dynamic SQL based on job parameters
    JobParameters jobParameters = jobExecution.getJobParameters();
    String stripeSubscriptionId = jobParameters.getString("stripeSubscriptionId");
    String tenantId = jobParameters.getString("tenantId");

    StringBuilder sql = new StringBuilder(
        "SELECT * FROM membership_subscription WHERE 1=1 "
    );

    // Add tenant filter
    if (tenantId != null && !tenantId.isEmpty()) {
        sql.append("AND tenant_id = :tenantId ");
    }

    // Add subscription ID filter (bypasses 7-day restriction)
    if (stripeSubscriptionId != null && !stripeSubscriptionId.isEmpty()) {
        sql.append("AND stripe_subscription_id = :stripeSubscriptionId ");
    } else {
        // Only apply 7-day filter if no specific subscription ID provided
        sql.append("AND current_period_end <= CURRENT_DATE + INTERVAL '7 days' ");
    }

    sql.append("AND subscription_status IN ('ACTIVE', 'TRIAL') ");
    sql.append("AND cancel_at_period_end = false ");
    sql.append("ORDER BY current_period_end ASC");

    builder.sql(sql.toString());

    // Set parameters
    Map<String, Object> parameters = new HashMap<>();
    if (tenantId != null) {
        parameters.put("tenantId", tenantId);
    }
    if (stripeSubscriptionId != null) {
        parameters.put("stripeSubscriptionId", stripeSubscriptionId);
    }
    builder.parameterValues(parameters);

    return builder.build();
}
```

2. **Update Backend to Pass `stripeSubscriptionId` to Batch Job:**

**Location:** Backend Project (`E:\project_workspace\malayalees-us-site-boot`)

**File:** `BatchJobService.java` (or similar)

```java
public BatchJobResponse submitSubscriptionRenewalJob(BatchJobRequest request) {
    // ... existing code ...

    // Build job parameters
    JobParametersBuilder jobParametersBuilder = new JobParametersBuilder();
    jobParametersBuilder.addString("tenantId", request.getTenantId());
    jobParametersBuilder.addLong("timestamp", System.currentTimeMillis());

    // CRITICAL: Pass stripeSubscriptionId if provided
    if (request.getStripeSubscriptionId() != null &&
        !request.getStripeSubscriptionId().isEmpty()) {
        jobParametersBuilder.addString("stripeSubscriptionId",
            request.getStripeSubscriptionId());
    }

    // ... rest of job submission code ...
}
```

### Solution 2: Temporarily Update Database for Testing (Quick Fix)

If you need to test immediately without modifying the batch job code, you can temporarily update the subscription's `current_period_end` to be within 7 days:

```sql
-- Temporarily set period end to within 7 days for testing
UPDATE membership_subscription
SET current_period_end = CURRENT_DATE + INTERVAL '3 days'
WHERE stripe_subscription_id = 'sub_1SeifsK5BrggeAHMBvg2XE93'
  AND tenant_id = 'tenant_demo_002';

-- After testing, restore the correct date from Stripe
-- (The batch job will sync it from Stripe)
```

**Note:** This is only for testing. The batch job will update it with the correct Stripe value.

### Solution 3: Modify Query to Process All Subscriptions (Alternative)

If you want the batch job to process all subscriptions regardless of expiration date (for testing):

**Location:** Batch Job Project

**Change the query to:**
```sql
SELECT * FROM membership_subscription
WHERE subscription_status IN ('ACTIVE', 'TRIAL')
AND cancel_at_period_end = false
-- Remove the 7-day restriction
ORDER BY current_period_end ASC
```

**Warning:** This will process ALL active subscriptions, which may be slow for large datasets.

## Recommended Implementation Steps

1. **Immediate Fix (Testing):**
   - Use Solution 2 to temporarily set `current_period_end` within 7 days
   - Run the batch job
   - Verify it updates the subscription from Stripe

2. **Permanent Fix:**
   - Implement Solution 1 in both backend and batch job projects
   - This allows filtering by specific subscription ID for testing
   - Maintains the 7-day filter for scheduled runs (performance)

3. **Verification:**
   - Run: `node scripts/test-subscription-renewal/verify-database.js --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 --tenant-id=tenant_demo_002`
   - Check that database matches Stripe subscription state

## Expected Behavior After Fix

1. **Backend receives `stripeSubscriptionId`** ✅
2. **Backend passes it to batch job** ✅ (needs implementation)
3. **Batch job query includes subscription ID filter** ✅ (needs implementation)
4. **Batch job finds the subscription** ✅
5. **Batch job syncs from Stripe** ✅
6. **Database updated with correct period dates** ✅

## Current Database State

```sql
-- Current subscription state
SELECT
    id,
    tenant_id,
    stripe_subscription_id,
    subscription_status,
    current_period_start,
    current_period_end,
    last_reconciliation_at,
    reconciliation_status
FROM membership_subscription
WHERE stripe_subscription_id = 'sub_1SeifsK5BrggeAHMBvg2XE93'
  AND tenant_id = 'tenant_demo_002';

-- Expected after batch job runs successfully:
-- current_period_start: 2026-01-14 (or later, from Stripe)
-- current_period_end: 2026-02-14 (or later, from Stripe)
-- last_reconciliation_at: <current timestamp>
-- reconciliation_status: 'COMPLETED'
```

## Related Files

- **Backend Service:** `E:\project_workspace\malayalees-us-site-boot\src\main\java\...\BatchJobService.java`
- **Batch Job Reader:** `E:\project_workspace\event-site-manager-batch-jobs\src\main\java\...\SubscriptionRenewalBatchJobConfig.java`
- **Test Script:** `scripts/test-subscription-renewal/trigger-batch-job.js`
- **Verification Script:** `scripts/test-subscription-renewal/verify-database.js`


