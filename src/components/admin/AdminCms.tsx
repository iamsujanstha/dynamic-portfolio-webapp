'use client';

import { FormEvent, useEffect, useMemo, useState, useTransition, useRef } from 'react';
import type { ReactNode } from 'react';
import { simulationService, SimKey } from '@/services/simulationService';
import { useSimulation } from '@/hooks/useSimulation';
import { CheckCircle2, FileUp, Plus, Save, Trash2, User, X, ExternalLink } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

type CmsMode = 'pages' | 'projects' | 'assets' | 'settings';

type Props = {
  mode: CmsMode;
  initialData: any;
};

const sectionTemplate = [
  {
    type: 'HERO',
    status: 'published',
    title: 'Senior Frontend Engineer',
    subtitle: 'Building fast, accessible web experiences.',
    order: 0,
    isActive: true,
    content: {},
  },
  {
    type: 'SKILLS_CLOUD',
    status: 'published',
    title: 'Tech Stack',
    order: 1,
    isActive: true,
    content: {
      skills: ['Next.js', 'TypeScript', 'MongoDB', 'Tailwind CSS'],
    },
  },
  {
    type: 'EXPERIENCE_TIMELINE',
    status: 'published',
    title: 'Experience',
    order: 2,
    isActive: true,
    content: {
      experiences: [
        {
          role: 'Frontend Engineer',
          company: 'Company Name',
          period: '2024 - Present',
          description: ['Built accessible, high-performance web interfaces.'],
        },
      ],
      education: [
        {
          id: 1,
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          period: '2016 - 2020',
        },
      ],
    },
  },
];

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

export function AdminCms({ mode, initialData }: Props) {
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
    // Try to load from service first
    const saved = getSimData<any>(key);
    if (saved) {
      setSimCache(prev => ({ ...prev, [mode]: saved }));
    } else if (!simCache[mode]) {
      setSimCache(prev => ({ ...prev, [mode]: initialData }));
    }
  }, [mode, initialData, key, getSimData]);

  const currentData = simCache[mode] || initialData;
  const handleUpdate = (newData: any) => {
    setSimCache(prev => ({ ...prev, [mode]: newData }));
    saveSimData(key, newData);
  };

  if (mode === 'pages') return <PagesCms initialPages={currentData} onUpdate={handleUpdate} />;
  if (mode === 'projects') return <ProjectsCms initialProjects={currentData} onUpdate={handleUpdate} />;
  if (mode === 'assets') return <AssetsCms initialAssets={currentData} onUpdate={handleUpdate} />;
  return <SettingsCms initialSettings={currentData} onUpdate={handleUpdate} />;
}

