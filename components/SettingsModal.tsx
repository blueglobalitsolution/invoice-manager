'use client';

import React, { useState } from 'react';
import { X, Settings, Braces, Sliders, Plus, Trash2, Copy, Check } from 'lucide-react';
import {
  DocumentSettings,
  PaperSize,
  FontSize,
  ColumnMode,
  FontFamily,
  MarginSize,
  LatexDocument,
} from '@/types/document';
import { DEFAULT_GLOBAL_VARIABLES } from '@/lib/variables';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DocumentSettings;
  onUpdateSettings: (newSettings: Partial<DocumentSettings>) => void;
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  document?: LatexDocument;
  onUpdateVariables?: (vars: Record<string, string>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  projectTitle,
  onUpdateTitle,
  document: doc,
  onUpdateVariables,
}) => {
  const [activeTab, setActiveTab] = useState<'formatting' | 'variables'>('formatting');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const customVars = doc?.globalVariables || {};

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAddVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim() || !onUpdateVariables) return;
    const cleanKey = newKey.trim().replace(/[{}\s]/g, '').toUpperCase();
    onUpdateVariables({
      ...customVars,
      [cleanKey]: newValue.trim(),
    });
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#161c26] border border-gray-700 rounded-xl max-w-xl w-full p-6 text-gray-200 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded border border-emerald-800/60">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Document Settings</h3>
              <p className="text-xs text-gray-400">Configure page geometry, typography, and global variables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-gray-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('formatting')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'formatting'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Formatting & Page</span>
          </button>

          <button
            onClick={() => setActiveTab('variables')}
            className={`px-3 py-1.5 rounded-md font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'variables'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Global Variables ({Object.keys(customVars).length})</span>
          </button>
        </div>

        {/* Tab: Formatting */}
        {activeTab === 'formatting' && (
          <div className="space-y-4 text-xs overflow-y-auto pr-1">
            {/* Project Name */}
            <div className="space-y-1.5">
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                Document Title
              </label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => onUpdateTitle(e.target.value)}
                className="w-full bg-[#1e2633] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Paper Size & Columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Paper Size
                </label>
                <select
                  value={settings.paperSize}
                  onChange={(e) => onUpdateSettings({ paperSize: e.target.value as PaperSize })}
                  className="w-full bg-[#1e2633] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="a4paper">A4 Standard (210 x 297 mm)</option>
                  <option value="letterpaper">US Letter (8.5 x 11 in)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Column Mode
                </label>
                <select
                  value={settings.columns}
                  onChange={(e) => onUpdateSettings({ columns: e.target.value as ColumnMode })}
                  className="w-full bg-[#1e2633] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="onecolumn">Single Column (Standard Report)</option>
                  <option value="twocolumn">Two Columns</option>
                </select>
              </div>
            </div>

            {/* Typography */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value as FontFamily })}
                  className="w-full bg-[#1e2633] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="helvetica">Helvetica / Sans-Serif (Standard)</option>
                  <option value="times">Times New Roman</option>
                  <option value="latin-modern">Latin Modern Garamond</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: e.target.value as FontSize })}
                  className="w-full bg-[#1e2633] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="10pt">10pt Standard Compact</option>
                  <option value="11pt">11pt Balanced</option>
                  <option value="12pt">12pt Large Print</option>
                </select>
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-1.5">
              <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                Page Margins
              </label>
              <select
                value={settings.margins}
                onChange={(e) => onUpdateSettings({ margins: e.target.value as MarginSize })}
                className="w-full bg-[#1e2633] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="compact">Compact (0.75 in)</option>
                <option value="normal">Normal Standard (1.0 in)</option>
                <option value="wide">Wide (1.25 in)</option>
              </select>
            </div>

            {/* Display Toggles */}
            <div className="pt-2 border-t border-gray-800 space-y-2.5">
              <label className="flex items-center space-x-3 text-xs text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showPageNumbers}
                  onChange={(e) => onUpdateSettings({ showPageNumbers: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <span>Include Bottom Page Numbers</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab: Variables */}
        {activeTab === 'variables' && (
          <div className="space-y-4 text-xs overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {/* Quick Add */}
            <form onSubmit={handleAddVar} className="p-3 bg-[#111927] border border-gray-800 rounded-lg space-y-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
                + Create Custom Placeholder
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="KEY (e.g. CLIENT_NAME)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                  className="w-1/2 bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Reliance Industries)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-1/2 bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!newKey.trim() || !newValue.trim()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-bold transition-all cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Custom Variables */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-gray-400 uppercase">
                Active Placeholders & Custom Variables
              </div>
              {Object.keys(customVars).length === 0 ? (
                <div className="p-4 text-center text-gray-500 italic bg-[#111927] border border-gray-800 rounded">
                  No custom placeholders added yet. Use form above to create one.
                </div>
              ) : (
                Object.entries(customVars).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-2 bg-[#1b2535] border border-gray-700/80 rounded flex items-center justify-between space-x-2"
                  >
                    <div className="flex-1 truncate">
                      <div className="font-mono text-xs text-emerald-400 font-bold">{`{{${k}}}`}</div>
                      <div className="text-[11px] text-gray-300 truncate">{v}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleCopy(k)}
                        className="p-1 text-gray-400 hover:text-white rounded"
                        title="Copy placeholder"
                      >
                        {copiedKey === k ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...customVars };
                          delete updated[k];
                          onUpdateVariables?.(updated);
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 rounded"
                        title="Delete variable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#15803d] hover:bg-[#16a34a] text-white rounded text-xs font-bold transition-all shadow cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
