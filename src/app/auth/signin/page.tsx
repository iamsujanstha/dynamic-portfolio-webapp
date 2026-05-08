'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
      callbackUrl: '/admin'
    });

    if (res?.error) {
      setError('Invalid username or password');
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Authentication</h1>
          <p className="text-zinc-500 text-sm mt-2">Secure access for CMS administrators</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-500 text-sm text-center font-bold bg-red-950/30 p-2 rounded-lg">{error}</div>}
            
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black border border-zinc-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black font-bold py-3.5 px-4 rounded-xl transition-all mt-4"
            >
              Secure Login
            </button>
          </form>
          
          <p className="text-[10px] text-zinc-600 text-center mt-6 uppercase tracking-widest font-bold">
            Access strictly monitored
          </p>
        </div>
      </div>
    </div>
  );
}
