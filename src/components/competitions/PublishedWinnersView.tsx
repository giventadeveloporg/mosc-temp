import Image from 'next/image';
import type { EventCompetitionResultDTO } from '@/types';

interface Props {
  results: EventCompetitionResultDTO[];
}

export default function PublishedWinnersView({ results }: Props) {
  if (results.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">Winners will be announced after the competition.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => (
        <div key={result.id} className="bg-card rounded-lg sacred-shadow overflow-hidden">
          <div className="relative w-full h-48 bg-muted">
            {result.winnerPhotoUrl ? (
              <Image
                src={result.winnerPhotoUrl}
                alt={result.displayName}
                fill
                className="object-contain"
                sizes="(min-width: 1024px) 33vw, 100vw"
                unoptimized
              />
            ) : (
              <div className="flex items-center justify-center h-full text-4xl text-muted-foreground">🏆</div>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs font-caption text-primary uppercase tracking-wide">
              {result.placementLabel || (result.placement ? `#${result.placement}` : '')}
            </p>
            <h3 className="font-heading font-semibold text-lg text-foreground">{result.displayName}</h3>
            {result.competition?.name && (
              <p className="text-sm text-muted-foreground mt-1">{result.competition.name}</p>
            )}
            {result.prizeTitle && (
              <p className="text-sm font-medium text-foreground mt-2">{result.prizeTitle}</p>
            )}
            {result.prizeDetails && (
              <p className="text-sm text-muted-foreground mt-1">{result.prizeDetails}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
