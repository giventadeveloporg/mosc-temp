import Image from "next/image";
import Link from "next/link";
import type { EventSponsorsDTO } from "@/types";

interface SponsorCardProps {
  sponsor: EventSponsorsDTO;
  backgroundClass: string;
  onCardClick?: () => void;
  className?: string;
  shadowStyle?: string;
}

const defaultShadow =
  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)";

export function SponsorCard({
  sponsor,
  backgroundClass,
  onCardClick,
  className = "",
  shadowStyle = defaultShadow,
}: SponsorCardProps) {
  const combinedClasses = [
    backgroundClass,
    "rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group",
    onCardClick ? "cursor-pointer" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div
        className={combinedClasses}
        style={{
          boxShadow: shadowStyle,
        }}
        onClick={onCardClick}
        role={onCardClick ? "button" : undefined}
        tabIndex={onCardClick ? 0 : undefined}
        onKeyDown={
          onCardClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCardClick();
                }
              }
            : undefined
        }
      >
        <div className="flex flex-col h-full">
          <div className="relative w-full h-auto rounded-t-2xl overflow-hidden">
            {sponsor.bannerImageUrl ? (
              <Image
                src={sponsor.bannerImageUrl}
                alt={sponsor.name}
                width={800}
                height={600}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{
                  backgroundColor: "transparent",
                  borderRadius: "1rem 1rem 0 0",
                }}
              />
            ) : (
              <div
                className="w-full h-80 flex items-center justify-center"
                style={{
                  backgroundColor: "transparent",
                  borderRadius: "1rem 1rem 0 0",
                }}
              >
                <span className="text-gray-400 text-4xl">🏢</span>
              </div>
            )}
            {sponsor.type && (
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {sponsor.type}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col border-t border-white/20">
            <div className="p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {sponsor.name}
              </h2>

              {sponsor.companyName && (
                <p className="text-gray-600 text-base mb-2">
                  {sponsor.companyName}
                </p>
              )}
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-white/20 flex-1 flex flex-col">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 lg:justify-items-center">
                {sponsor.companyName && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.companyName}
                    </span>
                  </div>
                )}

                {sponsor.type && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">{sponsor.type}</span>
                  </div>
                )}

                {sponsor.contactEmail && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.contactEmail}
                    </span>
                  </div>
                )}

                {sponsor.contactPhone && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.contactPhone}
                    </span>
                  </div>
                )}

                {sponsor.websiteUrl && (
                  <div className="flex items-center gap-3 text-gray-700 justify-center lg:justify-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-8 h-8 text-teal-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9-9m0 18a9 9 0 009-9M12 3a9 9 0 00-9 9"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">
                      {sponsor.websiteUrl.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
              </div>

              {(sponsor.tagline || sponsor.id) && (
                <div className="mt-auto space-y-4 pt-4">
                  {sponsor.tagline && (
                    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-[0_12px_30px_-15px_rgba(146,118,65,0.4)] px-4 py-3 text-center">
                      <p className="relative z-10 text-sm font-medium text-amber-800 italic leading-relaxed line-clamp-2">
                        {sponsor.tagline}
                      </p>
                    </div>
                  )}

                  {typeof sponsor.id !== "undefined" && (
                    <div className="flex justify-end">
                      <Link
                        href={`/sponsors/${sponsor.id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-white text-gray-800 font-semibold text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-white"
                        aria-label={`View sponsor details for ${sponsor.name}`}
                      >
                        <span>View Sponsor Details</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M7 17l9-9m0 0H8m8 0v8"
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}


