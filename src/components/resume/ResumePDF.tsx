/**
 * ResumePDF — driven entirely by ResumeStyleConfig.
 * No hardcoded spacing/font values — everything comes from the config object.
 */
import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeData } from '@/src/types/resume';
import {
  DEFAULT_STYLE,
  BOLD_FONT,
  ITALIC_FONT,
  BULLET_CHARS,
  type ResumeStyleConfig,
} from './resume-style.config';

// ── Register Google Fonts for @react-pdf ─────────────────────────────────────

// Roboto Serif (used for the name/title — Cambria equivalent)
Font.register({
  family: 'RobotoSerif',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/robotoserif/v17/R71RjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEXTJQCFLH5-_bcEliotp6c.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/robotoserif/v17/R71RjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEXTJQCFLH5-_bcEls0qp6c.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://fonts.gstatic.com/s/robotoserif/v17/R71XjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbDJ69BcVZxkDg-JuT-R8BQ.ttf',
      fontStyle: 'italic',
    },
  ],
});

// Carlito (used for body text — Calibri equivalent)
Font.register({
  family: 'Carlito',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/carlito/v4/3Jn9SDPw3m-pk039PDA.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/carlito/v4/3Jn4SDPw3m-pk039BIykaX0.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://fonts.gstatic.com/s/carlito/v4/3Jn_SDPw3m-pk039DDKBSQ.ttf',
      fontStyle: 'italic',
    },
  ],
});

// Register bold+italic aliases so BOLD_FONT / ITALIC_FONT lookups resolve
Font.register({ family: 'Carlito-Bold', src: 'https://fonts.gstatic.com/s/carlito/v4/3Jn4SDPw3m-pk039BIykaX0.ttf' });
Font.register({ family: 'Carlito-Italic', src: 'https://fonts.gstatic.com/s/carlito/v4/3Jn_SDPw3m-pk039DDKBSQ.ttf' });
Font.register({ family: 'RobotoSerif-Bold', src: 'https://fonts.gstatic.com/s/robotoserif/v17/R71RjywflP6FLr3gZx7K8UyuXDs9zVwDmXCb8lxYgmuii32UGoVldX6UgfjL4-3sMM_kB_qXSEXTJQCFLH5-_bcEls0qp6c.ttf' });
Font.register({ family: 'RobotoSerif-Italic', src: 'https://fonts.gstatic.com/s/robotoserif/v17/R71XjywflP6FLr3gZx7K8UyEVQnyR1E7VN-f51xYuGCQepOvB0KLc2v0wKKB0Q4MSZxyqf2CgAchbDJ69BcVZxkDg-JuT-R8BQ.ttf' });

