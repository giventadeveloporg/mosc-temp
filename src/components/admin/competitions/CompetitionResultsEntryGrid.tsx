'use client';

import { useState, useTransition } from 'react';
import type { EventCompetitionDTO, EventCompetitionRegistrationDTO, EventCompetitionResultDTO } from '@/types';
import {
  createCompetitionResultServer,
  patchCompetitionResultServer,
} from '@/app/admin/events/[id]/competitions/ApiServerActions';
import WinnerPhotoUpload from './WinnerPhotoUpload';

interface Props {
  eventId: string;
  competitions: EventCompetitionDTO[];
  registrations: EventCompetitionRegistrationDTO[];
  initialResults: EventCompetitionResultDTO[];
}

export default function CompetitionResultsEntryGrid({
  eventId,
  competitions,
  registrations,
  initialResults,
}: Props) {
  const [results, setResults] = useState(initialResults);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const confirmedRegs = registrations.filter((r) => r.registrationStatus === 'CONFIRMED');

  const saveResult = (result: EventCompetitionResultDTO) => {
    if (!result.id) return;
    startTransition(async () => {
      try {
        setError(null);
        const updated = await patchCompetitionResultServer(result.id!, eventId, result);
        setResults((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Update failed');
      }
    });
  };

  const addFromRegistration = (reg: EventCompetitionRegistrationDTO) => {
    const name =
      reg.participantProfile?.displayName ||
      `${reg.participantProfile?.firstName ?? ''} ${reg.participantProfile?.lastName ?? ''}`.trim();
    startTransition(async () => {
      try {
        setError(null);
        const created = await createCompetitionResultServer(eventId, {
          displayName: name || 'Participant',
          placement: 1,
          placementLabel: '1st',
          prizeTitle: '',
          prizeDetails: '',
          pointsAwarded: 0,
          winnerPhotoUrl: '',
          notes: '',
          isPublished: false,
          competition: reg.competition?.id ? { id: reg.competition.id } : undefined,
          participantProfile: reg.participantProfile?.id ? { id: reg.participantProfile.id } : undefined,
          registration: reg.id ? { id: reg.id } : undefined,
        } as EventCompetitionResultDTO);
        setResults((prev) => [...prev, created]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Create failed');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-2">Add result from registration</h3>
        <select
          className="border border-gray-400 rounded-xl px-4 py-2 w-full max-w-md"
          defaultValue=""
          onChange={(e) => {
            const id = parseInt(e.target.value, 10);
            if (!id) return;
            const reg = confirmedRegs.find((r) => r.id === id);
            if (reg) addFromRegistration(reg);
            e.target.value = '';
          }}
        >
          <option value="">Select confirmed registration...</option>
          {confirmedRegs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.competition?.name} — {r.participantProfile?.firstName} {r.participantProfile?.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {results.map((result, idx) => (
          <div key={result.id ?? idx} className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border border-gray-400 rounded-xl px-3 py-2"
                value={result.displayName}
                onChange={(e) =>
                  setResults((prev) =>
                    prev.map((r) => (r.id === result.id ? { ...r, displayName: e.target.value } : r))
                  )
                }
              />
              <input
                type="number"
                placeholder="Placement"
                className="border border-gray-400 rounded-xl px-3 py-2"
                value={result.placement ?? ''}
                onChange={(e) =>
                  setResults((prev) =>
                    prev.map((r) =>
                      r.id === result.id ? { ...r, placement: parseInt(e.target.value, 10) || null } : r
                    )
                  )
                }
              />
              <input
                placeholder="Prize title"
                className="border border-gray-400 rounded-xl px-3 py-2"
                value={result.prizeTitle ?? ''}
                onChange={(e) =>
                  setResults((prev) =>
                    prev.map((r) => (r.id === result.id ? { ...r, prizeTitle: e.target.value } : r))
                  )
                }
              />
              <input
                type="number"
                placeholder="Points"
                className="border border-gray-400 rounded-xl px-3 py-2"
                value={result.pointsAwarded}
                onChange={(e) =>
                  setResults((prev) =>
                    prev.map((r) =>
                      r.id === result.id ? { ...r, pointsAwarded: parseInt(e.target.value, 10) || 0 } : r
                    )
                  )
                }
              />
            </div>
            <label className="flex items-center gap-2 mt-3 text-sm">
              <input
                type="checkbox"
                checked={result.isPublished}
                onChange={(e) =>
                  setResults((prev) =>
                    prev.map((r) =>
                      r.id === result.id
                        ? {
                            ...r,
                            isPublished: e.target.checked,
                            publishedAt: e.target.checked ? new Date().toISOString() : null,
                          }
                        : r
                    )
                  )
                }
              />
              Published
            </label>
            {result.id && (
              <div className="mt-3 flex flex-wrap items-center gap-4">
                {result.winnerPhotoUrl && (
                  <img
                    src={result.winnerPhotoUrl}
                    alt={result.displayName}
                    className="w-24 h-24 object-contain rounded-lg border"
                  />
                )}
                <WinnerPhotoUpload
                  eventId={eventId}
                  resultId={result.id}
                  onUploaded={(url) =>
                    setResults((prev) =>
                      prev.map((r) => (r.id === result.id ? { ...r, winnerPhotoUrl: url } : r))
                    )
                  }
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const current = results.find((r) => r.id === result.id);
                    if (current) saveResult(current);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Save
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {result.competition?.name ?? competitions.find((c) => c.id === result.competition?.id)?.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
