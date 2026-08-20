'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Download,
  Upload,
  Bookmark,
  Check,
  X,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LatexDocument } from '@/types/document';
import { SAMPLE_TEMPLATES } from '@/lib/templates';

interface CustomTemplateItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  document: LatexDocument;
}

interface TemplateManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocument: LatexDocument;
  onLoadTemplate: (templateDoc: LatexDocument) => void;
  onCreateProjectFromTemplate: (templateDoc: LatexDocument, projectName: string) => void;
}

export const TemplateManagerDrawer: React.FC<TemplateManagerDrawerProps> = ({
  isOpen,
  onClose,
  currentDocument,
  onLoadTemplate,
  onCreateProjectFromTemplate,
}) => {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('latex_custom_templates');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load custom templates from localStorage', e);
      }
    }
    return [];
  });
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDesc, setTemplateDesc] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'save'>('builtin');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const saveCustomTemplatesToStorage = (items: CustomTemplateItem[]) => {
    setCustomTemplates(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('latex_custom_templates', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save custom templates to localStorage', e);
      }
    }
  };

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    const newTemplate: CustomTemplateItem = {
      id: `tmpl_${Date.now()}`,
      name: templateName.trim(),
      description: templateDesc.trim() || 'Custom saved document template structure.',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      document: JSON.parse(JSON.stringify(currentDocument)),
    };

    const updated = [newTemplate, ...customTemplates];
    saveCustomTemplatesToStorage(updated);
    setTemplateName('');
    setTemplateDesc('');
    setActiveTab('custom');
    setSuccessMessage('Template saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this custom template?')) {
      const updated = customTemplates.filter((t) => t.id !== id);
      saveCustomTemplatesToStorage(updated);
    }
  };

  const handleExportTemplate = (tmpl: CustomTemplateItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tmpl, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${tmpl.name.toLowerCase().replace(/\s+/g, '_')}_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0e1724] text-gray-200 h-full flex flex-col shadow-2xl border-l border-gray-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-[#111927]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-emerald-900/40 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Template Manager</h2>
              <p className="text-[11px] text-gray-400">Save document structures & load templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded text-gray-400 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-[#0b121c] px-4 pt-2 space-x-4">
          <button
            onClick={() => setActiveTab('builtin')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'builtin'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Built-in Templates
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Custom Saved ({customTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'save'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            + Save Current
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-4 mt-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 px-3 py-2 rounded text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'builtin' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Choose from standard Overleaf LaTeX document boilerplates and professional contracts.
              </p>

              {Object.entries(SAMPLE_TEMPLATES).map(([key, tmpl]) => (
                <div
                  key={key}
                  className="bg-[#131d2d] border border-gray-800 rounded-lg p-4 space-y-3 hover:border-emerald-600/50 transition-all shadow-sm group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {key === 'quotation'
                          ? '10-Page Commercial Quotation'
                          : key === 'tax_invoice'
                          ? 'GST & Tax Invoice'
                          : key === 'labour_po'
                          ? 'Professional Contract'
                          : 'Standard Document'}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                        {tmpl.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {key === 'quotation'
                          ? 'Comprehensive 10-page commercial quotation with technical details, material specs, itemized BOQ, delivery schedule, approved vendor list (25 makes), and 17 commercial terms.'
                          : key === 'tax_invoice'
                          ? 'Official GST Tax Invoice template with client particulars, HSN breakdown, SGST/CGST tax calculations, bank details, and signatory box.'
                          : key === 'labour_po'
                          ? 'Complete Labour Contract Purchase Order with Rate Tables, Signatures, and Annexure pages.'
                          : 'Clean starter document with standard outline and title block.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800/60">
                    <button
                      onClick={() => {
                        onLoadTemplate(tmpl);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                    >
                      <span>Load into Current</span>
                    </button>
                    <button
                      onClick={() => {
                        const name = prompt('Enter name for new project from template:', `${tmpl.title} (Copy)`);
                        if (name) {
                          onCreateProjectFromTemplate(tmpl, name);
                          onClose();
                        }
                      }}
                      className="px-3 py-1.5 bg-[#15803d] hover:bg-[#16a34a] text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                    >
                      <span>New Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">
                Your custom saved document structures stored securely in browser local storage.
              </p>

              {customTemplates.length === 0 ? (
                <div className="text-center py-12 bg-[#121b29] rounded-lg border border-dashed border-gray-800 p-6 space-y-3">
                  <Bookmark className="w-8 h-8 text-gray-600 mx-auto" />
                  <p className="text-xs text-gray-400 font-medium">No custom templates saved yet.</p>
                  <button
                    onClick={() => setActiveTab('save')}
                    className="px-3 py-1.5 bg-[#15803d] text-white rounded text-xs font-semibold hover:bg-[#16a34a] transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Current Structure</span>
                  </button>
                </div>
              ) : (
                customTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="bg-[#131d2d] border border-gray-800 rounded-lg p-4 space-y-3 hover:border-emerald-600/50 transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-gray-400">{tmpl.createdAt}</span>
                          <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800 px-1.5 py-0.2 rounded font-mono">
                            Custom Template
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mt-1">{tmpl.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{tmpl.description}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleExportTemplate(tmpl)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                          title="Export Template JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded transition-colors"
                          title="Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-800/60">
                      <button
                        onClick={() => {
                          onLoadTemplate(tmpl.document);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Load into Current
                      </button>
                      <button
                        onClick={() => {
                          const name = prompt('Enter project name:', `${tmpl.name} Project`);
                          if (name) {
                            onCreateProjectFromTemplate(tmpl.document, name);
                            onClose();
                          }
                        }}
                        className="px-3 py-1.5 bg-[#15803d] hover:bg-[#16a34a] text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                      >
                        <span>New Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'save' && (
            <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-4 bg-[#131d2d] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Save Current Structure as Template</h3>
              </div>
              <p className="text-xs text-gray-400">
                This will package all current sections, purchase order items, global variables, and styling settings into a reusable custom template.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Template Name *</label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Standard Construction PO v2"
                  className="w-full bg-[#0b121c] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Description</label>
                <textarea
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="Describe what this template contains..."
                  rows={3}
                  className="w-full bg-[#0b121c] border border-gray-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-[#15803d] hover:bg-[#16a34a] text-white font-semibold rounded text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Save Custom Template</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