function CmsHeader({ title, description }: { title: string; description: string }) {
  const { isActive, resetSimulation } = useSimulation();

  function handleReset() {
    if (confirm('Are you sure you want to reset all simulated changes? This will restore data from the production database.')) {
      resetSimulation();
      window.location.reload();
    }
  }

  return (
    <div className="mb-8 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      <div className="flex gap-3">
        {isActive && (
          <>
            <button
              onClick={handleReset}
              className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 transition-all"
            >
              Reset Simulation
            </button>
            <Link 
              href="/" 
              target="_blank"
              className="rounded-lg border border-blue-500/30 bg-blue-500/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10 transition-all flex items-center gap-2"
            >
              View Changes <ExternalLink size={12} />
            </Link>
          </>
        )}
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

function PagesCms({ initialPages, onUpdate }: { initialPages: any[], onUpdate: (data: any[]) => void }) {
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
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  function choosePage(id: string) {
    setSelectedId(id);
    const page = pages.find((item) => item._id === id);
    setTitle(page?.title || '');
    setSlug(page?.slug || '');
    setStatus(page?.status || 'published');
    setDescription(page?.description || '');
    setSections(stringifyJson(page?.sections?.length ? page.sections : sectionTemplate));
    clearStatus();
  }

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
        onUpdate(next);
        setSelectedId(saved._id);
        setMessage('Page saved. Published sections will render on the site.');
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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">Content Management</h1>
          <p className="text-sm text-zinc-500">Manage your website sections and pages</p>
        </div>
        {isViewer && (
          <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20">
            Viewer Mode (Read Only)
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          <button
            onClick={() => choosePage('new')}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-zinc-800 p-4 text-xs font-bold text-zinc-500 hover:border-blue-500 hover:bg-blue-500/5 hover:text-blue-400 transition-all"
          >
            <Plus size={16} /> Create New Page
          </button>
          <div className="h-px bg-zinc-800 my-4" />
          {pages.map((page: any) => (
            <button
              key={page._id}
              onClick={() => choosePage(page._id)}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold transition-all ${selectedId === page._id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
            >
              <span className="truncate">{page.title}</span>
              <span className="text-[10px] opacity-50 font-black uppercase">{page.slug}</span>
            </button>
          ))}
        </div>

        <form onSubmit={save} className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Page Title">
              <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Home Page" />
            </Field>
            <Field label="URL Slug">
              <input className={inputClass} value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="home" />
            </Field>
          </div>
          <Field label="JSON Content (Sections)">
            <div className="relative group">
              <textarea
                className={`${inputClass} min-h-[500px] font-mono text-xs leading-relaxed text-blue-300/80 selection:bg-blue-500/30`}
                value={sections}
                onChange={(event) => setSections(event.target.value)}
                spellCheck={false}
              />
              <button
                type="button"
                onClick={prettify}
                className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
              >
                Prettify JSON
              </button>
            </div>
          </Field>
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex gap-3">
              <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
                <Save size={16} /> {isViewer ? 'Simulate Save' : 'Save Page'}
              </button>
              {selectedId !== 'new' && (
                <button type="button" onClick={() => removePage()} disabled={isPending} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50">
                  <Trash2 size={16} /> {isViewer ? 'Simulate Delete' : 'Delete'}
                </button>
              )}</div>
            <StatusDisplay />
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectsCms({ initialProjects, onUpdate }: { initialProjects: any[], onUpdate: (data: any[]) => void }) {
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);
  const [selectedId, setSelectedId] = useState(initialProjects[0]?._id || 'new');
  const selected = useMemo(() => projects.find((project) => project._id === selectedId), [projects, selectedId]);
  const [form, setForm] = useState({
    title: selected?.title || '',
    slug: selected?.slug || '',
    description: selected?.description || '',
    thumbnail: selected?.thumbnail || '',
    tags: selected?.tags?.join(', ') || '',
    github: selected?.links?.github || '',
    live: selected?.links?.live || '',
    featured: Boolean(selected?.featured),
  });
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  function update(key: string, value: string | boolean) {
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
      tags: project?.tags?.join(', ') || '',
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
        tags: splitCsv(form.tags),
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
          tags: splitCsv(form.tags),
          links: { github: form.github, live: form.live },
          featured: form.featured,
        };
        const isNew = selectedId === 'new';
        const saved = await request(isNew ? '/api/projects' : `/api/projects/${selectedId}`, {
          method: isNew ? 'POST' : 'PATCH',
          body: JSON.stringify(payload),
        });
        setProjects(isNew ? [saved, ...projects] : projects.map((project) => project._id === selectedId ? saved : project));
        setSelectedId(saved._id);
        setMessage('Project saved.');
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
      <CmsHeader title="Projects CMS" description="Manage portfolio project cards, tags, links, thumbnails, and featured status from MongoDB." />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <button onClick={() => chooseProject('new')} className="mb-3 flex w-full items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500">
            <Plus size={16} /> New Project
          </button>
          {projects.map((project) => (
            <button key={project._id} onClick={() => chooseProject(project._id)} className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm ${selectedId === project._id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-950'}`}>
              {project.title}
            </button>
          ))}
        </aside>
        <form onSubmit={save} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title"><input className={inputClass} value={form.title} onChange={(event) => update('title', event.target.value)} /></Field>
            <Field label="Slug"><input className={inputClass} value={form.slug} onChange={(event) => update('slug', event.target.value)} /></Field>
          </div>
          <Field label="Description"><textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => update('description', event.target.value)} /></Field>
          <Field label="Thumbnail URL"><input className={inputClass} value={form.thumbnail} onChange={(event) => update('thumbnail', event.target.value)} /></Field>
          <Field label="Tags"><input className={inputClass} value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="Next.js, MongoDB, Tailwind" /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="GitHub URL"><input className={inputClass} value={form.github} onChange={(event) => update('github', event.target.value)} /></Field>
            <Field label="Live URL"><input className={inputClass} value={form.live} onChange={(event) => update('live', event.target.value)} /></Field>
          </div>
          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} />
            Featured project
          </label>
          <div className="flex items-center gap-4 pt-2">
            <button disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
              <Save size={16} /> {isViewer ? 'Simulate Save' : 'Save Project'}
            </button>
            {selectedId !== 'new' && (
              <button type="button" onClick={removeProject} disabled={isPending} className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50">
                <Trash2 size={16} /> {isViewer ? 'Simulate Delete' : 'Delete'}
              </button>
            )}
          </div>
          <StatusDisplay />
        </form>
      </div>
    </>
  );
}

function AssetsCms({ initialAssets, onUpdate }: { initialAssets: any[], onUpdate: (data: any[]) => void }) {
  const [assets, setAssets] = useState(initialAssets);

  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isViewer) {
      setError('Viewer mode: assets cannot be uploaded.');
      return;
    }
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        setError('');
        const asset = await request('/api/assets/upload', { method: 'POST', body: formData });
        setAssets([asset, ...assets]);
        setMessage('Asset uploaded and registered.');
        (event.target as HTMLFormElement).reset();
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function simulateUpload(event: FormEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const name = formData.get('name') as string || 'Simulated Asset';
    const simulatedAsset = {
      _id: `sim-asset-${Date.now()}`,
      name,
      url: '/simulated-path.pdf',
      type: 'PDF',
      createdAt: new Date().toISOString()
    };
    const next = [simulatedAsset, ...assets];
    setAssets(next);
    onUpdate(next);
    setMessage('Simulation Mode: Asset registered locally.');
    (event.target as HTMLFormElement).reset();
  }

  return (
    <>
      <CmsHeader title="Assets / PDFs" description="Upload resume PDFs or image assets. Uploaded files are stored under `/public/uploads` and tracked in MongoDB." />
      <form onSubmit={isViewer ? simulateUpload : upload} className="mb-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <Field label="Display Name"><input name="name" className={inputClass} placeholder="Resume 2026" /></Field>
        <Field label="PDF or Image File"><input name="file" required type="file" accept="application/pdf,image/*" className={inputClass} /></Field>
        <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all">
          <FileUp size={16} /> {isViewer ? 'Simulate Upload' : 'Upload'}
        </button>
      </form>
      <StatusDisplay />
      <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
        {assets.map((asset) => (
          <div key={asset._id} className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900/60 px-5 py-4 last:border-b-0">
            <div>
              <p className="font-semibold text-white">{asset.name}</p>
              <a href={asset.url} target="_blank" className="text-sm text-blue-400 hover:text-blue-300">{asset.url}</a>
            </div>
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-400">{asset.type}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsCms({ initialSettings, onUpdate }: { initialSettings: any, onUpdate: (data: any) => void }) {
  const [form, setForm] = useState(initialSettings || {
    siteName: '',
    siteLogo: '',
    profilePicture: '',
    resumeUrl: '',
    contactEmail: '',
    contactNumber: '',
    location: '',
    github: '',
    linkedin: '',
    twitter: '',
    gaTrackingId: '',
    maintenanceMode: false,
    primaryColor: '#2563eb',
  });

  useEffect(() => {
    if (initialSettings) setForm(initialSettings);
  }, [initialSettings]);
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';

  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>();

  function update(key: string, value: string | boolean) {
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
            profilePicture: form.profilePicture,
            resumeUrl: form.resumeUrl,
            contactEmail: form.contactEmail,
            contactNumber: form.contactNumber,
            location: form.location,
            gaTrackingId: form.gaTrackingId,
            maintenanceMode: form.maintenanceMode,
            primaryColor: form.primaryColor,
            socialLinks: {
              github: form.github,
              linkedin: form.linkedin,
              twitter: form.twitter,
            },
          }),
        });
        setMessage('Settings saved.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">System Settings</h1>
          <p className="text-sm text-zinc-500">Global configurations for your portfolio</p>
        </div>
        {isViewer && (
          <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20">
            Viewer Mode (Read Only)
          </div>
        )}
      </div>

      <form onSubmit={save} className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <User size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">General Info</h2>
          </div>

          <Field label="Site Name">
            <input className={inputClass} value={form.siteName} onChange={(event) => update('siteName', event.target.value)} />
          </Field>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Primary Color">
              <div className="flex gap-2">
                <input type="color" className="h-11 w-11 shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 p-1" value={form.primaryColor} onChange={(event) => update('primaryColor', event.target.value)} />
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
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Phone Number">
                <input className={inputClass} value={form.contactNumber} onChange={(event) => update('contactNumber', event.target.value)} placeholder="+1 234 567 890" />
              </Field>
              <Field label="Location">
                <input className={inputClass} value={form.location} onChange={(event) => update('location', event.target.value)} placeholder="San Francisco, CA" />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <FileUp size={16} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">Brand Assets</h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <Field label="Profile Picture">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  {form.profilePicture ? (
                    <img src={form.profilePicture} alt="Profile" className="h-full w-full object-cover" />
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
            </div>

            <div className="space-y-6">
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
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between border-t border-zinc-800 pt-6">
          <button disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-black hover:bg-zinc-200 disabled:opacity-50 transition-all shadow-2xl active:scale-95">
            <CheckCircle2 size={16} /> {isViewer ? 'Simulate Save Settings' : 'Save All Settings'}
          </button>
          <StatusDisplay />
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
                <Save size={16} /> Apply & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
