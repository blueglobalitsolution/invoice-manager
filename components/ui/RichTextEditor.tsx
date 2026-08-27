'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  FileText,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  minHeight?: string;
  isParagraphArray?: boolean;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label = 'Document Content Editor',
  placeholder = 'Type your content here... Use Enter for new lines/paragraphs. Select text to apply formatting.',
  minHeight = '140px',
  isParagraphArray = true,
  className = '',
}) => {
  // Convert value to unified text string
  const initialText = Array.isArray(value) ? value.join('\n\n') : (value || '');
  const [text, setText] = useState<string>(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    const currentUnified = Array.isArray(value) ? value.join('\n\n') : (value || '');
    if (currentUnified !== text) {
      setText(currentUnified);
    }
  }, [value]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (isParagraphArray) {
      // Split by double newlines or single newlines
      const paras = newText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      onChange(paras.length > 0 ? paras : [newText]);
    } else {
      onChange(newText);
    }
  };

  // Helper to wrap or insert formatting at cursor selection
  const applyFormat = (prefix: string, suffix: string = prefix, defaultPlaceholder: string = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const textToWrap = selectedText || defaultPlaceholder;

    const newText = text.substring(0, start) + prefix + textToWrap + suffix + text.substring(end);
    handleTextChange(newText);

    // Restore selection focus
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start, start + prefix.length + selectedText.length + suffix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + defaultPlaceholder.length);
      }
    }, 10);
  };

  const handleInsertList = (ordered: boolean = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.substring(start, end);

    if (selected) {
      const lines = selected.split('\n');
      const formattedLines = lines.map((line, i) => {
        const linePrefix = ordered ? `${i + 1}. ` : '• ';
        return line.trim().startsWith('• ') || /^\d+\.\s/.test(line.trim())
          ? line
          : `${linePrefix}${line}`;
      });
      const newText = text.substring(0, start) + formattedLines.join('\n') + text.substring(end);
      handleTextChange(newText);
    } else {
      const bullet = ordered ? '\n1. ' : '\n• ';
      const newText = text.substring(0, start) + bullet + text.substring(end);
      handleTextChange(newText);
    }
  };

  // Keyboard shortcut handler (Ctrl+B, Ctrl+I, Ctrl+U)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        applyFormat('**', '**', 'bold text');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        applyFormat('*', '*', 'italic text');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        applyFormat('<u>', '</u>', 'underlined text');
      }
    }
  };

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const paragraphsCount = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (text.trim() ? 1 : 0);

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* Header Label and Status */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
          <FileText className="w-3.5 h-3.5 text-[#0d3479]" />
          <span>{label}</span>
        </label>
        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
          <span>{paragraphsCount} Paragraph{paragraphsCount !== 1 ? 's' : ''}</span>
          <span>&bull;</span>
          <span>{wordsCount} Words</span>
        </div>
      </div>

      {/* Editor Box */}
      <div className="border border-[#1E2538] focus-within:border-[#0d3479] rounded-xl bg-[#070A13] overflow-hidden transition-all shadow-xs">
        {/* Formatting Toolbar */}
        <div className="px-2.5 py-1.5 bg-[#0b1220] border-b border-[#1E2538] flex flex-wrap items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center space-x-1">
            {/* Bold */}
            <button
              type="button"
              onClick={() => applyFormat('**', '**', 'bold text')}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => applyFormat('*', '*', 'italic text')}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => applyFormat('<u>', '</u>', 'underlined text')}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-px bg-slate-700 mx-1" />

            {/* Bullet List */}
            <button
              type="button"
              onClick={() => handleInsertList(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            {/* Numbered List */}
            <button
              type="button"
              onClick={() => handleInsertList(true)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-line Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-3.5 bg-transparent border-0 text-slate-200 text-xs focus:outline-none resize-y leading-relaxed font-sans placeholder-slate-500 whitespace-pre-wrap select-text"
        />
      </div>
    </div>
  );
};
