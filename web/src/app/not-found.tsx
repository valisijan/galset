import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stranica nije pronađena - Galset',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-1 text-text-main px-4 text-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Žao nam je, ova stranica nije dostupna.
      </h1>
      <p className="text-gray-400 mb-8 max-w-md text-base md:text-lg">
        Link koji ste uneli je možda neispravan ili je stranica uklonjena.
      </p>
      <Link
        href="/"
        className="text-sm text-text-main bg-bg-2 hover:bg-bg-3 hover:no-underline px-4 py-2 rounded-full transition-all duration-300 font-semibold"
      >
        Vratite se na Galset
      </Link>
    </div>
  );
}
