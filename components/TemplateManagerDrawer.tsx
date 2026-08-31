'use client';

import React, { useState, useRef } from 'react';
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
import { toast } from '@/components/ui/Toast';

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
  onCreateProjectFromTemplate: (
    templateDoc: LatexDocument,
    projectName: string,
    meta?: { code?: string; clientName?: string; location?: string; category?: string }
  ) => void;
}

// Strict Type Document Validator
const validateLatexDocument = (data: any): string | null => {
  if (!data || typeof data !== 'object') {
    return 'Invalid template data: Template must be a JSON object.';
  }
  if (typeof data.title !== 'string' || !data.title.trim()) {
    return 'Invalid template format: Missing or empty document "title".';
  }
  if (!data.id) {
    return 'Invalid template format: Missing document "id".';
  }
  
  const hasSections = Array.isArray(data.sections);
  const hasPO = data.purchaseOrder && typeof data.purchaseOrder === 'object';
  const hasQuotation = data.quotation && typeof data.quotation === 'object';
  const hasInvoice = data.taxInvoice && typeof data.taxInvoice === 'object';
  
  if (!hasSections && !hasPO && !hasQuotation && !hasInvoice) {
    return 'Invalid template structure: Document must contain sections or a specific layout schema (PO, Quotation, or Invoice).';
  }
  
  if (data.settings && typeof data.settings !== 'object') {
    return 'Invalid template format: Document "settings" must be an object.';
  }

  return null;
};

