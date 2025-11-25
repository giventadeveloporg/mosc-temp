import TicketQrClient from './TicketQrClient';

interface PageProps {
  searchParams: Promise<{ pi?: string; session_id?: string }>;
}

export default async function TicketQrPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pi = params.pi;
  const session_id = params.session_id;

  console.log('[QR PAGE SERVER] TicketQrPage component rendering');
  console.log('[QR PAGE SERVER] Search params:', { pi, session_id });
  console.log('[QR PAGE SERVER] Rendering TicketQrClient with props:', { initialPi: pi, initialSessionId: session_id });

  return (
    <TicketQrClient initialPi={pi} initialSessionId={session_id} />
  );
}