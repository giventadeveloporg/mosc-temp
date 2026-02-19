'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const QUICK_LINKS = [
  { name: 'CATHOLICATE', href: '/syro/catholicate' },
  { name: 'NEWS', href: '/syro/news' },
  { name: 'DOWNLOADS', href: '/syro/downloads' },
  { name: 'E-MAIL', href: '/syro/email' },
  { name: 'GALLERY', href: '/syro/gallery' },
  { name: 'CONTACT INFO', href: '/syro/contact-info' },
];

const currentYear = () => new Date().getFullYear();

export default function SyroFooter() {
  const [formData, setFormData] = useState({ full_name: '', email_address: '', phone_number: '', feedback: '' });
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
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-lg-4 footer-section-1">
            <span className="contact-title">CONTACT US</span>
            <form
              action="#"
              className=""
              id="contact-form"
              autoComplete="off"
              method="post"
              acceptCharset="utf-8"
              onSubmit={handleSubmit}
            >
              <div className="contact-us">
                <div className="form-floating mb-2 subscribe-email-container">
                  <input
                    type="text"
                    className="form-control subscribe-email"
                    name="full_name"
                    id="contact-name"
                    placeholder="Enter Your Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="contact-name">Name</label>
                </div>
                <div className="form-floating mb-2 subscribe-email-container">
                  <input
                    type="email"
                    className="form-control subscribe-email"
                    name="email_address"
                    id="contact-email"
                    placeholder="name@example.com"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                    value={formData.email_address}
                    onChange={(e) => setFormData((p) => ({ ...p, email_address: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="contact-email">Email</label>
                </div>
                <div className="form-floating mb-2 subscribe-email-container">
                  <input
                    type="tel"
                    className="form-control subscribe-email"
                    name="phone_number"
                    id="contact-phone"
                    placeholder="Phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="contact-phone">Phone</label>
                </div>
                <div className="form-floating mb-4 subscribe-email-container">
                  <textarea
                    className="form-control subscribe-email"
                    cols={3}
                    name="feedback"
                    placeholder="Message"
                    id="contact-message"
                    value={formData.feedback}
                    onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="contact-message">Message</label>
                </div>
                <button type="submit" className="primary-button submit-btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Sending...' : 'Submit'}</span>
                  <i className="fa-solid fa-arrow-right-long ms-3" />
                </button>
                {submitStatus !== 'idle' && (
                  <p className="mt-2 mb-0 text-white-50 small">
                    {submitMessage}
                  </p>
                )}
              </div>
            </form>
          </div>
          <div className="col-lg-5 footer-section-2 ps-5">
            <div className="row">
              <div className="col-lg-4">
                <div className="footer-widget">
                  <h4 className="mb-4">Quick Links</h4>
                  <div id="footer-quicklinks">
                    {QUICK_LINKS.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <p className="mb-3">{link.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="footer-widget">
                  <h4 className="mb-4">Upcoming Events</h4>
                  <div id="latest_events">
                    <p className="mb-3 text-white-50">Visit our events page for upcoming events.</p>
                  </div>
                </div>
                <div className="social-media">
                  <h6 className="mb-2">Social With Us</h6>
                  <ul id="socialmedias" className="list-unstyled d-flex gap-2">
                    {/* Add social links if available */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 footer-section-2 pe-5">
            <div className="footer-widget">
              <h4 className="mb-4">Contact Information</h4>
              <p className="mb-1">Headquarters:</p>
              <p className="mb-1">
                Catholicate Palace
                <br />
                Devalokam, Kottayam
                <br />
                Kerala, India
              </p>
              <p className="mb-1">Phone: +91-481-2300-700</p>
              <p className="mb-0">Email: info@mosc.in</p>
            </div>
          </div>
        </div>
        <div className="row footer-bottom-row">
          <div className="col-lg-4 footer-section-11 d-none d-lg-block">
            <ul className="list-unstyled">
              <li className="float-end">
                <Link href="/syro">Terms &amp; Conditions</Link>
              </li>
              <li className="float-end">
                <Link href="/syro">Disclaimers</Link>
              </li>
              <li className="float-end copy-right">
                <Link href="/syro">© {currentYear()} The Malankara Orthodox Church. All rights reserved.</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-8 footer-section-2 made-by pe-5">
            <ul className="d-none d-lg-block list-unstyled">
              <li className="float-end">
                <p className="text-white mb-0">Giventa Inc. USA</p>
              </li>
            </ul>
            <div className="footer-bottom">
              <p className="d-block d-lg-none w-100">
                <Link href="/syro#!" className="text-start">Terms &amp; Conditions</Link>{' '}
                <Link href="/syro#!" className="float-end">Disclaimers</Link>
              </p>
              <p className="text-white text-center mb-2 d-block d-lg-none">Giventa Inc. USA</p>
              <p className="text-white text-center mb-2 d-block d-lg-none">
                © {currentYear()} The Malankara Orthodox Church. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
