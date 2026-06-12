'use client';

import React, { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Download, Save, ChevronDown, ChevronUp,
  User, Briefcase, GraduationCap, Wrench, FileText,
  Loader2, Eye, RefreshCw, Sliders, RotateCcw, BookmarkCheck, ShieldAlert,
  GripVertical,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { saveResumeAction } from '@/src/app/actions/resume';
import { DEFAULT_RESUME_DATA } from '@/src/types/resume';
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeSkillGroup } from '@/src/types/resume';
import {
  DEFAULT_STYLE, FONT_LABELS,
  type ResumeStyleConfig, type ResumeFont,
} from './resume-style.config';

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/40 transition-colors';
const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1';
const selectCls = `${inputCls} cursor-pointer`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function SectionAccordion({ title, icon: Icon, badge, defaultOpen = false, children }: {
  title: string; icon: React.ElementType; badge?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <Icon size={14} className="text-blue-400" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">{title}</span>
          {badge && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400">{badge}</span>}
        </div>
        {open ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
      </button>
      {open && <div className="px-4 pb-4 pt-2 space-y-4 border-t border-zinc-800">{children}</div>}
    </div>
  );
}

// ── Slider control ────────────────────────────────────────────────────────────
function SliderField({
  label, value, min, max, step = 0.5, unit = 'pt',
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className={labelCls}>{label}</label>
        <span className="text-[10px] font-mono text-zinc-400">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer bg-zinc-800"
      />
    </div>
  );
}

// ── Color picker field ────────────────────────────────────────────────────────
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex gap-2 items-center">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 cursor-pointer flex-shrink-0" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className={`${inputCls} font-mono uppercase text-xs`} placeholder="#000000" />
      </div>
    </div>
  );
}

function nanoid() { return Math.random().toString(36).slice(2, 9); }

