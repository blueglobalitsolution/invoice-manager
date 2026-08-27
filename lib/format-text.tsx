import React from 'react';
import { applyVariables } from './variables';
import { PurchaseOrderData } from '@/types/document';

/**
 * Parses markdown and HTML tags into safe HTML for document previews
 * Supports:
 * - **bold** or <b>bold</b> or <strong>bold</strong> or \textbf{bold}
 * - *italic* or <i>italic</i> or <em>italic</em> or \textit{italic}
 * - <u>underline</u> or \underline{underline}
 * - {{VARIABLES}}
 * - \newline or line breaks
 */
export function formatDocumentHtml(
  rawText: string | undefined | null,
  globalVars?: Record<string, string>,
  po?: PurchaseOrderData
): string {
  if (!rawText) return '';

  // 1. First apply template variables
  let processed = applyVariables(rawText, globalVars, po);

  // 2. Normalize LaTeX formatting
  processed = processed
    .replace(/\\textbf{([^}]+)}/g, '<strong>$1</strong>')
    .replace(/\\textit{([^}]+)}/g, '<em>$1</em>')
    .replace(/\\underline{([^}]+)}/g, '<span style="text-decoration: underline; text-underline-offset: 2px;">$1</span>')
    .replace(/\\textsuperscript{([^}]+)}/g, '<sup>$1</sup>')
    .replace(/\\newline/g, '<br/>')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&');

  // 3. Markdown Bold + Italic: ***text***
  processed = processed.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // 4. Markdown Bold: **text**
  processed = processed.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

  // 5. Markdown Italic: *text* (matching single asterisks)
  processed = processed.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em>$1</em>');

  // 6. Underline HTML tag: <u>text</u>
  processed = processed.replace(/<u\b[^>]*>([\s\S]+?)<\/u>/gi, '<span style="text-decoration: underline; text-underline-offset: 2px;">$1</span>');

  // 7. Bold HTML tag: <b>text</b>
  processed = processed.replace(/<b\b[^>]*>([\s\S]+?)<\/b>/gi, '<strong>$1</strong>');
  processed = processed.replace(/<strong\b[^>]*>([\s\S]+?)<\/strong>/gi, '<strong>$1</strong>');

  // 8. Italic HTML tag: <i>text</i>
  processed = processed.replace(/<i\b[^>]*>([\s\S]+?)<\/i>/gi, '<em>$1</em>');
  processed = processed.replace(/<em\b[^>]*>([\s\S]+?)<\/em>/gi, '<em>$1</em>');

  return processed;
}

/**
 * Component that renders formatted text with bold, italic, underline, variables
 */
export const FormattedText: React.FC<{
  text: string | undefined | null;
  globalVars?: Record<string, string>;
  po?: PurchaseOrderData;
  className?: string;
}> = ({ text, globalVars, po, className = '' }) => {
  if (!text) return null;
  const html = formatDocumentHtml(text, globalVars, po);
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
