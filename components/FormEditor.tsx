'use client';

import React from 'react';
import {
  Plus,
  Trash2,
  Building,
  Briefcase,
  DollarSign,
  Layers,
  FileCheck,
  CheckCircle2,
  FileSignature,
  FileSpreadsheet,
  ShieldAlert,
  Settings2,
  LayoutTemplate,
  BookmarkCheck,
  Phone,
  Mail,
  Globe,
  MapPin,
  Sparkles,
  FileText,
  Clock,
} from 'lucide-react';
import {
  LatexDocument,
  PurchaseOrderData,
  PORateItem,
  CustomSectionItem,
} from '@/types/document';
import { numberToIndianWords } from '@/lib/number-to-words';
import {
  sanitizeNumericInput,
  formatDateInput,
  sanitizePhoneInput,
  formatGstInput,
} from '@/lib/validation';
import { TaxInvoiceFormEditor } from './TaxInvoiceFormEditor';
import { QuotationFormEditor } from './QuotationFormEditor';
import { PREDEFINED_SECTION_TYPES } from '@/lib/section-presets';
import {
  getSectionPageNumber,
  getDocumentOutlineGroups,
  moveSectionToPage,
} from '@/lib/document-sections';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

interface FormEditorProps {
  document: LatexDocument;
  activeSectionId: string;
  onSelectSection?: (secId: string) => void;
  onChange: (updatedDoc: LatexDocument) => void;
  onOpenGlobalVariables?: () => void;
}

import { DynamicTemplateEditor } from '@/components/DynamicTemplateEditor';
import { SAMPLE_GENERIC_TEMPLATE } from '@/lib/sample_template';

