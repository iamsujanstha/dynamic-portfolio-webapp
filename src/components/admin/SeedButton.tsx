'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DatabaseZap, Loader2, AlertTriangle, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

function ConfirmModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [confirmText, setConfirmText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isConfirmed = confirmText === 'confirm';

  useEffect(() => {
    // Auto-focus the input when modal opens
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

        <div className="p-8">
          {/* Icon + header */}
          <div className="flex items-start gap-5 mb-6">
            <div className="shrink-0 w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={26} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white mb-1">
                Reset Database?
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                This action cannot be undone.
              </p>
            </div>

            {/* Close */}
            {!loading && (
              <button
                onClick={onCancel}
                className="ml-auto shrink-0 p-2 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Warning box */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-8 space-y-2">
            <p className="text-red-400 text-sm font-semibold flex items-center gap-2">
              <Trash2 size={14} /> What will be wiped:
            </p>
            <ul className="text-zinc-400 text-xs space-y-1.5 pl-5 list-disc leading-relaxed">
              <li>All existing pages and their content</li>
              <li>All projects and associated metadata</li>
              <li>Navigation links and settings</li>
              <li>Any custom data added through the CMS</li>
            </ul>
            <p className="text-zinc-500 text-xs pt-1">
              The database will be repopulated with the default seed data.
            </p>
          </div>

          {/* Confirm input */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-400 mb-2">
              Type{' '}
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-200 font-mono text-[11px]">
                confirm
              </kbd>{' '}
              to enable the reset button
            </label>
            <input
              ref={inputRef}
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toLowerCase())}
              disabled={loading}
              placeholder="Type confirm here…"
              className={`w-full px-4 py-3 rounded-xl bg-zinc-900 border text-sm font-mono transition-all outline-none placeholder:text-zinc-700 disabled:opacity-40
                ${isConfirmed
                  ? 'border-red-500/60 text-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-zinc-800 text-zinc-300 focus:border-zinc-600 focus:ring-2 focus:ring-zinc-600/20'
                }`}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !isConfirmed}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-red-600 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Seeding…
                </>
              ) : (
                <>
                  <DatabaseZap size={15} />
                  Yes, Reset
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function SeedButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed');
      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-xl text-sm font-bold transition-all"
      >
        <DatabaseZap size={16} className="text-blue-400" />
        Trigger Database Seed
      </button>

      <AnimatePresence>
        {showModal && (
          <ConfirmModal
            onConfirm={handleConfirm}
            onCancel={() => !loading && setShowModal(false)}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </>
  );
}
