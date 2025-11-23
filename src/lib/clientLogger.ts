/**
 * Client-side logging utility that forwards logs to server for CloudWatch visibility
 *
 * This utility allows client-side code to log messages that will appear in CloudWatch logs,
 * making it easier to debug mobile browser issues without requiring remote debugging.
 *
 * Usage:
 *   import { clientLogger } from '@/lib/clientLogger';
 *
 *   clientLogger.log('User clicked button', { buttonId: 'checkout' });
 *   clientLogger.error('API call failed', { status: 404, url: '/api/...' });
 *   clientLogger.critical('Payment failed', { transactionId: '123' });
 */

type LogLevel = 'log' | 'warn' | 'error' | 'critical';

interface LogData {
  level: LogLevel;
  message: string;
  data?: any;
  component?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
}

/**
 * Forward log to server-side endpoint (appears in CloudWatch)
 *
 * This function sends logs asynchronously and does not block the UI.
 * If the request fails, it silently fails to prevent breaking the app.
 */
async function forwardLogToServer(logData: LogData) {
  // Only forward logs in production or when explicitly enabled
  const shouldForward =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING === 'true';

  if (!shouldForward) {
    return; // Skip forwarding in development unless explicitly enabled
  }

  try {
    // Don't block the UI - send asynchronously without awaiting
    fetch('/api/logs/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...logData,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      }),
      // Don't wait for response - fire and forget
    }).catch((err) => {
      // Silently fail - don't break the app if logging fails
      // Only log to console if in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ClientLogger] Failed to forward log to server:', err);
      }
    });
  } catch (error) {
    // Silently fail - don't break the app
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ClientLogger] Error forwarding log:', error);
    }
  }
}

/**
 * Enhanced console logger that also forwards to CloudWatch
 */
export const clientLogger = {
  /**
   * Log informational messages
   */
  log: (message: string, data?: any, component?: string) => {
    console.log(message, data);
    forwardLogToServer({ level: 'log', message, data, component });
  },

  /**
   * Log warning messages
   */
  warn: (message: string, data?: any, component?: string) => {
    console.warn(message, data);
    forwardLogToServer({ level: 'warn', message, data, component });
  },

  /**
   * Log error messages
   */
  error: (message: string, data?: any, component?: string) => {
    console.error(message, data);
    forwardLogToServer({ level: 'error', message, data, component });
  },

  /**
   * Log critical errors (highest priority)
   */
  critical: (message: string, data?: any, component?: string) => {
    console.error(`[CRITICAL] ${message}`, data);
    forwardLogToServer({ level: 'critical', message, data, component });
  },
};

/**
 * Create a component-specific logger
 *
 * Usage:
 *   const logger = createComponentLogger('CheckoutPage');
 *   logger.log('User clicked button');
 *   logger.error('API failed');
 */
export function createComponentLogger(component: string) {
  return {
    log: (message: string, data?: any) => clientLogger.log(message, data, component),
    warn: (message: string, data?: any) => clientLogger.warn(message, data, component),
    error: (message: string, data?: any) => clientLogger.error(message, data, component),
    critical: (message: string, data?: any) => clientLogger.critical(message, data, component),
  };
}