export const FormEditor: React.FC<FormEditorProps> = ({
  document: doc,
  activeSectionId,
  onSelectSection,
  onChange,
  onOpenGlobalVariables,
}) => {
  // Helpers to update document immutably
  const updateDoc = (fields: Partial<LatexDocument>) => {
    onChange({ ...doc, ...fields });
  };

  const updatePO = (poFields: Partial<PurchaseOrderData>) => {
    if (!doc.purchaseOrder) return;
    onChange({
      ...doc,
      purchaseOrder: {
        ...doc.purchaseOrder,
        ...poFields,
      },
    });
  };

  if (doc.quotation) {
    return (
      <QuotationFormEditor
        document={doc}
        activeSectionId={activeSectionId}
        onChange={onChange}
        onOpenGlobalVariables={onOpenGlobalVariables}
      />
    );
  }

  if (doc.taxInvoice) {
    return (
      <TaxInvoiceFormEditor
        document={doc}
        activeSectionId={activeSectionId}
        onSelectSection={onSelectSection}
        onChange={onChange}
        onOpenGlobalVariables={onOpenGlobalVariables}
      />
    );
  }

  if (doc.dynamicTemplate) {
    return (
      <DynamicTemplateEditor
        schema={SAMPLE_GENERIC_TEMPLATE}
        documentData={doc.dynamicTemplate}
        onChange={(newDynamicDoc) => onChange({ ...doc, dynamicTemplate: newDynamicDoc })}
        activeSectionId={activeSectionId}
        onSelectSection={onSelectSection}
      />
    );
  }

  if (!doc.purchaseOrder) {
    return (
      <aside className="w-full bg-[#f4f3eb] text-black flex flex-col h-full shrink-0 select-none overflow-hidden">
        <div className="px-4 py-3 border-b border-[#cccccc] bg-white flex justify-between items-center shrink-0">
          <h2 className="font-bold text-xs uppercase tracking-wider text-black">
            Document Settings
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-black uppercase">
              Document Title
            </label>
            <input
              type="text"
              value={doc.title}
              onChange={(e) => updateDoc({ title: e.target.value })}
              className="w-full bg-white border border-[#cccccc] rounded px-3 py-2 text-sm text-black font-medium"
            />
          </div>
        </div>
      </aside>
    );
  }

  const po = doc.purchaseOrder;
  const outlineGroups = React.useMemo(() => getDocumentOutlineGroups(po), [po]);
  const availablePages = React.useMemo(() => outlineGroups.map((g) => g.pageNum), [outlineGroups]);

  // Check if activeSectionId is a custom section
  const customSection = po.customSections?.find((s) => s.id === activeSectionId);

  // Section title and page mapping
  const sectionMeta: Record<
    string,
    { title: string; subtitle: string; page: string | number; icon: React.ElementType }
  > = {
    info: {
      title: 'PO Info & Parties',
      subtitle: 'PO Number, Date, Contractor, Project details',
      page: 1,
      icon: Building,
    },
    award_letter: {
      title: 'Award Letter & Salutation',
      subtitle: 'Recipient, Designation, Subject line, Greeting & Award text (Page 1)',
      page: 1,
      icon: FileText,
    },
    contract_value: {
      title: '1. Contract Value',
      subtitle: 'Lumpsum value, inclusions & extra payment terms (Page 1)',
      page: 1,
      icon: DollarSign,
    },
    scope: {
      title: '2. Scope of Work',
      subtitle: 'Itemized list of execution duties & responsibilities (Page 1)',
      page: 1,
      icon: Briefcase,
    },
    rates: {
      title: 'Rates & Pricing Table',
      subtitle: 'Line items, description, unit, qty, rate, and amount in words',
      page: 1,
      icon: DollarSign,
    },
    company_scope: {
      title: '3. Company Scope',
      subtitle: 'Materials supplied by Company (Page 2)',
      page: 2,
      icon: Building,
    },
    contractor_scope: {
      title: '4. Contractor Scope',
      subtitle: 'Contractor obligations, skilled manpower & equipment (Page 2)',
      page: 2,
      icon: Layers,
    },
    scope_contractor: {
      title: '3. Company & 4. Contractor Scope',
      subtitle: 'Materials supplied by Company & Contractor obligations (Page 2)',
      page: 2,
      icon: Layers,
    },
    payment_terms: {
      title: 'Payment Terms & Milestones',
      subtitle: 'Milestones, billing schedules, and stage-wise payments (Page 2)',
      page: 2,
      icon: DollarSign,
    },
    quality_clause: {
      title: '5. Quality',
      subtitle: 'Workmanship standards & drawing compliance (Page 2)',
      page: 2,
      icon: CheckCircle2,
    },
    material_clause: {
      title: '6. Material Responsibility',
      subtitle: 'Company property, storage, wastage & recovery (Page 2)',
      page: 2,
      icon: Building,
    },
    safety_clause: {
      title: '7. Safety',
      subtitle: 'Safety rules, PPE compliance & accident liability (Page 2)',
      page: 2,
      icon: ShieldAlert,
    },
    measurement: {
      title: 'Measurement & Payment Clause',
      subtitle: 'Quantity estimation, weight measurement and variations (Page 2)',
      page: 2,
      icon: ShieldAlert,
    },
    labour_laws: {
      title: '8. Labour Laws',
      subtitle: 'Statutory compliance (Minimum wages, PF, ESIC) & liability (Page 3)',
      page: 3,
      icon: FileCheck,
    },
    payment_clause: {
      title: '9. Measurement & Payment',
      subtitle: 'Milestone payment stages, bill certification & deductions (Page 3)',
      page: 3,
      icon: DollarSign,
    },
    terms: {
      title: 'Terms & Conditions',
      subtitle: 'Commercial terms & conditions (Page 3)',
      page: 3,
      icon: FileCheck,
    },
    time_schedule: {
      title: '10. Time Schedule',
      subtitle: '60-day completion timeframe & delay penalty terms (Page 3)',
      page: 3,
      icon: Clock,
    },
    page3_terms: {
      title: 'General Terms (Clauses 11–16)',
      subtitle: 'Housekeeping, warranty, variations, termination & jurisdiction (Page 3)',
      page: 3,
      icon: FileText,
    },
    signatures: {
      title: 'Acceptance & Signatures',
      subtitle: 'Contractor acceptance declaration & authorization blocks (Page 3)',
      page: 3,
      icon: FileSignature,
    },
  };

  const currentSectionPage = getSectionPageNumber(activeSectionId, po);

  const currentMeta =
    customSection
      ? {
          title: customSection.title,
          subtitle: `Custom Section on Page ${currentSectionPage}`,
          page: currentSectionPage,
          icon: BookmarkCheck,
        }
      : sectionMeta[activeSectionId]
      ? {
          ...sectionMeta[activeSectionId],
          page: currentSectionPage,
        }
      : sectionMeta.info;

  const CurrentIcon = currentMeta.icon;

  // Rate item CRUD
  const calculateTotalWords = (items: PORateItem[]) => {
    let sum = 0;
    items.forEach((item) => {
      const q = parseFloat(item.qty) || 0;
      const r = parseFloat(item.rate) || 0;
      const t = parseFloat(item.total.replace(/[^0-9.]/g, '')) || (q * r);
      sum += isNaN(t) ? 0 : t;
    });
    return numberToIndianWords(sum, 'Rupees ');
  };

  const handleRateChange = (id: string, field: keyof PORateItem, val: string) => {
    let sanitizedVal = val;
    if (field === 'qty' || field === 'rate') {
      sanitizedVal = sanitizeNumericInput(val, true);
    }
    const updated = po.rateItems.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: sanitizedVal };
        if (field === 'qty' || field === 'rate') {
          const q = parseFloat(field === 'qty' ? sanitizedVal : next.qty) || 0;
          const r = parseFloat(field === 'rate' ? sanitizedVal : next.rate) || 0;
          next.total = `${(q * r).toLocaleString('en-IN')}/-`;
        }
        return next;
      }
      return item;
    });
    const words = calculateTotalWords(updated);
    updatePO({ rateItems: updated, amountInWords: words });
  };

  const handleAddRateRow = () => {
    const newItem: PORateItem = {
      id: `rate_${Date.now()}`,
      description: 'New Line Item Execution Description',
      unit: 'SQFT',
      qty: '100',
      rate: '50',
      total: '5,000/-',
    };
    const nextList = [...po.rateItems, newItem];
    const words = calculateTotalWords(nextList);
    updatePO({ rateItems: nextList, amountInWords: words });
  };

  const handleDeleteRateRow = (id: string) => {
    const nextList = po.rateItems.filter((i) => i.id !== id);
    const words = calculateTotalWords(nextList);
    updatePO({ rateItems: nextList, amountInWords: words });
  };

  // Custom section update helper
  const handleUpdateCustomSection = (updated: Partial<CustomSectionItem>) => {
    if (!customSection || !po.customSections) return;
    const nextList = po.customSections.map((s) =>
      s.id === customSection.id ? { ...s, ...updated } : s
    );
    updatePO({ customSections: nextList });
  };

  return (
    <aside className="w-full bg-[#f4f3eb] text-black flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Single Unified Header */}
      <div className="px-3.5 py-2 border-b border-[#cccccc] bg-[#f0efe6] flex items-center justify-between shrink-0 h-[49px]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="bg-[#dfe7f4] p-1.5 rounded-lg border border-[#cccccc] text-[#0d3479] shrink-0">
            <CurrentIcon className="w-3.5 h-3.5" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-black leading-tight truncate">{currentMeta.title}</div>
            <div className="text-[10px] text-black leading-tight truncate">{currentMeta.subtitle}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#dfe7f4] text-[#0d3479] border border-[#0d3479] rounded-md font-semibold">
            {typeof currentSectionPage === 'number' ? `Page ${currentSectionPage}` : currentSectionPage}
          </span>
        </div>
      </div>

      {/* Dynamic Configuration Form based on Active Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
        {/* ========================================================================= */}

        {/* 1. PO INFO & PARTIES */}
        {activeSectionId === 'info' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                Document Heading Title
              </label>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => updateDoc({ title: e.target.value })}
                placeholder="LABOUR CONTRACT PURCHASE ORDER"
                className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-xl text-xs text-black focus:border-[#0d3479] focus:ring-1 focus:ring-[#0d3479]/20 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                  PO Number
                </label>
                <input
                  type="text"
                  value={po.poNumber}
                  onChange={(e) => updatePO({ poNumber: e.target.value })}
                  placeholder="PO-2026-001"
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs focus:ring-1 focus:ring-[#0d3479] text-black font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                  PO Date (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={po.poDate}
                  onChange={(e) => updatePO({ poDate: formatDateInput(e.target.value) })}
                  placeholder="DD/MM/YYYY"
                  maxLength={10}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs focus:ring-1 focus:ring-[#0d3479] text-black font-medium font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-[#cccccc]/80 rounded space-y-2.5">
              <span className="block font-bold text-[#0d3479] uppercase text-[10.5px]">
                Contractor & Project Info
              </span>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5">Contractor Name</label>
                <input
                  type="text"
                  value={po.contractorName}
                  onChange={(e) => updatePO({ contractorName: e.target.value })}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={po.projectName}
                  onChange={(e) => updatePO({ projectName: e.target.value })}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5">Project Location (Address)</label>
                <textarea
                  rows={2}
                  value={po.projectLocation}
                  onChange={(e) => updatePO({ projectLocation: e.target.value })}
                  placeholder="Site / Project Location Address"
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-black font-semibold text-xs resize-y focus:outline-none focus:border-[#0d3479]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5">Contract Type</label>
                <input
                  type="text"
                  value={po.contractType || ''}
                  onChange={(e) => updatePO({ contractType: e.target.value })}
                  placeholder="e.g. Civil Labour Contract (Lumpsum/Uchak)"
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* AWARD LETTER & SALUTATION */}
        {activeSectionId === 'award_letter' && (
          <div className="space-y-3">
            <div className="bg-white p-3.5 rounded-2xl border border-[#cccccc] space-y-3">
              <span className="block font-bold text-[#0d3479] uppercase text-xs">
                Award Salutation & Greeting
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-black">Recipient Prefix</label>
                  <input
                    type="text"
                    value={po.awardToPrefix || 'To,'}
                    onChange={(e) => updatePO({ awardToPrefix: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-black">Recipient Name</label>
                  <input
                    type="text"
                    value={po.awardRecipient || ''}
                    onChange={(e) => updatePO({ awardRecipient: e.target.value })}
                    placeholder="M/s. Mohammad Kamil Shaikh"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-black">Contractor Designation</label>
                  <input
                    type="text"
                    value={po.awardDesignation || ''}
                    onChange={(e) => updatePO({ awardDesignation: e.target.value })}
                    placeholder="Labour Contractor"
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-black">Greeting</label>
                  <input
                    type="text"
                    value={po.awardGreeting || 'Dear Sir,'}
                    onChange={(e) => updatePO({ awardGreeting: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black">Subject Line</label>
                <input
                  type="text"
                  value={po.awardSubject || ''}
                  onChange={(e) => updatePO({ awardSubject: e.target.value })}
                  placeholder="Award of Civil Labour Contract"
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-black">Award Letter Opening Paragraph</label>
                <textarea
                  rows={3}
                  value={po.awardLetterBody || ''}
                  onChange={(e) => updatePO({ awardLetterBody: e.target.value })}
                  placeholder="We are pleased to award you the Civil Labour Contract for the above-mentioned project on the following terms and conditions."
                  className="w-full mt-1 px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 1. CONTRACT VALUE */}
        {activeSectionId === 'contract_value' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.contractValueClause || []}
              onChange={(val) => updatePO({ contractValueClause: Array.isArray(val) ? val : [val] })}
              label="1. Contract Value Paragraphs (Page 1)"
              placeholder="Enter contract value terms... Press Enter for a new clause or paragraph."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 2. SCOPE OF WORK (PAGE 1) */}
        {activeSectionId === 'scope' && (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg border border-[#cccccc] space-y-2">
              <label className="block text-[11px] font-bold text-[#0d3479] uppercase">
                Scope Header / Intro Line
              </label>
              <input
                type="text"
                value={po.scopeIntro || ''}
                onChange={(e) => updatePO({ scopeIntro: e.target.value })}
                placeholder="The contractor shall execute complete civil labour work, including but not limited to:"
                className="w-full px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0d3479] uppercase text-[10.5px]">
                Scope of Work Items ({po.scopeOfWork.length})
              </span>
              <button
                onClick={() =>
                  updatePO({
                    scopeOfWork: [...po.scopeOfWork, 'New item execution clause...'],
                  })
                }
                className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            {po.scopeOfWork.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="font-bold text-black text-xs mt-1.5">{idx + 1}.</span>
                <textarea
                  rows={2}
                  value={item}
                  onChange={(e) => {
                    const updated = [...po.scopeOfWork];
                    updated[idx] = e.target.value;
                    updatePO({ scopeOfWork: updated });
                  }}
                  className="flex-1 bg-white border border-[#cccccc] rounded p-2 text-xs text-black"
                />
                <button
                  onClick={() => {
                    const updated = po.scopeOfWork.filter((_, i) => i !== idx);
                    updatePO({ scopeOfWork: updated });
                  }}
                  className="p-1 text-[#666666] hover:text-red-400 rounded mt-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 3. RATES & PRICING TABLE (PAGE 1) */}
        {activeSectionId === 'rates' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0d3479] uppercase text-xs tracking-wide">
                Rate ({po.rateItems.length} {po.rateItems.length === 1 ? 'Item' : 'Items'})
              </span>
              <button
                onClick={handleAddRateRow}
                className="px-2.5 py-1 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Tabular Form matching Document Preview Table Layout */}
            <div className="bg-white border border-[#cccccc] rounded-xl overflow-hidden shadow-xs">
              {/* Header Row matching Preview Columns */}
              <div className="grid grid-cols-12 gap-1.5 bg-[#f0efe6] px-3 py-2 border-b border-[#cccccc] text-[10.5px] font-bold text-[#0d3479] uppercase tracking-wider items-center">
                <div className="col-span-4">Description</div>
                <div className="col-span-2 text-center">Unit</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Rate</div>
                <div className="col-span-2 text-right pr-6">Total</div>
              </div>

              {/* Data Rows matching horizontal column placement */}
              <div className="divide-y divide-[#cccccc]">
                {po.rateItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-1.5 p-2.5 items-center hover:bg-[#f7f7f2]/60 transition-colors group"
                  >
                    {/* Description */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleRateChange(item.id, 'description', e.target.value)
                        }
                        placeholder={`Description #${index + 1}`}
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-2.5 py-1.5 text-black font-semibold text-xs focus:border-[#0d3479] focus:outline-none placeholder:text-[#888888]"
                      />
                    </div>

                    {/* Unit */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleRateChange(item.id, 'unit', e.target.value)
                        }
                        placeholder="Unit"
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-black text-center text-xs focus:border-[#0d3479] focus:outline-none"
                      />
                    </div>

                    {/* Qty */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) =>
                          handleRateChange(item.id, 'qty', e.target.value)
                        }
                        placeholder="Qty"
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-black text-center text-xs font-mono focus:border-[#0d3479] focus:outline-none"
                      />
                    </div>

                    {/* Rate */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.rate}
                        onChange={(e) =>
                          handleRateChange(item.id, 'rate', e.target.value)
                        }
                        placeholder="Rate"
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-black text-center text-xs font-mono focus:border-[#0d3479] focus:outline-none"
                      />
                    </div>

                    {/* Total & Delete Button */}
                    <div className="col-span-2 flex items-center space-x-1">
                      <input
                        type="text"
                        value={item.total}
                        onChange={(e) =>
                          handleRateChange(item.id, 'total', e.target.value)
                        }
                        placeholder="Total"
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-2 py-1.5 text-black font-bold font-mono text-xs text-right focus:border-[#0d3479] focus:outline-none"
                      />
                      {po.rateItems.length > 1 && (
                        <button
                          onClick={() => handleDeleteRateRow(item.id)}
                          className="p-1.5 text-[#888888] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Row: Amount in Words */}
              <div className="p-3 bg-[#f7f7f2] border-t border-[#cccccc] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#0d3479] uppercase tracking-wide">
                    Amount in Words:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const words = calculateTotalWords(po.rateItems);
                      updatePO({ amountInWords: words });
                    }}
                    className="text-[10px] text-[#0d3479] bg-[#dfe7f4] hover:bg-[#d0ddf0] border border-[#b9c7de] px-2 py-0.5 rounded-md flex items-center space-x-1 cursor-pointer font-bold transition-all shadow-xs"
                    title="Auto generate words from Line Items total"
                  >
                    <Sparkles className="w-3 h-3 text-[#0d3479]" />
                    <span>Auto-Convert</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={po.amountInWords}
                  onChange={(e) => updatePO({ amountInWords: e.target.value })}
                  placeholder="e.g. INR Fifty Thousand Only"
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-2.5 py-1.5 text-black font-semibold text-xs focus:border-[#0d3479] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Add Row Button at bottom */}
            <button
              onClick={handleAddRateRow}
              className="w-full py-2 bg-white hover:bg-slate-50 border border-dashed border-[#cccccc] hover:border-[#0d3479] text-[#0d3479] rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Another Rate Row</span>
            </button>
          </div>
        )}

        {/* 3. COMPANY SCOPE (PAGE 2) */}
        {(activeSectionId === 'company_scope' || activeSectionId === 'scope_contractor') && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-[#cccccc] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0d3479] uppercase text-[11px]">
                  3. Company Scope (Materials Supplied)
                </span>
                <button
                  onClick={() =>
                    updatePO({
                      companyScope: [...(po.companyScope || []), 'New material...'],
                    })
                  }
                  className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Material</span>
                </button>
              </div>

              <input
                type="text"
                value={po.companyScopeIntro || ''}
                onChange={(e) => updatePO({ companyScopeIntro: e.target.value })}
                placeholder="Global Industries shall supply only the following construction materials:"
                className="w-full px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold"
              />

              <div className="space-y-1.5">
                {(po.companyScope || []).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="font-bold text-black text-xs">&bull;</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...(po.companyScope || [])];
                        updated[idx] = e.target.value;
                        updatePO({ companyScope: updated });
                      }}
                      className="flex-1 bg-white border border-[#cccccc] rounded px-2 py-1 text-xs text-black"
                    />
                    <button
                      onClick={() =>
                        updatePO({
                          companyScope: (po.companyScope || []).filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 text-[#666666] hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. CONTRACTOR SCOPE (PAGE 2) */}
        {(activeSectionId === 'contractor_scope' || activeSectionId === 'scope_contractor') && (
          <div className="space-y-4">
            <div className="bg-white p-3.5 rounded-xl border border-[#cccccc] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0d3479] uppercase text-[11px]">
                  4. Contractor Scope (Contractor Obligations)
                </span>
                <button
                  onClick={() =>
                    updatePO({
                      contractorScope: [...(po.contractorScope || []), 'New contractor obligation...'],
                    })
                  }
                  className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Obligation</span>
                </button>
              </div>

              <input
                type="text"
                value={po.contractorScopeIntro || ''}
                onChange={(e) => updatePO({ contractorScopeIntro: e.target.value })}
                placeholder="The contractor shall arrange at his own cost:"
                className="w-full px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold"
              />

              <div className="space-y-1.5">
                {(po.contractorScope || []).map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="font-bold text-black text-xs">&bull;</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...(po.contractorScope || [])];
                        updated[idx] = e.target.value;
                        updatePO({ contractorScope: updated });
                      }}
                      className="flex-1 bg-white border border-[#cccccc] rounded px-2 py-1 text-xs text-black"
                    />
                    <button
                      onClick={() =>
                        updatePO({
                          contractorScope: (po.contractorScope || []).filter((_, i) => i !== idx),
                        })
                      }
                      className="p-1 text-[#666666] hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. QUALITY (PAGE 2) */}
        {activeSectionId === 'quality_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={
                po.qualityClause && po.qualityClause.length > 0
                  ? po.qualityClause
                  : [
                      'The contractor shall execute all works strictly as per approved drawings, specifications and Site Engineer instructions.',
                      'Any defective, rejected or poor-quality work shall be dismantled and re-executed by the contractor at his own cost without any additional payment.',
                    ]
              }
              onChange={(val) => updatePO({ qualityClause: Array.isArray(val) ? val : [val] })}
              label="5. Quality Clause (Page 2)"
              placeholder="Enter quality standards and defect dismantling terms..."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 6. MATERIAL RESPONSIBILITY (PAGE 2) */}
        {activeSectionId === 'material_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={
                po.materialClause && po.materialClause.length > 0
                  ? po.materialClause
                  : [
                      'All materials supplied by Global Industries shall remain the sole property of the Company. The contractor shall ensure proper handling, storage and usage. Any loss, theft, damage or excessive wastage due to negligence shall be recovered from the contractor\'s bills.',
                    ]
              }
              onChange={(val) => updatePO({ materialClause: Array.isArray(val) ? val : [val] })}
              label="6. Material Responsibility Clause (Page 2)"
              placeholder="Enter company property, storage and wastage recovery terms..."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 7. SAFETY (PAGE 2) */}
        {activeSectionId === 'safety_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={
                po.safetyClause && po.safetyClause.length > 0
                  ? po.safetyClause
                  : [
                      'The contractor shall strictly comply with all applicable safety rules and regulations. All workers shall wear proper PPE while working. The contractor shall be solely responsible for any accident, injury, death or property damage arising due to negligence or violation of safety norms.',
                    ]
              }
              onChange={(val) => updatePO({ safetyClause: Array.isArray(val) ? val : [val] })}
              label="7. Safety Clause (Page 2)"
              placeholder="Enter safety norms, PPE and liability terms..."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* MEASUREMENT & PAYMENT CLAUSE (FABRICATION / LEGACY) */}
        {activeSectionId === 'measurement' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.measurementClause || []}
              onChange={(val) => updatePO({ measurementClause: Array.isArray(val) ? val : [val] })}
              label="Measurement & Payment Clause (Page 2)"
              placeholder="Enter measurement basis, weight terms and variations..."
              minHeight="200px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 8. LABOUR LAWS (PAGE 3) */}
        {activeSectionId === 'labour_laws' && (() => {
          const defaultLaws = [
            'Minimum Wages Act / applicable minimum wage requirements',
            'Labour License',
            'PF',
            'ESIC',
            'Workmen Compensation Insurance',
            'Building & Other Construction Workers Act',
            'Any other applicable statutory requirement',
          ];
          const defaultIntro = 'The contractor shall comply with all applicable labour laws and statutory requirements, including:';
          const defaultDisclaimer = 'All labour-related statutory liabilities, compliances and labour disputes shall be the sole responsibility of the Labour Contractor. Global Industries shall not be responsible for the same.';

          const intro = po.labourLawsIntro !== undefined && po.labourLawsIntro !== '' ? po.labourLawsIntro : defaultIntro;
          const items = (po.labourLawsItems && po.labourLawsItems.length > 0) ? po.labourLawsItems : defaultLaws;
          const disclaimer = po.labourLawsDisclaimer !== undefined && po.labourLawsDisclaimer !== '' ? po.labourLawsDisclaimer : defaultDisclaimer;

          return (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-[#cccccc] space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0d3479] uppercase mb-1">
                    8. Labour Laws Intro Line
                  </label>
                  <input
                    type="text"
                    value={intro}
                    onChange={(e) => updatePO({ labourLawsIntro: e.target.value })}
                    placeholder={defaultIntro}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-[#0d3479] uppercase">
                      Statutory Compliances ({items.length})
                    </label>
                    <button
                      onClick={() =>
                        updatePO({
                          labourLawsItems: [...items, 'New statutory requirement'],
                        })
                      }
                      className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Requirement</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="font-bold text-black text-xs">&bull;</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx] = e.target.value;
                            updatePO({ labourLawsItems: updated });
                          }}
                          className="flex-1 bg-white border border-[#cccccc] rounded px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#0d3479]"
                        />
                        <button
                          onClick={() =>
                            updatePO({
                              labourLawsItems: items.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-[#666666] hover:text-red-500 cursor-pointer"
                          title="Delete requirement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#0d3479] uppercase mb-1">
                    Liability Disclaimer
                  </label>
                  <textarea
                    rows={3}
                    value={disclaimer}
                    onChange={(e) => updatePO({ labourLawsDisclaimer: e.target.value })}
                    placeholder={defaultDisclaimer}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#cccccc] rounded-lg text-xs text-black leading-relaxed focus:outline-none focus:border-[#0d3479]"
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* 9. MEASUREMENT & PAYMENT (PAGE 3) */}
        {activeSectionId === 'payment_clause' && (() => {
          const defaultMilestones = [
            'Total Contract Value: ₹4,70,000/- (Rupees Four Lakh Seventy Thousand Only).',
            'Footing Work Completion: ₹50,000/-',
            'RCC Beam Work: ₹20,000/-',
            'Plinth Completion: ₹50,000/-',
            'Masonry & RCC Work Completion: ₹1,00,000/-',
            'Plaster Work Completion: ₹80,000/-',
            'Floor Concrete Work Completion: ₹1,20,000/-',
            'After Final Completion: ₹50,000/-',
          ];
          const defaultDeductions = [
            'All payments shall be released after verification and certification of the respective stage by the Site Engineer.',
            'Applicable TDS shall be deducted as per Government Rules.',
            'GST shall be paid only against submission of a valid GST Invoice, if applicable.',
            'Any recovery towards defective work, material damage, excess wastage, delay or any other dues shall be deducted from the contractor\'s bills.',
          ];

          const milestones = (po.paymentMilestones && po.paymentMilestones.length > 0) ? po.paymentMilestones : (po.paymentTerms && po.paymentTerms.length > 0 ? po.paymentTerms : defaultMilestones);
          const deductions = (po.paymentDeductionTerms && po.paymentDeductionTerms.length > 0) ? po.paymentDeductionTerms : defaultDeductions;

          return (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-xl border border-[#cccccc] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="block font-bold text-[#0d3479] uppercase text-[11px]">
                    9. Payment Milestones ({milestones.length})
                  </span>
                  <button
                    onClick={() =>
                      updatePO({
                        paymentMilestones: [...milestones, 'New milestone stage: ₹0/-'],
                      })
                    }
                    className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Stage</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {milestones.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="font-bold text-black text-xs">&bull;</span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx] = e.target.value;
                          updatePO({ paymentMilestones: updated, paymentTerms: updated });
                        }}
                        className="flex-1 bg-white border border-[#cccccc] rounded px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#0d3479]"
                      />
                      <button
                        onClick={() =>
                          updatePO({
                            paymentMilestones: milestones.filter((_, i) => i !== idx),
                            paymentTerms: milestones.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1 text-[#666666] hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-[#cccccc]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="block font-bold text-[#0d3479] uppercase text-[10.5px]">
                      Deductions & Billing Rules ({deductions.length})
                    </span>
                    <button
                      onClick={() =>
                        updatePO({
                          paymentDeductionTerms: [...deductions, 'New deduction/billing rule'],
                        })
                      }
                      className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {deductions.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="font-bold text-black text-xs">&bull;</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...deductions];
                            updated[idx] = e.target.value;
                            updatePO({ paymentDeductionTerms: updated });
                          }}
                          className="flex-1 bg-white border border-[#cccccc] rounded px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#0d3479]"
                        />
                        <button
                          onClick={() =>
                            updatePO({
                              paymentDeductionTerms: deductions.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-[#666666] hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TERMS & CONDITIONS (FABRICATION / LEGACY) */}
        {activeSectionId === 'terms' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.termsAndConditions || []}
              onChange={(val) => updatePO({ termsAndConditions: Array.isArray(val) ? val : [val] })}
              label="Terms & Conditions (Page 3)"
              placeholder="Enter general terms and conditions..."
              minHeight="200px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 10. TIME SCHEDULE (PAGE 3) */}
        {activeSectionId === 'time_schedule' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.timeScheduleClause || ['The entire civil construction work shall be completed within 60 (Sixty) days from the date of commencement of work at site. In case of unexcused delay, a penalty of ₹2,000/- (Rupees Two Thousand Only) per day shall be applicable after expiry of the stipulated period.']}
              onChange={(val) => updatePO({ timeScheduleClause: Array.isArray(val) ? val : [val] })}
              label="10. Time Schedule & Delay Penalty (Page 3)"
              placeholder="Enter completion timeframe and delay penalty terms..."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 11. HOUSEKEEPING (PAGE 3) */}
        {activeSectionId === 'housekeeping_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.housekeepingClause || ['The contractor shall maintain the work area in neat and clean condition throughout the execution period and remove debris regularly.']}
              onChange={(val) => updatePO({ housekeepingClause: Array.isArray(val) ? val : [val] })}
              label="11. Housekeeping (Page 3)"
              placeholder="Enter housekeeping terms..."
              minHeight="140px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 12. WARRANTY / DEFECT LIABILITY (PAGE 3) */}
        {activeSectionId === 'warranty_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.warrantyClause || ['The contractor shall rectify any workmanship defects observed during execution or within 6 months from completion of the work without claiming any additional payment.']}
              onChange={(val) => updatePO({ warrantyClause: Array.isArray(val) ? val : [val] })}
              label="12. Warranty / Defect Liability (Page 3)"
              placeholder="Enter warranty and defect liability period..."
              minHeight="140px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 13. VARIATION / EXTRA WORK (PAGE 3) */}
        {activeSectionId === 'variation_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.variationClause || [
                'Any additional or extra work beyond the scope of this Work Order shall be carried out only after obtaining prior written approval from Global Industries.',
                'No verbal instructions shall be considered for extra payment.',
              ]}
              onChange={(val) => updatePO({ variationClause: Array.isArray(val) ? val : [val] })}
              label="13. Variation / Extra Work (Page 3)"
              placeholder="Enter variation / extra work rules..."
              minHeight="160px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 14. TERMINATION (PAGE 3) */}
        {activeSectionId === 'termination_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.terminationClause || [
                'Global Industries reserves the right to terminate this Work Order without prior notice in case of:\n• Poor workmanship\n• Delay in execution\n• Safety violations\n• Labour shortage\n• Non-compliance with statutory requirements\n• Breach of any terms and conditions',
              ]}
              onChange={(val) => updatePO({ terminationClause: Array.isArray(val) ? val : [val] })}
              label="14. Termination (Page 3)"
              placeholder="Enter termination conditions..."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 15. FORCE MAJEURE (PAGE 3) */}
        {activeSectionId === 'force_majeure_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.forceMajeureClause || ['Neither party shall be held responsible for delay caused due to natural calamities, Government restrictions, war, flood, earthquake or any event beyond reasonable control.']}
              onChange={(val) => updatePO({ forceMajeureClause: Array.isArray(val) ? val : [val] })}
              label="15. Force Majeure (Page 3)"
              placeholder="Enter force majeure clause..."
              minHeight="140px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 16. JURISDICTION (PAGE 3) */}
        {activeSectionId === 'jurisdiction_clause' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.jurisdictionClause || ['Any dispute arising out of this Work Order shall be subject to the exclusive jurisdiction of the competent courts at Vadodara, Gujarat only.']}
              onChange={(val) => updatePO({ jurisdictionClause: Array.isArray(val) ? val : [val] })}
              label="16. Jurisdiction (Page 3)"
              placeholder="Enter jurisdiction terms..."
              minHeight="140px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* ACCEPTANCE (PAGE 3) */}
        {activeSectionId === 'acceptance_clause' && (
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-[#0d3479] uppercase">
              Acceptance Declaration (Page 3)
            </label>
            <textarea
              rows={3}
              value={po.acceptanceClause || 'I/We have read, understood and accepted all the above terms and conditions of this Work Order.'}
              onChange={(e) => updatePO({ acceptanceClause: e.target.value })}
              className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs leading-relaxed"
            />
          </div>
        )}

        {/* 11-16. GENERAL TERMS & DEFECT LIABILITY (LEGACY/FALLBACK) */}
        {activeSectionId === 'page3_terms' && (() => {
          const defaultPage3 = [
            '11. Housekeeping: The contractor shall maintain the work area in neat and clean condition throughout the execution period and remove debris regularly.',
            '12. Warranty / Defect Liability: The contractor shall rectify any workmanship defects observed during execution or within 6 months from completion of the work without claiming any additional payment.',
            '13. Variation / Extra Work: Any additional or extra work beyond the scope of this Work Order shall be carried out only after obtaining prior written approval from Global Industries.\nNo verbal instructions shall be considered for extra payment.',
            '14. Termination: Global Industries reserves the right to terminate this Work Order without prior notice in case of:\n• Poor workmanship\n• Delay in execution\n• Safety violations\n• Labour shortage\n• Non-compliance with statutory requirements\n• Breach of any terms and conditions',
            '15. Force Majeure: Neither party shall be held responsible for delay caused due to natural calamities, Government restrictions, war, flood, earthquake or any event beyond reasonable control.',
            '16. Jurisdiction: Any dispute arising out of this Work Order shall be subject to the exclusive jurisdiction of the competent courts at Vadodara, Gujarat only.',
          ];
          const rawTerms = (po.page3Terms && po.page3Terms.length > 0) ? po.page3Terms : defaultPage3;
          const terms = rawTerms.some(t => t.includes('neat and clean condition')) ? rawTerms : defaultPage3;

          return (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="block font-bold uppercase text-[10.5px] text-[#0d3479]">
                  General Terms & Defect Liability (Clauses 11–16)
                </span>
                <button
                  onClick={() => updatePO({ page3Terms: [...terms, 'New clause'] })}
                  className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Clause</span>
                </button>
              </div>
              {terms.map((term, idx) => (
                <div key={idx} className="space-y-1 bg-white p-2 rounded border border-[#cccccc]">
                  <div className="flex justify-between items-center">
                    <label className="block text-black text-[10.5px] font-bold">Clause {idx + 1}</label>
                    <button
                      onClick={() => updatePO({ page3Terms: terms.filter((_, i) => i !== idx) })}
                      className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <textarea
                    rows={term.includes('\n') ? 5 : 2}
                    value={term}
                    onChange={(e) => {
                      const updated = [...terms];
                      updated[idx] = e.target.value;
                      updatePO({ page3Terms: updated });
                    }}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-medium focus:outline-none focus:border-[#0d3479] shadow-xs leading-relaxed"
                  />
                </div>
              ))}
            </div>
          );
        })()}

        {/* ACCEPTANCE & SIGNATURE BLOCKS */}
        {activeSectionId === 'signatures' && (
          <div className="space-y-4">
            <div className="p-3 bg-white border border-[#cccccc]/80 rounded space-y-2">
              <span className="block font-bold text-[#0d3479] uppercase text-[10.5px]">
                Contractor Acceptance Declaration
              </span>
              <textarea
                rows={2}
                value={po.acceptanceClause ?? 'I/We have read, understood and accepted all the above terms and conditions of this Work Order.'}
                onChange={(e) => updatePO({ acceptanceClause: e.target.value })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
              />
            </div>

            <div className="p-3 bg-white border border-[#cccccc]/80 rounded space-y-2">
              <span className="block font-bold text-[#0d3479] uppercase text-[10.5px]">
                Company Signature Designation
              </span>
              <input
                type="text"
                value={`For ${po.companyName}`}
                readOnly
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-bold text-xs"
              />
              <p className="text-[10px] text-black">
                Rendered on Page 3 with authorized signatory stamp block.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#cccccc]/80 rounded space-y-2">
              <span className="block font-bold text-[#0d3479] uppercase text-[10.5px]">
                Contractor Acceptance Designation
              </span>
              <input
                type="text"
                value={`Accepted By Contractor: ${po.contractorName}`}
                readOnly
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-bold text-xs"
              />
              <p className="text-[10px] text-black">
                Rendered on Page 3 with contractor signature and seal acknowledgment.
              </p>
            </div>
          </div>
        )}

        {/* 10. DYNAMIC CUSTOM SECTION EDITOR */}
        {customSection && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                Section Title
              </label>
              <input
                type="text"
                value={customSection.title}
                onChange={(e) => handleUpdateCustomSection({ title: e.target.value })}
                className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-bold"
              />
            </div>

            {/* Page Number Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                Assigned Page Number
              </label>
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                {availablePages.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      const updatedPO = moveSectionToPage(po, customSection.id, pageNum);
                      updatePO(updatedPO);
                    }}
                    className={`flex-1 min-w-[38px] py-1 rounded text-xs font-bold border cursor-pointer transition-colors ${
                      currentSectionPage === pageNum
                        ? 'bg-[#0d3479] border-[#0d3479] text-white'
                        : 'bg-white border-[#cccccc] text-black hover:text-black'
                    }`}
                  >
                    P{pageNum}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-black">
                Move this section to another page or drag it in the Document Outline.
              </p>
            </div>

            {/* Content Type Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-black mb-1.5 uppercase">
                  Section Layout Type
                </label>
                <div className="relative group/preset">
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const [type, presetIdxStr] = val.split(':');
                      const presetIdx = parseInt(presetIdxStr, 10);
                      const opt = PREDEFINED_SECTION_TYPES.find((t) => t.type === type);
                      if (opt && opt.presets[presetIdx]) {
                        const template = opt.presets[presetIdx].factory();
                        handleUpdateCustomSection({
                          contentType: type as any,
                          bullets: template.bullets,
                          paragraphs: template.paragraphs,
                          tableHeaders: template.tableHeaders,
                          tableRows: template.tableRows,
                          keyValuePairs: template.keyValuePairs,
                          calloutText: template.calloutText,
                          calloutType: template.calloutType,
                        });
                      }
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="bg-white text-[#0d3479] border border-[#0d3479]/60 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    <option value="" disabled>
                      ⚡ Insert Preset Template...
                    </option>
                    {PREDEFINED_SECTION_TYPES.map((opt, optIdx) => (
                      <optgroup key={`${opt.label}-${opt.type}-${optIdx}`} label={opt.label}>
                        {opt.presets.map((p, idx) => (
                          <option key={`${p.name}-${idx}`} value={`${opt.type}:${idx}`}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-1">
                {(
                  [
                    { type: 'bullet_list', label: 'List' },
                    { type: 'legal_clause', label: 'Legal' },
                    { type: 'table', label: 'Table' },
                    { type: 'key_value', label: 'Key-Val' },
                    { type: 'callout', label: 'Notice' },
                  ] as const
                ).map(({ type, label }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (customSection.contentType !== type) {
                        const opt = PREDEFINED_SECTION_TYPES.find((t) => t.type === type);
                        const template = opt?.presets[0]?.factory() || {};
                        handleUpdateCustomSection({
                          contentType: type as any,
                          ...template,
                        });
                      }
                    }}
                    className={`px-1.5 py-1 rounded text-[10.5px] font-medium border cursor-pointer text-center truncate ${
                      customSection.contentType === type
                        ? 'bg-[#0d3479] border-[#0d3479] text-white font-bold'
                        : 'bg-white border-[#cccccc] text-black hover:text-black'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bullet List Editor */}
            {customSection.contentType === 'bullet_list' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-[10.5px]">
                    Bullet Items ({(customSection.bullets || []).length})
                  </span>
                  <button
                    onClick={() => {
                      const cur = customSection.bullets || [];
                      handleUpdateCustomSection({
                        bullets: [...cur, 'New bullet item text...'],
                      });
                    }}
                    className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>
                {(customSection.bullets || []).map((b, idx) => (
                  <div key={idx} className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={b}
                      onChange={(e) => {
                        const cur = [...(customSection.bullets || [])];
                        cur[idx] = e.target.value;
                        handleUpdateCustomSection({ bullets: cur });
                      }}
                      className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs text-black"
                    />
                    <button
                      onClick={() => {
                        const cur = (customSection.bullets || []).filter((_, i) => i !== idx);
                        handleUpdateCustomSection({ bullets: cur });
                      }}
                      className="p-1 text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Legal Clause / Paragraphs Editor */}
            {(customSection.contentType === 'legal_clause' ||
              customSection.contentType === 'paragraphs') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-[10.5px]">
                    {customSection.contentType === 'legal_clause'
                      ? 'Legal Numbered Clauses'
                      : 'Paragraphs'}{' '}
                    ({(customSection.paragraphs || []).length})
                  </span>
                  <button
                    onClick={() => {
                      const cur = customSection.paragraphs || [];
                      handleUpdateCustomSection({
                        paragraphs: [
                          ...cur,
                          'The Contractor shall strictly adhere to all applicable statutory rules, terms, and technical directives specified for {{PROJECT_NAME}}.',
                        ],
                      });
                    }}
                    className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Clause</span>
                  </button>
                </div>
                {(customSection.paragraphs || []).map((p, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 bg-white p-2 rounded border border-[#cccccc]">
                    <span className="font-mono font-bold text-[#0d3479] text-xs mt-1 shrink-0">
                      {idx + 1}.0
                    </span>
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const cur = [...(customSection.paragraphs || [])];
                        cur[idx] = e.target.value;
                        handleUpdateCustomSection({ paragraphs: cur });
                      }}
                      className="w-full bg-white border border-[#cccccc] rounded p-2 text-xs text-black"
                    />
                    <button
                      onClick={() => {
                        const cur = (customSection.paragraphs || []).filter((_, i) => i !== idx);
                        handleUpdateCustomSection({ paragraphs: cur });
                      }}
                      className="p-1 text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Key-Value Matrix Editor */}
            {customSection.contentType === 'key_value' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-[10.5px]">
                    Key-Value Parameters ({(customSection.keyValuePairs || []).length})
                  </span>
                  <button
                    onClick={() => {
                      const cur = customSection.keyValuePairs || [];
                      handleUpdateCustomSection({
                        keyValuePairs: [...cur, { key: 'Parameter Name', value: 'Specific Value' }],
                      });
                    }}
                    className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Row</span>
                  </button>
                </div>
                {(customSection.keyValuePairs || []).map((kv, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Key / Label"
                      value={kv.key}
                      onChange={(e) => {
                        const cur = [...(customSection.keyValuePairs || [])];
                        cur[idx] = { ...cur[idx], key: e.target.value };
                        handleUpdateCustomSection({ keyValuePairs: cur });
                      }}
                      className="w-1/3 bg-white border border-[#cccccc] rounded px-2 py-1 text-xs font-semibold text-[#0d3479]"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={kv.value}
                      onChange={(e) => {
                        const cur = [...(customSection.keyValuePairs || [])];
                        cur[idx] = { ...cur[idx], value: e.target.value };
                        handleUpdateCustomSection({ keyValuePairs: cur });
                      }}
                      className="w-2/3 bg-white border border-[#cccccc] rounded px-2 py-1 text-xs text-black"
                    />
                    <button
                      onClick={() => {
                        const cur = (customSection.keyValuePairs || []).filter((_, i) => i !== idx);
                        handleUpdateCustomSection({ keyValuePairs: cur });
                      }}
                      className="p-1 text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Callout Notice Editor */}
            {customSection.contentType === 'callout' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-[10.5px]">
                    Notice Callout Settings
                  </span>
                  <select
                    value={customSection.calloutType || 'warning'}
                    onChange={(e) =>
                      handleUpdateCustomSection({
                        calloutType: e.target.value as 'info' | 'warning' | 'important',
                      })
                    }
                    className="bg-white text-amber-800 border border-amber-700/60 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    <option value="warning">Warning Directive</option>
                    <option value="important">Important Notice</option>
                    <option value="info">General Info</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={customSection.calloutText || ''}
                  onChange={(e) => handleUpdateCustomSection({ calloutText: e.target.value })}
                  placeholder="Enter notice text or mandatory directive..."
                  className="w-full bg-white border border-amber-800/60 rounded p-2 text-xs text-amber-200"
                />
              </div>
            )}

            {/* Table Editor */}
            {customSection.contentType === 'table' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-black text-[10.5px]">
                    Table Headers ({(customSection.tableHeaders || []).length} columns)
                  </span>
                  <button
                    onClick={() => {
                      const curH = customSection.tableHeaders || ['Item', 'Description', 'Remarks'];
                      const curR = customSection.tableRows || [];
                      handleUpdateCustomSection({
                        tableHeaders: [...curH, 'New Header'],
                        tableRows: curR.map((row) => [...row, '-']),
                      });
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-[#123f8f] text-gray-200 hover:text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    + Add Column
                  </button>
                </div>
                <div className="space-y-1.5 overflow-x-auto pb-1">
                  <div className="flex items-center space-x-1 min-w-full">
                    {(customSection.tableHeaders || ['Item', 'Description', 'Remarks']).map(
                      (h, idx) => (
                        <input
                          key={idx}
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const cur = [
                              ...(customSection.tableHeaders || ['Item', 'Description', 'Remarks']),
                            ];
                            cur[idx] = e.target.value;
                            handleUpdateCustomSection({ tableHeaders: cur });
                          }}
                          className="bg-white border border-[#cccccc] rounded px-2 py-1 text-[11px] font-bold text-black flex-1 min-w-[80px]"
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black text-[10.5px]">
                      Rows ({(customSection.tableRows || []).length})
                    </span>
                    <button
                      onClick={() => {
                        const curH = customSection.tableHeaders || ['Item', 'Description', 'Remarks'];
                        const curR = customSection.tableRows || [];
                        const newRow = curH.map((_, i) => (i === 0 ? `${curR.length + 1}` : 'Detail'));
                        handleUpdateCustomSection({
                          tableRows: [...curR, newRow],
                        });
                      }}
                      className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Row</span>
                    </button>
                  </div>

                  {(customSection.tableRows || []).map((row, rIdx) => (
                    <div key={rIdx} className="flex items-center space-x-1">
                      <div className="flex-1 flex items-center space-x-1">
                        {row.map((cell, cIdx) => (
                          <input
                            key={cIdx}
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const cur = [...(customSection.tableRows || [])];
                              cur[rIdx] = [...cur[rIdx]];
                              cur[rIdx][cIdx] = e.target.value;
                              handleUpdateCustomSection({ tableRows: cur });
                            }}
                            className="bg-white border border-[#cccccc] rounded px-2 py-1 text-xs text-black flex-1 min-w-[70px]"
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const cur = (customSection.tableRows || []).filter((_, i) => i !== rIdx);
                          handleUpdateCustomSection({ tableRows: cur });
                        }}
                        className="p-1 text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
