import { LatexDocument } from '@/types/document';
import { generateLatexCode } from './latex-generator';

export function downloadLatexFile(document: LatexDocument, customFileName?: string) {
  try {
    const code = generateLatexCode(document);
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const cleanTitle = (customFileName || document.title || 'document')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_');
    const filename = `${cleanTitle}.tex`;

    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export LaTeX file:', err);
  }
}
