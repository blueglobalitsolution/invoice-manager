'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sparkles,
  Braces,
  Info,
  HelpCircle,
} from 'lucide-react';
import { DEFAULT_GLOBAL_VARIABLES } from '@/lib/variables';
import { LatexDocument } from '@/types/document';

interface GlobalVariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LatexDocument;
  onUpdateVariables: (variables: Record<string, string>) => void;
}

export const GlobalVariablesModal: React.FC<GlobalVariablesModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onUpdateVariables,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'system'>('all');

  if (!isOpen) return null;

  const customVars = doc.globalVariables || {};
  const currentMerged: Record<string, string> = {
    ...DEFAULT_GLOBAL_VARIABLES,
    ...(doc.purchaseOrder
      ? {
          CLIENT_NAME: doc.purchaseOrder.contractorName || DEFAULT_GLOBAL_VARIABLES.CLIENT_NAME,
          PROJECT_NAME: doc.purchaseOrder.projectName || DEFAULT_GLOBAL_VARIABLES.PROJECT_NAME,
          PROJECT_LOCATION: doc.purchaseOrder.projectLocation || DEFAULT_GLOBAL_VARIABLES.PROJECT_LOCATION,
          PO_NUMBER: doc.purchaseOrder.poNumber || DEFAULT_GLOBAL_VARIABLES.PO_NUMBER,
          PO_DATE: doc.purchaseOrder.poDate || DEFAULT_GLOBAL_VARIABLES.PO_DATE,
          COMPANY_NAME: `${doc.purchaseOrder.companyName} ${doc.purchaseOrder.companySubtitle || ''}`.trim(),
          GST_NO: doc.purchaseOrder.gstNo || DEFAULT_GLOBAL_VARIABLES.GST_NO,
          AMOUNT_IN_WORDS: doc.purchaseOrder.amountInWords || DEFAULT_GLOBAL_VARIABLES.AMOUNT_IN_WORDS,
        }
      : {}),
    ...customVars,
  };

  const handleCopy = (key: string) => {
    const placeholder = `{{${key}}}`;
    navigator.clipboard.writeText(placeholder);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    // Clean key: uppercase alphanumeric & underscores
    const cleanKey = newKey
      .trim()
      .replace(/[{}\s]/g, '')
      .toUpperCase();

    const updated = {
      ...customVars,
      [cleanKey]: newValue.trim(),
    };

    onUpdateVariables(updated);
    setNewKey('');
    setNewValue('');
  };

  const handleUpdateValue = (key: string, val: string) => {
    const updated = {
      ...customVars,
      [key]: val,
    };
    onUpdateVariables(updated);
  };

  const handleDeleteCustom = (key: string) => {
    const updated = { ...customVars };
    delete updated[key];
    onUpdateVariables(updated);
  };

  const allKeys = Array.from(
    new Set([...Object.keys(DEFAULT_GLOBAL_VARIABLES), ...Object.keys(customVars)])
  );

  const filteredKeys = allKeys.filter((key) => {
    const isCustom = customVars[key] !== undefined;
    if (activeTab === 'custom' && !isCustom) return false;
    if (activeTab === 'system' && isCustom) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      (currentMerged[key] || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-[#cccccc] rounded-xl max-w-2xl w-full flex flex-col max-h-[88vh] text-black shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f0efe6] border-b border-[#cccccc] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#dfe7f4] text-[#0d3479] rounded-lg border border-[#b9c7de]">
              <Braces className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-black flex items-center space-x-2">
                <span>Global Variables & Placeholders</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#dfe7f4] text-[#0d3479] font-mono rounded-full border border-[#b9c7de]">
                  Live Synced
                </span>
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Define reusable dynamic placeholders (e.g. <code className="text-[#0d3479] font-mono font-bold">{`{{CLIENT_NAME}}`}</code>) used across all sections.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#666666] hover:text-black p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Variable Bar */}
        <div className="p-4 bg-white border-b border-[#cccccc] shrink-0">
          <form onSubmit={handleAddCustom} className="space-y-2">
            <div className="text-[11px] font-bold text-[#0d3479] uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Global Placeholder</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-1/3">
                <span className="absolute left-2.5 top-2 font-mono text-[#0d3479] font-bold text-xs select-none">
                  {`{{`}
                </span>
                <input
                  type="text"
                  placeholder="VARIABLE_NAME"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                  className="w-full bg-white border border-[#cccccc] rounded-lg pl-7 pr-7 py-2 text-xs font-mono font-bold text-[#0d3479] focus:outline-none focus:border-[#0d3479]"
                />
                <span className="absolute right-2.5 top-2 font-mono text-[#0d3479] font-bold text-xs select-none">
                  {`}}`}
                </span>
              </div>
              <input
                type="text"
                placeholder="Variable replacement value (e.g. Acme Corp / 45 Days)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="flex-1 bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black placeholder-gray-500 focus:outline-none focus:border-[#0d3479]"
              />
              <button
                type="submit"
                disabled={!newKey.trim() || !newValue.trim()}
                className="px-4 py-2 bg-[#002057] hover:bg-[#0d3479] disabled:opacity-50 text-black rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                + Add Variable
              </button>
            </div>
          </form>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-[#cccccc]/80 flex items-center justify-between shrink-0 text-xs">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#666666]" />
            <input
              type="text"
              placeholder="Search variables or values..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#cccccc]/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-black focus:outline-none focus:border-[#0d3479]"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-[#cccccc]/80">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === 'all' ? 'bg-emerald-600 text-black shadow' : 'text-[#666666] hover:text-black'
              }`}
            >
              All ({allKeys.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === 'custom' ? 'bg-emerald-600 text-black shadow' : 'text-[#666666] hover:text-black'
              }`}
            >
              Custom ({Object.keys(customVars).length})
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                activeTab === 'system' ? 'bg-emerald-600 text-black shadow' : 'text-[#666666] hover:text-black'
              }`}
            >
              System Defaults
            </button>
          </div>
        </div>

        {/* Variables List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 scrollbar-thin">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-12 text-[#666666] space-y-2">
              <Info className="w-8 h-8 mx-auto text-[#555555]" />
              <p className="text-sm font-medium">No global variables match your search.</p>
              <p className="text-xs text-[#555555]">
                Create a custom placeholder using the form above.
              </p>
            </div>
          ) : (
            filteredKeys.map((key) => {
              const isCustom = customVars[key] !== undefined;
              const val = currentMerged[key] || '';
              const isCopied = copiedKey === key;

              return (
                <div
                  key={key}
                  className="bg-white border border-[#cccccc]/80 hover:border-gray-600 rounded-lg p-3 flex items-center justify-between space-x-3 transition-colors"
                >
                  <div className="flex-1 flex flex-col space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono font-bold text-[#0d3479] bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
                        {`{{${key}}}`}
                      </code>
                      {isCustom ? (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                          Custom
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gray-800 text-[#666666]">
                          System Auto
                        </span>
                      )}
                    </div>

                    <div className="mt-1">
                      {isCustom ? (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleUpdateValue(key, e.target.value)}
                          className="w-full bg-white border border-[#cccccc] rounded px-2.5 py-1 text-xs text-black focus:outline-none focus:border-[#0d3479]"
                        />
                      ) : (
                        <div className="text-xs text-gray-300 bg-white/60 border border-[#cccccc]/80 rounded px-2.5 py-1 truncate">
                          {val || <span className="text-[#555555] italic">Empty</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={() => handleCopy(key)}
                      className={`px-2.5 py-1.5 rounded text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-black font-bold'
                          : 'bg-white hover:bg-white text-gray-300 hover:text-black border border-[#cccccc]'
                      }`}
                      title="Copy placeholder to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustom(key)}
                        className="p-1.5 rounded text-[#666666] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Delete custom variable"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 py-3 bg-white border-t border-[#cccccc] flex items-center justify-between text-xs text-[#666666] shrink-0">
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-[#0d3479] shrink-0" />
            <span>
              Tip: Paste <code className="text-[#0d3479] font-mono font-bold font-bold">{`{{VARIABLE}}`}</code> in any scope item, clause, rate description, or title.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-black rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
