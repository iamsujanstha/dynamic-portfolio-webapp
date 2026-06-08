// ── Resume style configuration ───────────────────────────────────────────────
// This is the ONLY place where PDF visual options are defined.
// ResumeEditor owns an instance of this and passes it to ResumePDFDocument.
// The data model (ResumeData) is never touched.

export type ResumeFont =
  | 'Times-Roman'      // Classic serif (current default)
  | 'Helvetica'        // Arial / Helvetica — clean sans-serif (ATS-friendly)
  | 'Courier';         // Monospace / technical

export interface ResumeStyleConfig {
  // Typography
  font: ResumeFont;
  baseFontSize: number;       // pt — body text size (8–12)
  lineHeight: number;         // body line-height (1.1–1.8)
  wordSpacing: number;        // extra word spacing in pt (0–4)

  // Page
  marginH: number;            // horizontal page padding in pt (24–72)
  marginTop: number;          // top page padding in pt (16–56)
  marginBottom: number;       // bottom page padding in pt (16–48)

  // Spacing
  bulletGap: number;          // margin-bottom between bullets (0–8)
  sectionGap: number;         // margin-top before each section (2–16)
  entryGap: number;           // margin-top between companies (2–14)
  contactItemGap: number;     // horizontal gap between contact items (0–12)
  contactBulletGap: number;   // space between the bullet separator and the item text (0–6)

  // Rules
  ruleWidth: number;          // border width for all hr lines (0.5–2.5)
  ruleColor: string;          // hex color for rules (#000000 default)

  // Name
  nameFontSize: number;       // pt (16–32)
  nameLetterSpacing: number;  // pt (0–3)
  nameStyle: 'normal' | 'flanked-rules';  // flanked = lines left+right of name

  // Accent color for links
  linkColor: string;          // hex

  // Bullet style
  bulletChar: 'filled-circle' | 'hollow-circle' | 'dash' | 'arrow' | 'square';
}

export const DEFAULT_STYLE: ResumeStyleConfig = {
  font: 'Times-Roman',
  baseFontSize: 10,
  lineHeight: 1.28,
  wordSpacing: 2,

  marginH: 35,
  marginTop: 28,
  marginBottom: 24,

  bulletGap: 2,
  sectionGap: 5,
  entryGap: 5,
  contactItemGap: 2,
  contactBulletGap: 1,

  ruleWidth: 1,
  ruleColor: '#000000',

  nameFontSize: 22,
  nameLetterSpacing: 1.2,
  nameStyle: 'normal',

  linkColor: '#1155CC',

  bulletChar: 'filled-circle',
};

// Maps font key → @react-pdf bold variant
export const BOLD_FONT: Record<ResumeFont, string> = {
  'Times-Roman': 'Times-Bold',
  'Helvetica':   'Helvetica-Bold',
  'Courier':     'Courier-Bold',
};

export const BULLET_CHARS: Record<ResumeStyleConfig['bulletChar'], string> = {
  'filled-circle':  '\u2022',   // •  (Times at large size renders filled)
  'hollow-circle':  '\u25E6',   // ◦
  'dash':           '\u2013',   // –
  'arrow':          '\u203A',   // ›
  'square':         '\u25AA',   // ▪
};

export const FONT_LABELS: { value: ResumeFont; label: string }[] = [
  { value: 'Times-Roman', label: 'Times Roman (Serif)' },
  { value: 'Helvetica',   label: 'Arial / Helvetica (Sans-serif)' },
  { value: 'Courier',     label: 'Courier (Monospace)' },
];
