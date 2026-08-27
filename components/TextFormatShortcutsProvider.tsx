'use client';

import React, { useEffect } from 'react';

/**
 * Helper to update any React-controlled input or textarea element's value
 * using native execCommand first (to trigger React's native onChange and undo history),
 * with robust React _valueTracker reset fallback.
 */
function applyTextChange(
  el: HTMLInputElement | HTMLTextAreaElement,
  start: number,
  end: number,
  replacement: string,
  newSelectionStart: number,
  newSelectionEnd: number
) {
  el.focus();
  el.setSelectionRange(start, end);

  // 1. Try native execCommand (best for React inputs & native undo stack)
  let succeeded = false;
  try {
    succeeded = document.execCommand('insertText', false, replacement);
  } catch {
    succeeded = false;
  }

  // 2. Fallback if execCommand did not work
  if (!succeeded) {
    const fullText = el.value || '';
    const newFullText = fullText.substring(0, start) + replacement + fullText.substring(end);

    const isTextArea = el instanceof HTMLTextAreaElement;
    const prototype = isTextArea ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

    // Reset React's internal value tracker so React sees this as a genuine change
    // @ts-expect-error React value tracker
    const tracker = el._valueTracker;
    if (tracker) {
      tracker.setValue('');
    }

    if (descriptor && descriptor.set) {
      descriptor.set.call(el, newFullText);
    } else {
      el.value = newFullText;
    }

    // Dispatch standard events for React controlled inputs
    el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  // Restore desired selection
  setTimeout(() => {
    try {
      el.focus();
      el.setSelectionRange(newSelectionStart, newSelectionEnd);
    } catch {
      // Ignored for unsupported input types
    }
  }, 10);
}

/**
 * Formats the selected text or the word under the cursor in an active input/textarea.
 * Supports:
 * - Bold: **text** (Ctrl+Shift+B, Ctrl+B)
 * - Italic: *text* (Ctrl+Shift+I, Ctrl+I)
 * - Underline: <u>text</u> (Ctrl+Shift+U, Ctrl+U)
 */
function formatActiveElement(
  el: HTMLInputElement | HTMLTextAreaElement,
  formatType: 'bold' | 'italic' | 'underline'
) {
  const fullText = el.value || '';
  let start = el.selectionStart ?? 0;
  let end = el.selectionEnd ?? 0;

  // If no selection, expand to the current word under cursor
  if (start === end) {
    let wordStart = start;
    let wordEnd = end;

    // Search backwards
    while (wordStart > 0 && !/\s/.test(fullText[wordStart - 1])) {
      wordStart--;
    }
    // Search forwards
    while (wordEnd < fullText.length && !/\s/.test(fullText[wordEnd])) {
      wordEnd++;
    }

    if (wordStart < wordEnd) {
      start = wordStart;
      end = wordEnd;
    }
  }

  const selected = fullText.substring(start, end);
  let replacement = '';
  let newStart = start;
  let newEnd = end;

  if (formatType === 'bold') {
    // Toggle bold: if already wrapped with **, remove; otherwise wrap with **
    if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
      replacement = selected.slice(2, -2);
      newEnd = start + replacement.length;
    } else if (selected.length === 0) {
      replacement = '****';
      newStart = start + 2;
      newEnd = start + 2;
    } else {
      replacement = `**${selected}**`;
      newEnd = start + replacement.length;
    }
  } else if (formatType === 'italic') {
    // Toggle italic: if already wrapped with *, remove; otherwise wrap with *
    if (selected.startsWith('*') && selected.endsWith('*') && !selected.startsWith('**') && selected.length >= 2) {
      replacement = selected.slice(1, -1);
      newEnd = start + replacement.length;
    } else if (selected.length === 0) {
      replacement = '**';
      newStart = start + 1;
      newEnd = start + 1;
    } else {
      replacement = `*${selected}*`;
      newEnd = start + replacement.length;
    }
  } else if (formatType === 'underline') {
    // Toggle underline: if already wrapped with <u>...</u>, remove; otherwise wrap with <u>...</u>
    if (selected.startsWith('<u>') && selected.endsWith('</u>') && selected.length >= 7) {
      replacement = selected.slice(3, -4);
      newEnd = start + replacement.length;
    } else if (selected.length === 0) {
      replacement = '<u></u>';
      newStart = start + 3;
      newEnd = start + 3;
    } else {
      replacement = `<u>${selected}</u>`;
      newEnd = start + replacement.length;
    }
  }

  applyTextChange(el, start, end, replacement, newStart, newEnd);
}

export const TextFormatShortcutsProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Ctrl or Meta (Command on Mac) is pressed
      if (!e.ctrlKey && !e.metaKey) return;

      const key = e.key.toLowerCase();
      const code = e.code;
      let formatType: 'bold' | 'italic' | 'underline' | null = null;

      // Support:
      // Ctrl+Shift+B or Ctrl+B => Bold
      // Ctrl+Shift+I or Ctrl+I => Italic
      // Ctrl+Shift+U or Ctrl+U => Underline
      if (key === 'b' || code === 'KeyB') {
        formatType = 'bold';
      } else if (key === 'i' || code === 'KeyI') {
        formatType = 'italic';
      } else if (key === 'u' || code === 'KeyU') {
        formatType = 'underline';
      }

      if (!formatType) return;

      const activeEl = document.activeElement;
      if (!activeEl) return;

      const isInput = activeEl instanceof HTMLInputElement && ['text', 'search', 'url', ''].includes(activeEl.type);
      const isTextArea = activeEl instanceof HTMLTextAreaElement;

      if ((isInput || isTextArea) && !activeEl.hasAttribute('readonly') && !activeEl.hasAttribute('disabled')) {
        e.preventDefault();
        e.stopPropagation();
        formatActiveElement(activeEl as HTMLInputElement | HTMLTextAreaElement, formatType);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  return <>{children}</>;
};
