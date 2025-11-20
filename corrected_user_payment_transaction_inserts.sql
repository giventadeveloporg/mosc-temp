-- Corrected INSERT statements for user_payment_transaction table
-- Removed columns: settlement_batch_id, platform_invoice_id, manual_payment_reference
-- These columns were removed during refactoring and no longer exist in the schema

-- Pattern: Remove the last 3 columns from each INSERT statement
-- Original had: settlement_batch_id, platform_invoice_id, manual_payment_reference
-- These should be removed from all INSERT statements

-- Example of corrected INSERT (first few records):

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    1, 'tenant_demo_001', 'TICKET_SALE', 100.00, 'USD',
    NULL, NULL,
    0.00, 0.00, 'COMPLETED', 0.00,
    NULL, NULL, 'CARD',
    NULL, NULL, 1, 1,
    '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757'
);

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    2, 'tenant_demo_001', 'SUBSCRIPTION', 200.00, 'USD',
    NULL, NULL,
    0.00, 0.00, 'COMPLETED', 0.00,
    NULL, NULL, 'CARD',
    NULL, NULL, 2, NULL,
    '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757'
);

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    3, 'tenant_demo_001', 'COMMISSION', 50.00, 'USD',
    NULL, NULL,
    0.00, 0.00, 'PENDING', 0.00,
    NULL, NULL, 'CASH',
    NULL, NULL, 3, 2,
    '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757'
);

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    4, 'tenant_demo_001', 'REFUND', 75.00, 'USD',
    NULL, NULL,
    0.00, 0.00, 'FAILED', 0.00,
    NULL, NULL, 'CARD',
    NULL, NULL, 4, 3,
    '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757'
);

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    5, 'tenant_demo_001', 'TICKET_SALE', 120.00, 'USD',
    NULL, NULL,
    0.00, 0.00, 'COMPLETED', 0.00,
    NULL, NULL, 'CARD',
    NULL, NULL, 5, 4,
    '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757'
);

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    6, 'tenant_demo_001', 'SUBSCRIPTION', 60.00, 'USD',
    NULL, NULL,
    0.00, 0.00, 'REFUNDED', 0.00,
    NULL, NULL, 'CASH',
    NULL, NULL, 6, NULL,
    '2025-06-22 11:31:27.614757', '2025-06-22 11:31:27.614757'
);

-- For all remaining INSERT statements (IDs 4351 onwards),
-- remove the last 3 values: settlement_batch_id, platform_invoice_id, manual_payment_reference
--
-- Example transformation:
-- OLD: ..., NULL, NULL, NULL);
-- NEW: ...);
--
-- The corrected pattern for tenant_demo_002 records should be:

INSERT INTO public.user_payment_transaction (
    id, tenant_id, transaction_type, amount, currency,
    stripe_payment_intent_id, stripe_transfer_group,
    platform_fee_amount, tenant_amount, status, processing_fee,
    metadata, external_transaction_id, payment_method,
    failure_reason, reconciliation_date, event_id, ticket_transaction_id,
    created_at, updated_at
) VALUES (
    4351, 'tenant_demo_002', 'TICKET_SALE', 20.00, 'USD',
    NULL, NULL,
    NULL, NULL, 'PENDING', NULL,
    '{"externalTransactionId":"pi_3STD6GK5BrggeAHM08f9v2YJ","stripePaymentIntentId":"pi_3STD6GK5BrggeAHM08f9v2YJ"}',
    'pi_3STD6GK5BrggeAHM08f9v2YJ', NULL,
    NULL, NULL, NULL, NULL,
    '2025-11-14 02:50:59.298721', '2025-11-14 02:50:59.298721'
);

-- Continue this pattern for all remaining INSERT statements
-- Remove: settlement_batch_id, platform_invoice_id, manual_payment_reference from column list
-- Remove: the last 3 NULL values from VALUES clause



