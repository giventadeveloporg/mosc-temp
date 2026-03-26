import DownloadsPageClient, { type DownloadCard } from './DownloadsPageClient';
import { downloadsStaticItems } from './downloadsStaticItems';
import { fetchPublicOfficialDocumentsForDownloadsServer } from './ApiServerActions';
import type { EventMediaDTO } from '@/types';

function mapOfficialDocsToCards(docs: EventMediaDTO[]): DownloadCard[] {
  return docs.map((d) => {
    const link = (d.preSignedUrl || d.fileUrl || '').trim();
    const hasLink = link.length > 0;
    return {
      title: d.title,
      link: hasLink ? link : '#',
      isPlaceholder: !hasLink,
    };
  });
}

export default async function DownloadsPage() {
  const staticCards: DownloadCard[] = downloadsStaticItems.map((item) => ({
    title: item.title,
    link: item.link,
    image: item.image,
    isPlaceholder: item.link === '#',
  }));

  const dataDriven =
    process.env.NEXT_PUBLIC_MOSC_DOWNLOADS_DATA_DRIVEN === 'true' ||
    process.env.AMPLIFY_NEXT_PUBLIC_MOSC_DOWNLOADS_DATA_DRIVEN === 'true';

  let officialLibraryCards: DownloadCard[] = [];
  if (dataDriven) {
    try {
      const docs = await fetchPublicOfficialDocumentsForDownloadsServer();
      officialLibraryCards = mapOfficialDocsToCards(docs);
    } catch {
      officialLibraryCards = [];
    }
  }

  return (
    <DownloadsPageClient staticCards={staticCards} officialLibraryCards={officialLibraryCards} />
  );
}
