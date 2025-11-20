'use client';

import React from 'react';
import { FaExclamationTriangle, FaTimes, FaTrashAlt } from 'react-icons/fa';

export type DeleteStatus = 'idle' | 'confirming' | 'deleting' | 'success' | 'error';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  status: DeleteStatus;
  eventTitle?: string;
  isRecurring?: boolean;
  message?: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  onClose?: () => void;
}

export default function DeleteConfirmationDialog({
  isOpen,
  status,
  eventTitle,
  isRecurring = false,
  message,
  onConfirm,
  onCancel,
  onClose,
}: DeleteConfirmationDialogProps) {
  if (!isOpen) return null;

  const getStatusContent = () => {
    switch (status) {
      case 'confirming':
        return {
          icon: <FaExclamationTriangle className="w-12 h-12 text-orange-500" />,
          title: 'Confirm Delete Event',
          message: message || (
            <>
              {isRecurring ? (
                <>
                  <p className="mb-2">This event is part of a recurring series.</p>
                  <p className="mb-2"><strong>This occurrence will be marked as inactive.</strong></p>
                  <p>Are you sure you want to continue?</p>
                </>
              ) : (
                <>
                  <p className="mb-2"><strong>This event will be marked as inactive.</strong></p>
                  <p>Are you sure you want to continue?</p>
                </>
              )}
            </>
          ),
          bgColor: 'bg-orange-50',
          iconBg: 'bg-orange-100',
          textColor: 'text-orange-800',
          showButtons: true,
        };
      case 'deleting':
        return {
          icon: <FaTrashAlt className="w-12 h-12 text-blue-500 animate-pulse" />,
          title: 'Deleting Event...',
          message: message || 'Please wait while we mark this event as inactive.',
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          textColor: 'text-blue-800',
          showButtons: false,
        };
      case 'success':
        return {
          icon: <FaTimes className="w-12 h-12 text-green-600" />,
          title: 'Event Deleted Successfully!',
          message: message || 'The event has been marked as inactive.',
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          textColor: 'text-green-800',
          showButtons: false,
        };
      case 'error':
        return {
          icon: <FaExclamationTriangle className="w-12 h-12 text-red-600" />,
          title: 'Delete Failed',
          message: message || 'An error occurred while deleting the event. Please try again.',
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          textColor: 'text-red-800',
          showButtons: false,
        };
      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg shadow-xl p-8 min-w-[400px] max-w-md w-full mx-4 relative ${content.bgColor}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - only show for error state */}
        {(status === 'error' || status === 'success') && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className={`${content.iconBg} rounded-full p-4 flex items-center justify-center`}>
            {content.icon}
          </div>

          {/* Title */}
          <h3 className={`text-xl font-semibold ${content.textColor}`}>
            {content.title}
          </h3>

          {/* Event Title (if provided) */}
          {eventTitle && status === 'confirming' && (
            <p className={`text-sm font-medium ${content.textColor}`}>
              Event: {eventTitle}
            </p>
          )}

          {/* Message */}
          <div className={`text-sm ${content.textColor} leading-relaxed`}>
            {typeof content.message === 'string' ? (
              <p>{content.message}</p>
            ) : (
              content.message
            )}
          </div>

          {/* Loading indicator for deleting state */}
          {status === 'deleting' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Action Buttons */}
          {content.showButtons && (
            <div className="flex gap-4 mt-6 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}

          {/* Close button for success/error */}
          {(status === 'success' || status === 'error') && onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

