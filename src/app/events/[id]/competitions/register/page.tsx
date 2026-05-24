import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import RegistrationWizard from '@/components/competitions/RegistrationWizard';
import {
  fetchMyParticipantsServer,
  fetchPublicCompetitionDaysServer,
  fetchPublicCompetitionsServer,
  fetchPublicCompetitionSettingsServer,
  getAuthenticatedClerkUserId,
} from '../ApiServerActions';

export default async function CompetitionRegisterPage(props: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const eventId = params.id;

  const clerkUserId = await getAuthenticatedClerkUserId();
  if (!clerkUserId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/events/${eventId}/competitions/register`)}`);
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  const [settings, competitions, days, participants] = await Promise.all([
    fetchPublicCompetitionSettingsServer(eventId),
    fetchPublicCompetitionsServer(eventId),
    fetchPublicCompetitionDaysServer(eventId),
    fetchMyParticipantsServer(clerkUserId),
  ]);

  if (!settings) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p>Competition settings are not configured for this event yet.</p>
        <Link href={`/events/${eventId}/competitions`} className="text-primary hover:underline">
          Back to competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/events/${eventId}/competitions`} className="text-sm text-primary hover:underline">
        ← Competitions
      </Link>
      <h1 className="font-heading font-semibold text-3xl mt-2 mb-8">Register</h1>
      <RegistrationWizard
        eventId={eventId}
        settings={settings}
        competitions={competitions}
        days={days}
        clerkUserId={clerkUserId}
        existingParticipants={participants}
        userEmail={userEmail}
      />
    </div>
  );
}
