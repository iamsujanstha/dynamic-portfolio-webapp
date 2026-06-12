'use client';

import { FormEvent, useEffect, useMemo, useState, useTransition, useRef } from 'react';
import type { ReactNode } from 'react';
import { SimKey } from '@/services/simulationService';
import { useSimulation } from '@/hooks/useSimulation';
import { CheckCircle2, FileUp, Plus, Save, Trash2, User, X, ExternalLink, Image as ImageIcon, FileUser, ShieldCheck, ChevronUp, ChevronDown, Eye, Download } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { sectionTemplate } from '@/core/constants';
enum SectionType {
  HERO = 'HERO',
  PROJECTS_GRID = 'PROJECTS_GRID',
  EXPERIENCE_TIMELINE = 'EXPERIENCE_TIMELINE',
  SKILLS_CLOUD = 'SKILLS_CLOUD',
  CONTACT_FORM = 'CONTACT_FORM',
  CUSTOM_MARKDOWN = 'CUSTOM_MARKDOWN'
}

type CmsMode = 'pages' | 'projects' | 'assets' | 'settings';

type Props = {
  mode: CmsMode;
  initialData: any;
  isVerified?: boolean;
};

function stringifyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function splitCsv(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

async function request(path: string, options: RequestInit) {
  const response = await fetch(path, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || error.error || 'Request failed');
  }

  return response.json();
}

export function AdminCms({ mode, initialData, isVerified = true }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { getSimData, saveSimData } = useSimulation();

  // Use a cache to persist simulated changes between tab switches
  const [simCache, setSimCache] = useState<Record<string, any>>({});

  // Map mode to SimKey
  const simKeyMap: Record<string, SimKey> = {
    pages: SimKey.PAGES,
    projects: SimKey.PROJECTS,
    settings: SimKey.SETTINGS,
    assets: SimKey.ASSETS
  };

  const key = simKeyMap[mode];

  useEffect(() => {
    // Admins should always see the latest DB data first. 
    // They can still use simulation if they want, but initial load should be clean.
    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    // If we have fresh initialData from the server, we should probably prefer it if we are Admin
    if (isAdmin) {
      setSimCache(prev => ({ ...prev, [mode]: initialData }));
    } else {
      // Try to load from service first for non-admins (simulation mode)
      const saved = getSimData<any>(key);
      if (saved) {
        setSimCache(prev => ({ ...prev, [mode]: saved }));
      } else if (!simCache[mode]) {
        setSimCache(prev => ({ ...prev, [mode]: initialData }));
      }
    }
  }, [mode, initialData, key, getSimData, session]);

  const currentData = simCache[mode] || initialData;
  const handleUpdate = (newData: any) => {
    setSimCache(prev => ({ ...prev, [mode]: newData }));
    saveSimData(key, newData);
    router.refresh();
  };

  return (
    <div className={`flex flex-col min-h-[calc(100vh-200px)] transition-all duration-700 ${!isVerified ? 'blur-[2px] grayscale skew-y-1 pointer-events-none select-none opacity-50' : ''}`}>
      <div className="flex-grow">
        {mode === 'pages' && <PagesCms initialPages={currentData} onUpdate={handleUpdate} isVerified={isVerified} />}
        {mode === 'projects' && <ProjectsCms initialProjects={currentData} onUpdate={handleUpdate} isVerified={isVerified} />}
        {mode === 'assets' && <AssetsCms initialAssets={currentData} onUpdate={handleUpdate} isVerified={isVerified} />}
        {mode === 'settings' && <SettingsCms initialSettings={currentData} onUpdate={handleUpdate} isVerified={isVerified} />}
      </div>

      <footer className="mt-12 pt-8 border-t border-zinc-800/50 text-center">
        <p className="text-zinc-500 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
          <span>&copy; {new Date().getFullYear()} Sujan Shrestha</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span>Dynamic Portfolio Engine v1.0.0</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
          <span className="text-blue-500/50">Licensed for Personal Use</span>
        </p>
      </footer>
    </div>
  );
}

function CmsHeader({ title, description, previewPath = '/' }: { title: string; description: string; previewPath?: string }) {
  const { isActive, resetSimulation } = useSimulation();
  const { data: session } = useSession();
  const isViewer = session?.user?.role === 'viewer';

  function handleReset() {
    if (confirm('Are you sure you want to reset all simulated changes? This will restore data from the production database.')) {
      resetSimulation();
      window.location.reload();
    }
  }

  return (
    <div className="mb-8 flex flex-col md:flex-row items-start justify-between gap-6">
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
          {isViewer && (
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20">
              Viewer Mode (Read Only)
            </div>
          )}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {isActive && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
          >
            Reset Simulation
          </button>
        )}
        <Link
          href={previewPath === 'index' ? '/' : previewPath.startsWith('/') ? previewPath : `/${previewPath}`}
          target="_blank"
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          View Changes <ExternalLink size={12} />
        </Link>
        <Link href="/admin" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 transition-all">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

// Utility for cropping
function getCroppedImg(image: HTMLImageElement, crop: any): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return Promise.reject(new Error('No 2d context'));

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      1
    );
  });
}

const inputClass = "w-full rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-3 text-sm text-zinc-200 outline-none ring-blue-500/20 transition-all focus:border-blue-500 focus:ring-4 placeholder:text-zinc-700";

function StatusLine({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return (
    <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
      {error || message}
    </div>
  );
}

function useStatusMessage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!message && !error) return;
    const timer = setTimeout(() => {
      setMessage('');
      setError('');
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, error]);

  function clearStatus() {
    setMessage('');
    setError('');
  }

  const StatusDisplay = () => <StatusLine message={message} error={error} />;

  return { setMessage, setError, clearStatus, StatusDisplay };
}

