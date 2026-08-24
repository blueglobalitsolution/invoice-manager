'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'General', items: [
    { keys: ['Ctrl', 'S'], description: 'Save document' },
    { keys: ['Ctrl', 'P'], description: 'Print / Export PDF' },
    { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
  ]},
  { category: 'Editor', items: [
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'Y'], description: 'Redo (alternative)' },
    { keys: ['Ctrl', 'B'], description: 'Toggle file tree sidebar' },
  ]},
  { category: 'View', items: [
    { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle LaTeX code view' },
    { keys: ['Ctrl', 'Shift', 'H'], description: 'Open version history' },
  ]},
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#0d3479]/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0d3479] flex items-center justify-center">
              <Keyboard className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d3479] mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.items.map((shortcut, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs text-gray-700 font-medium">{shortcut.description}</span>
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && <span className="text-[10px] text-gray-300">+</span>}
                          <kbd className="px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 text-[11px] font-mono font-semibold text-gray-700 min-w-[28px] text-center shadow-sm">
                            {key}
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

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[10px] text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 font-mono text-gray-600">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};
