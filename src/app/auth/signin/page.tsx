'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { ShieldCheck } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Staff Authentication</h1>
          <p className="text-zinc-500 text-sm mt-2">Secure access for portfolio administrators</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <button
            onClick={() => signIn('google', { callbackUrl: '/admin' })}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black font-bold py-3.5 px-4 rounded-xl transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          
          <p className="text-[10px] text-zinc-600 text-center mt-6 uppercase tracking-widest font-bold">
            Access strictly monitored
          </p>
        </div>
      </div>
    </div>
  );
}
