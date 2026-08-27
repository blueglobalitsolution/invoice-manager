'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  Upload,
  Plus,
  Trash2,
  Layers,
  Palette,
  FileText,
  Building2,
  CheckCircle2,
  Sliders,
  ZoomIn,
  ZoomOut,
  Copy,
  BookOpen,
  PenTool,
} from 'lucide-react';
import { LatexDocument, CustomPageDef, CustomSectionItem, PurchaseOrderData, SectionContentType } from '@/types/document';
import { LABOUR_PO_TEMPLATE, SAMPLE_TEMPLATES } from '@/lib/templates';
import { PREDEFINED_SECTION_TYPES, createSectionFromPreset } from '@/lib/section-presets';
import { DocumentPreview } from '@/components/DocumentPreview';
import { SectionLibraryManager } from '@/components/SectionLibraryManager';

interface TemplateBuilderStudioProps {
  onBack: () => void;
  onSaveTemplate: (templateName: string, templateDesc: string, doc: LatexDocument) => void;
  onCreateProjectFromTemplate: (doc: LatexDocument, projectName: string) => void;
  initialDocument?: LatexDocument;
}

const TEMPLATE_CATEGORIES = [
  'Civil Labour Contract',
  'PEB & Steel Structure Work Order',
  'Material Purchase Order',
  'Technical Specifications & Annexure',
  'Commercial Quotation',
  'Tax Invoice & Billing Summary',
  'Maintenance & SLA Agreement',
];

const ACCENT_COLORS = [
  { name: 'Forest Green (Default)', color: '#15803d' },
  { name: 'Deep Navy', color: '#1e3a8a' },
  { name: 'Charcoal Slate', color: '#334155' },
  { name: 'Burgundy Crimson', color: '#991b1b' },
  { name: 'Emerald Teal', color: '#059669' },
  { name: 'Dark Bronze', color: '#78350f' },
];

