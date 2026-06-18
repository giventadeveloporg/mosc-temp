import React from 'react';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscGalleryAlbumCard } from '@/components/gallery/MoscGalleryAlbumCard';
import { fetchAlbumsForGallery } from '@/app/gallery/ApiServerActions';
import { MOSC_STATIC_GALLERY_ALBUMS } from '@/lib/gallery/moscStaticAlbums';
import { resolveMoscGalleryAlbumHref } from '@/lib/gallery/resolveMoscGalleryHref';

export const metadata: Metadata = {
  title: 'Photo Gallery | Malankara Orthodox Syrian Church',
  description: 'Photo gallery of significant events, ecumenical visits, and ceremonies of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Gallery', 'Photo Gallery', 'Church Events', 'Ecumenical Visits', 'Orthodox Church'],
};

const BANNER_DESCRIPTION =
  'Photo gallery of significant events, ecumenical visits, and ceremonies of the Malankara Orthodox Syrian Church.';

export default async function GalleryPage() {
  const { albumsWithMedia } = await fetchAlbumsForGallery(0, 50);
  const useApiAlbums = albumsWithMedia.length > 0;

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

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-syro-bg-gray via-white to-syro-bg-gray border border-syro-table-border/30 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] mb-12">
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{ backgroundImage: 'radial-gradient(circle at top left, rgba(139, 125, 107, 0.08), transparent 55%)' }}
            />

            <div className="relative px-6 py-10 sm:px-10 lg:px-14">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  : MOSC_STATIC_GALLERY_ALBUMS.map((album, index) => (
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
            </div>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}
