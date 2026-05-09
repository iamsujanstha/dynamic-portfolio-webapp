'use client';

import { FormEvent, useEffect, useMemo, useState, useTransition, useRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileUp, Plus, Save, Trash2, X } from 'lucide-react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
  if (mode === 'pages') return <PagesCms initialPages={initialData} />;
  if (mode === 'projects') return <ProjectsCms initialProjects={initialData} />;
  if (mode === 'assets') return <AssetsCms initialAssets={initialData} />;
  return <SettingsCms initialSettings={initialData} />;
}

function CmsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8 flex items-start justify-between gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      <Link href="/admin" className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900">
        Dashboard
      </Link>
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

const inputClass = 'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500';

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

function PagesCms({ initialPages }: { initialPages: any[] }) {
  const [pages, setPages] = useState(initialPages);
  const [selectedId, setSelectedId] = useState(initialPages[0]?._id || 'new');
  const selected = pages.find((page) => page._id === selectedId);
  const [title, setTitle] = useState(selected?.title || 'Home');
  const [slug, setSlug] = useState(selected?.slug || 'index');
  const [status, setStatus] = useState(selected?.status || 'published');
  const [description, setDescription] = useState(selected?.description || '');
  const [sections, setSections] = useState(stringifyJson(selected?.sections?.length ? selected.sections : sectionTemplate));
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();

  function choosePage(id: string) {
    setSelectedId(id);
    const page = pages.find((item) => item._id === id);
    setTitle(page?.title || 'Home');
    setSlug(page?.slug || 'index');
    setStatus(page?.status || 'published');
    setDescription(page?.description || '');
    setSections(stringifyJson(page?.sections?.length ? page.sections : sectionTemplate));
    clearStatus();
  }

  function save(event: FormEvent) {
    event.preventDefault();
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

        setPages(isNew ? [saved, ...pages] : pages.map((page) => page._id === selectedId ? saved : page));
        setSelectedId(saved._id);
        setMessage('Page saved. Published sections will render on the site.');
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  function removePage() {
    if (selectedId === 'new') return;
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
    <>
      <CmsHeader title="Pages CMS" description="Create the MongoDB-backed pages and sections that Next.js renders. Use slug `index` for the home page." />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
          <button onClick={() => choosePage('new')} className="mb-3 flex w-full items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-left text-sm font-bold text-white hover:bg-blue-500">
            <Plus size={16} /> New Page
          </button>
          {pages.map((page) => (
            <button key={page._id} onClick={() => choosePage(page._id)} className={`mb-2 w-full rounded-lg px-4 py-3 text-left text-sm ${selectedId === page._id ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-950'}`}>
              <span className="block font-semibold">{page.title}</span>
              <span className="text-xs text-zinc-500">/{page.slug === 'index' ? '' : page.slug}</span>
            </button>
          ))}
        </aside>
        <form onSubmit={save} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Title"><input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
            <Field label="Slug"><input className={inputClass} value={slug} onChange={(event) => setSlug(event.target.value)} /></Field>
            <Field label="Status">
              <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>
          <Field label="SEO Description"><input className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} /></Field>
          <Field label="Sections JSON">
            <textarea className={`${inputClass} min-h-[420px] font-mono text-xs leading-5`} value={sections} onChange={(event) => setSections(event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-3">
            <button disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
              <Save size={16} /> Save Page
            </button>
            <button type="button" onClick={removePage} disabled={selectedId === 'new' || isPending} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-5 py-3 text-sm font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-40">
              <Trash2 size={16} /> Delete
            </button>
          </div>
          <StatusDisplay />
        </form>
      </div>
    </>
  );
}

function ProjectsCms({ initialProjects }: { initialProjects: any[] }) {
  const [projects, setProjects] = useState(initialProjects);
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
          <button disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
            <Save size={16} /> Save Project
          </button>
          <StatusDisplay />
        </form>
      </div>
    </>
  );
}

function AssetsCms({ initialAssets }: { initialAssets: any[] }) {
  const [assets, setAssets] = useState(initialAssets);
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();

  function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

  return (
    <>
      <CmsHeader title="Assets / PDFs" description="Upload resume PDFs or image assets. Uploaded files are stored under `/public/uploads` and tracked in MongoDB." />
      <form onSubmit={upload} className="mb-8 grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <Field label="Display Name"><input name="name" className={inputClass} placeholder="Resume 2026" /></Field>
        <Field label="PDF or Image File"><input name="file" required type="file" accept="application/pdf,image/*" className={inputClass} /></Field>
        <button disabled={isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
          <FileUp size={16} /> Upload
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

function SettingsCms({ initialSettings }: { initialSettings: any }) {
  const [form, setForm] = useState({
    siteName: initialSettings?.siteName || '',
    siteLogo: initialSettings?.siteLogo || '',
    profilePicture: initialSettings?.profilePicture || '',
    resumeUrl: initialSettings?.resumeUrl || '',
    contactEmail: initialSettings?.contactEmail || '',
    contactNumber: initialSettings?.contactNumber || '',
    location: initialSettings?.location || '',
    github: initialSettings?.socialLinks?.github || '',
    linkedin: initialSettings?.socialLinks?.linkedin || '',
    twitter: initialSettings?.socialLinks?.twitter || '',
    gaTrackingId: initialSettings?.gaTrackingId || '',
    maintenanceMode: Boolean(initialSettings?.maintenanceMode),
  });
  const { setMessage, setError, clearStatus, StatusDisplay } = useStatusMessage();
  const [isPending, startTransition] = useTransition();

  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>();

  function update(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); 
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 4 / 5, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  async function handleCropUpload() {
    if (!completedCrop || !imgRef.current) return;
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
    <>
      <CmsHeader title="Settings CMS" description="Manage site profile data, social links, analytics, and global toggles stored in MongoDB." />
      <form onSubmit={save} className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Site Name"><input className={inputClass} value={form.siteName} onChange={(event) => update('siteName', event.target.value)} /></Field>
          <Field label="Contact Email"><input className={inputClass} value={form.contactEmail} onChange={(event) => update('contactEmail', event.target.value)} /></Field>
          <Field label="Contact Number"><input className={inputClass} value={form.contactNumber} onChange={(event) => update('contactNumber', event.target.value)} /></Field>
        </div>
        <Field label="Location"><input className={inputClass} value={form.location} onChange={(event) => update('location', event.target.value)} /></Field>
        
        <div className="grid gap-4 md:grid-cols-2 items-end">
          <Field label="Profile Picture (Upload & Crop)">
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1`} value={form.profilePicture} onChange={(event) => update('profilePicture', event.target.value)} placeholder="/uploads/..." />
              <label className="cursor-pointer flex items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500">
                <FileUp size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={onSelectFile} disabled={isPending} />
              </label>
            </div>
          </Field>
          <Field label="Resume (Upload PDF)">
            <div className="flex gap-2">
              <input className={`${inputClass} flex-1`} value={form.resumeUrl} onChange={(event) => update('resumeUrl', event.target.value)} placeholder="/uploads/..." />
              <label className="cursor-pointer flex items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500">
                <FileUp size={16} />
                <input type="file" accept="application/pdf" className="hidden" onChange={handleResumeUpload} disabled={isPending} />
              </label>
            </div>
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="GitHub"><input className={inputClass} value={form.github} onChange={(event) => update('github', event.target.value)} /></Field>
          <Field label="LinkedIn"><input className={inputClass} value={form.linkedin} onChange={(event) => update('linkedin', event.target.value)} /></Field>
          <Field label="Twitter"><input className={inputClass} value={form.twitter} onChange={(event) => update('twitter', event.target.value)} /></Field>
        </div>
        <Field label="GA Tracking ID"><input className={inputClass} value={form.gaTrackingId} onChange={(event) => update('gaTrackingId', event.target.value)} /></Field>
        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input type="checkbox" checked={form.maintenanceMode} onChange={(event) => update('maintenanceMode', event.target.checked)} />
          Maintenance mode
        </label>
        <button disabled={isPending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50">
          <CheckCircle2 size={16} /> Save Settings
        </button>
        <StatusDisplay />
      </form>

      {/* Cropper Modal */}
      {imgSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-6 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Crop Profile Picture</h3>
              <button onClick={() => setImgSrc('')} className="text-zinc-400 hover:text-white p-2">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-black/50 rounded-xl border border-zinc-800 flex items-center justify-center">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={4 / 5}
                className="max-h-[60vh]"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => setImgSrc('')} className="px-5 py-3 text-sm font-bold text-zinc-300 hover:text-white">
                Cancel
              </button>
              <button 
                onClick={handleCropUpload} 
                disabled={isPending || !completedCrop} 
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
              >
                <Save size={16} /> Upload Cropped Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
