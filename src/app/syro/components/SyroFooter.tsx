'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const QUICK_LINKS = [
  { name: 'Spiritual Organisations', href: '/syro/spiritual-organizations' },
  { name: 'Publications', href: '/syro/publications' },
  { name: 'Institutions', href: '/syro/institutions' },
  { name: 'Directory', href: '/syro/directory' },
  { name: 'Training', href: '/syro/training' },
  { name: 'Theological Seminaries', href: '/syro/theological-seminaries' },
  { name: 'Lectionary', href: '/syro/lectionary' },
  { name: 'Downloads', href: '/syro/downloads' },
  { name: 'Calendar', href: '/syro/calendar' },
  { name: 'Gallery', href: '/syro/gallery' },
];

export default function SyroFooter() {
  const [formData, setFormData] = useState({ full_name: '', email_address: '', phone_number: '', feedback: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Static form posts to external URL; for Next we could use API route or leave as-is
  };

  return (
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-lg-4 footer-section-1">
            <span className="contact-title">CONTACT US</span>
            <form
              action="https://www.syromalabarchurch.in/save_contact_us"
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
                  />
                  <label htmlFor="contact-message">Message</label>
                </div>
                <button type="submit" className="primary-button submit-btn">
                  <span>Submit</span>
                  <i className="fa-solid fa-arrow-right-long ms-3" />
                </button>
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
                <Link href="/syro">© 2026 The Malankara Orthodox Church. All rights reserved.</Link>
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
                © 2026 The Malankara Orthodox Church. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
