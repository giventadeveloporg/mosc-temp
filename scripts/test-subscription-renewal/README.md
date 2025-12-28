# Subscription Renewal Testing Scripts

Automated test scripts for expediting and testing subscription renewal in Stripe test mode.

## Overview

These scripts allow you to test subscription renewal functionality without waiting for the actual billing period to end. They work with Stripe test mode subscriptions to:

1. **Expedite renewal** - Advance subscription period dates in Stripe test mode
2. **Verify database** - Compare database state with Stripe subscription state
3. **Trigger batch job** - Execute batch job on demand for testing
4. **Full test suite** - Run all tests in sequence

## Prerequisites

### Environment Variables

```bash
# Required for all scripts
export STRIPE_SECRET_KEY="sk_test_..."  # Stripe test mode secret key
export DATABASE_URL="postgresql://..."   # PostgreSQL connection string
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"  # Backend API URL
export API_JWT_USER="jwtadmin"          # Backend JWT username
export API_JWT_PASS="jwtadmin"          # Backend JWT password
export NEXT_PUBLIC_TENANT_ID="tenant_demo_002"  # Default tenant ID
```

### Node.js Dependencies

```bash
npm install --save-dev stripe pg
```

Or add to `package.json`:
```json
{
  "devDependencies": {
    "stripe": "^14.0.0",
    "pg": "^8.11.0"
  }
}
```

## Scripts

### 1. Expedite Stripe Renewal

**File:** `expedite-stripe-renewal.js`

Advances a Stripe test mode subscription's billing period to trigger renewal immediately.

```bash
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --days-to-advance=30
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--days-to-advance` (optional): Number of days to advance (default: 30)

**What it does:**
1. Retrieves current subscription from Stripe
2. Calculates new period dates
3. Updates subscription billing cycle anchor
4. Creates and pays invoice for new period
5. Verifies final subscription state

**Output:**
- Current and new period dates
- Invoice creation status
- Final subscription state

### 2. Verify Database

**File:** `verify-database.js`

Compares database subscription record with Stripe subscription state.

```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--tenant-id` (optional): Tenant ID (defaults to NEXT_PUBLIC_TENANT_ID)

**What it does:**
1. Fetches subscription from Stripe
2. Fetches subscription from database
3. Compares:
   - `current_period_start`
   - `current_period_end`
   - `subscription_status`
   - `stripe_customer_id`
4. Reports discrepancies
5. Checks reconciliation status

**Output:**
- Comparison results (matches, warnings, issues)
- Reconciliation status
- Recommendations

### 3. Trigger Batch Job

**File:** `trigger-batch-job.js`

Triggers the subscription renewal batch job manually for testing.

```bash
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --batch-size=10 \
  --max-subscriptions=100
```

**Parameters:**
- `--tenant-id` (required): Tenant ID
- `--subscription-id` (optional): Filter by specific subscription
- `--batch-size` (optional): Batch size (default: 10)
- `--max-subscriptions` (optional): Max subscriptions to process (default: 100)

**What it does:**
1. Authenticates with backend API
2. Triggers batch job endpoint
3. Reports job execution results

**Output:**
- Job execution status
- Statistics (processed, updated, skipped, errors)
- Duration

### 4. Full Test Suite

**File:** `run-full-test.sh`

Runs all tests in sequence for complete end-to-end testing.

```bash
chmod +x scripts/test-subscription-renewal/run-full-test.sh
./scripts/test-subscription-renewal/run-full-test.sh \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002 \
  --days-to-advance=30
```

**Parameters:**
- `--subscription-id` (required): Stripe subscription ID
- `--tenant-id` (optional): Tenant ID (defaults to NEXT_PUBLIC_TENANT_ID)
- `--days-to-advance` (optional): Days to advance (default: 30)

**What it does:**
1. Expedites Stripe subscription renewal
2. Waits for webhook processing
3. Verifies database state (before batch job)
4. Triggers batch job
5. Waits for batch job completion
6. Verifies final database state

**Output:**
- Complete test results
- Pass/fail status

## Quick Start Example

```bash
# Set environment variables
export STRIPE_SECRET_KEY="sk_test_..."
export DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"
export API_JWT_USER="jwtadmin"
export API_JWT_PASS="jwtadmin"
export NEXT_PUBLIC_TENANT_ID="tenant_demo_002"

# Run full test suite
./scripts/test-subscription-renewal/run-full-test.sh \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002 \
  --days-to-advance=30
```

## Testing Workflow

### Step 1: Prepare Test Subscription

Ensure you have a test subscription in the database:
```sql
SELECT id, tenant_id, user_profile_id, membership_plan_id,
       subscription_status, current_period_start, current_period_end,
       stripe_subscription_id, stripe_customer_id
FROM membership_subscription
WHERE stripe_subscription_id = 'sub_1SeifsK5BrggeAHMBvg2XE93'
  AND tenant_id = 'tenant_demo_002';
```

### Step 2: Run Expedited Renewal

```bash
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --days-to-advance=30
```

### Step 3: Verify Webhook Processing

Wait 5-10 seconds, then verify database:
```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

### Step 4: Trigger Batch Job

If webhook didn't update database, trigger batch job:
```bash
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id=tenant_demo_002 \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93
```

### Step 5: Final Verification

Verify database is in sync:
```bash
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
  --tenant-id=tenant_demo_002
```

## Troubleshooting

### Stripe API Errors

- **Error: "No such subscription"** - Check subscription ID is correct and in test mode
- **Error: "Invalid API key"** - Verify STRIPE_SECRET_KEY is set and is a test mode key
- **Error: "Cannot update subscription"** - Subscription may be canceled or in invalid state

### Database Connection Errors

- **Error: "Connection refused"** - Check DATABASE_URL and database is running
- **Error: "Authentication failed"** - Verify database credentials
- **Error: "Subscription not found"** - Check subscription exists in database with correct tenant_id

### Batch Job Errors

- **Error: "401 Unauthorized"** - Check API_JWT_USER and API_JWT_PASS
- **Error: "404 Not Found"** - Verify batch job endpoint exists in backend
- **Error: "500 Internal Server Error"** - Check backend logs for details

## Notes

- **Test Mode Only**: These scripts only work with Stripe test mode subscriptions
- **Database Safety**: Scripts are read-only for database (except batch job which updates)
- **Webhook Timing**: Allow 5-10 seconds for webhooks to process after expediting
- **Batch Job Timing**: Allow 10-30 seconds for batch job to complete

## Related Documentation

- [Subscription Renewal Batch Job Analysis](./documentation/domain_agnostic_payment/membership_susbscription/SUBSCRIPTION_RENEWAL_BATCH_JOB_ANALYSIS.html)
- [Stripe Test Mode Documentation](https://stripe.com/docs/testing)
- [Backend API Documentation](./documentation/Swagger_API_Docs/api-docs.json)




