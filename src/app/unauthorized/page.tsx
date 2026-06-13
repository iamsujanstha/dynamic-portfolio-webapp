import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <ShieldAlert size={40} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-black mb-4 tracking-tight">Access Denied</h1>
        <p className="text-zinc-400 mb-10 leading-relaxed">
          Your account does not have the required permissions to access the Admin Console.
          Please contact the system administrator if you believe this is an error.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
        >
          Return to Neutral Zone
        </Link>
      </div>
    </div>
  );
}
