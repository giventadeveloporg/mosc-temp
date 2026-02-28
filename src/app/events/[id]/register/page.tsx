"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { getTenantId } from "@/lib/env";
import type { EventDetailsDTO, EventMediaDTO, EventAttendeeDTO, EventAttendeeGuestDTO, UserProfileDTO } from "@/types";
import { FaPlus, FaTrashAlt, FaCheck, FaPaperclip, FaTimes, FaUpload } from "react-icons/fa";
import LocationDisplay from '@/components/LocationDisplay';

const NOTES_MAX_LENGTH = 1500;
const MAX_ATTACHMENTS = 2;
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "jpg",
  "jpeg",
  "png",
]);

export default function EventRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const eventId = Number(id);
  const { userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // State for event details and media
  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [media, setMedia] = useState<EventMediaDTO[]>([]);
  const [loadingEvent, setLoadingEvent] = useState(true);

  // State for attendee and guests
  const [attendee, setAttendee] = useState<EventAttendeeDTO>({
    tenantId: getTenantId(),
    eventId,
    registrationStatus: "PENDING",
    registrationDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // All other fields default to undefined
  });
  const [guests, setGuests] = useState<EventAttendeeGuestDTO[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadValidationError, setUploadValidationError] = useState("");

  // Fetch event details and media
  useEffect(() => {
    async function fetchEvent() {
      setLoadingEvent(true);
      try {
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData: EventDetailsDTO = await eventRes.json();
        setEvent(eventData);
        const mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isEventManagementOfficialDocument.equals=false&sort=updatedAt,desc`);
        const mediaData = await mediaRes.json();
        setMedia(Array.isArray(mediaData) ? mediaData : [mediaData]);
      } catch (err) {
        setEvent(null);
        setMedia([]);
      } finally {
        setLoadingEvent(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  // Prepopulate attendee fields from user profile if logged in
  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      setLoadingProfile(true);
      try {
        const res = await fetch(`/api/proxy/user-profiles/by-user/${userId}?tenantId.equals=${getTenantId()}`);
        if (res.ok) {
          const profile: UserProfileDTO = await res.json();
          setAttendee((prev) => ({
            ...prev,
            firstName: profile.firstName || user?.firstName || "",
            lastName: profile.lastName || user?.lastName || "",
            email: profile.email || user?.primaryEmailAddress?.emailAddress || "",
            phone: profile.phone || user?.phoneNumbers?.[0]?.phoneNumber || "",
            attendeeId: profile.id,
          }));
        } else if (user) {
          setAttendee((prev) => ({
            ...prev,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.primaryEmailAddress?.emailAddress || "",
            phone: user.phoneNumbers?.[0]?.phoneNumber || "",
          }));
        }
      } catch { }
      setLoadingProfile(false);
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user]);

  const getFileExtension = (name: string): string => {
    const splitName = name.split(".");
    if (splitName.length < 2) return "";
    return splitName[splitName.length - 1].toLowerCase();
  };

  const validateAttachment = (file: File): string | null => {
    const extension = getFileExtension(file.name);
    if (!ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)) {
      return `${file.name}: unsupported file type`;
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      return `${file.name}: exceeds 10MB size limit`;
    }
    return null;
  };

  // Handle attendee field changes
  const handleAttendeeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAttendee((prev) => ({
      ...prev,
      [name]:
        name === "notes"
          ? value.slice(0, NOTES_MAX_LENGTH)
          : type === "checkbox" && e.target instanceof HTMLInputElement
            ? e.target.checked
            : value,
    }));
  };

  const handleAttachmentSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const mergedFiles = [...attachments, ...selected];
    const uniqueFiles = mergedFiles.filter(
      (file, idx, arr) =>
        arr.findIndex(
          (item) =>
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
        ) === idx
    );

    if (uniqueFiles.length > MAX_ATTACHMENTS) {
      setUploadValidationError(`You can upload a maximum of ${MAX_ATTACHMENTS} attachments.`);
      return;
    }

    const invalidMessage = uniqueFiles.map(validateAttachment).find(Boolean);
    if (invalidMessage) {
      setUploadValidationError(invalidMessage);
      return;
    }

    setUploadValidationError("");
    setAttachments(uniqueFiles);
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
    setUploadValidationError("");
  };

  // Handle guest field changes
  const handleGuestChange = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setGuests((prev) => prev.map((g, i) => i === idx ? { ...g, [name]: type === "checkbox" && e.target instanceof HTMLInputElement ? e.target.checked : value } : g));
  };

  // Add a new guest
  const addGuest = () => {
    setGuests((prev) => [
      ...prev,
      {
        tenantId: getTenantId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  // Remove a guest
  const removeGuest = (idx: number) => {
    setGuests((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // Send attendee
      const attendeePayload: EventAttendeeDTO = {
        ...attendee,
        tenantId: getTenantId(),
        eventId,
        createdAt: attendee.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const attendeeRes = await fetch("/api/proxy/event-attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendeePayload),
      });
      if (!attendeeRes.ok) {
        // Try to parse backend error
        let errorMsg = "Failed to register attendee";
        try {
          const errorData = await attendeeRes.json();
          if (
            typeof errorData === "object" &&
            errorData.detail &&
            errorData.detail.includes("duplicate key value") &&
            errorData.detail.includes("ux_event_attendee__event_attendee")
          ) {
            errorMsg = "You have already registered for this event.";
          } else if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch {
          // fallback: try text
          try {
            const text = await attendeeRes.text();
            if (
              text.includes("duplicate key value") &&
              text.includes("ux_event_attendee__event_attendee")
            ) {
              errorMsg = "You have already registered for this event.";
            }
          } catch { }
        }
        throw new Error(errorMsg);
      }
      const savedAttendee = await attendeeRes.json();
      // Send guests
      for (const guest of guests) {
        const guestPayload: EventAttendeeGuestDTO = {
          ...guest,
          tenantId: getTenantId(),
          createdAt: guest.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          primaryAttendee: {
            id: savedAttendee.id,
            registrationStatus: savedAttendee.registrationStatus,
            registrationDate: savedAttendee.registrationDate,
            createdAt: savedAttendee.createdAt,
            updatedAt: savedAttendee.updatedAt,
          },
        };
        const guestRes = await fetch("/api/proxy/event-attendee-guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guestPayload),
        });
        if (!guestRes.ok) throw new Error("Failed to register guest");
      }

      // Upload attendee attachments
      for (const file of attachments) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("attendeeId", String(savedAttendee.id));
        formData.append("eventId", String(eventId));
        formData.append("tenantId", getTenantId());
        formData.append("title", file.name);
        formData.append("description", "Event registration attachment");
        formData.append("eventMediaType", "ATTENDEE_ATTACHMENT");
        formData.append("storageType", "S3");
        formData.append("isPublic", "false");

        const uploadRes = await fetch("/api/proxy/event-attendee-attachments/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(`Failed to upload attachment: ${file.name}`);
        }
      }

      // Redirect to success page with attendee ID
      router.push(`/events/${eventId}/register/success?attendeeId=${savedAttendee.id}`);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Find flyer/hero image
  const flyer = media.find((m) => m.eventFlyer && m.fileUrl) || media.find((m) => m.fileUrl);

  // Responsive layout: summary+thumbnail above form on mobile, side-by-side on desktop
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {/* Event summary and thumbnail */}
        <div className="md:col-span-1 flex flex-col items-center md:items-start">
          {flyer && flyer.fileUrl && (
            <div className="mb-4 w-full flex justify-center md:justify-start">
              <Image
                src={flyer.fileUrl}
                alt="Event Flyer"
                width={220}
                height={160}
                className="rounded-xl shadow-lg object-cover w-[220px] h-[160px] border border-white"
              />
            </div>
          )}
          {event && (
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md">
              <tbody>
                <tr><th className="text-left font-semibold pr-2 py-2 px-3 bg-gray-50">Title</th><td className="py-2 px-3">{event.title}</td></tr>
                <tr><th className="text-left font-semibold pr-2 py-2 px-3 bg-gray-50">Date</th><td className="py-2 px-3">{event.startDate}</td></tr>
                <tr><th className="text-left font-semibold pr-2 py-2 px-3 bg-gray-50">Time</th><td className="py-2 px-3">{event.startTime} - {event.endTime}</td></tr>
                <tr><th className="text-left font-semibold pr-2 py-2 px-3 bg-gray-50">Location</th><td className="py-2 px-3">{event.location && <LocationDisplay location={event.location} />}</td></tr>
                {event.description && <tr><th className="text-left font-semibold pr-2 py-2 px-3 bg-gray-50 align-top">Description</th><td className="py-2 px-3 align-top">{event.description}</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {/* Registration form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <h2 className="md:col-span-2 text-2xl font-bold text-gray-900 mb-1">Register for Event</h2>
            <p className="md:col-span-2 text-sm text-gray-500 -mt-4">
              Complete your details and optionally upload up to two supporting files.
            </p>
            {error && <div className="md:col-span-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</div>}

            <input type="hidden" name="tenantId" value={attendee.tenantId} />
            <input type="hidden" name="eventId" value={attendee.eventId} />

            <div>
              <label className="block font-medium text-gray-700 mb-1">First Name</label>
              <input name="firstName" value={attendee.firstName || ""} onChange={handleAttendeeChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Last Name</label>
              <input name="lastName" value={attendee.lastName || ""} onChange={handleAttendeeChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={attendee.email || ""} onChange={handleAttendeeChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" value={attendee.phone || ""} onChange={handleAttendeeChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-gray-700">Notes</label>
                <span className={`text-xs ${((attendee.notes?.length || 0) > NOTES_MAX_LENGTH - 100) ? "text-amber-600" : "text-gray-500"}`}>
                  {(attendee.notes?.length || 0)}/{NOTES_MAX_LENGTH}
                </span>
              </div>
              <textarea
                name="notes"
                value={attendee.notes || ""}
                onChange={handleAttendeeChange}
                maxLength={NOTES_MAX_LENGTH}
                rows={5}
                placeholder="Optional notes for the registration team"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-gray-700 mb-2">Attachments (optional)</label>
              <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-6 text-center cursor-pointer hover:bg-blue-50 transition-colors">
                <FaUpload className="text-blue-500 mb-2" />
                <span className="text-sm font-medium text-blue-700">
                  Upload up to {MAX_ATTACHMENTS} files
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PDF, DOC/DOCX, XLS/XLSX, CSV, TXT, JPG, JPEG, PNG (max 10MB each)
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAttachmentSelection}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                />
              </label>
              {uploadValidationError && (
                <p className="mt-2 text-sm text-red-600">{uploadValidationError}</p>
              )}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, idx) => (
                    <div key={`${file.name}-${file.size}-${idx}`} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FaPaperclip className="text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Guests section */}
            <div className="md:col-span-2 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  Guests
                  <span className="text-blue-600 font-bold ml-2">[optional]</span>
                </span>
                <button type="button" onClick={addGuest} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold flex items-center min-w-[160px] transition-colors">
                  <FaPlus className="mr-2" /> Add Guest
                </button>
              </div>
              {guests.map((guest, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">First Name</label>
                    <input name="firstName" value={guest.firstName || ""} onChange={e => handleGuestChange(idx, e)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Last Name</label>
                    <input name="lastName" value={guest.lastName || ""} onChange={e => handleGuestChange(idx, e)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Age Group</label>
                    <select name="ageGroup" value={guest.ageGroup || ""} onChange={e => handleGuestChange(idx, e)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" required>
                      <option value="" disabled>Select age group</option>
                      <option value="Child">Child</option>
                      <option value="Teen">Teen</option>
                      <option value="Adult">Adult</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Email</label>
                    <input name="email" type="email" value={guest.email || ""} onChange={e => handleGuestChange(idx, e)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Phone</label>
                    <input name="phone" value={guest.phone || ""} onChange={e => handleGuestChange(idx, e)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button type="button" onClick={() => removeGuest(idx)} className="text-red-600 hover:text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg flex items-center transition-colors">
                      <FaTrashAlt className="mr-2" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-semibold flex items-center min-w-[180px] justify-center transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                <FaCheck className="mr-2" />
                {submitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}