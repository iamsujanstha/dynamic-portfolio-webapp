import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { ResumePDFDocument } from './ResumePDF';
import type { ResumeData } from '@/src/types/resume';
import { DEFAULT_STYLE, type ResumeStyleConfig } from './resume-style.config';

export async function generateResumePdfBlob(
  data: ResumeData,
  styleConfig: ResumeStyleConfig = DEFAULT_STYLE,
): Promise<Blob> {
  // ResumePDFDocument returns a <Document> element — pdf() requires that directly.
  // Calling it as a plain function (not via createElement wrapper) gives pdf()
  // the <Document> JSX it needs, while still forwarding styleConfig correctly.
  const doc = ResumePDFDocument({ data, styleConfig });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pdf(doc as any).toBlob();
}
