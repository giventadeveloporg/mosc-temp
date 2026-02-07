import React from 'react';
import Link from 'next/link';

export default function NewsNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
        Article not found
      </h1>
      <p className="font-syro-primary text-syro-dark-gray mb-6">
        The news article you are looking for does not exist or is no longer available.
      </p>
      <Link
        href="/syro/news"
        className="inline-flex items-center justify-center px-5 py-2.5 bg-syro-red text-syro-red-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Back to News
      </Link>
    </div>
  );
}
