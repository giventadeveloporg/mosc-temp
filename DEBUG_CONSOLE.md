# Mobile Debug Instructions

## To see browser console logs on mobile:

1. Add this script to capture console logs:
   - Edit page.tsx to add a console interceptor
   - OR use remote debugging tools

2. Look for these specific log messages in browser console (NOT server logs):

### Expected logs when form is filled:
```
[UniversalPaymentCheckout] CRITICAL FIX: Auto-activating payment section (form is valid)
[UniversalPaymentCheckout] EFFECT TRIGGERED - Dependencies changed
[UniversalPaymentCheckout] ⚡ INITIALIZING PAYMENT SESSION
```

### Expected logs when buttons load:
```
[DESKTOP ECE] ⚡ EXPRESS CHECKOUT READY
[DESKTOP ECE] ========== PAYMENT METHODS DEBUG ==========
[DESKTOP ECE] ✅ Apple Pay: Available
[DESKTOP ECE] ✅ Google Pay: Available
```

### Expected logs when clicking Apple Pay:
```
[DESKTOP ECE] ⚡ EXPRESS CHECKOUT BUTTON CLICKED
[DESKTOP ECE] ⚡ EXPRESS CHECKOUT onConfirm TRIGGERED
```

## Quick Fix to Try

The multiple initialization issue might be fixed by not re-initializing when only customer info changes. Let me fix that now.
