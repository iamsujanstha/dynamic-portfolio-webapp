/**
 * Thin client-side helper that generates a PDF Blob from ResumeData.
 * Kept in its own file so it can be dynamic-imported only when needed,
 * avoiding SSR issues with @react-pdf/renderer.
 */
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { ResumePDFDocument } from './ResumePDF';
import type { ResumeData } from '@/src/types/resume';

export async function generateResumePdfBlob(data: ResumeData): Promise<Blob> {
  const element = React.createElement(ResumePDFDocument, { data });
  return pdf(element).toBlob();
}
