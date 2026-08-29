'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Keyboard, ChevronDown, Sparkles, X, Bold, Italic, Underline } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
  badge?: string;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: 'Text Formatting (Any Input / Field)',
    items: [
      { keys: ['Ctrl', 'B'], description: 'Bold selected text / word', badge: '**bold**' },
      { keys: ['Ctrl', 'I'], description: 'Italicize selected text / word', badge: '*italic*' },
      { keys: ['Ctrl', 'U'], description: 'Underline selected text / word', badge: '<u>text</u>' },
    ],
  },
  {
    title: 'Document & Actions',
    items: [
      { keys: ['Ctrl', 'S'], description: 'Quick save document' },
      { keys: ['Ctrl', 'P'], description: 'Print / Export to PDF' },
    ],
  },
  {
    title: 'Editor & Navigation',
    items: [
      { keys: ['Ctrl', 'Z'], description: 'Undo last change' },
      { keys: ['Ctrl', 'Y'], description: 'Redo last change' },
      { keys: ['Esc'], description: 'Close active modal / dropdown' },
    ],
  },
];

export const ShortcutsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Esc
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs select-none ${
          isOpen
            ? 'bg-[#dfe7f4] border-[#0d3479] text-[#0d3479] ring-2 ring-[#0d3479]/20'
            : 'bg-white hover:bg-slate-50 text-[#0d3479] border-[#cccccc] hover:border-[#0d3479]/40'
        }`}
        title="View all application & editor keyboard shortcuts"
        aria-expanded={isOpen}
      >
        <Keyboard className="w-3.5 h-3.5 text-[#0d3479]" />
        <span>Shortcuts</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#0d3479] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-[#f4f3eb] rounded-2xl shadow-2xl border border-[#cccccc] overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150 text-left">
          {/* Header */}
          <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-[#dfe7f4] text-[#0d3479] rounded-lg border border-[#b9c7de]">
                <Keyboard className="w-4 h-4 text-[#0d3479]" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-black uppercase tracking-wider">
                  Keyboard Shortcuts
                </h3>
                <p className="text-[10px] text-[#666666]">
                  Global editor & formatting commands
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#666666] hover:text-black p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Categories */}
          <div className="p-3.5 space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin">
            {SHORTCUT_CATEGORIES.map((cat, catIdx) => (
              <div key={catIdx} className="bg-white rounded-xl border border-[#cccccc] p-3 space-y-2 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#f0efe6] pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d3479]">
                    {cat.title}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5 min-w-0 pr-2">
                        <span className="text-black font-medium text-[11px] truncate">
                          {item.description}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-mono bg-[#f0efe6] text-[#0d3479] font-bold px-1.5 py-0.5 rounded border border-[#cccccc]">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            {kIdx > 0 && <span className="text-[10px] text-[#888888] font-bold">+</span>}
                            <kbd className="px-2 py-1 bg-[#f7f7f2] border border-[#cccccc] rounded-lg text-[10.5px] font-mono font-bold text-black shadow-xs min-w-[24px] text-center">
                              {k}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="bg-[#f0efe6] px-4 py-2 border-t border-[#cccccc] text-[10px] text-[#666666] flex items-center justify-between">
            <span>Tip: Select text in any field & press shortcut</span>
            <span className="font-mono font-semibold text-[#0d3479]">Ctrl+B / I / U</span>
          </div>
        </div>
      )}
    </div>
  );
};
