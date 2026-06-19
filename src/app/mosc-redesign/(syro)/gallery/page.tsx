import React from 'react';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscGalleryAlbumCard } from '@/components/gallery/MoscGalleryAlbumCard';
import { fetchAlbumsForGallery } from '@/app/gallery/ApiServerActions';
import { MOSC_STATIC_GALLERY_ALBUMS } from '@/lib/gallery/moscStaticAlbums';
import { resolveMoscGalleryAlbumHref } from '@/lib/gallery/resolveMoscGalleryHref';
import { MoscGalleryPagination } from './components/MoscGalleryPagination';

export const metadata: Metadata = {
  title: 'Photo Gallery | Malankara Orthodox Syrian Church',
  description: 'Photo gallery of significant events, ecumenical visits, and ceremonies of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Gallery', 'Photo Gallery', 'Church Events', 'Ecumenical Visits', 'Orthodox Church'],
};

const BANNER_DESCRIPTION =
  'Photo gallery of significant events, ecumenical visits, and ceremonies of the Malankara Orthodox Syrian Church.';

const PAGE_SIZE = 18;

type GalleryPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const rawPage = parseInt(params.page ?? '1', 10);
  const currentPage =
    Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  const { albumsWithMedia, totalAlbums, totalPages } = await fetchAlbumsForGallery(
    currentPage,
    PAGE_SIZE
  );
  const useApiAlbums = albumsWithMedia.length > 0;

  const staticTotal = MOSC_STATIC_GALLERY_ALBUMS.length;
  const staticTotalPages = Math.ceil(staticTotal / PAGE_SIZE) || 1;
  const staticSlice = MOSC_STATIC_GALLERY_ALBUMS.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const paginationTotal = useApiAlbums ? totalAlbums : staticTotal;
  const paginationTotalPages = useApiAlbums ? totalPages : staticTotalPages;

  return (
    <div className="bg-syro-bg-gray" data-testid="mosc-gallery-page" id="mainContent">
      <SyroPageBanner
        title="Photo Gallery"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Browse Albums
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {useApiAlbums
              ? albumsWithMedia.map(({ album, media, totalMediaCount }, index) => {
                  const coverImageUrl =
                    album.coverImageUrl || media.find((m) => m.fileUrl)?.fileUrl;
                  const href =
                    resolveMoscGalleryAlbumHref(album) ??
                    (album.id != null ? `/gallery?albumId=${album.id}` : undefined);

                  return (
                    <MoscGalleryAlbumCard
                      key={album.id ?? index}
                      title={album.title}
                      coverImageUrl={coverImageUrl}
                      totalMediaCount={totalMediaCount}
                      categoryDisplayName={album.galleryCategory?.displayName ?? null}
                      albumYear={album.albumYear ?? null}
                      href={href}
                      variant="mosc-redesign"
                      gradientIndex={index}
                    />
                  );
                })
              : staticSlice.map((album, index) => (
                  <MoscGalleryAlbumCard
                    key={album.id}
                    title={album.title}
                    coverImageUrl={album.imageUrl}
                    totalMediaCount={album.photoCount}
                    categoryDisplayName={album.category}
                    albumYear={album.albumYear}
                    href={`/mosc-redesign/gallery/${album.id}`}
                    variant="mosc-redesign"
                    gradientIndex={index}
                  />
                ))}
          </div>

          {paginationTotalPages > 1 && (
            <MoscGalleryPagination
              currentPage={currentPage}
              totalPages={paginationTotalPages}
              totalCount={paginationTotal}
              pageSize={PAGE_SIZE}
            />
          )}

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
