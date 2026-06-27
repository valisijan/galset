import Link from 'next/link';

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
        className="text-[#6366f1] font-bold text-lg hover:underline transition-colors"
      >
        Vratite se na Galset
      </Link>
    </div>
  );
}
