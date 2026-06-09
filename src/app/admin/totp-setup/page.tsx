'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle, AlertTriangle, ArrowRight, Copy } from 'lucide-react';
import Image from 'next/image';

export default function TOTPSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);
  const [manualEntryKey, setManualEntryKey] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchSetupData();
    }
  }, [status, router]);

  const fetchSetupData = async () => {
    try {
      const response = await fetch('/api/auth/totp/setup', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate setup details');
        setLoading(false);
        return;
      }

      setQrCodeDataUri(data.qrCodeDataUri);
      setManualEntryKey(data.manualEntryKey);
      setLoading(false);
    } catch (err) {
      console.error('TOTP Setup:', err);
      setError('A system error occurred while preparing setup.');
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }

    setError('');
    setVerifying(true);

    try {
      const response = await fetch('/api/auth/totp/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid code. Please try again.');
        setVerifying(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (err) {
      console.error('TOTP Verify:', err);
      setError('A system error occurred during verification.');
      setVerifying(false);
    }
  };

  const copyToClipboard = () => {
    if (manualEntryKey) {
      navigator.clipboard.writeText(manualEntryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
        className="w-full max-w-[480px] z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(37,99,235,0.3)] border border-blue-400/20"
          >
            <Smartphone size={40} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            Setup Authenticator
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Secure your admin account with Time-based One-Time Passwords (TOTP).
          </p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-[32px] shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Setup Complete!</h3>
                <p className="text-zinc-400">Redirecting you to the dashboard...</p>
              </motion.div>
            ) : (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                
                {/* Step 1: Scan QR Code */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">1</div>
                    <h3 className="text-white font-semibold">Scan QR Code</h3>
                  </div>
                  <p className="text-sm text-zinc-400 pl-9">
                    Open Google Authenticator, Authy, or 1Password and scan this QR code.
                  </p>
                  
                  {qrCodeDataUri && (
                    <div className="bg-white p-4 rounded-2xl mx-9 inline-block">
                      <Image src={qrCodeDataUri} alt="TOTP QR Code" width={200} height={200} className="rounded-lg" />
                    </div>
                  )}

                  <div className="pl-9 pt-2">
                    <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">Can't scan the code?</p>
                    <div className="flex items-center gap-2 bg-black/50 border border-zinc-800 p-3 rounded-xl">
                      <code className="text-blue-400 font-mono text-sm tracking-wider flex-1">{manualEntryKey}</code>
                      <button 
                        onClick={copyToClipboard}
                        className="text-zinc-400 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-zinc-800 w-full" />

                {/* Step 2: Verify Code */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30">2</div>
                    <h3 className="text-white font-semibold">Verify Code</h3>
                  </div>
                  <p className="text-sm text-zinc-400 pl-9">
                    Enter the 6-digit code generated by your app to confirm setup.
                  </p>

                  <form onSubmit={handleVerify} className="pl-9 space-y-4">
                    {error && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm">
                        <AlertTriangle size={16} />
                        {error}
                      </div>
                    )}
                    
                    <input
                      type="text"
                      pattern="\d{6}"
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full bg-black/40 border border-zinc-800 text-white rounded-2xl p-4 text-center text-2xl tracking-[0.6em] font-mono focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-zinc-800"
                    />

                    <button
                      type="submit"
                      disabled={verifying || token.length !== 6}
                      className="w-full relative group overflow-hidden bg-white hover:bg-zinc-100 text-black font-black py-4 px-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {verifying ? 'Verifying...' : 'Complete Setup'}
                        {!verifying && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
