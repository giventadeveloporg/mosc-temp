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

  return (
    <div>
      <div style={{ padding: '20px', background: 'yellow', textAlign: 'center' }}>
        <h1>[DEBUG] QR Page is Loading...</h1>
        <p>If you see this, the page is rendering correctly</p>
        <p>PI: {pi || 'N/A'} | Session: {session_id || 'N/A'}</p>
      </div>
      <TicketQrClient initialPi={pi} initialSessionId={session_id} />
    </div>
  );
}