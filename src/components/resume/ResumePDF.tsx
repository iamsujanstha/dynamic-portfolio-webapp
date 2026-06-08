/**
 * ResumePDF — 100% matched to target PDF image.
 *
 * Target image measurements:
 *   - Name: bold, centered, fontSize ~20-21pt, sits clearly above contact row
 *   - Contact: 9pt, centered, bullet separators "• item •item"
 *   - ONE rule below contact row (1px solid black)
 *   - Summary: 10pt, justified
 *   - Section headings: rule / BOLD CENTERED UPPERCASE / rule (2 rules, no doubling)
 *   - Company+dates: plain left / bold right, fontSize 10
 *   - Role: bold, fontSize 10
 *   - Bullets: U+2022 (•) at fontSize 14, lineHeight 0.9 — Times-Roman renders
 *              this as a large solid filled circle; lineHeight 0.9 vertically
 *              centres the oversized glyph against 10pt body text
 *   - Bullet text: fontSize 10, justified, lineHeight 1.32
 *   - Tech stack: "[Tech Stack used" bold + ": value]" plain, fontSize 9.5
 *   - Skills: "Category" bold + ": value" plain, fontSize 10
 *   - Page: A4, paddingH 42, paddingTop 24, paddingBottom 20
 */
import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/src/types/resume';

const F   = 'Times-Roman';
const FB  = 'Times-Bold';
const BLK = '#000000';
const LNK = '#1155CC';

const s = StyleSheet.create({

  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    fontFamily: F,
    fontSize: 10,
    color: BLK,
    backgroundColor: '#ffffff',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 42,
    lineHeight: 1.25,
  },

  // ── Name: bold, centered, no flanking rules ────────────────────────────────
  // Must have explicit marginBottom so it doesn't crash into contact row
  name: {
    fontFamily: FB,
    fontSize: 21,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    color: BLK,
    marginBottom: 8,
  },

  // ── Contact row ───────────────────────────────────────────────────────────
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  cText: { fontFamily: F,  fontSize: 9.5, color: BLK , marginRight:6},
  cLink: { fontFamily: F,  fontSize: 9.5, color: LNK, textDecoration: 'none' },

  // ── Rule ──────────────────────────────────────────────────────────────────
  rule: { borderBottomWidth: 1, borderBottomColor: BLK },

  // ── Summary ───────────────────────────────────────────────────────────────
  summary: {
    fontFamily: F,
    fontSize: 10,
    lineHeight: 1.35,
    textAlign: 'justify',
    marginTop: 5,
    marginBottom: 2,
  },

  // ── Section heading — title text + ONE rule below only ──────────────────
  // No top border — secBotRule is the single horizontal line under the title.
  secWrap: {
    marginTop: 5,
  },
  secTitle: {
    fontFamily: FB,
    fontSize: 10.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 2,
    marginBottom: 2,
  },
  secBotRule: { borderBottomWidth: 1, borderBottomColor: BLK, marginBottom: 5 },

  // ── Entry ─────────────────────────────────────────────────────────────────
  entryGap:   { marginTop: 5 },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  company:    { fontFamily: F,  fontSize: 10, flex: 1 },
  dates:      { fontFamily: FB, fontSize: 10, flexShrink: 0, marginLeft: 8 },
  role:       { fontFamily: FB, fontSize: 10, marginTop: 1, marginBottom: 2 },

  // ── Bullet ────────────────────────────────────────────────────────────────
  // U+2022 BULLET at fontSize 14 — Times-Roman contains this glyph and renders
  // it as a large solid filled circle matching the target image.
  // lineHeight 0.9 pulls it up so the oversized glyph aligns with 10pt body text.
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 18,
    marginBottom: 2,
  },
  dot: {
    fontFamily: F,
    fontSize: 14,
    lineHeight: 0.9,
    width: 14,
    flexShrink: 0,
    color: BLK,
  },
  bulletText: {
    fontFamily: F,
    fontSize: 10,
    lineHeight: 1.32,
    flex: 1,
    textAlign: 'justify',
    color: BLK,
  },

  // ── Tech stack ────────────────────────────────────────────────────────────
  techRow:    { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, marginBottom: 1 },
  techBold:   { fontFamily: FB, fontSize: 9.5 },
  techPlain:  { fontFamily: F,  fontSize: 9.5 },

  // ── Education ─────────────────────────────────────────────────────────────
  eduDegree:  { fontFamily: FB, fontSize: 10, marginTop: 1 },

  // ── Skills ────────────────────────────────────────────────────────────────
  skillRow:   { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 1.5 },
  skillBold:  { fontFamily: FB, fontSize: 10 },
  skillPlain: { fontFamily: F,  fontSize: 10, flex: 1 },
});

// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={s.secWrap}>
      <Text style={s.secTitle}>{title}</Text>
      <View style={s.secBotRule} />
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  if (!text?.trim()) return null;
  return (
    <View style={s.bulletRow}>
      <Text style={s.dot}>{'\u2022'}</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function ResumePDFDocument({ data }: { data: ResumeData }) {
  const { name, summary, contact, experience, education, skillGroups } = data;

  type CI = { label: string; url?: string };
  const contactItems: CI[] = [
    { label: contact.phone },
    { label: contact.location },
    { label: contact.email, url: `mailto:${contact.email}` },
    ...(contact.portfolioLabel ? [{ label: contact.portfolioLabel, url: contact.portfolioUrl || '#' }] : []),
    ...(contact.githubLabel    ? [{ label: contact.githubLabel,    url: contact.githubUrl    || '#' }] : []),
    ...(contact.linkedinLabel  ? [{ label: contact.linkedinLabel,  url: contact.linkedinUrl  || '#' }] : []),
  ].filter(i => i.label?.trim());

  return (
    <Document title={name} author={name} subject="Resume">
      <Page size="A4" style={s.page}>

        {/* ── NAME ── */}
        <Text style={s.name}>{name}</Text>

        {/* ── CONTACT ── */}
        <View style={s.contactRow}>
          {contactItems.map((item, i) => (
            <Text key={i} style={s.cText}>
             {i === 0 ? '\u2022 ' : ' \u2022'}
              {item.url
                ? <Link src={item.url} style={s.cLink}>{item.label}</Link>
                : item.label}
            </Text>
          ))}
        </View>

        {/* ── RULE BELOW CONTACT ── */}
        <View style={s.rule} />

        {/* ── SUMMARY ── */}
        {summary ? <Text style={s.summary}>{summary}</Text> : null}

        {/* ── PROFESSIONAL EXPERIENCE ── */}
        {experience.length > 0 && (
          <>
            <SectionHeading title="Professional Experience" />
            {experience.map((exp, ei) => (
              <View key={exp.id} style={ei > 0 ? s.entryGap : undefined}>
                <View style={s.entryRow}>
                  <Text style={s.company}>{exp.company}</Text>
                  <Text style={s.dates}>{exp.startDate} – {exp.endDate}</Text>
                </View>
                <Text style={s.role}>{exp.role}</Text>
                {exp.bullets.map((b, bi) => <Bullet key={bi} text={b} />)}
                {exp.techStack && (
                  <View style={s.techRow}>
                    <Text style={s.techBold}>[Tech Stack used</Text>
                    <Text style={s.techPlain}>: {exp.techStack}]</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* ── EDUCATION ── */}
        {education.length > 0 && (
          <>
            <SectionHeading title="Education" />
            {education.map((edu) => (
              <View key={edu.id}>
                <View style={s.entryRow}>
                  <Text style={s.company}>
                    {edu.institution}{edu.location ? `, ${edu.location}` : ''}
                  </Text>
                  <Text style={s.dates}>{edu.startDate} – {edu.endDate}</Text>
                </View>
                <Text style={s.eduDegree}>{edu.degree}</Text>
              </View>
            ))}
          </>
        )}

        {/* ── SKILLS & OTHERS ── */}
        {skillGroups.length > 0 && (
          <>
            <SectionHeading title="Skills &amp; Others" />
            {skillGroups.map((sg) => (
              <View key={sg.id} style={s.skillRow}>
                <Text style={s.skillBold}>{sg.category}</Text>
                <Text style={s.skillPlain}>: {sg.skills}</Text>
              </View>
            ))}
          </>
        )}

      </Page>
    </Document>
  );
}