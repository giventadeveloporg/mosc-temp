import React, { useState, useEffect, useRef } from 'react';
import type { EventDetailsDTO, EventTypeDetailsDTO } from '@/types';
import timezones from '@/lib/timezones'; // (We'll create this file for the IANA timezone list)
import { FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { parseEventMetadata, serializeEventMetadata, createFundraiserMetadata, createRecurrenceMetadata, getRecurrenceConfig, createDonationMetadata, removeNullUndefined } from '@/lib/eventUtils';
import EmailHeaderImageUpload from '@/components/EmailHeaderImageUpload';
import RecurrenceConfigSection from '@/components/RecurrenceConfigSection';
import RecurrencePreview from '@/components/RecurrencePreview';
import type { RecurrencePattern, RecurrenceEndType } from '@/lib/recurrenceUtils';
import { validateRecurrenceEndDate, generateOccurrenceDates } from '@/lib/recurrenceUtils';

interface EventFormProps {
  event?: EventDetailsDTO;
  eventTypes: EventTypeDetailsDTO[];
  onSubmit: (event: EventDetailsDTO) => void;
  loading?: boolean;
}

export const defaultEvent: EventDetailsDTO = {
  title: '',
  caption: '',
  description: '',
  eventType: undefined,
  startDate: '',
  endDate: '',
  promotionStartDate: '',
  startTime: '',
  endTime: '',
  timezone: '',
  location: '',
  directionsToVenue: '',
  capacity: undefined,
  admissionType: '',
  isActive: true,
  allowGuests: false,
  requireGuestApproval: false,
  enableGuestPricing: false,
  isRegistrationRequired: false,
  isSportsEvent: false,
  isLive: false,
  isFeaturedEvent: false,
  featuredEventPriorityRanking: 0,
  liveEventPriorityRanking: 0,
  fromEmail: '',
  createdBy: undefined,
  createdAt: '',
  updatedAt: '',
};

export function EventForm({ event, eventTypes, onSubmit, loading }: EventFormProps) {
  const [form, setForm] = useState<EventDetailsDTO>({ ...defaultEvent, ...event });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  // Fundraiser/Charity/Givebutter configuration state
  const [isFundraiserEvent, setIsFundraiserEvent] = useState(false);
  const [isCharityEvent, setIsCharityEvent] = useState(false);
  const [useZeroFeeProvider, setUseZeroFeeProvider] = useState(false);
  const [zeroFeeProvider, setZeroFeeProvider] = useState<string>('');
  const [givebutterCampaignId, setGivebutterCampaignId] = useState<string>('');

  // Recurrence configuration state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | ''>('');
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(1);
  const [recurrenceEndType, setRecurrenceEndType] = useState<RecurrenceEndType>('END_DATE');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState<number>(1);
  const [recurrenceWeeklyDays, setRecurrenceWeeklyDays] = useState<number[]>([]);
  const [recurrenceMonthlyDay, setRecurrenceMonthlyDay] = useState<number | 'LAST' | null>(null);
  const [recurrenceMonthlyDayType, setRecurrenceMonthlyDayType] = useState<'DAY_NUMBER' | 'LAST_DAY'>('DAY_NUMBER');

  // Refs for form fields to enable scroll-to-error functionality
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>({});

  useEffect(() => {
    if (event) {
      setForm({ ...defaultEvent, ...event });

      // Load donation metadata (NEW - preferred)
      if (event.donationMetadata) {
        try {
          const donationMetadata = JSON.parse(event.donationMetadata);
          setIsFundraiserEvent(Boolean(donationMetadata.isFundraiserEvent));
          setIsCharityEvent(Boolean(donationMetadata.isCharityEvent));
          setZeroFeeProvider(donationMetadata.zeroFeeProvider || '');
          setGivebutterCampaignId(donationMetadata.givebutterCampaignId || '');
          setUseZeroFeeProvider(Boolean(donationMetadata.zeroFeeProvider));
        } catch (e) {
          console.error('Failed to parse donation metadata', e);
        }
      }
      // Fallback: Load from old metadata field (backward compatibility)
      else if (event.metadata) {
        const metadata = parseEventMetadata(event.metadata);
        setIsFundraiserEvent(Boolean(metadata.isFundraiserEvent));
        setIsCharityEvent(Boolean(metadata.isCharityEvent));

        const donationConfig = metadata.donationConfig;
        if (donationConfig) {
          setUseZeroFeeProvider(Boolean(donationConfig.useZeroFeeProvider));
          setZeroFeeProvider(donationConfig.zeroFeeProvider || '');
          setGivebutterCampaignId(donationConfig.givebutterCampaignId || '');
        }
      }

      // Load recurrence metadata (NEW - preferred)
      if (event.eventRecurrenceMetadata) {
        try {
          const recurrenceConfig = JSON.parse(event.eventRecurrenceMetadata);
          setIsRecurring(true);
          setRecurrencePattern((recurrenceConfig.pattern as RecurrencePattern) || '');
          setRecurrenceInterval(recurrenceConfig.interval || 1);
          setRecurrenceEndType((recurrenceConfig.endType as RecurrenceEndType) || 'END_DATE');
          setRecurrenceEndDate(recurrenceConfig.endDate || '');
          setRecurrenceOccurrences(recurrenceConfig.occurrences || 1);
          setRecurrenceWeeklyDays(recurrenceConfig.weeklyDays || []);
          if (recurrenceConfig.monthlyDay === 'LAST') {
            setRecurrenceMonthlyDay('LAST');
            setRecurrenceMonthlyDayType('LAST_DAY');
          } else if (recurrenceConfig.monthlyDay) {
            setRecurrenceMonthlyDay(recurrenceConfig.monthlyDay);
            setRecurrenceMonthlyDayType('DAY_NUMBER');
          }
        } catch (e) {
          console.error('Failed to parse recurrence metadata', e);
        }
      }
      // Fallback: Load from old metadata field (backward compatibility)
      else if (event.metadata) {
        const metadata = parseEventMetadata(event.metadata);
        if (metadata.isRecurring) {
          const recurrenceConfig = metadata.recurrenceConfig;
          if (recurrenceConfig) {
            setIsRecurring(true);
            setRecurrencePattern((recurrenceConfig.pattern as RecurrencePattern) || '');
            setRecurrenceInterval(recurrenceConfig.interval || 1);
            setRecurrenceEndType((recurrenceConfig.endType as RecurrenceEndType) || 'END_DATE');
            setRecurrenceEndDate(recurrenceConfig.endDate || '');
            setRecurrenceOccurrences(recurrenceConfig.occurrences || 1);
            setRecurrenceWeeklyDays(recurrenceConfig.weeklyDays || []);
            if (recurrenceConfig.monthlyDay === 'LAST') {
              setRecurrenceMonthlyDay('LAST');
              setRecurrenceMonthlyDayType('LAST_DAY');
            } else if (recurrenceConfig.monthlyDay) {
              setRecurrenceMonthlyDay(recurrenceConfig.monthlyDay);
              setRecurrenceMonthlyDayType('DAY_NUMBER');
            }
          }
        }
      }
    }
  }, [event]);

  // CRITICAL: Automatically set zero-fee provider configuration when fundraiser/charity is enabled
  useEffect(() => {
    if (isFundraiserEvent || isCharityEvent) {
      // Automatically enable zero-fee provider and set to GIVEBUTTER
      setUseZeroFeeProvider(true);
      // Only set to GIVEBUTTER if it's currently empty or not set
      setZeroFeeProvider(prev => prev || 'GIVEBUTTER');
    } else {
      // If fundraiser/charity is disabled, reset zero-fee provider settings
      setUseZeroFeeProvider(false);
      setZeroFeeProvider('');
      setGivebutterCampaignId('');
    }
  }, [isFundraiserEvent, isCharityEvent]);

  // Function to scroll to the first error field
  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      const field = fieldRefs.current[firstErrorField];
      field.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      // Focus the field for better UX
      field.focus();
    }
  };

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.title) errs.title = 'Title is required';
    if (form.title && form.title.length > 250) errs.title = 'Title must not exceed 250 characters';
    if (form.caption && form.caption.length > 450) errs.caption = 'Caption must not exceed 450 characters';
    if (form.description && form.description.length > 900) errs.description = 'Description must not exceed 900 characters';
    if (form.directionsToVenue && form.directionsToVenue.length > 580) errs.directionsToVenue = 'Directions to Venue must not exceed 580 characters';
    if (!form.eventType || !form.eventType.id) errs.eventType = 'Event type is required';

    // Date validations - convert display format to storage format if needed
    let startDateStr = form.startDate;
    let endDateStr = form.endDate;
    let promotionStartDateStr = form.promotionStartDate;

    // Validate date format (MM/DD/YYYY) and convert to YYYY-MM-DD for comparison
    if (startDateStr) {
      if (!isValidDateFormat(formatDateForDisplay(startDateStr))) {
        errs.startDate = 'Start date must be in MM/DD/YYYY format (e.g., 09/14/2025)';
      } else {
        startDateStr = formatDateForStorage(startDateStr);
      }
    }
    if (endDateStr) {
      if (!isValidDateFormat(formatDateForDisplay(endDateStr))) {
        errs.endDate = 'End date must be in MM/DD/YYYY format (e.g., 09/14/2025)';
      } else {
        endDateStr = formatDateForStorage(endDateStr);
      }
    }
    if (promotionStartDateStr) {
      if (!isValidDateFormat(formatDateForDisplay(promotionStartDateStr))) {
        errs.promotionStartDate = 'Promotion start date must be in MM/DD/YYYY format (e.g., 09/14/2025)';
      } else {
        promotionStartDateStr = formatDateForStorage(promotionStartDateStr);
      }
    }

    if (!startDateStr) errs.startDate = 'Start date is required';
    if (!endDateStr) errs.endDate = 'End date is required';
    if (!promotionStartDateStr) errs.promotionStartDate = 'Promotion start date is required';
    if (!form.startTime) errs.startTime = 'Start time is required';
    if (!form.endTime) errs.endTime = 'End time is required';
    if (!form.admissionType) errs.admissionType = 'Admission type is required';
    if (!form.timezone) errs.timezone = 'Timezone is required';

    // Validate fromEmail
    if (!form.fromEmail || !form.fromEmail.trim()) {
      errs.fromEmail = 'From email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.fromEmail.trim())) {
      errs.fromEmail = 'Please enter a valid email address';
    }

    // Validate Givebutter configuration
    if (useZeroFeeProvider) {
      if (!zeroFeeProvider) {
        errs.zeroFeeProvider = 'Zero-fee provider is required when using zero-fee provider';
      }
      // Note: givebutterCampaignId is optional - backend will fallback to provider config campaign ID
      // However, it's recommended to set it per-event for better tracking
    }

    // Date and time validations
    // Get today's date in local timezone (YYYY-MM-DD format)
    const today = new Date();
    const todayStr = today.getFullYear() + '-' +
      String(today.getMonth() + 1).padStart(2, '0') + '-' +
      String(today.getDate()).padStart(2, '0');

    // For date validation, compare strings directly to avoid timezone issues
    // YYYY-MM-DD format can be compared lexicographically

    if (startDateStr && startDateStr < todayStr) {
      errs.startDate = 'Start date must be today or in the future';
    }
    if (endDateStr && endDateStr < todayStr) {
      errs.endDate = 'End date must be today or in the future';
    }
    if (promotionStartDateStr && promotionStartDateStr < todayStr) {
      errs.promotionStartDate = 'Promotion start date must be today or in the future';
    }
    if (startDateStr && endDateStr && endDateStr < startDateStr) {
      errs.endDate = 'End date cannot be before start date';
    }
    if (promotionStartDateStr && startDateStr && promotionStartDateStr > startDateStr) {
      errs.promotionStartDate = 'Promotion start date cannot be after event start date';
    }

    // Time validations
    const startTimeStr = form.startTime;
    const endTimeStr = form.endTime;
    if (startDateStr && startTimeStr) {
      const now = new Date();
      const startDateTime = new Date(`${startDateStr}T${convertTo24Hour(startTimeStr)}`);
      if (startDateStr === todayStr && startDateTime < now) {
        errs.startTime = 'Start time must be in the future';
      }
    }
    if (startDateStr && startTimeStr && endDateStr && endTimeStr) {
      const startDateTime = new Date(`${startDateStr}T${convertTo24Hour(startTimeStr)}`);
      const endDateTime = new Date(`${endDateStr}T${convertTo24Hour(endTimeStr)}`);
      if (startDateStr === endDateStr && endDateTime <= startDateTime) {
        errs.endTime = 'End time must be after start time';
      }
    }

    // Custom validation: If guests are allowed, maxGuestsPerAttendee must be > 0
    if (form.allowGuests) {
      if (!form.maxGuestsPerAttendee || Number(form.maxGuestsPerAttendee) <= 0) {
        errs.maxGuestsPerAttendee = 'When guests are allowed, max_guests_per_attendee must be greater than 0';
      }
    }

    // Recurrence validation
    if (isRecurring) {
      if (!recurrencePattern) {
        errs.recurrencePattern = 'Recurrence pattern is required';
      }
      if (!recurrenceEndType) {
        errs.recurrenceEndType = 'End condition is required';
      }
      if (recurrenceEndType === 'END_DATE') {
        if (!recurrenceEndDate) {
          errs.recurrenceEndDate = 'End date is required';
        } else {
          // recurrenceEndDate is already in YYYY-MM-DD format from date input
          const startDateObj = new Date(formatDateForStorage(startDateStr) + 'T00:00:00');
          const endDateObj = new Date(recurrenceEndDate + 'T00:00:00');
          if (isNaN(endDateObj.getTime())) {
            errs.recurrenceEndDate = 'Invalid end date format';
          } else {
            const validation = validateRecurrenceEndDate(startDateObj, endDateObj);
            if (!validation.valid) {
              errs.recurrenceEndDate = validation.error || 'Invalid end date';
            }
          }
        }
      } else if (recurrenceEndType === 'OCCURRENCES') {
        if (!recurrenceOccurrences || recurrenceOccurrences < 1 || recurrenceOccurrences > 1000) {
          errs.recurrenceOccurrences = 'Occurrences must be between 1 and 1000';
        }
      }
      if (recurrencePattern === 'WEEKLY' || recurrencePattern === 'BIWEEKLY') {
        if (!recurrenceWeeklyDays || recurrenceWeeklyDays.length === 0) {
          errs.recurrenceWeeklyDays = 'At least one weekday must be selected';
        }
      }
      if (recurrencePattern === 'MONTHLY') {
        if (recurrenceMonthlyDay === null) {
          errs.recurrenceMonthlyDay = 'Day of month must be specified';
        }
      }
    }

    setErrors(errs);

    // If there are errors, show them and scroll to first error
    if (Object.keys(errs).length > 0) {
      setShowErrors(true);
      // Use setTimeout to ensure state update completes before scrolling
      setTimeout(() => {
        scrollToFirstError();
      }, 100);
    }

    return Object.keys(errs).length === 0;
  }

  // Helper to convert '06:00 PM' to '18:00' for Date parsing
  function convertTo24Hour(time12h: string): string {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier && modifier.toUpperCase() === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  // Helper to convert 'HH:mm' (from <input type="time">) to 'hh:mm AM/PM'
  function to12HourFormat(time24: string): string {
    if (!time24) return '';
    let [hour, minute] = time24.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${minute} ${ampm}`;
  }

  // Helper to convert 'hh:mm AM/PM' to 'HH:mm' for <input type="time"> value
  function to24HourFormat(time12: string): string {
    if (!time12) return '';
    const [time, ampm] = time12.split(' ');
    let [hour, minute] = time.split(':');
    let h = parseInt(hour, 10);
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minute}`;
  }

  // Helper to convert YYYY-MM-DD to MM/DD/YYYY for display
  function formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    // If already in MM/DD/YYYY format, return as is
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) return dateStr;
    // Convert from YYYY-MM-DD to MM/DD/YYYY
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${month}/${day}/${year}`;
    }
    return dateStr;
  }

  // Helper to convert MM/DD/YYYY to YYYY-MM-DD for storage
  function formatDateForStorage(dateStr: string): string {
    if (!dateStr) return '';
    // If already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
    // Convert from MM/DD/YYYY to YYYY-MM-DD
    const [month, day, year] = dateStr.split('/');
    if (year && month && day && year.length === 4 && month.length === 2 && day.length === 2) {
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  // Helper to validate MM/DD/YYYY format (exactly 2 digits for month and day)
  function isValidDateFormat(dateStr: string): boolean {
    if (!dateStr) return false;
    const mmddyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(mmddyyyyPattern);
    if (!match) return false;

    const [, month, day, year] = match;
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const yearNum = parseInt(year, 10);

    // Basic validation: month 1-12, day 1-31, year reasonable
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    if (yearNum < 1900 || yearNum > 2100) return false;

    // Check if date is actually valid (e.g., not Feb 30)
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getFullYear() === yearNum &&
           date.getMonth() === monthNum - 1 &&
           date.getDate() === dayNum;
  }

  // Helper to check if date format is exactly MM/DD/YYYY (with 2 digits for month and day)
  function isMMDDYYYYFormat(dateStr: string): boolean {
    if (!dateStr) return false;
    // Must match exactly MM/DD/YYYY pattern (2 digits, slash, 2 digits, slash, 4 digits)
    const exactPattern = /^\d{2}\/\d{2}\/\d{4}$/;
    return exactPattern.test(dateStr);
  }

  // Validate date field format and set error if needed
  function validateDateField(name: string, value: string) {
    const displayValue = formatDateForDisplay(value) || value;

    // If empty, no error (required validation happens elsewhere)
    if (!displayValue || displayValue.trim() === '') {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    }

    // Check if format is exactly MM/DD/YYYY
    if (!isMMDDYYYYFormat(displayValue)) {
      setErrors(prev => ({
        ...prev,
        [name]: 'Please enter date in the MM/DD/YYYY format'
      }));
      return false;
    }

    // Check if it's a valid date
    if (!isValidDateFormat(displayValue)) {
      setErrors(prev => ({
        ...prev,
        [name]: 'Please enter a valid date in MM/DD/YYYY format'
      }));
      return false;
    }

    // Clear error if valid
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    return true;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'eventType') {
      // Find the event type object by id
      const selectedType = eventTypes.find(et => String(et.id) === value);
      setForm((f: EventDetailsDTO) => ({ ...f, eventType: selectedType }));
    } else if (name === 'startTime' || name === 'endTime') {
      // Convert 24-hour value from <input type="time"> to 12-hour AM/PM string
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: to12HourFormat(value) }));
    } else if (name === 'startDate' || name === 'endDate' || name === 'promotionStartDate') {
      // Handle date fields - allow typing in MM/DD/YYYY format
      // Store in YYYY-MM-DD format internally, but display as MM/DD/YYYY
      const formattedValue = formatDateForStorage(value);
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: formattedValue }));
    } else {
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: value }));
    }
  }

  // Handler for date input with formatting - allows digits and forward slashes
  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const input = e.target;
    const cursorPos = input.selectionStart || 0;

    // Allow only digits and forward slashes, preserve user's input structure
    let cleaned = value.replace(/[^\d\/]/g, '');

    // Auto-format: ensure slashes are in the right places as user types
    // But allow user to type slashes manually too
    const digits = cleaned.replace(/\D/g, '');
    const slashes = cleaned.match(/\//g) || [];

    // Build formatted string: MM/DD/YYYY
    // If user has typed slashes, respect their position; otherwise auto-format
    let formatted = '';
    if (cleaned.includes('/')) {
      // User has typed slashes - preserve their structure but ensure proper format
      // Split by slashes and reconstruct
      const parts = cleaned.split('/').filter(p => p.length > 0);
      if (parts.length >= 1) {
        formatted = parts[0].slice(0, 2); // Month (max 2 digits)
      }
      if (parts.length >= 2) {
        formatted += '/' + parts[1].slice(0, 2); // Day (max 2 digits)
      }
      if (parts.length >= 3) {
        formatted += '/' + parts[2].slice(0, 4); // Year (max 4 digits)
      }
    } else {
      // Auto-format based on digit count
      if (digits.length > 0) {
        formatted = digits.slice(0, 2);
      }
      if (digits.length > 2) {
        formatted += '/' + digits.slice(2, 4);
      }
      if (digits.length > 4) {
        formatted += '/' + digits.slice(4, 8);
      }
    }

    // Store the formatted display value
    // If complete and valid, convert to YYYY-MM-DD for storage
    if (formatted.match(/^\d{2}\/\d{2}\/\d{4}$/) && isValidDateFormat(formatted)) {
      const storageValue = formatDateForStorage(formatted);
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: storageValue }));
      // Clear error if format is correct
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } else {
      // Store the display value as-is (allows partial dates like "12/0/2025")
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: formatted }));

      // Validate format - show error if format is incorrect
      // Only validate if user has finished typing (has slashes and some digits)
      if (formatted.includes('/') && formatted.length >= 6) {
        validateDateField(name, formatted);
      } else {
        // Clear error while user is still typing
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }

    // Restore cursor position
    setTimeout(() => {
      // Calculate cursor position - maintain relative position
      let newCursorPos = cursorPos;
      const displayValue = formatDateForDisplay(form[name as keyof EventDetailsDTO] as string) || formatted;

      // Ensure cursor doesn't go past the end
      newCursorPos = Math.min(newCursorPos, displayValue.length);

      // If cursor would land on a slash after typing a digit, move past it
      if (value.length > (formatDateForDisplay(form[name as keyof EventDetailsDTO] as string) || '').length) {
        // User was typing
        if (newCursorPos < displayValue.length && displayValue[newCursorPos] === '/' && /^\d$/.test(value[cursorPos - 1])) {
          newCursorPos = Math.min(newCursorPos + 1, displayValue.length);
        }
      }

      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Handler for date field blur - validate format when user leaves the field
  function handleDateBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const displayValue = formatDateForDisplay(form[name as keyof EventDetailsDTO] as string) || value;
    validateDateField(name, displayValue);
  }

  // Handler for key down events to handle deletion without shifting
  function handleDateKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const { name, selectionStart, selectionEnd } = input;
    const cursorPos = selectionStart || 0;
    const hasSelection = selectionStart !== selectionEnd;

    // Always allow forward slash to be typed
    if (e.key === '/' && !e.shiftKey) {
      return; // Let it through
    }

    // Handle backspace/delete to delete character at position without shifting others
    if ((e.key === 'Backspace' || e.key === 'Delete') && !hasSelection) {
      e.preventDefault();

      const currentValue = input.value || '';

      // Determine which character to remove
      let deleteIndex = cursorPos;

      if (e.key === 'Backspace' && cursorPos > 0) {
        deleteIndex = cursorPos - 1;
        // If we're trying to delete a slash, skip it and delete the digit before it
        if (currentValue[deleteIndex] === '/') {
          deleteIndex = Math.max(0, deleteIndex - 1);
        }
      } else if (e.key === 'Delete' && cursorPos < currentValue.length) {
        deleteIndex = cursorPos;
        // If current position is a slash, delete the digit after it
        if (currentValue[deleteIndex] === '/') {
          deleteIndex = Math.min(currentValue.length - 1, deleteIndex + 1);
        }
      } else {
        return; // No valid position
      }

      // Don't delete slashes - maintain structure
      if (currentValue[deleteIndex] === '/') {
        // Just move cursor, don't delete the slash
        setTimeout(() => {
          const newPos = e.key === 'Backspace' ? Math.max(0, cursorPos - 1) : cursorPos;
          input.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }

      // Remove the character at deleteIndex - this will naturally maintain structure
      // because we're removing from a specific position
      const newValue = currentValue.substring(0, deleteIndex) + currentValue.substring(deleteIndex + 1);

      // Store the new value (allows partial dates like "12/0/2025")
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: newValue }));

      // Update input directly for immediate feedback
      input.value = newValue;

      // Restore cursor position
      setTimeout(() => {
        let newCursorPos = e.key === 'Backspace' ? Math.max(0, cursorPos - 1) : cursorPos;
        // Don't land on a slash
        if (newCursorPos < newValue.length && newValue[newCursorPos] === '/') {
          newCursorPos = e.key === 'Backspace' ? Math.max(0, newCursorPos - 1) : Math.min(newValue.length, newCursorPos + 1);
        }
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);

      return;
    }
  }

  // Handler for calendar date picker
  function handleCalendarDateChange(name: string, dateValue: string) {
    // Convert from YYYY-MM-DD (date input format) to MM/DD/YYYY for display
    if (dateValue && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateValue.split('-');
      const formatted = `${month}/${day}/${year}`;
      setForm((f: EventDetailsDTO) => ({ ...f, [name]: dateValue })); // Store in YYYY-MM-DD format
    }
  }

  function handleReset() {
    setForm({ ...defaultEvent });
    setErrors({});
    setShowErrors(false);
    // Reset fundraiser/charity/Givebutter configuration
    setIsFundraiserEvent(false);
    setIsCharityEvent(false);
    setUseZeroFeeProvider(false);
    setZeroFeeProvider('');
    setGivebutterCampaignId('');
    // Reset recurrence configuration
    setIsRecurring(false);
    setRecurrencePattern('');
    setRecurrenceInterval(1);
    setRecurrenceEndType('END_DATE');
    setRecurrenceEndDate('');
    setRecurrenceOccurrences(1);
    setRecurrenceWeeklyDays([]);
    setRecurrenceMonthlyDay(null);
    setRecurrenceMonthlyDayType('DAY_NUMBER');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Clear any previous errors and hide error display
    setErrors({});
    setShowErrors(false);

    // Build metadata object from fundraiser/charity/Givebutter configuration
    // CRITICAL: When fundraiser/charity is enabled, ALWAYS set:
    // - useZeroFeeProvider: true
    // - zeroFeeProvider: "GIVEBUTTER"
    // - givebutterCampaignId: from form (or keep existing if editing)
    const isFundraiserOrCharity = isFundraiserEvent || isCharityEvent;

    // Build donation metadata (fundraiser/charity) - SEPARATE from recurrence
    const donationMetadataObj = createDonationMetadata({
      isFundraiserEvent,
      isCharityEvent,
      zeroFeeProvider: isFundraiserOrCharity ? 'GIVEBUTTER' : (useZeroFeeProvider ? zeroFeeProvider : undefined),
      givebutterCampaignId: (isFundraiserOrCharity || zeroFeeProvider === 'GIVEBUTTER') ? (givebutterCampaignId || undefined) : undefined,
    });

    // Calculate end date if "OCCURRENCES" is selected
    let calculatedEndDate: string | undefined = undefined;
    if (isRecurring && recurrenceEndType === 'OCCURRENCES' && recurrencePattern && form.startDate) {
      try {
        const startDateObj = new Date(formatDateForStorage(formatDateForDisplay(form.startDate)) + 'T00:00:00');
        const occurrenceDates = generateOccurrenceDates(
          startDateObj,
          recurrencePattern as RecurrencePattern,
          recurrenceInterval,
          undefined, // No end date limit
          recurrenceOccurrences, // Max occurrences
          recurrenceWeeklyDays.length > 0 ? recurrenceWeeklyDays : undefined,
          recurrenceMonthlyDay === null ? undefined : recurrenceMonthlyDay,
          form.timezone
        );

        // Get the last occurrence date
        if (occurrenceDates.length > 0) {
          const lastDate = occurrenceDates[occurrenceDates.length - 1];
          // Format as YYYY-MM-DD
          calculatedEndDate = lastDate.toISOString().split('T')[0];
        }
      } catch (e) {
        console.error('Failed to calculate recurrence end date', e);
      }
    }

    // Use calculated end date if available, otherwise use the user-selected end date
    const finalEndDate = calculatedEndDate || (recurrenceEndType === 'END_DATE' ? recurrenceEndDate : undefined);

    // Build recurrence metadata - SEPARATE from donation (just the config, not wrapped)
    const recurrenceMetadataObj = isRecurring ? {
      pattern: recurrencePattern || undefined,
      interval: recurrenceInterval,
      endType: recurrenceEndType,
      endDate: finalEndDate, // Include calculated end date even for OCCURRENCES
      occurrences: recurrenceOccurrences,
      weeklyDays: recurrenceWeeklyDays.length > 0 ? recurrenceWeeklyDays : undefined,
      monthlyDay: recurrenceMonthlyDay || undefined,
    } : null;

    // Serialize metadata objects
    const donationMetadataJson = Object.keys(donationMetadataObj).length > 0
      ? serializeEventMetadata(donationMetadataObj)
      : null;

    const recurrenceMetadataJson = recurrenceMetadataObj
      ? JSON.stringify(removeNullUndefined(recurrenceMetadataObj))
      : null;

    // Also create old metadata format for backward compatibility
    const metadataObj = createFundraiserMetadata({
      isFundraiserEvent,
      isCharityEvent,
      // Always set to true if fundraiser/charity is enabled
      useZeroFeeProvider: isFundraiserOrCharity ? true : useZeroFeeProvider,
      // Always set to GIVEBUTTER if fundraiser/charity is enabled, otherwise use selected value
      zeroFeeProvider: isFundraiserOrCharity ? 'GIVEBUTTER' : (useZeroFeeProvider ? zeroFeeProvider : undefined),
      // Include campaign ID if using GIVEBUTTER (either auto-set for fundraiser/charity or manually selected)
      givebutterCampaignId: (isFundraiserOrCharity || zeroFeeProvider === 'GIVEBUTTER') ? (givebutterCampaignId || undefined) : undefined,
    });

    const recurrenceMetadataObjOld = createRecurrenceMetadata({
      isRecurring,
      pattern: recurrencePattern || undefined,
      interval: recurrenceInterval,
      endType: recurrenceEndType,
      endDate: finalEndDate, // Use calculated end date even for OCCURRENCES
      occurrences: recurrenceOccurrences,
      weeklyDays: recurrenceWeeklyDays.length > 0 ? recurrenceWeeklyDays : undefined,
      monthlyDay: recurrenceMonthlyDay || undefined,
    });

    // Merge with existing metadata if any
    const existingMetadata = form.metadata ? parseEventMetadata(form.metadata) : {};
    const mergedMetadata = { ...existingMetadata, ...metadataObj, ...recurrenceMetadataObjOld };

    // Ensure dates are in YYYY-MM-DD format before submitting
    // Ensure all booleans are true/false
    const sanitizedForm = {
      ...form,
      // NEW: Send as separate fields
      donationMetadata: donationMetadataJson,
      eventRecurrenceMetadata: recurrenceMetadataJson,
      // OLD: Keep metadata for backward compatibility during migration
      metadata: serializeEventMetadata(mergedMetadata),
      // CRITICAL: Explicitly set recurrence DTO fields from form state
      isRecurring: isRecurring,
      recurrencePattern: isRecurring ? (recurrencePattern || undefined) : undefined,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      recurrenceEndType: isRecurring ? recurrenceEndType : undefined,
      recurrenceEndDate: isRecurring ? finalEndDate : undefined,
      recurrenceOccurrences: isRecurring && recurrenceEndType === 'OCCURRENCES' ? recurrenceOccurrences : undefined,
      recurrenceWeeklyDays: isRecurring && (recurrencePattern === 'WEEKLY' || recurrencePattern === 'BIWEEKLY') && recurrenceWeeklyDays.length > 0 ? recurrenceWeeklyDays : undefined,
      recurrenceMonthlyDay: isRecurring && recurrencePattern === 'MONTHLY' ? (recurrenceMonthlyDay === 'LAST' ? null : recurrenceMonthlyDay) : undefined,
      recurrenceSeriesId: isRecurring ? (form.id || undefined) : undefined,
      parentEventId: undefined, // Parent events have no parent
      startDate: formatDateForStorage(formatDateForDisplay(form.startDate)),
      endDate: formatDateForStorage(formatDateForDisplay(form.endDate)),
      promotionStartDate: formatDateForStorage(formatDateForDisplay(form.promotionStartDate)),
      isActive: !!form.isActive,
      allowGuests: !!form.allowGuests,
      requireGuestApproval: !!form.requireGuestApproval,
      enableGuestPricing: !!form.enableGuestPricing,
      isRegistrationRequired: !!form.isRegistrationRequired,
      isSportsEvent: !!form.isSportsEvent,
      isLive: !!form.isLive,
      isFeaturedEvent: !!form.isFeaturedEvent,
      featuredEventPriorityRanking: Number(form.featuredEventPriorityRanking) || 0,
      liveEventPriorityRanking: Number(form.liveEventPriorityRanking) || 0,
    };
    onSubmit(sanitizedForm);
  }

  // Function to get error count for display
  const getErrorCount = () => Object.keys(errors).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Title * <span className="text-sm text-gray-500">({(form.title || '').length}/250)</span></label>
        <input
          ref={(el) => { if (el) fieldRefs.current.title = el; }}
          name="title"
          value={form.title}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          maxLength={250}
        />
        {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
      </div>
      <div>
        <label className="block font-medium">Caption <span className="text-sm text-gray-500">({(form.caption || '').length}/450)</span></label>
        <input
          ref={(el) => { if (el) fieldRefs.current.caption = el; }}
          name="caption"
          value={form.caption}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.caption ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          maxLength={450}
        />
        {errors.caption && <div className="text-red-500 text-sm mt-1">{errors.caption}</div>}
      </div>
      <div>
        <div className="mb-2 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-blue-700">
          <strong className="block font-semibold text-blue-800">Tip for rich paragraphs:</strong>
          The display page renders a new paragraph whenever you leave a completely blank line in this
          field (press Enter twice between paragraphs). Feel free to add as many paragraphs as needed—the
          layout expands automatically to fit your content.
        </div>
        <label className="block font-medium">Description <span className="text-sm text-gray-500">({(form.description || '').length}/900)</span></label>
        <textarea
          ref={(el) => { if (el) fieldRefs.current.description = el; }}
          name="description"
          value={form.description ?? ""}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          maxLength={900}
          rows={4}
        />
        {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
      </div>
      <div>
        <label className="block font-medium">Event Type *</label>
        <select
          ref={(el) => { if (el) fieldRefs.current.eventType = el; }}
          name="eventType"
          value={form.eventType?.id ?? ''}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.eventType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        >
          <option value="">Select event type</option>
          {eventTypes.map((et) => (
            <option key={et.id} value={et.id}>{et.name}</option>
          ))}
        </select>
        {errors.eventType && <div className="text-red-500 text-sm mt-1">{errors.eventType}</div>}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-medium">Start Date *</label>
          <div className="relative">
            <input
              ref={(el) => { if (el) fieldRefs.current.startDate = el; }}
              type="text"
              name="startDate"
              value={formatDateForDisplay(form.startDate)}
              onChange={handleDateChange}
              onKeyDown={handleDateKeyDown}
              onBlur={handleDateBlur}
              placeholder="MM/DD/YYYY"
              pattern="\d{2}/\d{2}/\d{4}"
              className={`w-full border rounded p-2 pr-10 ${errors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded cursor-pointer z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const buttonRect = e.currentTarget.getBoundingClientRect();
                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.value = formatDateForStorage(formatDateForDisplay(form.startDate)) || '';
                // Position it near the button using fixed positioning
                dateInput.style.position = 'fixed';
                dateInput.style.left = `${buttonRect.left}px`;
                dateInput.style.top = `${buttonRect.bottom + 4}px`;
                dateInput.style.width = '1px';
                dateInput.style.height = '1px';
                dateInput.style.opacity = '0.01';
                dateInput.style.pointerEvents = 'none';
                dateInput.style.zIndex = '9999';
                document.body.appendChild(dateInput);

                // Use requestAnimationFrame to ensure element is in DOM before showing picker
                requestAnimationFrame(() => {
                  try {
                    dateInput.showPicker?.();
                  } catch (err) {
                    // Fallback: focus the input to trigger picker
                    dateInput.focus();
                    dateInput.click();
                  }
                });

                dateInput.onchange = (ev: any) => {
                  if (ev.target.value) {
                    handleCalendarDateChange('startDate', ev.target.value);
                  }
                  if (dateInput.parentNode) {
                    document.body.removeChild(dateInput);
                  }
                };
                dateInput.onblur = () => {
                  setTimeout(() => {
                    if (dateInput.parentNode) {
                      document.body.removeChild(dateInput);
                    }
                  }, 100);
                };
              }}
            >
              <FaCalendarAlt className="text-gray-400" size={16} />
            </button>
          </div>
          {errors.startDate && <div className="text-red-500 text-sm mt-1">{errors.startDate}</div>}
          <p className="text-xs text-gray-500 mt-1">Format: MM/DD/YYYY (e.g., 09/14/2025) or click calendar icon</p>
        </div>
        <div className="flex-1">
          <label className="block font-medium">End Date *</label>
          <div className="relative">
            <input
              ref={(el) => { if (el) fieldRefs.current.endDate = el; }}
              type="text"
              name="endDate"
              value={formatDateForDisplay(form.endDate)}
              onChange={handleDateChange}
              onKeyDown={handleDateKeyDown}
              onBlur={handleDateBlur}
              placeholder="MM/DD/YYYY"
              pattern="\d{2}/\d{2}/\d{4}"
              className={`w-full border rounded p-2 pr-10 ${errors.endDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded cursor-pointer z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const buttonRect = e.currentTarget.getBoundingClientRect();
                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.value = formatDateForStorage(formatDateForDisplay(form.endDate)) || '';
                // Position it near the button using fixed positioning
                dateInput.style.position = 'fixed';
                dateInput.style.left = `${buttonRect.left}px`;
                dateInput.style.top = `${buttonRect.bottom + 4}px`;
                dateInput.style.width = '1px';
                dateInput.style.height = '1px';
                dateInput.style.opacity = '0.01';
                dateInput.style.pointerEvents = 'none';
                dateInput.style.zIndex = '9999';
                document.body.appendChild(dateInput);

                // Use requestAnimationFrame to ensure element is in DOM before showing picker
                requestAnimationFrame(() => {
                  try {
                    dateInput.showPicker?.();
                  } catch (err) {
                    // Fallback: focus the input to trigger picker
                    dateInput.focus();
                    dateInput.click();
                  }
                });

                dateInput.onchange = (ev: any) => {
                  if (ev.target.value) {
                    handleCalendarDateChange('endDate', ev.target.value);
                  }
                  if (dateInput.parentNode) {
                    document.body.removeChild(dateInput);
                  }
                };
                dateInput.onblur = () => {
                  setTimeout(() => {
                    if (dateInput.parentNode) {
                      document.body.removeChild(dateInput);
                    }
                  }, 100);
                };
              }}
            >
              <FaCalendarAlt className="text-gray-400" size={16} />
            </button>
          </div>
          {errors.endDate && <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>}
          <p className="text-xs text-gray-500 mt-1">Format: MM/DD/YYYY (e.g., 09/14/2025) or click calendar icon</p>
        </div>
      </div>
      <div>
        <label className="block font-medium">Promotion Start Date *</label>
        <div className="relative">
          <input
            ref={(el) => { if (el) fieldRefs.current.promotionStartDate = el; }}
            type="text"
            name="promotionStartDate"
            value={formatDateForDisplay(form.promotionStartDate)}
            onChange={handleDateChange}
            onKeyDown={handleDateKeyDown}
            onBlur={handleDateBlur}
            placeholder="MM/DD/YYYY"
            pattern="\d{2}/\d{2}/\d{4}"
            className={`w-full border rounded p-2 pr-10 ${errors.promotionStartDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded cursor-pointer z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const buttonRect = e.currentTarget.getBoundingClientRect();
              const dateInput = document.createElement('input');
              dateInput.type = 'date';
              dateInput.value = formatDateForStorage(formatDateForDisplay(form.promotionStartDate)) || '';
              // Position it near the button using fixed positioning
              dateInput.style.position = 'fixed';
              dateInput.style.left = `${buttonRect.left}px`;
              dateInput.style.top = `${buttonRect.bottom + 4}px`;
              dateInput.style.width = '1px';
              dateInput.style.height = '1px';
              dateInput.style.opacity = '0.01';
              dateInput.style.pointerEvents = 'none';
              dateInput.style.zIndex = '9999';
              document.body.appendChild(dateInput);

              // Use requestAnimationFrame to ensure element is in DOM before showing picker
              requestAnimationFrame(() => {
                try {
                  dateInput.showPicker?.();
                } catch (err) {
                  // Fallback: focus the input to trigger picker
                  dateInput.focus();
                  dateInput.click();
                }
              });

              dateInput.onchange = (ev: any) => {
                if (ev.target.value) {
                  handleCalendarDateChange('promotionStartDate', ev.target.value);
                }
                if (dateInput.parentNode) {
                  document.body.removeChild(dateInput);
                }
              };
              dateInput.onblur = () => {
                setTimeout(() => {
                  if (dateInput.parentNode) {
                    document.body.removeChild(dateInput);
                  }
                }, 100);
              };
            }}
          >
            <FaCalendarAlt className="text-gray-400" size={16} />
          </button>
        </div>
        {errors.promotionStartDate && <div className="text-red-500 text-sm mt-1">{errors.promotionStartDate}</div>}
        <p className="text-sm text-gray-500 mt-1">When should promotion for this event begin? Format: MM/DD/YYYY (e.g., 09/14/2025) or click calendar icon</p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block font-medium">Start Time *</label>
          <input
            ref={(el) => { if (el) fieldRefs.current.startTime = el; }}
            type="time"
            name="startTime"
            value={to24HourFormat(form.startTime)}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${errors.startTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.startTime && <div className="text-red-500 text-sm mt-1">{errors.startTime}</div>}
        </div>
        <div className="flex-1">
          <label className="block font-medium">End Time *</label>
          <input
            ref={(el) => { if (el) fieldRefs.current.endTime = el; }}
            type="time"
            name="endTime"
            value={to24HourFormat(form.endTime)}
            onChange={handleChange}
            className={`w-full border rounded p-2 ${errors.endTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          />
          {errors.endTime && <div className="text-red-500 text-sm mt-1">{errors.endTime}</div>}
        </div>
      </div>
      <div>
        <label className="block font-medium">Timezone *</label>
        <select
          ref={(el) => { if (el) fieldRefs.current.timezone = el; }}
          name="timezone"
          value={form.timezone || ''}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.timezone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          required
        >
          <option value="">Select timezone</option>
          {timezones.map((tz) => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
        {errors.timezone && <div className="text-red-500 text-sm mt-1">{errors.timezone}</div>}
      </div>
      <div>
        <label className="block font-medium">Location</label>
        <input
          ref={(el) => { if (el) fieldRefs.current.location = el; }}
          name="location"
          value={form.location}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block font-medium">Directions to Venue <span className="text-sm text-gray-500">({(form.directionsToVenue || '').length}/580)</span></label>
        <textarea
          ref={(el) => { if (el) fieldRefs.current.directionsToVenue = el; }}
          name="directionsToVenue"
          value={form.directionsToVenue ?? ""}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.directionsToVenue ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          maxLength={580}
          rows={3}
        />
        {errors.directionsToVenue && <div className="text-red-500 text-sm mt-1">{errors.directionsToVenue}</div>}
      </div>
      <div>
        <label className="block font-medium">Capacity</label>
        <input
          ref={(el) => { if (el) fieldRefs.current.capacity = el; }}
          type="number"
          name="capacity"
          value={form.capacity ?? ''}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block font-medium">Admission Type *</label>
        <select
          ref={(el) => { if (el) fieldRefs.current.admissionType = el; }}
          name="admissionType"
          value={form.admissionType}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.admissionType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
        >
          <option value="">Select admission type</option>
          <option value="free">Free</option>
          <option value="ticketed">Ticketed</option>
        </select>
        {errors.admissionType && <div className="text-red-500 text-sm mt-1">{errors.admissionType}</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {[
          { name: 'isActive', label: 'Active', checked: form.isActive ?? false },
          { name: 'allowGuests', label: 'Allow Guests', checked: form.allowGuests ?? false },
          { name: 'requireGuestApproval', label: 'Require Guest Approval', checked: form.requireGuestApproval ?? false },
          { name: 'enableGuestPricing', label: 'Enable Guest Pricing', checked: form.enableGuestPricing ?? false },
          { name: 'isRegistrationRequired', label: 'Registration Required', checked: form.isRegistrationRequired ?? false },
          { name: 'isSportsEvent', label: 'Sports Event', checked: form.isSportsEvent ?? false },
          { name: 'isLive', label: 'Live Event', checked: form.isLive ?? false },
          { name: 'isFeaturedEvent', label: 'Featured Event', checked: form.isFeaturedEvent ?? false },
        ].map(({ name, label, checked }) => (
          <div key={name} className="custom-grid-cell">
            <label className="flex flex-col items-center">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  name={name}
                  checked={checked}
                  onChange={e => setForm(f => ({ ...f, [name]: e.target.checked }))}
                  className="custom-checkbox"
                />
                <span className="custom-checkbox-tick">
                  {checked && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">{label}</span>
            </label>
          </div>
        ))}
      </div>

      {/* Fundraiser & Charity Configuration Section */}
      <div className="border-t border-gray-200 pt-6 mt-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Fundraiser & Charity Configuration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
          <div className="custom-grid-cell">
            <label className="flex flex-col items-center" htmlFor="isFundraiserEvent">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="isFundraiserEvent"
                  checked={isFundraiserEvent}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setIsFundraiserEvent(newValue);
                    // If fundraiser is checked, uncheck charity (radio button behavior)
                    if (newValue) {
                      setIsCharityEvent(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="custom-checkbox"
                />
                <span className="custom-checkbox-tick">
                  {isFundraiserEvent && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Is Fundraiser Event</span>
            </label>
          </div>

          <div className="custom-grid-cell">
            <label className="flex flex-col items-center" htmlFor="isCharityEvent">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="isCharityEvent"
                  checked={isCharityEvent}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setIsCharityEvent(newValue);
                    // If charity is checked, uncheck fundraiser (radio button behavior)
                    if (newValue) {
                      setIsFundraiserEvent(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="custom-checkbox"
                />
                <span className="custom-checkbox-tick">
                  {isCharityEvent && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Is Charity Event</span>
            </label>
          </div>
        </div>

        {/* Zero-Fee Provider Configuration */}
        <div className="mt-6 p-4 bg-white/70 rounded-lg border border-gray-200 backdrop-blur-sm">
          <h4 className="text-md font-semibold mb-4 text-gray-800">Zero-Fee Payment Provider</h4>

          <div className="flex justify-start mb-4">
            <div className="custom-grid-cell" style={{ minWidth: '120px' }}>
              <label className="flex flex-col items-center" htmlFor="useZeroFeeProvider">
                <span className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="useZeroFeeProvider"
                    checked={useZeroFeeProvider}
                    disabled={isFundraiserEvent || isCharityEvent} // Disable if fundraiser/charity is enabled (auto-enabled)
                    onChange={(e) => {
                      // Only allow changes if fundraiser/charity is not enabled
                      if (!isFundraiserEvent && !isCharityEvent) {
                        setUseZeroFeeProvider(e.target.checked);
                        if (!e.target.checked) {
                          setZeroFeeProvider('');
                          setGivebutterCampaignId('');
                        }
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="custom-checkbox"
                    title={isFundraiserEvent || isCharityEvent ? "Automatically enabled for fundraiser/charity events" : ""}
                  />
                  <span className="custom-checkbox-tick">
                    {useZeroFeeProvider && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Use Zero-Fee Provider</span>
              </label>
            </div>
          </div>

          {useZeroFeeProvider && (
            <div className="ml-6 space-y-4">
              <div>
                <label htmlFor="zeroFeeProvider" className="block text-sm font-medium text-gray-700 mb-1">
                  Zero-Fee Provider *
                  {(isFundraiserEvent || isCharityEvent) && (
                    <span className="ml-2 text-xs text-gray-500">(Auto-set to GIVEBUTTER for fundraiser/charity events)</span>
                  )}
                </label>
                <select
                  id="zeroFeeProvider"
                  value={zeroFeeProvider}
                  disabled={isFundraiserEvent || isCharityEvent} // Disable if fundraiser/charity is enabled (auto-set to GIVEBUTTER)
                  onChange={(e) => {
                    // Only allow changes if fundraiser/charity is not enabled
                    if (!isFundraiserEvent && !isCharityEvent) {
                      setZeroFeeProvider(e.target.value);
                      if (e.target.value !== 'GIVEBUTTER') {
                        setGivebutterCampaignId('');
                      }
                    }
                    // Clear error when user selects a provider
                    if (errors.zeroFeeProvider) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.zeroFeeProvider;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full border rounded p-2 focus:ring-blue-500 ${
                    errors.zeroFeeProvider
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  } ${(isFundraiserEvent || isCharityEvent) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  required={useZeroFeeProvider}
                  title={isFundraiserEvent || isCharityEvent ? "Automatically set to GIVEBUTTER for fundraiser/charity events" : ""}
                >
                  <option value="">Select provider</option>
                  <option value="GIVEBUTTER">Givebutter</option>
                  {/* Add other zero-fee providers here as needed */}
                </select>
                {errors.zeroFeeProvider && (
                  <div className="text-red-500 text-sm mt-1">{errors.zeroFeeProvider}</div>
                )}
              </div>

              {zeroFeeProvider === 'GIVEBUTTER' && (
                <div>
                  <label htmlFor="givebutterCampaignId" className="block text-sm font-medium text-gray-700 mb-1">
                    Givebutter Campaign ID <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="givebutterCampaignId"
                    value={givebutterCampaignId}
                    onChange={(e) => {
                      setGivebutterCampaignId(e.target.value);
                      // Clear error when user starts typing
                      if (errors.givebutterCampaignId) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.givebutterCampaignId;
                          return newErrors;
                        });
                      }
                    }}
                    placeholder="Enter Givebutter campaign ID"
                    className={`w-full border rounded p-2 focus:ring-blue-500 ${
                      errors.givebutterCampaignId
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required={false} // Optional - backend falls back to provider config campaign ID
                  />
                  {errors.givebutterCampaignId && (
                    <div className="text-red-500 text-sm mt-1">{errors.givebutterCampaignId}</div>
                  )}
                  <div className="text-xs text-gray-600 mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-semibold text-blue-900 mb-2">GiveButter Campaign ID (Optional):</p>
                    <div className="space-y-2 text-blue-800">
                      <p><strong>For DEV/PROD:</strong> This field is <strong>optional</strong>. If left empty, the backend will use the default campaign ID from your GiveButter provider configuration.</p>
                      <p><strong>Recommended:</strong> Set a specific campaign ID per event for better tracking and reporting.</p>
                      <div className="mt-3 p-2 bg-blue-100 rounded">
                        <p className="font-semibold mb-1">How to get your GiveButter Campaign ID:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Create a campaign in your <a href="https://givebutter.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">GiveButter dashboard</a></li>
                          <li>Open the campaign you want to use for this event</li>
                          <li>Go to <strong>Settings</strong> → <strong>Advanced</strong> → Find <strong>Campaign ID</strong></li>
                          <li>Or check the campaign URL: <code className="bg-white px-1 rounded">https://givebutter.com/[campaign-slug]</code></li>
                          <li>Copy the Campaign ID (format: <code className="bg-white px-1 rounded">campaign_123abc</code>)</li>
                          <li>Paste it in the field above</li>
                        </ol>
                      </div>
                      <p className="mt-2 text-blue-700 text-xs">
                        <strong>Fallback Behavior:</strong> If this field is empty, the system will use the campaign ID configured in your GiveButter payment provider settings (stored in <code className="bg-blue-100 px-1 rounded">payment_provider_config.metadata.campaignId</code>).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Priority Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium">Featured Event Priority Ranking</label>
          <input
            ref={(el) => { if (el) fieldRefs.current.featuredEventPriorityRanking = el; }}
            type="number"
            name="featuredEventPriorityRanking"
            value={form.featuredEventPriorityRanking ?? ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            min={0}
            placeholder="0"
          />
          <p className="text-sm text-gray-500 mt-1">Higher numbers = higher priority</p>
        </div>
        <div>
          <label className="block font-medium">Live Event Priority Ranking</label>
          <input
            ref={(el) => { if (el) fieldRefs.current.liveEventPriorityRanking = el; }}
            type="number"
            name="liveEventPriorityRanking"
            value={form.liveEventPriorityRanking ?? ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            min={0}
            placeholder="0"
          />
          <p className="text-sm text-gray-500 mt-1">Higher numbers = higher priority</p>
        </div>
      </div>
      <div>
        <label className="block font-medium">Max Guests Per Attendee</label>
        <input
          ref={(el) => { if (el) fieldRefs.current.maxGuestsPerAttendee = el; }}
          type="number"
          name="maxGuestsPerAttendee"
          value={form.maxGuestsPerAttendee ?? ''}
          onChange={handleChange}
          className={`w-full border rounded p-2 ${errors.maxGuestsPerAttendee ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
          min={0}
        />
        {errors.maxGuestsPerAttendee && <div className="text-red-500 text-sm mt-1">{errors.maxGuestsPerAttendee}</div>}
      </div>

      {/* Recurring Event Configuration Section */}
      <RecurrenceConfigSection
        isRecurring={isRecurring}
        onRecurringChange={setIsRecurring}
        pattern={recurrencePattern}
        onPatternChange={setRecurrencePattern}
        interval={recurrenceInterval}
        onIntervalChange={setRecurrenceInterval}
        endType={recurrenceEndType}
        onEndTypeChange={setRecurrenceEndType}
        endDate={recurrenceEndDate}
        onEndDateChange={setRecurrenceEndDate}
        occurrences={recurrenceOccurrences}
        onOccurrencesChange={setRecurrenceOccurrences}
        weeklyDays={recurrenceWeeklyDays}
        onWeeklyDaysChange={setRecurrenceWeeklyDays}
        monthlyDay={recurrenceMonthlyDay}
        onMonthlyDayChange={setRecurrenceMonthlyDay}
        monthlyDayType={recurrenceMonthlyDayType}
        onMonthlyDayTypeChange={setRecurrenceMonthlyDayType}
        errors={errors}
        startDate={formatDateForStorage(form.startDate)}
        startTime={form.startTime}
        timezone={form.timezone}
      />

      {/* Recurrence Preview */}
      {isRecurring && recurrencePattern && (
        <RecurrencePreview
          startDate={formatDateForStorage(form.startDate)}
          startTime={form.startTime}
          timezone={form.timezone}
          pattern={recurrencePattern}
          interval={recurrenceInterval}
          endType={recurrenceEndType}
          endDate={recurrenceEndDate ? formatDateForStorage(recurrenceEndDate) : undefined}
          occurrences={recurrenceEndType === 'OCCURRENCES' ? recurrenceOccurrences : undefined}
          weeklyDays={recurrenceWeeklyDays.length > 0 ? recurrenceWeeklyDays : undefined}
          monthlyDay={recurrenceMonthlyDay || undefined}
        />
      )}

      {/* Email Header Image Upload Section */}
      {form.id && (
        <div className="border-t border-gray-200 pt-6 mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <FaEnvelope className="text-blue-500" />
              Email Header Image
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload an image to be used as the header in ticket confirmation emails sent to attendees.
              This image will appear at the top of the email template.
            </p>
          </div>
          <EmailHeaderImageUpload
            eventId={form.id}
            currentImageUrl={form.emailHeaderImageUrl}
            onImageUploaded={(imageUrl) => {
              setForm(prev => ({ ...prev, emailHeaderImageUrl: imageUrl }));
            }}
            onError={(error) => {
              console.error('Email header image upload error:', error);
              setErrors(prev => ({ ...prev, emailHeaderImage: error }));
            }}
            disabled={loading}
            className="w-full"
          />
          {errors.emailHeaderImage && (
            <div className="text-red-500 text-sm mt-2">{errors.emailHeaderImage}</div>
          )}
          {form.emailHeaderImageUrl && (
            <p className="text-xs text-gray-500 mt-2">
              Current email header image URL: <span className="font-mono text-xs break-all">{form.emailHeaderImageUrl}</span>
            </p>
          )}
        </div>
      )}

      {/* From Email Field */}
      <div className="mb-4">
        <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-1">
          From Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="fromEmail"
          name="fromEmail"
          value={form.fromEmail || ''}
          onChange={(e) => {
            const value = e.target.value;
            setForm(prev => ({ ...prev, fromEmail: value }));
            // Clear error when user starts typing
            if (errors.fromEmail) {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.fromEmail;
                return newErrors;
              });
            }
          }}
          onBlur={() => {
            // Validate email format on blur
            const email = form.fromEmail || '';
            if (!email.trim()) {
              setErrors(prev => ({ ...prev, fromEmail: 'From email is required' }));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              setErrors(prev => ({ ...prev, fromEmail: 'Please enter a valid email address' }));
            }
          }}
          required
          className={`mt-1 block w-full border rounded-md px-3 py-2 text-base ${
            errors.fromEmail
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          placeholder="e.g., events@example.com"
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
        />
        {errors.fromEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.fromEmail}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          The email address that will appear as the sender of event-related emails (ticket confirmations, etc.).
        </p>
      </div>

      {/* Error Summary Display - Above the save button */}
      {showErrors && getErrorCount() > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following {getErrorCount()} error{getErrorCount() !== 1 ? 's' : ''}:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(errors).map(([fieldName, errorMessage]) => (
                    <li key={fieldName}>
                      <span className="font-medium capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}:</span> {errorMessage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save Event'}
        </button>
        <button type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" onClick={handleReset}>Reset</button>
      </div>
    </form>
  );
}