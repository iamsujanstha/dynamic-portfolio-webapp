'use client';

import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    if (!confirm('This will WIPE all existing data and reset to defaults. Are you sure?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed');
      
      alert('Database seeded successfully!');
      router.refresh();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSeed}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
      {loading ? 'Seeding...' : 'Trigger Database Seed'}
    </button>
  );
}
