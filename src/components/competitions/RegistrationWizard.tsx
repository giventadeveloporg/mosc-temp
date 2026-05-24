'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CompetitionAudienceMode,
  EventCompetitionDTO,
  EventCompetitionDayDTO,
  EventCompetitionParticipantDTO,
  EventCompetitionSettingsDTO,
} from '@/types';
import {
  createParticipantServer,
  createRegistrationServer,
  patchParticipantServer,
} from '@/app/events/[id]/competitions/ApiServerActions';
import ParticipantProfileForm, { type ParticipantFormValues } from './ParticipantProfileForm';
import CompetitionCatalog from './CompetitionCatalog';
import RegistrationCart from './RegistrationCart';

interface Props {
  eventId: string;
  settings: EventCompetitionSettingsDTO;
  competitions: EventCompetitionDTO[];
  days: EventCompetitionDayDTO[];
  clerkUserId: string;
  existingParticipants: EventCompetitionParticipantDTO[];
  userEmail?: string;
}

type CartLine = { competitionId: number; feeAmount: number; registrationId?: number };

const emptyProfile = (email = ''): ParticipantFormValues => ({
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: '',
  currentGrade: '',
  schoolName: '',
  phone: '',
  email,
});

export default function RegistrationWizard({
  eventId,
  settings,
  competitions,
  days,
  clerkUserId,
  existingParticipants,
  userEmail,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [participantId, setParticipantId] = useState<number | null>(
    existingParticipants[0]?.id ?? null
  );
  const [profile, setProfile] = useState<ParticipantFormValues>(() => {
    const p = existingParticipants[0];
    if (!p) return emptyProfile(userEmail);
    return {
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      displayName: p.displayName || '',
      dateOfBirth: p.dateOfBirth?.split('T')[0] || '',
      currentGrade: p.currentGrade != null ? String(p.currentGrade) : '',
      schoolName: p.schoolName || '',
      phone: p.phone || '',
      email: p.email || userEmail || '',
    };
  });
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [registrationsCreated, setRegistrationsCreated] = useState(false);

  const audienceMode: CompetitionAudienceMode = settings.audienceMode;
  const selectedIds = Object.keys(selected).map((k) => parseInt(k, 10));

  const returnUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/events/${eventId}/competitions/my-registrations?payment=success`;
  }, [eventId]);

  const toggleCompetition = (competitionId: number, feeAmount: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[competitionId] != null) delete next[competitionId];
      else next[competitionId] = feeAmount;
      return next;
    });
  };

  const participantType =
    audienceMode === 'ADULT' ? 'ADULT' : audienceMode === 'YOUTH' ? 'CHILD' : 'ADULT';

  const saveProfile = () => {
    startTransition(async () => {
      try {
        setError(null);
        const payload = {
          participantType: participantType as 'CHILD' | 'ADULT' | 'TEAM_MEMBER',
          clerkUserId,
          firstName: profile.firstName.trim(),
          lastName: profile.lastName.trim(),
          displayName: profile.displayName.trim() || `${profile.firstName} ${profile.lastName}`.trim(),
          dateOfBirth: profile.dateOfBirth || null,
          currentGrade: profile.currentGrade ? parseInt(profile.currentGrade, 10) : null,
          schoolName: profile.schoolName || '',
          phone: profile.phone || '',
          email: profile.email || userEmail || '',
          isActive: true,
        };
        let pid = participantId;
        if (pid) {
          await patchParticipantServer(pid, payload);
        } else {
          const created = await createParticipantServer(payload);
          pid = created.id ?? null;
          setParticipantId(pid);
        }
        if (!pid) throw new Error('Could not save participant profile');
        setStep(2);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to save profile');
      }
    });
  };

  const createRegistrations = () => {
    if (!participantId || selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        setError(null);
        const lines: CartLine[] = [];
        for (const compId of selectedIds) {
          const comp = competitions.find((c) => c.id === compId);
          const fee = selected[compId] ?? Number(comp?.feeAmount) ?? 0;
          const reg = await createRegistrationServer(eventId, {
            competitionId: compId,
            participantProfileId: participantId,
            feeAmount: fee,
            effectiveCategory: comp?.categoryCode || comp?.divisionLabel || '',
          });
          lines.push({
            competitionId: compId,
            feeAmount: fee,
            registrationId: reg.id,
          });
        }
        setCartLines(lines);
        setRegistrationsCreated(true);
        setStep(3);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to create registrations');
      }
    });
  };

  if (!settings.registrationOpen) {
    return (
      <div className="p-6 bg-orange-50 border border-orange-200 rounded-lg text-orange-800">
        Registration is currently closed for this event.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex gap-2 text-sm">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`px-3 py-1 rounded-full ${step === n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Step {n}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-card rounded-lg sacred-shadow p-6 space-y-4">
          <h2 className="font-heading font-semibold text-xl">
            {audienceMode === 'YOUTH' ? 'Participant (child) profile' : 'Your profile'}
          </h2>
          <ParticipantProfileForm
            audienceMode={audienceMode}
            values={profile}
            onChange={setProfile}
          />
          <button
            type="button"
            disabled={isPending || !profile.firstName.trim() || !profile.lastName.trim()}
            onClick={saveProfile}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
          >
            Continue to competitions
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <CompetitionCatalog
            competitions={competitions}
            days={days}
            selectedIds={selectedIds}
            onToggle={toggleCompetition}
          />
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="px-4 py-2 border rounded-xl">
              Back
            </button>
            <button
              type="button"
              disabled={isPending || selectedIds.length === 0}
              onClick={createRegistrations}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Continue to payment
            </button>
          </div>
        </div>
      )}

      {step === 3 && registrationsCreated && (
        <div className="space-y-4">
          <RegistrationCart
            eventId={eventId}
            lines={cartLines}
            competitions={competitions}
            email={profile.email || userEmail}
            returnUrl={returnUrl}
            showCheckout
          />
          <button
            type="button"
            onClick={() => router.push(`/events/${eventId}/competitions/my-registrations`)}
            className="text-sm text-blue-600 hover:underline"
          >
            View my registrations later
          </button>
        </div>
      )}
    </div>
  );
}