// ── Build StyleSheet from config ──────────────────────────────────────────────
function makeStyles(c: ResumeStyleConfig) {
  const FB = BOLD_FONT[c.font];
  const FI = ITALIC_FONT[c.font];
  const NFB = BOLD_FONT[c.nameFont];  // name font bold variant

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
    },

    // ── Name (normal: just centered) ────────────────────────────────────────
    name: {
      fontFamily: NFB,
      fontSize: c.nameFontSize,
      textTransform: 'uppercase',
      letterSpacing: c.nameLetterSpacing,
      textAlign: 'center',
      color: '#000000',
      marginBottom: 3,
    },

    // ── Name (flanked: left-rule / NAME / right-rule) ───────────────────────
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
    },
    nameRule: {
      flex: 1,
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
    },
    nameFlanked: {
      fontFamily: NFB,
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
      marginTop: 6,
    },
    cSep: {
      fontFamily: c.font,
      fontSize: c.baseFontSize - 0.5,
      color: '#000000',
      letterSpacing: c.bodyLetterSpacing,
    },
    // The label text
    cText: {
      fontFamily: c.font,
      fontSize: c.baseFontSize - 0.5,
      color: '#000000',
      letterSpacing: c.bodyLetterSpacing,
    },
    cLink: { fontFamily: c.font, fontSize: c.baseFontSize - 0.5, color: c.linkColor, textDecoration: 'underline', letterSpacing: c.bodyLetterSpacing },

    // ── Rule ────────────────────────────────────────────────────────────────
    rule: {
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
    },

    // ── Summary ────────────────────────────────────────────────────
    summary: {
      fontFamily: c.font, // regular weight (not FI)
      fontSize: c.baseFontSize + 0.5,
      lineHeight: c.lineHeight + 0.07,
      textAlign: 'justify',
      marginTop: 5,
      letterSpacing: c.bodyLetterSpacing,
    },

    // ── Section heading ──────────────────────────────────────────────────────
    secWrap: { marginTop: c.sectionGap },
    secTopRule: {
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
      marginBottom: 1,
    },
    secTitle: {
      fontFamily: FB,
      fontSize: c.baseFontSize + 2,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + c.bodyLetterSpacing,
      marginBottom: 1,
    },
    secBotRule: {
      borderBottomWidth: c.ruleWidth,
      borderBottomColor: c.ruleColor,
      marginBottom: 6
    },

    // ── Entry ────────────────────────────────────────────────────────────────
    entryGap: { marginTop: c.entryGap },
    entryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    company: { fontFamily: c.font, fontSize: c.baseFontSize + 1, flex: 1, letterSpacing: c.bodyLetterSpacing },
    dates: { fontFamily: FB, fontSize: c.baseFontSize + 0.5, flexShrink: 0, marginLeft: 8, letterSpacing: c.bodyLetterSpacing },
    role: { fontFamily: FB, fontSize: c.baseFontSize + 1, marginTop: 1, marginBottom: 6, letterSpacing: c.bodyLetterSpacing },

    // ── Bullet ───────────────────────────────────────────────────────────────
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingLeft: 18,
      marginBottom: c.bulletGap,
    },
    dot: {
      fontFamily: c.font,
      fontSize: c.baseFontSize,
      lineHeight: c.lineHeight + 0.04,
      width: c.bulletTextSpace,
      flexShrink: 0,
      letterSpacing: c.bodyLetterSpacing,
    },
    bulletText: {
      fontFamily: c.font,
      fontSize: c.baseFontSize,
      lineHeight: c.lineHeight + 0.04,
      flex: 1,
      textAlign: 'justify',
      letterSpacing: c.bodyLetterSpacing,
    },

    // ── Tech stack ───────────────────────────────────────────────────────────
    techRow: { marginTop: 2, marginBottom: 1 },
    techBold: { fontFamily: FB, fontSize: c.baseFontSize, letterSpacing: c.bodyLetterSpacing },
    techPlain: { fontFamily: c.font, fontSize: c.baseFontSize, letterSpacing: c.bodyLetterSpacing },

    // ── Education ────────────────────────────────────────────────────────────
    eduDegree: { fontFamily: FB, fontSize: c.baseFontSize + 0.5, marginTop: 1, letterSpacing: c.bodyLetterSpacing },

    // ── Skills ───────────────────────────────────────────────────────────────
    skillRow: { marginBottom: 1.5 },
    skillBold: { fontFamily: FB, fontSize: c.baseFontSize + 0.5, letterSpacing: c.bodyLetterSpacing },
    skillPlain: { fontFamily: c.font, fontSize: c.baseFontSize + 0.5, letterSpacing: c.bodyLetterSpacing },
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
    ...(contact.githubLabel ? [{ label: contact.githubLabel, url: contact.githubUrl || '#' }] : []),
    ...(contact.linkedinLabel ? [{ label: contact.linkedinLabel, url: contact.linkedinUrl || '#' }] : []),
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
      <Page size={styleConfig.pageSize || 'LETTER'} style={s.page}>

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
          {contactItems.map((item, i) => {
            const isLink = !!item.url;
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: i > 0 ? styleConfig.contactItemGap : 0,
                }}
              >
                {i > 0 && (
                  <Text
                    style={[
                      s.cSep,
                      { marginRight: styleConfig.contactBulletGap },
                    ]}
                  >
                    {'\u2022'}
                  </Text>
                )}
                <Text style={s.cText}>
                  {item.url ? (
                    <Link src={item.url} style={s.cLink}>
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  )}
                </Text>
              </View>
            );
          })}
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
                {styleConfig.showTechStack !== false && exp.techStack && (
                  <Text style={s.techRow}>
                    <Text style={s.techBold}>[Tech Stack used: </Text>
                    <Text style={s.techPlain}>{exp.techStack}]</Text>
                  </Text>
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
              <Text key={sg.id} style={s.skillRow}>
                <Text style={s.skillBold}>{sg.category}: </Text>
                <Text style={s.bulletText}>{sg.skills}</Text>
              </Text>
            ))}
          </>
        )}

      </Page>
    </Document>
  );
}
