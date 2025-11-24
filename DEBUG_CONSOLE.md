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

## Fixes Applied

### 1. Payment Flickering (FIXED ✅)
**Root Cause**: customerName and customerPhone in useEffect dependencies
- Every keystroke in name/phone fields triggered payment re-initialization
- Server logs showed duplicate initializations 59ms apart

**Solution**: Removed customerName and customerPhone from useEffect dependency array
- Customer info doesn't need to trigger re-initialization
- It's just passed in the payment session request

### 2. Payment Options Not Showing (FIXED ✅)
**Root Cause**: IntersectionObserver only activated payment section when scrolled into view
- If form was completed before scrolling, payment options never appeared

**Solution**: Auto-activate payment section when form is valid
- No longer waits for scroll position
- Activates immediately when tickets selected + email entered

### 3. Debug Log Viewer Infinite Re-render (FIXED ✅)
**Root Cause**: setState inside console.log interceptor
- console.log → setState → render → console.log → infinite loop

**Solution**: Use ref to store logs instead of state
- Logs stored in debugLogsRef (doesn't trigger re-renders)
- Only convert to state when user opens the debug panel

## Testing the Fixes

1. Refresh the page: https://www.mosc-temp.com/events/2/checkout
2. Fill out the form - flickering should be GONE
3. Payment options should appear immediately (no need to reselect tickets)
4. Click "Show Debug Logs" button (bottom-right) to view browser console logs
5. Try clicking Apple Pay and check the debug logs for button events
