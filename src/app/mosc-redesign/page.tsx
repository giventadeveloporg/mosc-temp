"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Anek_Malayalam } from "next/font/google";
import InteractiveWorldMap from "@/components/ui/InteractiveWorldMap";
import MoscRedesignHeader from "@/components/mosc-redesign/MoscRedesignHeader";
import MoscRedesignFooter from "@/components/mosc-redesign/MoscRedesignFooter";
import type { LiturgyReading } from "@/app/mosc/components/SyroLiturgySection";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Saint {
  name: string;
  href: string;
  image: string;
  alt: string;
  imageClassName?: string;
}

interface Region {
  id: string;
  label: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const saints: Saint[] = [
{
  name: "St. Mary Mother of God",
  href: "/mosc-redesign/saints/st-mary-mother-of-god",
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/St_Mother_Mary.jpg",
  alt: "Icon of St. Mary, Mother of God, in traditional Orthodox style"
},
{
  name: "St. Basilios Yeldho",
  href: "/mosc-redesign/saints/st-baselios-yeldho-kothamangalam-bava",
  image: "/images/saints/st-baselios-yeldho-kothamangalam-bava.jpg",
  alt: "Portrait of St. Basilios Yeldho Kothamangalam Bava in episcopal vestments",
  imageClassName: "scale-y-90 origin-top"
},
{
  name: "St. Geevarghese",
  href: "/mosc-redesign/saints/st-geevarghese-mar-dionysius-vattasseril",
  image: "/images/saints/st-geevarghese-mar-dionysius-vattasseril.jpg",
  alt: "Portrait of St. Geevarghese Mar Dionysius Vattasseril in traditional attire"
},
{
  name: "St. Gregorios Of Parumala",
  href: "/mosc-redesign/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios",
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/St_Gregorios_Parumala.jpg",
  alt: "Portrait of St. Gregorios of Parumala Metropolitan in episcopal robes"
}];


const regions: Region[] = [
{ id: "south-west-america", label: "South West America" },
{ id: "north-east-america", label: "North East America" },
{ id: "uk", label: "UK" },
{ id: "africa", label: "Africa" },
{ id: "india", label: "India" }];


const anekMalayalam = Anek_Malayalam({
  subsets: ["latin", "malayalam"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

function formatLiturgyDisplayDate(liturgyDate: string | null): string {
  const d = liturgyDate ? new Date(`${liturgyDate}T12:00:00`) : new Date();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const slides = [
{
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/bava_thirumeni_pope_visit.jpeg",
  alt: "His Holiness Baselios Marthoma Mathews III meeting with Pope Francis at the Vatican"
},
{
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/Malankara_Orthodox_Palace_Slider_New.jpeg",
  alt: "Malankara Orthodox Palace, the headquarters of the Malankara Orthodox Syrian Church in Devalokam, Kottayam"
}];


// ─── Component ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeRegion, setActiveRegion] = useState("india");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [saintIndex, setSaintIndex] = useState(0);
  const [readingLang, setReadingLang] = useState<"english" | "malayalam">("english");
  const [liturgyReadings, setLiturgyReadings] = useState<LiturgyReading[] | null>(null);
  const [liturgyDate, setLiturgyDate] = useState<string | null>(null);
  const [liturgyLoading, setLiturgyLoading] = useState(true);
  const [liturgyError, setLiturgyError] = useState<string | null>(null);
  const sliderRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Ignore out-of-order responses when switching English ↔ Malayalam quickly */
  const liturgyRequestIdRef = useRef(0);

  const fetchLiturgyReadings = useCallback((lng: "en" | "ml") => {
    const requestId = ++liturgyRequestIdRef.current;
    setLiturgyLoading(true);
    setLiturgyError(null);
    setLiturgyReadings(null);
    fetch(`/api/liturgy?lng=${lng}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body: { error?: string }) => {
            throw new Error(body?.error ?? "Failed to load readings");
          });
        }
        return res.json();
      })
      .then((data: { message?: LiturgyReading[]; liturgyDate?: string }) => {
        if (requestId !== liturgyRequestIdRef.current) return;
        const list = Array.isArray(data?.message) ? data.message : [];
        setLiturgyReadings(list);
        setLiturgyDate(data?.liturgyDate ?? null);
      })
      .catch((err) => {
        if (requestId !== liturgyRequestIdRef.current) return;
        setLiturgyError(err instanceof Error ? err.message : "Failed to load liturgy readings");
        setLiturgyReadings(null);
        setLiturgyDate(null);
      })
      .finally(() => {
        if (requestId !== liturgyRequestIdRef.current) return;
        setLiturgyLoading(false);
      });
  }, []);

  useEffect(() => {
    const lng = readingLang === "english" ? "en" : "ml";
    fetchLiturgyReadings(lng);
  }, [readingLang, fetchLiturgyReadings]);

  useEffect(() => {
    sliderRef.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % slides.length);
    }, 5000);
    return () => {if (sliderRef.current) clearInterval(sliderRef.current);};
  }, []);

  const visibleSaints = saints.slice(saintIndex, saintIndex + 3);

  return (
    <div className="min-h-screen bg-parchment font-dm-sans flex flex-col">
      {/*
        Sticky header must NOT sit inside overflow-x-hidden (breaks position:sticky in browsers).
        /mosc uses syro-layout + overflow only on main; we mirror that with a content wrapper.
      */}
      <MoscRedesignHeader />

      <div className="flex-1 min-w-0 w-full overflow-x-hidden">
      {/* ── HERO: mobile = contain + letterbox; md+ = cover, full-bleed panoramic ─ */}
      <section className="relative w-full min-h-[220px] h-[min(38vh,280px)] sm:min-h-[260px] md:h-auto md:min-h-[340px] md:aspect-[5/2] md:max-h-[min(52vh,540px)] overflow-hidden bg-[#1a1410] md:bg-stone-900">
        {slides.map((slide, i) =>
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              className="object-contain object-center md:object-cover md:object-center"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        </div>
        )}

        <div
          className="absolute inset-0 z-[5] bg-gradient-to-r from-black/80 via-black/45 to-transparent pointer-events-none md:from-black/45 md:via-black/20 md:to-transparent"
          aria-hidden
        />

        {/* Slide content overlay */}
        <div className="relative z-10 flex min-h-[inherit] h-full items-center py-5 md:py-7">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full">
            <div className="max-w-xl rounded-xl bg-black/55 px-4 py-3 md:px-5 md:py-4 ring-1 ring-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-[2px]">
              <div className="w-12 h-0.5 bg-warmGold mb-3" />
              <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-bold leading-snug [text-shadow:0_2px_14px_rgba(0,0,0,0.95)]">
                Rooted in the Apostolic ministry of St. Thomas in India
              </h1>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) =>
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 h-2.5 bg-warmGold" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`}
            aria-label={`Go to slide ${i + 1}`} />
          )}
        </div>
      </section>

      {/* ── ICON QUICK ACCESS BAR ──────────────────────────────────────── */}
      <section className="bg-parchment-deep border-y-2 border-burgundy/20">
        <div className="max-w-7xl mx-auto px-4 lg:px-16">
          <div className="grid grid-cols-5 divide-x divide-burgundy/20">
            {[
            {
              label: "Catholicate News",
              href: "/mosc-redesign/news",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M4 4h16v2H4zM4 9h10M4 13h10M4 17h6M16 13l2 2 4-4" />
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                </svg>

            },
            {
              label: "Downloads",
              href: "/mosc-redesign/downloads",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M12 3v13M7 11l5 5 5-5" />
                  <path d="M4 18h16" />
                </svg>

            },
            {
              label: "E-Mail",
              href: "/mosc-redesign/contact-form-email",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>

            },
            {
              label: "Gallery",
              href: "/mosc-redesign/gallery",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M2 15l6-6 4 4 3-3 7 7" />
                </svg>

            },
            {
              label: "Contact Info",
              href: "/mosc-redesign/contact-info",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                </svg>

            }].
            map((item) =>
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 py-4 px-2 transition-all duration-300 group hover:bg-burgundy hover:-translate-y-0.5 hover:shadow-md hover:shadow-burgundy/30">
              <span className="text-burgundy group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform">{item.icon}</span>
              <span className="text-warmBrown group-hover:text-white text-xs font-medium text-center leading-tight transition-colors duration-300">
                {item.label}
              </span>
            </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── ABOUT US (always visible — IntersectionObserver + opacity-0 caused empty gaps) ─ */}
      <section className="py-16 md:py-24 bg-parchment border-b border-burgundy/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Images collage */}
            <div className="relative h-[500px] md:h-[650px] lg:w-[125%] lg:-ml-[25%]">
              {/* Main image: full-width/full-height card, contained so it never gets cropped */}
              <div className="absolute inset-0 overflow-hidden transition-transform duration-500 hover:scale-[1.01]">
                <Image
                  src="/images/logos/MOSC-image-collage-1.png"
                  alt="Malankara Orthodox Church fathers and bishops gathered in a formal assembly"
                  fill
                  className="object-contain object-left" />
              </div>

            </div>

            {/* Text */}
            <div>
              <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/40 px-3 py-1 rounded-full bg-burgundy/10">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mb-6 leading-tight">
                The Malankara Orthodox<br />
                <span className="text-burgundy">Syrian Church</span>
              </h2>
              <p className="text-warmGray-dark leading-relaxed mb-8 text-base">
                The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India. We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations while serving our members with love, compassion, and spiritual guidance.
              </p>
              <Link
                href="/mosc-redesign/the-church/the-malankara-orthodox-syrian-church"
                className="inline-flex items-center gap-2 bg-burgundy text-white font-semibold px-6 py-3 rounded-lg hover:bg-burgundy-light transition-all duration-300 text-sm hover:shadow-lg hover:shadow-burgundy/40 hover:-translate-y-0.5 transform">
                Know More
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Saints Carousel */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-burgundy text-xs font-bold tracking-widest uppercase">Heritage</span>
                <h3 className="text-2xl font-bold text-warmBrown-dark mt-1">Our Saints & Blesseds</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaintIndex(Math.max(0, saintIndex - 1))}
                  disabled={saintIndex === 0}
                  className="w-9 h-9 rounded-full border border-burgundy/40 flex items-center justify-center text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy disabled:opacity-30 transition-all duration-200"
                  aria-label="Previous saint">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSaintIndex(Math.min(saints.length - 3, saintIndex + 1))}
                  disabled={saintIndex >= saints.length - 3}
                  className="w-9 h-9 rounded-full border border-burgundy/40 flex items-center justify-center text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy disabled:opacity-30 transition-all duration-200"
                  aria-label="Next saint">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {visibleSaints.map((saint) =>
              <Link
                key={saint.name}
                href={saint.href}
                className="group relative mx-auto w-3/4 rounded-xl overflow-hidden aspect-[6/5] block border border-burgundy/20 bg-parchment-deep hover:border-burgundy/60 transition-all duration-300 hover:shadow-xl hover:shadow-burgundy/30 hover:-translate-y-1 transform">
                <Image
                  src={saint.image}
                  alt={saint.alt}
                  fill
                  quality={95}
                  sizes="(max-width: 640px) 75vw, (max-width: 768px) 37.5vw, 25vw"
                  className={`object-contain object-top transition-transform duration-500 ${saint.imageClassName ?? "group-hover:scale-105"}`}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-warmBrown-dark/90 via-warmBrown-dark/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm leading-tight">{saint.name}</p>
                  <span className="text-warmGold text-xs mt-1 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn more <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATHOLICOS PROFILE ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-parchment-deep relative overflow-hidden border-b border-burgundy/15">
        {/* Decorative bg: radial gradients avoid blur-filter banding blocks on some desktop displays. */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(42rem 26rem at 92% 0%, rgba(192,40,74,0.16), rgba(192,40,74,0) 72%), radial-gradient(28rem 18rem at 8% 100%, rgba(200,134,10,0.14), rgba(200,134,10,0) 74%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            {/* Images — single portrait */}
            <div className="lg:col-span-2 flex justify-center lg:justify-start">
              <div className="w-full max-w-[320px] rounded-2xl overflow-hidden aspect-[3/4] relative shadow-xl border border-burgundy/30 hover:border-burgundy/60 transition-all duration-300 hover:shadow-burgundy/30">
                <Image
                  src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/Baselios_Marthoma_Mathews_III.jpeg"
                  alt="His Holiness Baselios Marthoma Mathews III, Catholicos of the East and Malankara Metropolitan, in full episcopal vestments"
                  fill
                  className="object-cover" />
              </div>
            </div>

            {/* Text */}
            <div className="lg:col-span-3">
              <span className="inline-block text-warmGold-dark text-xs font-bold tracking-widest uppercase mb-3 border border-warmGold/50 px-3 py-1 rounded-full bg-warmGold/10">
                Malankara Metropolitan
              </span>
              <p className="text-burgundy text-sm font-medium mb-2">Catholicos of the East and Malankara Metropolitan</p>
              <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mb-6 leading-tight">
                His Holiness Baselios<br />
                <span className="text-burgundy">Marthoma Mathews III</span>
              </h2>
              <p className="text-warmGray-dark leading-relaxed mb-8 text-base">
                His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.
              </p>
              <Link
                href="/mosc-redesign/holy-synod/his-holiness-baselios-marthoma-mathews-iii"
                className="inline-flex items-center gap-2 border-2 border-burgundy text-burgundy font-semibold px-6 py-3 rounded-lg hover:bg-burgundy hover:text-white transition-all duration-300 text-sm hover:shadow-lg hover:shadow-burgundy/40 hover:-translate-y-0.5 transform">
                View Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LITURGICAL CALENDAR ────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-parchment border-b border-burgundy/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Calendar image */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden transition-all duration-300 group">
              <Image
                src="/images/logos/Liturgical-Calendar-Image.jpg"
                alt="Malankara Orthodox Syrian Church liturgical calendar showing feast days and holy seasons"
                fill
                className="object-contain object-center group-hover:scale-105 transition-transform duration-500" />
            </div>

            {/* Calendar content */}
            <div className="bg-parchment-light rounded-2xl p-8 border border-burgundy/20 shadow-sm">
              <span className="inline-block text-burgundy text-lg font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
                Liturgical Calendar
              </span>
              <p className="text-warmGold-dark font-semibold mb-6">{formatLiturgyDisplayDate(liturgyDate)}</p>

              {/* Language toggle — same API as /mosc SyroLiturgySection: /api/liturgy?lng=en|ml */}
              <div className="flex gap-2 mb-6">
                {(["english", "malayalam"] as const).map((lang) =>
                <button
                  key={lang}
                  type="button"
                  onClick={() => setReadingLang(lang)}
                  aria-pressed={readingLang === lang}
                  aria-label={lang === "english" ? "Show readings in English" : "Show readings in Malayalam"}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  readingLang === lang ?
                  "bg-burgundy text-white shadow-md shadow-burgundy/30" : "border border-burgundy/30 text-warmBrown hover:border-burgundy hover:text-burgundy hover:bg-burgundy/5"}`
                  }>
                  {lang}
                </button>
                )}
              </div>

              <div
                className={`bg-parchment-deep rounded-xl p-5 border border-burgundy/20 ${
                  readingLang === "malayalam" ? anekMalayalam.className : "font-dm-sans"
                }`}
                lang={readingLang === "malayalam" ? "ml" : "en"}
              >
                {liturgyLoading && (
                  <div className="flex items-center py-4" aria-live="polite">
                    <div
                      className="h-5 w-5 border-2 border-burgundy/25 border-t-burgundy rounded-full animate-spin mr-3 shrink-0"
                      role="status"
                      aria-hidden
                    />
                    <span className="text-warmGray-dark text-sm">Loading readings…</span>
                  </div>
                )}

                {liturgyError && !liturgyLoading && (
                  <div className="text-warmGray-dark text-sm py-2 space-y-2">
                    {liturgyError.includes("Access Denied") || liturgyError.includes("LITURGY_API_TOKEN") ? (
                      <>
                        <p className="font-medium">Daily readings are temporarily unavailable.</p>
                        <p>
                          Visit the{" "}
                          <a
                            href="https://www.syromalabarliturgy.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-burgundy underline hover:text-burgundy-dark"
                          >
                            Syro-Malabar Commission for Liturgy
                          </a>{" "}
                          for readings.
                        </p>
                      </>
                    ) : (
                      <p>{liturgyError}</p>
                    )}
                  </div>
                )}

                {!liturgyLoading && !liturgyError && liturgyReadings && liturgyReadings.length === 0 && (
                  <p className="text-warmGray-dark text-sm py-4">No readings available for this day.</p>
                )}

                {!liturgyLoading && !liturgyError && liturgyReadings && liturgyReadings.length > 0 && (
                  <div className="space-y-3">
                    {liturgyReadings[0]?.liturgy_day_heading && (
                      <p className="text-burgundy text-sm font-medium">{liturgyReadings[0].liturgy_day_heading}</p>
                    )}
                    {liturgyReadings[0]?.season_name && (
                      <h3 className="text-lg font-bold text-warmBrown-dark">{liturgyReadings[0].season_name}</h3>
                    )}
                    <ul className="space-y-3 list-none pl-0">
                      {liturgyReadings.map((r, i) => (
                        <li key={i} className="flex gap-3 text-sm text-warmGray-dark leading-relaxed">
                          <span className="text-burgundy shrink-0 mt-0.5" aria-hidden>
                            ✝
                          </span>
                          <span>
                            {r.liturgy_heading}
                            {r.content_place && <span> ( {r.content_place} )</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR PRESENCE ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-parchment-deep border-b border-burgundy/15">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-10">
            <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
              Our Presence
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mt-2">
              Malankara Orthodox Syrian Church<br />
              <span className="text-burgundy">Worldwide Locations</span>
            </h2>
            <p className="text-warmGray-dark mt-3 text-sm">Places Where We Are Situated — Our Church is Situated Around The World</p>
          </div>

          {/* Region selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {regions.map((region) =>
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeRegion === region.id ?
              "bg-burgundy text-white shadow-lg shadow-burgundy/40 scale-105" :
              "border border-burgundy/30 text-warmBrown hover:border-burgundy hover:text-white hover:bg-burgundy hover:shadow-md hover:shadow-burgundy/30 hover:scale-105"}`
              }>
              {region.label}
            </button>
            )}
          </div>

          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 shadow-xl shadow-burgundy/15 border-2 border-burgundy/25 hover:border-burgundy/45 hover:shadow-burgundy/25 transition-all duration-300 group">
            <InteractiveWorldMap activeRegion={activeRegion} hoveredRegion={hoveredRegion} />
            <div className="absolute inset-0 bg-parchment/5" />
          </div>
        </div>
      </section>

      <MoscRedesignFooter />
      </div>
    </div>);

}