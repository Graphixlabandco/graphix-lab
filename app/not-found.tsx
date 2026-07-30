import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0D0B18] flex flex-col items-center justify-center text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-extrabold text-gradient-neon">404</h1>
        <h2 className="text-2xl font-bold mt-4 mb-2">Page Not Found</h2>
        <p className="text-zinc-400 mb-8">
          The cosmic path you are trying to navigate does not exist. It may have drifted into a black hole or been re-aligned.
        </p>
        <Link 
          href="/" 
          className="btn-liquid-glass px-6 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          Return to Universe
        </Link>
      </div>
    </div>
  );
}