export const TemplateBuilderStudio: React.FC<TemplateBuilderStudioProps> = ({
  onBack,
  onSaveTemplate,
  onCreateProjectFromTemplate,
  initialDocument,
}) => {
  const [isSelectingBase, setIsSelectingBase] = useState<boolean>(true);
  const [templateDoc, setTemplateDoc] = useState<LatexDocument>(() => {
    return initialDocument ? JSON.parse(JSON.stringify(initialDocument)) : JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE));
  });

  const [templateName, setTemplateName] = useState<string>(
    initialDocument?.title || 'Global Industries Custom Work Order Template'
  );
  const [templateCategory, setTemplateCategory] = useState<string>('Civil Labour Contract');
  const [templateDesc, setTemplateDesc] = useState<string>(
    'Standardized enterprise template with structured multi-page layout, rate matrix, and statutory terms.'
  );

  const [activeTab, setActiveTab] = useState<'basics' | 'sections' | 'style' | 'variables'>('basics');
  const [viewMode, setViewMode] = useState<'studio' | 'library'>('studio');
  const [previewZoom, setPreviewZoom] = useState<number>(90);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const po: PurchaseOrderData = templateDoc.purchaseOrder || {
    companyName: 'GLOBAL',
    companySubtitle: 'INDUSTRIES',
    companyAddress: ['SO7B / 2nd Floor / Phase 2', 'Indiabulls, Jetalpur Road', 'Vadodara'],
    gstNo: '24CLNPS9550H1ZI',
    companyPhone: '+91 97254 45370',
    companyAddressFooter: 'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Vadodara - 391243',
    companyEmail: 'info@globalindustries.co',
    companyWebsite: 'www.globalindustries.co',
    leftServices: ['• Pre Engineering Building', '• Roofing Solution', '• Engineering Project & Designing'],
    rightServices: ['• Infra Materials', '• Puf Panels & Insulation', '• Skylight Sheets'],
    contractorName: '{{CONTRACTOR_NAME}}',
    projectName: '{{PROJECT_NAME}}',
    projectLocation: '{{PROJECT_LOCATION}}',
    poNumber: 'GI/WORK/2026/XXX',
    poDate: new Date().toLocaleDateString('en-GB'),
    scopeOfWork: ['Site cleaning and layout assistance', 'Excavation & PCC work', 'RCC structural casting', 'Finishing & Handing over'],
    rateItems: [
      {
        id: 'rate_1',
        description: 'Complete Civil Labour Contract (Lumpsum/Uchak) including skilled manpower, tools, scaffolding and supervision.',
        unit: 'Lumpsum',
        qty: '1 Job',
        rate: '4,70,000/-',
        total: '470000.00',
      },
    ],
    amountInWords: 'Rupees Four Lakh Seventy Thousand Only',
    scopeOfContractor: [
      '1. Contract Value: On Lumpsum labour contract basis including skilled/unskilled manpower, supervision, tools & tackles.',
      '2. Scope of Work: Strict compliance with approved engineering drawings and Site Engineer instructions.',
      '3. Company Scope: Supply of primary materials (Cement, Steel, Sand, Aggregate).',
    ],
    paymentTerms: [
      '1. Mobilization Advance: 10% against confirmation.',
      '2. Running Bill: 85% based on actual measured progress certified by Site Engineer.',
      '3. Final Retention: 5% released 30 days after successful handover.',
    ],
    measurementClause: [
      '1. All measurements as per IS 1200 standard codes.',
      '2. Deduction for openings as per standard civil practice.',
    ],
    termsAndConditions: [
      '1. Rate Basis: Fixed lumpsum value. No escalation allowed.',
      '2. Completion Period: 45 calendar days from work order issuance.',
      '3. Safety: Mandatory PPE (helmets, safety shoes, jackets) on site at all times.',
    ],
    page3Terms: [],
    signatoryCompany: 'Global Industries',
    signatoryContractor: 'Authorised Signatory',
  };

  const updatePO = (patch: Partial<PurchaseOrderData>) => {
    setTemplateDoc((prev: LatexDocument): LatexDocument => {
      const currentPO = prev.purchaseOrder || po;
      return {
        ...prev,
        purchaseOrder: {
          ...currentPO,
          ...patch,
        },
      };
    });
  };

  const handleAccentColorChange = (color: string) => {
    setTemplateDoc((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        accentColor: color,
      },
    }));
    showToast(`Accent theme color set to ${color}`);
  };

  const handleAddCustomPage = () => {
    const customPages = po.customPages || [];
    const nextNum = 3 + customPages.length + 1;
    const newPage: CustomPageDef = {
      id: `page_${Date.now()}`,
      pageNum: nextNum,
      title: `Annexure Page ${nextNum}`,
      includeLetterHeader: false,
      includeLetterFooter: true,
    };

    const firstSection: CustomSectionItem = {
      id: `sec_${Date.now()}`,
      pageNumber: nextNum,
      title: 'Special Terms & Scope Details',
      contentType: 'bullet_list',
      bullets: [
        'Detailed specifications applicable to this work package.',
        'Quality compliance as per IS standards.',
      ],
    };

    updatePO({
      customPages: [...customPages, newPage],
      customSections: [...(po.customSections || []), firstSection],
    });
    showToast(`Added Page ${nextNum} to Template`);
  };

  const handleAddPresetSection = (type: SectionContentType) => {
    const section = createSectionFromPreset(type, 0, 2);
    if (!section) return;

    updatePO({
      customSections: [...(po.customSections || []), section],
    });
    showToast(`Added "${section.title}" section`);
  };

  const handleDeleteCustomSection = (secId: string) => {
    const remaining = (po.customSections || []).filter((s) => s.id !== secId);
    updatePO({ customSections: remaining });
    showToast('Section removed from template');
  };

  const handleSaveToLibrary = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    onSaveTemplate(templateName.trim(), templateDesc.trim(), templateDoc);
    showToast(`Template "${templateName}" saved to library!`);
  };

  const handleCreateProject = () => {
    onCreateProjectFromTemplate(templateDoc, templateName.trim() || 'New Document');
  };

  const handleExportJson = () => {
    const payload = {
      name: templateName,
      category: templateCategory,
      description: templateDesc,
      templateDoc,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${templateName.toLowerCase().replace(/\s+/g, '_')}_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Template JSON exported!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.templateDoc) {
          setTemplateDoc(parsed.templateDoc);
          if (parsed.name) setTemplateName(parsed.name);
          if (parsed.category) setTemplateCategory(parsed.category);
          if (parsed.description) setTemplateDesc(parsed.description);
          showToast('Template imported successfully!');
        } else if (parsed.id && parsed.settings) {
          setTemplateDoc(parsed);
          showToast('Template document imported!');
        }
      } catch {
        alert('Invalid template JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const copyVariable = (varText: string) => {
    navigator.clipboard.writeText(varText);
    setCopiedVariable(varText);
    setTimeout(() => setCopiedVariable(null), 2000);
  };

  if (isSelectingBase) {
    if (viewMode === 'library') {
      return (
        <div className="flex flex-col h-screen w-full bg-[#0e1724] text-gray-100 font-sans overflow-hidden">
          {/* Header with Mode Switcher */}
          <header className="h-14 bg-[#161f2e] border-b border-gray-800 px-6 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer text-xs font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-4 w-px bg-gray-700"></div>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Template Builder Studio</span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#0d1420] border border-gray-700/80 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('studio')}
                className="px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5 text-gray-400 hover:text-white hover:bg-gray-800/60"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Document Blueprints</span>
              </button>
              <button
                onClick={() => setViewMode('library')}
                className="px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5 bg-emerald-600 text-white shadow"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>Category & Section Presets</span>
              </button>
            </div>
          </header>

          {/* Full Screen Section Library Manager */}
          <div className="flex-1 flex overflow-hidden">
            <SectionLibraryManager />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen w-full bg-[#0e1724] text-gray-100 font-sans overflow-hidden">
        {/* Header with Mode Switcher */}
        <header className="h-14 bg-[#161f2e] border-b border-gray-800 px-6 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-gray-700"></div>
            <span className="text-sm font-bold text-white uppercase tracking-wider">Template Builder Studio</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-[#0d1420] border border-gray-700/80 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('studio')}
              className="px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5 bg-emerald-600 text-white shadow"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Document Blueprints</span>
            </button>
            <button
              onClick={() => setViewMode('library')}
              className="px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5 text-gray-400 hover:text-white hover:bg-gray-800/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Category & Section Presets</span>
            </button>
          </div>
        </header>

        {/* Blueprint Selector Panel */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2 max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Choose a Template Blueprint to Customize</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              Select one of the standard business layouts below to edit, or customize reusable section categories in the preset manager.
            </p>
          </div>

          {/* Featured Section & Preset Library Card */}
          <div
            onClick={() => setViewMode('library')}
            className="w-full bg-gradient-to-r from-[#142338] via-[#102a3d] to-[#12232e] border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/60 flex items-center justify-center text-emerald-300 shrink-0 shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Section & Preset Library
                  </h3>
                  <span className="text-[9px] uppercase font-mono tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Template Presets
                  </span>
                </div>
                <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                  Customize pre-filled section contents, tables, clauses, and specifications across document templates.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-2 rounded-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow">
              <span>Open Preset Library</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-2">
            {Object.entries(SAMPLE_TEMPLATES).map(([key, tmpl]) => {
              const normalTitle = 
                key === 'tax_invoice' 
                  ? 'Invoice' 
                  : key === 'quotation' 
                  ? 'Quotation' 
                  : key === 'labour_po' 
                  ? 'Work Order' 
                  : 'Blank Template';

              return (
                <button
                  key={key}
                  onClick={() => {
                    setTemplateDoc(JSON.parse(JSON.stringify(tmpl)));
                    setTemplateName(`Customized ${normalTitle}`);
                    setTemplateDesc(`Custom template based on the standard ${normalTitle} layout.`);
                    setIsSelectingBase(false);
                  }}
                  className="bg-[#131d2d]/80 border border-gray-800 rounded-xl p-5 text-left hover:border-emerald-500/50 hover:bg-[#152338]/60 transition-all shadow-md group/card cursor-pointer flex flex-col justify-between h-40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-mono tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/60">
                        {key === 'quotation' ? 'Quotation Layout' : key === 'tax_invoice' ? 'Invoice Layout' : key === 'labour_po' ? 'Labour PO Layout' : 'Blank Layout'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-2 group-hover/card:text-emerald-400 transition-colors">
                      {normalTitle}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {key === 'quotation' 
                        ? '10-page commercial quotation with specifications, pricing BOQ, vendor listing table, and standard terms.'
                        : key === 'tax_invoice'
                        ? 'GST-compliant tax invoice template with item descriptions, HSN rates, EPF options, and statutory columns.'
                        : key === 'labour_po'
                        ? 'Labour PO Work Order with scope description, rate items, and completion criteria.'
                        : 'Create a customized document blueprint from scratch.'}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-emerald-400 font-semibold group-hover/card:translate-x-1.5 transition-transform mt-2">
                    <span>Start Customizing</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#111827] text-gray-100 font-sans overflow-hidden select-none">
      {/* Studio Header Bar */}
      <header className="h-14 bg-[#161f2e] border-b border-gray-800 px-4 md:px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="text-sm font-bold text-white bg-transparent border-b border-dashed border-gray-600 hover:border-emerald-400 focus:border-emerald-400 focus:outline-none transition-colors px-1 max-w-[240px] sm:max-w-xs md:max-w-md truncate"
                  placeholder="Template Name..."
                />
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-mono hidden md:inline">
                  Template Studio
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate hidden sm:block">
                Visual Architect • Live A4 Preview & Multi-Page Layout Engine
              </p>
            </div>
          </div>
        </div>

        {/* Studio Top Actions */}
        <div className="flex items-center space-x-2">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-[#0d1420] border border-gray-700/80 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('studio')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'studio'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Document Studio</span>
            </button>
            <button
              onClick={() => setViewMode('library')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'library'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Category & Section Presets</span>
            </button>
          </div>

          <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>

          {/* Import / Export */}
          <label className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Import</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>

          <button
            onClick={handleExportJson}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
            title="Export Template as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Export</span>
          </button>

          <div className="h-4 w-px bg-gray-700"></div>

          {/* Save to Library */}
          <button
            onClick={handleSaveToLibrary}
            className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-200 hover:text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 border border-gray-700 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Template</span>
          </button>

          {/* Create Project from this Template */}
          <button
            onClick={handleCreateProject}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Use Template</span>
          </button>
        </div>
      </header>

      {/* When in Library Mode, render SectionLibraryManager full screen */}
      {viewMode === 'library' ? (
        <div className="flex-1 flex overflow-hidden">
          <SectionLibraryManager />
        </div>
      ) : (
        /* Main 2-Pane Workspace */
        <div className="flex-1 flex overflow-hidden">
        {/* Left Config Studio Panel */}
        <div className="w-full md:w-[480px] lg:w-[540px] bg-[#161f2e] border-r border-gray-800 flex flex-col shrink-0 h-full overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-gray-800 bg-[#131a26] px-2 pt-2">
            {[
              { id: 'basics', label: 'Company & Meta', icon: Building2 },
              { id: 'sections', label: 'Pages & Sections', icon: Layers },
              { id: 'style', label: 'Colors & Style', icon: Palette },
              { id: 'variables', label: 'Placeholders', icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-400 bg-[#161f2e] font-semibold'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#161f2e]/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* TAB 1: Company & Meta */}
            {activeTab === 'basics' && (
              <div className="space-y-4">
                <div className="bg-[#1a2332] p-4 rounded-xl border border-gray-800 space-y-3">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Template Metadata</span>
                  </h3>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Category</label>
                    <select
                      value={templateCategory}
                      onChange={(e) => setTemplateCategory(e.target.value)}
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                      placeholder="Template purpose & scope summary..."
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>

                {/* Company Branding Info */}
                <div className="bg-[#1a2332] p-4 rounded-xl border border-gray-800 space-y-3">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Header Branding & Company Identity</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Company Prefix</label>
                      <input
                        type="text"
                        value={po.companyName || ''}
                        onChange={(e) => updatePO({ companyName: e.target.value })}
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Company Suffix</label>
                      <input
                        type="text"
                        value={po.companySubtitle || ''}
                        onChange={(e) => updatePO({ companySubtitle: e.target.value })}
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={po.gstNo || ''}
                        onChange={(e) => updatePO({ gstNo: e.target.value })}
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Phone / Support</label>
                      <input
                        type="text"
                        value={po.companyPhone || ''}
                        onChange={(e) => updatePO({ companyPhone: e.target.value })}
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-[11px] mb-1">Address Line (Footer)</label>
                    <input
                      type="text"
                      value={po.companyAddressFooter || ''}
                      onChange={(e) => updatePO({ companyAddressFooter: e.target.value })}
                      className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Pages & Sections */}
            {activeTab === 'sections' && (
              <div className="space-y-4">
                {/* Page Manager */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Multi-Page Architecture</span>
                  <button
                    onClick={handleAddCustomPage}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-md text-[11px] flex items-center space-x-1 cursor-pointer transition-colors shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Annexure Page</span>
                  </button>
                </div>

                {/* Built-in Sections Cards */}
                <div className="space-y-2">
                  <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        1
                      </div>
                      <div>
                        <div className="font-semibold text-white">Header & Scope of Work</div>
                        <div className="text-[10px] text-gray-400">Page 1 • Standard Built-in</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Core</span>
                  </div>

                  <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        2
                      </div>
                      <div>
                        <div className="font-semibold text-white">Rates & Scope of Contractor</div>
                        <div className="text-[10px] text-gray-400">Page 2 • Standard Built-in</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Core</span>
                  </div>

                  <div className="bg-[#1a2332] p-3 rounded-lg border border-gray-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                        3
                      </div>
                      <div>
                        <div className="font-semibold text-white">Terms & Milestone Payments</div>
                        <div className="text-[10px] text-gray-400">Page 3 • Standard Built-in</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Core</span>
                  </div>
                </div>

                {/* Custom Sections List */}
                <div className="pt-2">
                  <h4 className="font-semibold text-gray-300 mb-2 flex items-center justify-between">
                    <span>Custom Sections & Annexures ({po.customSections?.length || 0})</span>
                  </h4>

                  {(!po.customSections || po.customSections.length === 0) ? (
                    <div className="p-4 bg-[#111827] border border-dashed border-gray-800 rounded-xl text-center text-gray-500">
                      No custom annexure sections yet. Choose a preset below to add one instantly.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {po.customSections.map((sec) => (
                        <div
                          key={sec.id}
                          className="bg-[#1a2332] p-3 rounded-lg border border-gray-800 flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-medium text-white">{sec.title}</div>
                            <div className="text-[10px] text-gray-400">
                              Assigned to Page {sec.pageNumber} • Type: {sec.contentType}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCustomSection(sec.id)}
                            className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Remove Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Predefined Presets Quick Add */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-300">Quick Add Preset Module:</h4>
                    <button
                      onClick={() => setViewMode('library')}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Manage Categories & Sections →</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PREDEFINED_SECTION_TYPES.map((preset) => (
                      <button
                        key={preset.type}
                        onClick={() => handleAddPresetSection(preset.type)}
                        className="p-2.5 bg-[#1a2332] hover:bg-[#202c3f] border border-gray-800 hover:border-emerald-500/50 rounded-lg text-left transition-colors cursor-pointer group"
                      >
                        <div className="font-semibold text-white group-hover:text-emerald-300 text-[11px]">
                          + {preset.label}
                        </div>
                        <div className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                          {preset.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Colors & Style */}
            {activeTab === 'style' && (
              <div className="space-y-4">
                <div className="bg-[#1a2332] p-4 rounded-xl border border-gray-800 space-y-3">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span>Accent Theme Palette</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCENT_COLORS.map((item) => (
                      <button
                        key={item.color}
                        onClick={() => handleAccentColorChange(item.color)}
                        className={`p-2.5 rounded-lg border flex items-center space-x-2.5 transition-all cursor-pointer ${
                          templateDoc.settings?.accentColor === item.color
                            ? 'border-emerald-400 bg-[#223044] shadow'
                            : 'border-gray-800 bg-[#111827] hover:border-gray-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[11px] text-gray-200 font-medium truncate">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography & Layout */}
                <div className="bg-[#1a2332] p-4 rounded-xl border border-gray-800 space-y-3">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <PenTool className="w-4 h-4 text-emerald-400" />
                    <span>Typography & Print Specs</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Font Family</label>
                      <select
                        value={templateDoc.settings?.fontFamily || 'helvetica'}
                        onChange={(e) =>
                          setTemplateDoc({
                            ...templateDoc,
                            settings: { ...templateDoc.settings, fontFamily: e.target.value as any },
                          })
                        }
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="helvetica">Helvetica / Sans-Serif</option>
                        <option value="times">Times New Roman / Serif</option>
                        <option value="courier">Courier / Monospace</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-[11px] mb-1">Base Font Size</label>
                      <select
                        value={templateDoc.settings?.fontSize || '10pt'}
                        onChange={(e) =>
                          setTemplateDoc({
                            ...templateDoc,
                            settings: { ...templateDoc.settings, fontSize: e.target.value as any },
                          })
                        }
                        className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="9pt">9pt (Compact Dense)</option>
                        <option value="10pt">10pt (Standard A4)</option>
                        <option value="11pt">11pt (Spacious)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Dynamic Variables & Placeholders */}
            {activeTab === 'variables' && (
              <div className="space-y-4">
                <div className="bg-[#1a2332] p-4 rounded-xl border border-gray-800 space-y-3">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Dynamic Placeholders</span>
                  </h3>
                  <p className="text-gray-400 text-[11px]">
                    Use these tags anywhere in your template text to automatically auto-fill values when a new document is generated.
                  </p>

                  <div className="space-y-2 pt-1">
                    {[
                      { tag: '{{CONTRACTOR_NAME}}', desc: 'Full Name of the Contractor / Vendor' },
                      { tag: '{{PROJECT_NAME}}', desc: 'Name of the Civil / PEB Construction Project' },
                      { tag: '{{PROJECT_LOCATION}}', desc: 'Site location address and TP/City' },
                      { tag: '{{PO_NUMBER}}', desc: 'Document Reference Number (e.g. GI/CIVIL/2026/101)' },
                      { tag: '{{PO_DATE}}', desc: 'Issuance date in DD/MM/YYYY format' },
                      { tag: '{{TOTAL_AMOUNT}}', desc: 'Total contract valuation in INR' },
                      { tag: '{{COMPANY_NAME}}', desc: 'Primary issuing corporate entity' },
                    ].map((item) => (
                      <div
                        key={item.tag}
                        onClick={() => copyVariable(item.tag)}
                        className="p-2.5 bg-[#111827] hover:bg-[#1a2536] border border-gray-800 hover:border-emerald-500/40 rounded-lg flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="font-mono text-emerald-400 font-semibold text-xs flex items-center space-x-1.5">
                            <span>{item.tag}</span>
                            {copiedVariable === item.tag && (
                              <span className="text-[10px] text-emerald-300 font-sans font-normal">
                                Copied!
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.desc}</div>
                        </div>
                        <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live A4 Preview Canvas */}
        <div className="flex-1 bg-[#0b1320] flex flex-col h-full overflow-hidden relative">
          {/* Zoom / Canvas Controls */}
          <div className="h-10 bg-[#131c2a] border-b border-gray-800 px-4 flex items-center justify-between text-xs text-gray-300 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-white">Live A4 Layout Canvas</span>
              <span className="text-[10px] text-gray-500">• WYSIWYG Print Emulation</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewZoom((z) => Math.max(50, z - 10))}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-gray-400 w-10 text-center">
                {previewZoom}%
              </span>
              <button
                onClick={() => setPreviewZoom((z) => Math.min(150, z + 10))}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewZoom(90)}
                className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded text-[10px]"
              >
                Fit
              </button>
            </div>
          </div>

          {/* Interactive Scaled Preview Container */}
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
            <div
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="shadow-2xl"
            >
              <DocumentPreview
                document={templateDoc}
                zoomLevel={previewZoom}
                setZoomLevel={setPreviewZoom}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-medium border border-emerald-500/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