function PagesCms({ initialPages, onUpdate, isVerified = true }: { initialPages: any[], onUpdate: (data: any[]) => void, isVerified?: boolean }) {
  const [pages, setPages] = useState(initialPages);

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);
  const [selectedId, setSelectedId] = useState(initialPages[0]?._id || 'new');
  const selected = pages.find((page) => page._id === selectedId);
  const [title, setTitle] = useState(selected?.title || 'Home');
  const [slug, setSlug] = useState(selected?.slug || 'index');
  const [status, setStatus] = useState(selected?.status || 'published');
  const [description, setDescription] = useState(selected?.description || '');
  const [sections, setSections] = useState(stringifyJson(selected?.sections?.length ? selected.sections : sectionTemplate));

  const [sectionsList, setSectionsList] = useState<any[]>(() => {
    const initialSecs = selected?.sections?.length ? selected.sections : sectionTemplate;
    return initialSecs;
  });
  const [editorTab, setEditorTab] = useState<'visual' | 'json'>('visual');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  const updateSectionsList = (newList: any[]) => {
    setSectionsList(newList);
    try {
      setSections(JSON.stringify(newList, null, 2));
    } catch (e) { }
  };

  const handleJsonChange = (val: string) => {
    setSections(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setSectionsList(parsed);
      }
    } catch (e) {
      // Allow user to edit invalid JSON while typing
    }
  };

  function choosePage(id: string) {
    setSelectedId(id);
    const page = pages.find((item) => item._id === id);
    setTitle(page?.title || '');
    setSlug(page?.slug || '');
    setStatus(page?.status || 'published');
    setDescription(page?.description || '');
    const initialSecs = page?.sections?.length ? page.sections : sectionTemplate;
    setSections(stringifyJson(initialSecs));
    setSectionsList(initialSecs);
    setExpandedIndex(0);
    clearStatus();
  }

  useEffect(() => {
    setPages(initialPages);
    const currentSel = initialPages.find(p => p._id === selectedId);
    if (currentSel) {
      const initialSecs = currentSel.sections?.length ? currentSel.sections : sectionTemplate;
      setSections(stringifyJson(initialSecs));
      setSectionsList(initialSecs);
    }
  }, [initialPages]);

  const moveSection = (idx: number, direction: 'up' | 'down') => {
    const newList = [...sectionsList];
    if (direction === 'up' && idx > 0) {
      const temp = newList[idx];
      newList[idx] = newList[idx - 1];
      newList[idx - 1] = temp;
    } else if (direction === 'down' && idx < newList.length - 1) {
      const temp = newList[idx];
      newList[idx] = newList[idx + 1];
      newList[idx + 1] = temp;
    }
    const orderedList = newList.map((sec, i) => ({ ...sec, order: i }));
    updateSectionsList(orderedList);
  };

  const removeSection = (idx: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const newList = sectionsList.filter((_, i) => i !== idx).map((sec, i) => ({ ...sec, order: i }));
      updateSectionsList(newList);
      setExpandedIndex(null);
    }
  };

  const addSection = (type: string) => {
    const defaultContents: Record<string, any> = {
      HERO: {},
      PROJECTS_GRID: {},
      SKILLS_CLOUD: { skills: [] },
      EXPERIENCE_TIMELINE: { experiences: [], education: [] },
      CONTACT_FORM: {},
      CUSTOM_MARKDOWN: { markdown: '# Custom Content\nEdit me!' }
    };
    const newSec = {
      type,
      status: 'published',
      title: `New ${type.replace('_', ' ')} Section`,
      subtitle: '',
      isActive: true,
      order: sectionsList.length,
      content: defaultContents[type] || {}
    };
    updateSectionsList([...sectionsList, newSec]);
  };

  function prettify() {
    try {
      const obj = JSON.parse(sections);
      setSections(JSON.stringify(obj, null, 2));
      setMessage('JSON Prettified');
    } catch (e) {
      setError('Invalid JSON structure');
    }
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (isViewer) {
      try {
        const parsedSections = JSON.parse(sections);
        const simulatedPage = {
          _id: selectedId === 'new' ? `sim-${Date.now()}` : selectedId,
          title,
          slug,
          status,
          description,
          sections: parsedSections,
          updatedAt: new Date().toISOString()
        };

        setPages(prev => {
          const exists = prev.find(p => p._id === selectedId);
          const next = exists
            ? prev.map(p => p._id === selectedId ? simulatedPage : p)
            : [simulatedPage, ...prev];
          onUpdate(next);
          return next;
        });

        if (selectedId === 'new') setSelectedId(simulatedPage._id);
        setMessage('Simulation Mode: Changes applied locally for this session.');
      } catch (e) {
        setError('Invalid JSON structure. Please fix before simulating save.');
      }
      return;
    }
    startTransition(async () => {
      try {
        setError('');
        const parsedSections = JSON.parse(sections).map(({ _id, createdAt, updatedAt, __v, ...section }: any) => section);
        const payload = {
          title,
          slug,
          status,
          description,
          metadata: { title, description },
          sections: parsedSections,
        };
        const isNew = selectedId === 'new';
        const saved = await request(isNew ? '/api/pages' : `/api/pages/${selectedId}`, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(payload),
        });

        const next = isNew ? [saved, ...pages] : pages.map((page) => page._id === selectedId ? saved : page);
        setPages(next);
        onUpdate(next); // Sync parent cache with DB data
        setSelectedId(saved._id);
        setMessage('Page saved and synced with database.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function removePage() {
    if (selectedId === 'new') return;
    if (isViewer) {
      setMessage('Simulation Mode: Page removed from local list.');
      const nextPages = pages.filter((page) => page._id !== selectedId);
      setPages(nextPages);
      choosePage(nextPages[0]?._id || 'new');
      return;
    }
    startTransition(async () => {
      try {
        await request(`/api/pages/${selectedId}`, { method: 'DELETE' });
        const nextPages = pages.filter((page) => page._id !== selectedId);
        setPages(nextPages);
        choosePage(nextPages[0]?._id || 'new');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <CmsHeader
        title="Content Management"
        description="Manage your website sections and pages"
        previewPath={selected?.slug || '/'}
      />

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2 order-2 lg:order-1">
          <button
            onClick={() => choosePage('new')}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-zinc-800 p-4 text-xs font-bold text-zinc-500 hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-400 transition-all"
          >
            <Plus size={16} /> Create New Page
          </button>
          <div className="h-px bg-zinc-800 my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {pages.map((page: any) => (
              <button
                key={page._id}
                onClick={() => choosePage(page._id)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${selectedId === page._id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
              >
                <span className="truncate">{page.title}</span>
                <span className="text-[10px] opacity-50 font-black uppercase ml-2">{page.slug}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={save} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:p-8 backdrop-blur-md order-1 lg:order-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Page Title">
              <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Home Page" />
            </Field>
            <Field label="URL Slug">
              <input className={inputClass} value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="home" />
            </Field>
          </div>

          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mt-8">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Page Content Sections</label>
            <div className="flex gap-1 p-0.5 bg-zinc-950 border border-zinc-850 rounded-lg">
              <button
                type="button"
                onClick={() => setEditorTab('visual')}
                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${editorTab === 'visual' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                  }`}
              >
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('json')}
                className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all ${editorTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-350'
                  }`}
              >
                Code (JSON)
              </button>
            </div>
          </div>

          {editorTab === 'visual' ? (
            <div className="space-y-4">
              {sectionsList.map((section, idx) => {
                const isExpanded = expandedIndex === idx;
                return (
                  <div key={section._id || idx} className="rounded-xl border border-zinc-800 bg-zinc-950/20 overflow-hidden">
                    {/* Header */}
                    <div
                      className="flex items-center justify-between px-4 py-3 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors cursor-pointer select-none"
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                          {section.type}
                        </span>
                        <span className="text-xs font-bold text-zinc-300 truncate">
                          {section.title || '(No Title)'}
                        </span>
                        {section.status === 'draft' && (
                          <span className="text-[8px] bg-zinc-800 text-zinc-500 px-1 py-0.2 rounded shrink-0 uppercase font-black">Draft</span>
                        )}
                        {!section.isActive && (
                          <span className="text-[8px] bg-red-950/20 text-red-500 border border-red-950/50 px-1 py-0.2 rounded shrink-0 uppercase font-black">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === sectionsList.length - 1}
                          className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                          title="Move Down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete Section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    {isExpanded && (
                      <div className="p-4 border-t border-zinc-800 bg-zinc-900/10 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Section Title</span>
                            <input
                              className={inputClass}
                              value={section.title || ''}
                              onChange={(e) => {
                                const newList = [...sectionsList];
                                newList[idx] = { ...section, title: e.target.value };
                                updateSectionsList(newList);
                              }}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Section Subtitle</span>
                            <input
                              className={inputClass}
                              value={section.subtitle || ''}
                              onChange={(e) => {
                                const newList = [...sectionsList];
                                newList[idx] = { ...section, subtitle: e.target.value };
                                updateSectionsList(newList);
                              }}
                            />
                          </label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <label className="block">
                            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Section Type</span>
                            <select
                              className={inputClass + " cursor-pointer"}
                              value={section.type}
                              onChange={(e) => {
                                const newList = [...sectionsList];
                                newList[idx] = { ...section, type: e.target.value };
                                updateSectionsList(newList);
                              }}
                            >
                              {Object.values(SectionType).map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</span>
                            <select
                              className={inputClass + " cursor-pointer"}
                              value={section.status || 'published'}
                              onChange={(e) => {
                                const newList = [...sectionsList];
                                newList[idx] = { ...section, status: e.target.value };
                                updateSectionsList(newList);
                              }}
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                            </select>
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Is Active</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newList = [...sectionsList];
                                newList[idx] = { ...section, isActive: !section.isActive };
                                updateSectionsList(newList);
                              }}
                              className={`flex items-center justify-between w-full p-2.5 border rounded-xl transition-all ${section.isActive
                                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                                : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                                }`}
                            >
                              <span className="text-[11px] font-bold uppercase tracking-wider">{section.isActive ? 'Active' : 'Inactive'}</span>
                              <div className={`w-7 h-4 rounded-full transition-colors relative ${section.isActive ? 'bg-blue-600' : 'bg-zinc-850'}`}>
                                <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-zinc-400 transition-transform ${section.isActive ? 'translate-x-3 bg-white' : 'translate-x-0'}`} />
                              </div>
                            </button>
                          </label>
                        </div>

                        {/* SKILLS_CLOUD Custom Editor */}
                        {section.type === 'SKILLS_CLOUD' && (() => {
                          const skills = section.content?.skills || [];
                          const isObjectSkills = skills.length > 0 && typeof skills[0] === 'object' && skills[0] !== null;

                          return (
                            <div className="space-y-4 border-t border-zinc-850 pt-4 mt-4">
                              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Skills list</span>

                              {isObjectSkills ? (
                                <div className="space-y-3">
                                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                                    {skills.map((skill: any, sIdx: number) => (
                                      <div key={sIdx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl relative group/skill">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newSkills = skills.filter((_: any, i: number) => i !== sIdx);
                                            const newList = [...sectionsList];
                                            newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                            updateSectionsList(newList);
                                          }}
                                          className="absolute top-2 right-2 text-zinc-650 hover:text-red-400 opacity-0 group-hover/skill:opacity-100 transition-opacity"
                                        >
                                          <X size={14} />
                                        </button>
                                        <div className="space-y-2">
                                          <input
                                            className="w-full bg-transparent border-b border-zinc-850 focus:border-zinc-700 text-xs text-zinc-200 font-bold p-1 outline-none"
                                            placeholder="Skill Name"
                                            value={skill.name || ''}
                                            onChange={(e) => {
                                              const newSkills = [...skills];
                                              newSkills[sIdx] = { ...skill, name: e.target.value };
                                              const newList = [...sectionsList];
                                              newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                              updateSectionsList(newList);
                                            }}
                                          />
                                          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                            <input
                                              className="bg-transparent border border-zinc-850/80 rounded px-1.5 py-0.5 text-zinc-400 placeholder:text-zinc-800"
                                              placeholder="Icon Name"
                                              value={skill.icon || ''}
                                              onChange={(e) => {
                                                const newSkills = [...skills];
                                                newSkills[sIdx] = { ...skill, icon: e.target.value };
                                                const newList = [...sectionsList];
                                                newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                                updateSectionsList(newList);
                                              }}
                                            />
                                            <input
                                              className="bg-transparent border border-zinc-850/80 rounded px-1.5 py-0.5 text-zinc-400 placeholder:text-zinc-805"
                                              placeholder="Category"
                                              value={skill.category || ''}
                                              onChange={(e) => {
                                                const newSkills = [...skills];
                                                newSkills[sIdx] = { ...skill, category: e.target.value };
                                                const newList = [...sectionsList];
                                                newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                                updateSectionsList(newList);
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newSkills = [...skills, { name: '', icon: 'Code2', category: 'frontend' }];
                                      const newList = [...sectionsList];
                                      newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                      updateSectionsList(newList);
                                    }}
                                    className="flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider"
                                  >
                                    <Plus size={12} /> Add Skill Item
                                  </button>
                                </div>
                              ) : (
                                <div className="w-full flex flex-wrap gap-1.5 p-2 border border-zinc-800 bg-zinc-950/50 rounded-xl min-h-[46px]">
                                  {(skills as string[]).map((skill, sIdx) => (
                                    <span key={sIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                      {skill}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSkills = skills.filter((_: any, i: number) => i !== sIdx);
                                          const newList = [...sectionsList];
                                          newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                          updateSectionsList(newList);
                                        }}
                                        className="text-zinc-500 hover:text-red-400 ml-1"
                                      >
                                        <X size={10} />
                                      </button>
                                    </span>
                                  ))}
                                  <input
                                    type="text"
                                    className="flex-1 min-w-[100px] bg-transparent border-0 p-0 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-0"
                                    placeholder="Type and press Comma or Enter..."
                                    onKeyDown={(e) => {
                                      if (e.key === ',' || e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                          const valList = val.split(',').map(v => v.trim()).filter(Boolean);
                                          const unique = valList.filter(v => !skills.includes(v));
                                          if (unique.length > 0) {
                                            const newSkills = [...skills, ...unique];
                                            const newList = [...sectionsList];
                                            newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                            updateSectionsList(newList);
                                          }
                                        }
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                    onBlur={(e) => {
                                      const val = e.currentTarget.value.trim();
                                      if (val) {
                                        const valList = val.split(',').map(v => v.trim()).filter(Boolean);
                                        const unique = valList.filter(v => !skills.includes(v));
                                        if (unique.length > 0) {
                                          const newSkills = [...skills, ...unique];
                                          const newList = [...sectionsList];
                                          newList[idx] = { ...section, content: { ...section.content, skills: newSkills } };
                                          updateSectionsList(newList);
                                        }
                                        e.currentTarget.value = '';
                                      }
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* CUSTOM_MARKDOWN Custom Editor */}
                        {section.type === 'CUSTOM_MARKDOWN' && (
                          <div className="space-y-2 border-t border-zinc-800 pt-4 mt-4">
                            <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">Markdown Content</span>
                            <textarea
                              className={inputClass + " min-h-36 font-mono text-xs leading-relaxed"}
                              value={section.content?.markdown || ''}
                              onChange={(e) => {
                                const newList = [...sectionsList];
                                newList[idx] = { ...section, content: { ...section.content, markdown: e.target.value } };
                                updateSectionsList(newList);
                              }}
                              placeholder="# Custom markdown header..."
                            />
                          </div>
                        )}

                        {/* EXPERIENCE_TIMELINE Custom Editor */}
                        {section.type === 'EXPERIENCE_TIMELINE' && (() => {
                          const experiences = section.content?.experiences || [];
                          const education = section.content?.education || [];

                          return (
                            <div className="space-y-6 border-t border-zinc-800 pt-4 mt-4">
                              {/* Experience list */}
                              <div className="space-y-3">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-850 pb-1">Experience Entries</span>
                                {experiences.map((exp: any, eIdx: number) => (
                                  <div key={exp.id || eIdx} className="p-3 bg-zinc-950 border border-zinc-855 rounded-xl space-y-3 relative group/exp">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newExps = experiences.filter((_: any, i: number) => i !== eIdx);
                                        const newList = [...sectionsList];
                                        newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                        updateSectionsList(newList);
                                      }}
                                      className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover/exp:opacity-100 transition-opacity"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-3 pt-1">
                                      <input
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                                        placeholder="Company"
                                        value={exp.company || ''}
                                        onChange={(e) => {
                                          const newExps = [...experiences];
                                          newExps[eIdx] = { ...exp, company: e.target.value };
                                          const newList = [...sectionsList];
                                          newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                          updateSectionsList(newList);
                                        }}
                                      />
                                      <input
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                                        placeholder="Role"
                                        value={exp.role || ''}
                                        onChange={(e) => {
                                          const newExps = [...experiences];
                                          newExps[eIdx] = { ...exp, role: e.target.value };
                                          const newList = [...sectionsList];
                                          newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                          updateSectionsList(newList);
                                        }}
                                      />
                                      <input
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                                        placeholder="Period (e.g. 2024 - Present)"
                                        value={exp.period || ''}
                                        onChange={(e) => {
                                          const newExps = [...experiences];
                                          newExps[eIdx] = { ...exp, period: e.target.value };
                                          const newList = [...sectionsList];
                                          newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                          updateSectionsList(newList);
                                        }}
                                      />
                                    </div>

                                    {/* Description bullets */}
                                    <div className="space-y-1.5">
                                      <span className="block text-[8px] font-bold uppercase tracking-widest text-zinc-500">Bullets / Description</span>
                                      {(exp.description || []).map((bullet: string, bIdx: number) => (
                                        <div key={bIdx} className="flex gap-1 items-center">
                                          <input
                                            className="flex-1 bg-zinc-900 border border-zinc-850 rounded p-1 text-[11px] text-zinc-300"
                                            value={bullet || ''}
                                            onChange={(e) => {
                                              const newExps = [...experiences];
                                              const newDesc = [...(exp.description || [])];
                                              newDesc[bIdx] = e.target.value;
                                              newExps[eIdx] = { ...exp, description: newDesc };
                                              const newList = [...sectionsList];
                                              newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                              updateSectionsList(newList);
                                            }}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newExps = [...experiences];
                                              const newDesc = (exp.description || []).filter((_: any, i: number) => i !== bIdx);
                                              newExps[eIdx] = { ...exp, description: newDesc };
                                              const newList = [...sectionsList];
                                              newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                              updateSectionsList(newList);
                                            }}
                                            className="text-zinc-650 hover:text-red-400 p-1"
                                          >
                                            <X size={11} />
                                          </button>
                                        </div>
                                      ))}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newExps = [...experiences];
                                          const newDesc = [...(exp.description || []), ''];
                                          newExps[eIdx] = { ...exp, description: newDesc };
                                          const newList = [...sectionsList];
                                          newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                          updateSectionsList(newList);
                                        }}
                                        className="text-[9px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-0.5"
                                      >
                                        <Plus size={10} /> Add Bullet
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newExps = [...experiences, { role: '', company: '', period: '', description: [] }];
                                    const newList = [...sectionsList];
                                    newList[idx] = { ...section, content: { ...section.content, experiences: newExps } };
                                    updateSectionsList(newList);
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider"
                                >
                                  <Plus size={12} /> Add Experience Entry
                                </button>
                              </div>

                              {/* Education list */}
                              <div className="space-y-3">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-855 pb-1">Education Entries</span>
                                {education.map((edu: any, edIdx: number) => (
                                  <div key={edu.id || edIdx} className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl grid gap-2 grid-cols-1 sm:grid-cols-3 relative group/edu">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newEdus = education.filter((_: any, i: number) => i !== edIdx);
                                        const newList = [...sectionsList];
                                        newList[idx] = { ...section, content: { ...section.content, education: newEdus } };
                                        updateSectionsList(newList);
                                      }}
                                      className="absolute top-2 right-2 text-zinc-650 hover:text-red-400 opacity-0 group-hover/edu:opacity-100 transition-opacity"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                    <input
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                                      placeholder="Institution"
                                      value={edu.institution || ''}
                                      onChange={(e) => {
                                        const newEdus = [...education];
                                        newEdus[edIdx] = { ...edu, institution: e.target.value };
                                        const newList = [...sectionsList];
                                        newList[idx] = { ...section, content: { ...section.content, education: newEdus } };
                                        updateSectionsList(newList);
                                      }}
                                    />
                                    <input
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                                      placeholder="Degree"
                                      value={edu.degree || ''}
                                      onChange={(e) => {
                                        const newEdus = [...education];
                                        newEdus[edIdx] = { ...edu, degree: e.target.value };
                                        const newList = [...sectionsList];
                                        newList[idx] = { ...section, content: { ...section.content, education: newEdus } };
                                        updateSectionsList(newList);
                                      }}
                                    />
                                    <input
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded p-1.5 text-xs text-zinc-200"
                                      placeholder="Period"
                                      value={edu.period || ''}
                                      onChange={(e) => {
                                        const newEdus = [...education];
                                        newEdus[edIdx] = { ...edu, period: e.target.value };
                                        const newList = [...sectionsList];
                                        newList[idx] = { ...section, content: { ...section.content, education: newEdus } };
                                        updateSectionsList(newList);
                                      }}
                                    />
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newEdus = [...education, { degree: '', institution: '', period: '' }];
                                    const newList = [...sectionsList];
                                    newList[idx] = { ...section, content: { ...section.content, education: newEdus } };
                                    updateSectionsList(newList);
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-blue-400 font-bold uppercase tracking-wider"
                                >
                                  <Plus size={12} /> Add Education Entry
                                </button>
                              </div>
                            </div>
                          );
                        })()}

                        {/* HERO, PROJECTS_GRID, CONTACT_FORM Message */}
                        {(section.type === 'HERO' || section.type === 'PROJECTS_GRID' || section.type === 'CONTACT_FORM') && (
                          <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl text-center mt-4">
                            <p className="text-xs text-zinc-500 italic">This section type ({section.type}) reads data dynamically or uses site settings. No custom markdown content is required.</p>
                          </div>
                        )}

                        {/* Advanced Raw JSON edit */}
                        <details className="mt-4 border-t border-zinc-850 pt-3 group/raw">
                          <summary className="text-[9px] font-bold text-zinc-500 hover:text-zinc-350 uppercase tracking-widest cursor-pointer select-none">
                            Advanced Section Content JSON
                          </summary>
                          <div className="mt-2">
                            <textarea
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 font-mono text-[10px] text-blue-300 min-h-24 outline-none focus:border-zinc-700"
                              value={JSON.stringify(section.content || {}, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  const newList = [...sectionsList];
                                  newList[idx] = { ...section, content: parsed };
                                  updateSectionsList(newList);
                                } catch (err) {
                                  // Let them type invalid JSON
                                }
                              }}
                            />
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add New Section */}
              <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/10">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 shrink-0">Add New Section</span>
                <select
                  id="new-section-type-select"
                  className={inputClass + " flex-1 py-2 text-xs cursor-pointer"}
                  defaultValue="CUSTOM_MARKDOWN"
                >
                  {Object.values(SectionType).map((t) => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('new-section-type-select') as HTMLSelectElement;
                    if (sel) {
                      addSection(sel.value);
                      setExpandedIndex(sectionsList.length);
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 border border-blue-500/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-400 hover:bg-blue-600 hover:text-white transition-all shrink-0"
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>
            </div>
          ) : (
            <Field label="JSON Content (Sections)">
              <div className="relative group">
                <textarea
                  className={`${inputClass} min-h-[400px] lg:min-h-[500px] font-mono text-xs leading-relaxed text-blue-300/80 selection:bg-blue-500/30`}
                  value={sections}
                  onChange={(event) => handleJsonChange(event.target.value)}
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={prettify}
                  className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-700 transition-all opacity-0 lg:group-hover:opacity-100 hidden lg:block"
                >
                  Prettify JSON
                </button>
              </div>
              {/* Mobile Prettify Button */}
              <button
                type="button"
                onClick={prettify}
                className="lg:hidden mt-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-700"
              >
                Prettify JSON
              </button>
            </Field>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-zinc-800 gap-4">
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={isPending || !isVerified} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all">
                {isVerified && <Save size={16} />} {isVerified ? (isViewer ? 'Simulate Save' : 'Save Page') : 'REPRODUCTION LOCKED'}
              </button>
              {selectedId !== 'new' && (
                <button type="button" onClick={() => removePage()} disabled={isPending} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 transition-all">
                  <Trash2 size={16} /> {isViewer ? 'Simulate Delete' : 'Delete'}
                </button>
              )}</div>
            <div className="w-full sm:w-auto overflow-hidden">
              <StatusDisplay />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectsCms({ initialProjects, onUpdate, isVerified = true }: { initialProjects: any[], onUpdate: (data: any[]) => void, isVerified?: boolean }) {
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);
  const [selectedId, setSelectedId] = useState(initialProjects[0]?._id || 'new');
  const selected = useMemo(() => projects.find((project) => project._id === selectedId), [projects, selectedId]);
  const [form, setForm] = useState<{
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    tags: string[];
    github: string;
    live: string;
    featured: boolean;
  }>({
    title: selected?.title || '',
    slug: selected?.slug || '',
    description: selected?.description || '',
    thumbnail: selected?.thumbnail || '',
    tags: selected?.tags || [],
    github: selected?.links?.github || '',
    live: selected?.links?.live || '',
    featured: Boolean(selected?.featured),
  });
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  function update(key: string, value: any) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function chooseProject(id: string) {
    const project = projects.find((item) => item._id === id);
    setSelectedId(id);
    setForm({
      title: project?.title || '',
      slug: project?.slug || '',
      description: project?.description || '',
      thumbnail: project?.thumbnail || '',
      tags: project?.tags || [],
      github: project?.links?.github || '',
      live: project?.links?.live || '',
      featured: Boolean(project?.featured),
    });
    clearStatus();
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (isViewer) {
      const simulatedProject = {
        _id: selectedId === 'new' ? `sim-proj-${Date.now()}` : selectedId,
        title: form.title,
        slug: form.slug,
        description: form.description,
        thumbnail: form.thumbnail,
        tags: form.tags,
        links: { github: form.github, live: form.live },
        featured: form.featured,
        updatedAt: new Date().toISOString()
      };

      setProjects(prev => {
        const exists = prev.find(p => p._id === selectedId);
        const next = exists
          ? prev.map(p => p._id === selectedId ? simulatedProject : p)
          : [simulatedProject, ...prev];
        onUpdate(next);
        return next;
      });

      if (selectedId === 'new') setSelectedId(simulatedProject._id);
      setMessage('Simulation Mode: Changes applied locally for this session.');
      return;
    }
    startTransition(async () => {
      try {
        setError('');
        const payload = {
          title: form.title,
          slug: form.slug,
          description: form.description,
          thumbnail: form.thumbnail,
          tags: form.tags,
          links: { github: form.github, live: form.live },
          featured: form.featured,
        };
        const isNew = selectedId === 'new';
        const saved = await request(isNew ? '/api/projects' : `/api/projects/${selectedId}`, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(payload),
        });
        const next = isNew ? [saved, ...projects] : projects.map((project) => project._id === selectedId ? saved : project);
        setProjects(next);
        onUpdate(next); // Sync parent cache with DB data
        setSelectedId(saved._id);
        setMessage('Project saved and synced with database.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function removeProject() {
    if (selectedId === 'new') return;
    if (isViewer) {
      setMessage('Simulation Mode: Project removed from local list.');
      const nextProjects = projects.filter((p) => p._id !== selectedId);
      setProjects(nextProjects);
      chooseProject(nextProjects[0]?._id || 'new');
      return;
    }
    startTransition(async () => {
      try {
        await request(`/api/projects/${selectedId}`, { method: 'DELETE' });
        const nextProjects = projects.filter((p) => p._id !== selectedId);
        setProjects(nextProjects);
        chooseProject(nextProjects[0]?._id || 'new');
        setMessage('Project deleted.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <>
      <CmsHeader
        title="Projects CMS"
        description=""
        previewPath="/"
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 order-2 lg:order-1">
          <button onClick={() => chooseProject('new')} className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all">
            <Plus size={16} /> New Project
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => chooseProject(project._id)}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm font-bold transition-all ${selectedId === project._id ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xl shadow-black/40' : 'text-zinc-400 hover:bg-zinc-950'}`}
              >
                {project.title}
              </button>
            ))}
          </div>
        </aside>
        <form onSubmit={save} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:p-8 backdrop-blur-md order-1 lg:order-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Title"><input className={inputClass} value={form.title} onChange={(event) => update('title', event.target.value)} /></Field>
            <Field label="Slug"><input className={inputClass} value={form.slug} onChange={(event) => update('slug', event.target.value)} /></Field>
          </div>
          <Field label="Description"><textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => update('description', event.target.value)} /></Field>
          <Field label="Thumbnail URL"><input className={inputClass} value={form.thumbnail} onChange={(event) => update('thumbnail', event.target.value)} /></Field>
          <Field label="Tags">
            <div className="w-full flex flex-wrap gap-1.5 p-2 border border-zinc-800 bg-zinc-950/50 rounded-xl min-h-[46px] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
              {form.tags.map((tag, tagIdx) => (
                <span key={tagIdx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/5 hover:bg-blue-500/20 transition-all">
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = form.tags.filter((_, i) => i !== tagIdx);
                      update('tags', newTags);
                    }}
                    className="text-zinc-500 hover:text-red-400 font-extrabold cursor-pointer transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="flex-1 min-w-[120px] bg-transparent border-0 p-0 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-0"
                placeholder={form.tags.length === 0 ? "Next.js, MongoDB, Tailwind..." : "Add tag..."}
                onKeyDown={e => {
                  if (e.key === ',' || e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      const newItems = val.split(',').map(item => item.trim()).filter(Boolean);
                      const uniqueNewItems = newItems.filter(item => !form.tags.includes(item));
                      if (uniqueNewItems.length > 0) {
                        update('tags', [...form.tags, ...uniqueNewItems]);
                      }
                    }
                    e.currentTarget.value = '';
                  } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
                    if (form.tags.length > 0) {
                      update('tags', form.tags.slice(0, -1));
                    }
                  }
                }}
                onBlur={e => {
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    const newItems = val.split(',').map(item => item.trim()).filter(Boolean);
                    const uniqueNewItems = newItems.filter(item => !form.tags.includes(item));
                    if (uniqueNewItems.length > 0) {
                      update('tags', [...form.tags, ...uniqueNewItems]);
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="GitHub URL"><input className={inputClass} value={form.github} onChange={(event) => update('github', event.target.value)} /></Field>
            <Field label="Live URL"><input className={inputClass} value={form.live} onChange={(event) => update('live', event.target.value)} /></Field>
          </div>
          <label className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/50 w-fit cursor-pointer hover:bg-zinc-950 transition-colors">
            <input type="checkbox" className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-500/20" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} />
            <span className="font-medium">Featured project</span>
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-zinc-800">
            <button disabled={isPending || !isVerified} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
              {isVerified && <Save size={16} />} {isVerified ? (isViewer ? 'Simulate Save' : 'Save Project') : 'ACTION BLOCKED'}
            </button>
            {selectedId !== 'new' && (
              <button type="button" onClick={removeProject} disabled={isPending} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 px-6 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 transition-all">
                <Trash2 size={16} /> {isViewer ? 'Simulate Delete' : 'Delete'}
              </button>
            )}
            <StatusDisplay />
          </div>
        </form>
      </div>
    </>
  );
}

function AssetsCms({ initialAssets, onUpdate, isVerified = true }: { initialAssets: any[], onUpdate: (data: any[]) => void, isVerified?: boolean }) {
  const [assets, setAssets] = useState(initialAssets);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [assetNameInput, setAssetNameInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      // Pre-fill display name field with filename without extension
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      // Prettify filename (replace underscores/dashes with spaces and capitalize words)
      const prettyName = baseName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      setAssetNameInput(prettyName);
    }
  }

  function handleSaveClick(event: FormEvent) {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    setError('');
    setSaveModalOpen(true);
  }

  function executeSave() {
    if (!selectedFile) return;
    const finalName = assetNameInput.trim() || selectedFile.name;
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', finalName);

    setSaveModalOpen(false);

    if (isViewer) {
      const simulatedAsset = {
        _id: `sim-asset-${Date.now()}`,
        name: finalName,
        url: '/simulated-path.pdf',
        type: isPdf ? 'PDF' : 'IMAGE',
        createdAt: new Date().toISOString()
      };
      const next = [simulatedAsset, ...assets];
      setAssets(next);
      onUpdate(next);
      setMessage('Simulation Mode: Asset registered locally.');
      setSelectedFile(null);
      setAssetNameInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    startTransition(async () => {
      try {
        setError('');
        const asset = await request('/api/assets/upload', { method: 'POST', body: formData });
        const next = [asset, ...assets];
        setAssets(next);
        onUpdate(next);
        setMessage('Asset uploaded and registered.');
        setSelectedFile(null);
        setAssetNameInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function executeDeleteAsset(id: string) {
    if (isViewer) {
      const next = assets.filter((asset) => asset._id !== id);
      setAssets(next);
      onUpdate(next);
      setMessage('Simulation Mode: Asset removed locally.');
      return;
    }

    startTransition(async () => {
      try {
        setError('');
        await request(`/api/assets/${id}`, { method: 'DELETE' });
        const next = assets.filter((asset) => asset._id !== id);
        setAssets(next);
        onUpdate(next);
        setMessage('Asset deleted successfully.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  async function downloadFile(url: string, name: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = url.split('.').pop()?.split('?')[0] || '';
      const finalName = name.toLowerCase().endsWith(ext.toLowerCase()) ? name : `${name}.${ext}`;
      link.download = finalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  }

  return (
    <>
      <CmsHeader title="Assets / PDFs" description="Upload resume PDFs or image assets. Uploaded files are stored under `/public/uploads` and tracked in MongoDB." />
      <form onSubmit={handleSaveClick} className="mb-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 lg:p-8 backdrop-blur-md md:grid-cols-[1fr_auto] md:items-end">
        <Field label="PDF or Image File">
          <input
            ref={fileInputRef}
            required
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className={`${inputClass} pt-2.5`}
          />
        </Field>
        <button disabled={isPending} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
          <Save size={16} /> Save
        </button>
      </form>
      <StatusDisplay />
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20">
        {assets.map((asset) => (
          <div key={asset._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/60 px-5 py-5 last:border-b-0 group hover:bg-zinc-900/80 transition-colors">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white tracking-tight">
                {asset.name}
                {asset.createdAt && (
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    — {formatDate(asset.createdAt)}
                  </span>
                )}
              </p>
              <a href={asset.url} target="_blank" className="text-xs text-blue-400 hover:text-blue-300 truncate block mt-1 transition-colors">{asset.url}</a>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="w-fit rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors mr-1">{asset.type}</span>

              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-zinc-800"
                title="View PDF / Image"
              >
                <Eye size={16} />
              </a>

              <button
                onClick={() => downloadFile(asset.url, asset.name)}
                className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors rounded-lg hover:bg-zinc-800"
                title="Download"
              >
                <Download size={16} />
              </button>

              <button
                onClick={() => setDeleteTarget(asset._id)}
                disabled={isPending}
                className="p-2 text-zinc-500 hover:text-red-400 disabled:opacity-50 transition-colors rounded-lg hover:bg-zinc-800"
                title="Delete Asset"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md scale-100 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl shadow-black/80 transition-all">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <FileUp size={18} className="text-blue-500" /> Save Asset
            </h3>
            <p className="mt-2 text-xs text-zinc-400">
              Please enter a display name for this asset:
            </p>
            <div className="mt-4">
              <input
                type="text"
                value={assetNameInput}
                onChange={(e) => setAssetNameInput(e.target.value)}
                placeholder="e.g. My Professional Resume"
                className={inputClass}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeSave();
                  }
                }}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={executeSave}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                Save Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/75 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-md scale-100 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl shadow-black/80 transition-all">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Delete Asset
            </h3>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-zinc-200">{assets.find(a => a._id === deleteTarget)?.name}</strong>? This action will remove the physical file from storage and delete the database record. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = deleteTarget;
                  setDeleteTarget(null);
                  executeDeleteAsset(id);
                }}
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 shadow-xl shadow-red-600/20 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsCms({ initialSettings, onUpdate, isVerified = true }: { initialSettings: any, onUpdate: (data: any) => void, isVerified?: boolean }) {
  const [form, setForm] = useState(() => {
    const base = initialSettings || {};
    return {
      siteName: base.siteName || 'Sujan.dev',
      siteLogo: base.siteLogo || '',
      firstName: base.firstName || 'Sujan',
      lastName: base.lastName || 'Shrestha',
      profileDescription: base.profileDescription || 'Senior Frontend Engineer specializing in React, TypeScript, and high-performance web applications.',
      profilePicture: base.profilePicture || '',
      resumeUrl: base.resumeUrl || '',
      contactEmail: base.contactEmail || 'hello@sujan.dev',
      contactNumber: base.contactNumber || '',
      location: base.location || 'Kathmandu, Nepal',
      github: base.socialLinks?.github || 'https://github.com/iamsujanstha',
      linkedin: base.socialLinks?.linkedin || 'https://linkedin.com/in/sujan',
      twitter: base.socialLinks?.twitter || '',
      gaTrackingId: base.gaTrackingId || '',
      maintenanceMode: base.maintenanceMode || false,
      primaryColor: base.primaryColor || '#2563eb',
      skills: base.skills || [],
    };
  });

  useEffect(() => {
    if (initialSettings) {
      setForm({
        siteName: initialSettings.siteName || 'Sujan.dev',
        siteLogo: initialSettings.siteLogo || '',
        firstName: initialSettings.firstName || 'Sujan',
        lastName: initialSettings.lastName || 'Shrestha',
        profileDescription: initialSettings.profileDescription || 'Senior Frontend Engineer specializing in React, TypeScript, and high-performance web applications.',
        profilePicture: initialSettings.profilePicture || '',
        resumeUrl: initialSettings.resumeUrl || '',
        contactEmail: initialSettings.contactEmail || 'hello@sujan.dev',
        contactNumber: initialSettings.contactNumber || '',
        location: initialSettings.location || 'Kathmandu, Nepal',
        gaTrackingId: initialSettings.gaTrackingId || '',
        maintenanceMode: initialSettings.maintenanceMode || false,
        primaryColor: initialSettings.primaryColor || '#2563eb',
        github: initialSettings.socialLinks?.github || 'https://github.com/iamsujanstha',
        linkedin: initialSettings.socialLinks?.linkedin || 'https://linkedin.com/in/sujan',
        twitter: initialSettings.socialLinks?.twitter || '',
        skills: initialSettings.skills || [],
      });
    }
  }, [initialSettings]);
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>();

  function update(key: string, value: any) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  async function handleCropUpload() {
    if (!completedCrop || !imgRef.current) return;

    if (isViewer) {
      try {
        const blob = await getCroppedImg(imgRef.current!, completedCrop);
        const reader = new FileReader();
        reader.onload = () => {
          update('profilePicture', reader.result as string);
          setImgSrc('');
          setMessage('Simulation Mode: Profile picture updated locally.');
        };
        reader.readAsDataURL(blob);
        return;
      } catch (err: any) {
        setError(err.message);
        return;
      }
    }
    startTransition(async () => {
      try {
        setError('');
        const blob = await getCroppedImg(imgRef.current!, completedCrop);
        const formData = new FormData();
        formData.append('file', blob, 'profile.jpg');
        formData.append('name', 'Profile Picture');
        const asset = await request('/api/assets/upload', { method: 'POST', body: formData });
        update('profilePicture', asset.url);
        setImgSrc('');
        setMessage('Profile picture cropped and uploaded. Remember to click Save Settings!');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function handleResumeUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (isViewer) {
      update('resumeUrl', URL.createObjectURL(file));
      setMessage('Simulation Mode: Resume updated locally for this session.');
      return;
    }

    startTransition(async () => {
      try {
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', 'Active Resume');
        const asset = await request('/api/assets/upload', { method: 'POST', body: formData });
        update('resumeUrl', asset.url);
        setMessage('Resume uploaded. Remember to click Save Settings!');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (isViewer) {
      onUpdate(form);
      setMessage('Simulation Mode: Settings updated locally for this session.');
      return;
    }
    startTransition(async () => {
      try {
        setError('');
        await request('/api/settings', {
          method: 'PATCH',
          body: JSON.stringify({
            siteName: form.siteName,
            siteLogo: form.siteLogo,
            firstName: form.firstName,
            lastName: form.lastName,
            profileDescription: form.profileDescription,
            profilePicture: form.profilePicture,
            resumeUrl: form.resumeUrl,
            contactEmail: form.contactEmail,
            contactNumber: form.contactNumber,
            location: form.location,
            gaTrackingId: form.gaTrackingId,
            maintenanceMode: form.maintenanceMode,
            primaryColor: form.primaryColor,
            skills: form.skills,
            socialLinks: {
              github: form.github,
              linkedin: form.linkedin,
              twitter: form.twitter,
            },
          }),
        });
        onUpdate(form); // Sync parent cache with DB data
        setMessage('Settings saved successfully and synced with database.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <CmsHeader
        title="System Settings"
        description=""
        previewPath="/"
      />

      <form onSubmit={save} className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <div className="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <User size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">General Info</h2>
          </div>

          <Field label="Site Name">
            <input className={inputClass} value={form.siteName} onChange={(event) => update('siteName', event.target.value)} placeholder="My Portfolio" />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="First Name">
              <input className={inputClass} value={form.firstName} onChange={(event) => update('firstName', event.target.value)} placeholder="Sujan" />
            </Field>
            <Field label="Last Name">
              <input className={inputClass} value={form.lastName} onChange={(event) => update('lastName', event.target.value)} placeholder="Shrestha" />
            </Field>
          </div>

          <Field label="Professional Bio / Profile Description">
            <textarea
              className={`${inputClass} min-h-[100px] resize-none py-3`}
              value={form.profileDescription}
              onChange={(event) => update('profileDescription', event.target.value)}
              placeholder="Architecture-focused developer crafting high-performance digital experiences..."
            />
          </Field>

          <Field label="My Expertise (Tags)">
            <div className="w-full flex flex-wrap gap-1.5 p-2.5 border border-zinc-800 bg-zinc-950/50 rounded-xl min-h-[46px]">
              {(form.skills || []).map((skill: string, sIdx: number) => (
                <span key={sIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {skill}
                  <button
                    type="button"
                    onClick={() => {
                      const newSkills = (form.skills || []).filter((_: any, i: number) => i !== sIdx);
                      update('skills', newSkills);
                    }}
                    className="text-zinc-500 hover:text-red-400 ml-1"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="flex-1 min-w-[120px] bg-transparent border-0 p-0 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-0"
                placeholder="Type and press Enter or Comma..."
                onKeyDown={(e) => {
                  if (e.key === ',' || e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      const valList = val.split(',').map(v => v.trim()).filter(Boolean);
                      const unique = valList.filter(v => !(form.skills || []).includes(v));
                      if (unique.length > 0) {
                        update('skills', [...(form.skills || []), ...unique]);
                      }
                    }
                    e.currentTarget.value = '';
                  }
                }}
                onBlur={(e) => {
                  const val = e.currentTarget.value.trim();
                  if (val) {
                    const valList = val.split(',').map(v => v.trim()).filter(Boolean);
                    const unique = valList.filter(v => !(form.skills || []).includes(v));
                    if (unique.length > 0) {
                      update('skills', [...(form.skills || []), ...unique]);
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Primary Color">
              <div className="flex gap-2">
                <input type="color" className="h-11 w-11 shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 p-1 cursor-pointer" value={form.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} />
                <input className={inputClass} value={form.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} />
              </div>
            </Field>
            <Field label="Maintenance Mode">
              <div className="flex h-11 items-center">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" checked={form.maintenanceMode} onChange={(event) => update('maintenanceMode', event.target.checked)} />
                  <div className="peer h-6 w-11 rounded-full bg-zinc-800 transition-all after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full" />
                </label>
              </div>
            </Field>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact Details</h2>
            </div>
            <Field label="Contact Email">
              <input className={inputClass} value={form.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} placeholder="hello@example.com" />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Phone Number">
                <input className={inputClass} value={form.contactNumber} onChange={(event) => update('contactNumber', event.target.value)} placeholder="9802323233" />
              </Field>
              <Field label="Location">
                <input className={inputClass} value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="Kathmandu, Nepal" />
              </Field>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Social Connect</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="GitHub URL">
                <input className={inputClass} value={form.github} onChange={(event) => update('github', event.target.value)} placeholder="https://github.com/..." />
              </Field>
              <Field label="LinkedIn URL">
                <input className={inputClass} value={form.linkedin} onChange={(event) => update('linkedin', event.target.value)} placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 lg:p-8 backdrop-blur-md h-fit">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FileUp size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">Brand Assets</h2>
          </div>

          <div className="grid gap-8">
            <Field label="Site Logo">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 flex-shrink-0">
                  {form.siteLogo ? (
                    <Image
                      src={
                        form.siteLogo.startsWith('/') || form.siteLogo.startsWith('http')
                          ? form.siteLogo
                          : `https://${form.siteLogo}`
                      }
                      alt="Site Logo"
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-700">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <p className="truncate text-xs font-bold text-zinc-300">
                    {form.siteLogo ? form.siteLogo.split('/').pop() : 'No logo uploaded'}
                  </p>
                  <label className={`cursor-pointer text-[10px] font-black uppercase tracking-widest transition-colors ${isViewer ? 'text-zinc-600 cursor-not-allowed' : 'text-blue-500 hover:text-blue-400'}`}>
                    {isViewer ? 'Upload Restricted' : 'Upload Logo'}
                    <input type="file" className="hidden" accept="image/*" disabled={isViewer} onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      startTransition(async () => {
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('name', 'Site Logo');
                          const asset = await request('/api/assets/upload', { method: 'POST', body: formData });
                          update('siteLogo', asset.url);
                          setMessage('Logo uploaded. Remember to click Save Settings!');
                        } catch (err: any) {
                          setError(err.message);
                        }
                      });
                    }} />
                  </label>
                  {form.siteLogo && !isViewer && (
                    <button type="button" onClick={() => update('siteLogo', '')}
                      className="text-[10px] font-bold uppercase tracking-widest text-red-500/60 hover:text-red-400 transition-colors text-left">
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Profile Picture">
              <div className="relative aspect-square max-w-[240px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 mx-auto sm:mx-0">
                {form.profilePicture ? (
                  <Image
                    src={
                      form.profilePicture.startsWith('/') || form.profilePicture.startsWith('http://') || form.profilePicture.startsWith('https://')
                        ? form.profilePicture
                        : `https://${form.profilePicture}`
                    }
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="240px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-700">
                    <User size={48} />
                  </div>
                )}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition-opacity hover:opacity-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Change Photo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setImgSrc(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            </Field>

            <Field label="Current Resume">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
                    <FileUp size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-zinc-300">
                      {form.resumeUrl ? form.resumeUrl.split('/').pop() : 'No resume uploaded'}
                    </p>
                    <label className="mt-1 cursor-pointer text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">
                      Upload New PDF
                      <input type="file" className="hidden" accept="application/pdf" onChange={handleResumeUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </Field>

            {/* Edit PDF Resume — admin only */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-zinc-300 mb-1">PDF Resume Editor</p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Open the visual resume builder to edit content, typography, spacing, and regenerate the PDF.
                  </p>
                </div>
                <Link
                  href={'/admin/resume'}
                  className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${'border-blue-500/40 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:border-blue-400'
                    }`}
                >
                  <FileUser size={14} />
                  {'Edit Resume'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-800 pt-6 gap-6">
          <button disabled={isPending || !isVerified} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-2xl active:scale-95">
            {isVerified && <CheckCircle2 size={16} />} {isVerified ? (isViewer ? 'Simulate Save' : 'Save All Settings') : 'SAVE DISABLED — UNAUTHORIZED'}
          </button>
          <div className="w-full sm:w-auto overflow-hidden">
            <StatusDisplay />
          </div>
        </div>
      </form>

      {/* Cropper Modal */}
      {imgSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tighter">Crop Profile Picture</h3>
              <button onClick={() => setImgSrc('')} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 max-h-[60vh] overflow-auto rounded-2xl bg-black">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imgRef} src={imgSrc} alt="Crop" onLoad={onImageLoad} />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setImgSrc('')} className="rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all">
                Cancel
              </button>
              <button
                onClick={handleCropUpload}
                disabled={isPending || !completedCrop}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 active:scale-95"
              >
                {isVerified && <Save size={16} />} {isVerified ? 'Apply & Upload' : 'UPLOAD DISABLED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
