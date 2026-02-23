'use client';

import React from 'react';

/**
 * Help content for media management pages: hero section and event media image specifications.
 * Rendered inside EventFormHelpTooltip via customContent.
 */
export default function MediaImageSpecHelpContent() {
  return (
    <div className="space-y-6 text-sm text-gray-800">
      <h4 className="text-base font-bold text-gray-900 border-b border-gray-200 pb-2">
        Image specifications for hero and event media
      </h4>

      {/* Section 1 - Left panel */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Section 1 — Left panel (Kerala / branding)</h5>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Recommended:</strong> 1000 × 1200 px (aspect ratio 5:6 portrait)</li>
          <li><strong>Minimum:</strong> 600 × 720 px (keep 5:6)</li>
          <li>Keep text sharp (MALAYALEES.US, Malayalam script, circular logo)</li>
          <li>Preserve split between dark left panel and tropical right; crop to fit 5:6 if needed</li>
        </ul>
      </section>

      {/* Section 2 - Slideshow */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Section 2 — Right panel (slideshow / event images)</h5>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Aspect ratio:</strong> 5:2 wide landscape (2.5:1)</li>
          <li><strong>Recommended:</strong> 2000 × 800 px (also 2500×1000 or 1500×600)</li>
          <li><strong>Minimum:</strong> 1200 × 480 px</li>
          <li><strong>Fit:</strong> object-cover — center 60% is the safe zone; edges may be cropped by viewport</li>
        </ul>
      </section>

      {/* Section 3 - Mission card */}
      <section>
        <h5 className="font-semibold text-blue-700 mb-2">Section 3 — Mission card (Unite India banner)</h5>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Recommended:</strong> 1000 × 200 px (aspect ratio 5:1 wide)</li>
          <li><strong>Minimum:</strong> 680 × 140 px (keep 5:1)</li>
          <li>Wide horizontal banner; keep main message and branding centered</li>
        </ul>
      </section>
    </div>
  );
}