export const TemplateManagerDrawer: React.FC<TemplateManagerDrawerProps> = ({
  isOpen,
  onClose,
  currentDocument,
  onLoadTemplate,
  onCreateProjectFromTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom' | 'save'>('builtin');
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Project from Template Wizard state
  const [wizardTemplate, setWizardTemplate] = useState<LatexDocument | null>(null);
  const [wizardProjTitle, setWizardProjTitle] = useState('');
  const [wizardProjCode, setWizardProjCode] = useState('');
  const [wizardClientName, setWizardClientName] = useState('');
  const [wizardLocation, setWizardLocation] = useState('');
  const [wizardCategory, setWizardCategory] = useState('Civil Labour Contract');

  const [customTemplates, setCustomTemplates] = useState<CustomTemplateItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('latex_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveCustomTemplatesToStorage = (templates: CustomTemplateItem[]) => {
    setCustomTemplates(templates);
    try {
      localStorage.setItem('latex_custom_templates', JSON.stringify(templates));
    } catch (e) {
      console.error('Failed to save custom templates:', e);
    }
  };

  const handleSaveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    const newTemplate: CustomTemplateItem = {
      id: `tmpl_${Date.now()}`,
      name: templateName.trim(),
      description: templateDesc.trim() || 'Custom user-saved template layout.',
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      document: JSON.parse(JSON.stringify(currentDocument)),
    };

    const updated = [newTemplate, ...customTemplates];
    saveCustomTemplatesToStorage(updated);
    setTemplateName('');
    setTemplateDesc('');
    setSuccessMessage('Template saved successfully!');
    setTimeout(() => setSuccessMessage(null), 3000);
    setActiveTab('custom');
  };

  const handleDeleteTemplate = (id: string) => {
    const target = customTemplates.find((t) => t.id === id);
    const updated = customTemplates.filter((t) => t.id !== id);
    saveCustomTemplatesToStorage(updated);
    toast.success(`Template "${target?.name || ''}" deleted.`);
  };

  const handleExportTemplate = (item: CustomTemplateItem) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(item.document, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${item.name.toLowerCase().replace(/\s+/g, '_')}_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Template JSON exported.');
  };

  const startWizard = (tmpl: LatexDocument) => {
    setWizardTemplate(tmpl);
    const yr = new Date().getFullYear();
    const rnd = Math.floor(100 + Math.random() * 900);
    setWizardProjTitle(`${tmpl.title || 'New Project'}`);
    setWizardProjCode(`GI-PRJ-${yr}-${rnd}`);
    setWizardClientName('Mohammad Kamil Shaikh');
    setWizardLocation('Sevasi TP-1, Vadodara, Gujarat');
  };

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        let docToValidate: any = parsed;
        let name = file.name.replace(/\.json$/i, '');
        let description = 'Imported JSON template';

        if (parsed.document && typeof parsed.document === 'object') {
          docToValidate = parsed.document;
          if (parsed.name) name = parsed.name;
          if (parsed.description) description = parsed.description;
        }

        const validationError = validateLatexDocument(docToValidate);
        if (validationError) {
          toast.error(validationError);
          return;
        }

        const newTemplate: CustomTemplateItem = {
          id: `tmpl_${Date.now()}`,
          name: name,
          description: description,
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          document: docToValidate,
        };

        const updated = [newTemplate, ...customTemplates];
        saveCustomTemplatesToStorage(updated);
        toast.success('Template imported successfully!');
      } catch (err) {
        toast.error('Failed to parse JSON file. Please ensure it is a valid JSON template.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs select-none">
      <div onClick={onClose} className="fixed inset-0 cursor-pointer" title="Click outside to close" />
      <div className="relative w-full max-w-lg bg-[#f7f7f2] text-black h-full flex flex-col shadow-2xl border-l border-[#cccccc] z-10">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#cccccc] flex items-center justify-between bg-[#f0efe6] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-black tracking-wide">Template Manager</h2>
              <p className="text-[11px] text-[#666666]">Save document structures & load templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#666666] hover:text-black hover:bg-white border border-transparent hover:border-[#cccccc] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#cccccc] bg-white px-4 pt-2 space-x-4 shrink-0">
          <button
            onClick={() => {
              setActiveTab('builtin');
              setWizardTemplate(null);
            }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'builtin' && !wizardTemplate
                ? 'border-[#0d3479] text-[#0d3479]'
                : 'border-transparent text-[#666666] hover:text-black'
            }`}
          >
            Built-in Templates
          </button>
          <button
            onClick={() => {
              setActiveTab('custom');
              setWizardTemplate(null);
            }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom' && !wizardTemplate
                ? 'border-[#0d3479] text-[#0d3479]'
                : 'border-transparent text-[#666666] hover:text-black'
            }`}
          >
            Custom Saved ({customTemplates.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('save');
              setWizardTemplate(null);
            }}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'save'
                ? 'border-[#0d3479] text-[#0d3479]'
                : 'border-transparent text-[#666666] hover:text-black'
            }`}
          >
            + Save Current
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-4 mt-3 bg-[#dfe7f4] border border-[#b9c7de] text-[#0d3479] px-3 py-2 rounded-xl text-xs flex items-center space-x-2 font-bold shadow-xs">
            <Check className="w-4 h-4 text-[#0d3479] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Drawer Body */}
        {wizardTemplate ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f7f7f2]">
            <div className="bg-white border border-[#cccccc] rounded-xl p-4 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2 text-[#0d3479] border-b border-[#cccccc] pb-2">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">New Project Wizard</h3>
              </div>
              
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-black font-bold">Project Name / Document Title *</label>
                  <input
                    type="text"
                    required
                    value={wizardProjTitle}
                    onChange={(e) => setWizardProjTitle(e.target.value)}
                    placeholder="e.g. Sevasi Commercial Complex Construction"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-black font-bold">Project Code / Reference *</label>
                  <input
                    type="text"
                    required
                    value={wizardProjCode}
                    onChange={(e) => setWizardProjCode(e.target.value)}
                    placeholder="e.g. GI-PRJ-2026-09"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-mono font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-black font-bold">Client / Contractor Name *</label>
                  <input
                    type="text"
                    required
                    value={wizardClientName}
                    onChange={(e) => setWizardClientName(e.target.value)}
                    placeholder="e.g. Mohammad Kamil Shaikh"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-black font-bold">Site Location *</label>
                  <input
                    type="text"
                    required
                    value={wizardLocation}
                    onChange={(e) => setWizardLocation(e.target.value)}
                    placeholder="e.g. Sevasi TP-1, Vadodara, Gujarat"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-black font-bold">Project Category</label>
                  <select
                    value={wizardCategory}
                    onChange={(e) => setWizardCategory(e.target.value)}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  >
                    <option value="Civil Labour Contract">Civil Labour Contract</option>
                    <option value="PEB & Steel Structure Work Order">PEB & Steel Structure Work Order</option>
                    <option value="Material Purchase Order">Material Purchase Order</option>
                    <option value="Commercial Quotation">Commercial Quotation</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-[#cccccc]">
                <button
                  type="button"
                  onClick={() => setWizardTemplate(null)}
                  className="flex-1 py-2 bg-white hover:bg-slate-100 text-black border border-[#cccccc] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!wizardProjTitle.trim() || !wizardProjCode.trim() || !wizardClientName.trim() || !wizardLocation.trim()) {
                      toast.warning('Please fill in all required fields.');
                      return;
                    }
                    onCreateProjectFromTemplate(wizardTemplate, wizardProjTitle.trim(), {
                      code: wizardProjCode.trim(),
                      clientName: wizardClientName.trim(),
                      location: wizardLocation.trim(),
                      category: wizardCategory,
                    });
                    setWizardTemplate(null);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-[#002057] hover:bg-[#0d3479] text-white text-xs font-bold rounded-lg transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>Create Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f7f7f2]">
            {activeTab === 'builtin' && (
              <div className="space-y-3">
                <p className="text-xs text-[#666666]">
                  Choose from standard Overleaf LaTeX document boilerplates and professional contracts.
                </p>

                {Object.entries(SAMPLE_TEMPLATES).map(([key, tmpl]) => (
                  <div
                    key={key}
                    className="bg-white border border-[#cccccc] rounded-xl p-4 space-y-3 hover:border-[#0d3479]/50 transition-all shadow-xs group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-[#dfe7f4] text-[#0d3479] px-2 py-0.5 rounded-full border border-[#b9c7de]">
                          {key === 'quotation'
                            ? '10-Page Commercial Quotation'
                            : key === 'tax_invoice'
                            ? 'GST & Tax Invoice'
                            : key === 'labour_po'
                            ? 'Civil Labour Contract'
                            : key === 'fabrication_po'
                            ? 'Fabrication Purchase Order'
                            : 'Standard Document'}
                        </span>
                        <h3 className="text-sm font-bold text-black mt-1.5 group-hover:text-[#0d3479] transition-colors">
                          {tmpl.title}
                        </h3>
                        <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                          {key === 'quotation'
                            ? 'Comprehensive 10-page commercial quotation with technical details, material specs, itemized BOQ, delivery schedule, approved vendor list (25 makes), and 17 commercial terms.'
                            : key === 'tax_invoice'
                            ? 'Official GST Tax Invoice template with client particulars, HSN breakdown, SGST/CGST tax calculations, bank details, and signatory box.'
                            : key === 'labour_po'
                            ? 'Complete Civil Labour Contract Purchase Order with Rate Tables, Signatures, and Annexure pages.'
                            : key === 'fabrication_po'
                            ? 'Structural Fabrication & Erection Labour Purchase Order with per-kg rate table, scope of contractor, measurement clauses, and dual signatures.'
                            : 'Clean starter document with standard outline and title block.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#cccccc]">
                      <button
                        onClick={() => {
                          onLoadTemplate(tmpl);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-black border border-[#cccccc] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                      >
                        <span>Load into Current</span>
                      </button>
                      <button
                        onClick={() => startWizard(tmpl)}
                        className="px-3 py-1.5 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
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
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#666666] font-medium">
                    Your custom templates.
                  </p>
                  <label className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-[#0d3479] rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs border border-[#cccccc]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportTemplate}
                    />
                  </label>
                </div>

                {customTemplates.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-[#cccccc] p-6 space-y-3">
                    <Bookmark className="w-8 h-8 text-[#888888] mx-auto" />
                    <p className="text-xs text-[#666666] font-medium">No custom templates saved yet.</p>
                    <button
                      onClick={() => setActiveTab('save')}
                      className="px-3 py-1.5 bg-[#002057] text-white rounded-lg text-xs font-bold hover:bg-[#0d3479] transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save Current Structure</span>
                    </button>
                  </div>
                ) : (
                  customTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="bg-white border border-[#cccccc] rounded-xl p-4 space-y-3 hover:border-[#0d3479]/50 transition-all shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-black">{tmpl.name}</h3>
                          <p className="text-xs text-[#666666] mt-0.5">{tmpl.description || 'No description'}</p>
                          <span className="text-[10px] text-[#888888] block mt-1">Saved: {tmpl.createdAt}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                          className="text-[#888888] hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#cccccc]">
                        <button
                          onClick={() => handleExportTemplate(tmpl)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-black border border-[#cccccc] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
                          title="Export as JSON"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </button>
                        <button
                          onClick={() => {
                            onLoadTemplate(tmpl.document);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-black border border-[#cccccc] rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <span>Load Structure</span>
                        </button>
                        <button
                          onClick={() => startWizard(tmpl.document)}
                          className="px-3 py-1.5 bg-[#002057] hover:bg-[#0d3479] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 shadow-xs"
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
              <form onSubmit={handleSaveCurrentAsTemplate} className="space-y-4 bg-white border border-[#cccccc] rounded-xl p-4 shadow-xs">
                <div className="flex items-center space-x-2 text-[#0d3479]">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Save Current Structure as Template</h3>
                </div>
                <p className="text-xs text-[#666666]">
                  This will package all current sections, purchase order items, global variables, and styling settings into a reusable custom template.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Standard Construction PO v2"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-black">Description</label>
                  <textarea
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    placeholder="Describe what this template contains..."
                    rows={3}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] resize-none shadow-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#002057] hover:bg-[#0d3479] text-white font-bold rounded-lg text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Save Custom Template</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
