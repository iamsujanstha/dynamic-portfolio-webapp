'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { ShieldCheck, Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('SignIn: Initiating credentials sign in...');
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl: '/admin'
      });

      console.log('SignIn: Result received:', res);

      if (res?.error) {
        setError('Access Denied. Check your credentials.');
        setLoading(false);
      } else {
        console.log('SignIn: Success, redirecting to /admin...');
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error('SignIn: Catch block error:', err);
      setError('A system error occurred.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/admin' });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-blue-400/20"
          >
            <ShieldCheck size={40} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-white tracking-tighter mb-2"
          >
            Admin Gateway
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-500 text-sm font-medium"
          >
            Authenticate to manage website content
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900/40 backdrop-blur-2xl border border-zinc-800/50 p-8 rounded-[32px] shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Form Overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <form onSubmit={handleLogin} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center mb-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-zinc-800 text-white rounded-2xl p-3.5 pl-12 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-700"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-black/40 border border-zinc-800 text-white rounded-2xl p-3.5 pl-12 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-white hover:bg-zinc-100 text-black font-black py-4 px-4 rounded-2xl transition-all mt-2 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Validating...' : 'Enter System'}
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] bg-zinc-800/50 flex-1"></div>
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">External Audit</span>
            <div className="h-[1px] bg-zinc-800/50 flex-1"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 text-white font-bold py-4 px-4 rounded-2xl transition-all active:scale-[0.98]"
          >
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center p-1">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            Sign in as Guest
          </button>

          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/5 rounded-full border border-blue-500/10">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">System Operational</span>
            </div>
            <p className="text-[9px] text-zinc-700 text-center uppercase tracking-widest font-black mt-2">
              End-to-End Encryption Enabled
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex justify-center gap-6"
        >
          <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors">
            <Github size={20} />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}

