'use client';

import React, { useState } from 'react';
import { X, Braces, Plus, Trash2, Copy, Check } from 'lucide-react';
import { LatexDocument } from '@/types/document';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: any;
  onUpdateSettings?: (newSettings: any) => void;
  projectTitle?: string;
  onUpdateTitle?: (title: string) => void;
  document?: LatexDocument;
  onUpdateVariables?: (vars: Record<string, string>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onUpdateVariables,
}) => {
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
    const cleanKey = newKey.trim().toUpperCase().replace(/[{}\s]/g, '');
    onUpdateVariables({
      ...customVars,
      [cleanKey]: newValue.trim(),
    });
    setNewKey('');
    setNewValue('');
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#002057] border border-blue-900 rounded-2xl max-w-xl w-full p-6 text-gray-200 space-y-5 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 text-white rounded-xl border border-white/15">
              <Braces className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Project Variables</h3>
              <p className="text-xs text-blue-200/70">Manage dynamic placeholders and dynamic text substitution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variables Content */}
        <div className="space-y-4 text-xs overflow-y-auto flex-1 pr-1 scrollbar-thin">
          
          {/* Quick Add Form */}
          <form onSubmit={handleAddVar} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
            <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wide flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Placeholder</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="KEY (e.g. CLIENT_NAME)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                className="w-1/2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-blue-200 placeholder:text-blue-200/40 focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                placeholder="Value (e.g. Reliance Industries)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-1/2 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-blue-200/40 focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={!newKey.trim() || !newValue.trim()}
                className="px-4 py-2 bg-white text-[#002057] hover:bg-white/90 disabled:opacity-50 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>
          </form>

          {/* Placeholders List */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-blue-200/60 uppercase tracking-wider">
              Active Placeholders & Custom Variables
            </div>
            {Object.keys(customVars).length === 0 ? (
              <div className="p-6 text-center text-blue-200/50 italic bg-white/5 border border-white/10 rounded-xl">
                No custom placeholders added yet. Use form above to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(customVars).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between space-x-3 hover:bg-white/8 transition-colors"
                  >
                    <div className="flex-1 truncate">
                      <div className="font-mono text-xs text-blue-300 font-bold">{`{{${k}}}`}</div>
                      <div className="text-[11px] text-white/90 truncate mt-0.5">{v}</div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(k)}
                        className="p-2 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        title="Copy placeholder tag"
                      >
                        {copiedKey === k ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...customVars };
                          delete updated[k];
                          onUpdateVariables?.(updated);
                        }}
                        className="p-2 text-blue-200 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                        title="Delete variable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-blue-900">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-[#002057] hover:bg-white/95 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
