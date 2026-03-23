'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { MOSC_REDESIGN_FOOTER_QUICK_LINKS } from './navConfig';

export default function MoscRedesignFooter() {
  const { settings } = useTenantSettings();
  const [formData, setFormData] = useState({ full_name: '', email_address: '', phone_number: '', feedback: '' });
  const hasAnySocial =
    settings?.facebookUrl?.trim() ||
    settings?.instagramUrl?.trim() ||
    settings?.twitterUrl?.trim() ||
    settings?.linkedinUrl?.trim() ||
    settings?.youtubeUrl?.trim() ||
    settings?.tiktokUrl?.trim();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.full_name.trim();
    const email = formData.email_address.trim();
    const message = formData.feedback.trim();

    if (!name || name.length < 2) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address.');
      return;
    }
    if (!message || message.length < 10) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    const [firstName, ...restNameParts] = name.split(' ');
    const lastName = restNameParts.join(' ').trim() || 'N/A';
    const messageBody = formData.phone_number.trim()
      ? `${message}\n\nPhone: ${formData.phone_number.trim()}`
      : message;

    const payload = {
      firstName,
      lastName,
      messageBody,
      fromEmail: email,
      toEmail: process.env.NEXT_PUBLIC_MOSC_CONTACT_TO_EMAIL || 'info@mosc.in',
    };

    try {
      const response = await fetch('/api/proxy/contact-form-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setFormData({ full_name: '', email_address: '', phone_number: '', feedback: '' });
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to send message. Please try again.');
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      }
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage('An error occurred. Please try again later.');
      console.error('Footer contact form error:', err);
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-warmBrown-dark text-parchment-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact form */}
          <div>
            <h3 className="text-warmGold font-bold text-sm tracking-widest mb-4 border-b border-warmGold/40 pb-2">
              CONTACT US
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full px-3 py-2 bg-parchment/10 border border-parchment/30 rounded text-parchment-light placeholder:text-parchment-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-warmGold/50"
              />
              <input
                type="email"
                name="email_address"
                placeholder="Email Address"
                value={formData.email_address}
                onChange={(e) => setFormData((p) => ({ ...p, email_address: e.target.value }))}
                className="w-full px-3 py-2 bg-parchment/10 border border-parchment/30 rounded text-parchment-light placeholder:text-parchment-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-warmGold/50"
              />
              <input
                type="tel"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
                className="w-full px-3 py-2 bg-parchment/10 border border-parchment/30 rounded text-parchment-light placeholder:text-parchment-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-warmGold/50"
              />
              <textarea
                name="feedback"
                placeholder="Your Message"
                rows={4}
                value={formData.feedback}
                onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))}
                className="w-full px-3 py-2 bg-parchment/10 border border-parchment/30 rounded text-parchment-light placeholder:text-parchment-light/50 text-sm focus:outline-none focus:ring-2 focus:ring-warmGold/50 resize-none"
              />
              {submitMessage && (
                <p
                  className={`text-xs ${submitStatus === 'success' ? 'text-green-300' : 'text-red-300'}`}
                  role="status"
                >
                  {submitMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-warmGold text-burgundy-dark font-bold text-sm rounded hover:bg-warmGold-light transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-warmGold font-bold text-sm tracking-widest mb-4 border-b border-warmGold/40 pb-2">
              QUICK LINKS
            </h3>
            <ul className="space-y-2">
              {MOSC_REDESIGN_FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-parchment-light/90 hover:text-warmGold text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo + social — logo on light gradient panel so gold/cream artwork reads on dark footer */}
          <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
            <div className="mb-4 w-fit max-w-full">
              <div
                className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-parchment-light via-parchment to-parchment-mid border-2 border-warmGold/55 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.65)] ring-1 ring-white/25"
              >
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 mx-auto lg:mx-0 lg:ml-auto">
                  <Image
                    src="https://www.mosc-temp.com/images/logos/Current_Edits/New%20Edit/Mosc_Header_Logo9.png"
                    alt="Malankara Orthodox Syrian Church"
                    fill
                    className="object-contain drop-shadow-sm"
                    sizes="(max-width: 640px) 112px, 128px"
                  />
                </div>
              </div>
            </div>
            <p className="text-parchment-light/80 text-xs leading-relaxed max-w-xs">
              The Malankara Orthodox Syrian Church traces its origins to the apostolic mission of St. Thomas in India.
            </p>
            {hasAnySocial && (
              <div className="flex gap-3 mt-4">
                {settings?.facebookUrl?.trim() && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-parchment-light hover:text-warmGold transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {settings?.instagramUrl?.trim() && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-parchment-light hover:text-warmGold transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {settings?.twitterUrl?.trim() && (
                  <a
                    href={settings.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-parchment-light hover:text-warmGold transition-colors"
                    aria-label="Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {settings?.linkedinUrl?.trim() && (
                  <a
                    href={settings.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-parchment-light hover:text-warmGold transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {settings?.youtubeUrl?.trim() && (
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-parchment-light hover:text-warmGold transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 7.07 0 9.552 0 9.552s0 2.482.502 3.366a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 12.034 24 9.552 24 9.552s0-2.482-.502-3.366zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                )}
                {settings?.tiktokUrl?.trim() && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-parchment-light hover:text-warmGold transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.918-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.01-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48.01 2.96.02 4.44-.9-.24-1.92-.2-2.75.29-.82.48-1.39 1.3-1.59 2.22-.1.42-.14.86-.12 1.29.12 1.09.77 2.09 1.7 2.6.94.52 2.12.55 3.08.08 1.02-.5 1.68-1.56 1.78-2.67.07-.53.04-1.07.05-1.61-.01-4.09.02-8.18-.02-12.27z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 mt-10 pt-8 border-t border-parchment/20">
          <div className="flex flex-col items-center gap-4">
            <p className="text-parchment-light/70 text-xs text-center">
              © {new Date().getFullYear()} Malankara Orthodox Syrian Church. All rights reserved.
            </p>
            <p className="text-parchment-light/55 text-[11px] text-center">
              Powered by{' '}
              <a
                href="https://www.giventa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-parchment-light/75 hover:text-warmGold transition-colors underline-offset-2 hover:underline"
              >
                Giventa Inc., USA
              </a>
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <Link href="/mosc-redesign/privacy-policy" className="text-parchment-light/70 hover:text-warmGold transition-colors">
                Privacy Policy
              </Link>
              <Link href="/mosc-redesign/terms-of-use" className="text-parchment-light/70 hover:text-warmGold transition-colors">
                Terms of Use
              </Link>
              <Link href="/mosc-redesign/sitemap" className="text-parchment-light/70 hover:text-warmGold transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
