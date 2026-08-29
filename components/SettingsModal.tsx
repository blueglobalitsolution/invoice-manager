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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div onClick={onClose} className="fixed inset-0 cursor-pointer" />
      <div className="relative bg-[#f7f7f2] border border-[#cccccc] rounded-2xl max-w-xl w-full text-black shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#f0efe6] border-b border-[#cccccc] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#dfe7f4] border border-[#b9c7de] text-[#0d3479] rounded-xl shadow-xs">
              <Braces className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black">Project Variables</h3>
              <p className="text-xs text-[#666666]">Manage dynamic placeholders and dynamic text substitution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-black p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-[#cccccc] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Variables Content */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 scrollbar-thin bg-[#f7f7f2]">
          
          {/* Quick Add Form */}
          <form onSubmit={handleAddVar} className="p-4 bg-white border border-[#cccccc] rounded-xl space-y-3 shadow-xs">
            <div className="text-[11px] font-bold text-[#0d3479] uppercase tracking-wide flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Placeholder</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="KEY (e.g. CLIENT_NAME)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                className="w-1/2 bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs font-mono font-bold text-black placeholder:text-[#888888] focus:outline-none focus:border-[#0d3479] shadow-xs"
              />
              <input
                type="text"
                placeholder="Value (e.g. Reliance Industries)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-1/2 bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold placeholder:text-[#888888] focus:outline-none focus:border-[#0d3479] shadow-xs"
              />
              <button
                type="submit"
                disabled={!newKey.trim() || !newValue.trim()}
                className="px-4 py-2 bg-[#002057] hover:bg-[#0d3479] disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 shadow-xs"
              >
                Add
              </button>
            </div>
          </form>

          {/* Placeholders List */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-black uppercase tracking-wider">
              Active Placeholders & Custom Variables
            </div>
            {Object.keys(customVars).length === 0 ? (
              <div className="p-6 text-center text-[#666666] italic bg-white border border-[#cccccc] rounded-xl shadow-xs">
                No custom placeholders added yet. Use form above to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(customVars).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-3 bg-white border border-[#cccccc] rounded-xl flex items-center justify-between space-x-3 hover:border-[#0d3479]/40 transition-colors shadow-xs"
                  >
                    <div className="flex-1 truncate">
                      <div className="font-mono text-xs text-[#0d3479] font-bold">{`{{${k}}}`}</div>
                      <div className="text-[11px] text-black font-medium truncate mt-0.5">{v}</div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(k)}
                        className="p-2 text-[#666666] hover:text-black rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy placeholder tag"
                      >
                        {copiedKey === k ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...customVars };
                          delete updated[k];
                          onUpdateVariables?.(updated);
                        }}
                        className="p-2 text-[#666666] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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
        <div className="flex justify-end p-4 border-t border-[#cccccc] bg-[#f0efe6]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
