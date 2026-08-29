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
    .replace(/\\textbf{([^}]+)}/g, '<b class="font-bold font-extrabold" style="font-weight: 800;">$1</b>')
    .replace(/\\textit{([^}]+)}/g, '<i class="italic" style="font-style: italic;">$1</i>')
    .replace(/\\underline{([^}]+)}/g, '<u style="text-decoration: underline; text-underline-offset: 2.5px;">$1</u>')
    .replace(/\\textsuperscript{([^}]+)}/g, '<sup>$1</sup>')
    .replace(/\\newline/g, '<br/>')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&');

  // 3. Markdown Bold + Italic: ***text***
  processed = processed.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<b class="font-bold font-extrabold" style="font-weight: 800;"><i class="italic" style="font-style: italic;">$1</i></b>');

  // 4. Markdown Bold: **text**
  processed = processed.replace(/\*\*([\s\S]+?)\*\*/g, '<b class="font-bold font-extrabold" style="font-weight: 800;">$1</b>');

  // 5. Markdown Italic: *text* (matching single asterisks)
  processed = processed.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<i class="italic" style="font-style: italic;">$1</i>');

  // 6. Underline HTML tag: <u>text</u>
  processed = processed.replace(/<u\b[^>]*>([\s\S]+?)<\/u>/gi, '<u style="text-decoration: underline; text-underline-offset: 2.5px;">$1</u>');

  // 7. Bold HTML tag: <b>text</b> or <strong>text</strong>
  processed = processed.replace(/<b\b[^>]*>([\s\S]+?)<\/b>/gi, '<b class="font-bold font-extrabold" style="font-weight: 800;">$1</b>');
  processed = processed.replace(/<strong\b[^>]*>([\s\S]+?)<\/strong>/gi, '<b class="font-bold font-extrabold" style="font-weight: 800;">$1</b>');

  // 8. Italic HTML tag: <i>text</i> or <em>text</em>
  processed = processed.replace(/<i\b[^>]*>([\s\S]+?)<\/i>/gi, '<i class="italic" style="font-style: italic;">$1</i>');
  processed = processed.replace(/<em\b[^>]*>([\s\S]+?)<\/em>/gi, '<i class="italic" style="font-style: italic;">$1</i>');

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
