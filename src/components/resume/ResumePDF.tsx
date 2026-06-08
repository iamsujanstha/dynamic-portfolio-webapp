/**
 * ResumePDF — driven entirely by ResumeStyleConfig.
 * No hardcoded spacing/font values — everything comes from the config object.
 */
import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import type { ResumeData } from '@/src/types/resume';
import {
  DEFAULT_STYLE,
  BOLD_FONT,
  BULLET_CHARS,
  type ResumeStyleConfig,
} from './resume-style.config';

// Build a StyleSheet from config — called each render so the preview updates live
function makeStyles(c: ResumeStyleConfig) {
  const FB = BOLD_FONT[c.font];

  return StyleSheet.create({
    page: {
      fontFamily: c.font,
      fontSize: c.baseFontSize,
      color: '#000000',
      backgroundColor: '#ffffff',
      paddingTop: c.marginTop,
      paddingBottom: c.marginBottom,
      paddingHorizontal: c.marginH,
      lineHeight: c.lineHeight,
      wordSpacing: c.wordSpacing,
    },

    // ── Name (normal: just centered) ────────────────────────────────────────
    name: {
      fontFamily: FB,
      fontSize: c.nameFontSize,
      textTransform: 'uppercase',
      letterSpacing: c.nameLetterSpacing,
      textAlign: 'center',
      color: '#000000',
      marginBottom: 6,
    },

    // ── Name (flanked: left-rule / NAME / right-rule) ───────────────────────
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    nameRule: {
      flex: 1,
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
    },
    nameFlanked: {
      fontFamily: FB,
      fontSize: c.nameFontSize,
      textTransform: 'uppercase',
      letterSpacing: c.nameLetterSpacing,
      textAlign: 'center',
      color: '#000000',
      marginHorizontal: 8,
    },

    // ── Contact row ─────────────────────────────────────────────────────────
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 3,
    },
    // The • separator sits between items; marginLeft/Right controls the gap
    // on each side of the bullet — this is the "Contact Item Gap" control
    cSep: {
      fontFamily: c.font,
      fontSize: c.baseFontSize - 0.5,
      color: '#000000',
      marginLeft:  c.contactItemGap,   // space before the separator bullet
      marginRight: c.contactItemGap,   // space after the separator bullet
    },
    // The label text; marginLeft = space between the bullet and the text
    cText: {
      fontFamily: c.font,
      fontSize: c.baseFontSize - 0.5,
      color: '#000000',
      marginTop:8
    },
    // Extra margin between separator and the following item text
    cItemGap: {
      marginLeft: c.contactBulletGap,
    },
    cLink: { fontFamily: c.font, fontSize: c.baseFontSize - 0.5, color: c.linkColor, textDecoration: 'none' },

    // ── Rule ────────────────────────────────────────────────────────────────
    rule: {
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
    },

    // ── Summary ─────────────────────────────────────────────────────────────
    summary: {
      fontFamily: c.font,
      fontSize: c.baseFontSize,
      lineHeight: c.lineHeight + 0.07,
      textAlign: 'justify',
      marginTop: 5,
      marginBottom: 2,
    },

    // ── Section heading ──────────────────────────────────────────────────────
    secWrap: { marginTop: c.sectionGap },
    secTitle: {
      fontFamily: FB,
      fontSize: c.baseFontSize + 0.5,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 2,
      marginBottom: 2,
    },
    secBotRule: {
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
      marginBottom: 5,
    },

    // ── Entry ────────────────────────────────────────────────────────────────
    entryGap: { marginTop: c.entryGap },
    entryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    company: { fontFamily: c.font, fontSize: c.baseFontSize, flex: 1 },
    dates:   { fontFamily: FB,     fontSize: c.baseFontSize, flexShrink: 0, marginLeft: 8 },
    role:    { fontFamily: FB,     fontSize: c.baseFontSize, marginTop: 1, marginBottom: 2 },

    // ── Bullet ───────────────────────────────────────────────────────────────
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingLeft: 18,
      marginBottom: c.bulletGap,
    },
    dot: {
      fontFamily: c.font,
      fontSize: c.baseFontSize + 4,   // larger so • renders as filled circle
      lineHeight: 0.88,               // pull oversized glyph up to align with text
      width: 14,
      flexShrink: 0,
    },
    bulletText: {
      fontFamily: c.font,
      fontSize: c.baseFontSize,
      lineHeight: c.lineHeight + 0.04,
      flex: 1,
      textAlign: 'justify',
      wordSpacing: c.wordSpacing,
    },

    // ── Tech stack ───────────────────────────────────────────────────────────
    techRow:   { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, marginBottom: 1 },
    techBold:  { fontFamily: FB,     fontSize: c.baseFontSize - 0.5 },
    techPlain: { fontFamily: c.font, fontSize: c.baseFontSize - 0.5 },

    // ── Education ────────────────────────────────────────────────────────────
    eduDegree: { fontFamily: FB, fontSize: c.baseFontSize, marginTop: 1 },

    // ── Skills ───────────────────────────────────────────────────────────────
    skillRow:   { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 1.5 },
    skillBold:  { fontFamily: FB,     fontSize: c.baseFontSize },
    skillPlain: { fontFamily: c.font, fontSize: c.baseFontSize, flex: 1 },
  });
}

// ── Document ──────────────────────────────────────────────────────────────────
export function ResumePDFDocument({
  data,
  styleConfig = DEFAULT_STYLE,
}: {
  data: ResumeData;
  styleConfig?: ResumeStyleConfig;
}) {
  const s = makeStyles(styleConfig);
  const bulletChar = BULLET_CHARS[styleConfig.bulletChar];

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

  function Bullet({ text }: { text: string }) {
    if (!text?.trim()) return null;
    return (
      <View style={s.bulletRow}>
        <Text style={s.dot}>{bulletChar}</Text>
        <Text style={s.bulletText}>{text}</Text>
      </View>
    );
  }

  function SectionHeading({ title }: { title: string }) {
    return (
      <View style={s.secWrap}>
        <Text style={s.secTitle}>{title}</Text>
        <View style={s.secBotRule} />
      </View>
    );
  }

  return (
    <Document title={name} author={name} subject="Resume">
      <Page size="A4" style={s.page}>

        {/* ── NAME ── */}
        {styleConfig.nameStyle === 'flanked-rules' ? (
          <View style={s.nameRow}>
            <View style={s.nameRule} />
            <Text style={s.nameFlanked}>{name}</Text>
            <View style={s.nameRule} />
          </View>
        ) : (
          <Text style={s.name}>{name}</Text>
        )}

        {/* ── CONTACT ROW ── */}
        <View style={s.contactRow}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {/* separator bullet with gap on both sides (contactItemGap) */}
              {i > 0 && <Text style={s.cSep}>{'\u2022'}</Text>}
              {/* label — marginLeft from cItemGap = contactBulletGap (space between • and text) */}
              <Text style={[s.cText, i > 0 ? s.cItemGap : undefined]}>
                {item.url
                  ? <Link src={item.url} style={s.cLink}>{item.label}</Link>
                  : item.label}
              </Text>
            </React.Fragment>
          ))}
        </View>

        {/* ── RULE BELOW CONTACT ── */}
        <View style={s.rule} />

        {/* ── SUMMARY ── */}
        {summary ? <Text style={s.summary}>{summary}</Text> : null}

        {/* ── PROFESSIONAL EXPERIENCE ── */}
        {experience.length > 0 && (
          <>
            <SectionHeading title="PROFESSIONAL EXPERIENCE" />
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
            <SectionHeading title="EDUCATION" />
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
            <SectionHeading title="SKILLS & OTHERS" />
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
