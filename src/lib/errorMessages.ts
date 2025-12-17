/**
 * Utility functions for parsing backend error messages and providing user-friendly feedback
 */

interface BackendError {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  message?: string;
  path?: string;
}

/**
 * Extracts a user-friendly error message from backend error responses
 * @param err - The error object from the backend
 * @param fallbackMessage - Default message if parsing fails
 * @returns A user-friendly error message
 */
export function parseBackendError(err: any, fallbackMessage: string = 'An error occurred'): string {
  if (!err) return fallbackMessage;

  // If err.message exists and is a string, try to parse it
  if (err.message && typeof err.message === 'string') {
    try {
      // Try to parse as JSON
      const errorObj: BackendError = JSON.parse(err.message);
      return extractFriendlyMessage(errorObj, fallbackMessage);
    } catch (e) {
      // Not JSON, check if it's a simple error message
      if (err.message.length < 200 && !err.message.includes('{')) {
        return err.message;
      }
    }
  }

  // If err itself looks like a backend error object
  if (typeof err === 'object' && (err.title || err.detail || err.status)) {
    return extractFriendlyMessage(err as BackendError, fallbackMessage);
  }

  return fallbackMessage;
}

/**
 * Extracts a user-friendly message from a parsed backend error object
 */
function extractFriendlyMessage(errorObj: BackendError, fallbackMessage: string): string {
  const detail = errorObj.detail?.toLowerCase() || '';
  const title = errorObj.title || '';

  // Database constraint errors
  if (detail.includes('duplicate key') || detail.includes('already exists')) {
    return 'This email address already exists for this email type';
  }

  if (detail.includes('unique constraint')) {
    return 'This email configuration already exists';
  }

  // Type casting / enum errors
  if (detail.includes('type') && (detail.includes('cast') || detail.includes('expression is of type'))) {
    return 'Invalid data type. Please try again or contact support if this persists.';
  }

  if (detail.includes('enum')) {
    return 'Invalid email type selected. Please try a different type.';
  }

  // Foreign key errors
  if (detail.includes('foreign key')) {
    if (detail.includes('still referenced') || detail.includes('violates foreign key')) {
      return 'Cannot delete: This email is still being used by other records';
    }
    return 'Invalid reference. Please try again.';
  }

  // Null value errors
  if (detail.includes('null value') || detail.includes('not-null constraint')) {
    return 'Required field is missing. Please fill in all required fields.';
  }

  // Not found errors
  if (detail.includes('not found') || errorObj.status === 404) {
    return 'Record not found. It may have already been deleted.';
  }

  // Authentication/Authorization errors
  if (errorObj.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (errorObj.status === 403) {
    return 'Access denied. You do not have permission to perform this action.';
  }

  // Server errors
  if (errorObj.status && errorObj.status >= 500) {
    if (detail.includes('could not execute batch')) {
      return 'Unable to save data. Please check your inputs and try again.';
    }
    return 'Server error. Please try again later or contact support.';
  }

  // Network errors
  if (detail.includes('network') || detail.includes('timeout')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Use title if available and not too technical
  if (title && !title.toLowerCase().includes('internal server error') && !title.toLowerCase().includes('bad request')) {
    return title;
  }

  // Default fallback
  return fallbackMessage;
}

/**
 * Formats a success message with emoji
 */
export function formatSuccessMessage(message: string): string {
  return message.startsWith('✅') ? message : `✅ ${message}`;
}

/**
 * Formats an error message with emoji
 */
export function formatErrorMessage(message: string): string {
  return message.startsWith('❌') ? message : `❌ ${message}`;
}