// ── PDF Preview (iframe + blob URL, debounced) ────────────────────────────────
function PdfPreviewPanel({ data, style }: { data: ResumeData; style: ResumeStyleConfig }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  const regenerate = useCallback(async (d: ResumeData, st: ResumeStyleConfig) => {
    setIsRendering(true);
    try {
      const { generateResumePdfBlob } = await import('./generateResumePdf');
      const blob = await generateResumePdfBlob(d, st);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
    } catch (e) { console.error('PDF render error', e); }
    finally { setIsRendering(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => regenerate(data, style), 700);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [data, style, regenerate]);

  useEffect(() => () => { if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current); }, []);

  return (
    <div className="relative flex-1 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <Eye size={14} className="text-blue-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Preview — {style.pageSize || 'LETTER'}</span>
        {isRendering && (
          <span className="ml-2 flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
            <RefreshCw size={11} className="animate-spin" /> Rendering…
          </span>
        )}
        <span className="ml-auto text-[10px] text-zinc-600 font-mono">Updates after typing stops</span>
      </div>
      <div className="flex-1 relative">
        {blobUrl
          ? <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-0" title="Resume Preview" />
          : <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest">Generating preview…</p>
          </div>
        }
        {isRendering && blobUrl && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <RefreshCw size={13} className="animate-spin text-blue-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Style controls panel ──────────────────────────────────────────────────────
const STYLE_STORAGE_KEY = 'resume-style-config-v1';

function saveStyleToStorage(s: ResumeStyleConfig) {
  try { localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(s)); } catch { }
}
function loadStyleFromStorage(): ResumeStyleConfig | null {
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function StylePanel({
  style, onChange, onReset, onSetDefault, defaultStatus,
}: {
  style: ResumeStyleConfig;
  onChange: <K extends keyof ResumeStyleConfig>(key: K, value: ResumeStyleConfig[K]) => void;
  onReset: () => void;
  onSetDefault: () => void;
  defaultStatus: 'idle' | 'saved';
}) {
  const { data: session } = useSession();
  const isViewer = (session?.user as any)?.role === 'VIEWER';
  const set = <K extends keyof ResumeStyleConfig>(key: K) =>
    (value: ResumeStyleConfig[K]) => onChange(key, value);

  return (
    <div className="space-y-5 px-4">
      {/* Actions row */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Style Defaults</span>
          <span className="text-[9px] text-zinc-600">Saved settings load automatically next session</span>
        </div>
        <div className="flex items-center gap-2">
          {/* <button type="button" onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all">
            <RotateCcw size={11} /> Reset
          </button> */}
          <button type="button" onClick={onSetDefault}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${defaultStatus === 'saved'
              ? 'bg-emerald-600 text-white border border-emerald-500 shadow-lg shadow-emerald-600/20'
              : 'bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/30 hover:border-blue-400'
              }`}
            disabled={isViewer}
          >
            {defaultStatus === 'saved'
              ? <><BookmarkCheck size={11} /> Saved as Default!</>
              : <><BookmarkCheck size={11} /> Set as Default</>
            }
          </button>
        </div>
      </div>

      {/* ── Dropdown Controls (comes first) ─────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-1">Layout & Typography Options</p>
        <Field label="Page Size">
          <select className={selectCls} value={style.pageSize || 'LETTER'}
            onChange={e => onChange('pageSize', e.target.value as 'A4' | 'LETTER')}>
            <option value="A4">A4</option>
            <option value="LETTER">US Letter</option>
          </select>
        </Field>
        <Field label="Name Font Family">
          <select className={selectCls} value={style.nameFont} onChange={e => onChange('nameFont', e.target.value as ResumeFont)}>
            {FONT_LABELS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Name Style">
          <select className={selectCls} value={style.nameStyle}
            onChange={e => onChange('nameStyle', e.target.value as ResumeStyleConfig['nameStyle'])}>
            <option value="normal">Centered (no rules)</option>
            <option value="flanked-rules">Flanked by rules ——NAME——</option>
          </select>
        </Field>
        <Field label="Body Font Family">
          <select className={selectCls} value={style.font} onChange={e => onChange('font', e.target.value as ResumeFont)}>
            {FONT_LABELS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Bullet Character">
          <select className={selectCls} value={style.bulletChar}
            onChange={e => onChange('bulletChar', e.target.value as ResumeStyleConfig['bulletChar'])}>
            <option value="filled-circle">● Filled Circle</option>
            <option value="hollow-circle">◦ Hollow Circle</option>
            <option value="dash">– Dash</option>
            <option value="arrow">› Arrow</option>
            <option value="square">▪ Square</option>
          </select>
        </Field>
        <div className="flex items-center justify-between py-2 border-t border-zinc-800/40">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Show Tech Stack</span>
          <button
            type="button"
            onClick={() => onChange('showTechStack', !style.showTechStack)}
            className="focus:outline-none"
            aria-label="Toggle show tech stack"
          >
            <div className={`w-9 h-5 rounded-full transition-colors relative ${style.showTechStack ? 'bg-blue-600' : 'bg-zinc-800'}`}>
              <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-zinc-400 transition-transform ${style.showTechStack ? 'translate-x-4 bg-white' : 'translate-x-0'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Name Header Settings ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Name Header Settings</p>
        <SliderField label="Name Font Size" value={style.nameFontSize} min={16} max={32} step={1}
          onChange={set('nameFontSize')} />
        <SliderField label="Letter Spacing" value={style.nameLetterSpacing} min={0} max={4} step={0.2}
          onChange={set('nameLetterSpacing')} />
      </div>

      {/* ── Divider Lines ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Divider Lines</p>
        <SliderField label="Line Thickness" value={style.ruleWidth} min={0.25} max={2.5} step={0.25}
          onChange={set('ruleWidth')} />
        <ColorField label="Line Color" value={style.ruleColor} onChange={set('ruleColor')} />
      </div>

      {/* ── Contact Info Spacing ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Contact Info Spacing</p>
        <SliderField label="Contact Item Gap" value={style.contactItemGap} min={0} max={12} step={0.5}
          onChange={set('contactItemGap')} />
        <SliderField label="Contact Bullet Gap" value={style.contactBulletGap} min={0} max={6} step={0.5}
          onChange={set('contactBulletGap')} />
      </div>

      {/* ── Typography (Body) ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Typography (Body)</p>
        <SliderField label="Base Font Size" value={style.baseFontSize} min={8} max={13} step={0.5}
          onChange={set('baseFontSize')} />
        <SliderField label="Line Height" value={style.lineHeight} min={1.1} max={1.8} step={0.05} unit="×"
          onChange={set('lineHeight')} />
        <SliderField label="Body Letter Spacing" value={style.bodyLetterSpacing} min={-0.5} max={2.0} step={0.05}
          onChange={set('bodyLetterSpacing')} />
      </div>

      {/* ── Page Margins ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Page Margins</p>
        <SliderField label="Left & Right Margin" value={style.marginH} min={10} max={72}
          onChange={set('marginH')} />
        <div className="grid grid-cols-2 gap-3">
          <SliderField label="Top Margin" value={style.marginTop} min={10} max={56}
            onChange={set('marginTop')} />
          <SliderField label="Bottom Margin" value={style.marginBottom} min={10} max={48}
            onChange={set('marginBottom')} />
        </div>
      </div>

      {/* ── Content & Spacing (Lists, Sections) ───────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Lists & Section Spacing</p>
        <SliderField label="List Bullet → Text Space" value={style.bulletTextSpace} min={8} max={24} step={1}
          onChange={set('bulletTextSpace')} />
        <SliderField label="Gap Between Bullets" value={style.bulletGap} min={0} max={8}
          onChange={set('bulletGap')} />
        <SliderField label="Gap Between Sections" value={style.sectionGap} min={2} max={16}
          onChange={set('sectionGap')} />
        <SliderField label="Gap Between Companies" value={style.entryGap} min={2} max={14}
          onChange={set('entryGap')} />
      </div>

      {/* ── Colors ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <p className="text-[12px] font-black uppercase tracking-widest text-zinc-300 border-b border-zinc-800 pb-1">Colors</p>
        <ColorField label="Link / Accent Color" value={style.linkColor} onChange={set('linkColor')} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ResumeEditor({ initialData, initialStyle }: { initialData?: Partial<ResumeData>; initialStyle?: Partial<ResumeStyleConfig> }) {
  const [data, setData] = useState<ResumeData>({
    ...DEFAULT_RESUME_DATA, ...initialData,
    contact: { ...DEFAULT_RESUME_DATA.contact, ...(initialData?.contact ?? {}) },
  });
  const [style, setStyle] = useState<ResumeStyleConfig>(() => {
    if (initialStyle) return { ...DEFAULT_STYLE, ...initialStyle };
    return DEFAULT_STYLE;
  });
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  const [draggedBullet, setDraggedBullet] = useState<{ expId: string; index: number } | null>(null);
  const [dragEnabled, setDragEnabled] = useState(false);

  const handleDragStart = (e: React.DragEvent, expId: string, index: number) => {
    setDraggedBullet({ expId, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, expId: string, index: number) => {
    e.preventDefault();
    if (!draggedBullet) return;
    if (draggedBullet.expId !== expId) return;
    if (draggedBullet.index === index) return;

    setData(d => {
      const experience = d.experience.map(exp => {
        if (exp.id !== expId) return exp;
        const bullets = [...exp.bullets];
        const draggedItem = bullets[draggedBullet.index];
        bullets.splice(draggedBullet.index, 1);
        bullets.splice(index, 0, draggedItem);
        return { ...exp, bullets };
      });
      return { ...d, experience };
    });

    setDraggedBullet({ expId, index });
  };

  const handleDragEnd = () => {
    setDraggedBullet(null);
  };
  useEffect(() => {
    // If db style exists, prioritize it. Otherwise, load local storage style.
    if (initialStyle) {
      setStyle(s => ({ ...DEFAULT_STYLE, ...initialStyle }));
    } else {
      const saved = loadStyleFromStorage();
      if (saved) setStyle(s => ({ ...DEFAULT_STYLE, ...saved }));
    }
    setMounted(true);
  }, [initialStyle]);

  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role !== 'VIEWER';

  const [setDefaultStatus, setSetDefaultStatus] = useState<'idle' | 'saved'>('idle');

  function handleSetDefault() {
    saveStyleToStorage(style);
    setSetDefaultStatus('saved');
    setTimeout(() => setSetDefaultStatus('idle'), 2000);
  }

  const setStyle$ = useCallback(
    <K extends keyof ResumeStyleConfig>(key: K, value: ResumeStyleConfig[K]) =>
      setStyle(s => ({ ...s, [key]: value })),
    [],
  );

  const set = useCallback(<K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
    setData(d => ({ ...d, [key]: value })), []);

  const setContact = useCallback((key: keyof ResumeData['contact'], value: string) =>
    setData(d => ({ ...d, contact: { ...d.contact, [key]: value } })), []);

  // ── Experience ────────────────────────────────────────────────────────────
  function addExp() {
    setData(d => ({ ...d, experience: [...d.experience, { id: nanoid(), company: '', startDate: '', endDate: 'Present', role: '', bullets: [''], techStack: '' } as ResumeExperience] }));
  }
  function updateExp(id: string, key: keyof ResumeExperience, value: string | string[]) {
    setData(d => ({ ...d, experience: d.experience.map(e => e.id === id ? { ...e, [key]: value } : e) }));
  }
  function updateBullet(expId: string, idx: number, value: string) {
    setData(d => ({ ...d, experience: d.experience.map(e => { if (e.id !== expId) return e; const b = [...e.bullets]; b[idx] = value; return { ...e, bullets: b }; }) }));
  }
  function addBullet(expId: string) {
    setData(d => ({ ...d, experience: d.experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e) }));
  }
  function removeBullet(expId: string, idx: number) {
    setData(d => ({ ...d, experience: d.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e) }));
  }
  function removeExp(id: string) {
    setData(d => ({ ...d, experience: d.experience.filter(e => e.id !== id) }));
  }

  // ── Education ─────────────────────────────────────────────────────────────
  function addEdu() {
    setData(d => ({ ...d, education: [...d.education, { id: nanoid(), institution: '', location: '', startDate: '', endDate: '', degree: '' } as ResumeEducation] }));
  }
  function updateEdu(id: string, key: keyof ResumeEducation, value: string) {
    setData(d => ({ ...d, education: d.education.map(e => e.id === id ? { ...e, [key]: value } : e) }));
  }
  function removeEdu(id: string) {
    setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  function addSkillGroup() {
    setData(d => ({ ...d, skillGroups: [...d.skillGroups, { id: nanoid(), category: '', skills: '' } as ResumeSkillGroup] }));
  }
  function updateSkillGroup(id: string, key: keyof ResumeSkillGroup, value: string) {
    setData(d => ({ ...d, skillGroups: d.skillGroups.map(sg => sg.id === id ? { ...sg, [key]: value } : sg) }));
  }
  function removeSkillGroup(id: string) {
    setData(d => ({ ...d, skillGroups: d.skillGroups.filter(sg => sg.id !== id) }));
  }

  // ── Download ──────────────────────────────────────────────────────────────
  async function handleDownload() {
    try {
      const { generateResumePdfBlob } = await import('./generateResumePdf');
      const blob = await generateResumePdfBlob(data, style);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${data.name.replace(/\s+/g, '_')}_Resume.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { console.error(e); }
  }

  // ── Save to site ──────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveStatus('saving');
    startTransition(async () => {
      try {
        const { generateResumePdfBlob } = await import('./generateResumePdf');
        const blob = await generateResumePdfBlob(data, style);
        const formData = new FormData();
        formData.append('file', blob, 'resume.pdf');
        formData.append('name', 'Active Resume');

        // Invoke the Server Action to handle upload and settings persistence server-side
        const result = await saveResumeAction(formData, data, style);
        if (!result.success) throw new Error(result.error);

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        console.error(err);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Resume Editor
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Edit content · tweak style · preview live.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={() => setShowPreview(p => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all lg:hidden">
            <Eye size={14} /> {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          {/* Download — admin only */}
          <div className="relative group/download">
            <button
              type="button"
              onClick={isAdmin ? handleDownload : undefined}
              disabled={!isAdmin}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isAdmin
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
            >
              {!isAdmin ? (
                <><ShieldAlert size={14} className="text-amber-500" /> Download</>
              ) : (
                <><Download size={14} /> Download</>
              )}
            </button>

            {/* Tooltip shown only for non-admins */}
            {!isAdmin && (
              <div className="absolute right-0 top-full mt-2 w-56 pointer-events-none opacity-0 group-hover/download:opacity-100 transition-opacity duration-200 z-50">
                <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3 shadow-xl">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Admin Only</p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Downloading the resume requires admin access.
                      </p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-1.5 right-5 w-3 h-3 bg-zinc-900 border-l border-t border-amber-500/30 rotate-45" />
                </div>
              </div>
            )}
          </div>


          {/* Save to Site — admin only */}
          <div className="relative group/save">
            <button
              type="button"
              onClick={isAdmin ? handleSave : undefined}
              disabled={!isAdmin || saveStatus === 'saving' || isPending}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isAdmin
                ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed'
                : saveStatus === 'saved' ? 'bg-emerald-600 text-white'
                  : saveStatus === 'error' ? 'bg-red-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
            >
              {!isAdmin ? (
                <><ShieldAlert size={14} className="text-amber-500" /> Save to Site</>
              ) : saveStatus === 'saving' ? (
                <><Loader2 size={14} className="animate-spin" /> Saving…</>
              ) : saveStatus === 'saved' ? (
                <><Save size={14} /> Saved!</>
              ) : saveStatus === 'error' ? (
                'Error — retry'
              ) : (
                <><Save size={14} /> Save to Site</>
              )}
            </button>

            {/* Tooltip shown only for non-admins */}
            {!isAdmin && (
              <div className="absolute right-0 top-full mt-2 w-56 pointer-events-none opacity-0 group-hover/save:opacity-100 transition-opacity duration-200 z-50">
                <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3 shadow-xl">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-1">Admin Only</p>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Saving to the site requires admin access. You can still download the PDF locally.
                      </p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-1.5 right-5 w-3 h-3 bg-zinc-900 border-l border-t border-amber-500/30 rotate-45" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-4 w-fit">
        {(['content', 'style'] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
              ? 'bg-zinc-700 text-white shadow'
              : 'text-zinc-500 hover:text-zinc-300'
              }`}>
            {tab === 'content' ? <FileText size={13} /> : <Sliders size={13} />}
            {tab === 'content' ? 'Content' : 'Style'}
          </button>
        ))}
      </div>

      {/* ── Split pane ── */}
      <div className="flex gap-6 flex-1 min-h-0">

        {/* LEFT — sidebar */}
        <div className={`w-full lg:w-[420px] xl:w-[460px] shrink-0 overflow-y-auto space-y-3 pr-1 pb-8 ${showPreview ? 'hidden lg:block' : 'block'}`}>

          {/* ── STYLE TAB ── */}
          {activeTab === 'style' && (
            <StylePanel style={style} onChange={setStyle$} onReset={() => { setStyle(DEFAULT_STYLE); saveStyleToStorage(DEFAULT_STYLE); }} onSetDefault={handleSetDefault} defaultStatus={setDefaultStatus} />
          )}

          {/* ── CONTENT TAB ── */}
          {activeTab === 'content' && (
            <>
              <SectionAccordion title="Personal" icon={User} defaultOpen>
                <Field label="Full Name">
                  <input className={inputCls} value={data.name} onChange={e => set('name', e.target.value)} placeholder="SUJAN SHRESTHA" />
                </Field>
                <Field label="Summary">
                  <textarea className={`${inputCls} resize-none min-h-[80px] py-2`} value={data.summary}
                    onChange={e => set('summary', e.target.value)} placeholder="Professional summary…" />
                </Field>
              </SectionAccordion>

              <SectionAccordion title="Contact" icon={User} defaultOpen>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    ['phone', 'Phone'], ['location', 'Location'], ['email', 'Email'],
                    ['portfolioLabel', 'Portfolio Label'], ['githubLabel', 'GitHub Label'], ['linkedinLabel', 'LinkedIn Label'],
                  ] as const).map(([k, lbl]) => (
                    <Field key={k} label={lbl}>
                      <input className={inputCls} value={data.contact[k]} onChange={e => setContact(k, e.target.value)} placeholder={lbl} />
                    </Field>
                  ))}
                </div>
                <div className="pt-2 border-t border-zinc-800 space-y-3">
                  <p className={labelCls + ' mb-1'}>Link URLs</p>
                  {([['portfolioUrl', 'Portfolio URL'], ['githubUrl', 'GitHub URL'], ['linkedinUrl', 'LinkedIn URL']] as const).map(([k, lbl]) => (
                    <Field key={k} label={lbl}>
                      <input className={inputCls} value={data.contact[k]} onChange={e => setContact(k, e.target.value)} placeholder="https://…" />
                    </Field>
                  ))}
                </div>
              </SectionAccordion>

              <SectionAccordion title="Experience" icon={Briefcase} defaultOpen>
                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entry {idx + 1}</span>
                      <button type="button" onClick={() => removeExp(exp.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"><Trash2 size={13} /></button>
                    </div>
                    <Field label="Company"><input className={inputCls} value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} /></Field>
                    <Field label="Role / Title"><input className={inputCls} value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start"><input className={inputCls} value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} placeholder="09/2023" /></Field>
                      <Field label="End"><input className={inputCls} value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} placeholder="Present" /></Field>
                    </div>
                    <div>
                      <label className={labelCls}>Bullet Points</label>
                      <div className="space-y-2">
                        {exp.bullets.map((b, bi) => (
                          <div
                            key={bi}
                            draggable={dragEnabled}
                            onDragStart={e => handleDragStart(e, exp.id, bi)}
                            onDragOver={e => handleDragOver(e, exp.id, bi)}
                            onDragEnd={handleDragEnd}
                            className={`flex gap-2 items-start transition-all duration-150 rounded-lg p-1 -mx-1 border ${draggedBullet?.expId === exp.id && draggedBullet?.index === bi
                              ? 'opacity-40 bg-blue-950/20 border-dashed border-blue-500/30'
                              : 'border-transparent'
                              }`}
                          >
                            <div
                              onMouseEnter={() => setDragEnabled(true)}
                              onMouseLeave={() => setDragEnabled(false)}
                              className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-600 hover:text-zinc-300 rounded hover:bg-zinc-800 shrink-0 mt-1"
                            >
                              <GripVertical size={13} />
                            </div>
                            <textarea className={`${inputCls} resize-none py-1.5 text-xs flex-1`} rows={4} value={b}
                              onChange={e => updateBullet(exp.id, bi, e.target.value)} placeholder="Achievement…" />
                            <button type="button" onClick={() => removeBullet(exp.id, bi)} className="mt-1 p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"><Trash2 size={12} /></button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => addBullet(exp.id)} className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Plus size={11} /> Add bullet
                      </button>
                    </div>
                    <div>
                      <label className={labelCls}>Tech Stack</label>
                      <div className="w-full flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/40 transition-all min-h-[38px]">
                        {(exp.techStack ? exp.techStack.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag, tagIdx) => (
                          <span key={tagIdx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm shadow-blue-500/5 hover:bg-blue-500/20 transition-all">
                            {tag}
                            <button
                              type="button"
                              onClick={() => {
                                const tags = exp.techStack ? exp.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
                                const newTags = tags.filter((_, i) => i !== tagIdx);
                                updateExp(exp.id, 'techStack', newTags.join(', '));
                              }}
                              className="text-zinc-500 hover:text-red-400 font-extrabold cursor-pointer transition-colors"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          className="flex-1 min-w-[100px] bg-transparent border-0 p-0 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-0"
                          placeholder={(exp.techStack ? exp.techStack.split(',').map(t => t.trim()).filter(Boolean) : []).length === 0 ? "React, TypeScript, Next.js..." : "Add tech..."}
                          onKeyDown={e => {
                            if (e.key === ',' || e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const currentTags = exp.techStack ? exp.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
                                const newItems = val.split(',').map(item => item.trim()).filter(Boolean);
                                const newTags = [...currentTags, ...newItems];
                                updateExp(exp.id, 'techStack', newTags.join(', '));
                              }
                              e.currentTarget.value = '';
                            } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
                              const currentTags = exp.techStack ? exp.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
                              if (currentTags.length > 0) {
                                const newTags = currentTags.slice(0, -1);
                                updateExp(exp.id, 'techStack', newTags.join(', '));
                              }
                            }
                          }}
                          onBlur={e => {
                            const val = e.currentTarget.value.trim();
                            if (val) {
                              const currentTags = exp.techStack ? exp.techStack.split(',').map(t => t.trim()).filter(Boolean) : [];
                              const newItems = val.split(',').map(item => item.trim()).filter(Boolean);
                              const newTags = [...currentTags, ...newItems];
                              updateExp(exp.id, 'techStack', newTags.join(', '));
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addExp} className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Plus size={13} /> Add Experience
                </button>
              </SectionAccordion>

              <SectionAccordion title="Education" icon={GraduationCap}>
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entry {idx + 1}</span>
                      <button type="button" onClick={() => removeEdu(edu.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"><Trash2 size={13} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Institution"><input className={inputCls} value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} /></Field>
                      <Field label="Location"><input className={inputCls} value={edu.location} onChange={e => updateEdu(edu.id, 'location', e.target.value)} placeholder="Chennai, India" /></Field>
                      <Field label="Start"><input className={inputCls} value={edu.startDate} onChange={e => updateEdu(edu.id, 'startDate', e.target.value)} placeholder="2014" /></Field>
                      <Field label="End"><input className={inputCls} value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} placeholder="2018" /></Field>
                    </div>
                    <Field label="Degree"><input className={inputCls} value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Engineering…" /></Field>
                  </div>
                ))}
                <button type="button" onClick={addEdu} className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Plus size={13} /> Add Education
                </button>
              </SectionAccordion>

              <SectionAccordion title="Skills & Others" icon={Wrench}>
                {data.skillGroups.map((sg, idx) => (
                  <div key={sg.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Group {idx + 1}</span>
                      <button type="button" onClick={() => removeSkillGroup(sg.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"><Trash2 size={13} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Category"><input className={inputCls} value={sg.category} onChange={e => updateSkillGroup(sg.id, 'category', e.target.value)} placeholder="Frontend" /></Field>
                      <div>
                        <label className={labelCls}>Skills</label>
                        <div className="w-full flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600/40 transition-all min-h-[38px]">
                          {(sg.skills ? sg.skills.split(',').map(t => t.trim()).filter(Boolean) : []).map((tag, tagIdx) => (
                            <span key={tagIdx} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm shadow-purple-500/5 hover:bg-purple-500/20 transition-all">
                              {tag}
                              <button
                                type="button"
                                onClick={() => {
                                  const tags = sg.skills ? sg.skills.split(',').map(t => t.trim()).filter(Boolean) : [];
                                  const newTags = tags.filter((_, i) => i !== tagIdx);
                                  updateSkillGroup(sg.id, 'skills', newTags.join(', '));
                                }}
                                className="text-zinc-500 hover:text-red-400 font-extrabold cursor-pointer transition-colors"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            className="flex-1 min-w-[80px] bg-transparent border-0 p-0 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-0"
                            placeholder={(sg.skills ? sg.skills.split(',').map(t => t.trim()).filter(Boolean) : []).length === 0 ? "React, TypeScript..." : "Add..."}
                            onKeyDown={e => {
                              if (e.key === ',' || e.key === 'Enter') {
                                e.preventDefault();
                                const val = e.currentTarget.value.trim();
                                if (val) {
                                  const currentTags = sg.skills ? sg.skills.split(',').map(t => t.trim()).filter(Boolean) : [];
                                  const newItems = val.split(',').map(item => item.trim()).filter(Boolean);
                                  const newTags = [...currentTags, ...newItems];
                                  updateSkillGroup(sg.id, 'skills', newTags.join(', '));
                                }
                                e.currentTarget.value = '';
                              } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
                                const currentTags = sg.skills ? sg.skills.split(',').map(t => t.trim()).filter(Boolean) : [];
                                if (currentTags.length > 0) {
                                  const newTags = currentTags.slice(0, -1);
                                  updateSkillGroup(sg.id, 'skills', newTags.join(', '));
                                }
                              }
                            }}
                            onBlur={e => {
                              const val = e.currentTarget.value.trim();
                              if (val) {
                                const currentTags = sg.skills ? sg.skills.split(',').map(t => t.trim()).filter(Boolean) : [];
                                const newItems = val.split(',').map(item => item.trim()).filter(Boolean);
                                const newTags = [...currentTags, ...newItems];
                                updateSkillGroup(sg.id, 'skills', newTags.join(', '));
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addSkillGroup} className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                  <Plus size={13} /> Add Skill Group
                </button>
              </SectionAccordion>
            </>
          )}
        </div>

        {/* RIGHT — preview */}
        {mounted ? (
          <div className={`flex-1 min-w-0 flex flex-col ${showPreview ? 'flex' : 'hidden lg:flex'}`}>
            <PdfPreviewPanel data={data} style={style} />
          </div>
        ) : (
          <div className="flex-1 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center gap-4 text-zinc-600">
            <FileText size={40} />
            <p className="text-xs font-mono uppercase tracking-widest">Loading editor…</p>
          </div>
        )}
      </div>
    </div>
  );
}
