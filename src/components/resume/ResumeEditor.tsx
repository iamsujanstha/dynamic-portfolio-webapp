'use client';

import React, { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Download, Save, ChevronDown, ChevronUp,
  User, Briefcase, GraduationCap, Wrench, FileText, Loader2, Eye, RefreshCw,
} from 'lucide-react';
import { DEFAULT_RESUME_DATA } from '@/src/types/resume';
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeSkillGroup } from '@/src/types/resume';

// ── Shared UI helpers ─────────────────────────────────────────────────────────
const inputCls = 'w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/40 transition-colors';
const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function SectionAccordion({ title, icon: Icon, defaultOpen = false, children }: {
  title: string; icon: React.ElementType; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-2.5">
          <Icon size={14} className="text-blue-400" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">{title}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-4 border-t border-zinc-800">{children}</div>}
    </div>
  );
}

function nanoid() { return Math.random().toString(36).slice(2, 9); }

// ── PDF Preview (iframe + blob URL, debounced) ────────────────────────────────
function PdfPreviewPanel({ data }: { data: ResumeData }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  const regenerate = useCallback(async (d: ResumeData) => {
    setIsRendering(true);
    try {
      const { generateResumePdfBlob } = await import('./generateResumePdf');
      const blob = await generateResumePdfBlob(d);
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
    } catch (e) {
      console.error('PDF render error', e);
    } finally {
      setIsRendering(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => regenerate(data), 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [data, regenerate]);

  useEffect(() => {
    return () => { if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current); };
  }, []);

  return (
    <div className="relative flex-1 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <Eye size={14} className="text-blue-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Live Preview — A4</span>
        {isRendering && (
          <span className="ml-2 flex items-center gap-1.5 text-[10px] text-zinc-600 font-mono">
            <RefreshCw size={11} className="animate-spin" /> Rendering…
          </span>
        )}
        <span className="ml-auto text-[10px] text-zinc-600 font-mono">Updates after typing stops</span>
      </div>
      <div className="flex-1 relative">
        {blobUrl ? (
          <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-0" title="Resume Preview" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-600">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-xs font-mono uppercase tracking-widest">Generating preview…</p>
          </div>
        )}
        {isRendering && blobUrl && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <RefreshCw size={13} className="animate-spin text-blue-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ResumeEditor({ initialData }: { initialData?: Partial<ResumeData> }) {
  const [data, setData] = useState<ResumeData>({
    ...DEFAULT_RESUME_DATA,
    ...initialData,
    contact: { ...DEFAULT_RESUME_DATA.contact, ...(initialData?.contact ?? {}) },
  });
  const [showPreview, setShowPreview] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const set = useCallback(<K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setData(d => ({ ...d, [key]: value }));
  }, []);

  const setContact = useCallback((key: keyof ResumeData['contact'], value: string) => {
    setData(d => ({ ...d, contact: { ...d.contact, [key]: value } }));
  }, []);

  // ── Experience ────────────────────────────────────────────────────────────
  function addExp() {
    const blank: ResumeExperience = { id: nanoid(), company: '', startDate: '', endDate: 'Present', role: '', bullets: [''], techStack: '' };
    setData(d => ({ ...d, experience: [...d.experience, blank] }));
  }
  function updateExp(id: string, key: keyof ResumeExperience, value: string | string[]) {
    setData(d => ({ ...d, experience: d.experience.map(e => e.id === id ? { ...e, [key]: value } : e) }));
  }
  function updateBullet(expId: string, idx: number, value: string) {
    setData(d => ({
      ...d,
      experience: d.experience.map(e => {
        if (e.id !== expId) return e;
        const bullets = [...e.bullets]; bullets[idx] = value; return { ...e, bullets };
      }),
    }));
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
    const blank: ResumeEducation = { id: nanoid(), institution: '', location: '', startDate: '', endDate: '', degree: '' };
    setData(d => ({ ...d, education: [...d.education, blank] }));
  }
  function updateEdu(id: string, key: keyof ResumeEducation, value: string) {
    setData(d => ({ ...d, education: d.education.map(e => e.id === id ? { ...e, [key]: value } : e) }));
  }
  function removeEdu(id: string) {
    setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  function addSkillGroup() {
    const blank: ResumeSkillGroup = { id: nanoid(), category: '', skills: '' };
    setData(d => ({ ...d, skillGroups: [...d.skillGroups, blank] }));
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
      const blob = await generateResumePdfBlob(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${data.name.replace(/\s+/g, '_')}_Resume.pdf`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { console.error('Download error', e); }
  }

  // ── Save to site ──────────────────────────────────────────────────────────
  async function handleSave() {
    setSaveStatus('saving');
    startTransition(async () => {
      try {
        const { generateResumePdfBlob } = await import('./generateResumePdf');
        const blob = await generateResumePdfBlob(data);
        const formData = new FormData();
        formData.append('file', blob, 'resume.pdf');
        formData.append('name', 'Active Resume');
        const res = await fetch('/api/assets/upload', { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Upload failed');
        const asset = await res.json();
        const patchRes = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeUrl: asset.url }),
        });
        if (!patchRes.ok) throw new Error('Settings update failed');
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
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Resume Editor</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Edit content on the left — preview refreshes on the right.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowPreview(p => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all lg:hidden">
            <Eye size={14} /> {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button type="button" onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
            <Download size={14} /> Download
          </button>
          <button type="button" onClick={handleSave} disabled={saveStatus === 'saving' || isPending}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              saveStatus === 'saved' ? 'bg-emerald-600 text-white'
              : saveStatus === 'error' ? 'bg-red-600 text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            }`}>
            {saveStatus === 'saving' ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
             : saveStatus === 'saved' ? <><Save size={14} /> Saved!</>
             : saveStatus === 'error' ? 'Error — retry'
             : <><Save size={14} /> Save to Site</>}
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex gap-6 flex-1 min-h-0">

        {/* LEFT — sidebar */}
        <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 overflow-y-auto space-y-3 pr-1 pb-8">

          {/* Personal */}
          <SectionAccordion title="Personal" icon={User} defaultOpen>
            <Field label="Full Name">
              <input className={inputCls} value={data.name} onChange={e => set('name', e.target.value)} placeholder="SUJAN SHRESTHA" />
            </Field>
            <Field label="Summary">
              <textarea className={`${inputCls} resize-none min-h-[80px] py-2`} value={data.summary}
                onChange={e => set('summary', e.target.value)} placeholder="Professional summary…" />
            </Field>
          </SectionAccordion>

          {/* Contact */}
          <SectionAccordion title="Contact" icon={User} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['phone',          'Phone'],
                ['location',       'Location'],
                ['email',          'Email'],
                ['portfolioLabel', 'Portfolio label'],
                ['githubLabel',    'GitHub label'],
                ['linkedinLabel',  'LinkedIn label'],
              ] as const).map(([k, lbl]) => (
                <Field key={k} label={lbl}>
                  <input className={inputCls} value={data.contact[k]} onChange={e => setContact(k, e.target.value)} placeholder={lbl} />
                </Field>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <p className={labelCls + ' mb-2'}>Social / Link URLs</p>
              <div className="grid grid-cols-1 gap-3">
                {([
                  ['portfolioUrl', 'Portfolio URL'],
                  ['githubUrl',    'GitHub URL'],
                  ['linkedinUrl',  'LinkedIn URL'],
                ] as const).map(([k, lbl]) => (
                  <Field key={k} label={lbl}>
                    <input className={inputCls} value={data.contact[k]} onChange={e => setContact(k, e.target.value)} placeholder="https://…" />
                  </Field>
                ))}
              </div>
            </div>
          </SectionAccordion>

          {/* Experience */}
          <SectionAccordion title="Experience" icon={Briefcase} defaultOpen>
            {data.experience.map((exp, idx) => (
              <div key={exp.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entry {idx + 1}</span>
                  <button type="button" onClick={() => removeExp(exp.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
                <Field label="Company">
                  <input className={inputCls} value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} />
                </Field>
                <Field label="Role / Title">
                  <input className={inputCls} value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start">
                    <input className={inputCls} value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} placeholder="09/2023" />
                  </Field>
                  <Field label="End">
                    <input className={inputCls} value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} placeholder="Present" />
                  </Field>
                </div>
                <div>
                  <label className={labelCls}>Bullet Points</label>
                  <div className="space-y-2">
                    {exp.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2 items-start">
                        <textarea className={`${inputCls} resize-none py-1.5 text-xs flex-1`} rows={2} value={b}
                          onChange={e => updateBullet(exp.id, bi, e.target.value)}
                          placeholder="Achievement or responsibility…" />
                        <button type="button" onClick={() => removeBullet(exp.id, bi)}
                          className="mt-1 p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => addBullet(exp.id)}
                    className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest flex items-center gap-1">
                    <Plus size={11} /> Add bullet
                  </button>
                </div>
                <Field label="Tech Stack (shown as [Tech Stack used: …])">
                  <input className={inputCls} value={exp.techStack} onChange={e => updateExp(exp.id, 'techStack', e.target.value)}
                    placeholder="React, TypeScript, …" />
                </Field>
              </div>
            ))}
            <button type="button" onClick={addExp}
              className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Plus size={13} /> Add Experience
            </button>
          </SectionAccordion>

          {/* Education */}
          <SectionAccordion title="Education" icon={GraduationCap}>
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Entry {idx + 1}</span>
                  <button type="button" onClick={() => removeEdu(edu.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Institution">
                    <input className={inputCls} value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} />
                  </Field>
                  <Field label="Location">
                    <input className={inputCls} value={edu.location} onChange={e => updateEdu(edu.id, 'location', e.target.value)} placeholder="Chennai, India" />
                  </Field>
                  <Field label="Start">
                    <input className={inputCls} value={edu.startDate} onChange={e => updateEdu(edu.id, 'startDate', e.target.value)} placeholder="2014" />
                  </Field>
                  <Field label="End">
                    <input className={inputCls} value={edu.endDate} onChange={e => updateEdu(edu.id, 'endDate', e.target.value)} placeholder="2018" />
                  </Field>
                </div>
                <Field label="Degree">
                  <input className={inputCls} value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Engineering in Computer" />
                </Field>
              </div>
            ))}
            <button type="button" onClick={addEdu}
              className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Plus size={13} /> Add Education
            </button>
          </SectionAccordion>

          {/* Skills */}
          <SectionAccordion title="Skills & Others" icon={Wrench}>
            {data.skillGroups.map((sg, idx) => (
              <div key={sg.id} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Group {idx + 1}</span>
                  <button type="button" onClick={() => removeSkillGroup(sg.id)} className="p-1 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category">
                    <input className={inputCls} value={sg.category} onChange={e => updateSkillGroup(sg.id, 'category', e.target.value)} placeholder="Frontend" />
                  </Field>
                  <Field label="Skills">
                    <input className={inputCls} value={sg.skills} onChange={e => updateSkillGroup(sg.id, 'skills', e.target.value)} placeholder="React, TypeScript, …" />
                  </Field>
                </div>
              </div>
            ))}
            <button type="button" onClick={addSkillGroup}
              className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
              <Plus size={13} /> Add Skill Group
            </button>
          </SectionAccordion>
        </div>

        {/* RIGHT — preview */}
        {mounted ? (
          <div className={`flex-1 min-w-0 flex flex-col ${showPreview ? 'flex' : 'hidden lg:flex'}`}>
            <PdfPreviewPanel data={data} />
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
