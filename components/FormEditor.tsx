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
    header_footer: {
      title: 'Header & Footer Settings',
      subtitle: 'Edit letterhead branding, offerings, GST, and footer contacts',
      page: 'Global',
      icon: LayoutTemplate,
    },
    info: {
      title: 'PO Info & Parties',
      subtitle: 'PO Number, Date, Contractor, Project details',
      page: 1,
      icon: Building,
    },
    scope: {
      title: 'Scope of Work',
      subtitle: 'Itemized list of execution duties & responsibilities',
      page: 1,
      icon: Briefcase,
    },
    rates: {
      title: 'Rates & Pricing Table',
      subtitle: 'Line items, description, unit, qty, rate, and amount in words',
      page: 1,
      icon: DollarSign,
    },
    scope_contractor: {
      title: 'Scope of Contractor (Clauses 1–4)',
      subtitle: 'Contract Value, Scope of Work, Company & Contractor scopes (Page 2)',
      page: 2,
      icon: Layers,
    },
    payment_terms: {
      title: 'Payment Terms & Milestones',
      subtitle: 'Milestones, billing schedules, and stage-wise payments (Page 2)',
      page: 2,
      icon: DollarSign,
    },
    measurement: {
      title: 'Quality, Materials & Safety (Clauses 5–7)',
      subtitle: 'Quality standards, company material responsibility & safety rules (Page 2)',
      page: 2,
      icon: ShieldAlert,
    },
    terms: {
      title: 'Commercial & Labour Terms (Clauses 8–10)',
      subtitle: 'Labour laws, measurement verification & 60-day schedule (Page 2)',
      page: 2,
      icon: FileCheck,
    },
    page3_terms: {
      title: 'General Terms & Execution (Clauses 11–16)',
      subtitle: 'Housekeeping, defect warranty, termination & jurisdiction (Page 3)',
      page: 3,
      icon: CheckCircle2,
    },
    signatures: {
      title: 'Signature Blocks',
      subtitle: 'Dual-party authorization & acceptance designations',
      page: 3,
      icon: FileSignature,
    },
  };

  const isGlobalHeader =
    activeSectionId === 'header_footer' ||
    activeSectionId === 'letterhead' ||
    activeSectionId === 'footer';

  const currentSectionPage = isGlobalHeader ? 'Global' : getSectionPageNumber(activeSectionId, po);

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
      : sectionMeta.header_footer;

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
        {/* DEDICATED HEADER & FOOTER ONLY SECTION */}
        {/* ========================================================================= */}
        {(activeSectionId === 'header_footer' || activeSectionId === 'letterhead' || activeSectionId === 'footer') && (
          <div className="space-y-5">
            {/* Header Letterhead Box */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <LayoutTemplate className="w-4 h-4 text-[#0d3479]" />
                <span className="font-bold text-[#0d3479] uppercase text-[11px] tracking-wide">
                  Top Letterhead Header
                </span>
              </div>

              {/* Company Branding */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={po.companyName}
                    onChange={(e) => updatePO({ companyName: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black mb-1.5">
                    Subtitle / Type
                  </label>
                  <input
                    type="text"
                    value={po.companySubtitle}
                    onChange={(e) => updatePO({ companySubtitle: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-semibold"
                  />
                </div>
              </div>

              {/* GST Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5">
                  GST Number
                </label>
                <input
                  type="text"
                  value={po.gstNo}
                  onChange={(e) => updatePO({ gstNo: e.target.value })}
                  placeholder="e.g. 24AABCA1234F1Z5"
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-mono font-bold"
                />
              </div>

              {/* Company Registered Address in Header */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#0d3479]" />
                  <span>Company Address (Header / PO Box)</span>
                </label>
                {po.companyAddress.map((addr, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={addr}
                    onChange={(e) => {
                      const newAddr = [...po.companyAddress];
                      newAddr[idx] = e.target.value;
                      updatePO({ companyAddress: newAddr });
                    }}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-[11px]"
                  />
                ))}
              </div>

              {/* 2-Column Services / Offerings */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#cccccc]/80">
                {/* Left Services */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black text-[10px] uppercase">
                      Left Services ({po.leftServices.length})
                    </span>
                    <button
                      onClick={() =>
                        updatePO({ leftServices: [...po.leftServices, 'NEW SERVICE'] })
                      }
                      className="p-1 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded-md transition-colors cursor-pointer shadow-xs"
                      title="Add Left Service"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {po.leftServices.map((svc, idx) => (
                    <div key={idx} className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={svc}
                        onChange={(e) => {
                          const updated = [...po.leftServices];
                          updated[idx] = e.target.value;
                          updatePO({ leftServices: updated });
                        }}
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-[10.5px] text-black"
                      />
                      {po.leftServices.length > 1 && (
                        <button
                          onClick={() =>
                            updatePO({
                              leftServices: po.leftServices.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Right Services */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black text-[10px] uppercase">
                      Right Services ({po.rightServices.length})
                    </span>
                    <button
                      onClick={() =>
                        updatePO({ rightServices: [...po.rightServices, 'NEW SERVICE'] })
                      }
                      className="p-1 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded-md transition-colors cursor-pointer shadow-xs"
                      title="Add Right Service"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {po.rightServices.map((svc, idx) => (
                    <div key={idx} className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={svc}
                        onChange={(e) => {
                          const updated = [...po.rightServices];
                          updated[idx] = e.target.value;
                          updatePO({ rightServices: updated });
                        }}
                        className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-[10.5px] text-black"
                      />
                      {po.rightServices.length > 1 && (
                        <button
                          onClick={() =>
                            updatePO({
                              rightServices: po.rightServices.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-[#888888] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Box */}
            <div className="bg-white rounded-xl border border-[#cccccc] overflow-hidden shadow-xs">
              <div className="bg-[#f0efe6] px-4 py-3 border-b border-[#cccccc] flex items-center space-x-2">
                <Building className="w-4 h-4 text-[#0d3479]" />
                <span className="font-bold text-[#0d3479] uppercase text-[11px] tracking-wide">
                  Bottom Letterhead Footer
                </span>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-[#0d3479]" />
                  <span>Company Phone Number</span>
                </label>
                <input
                  type="text"
                  value={po.companyPhone}
                  onChange={(e) => updatePO({ companyPhone: sanitizePhoneInput(e.target.value) })}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs text-black"
                />
              </div>

              {/* Footer Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#0d3479]" />
                  <span>Registered Footer Address</span>
                </label>
                <input
                  type="text"
                  value={po.companyAddressFooter}
                  onChange={(e) => updatePO({ companyAddressFooter: e.target.value })}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs"
                />
              </div>

              {/* Email & Website */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-[#0d3479]" />
                    <span>Email</span>
                  </label>
                  <input
                    type="text"
                    value={po.companyEmail}
                    onChange={(e) => updatePO({ companyEmail: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-[#0d3479]" />
                    <span>Website</span>
                  </label>
                  <input
                    type="text"
                    value={po.companyWebsite}
                    onChange={(e) => updatePO({ companyWebsite: e.target.value })}
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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

            {/* Issuer Company Details Box */}
            <div className="p-3 bg-white border border-[#cccccc]/80 rounded space-y-2.5">
              <span className="block font-bold text-[#0d3479] uppercase text-[10.5px]">
                Issuer Company Details (Table Left Side)
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black mb-1.5 text-[10px]">Company Name</label>
                  <input
                    type="text"
                    value={po.tableCompanyName !== undefined ? po.tableCompanyName : (po.companyName ?? '')}
                    onChange={(e) => updatePO({ tableCompanyName: e.target.value })}
                    placeholder="Company Name"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-semibold text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-black mb-1.5 text-[10px]">Subtitle / Branch</label>
                  <input
                    type="text"
                    value={po.tableCompanySubtitle !== undefined ? po.tableCompanySubtitle : (po.companySubtitle ?? '')}
                    onChange={(e) => updatePO({ tableCompanySubtitle: e.target.value })}
                    placeholder="Branch or Subtitle"
                    className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-black mb-1.5 text-[10px]">
                  Company Full Address (Press Enter for new line)
                </label>
                <textarea
                  rows={3}
                  value={(po.tableCompanyAddress !== undefined ? po.tableCompanyAddress : (po.companyAddress || [])).join('\n')}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n');
                    updatePO({ tableCompanyAddress: lines });
                  }}
                  placeholder={'SO7B / 2nd Floor / Phase 2\nIndiabulls, Jetalpur Road\nVadodara - 390007, Gujarat'}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-2.5 py-2 text-black text-xs leading-relaxed focus:border-[#0d3479] focus:outline-none resize-y"
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
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs.5 text-black font-semibold text-xs resize-y focus:outline-none focus:border-[#0d3479]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SCOPE OF WORK (PAGE 1) */}
        {activeSectionId === 'scope' && (
          <div className="space-y-3">
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

              {/* Bottom Row: Amount in Words (matching preview's bottom row placement) */}
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

        {/* 4. SCOPE OF CONTRACTOR (PAGE 2) */}
        {activeSectionId === 'scope_contractor' && (
          <div className="space-y-3">
            <RichTextEditor
              value={po.scopeOfContractor}
              onChange={(val) => updatePO({ scopeOfContractor: Array.isArray(val) ? val : [val] })}
              label="Scope of Contractor Clauses (Page 2)"
              placeholder="Enter scope of contractor clauses... Press Enter for a new line, or double Enter for a new clause/paragraph."
              minHeight="180px"
              isParagraphArray={true}
            />
          </div>
        )}

        {/* 5. PAYMENT TERMS (PAGE 2) */}
        {activeSectionId === 'payment_terms' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="block font-bold uppercase text-[10.5px] text-[#0d3479]">
                Payment Terms Clauses (Page 2)
              </span>
              <button
                onClick={() => updatePO({ paymentTerms: [...po.paymentTerms, 'New payment term'] })}
                className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Term</span>
              </button>
            </div>
            {po.paymentTerms.map((term, idx) => (
              <div key={idx} className="space-y-1 bg-white p-2 rounded border border-[#cccccc]">
                <div className="flex justify-between items-center">
                  <label className="block text-black text-[10.5px]">Clause {idx + 1}</label>
                  <button
                    onClick={() => updatePO({ paymentTerms: po.paymentTerms.filter((_, i) => i !== idx) })}
                    className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...po.paymentTerms];
                    updated[idx] = e.target.value;
                    updatePO({ paymentTerms: updated });
                  }}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs text-black focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* 6. QUALITY, MATERIALS & SAFETY */}
        {activeSectionId === 'measurement' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="block font-bold uppercase text-[10.5px] text-[#0d3479]">
                Quality, Materials & Safety Clauses (5–7)
              </span>
              <button
                onClick={() => updatePO({ measurementClause: [...po.measurementClause, 'New clause'] })}
                className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Clause</span>
              </button>
            </div>
            {po.measurementClause.map((clause, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <textarea
                  rows={3}
                  value={clause}
                  onChange={(e) => {
                    const updated = [...po.measurementClause];
                    updated[idx] = e.target.value;
                    updatePO({ measurementClause: updated });
                  }}
                  className="w-full bg-white border border-[#cccccc] rounded p-2 text-xs text-black"
                />
                <button
                  onClick={() => updatePO({ measurementClause: po.measurementClause.filter((_, i) => i !== idx) })}
                  className="p-1 text-[#666666] hover:text-red-400 rounded mt-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 7. COMMERCIAL & LABOUR TERMS (PAGE 2) */}
        {activeSectionId === 'terms' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="block font-bold uppercase text-[10.5px] text-[#0d3479]">
                Commercial & Labour Terms (Clauses 8–10)
              </span>
              <button
                onClick={() => updatePO({ termsAndConditions: [...po.termsAndConditions, 'New commercial term'] })}
                className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Term</span>
              </button>
            </div>
            {po.termsAndConditions.map((term, idx) => (
              <div key={idx} className="space-y-1 bg-white p-2 rounded border border-[#cccccc]">
                <div className="flex justify-between items-center">
                  <label className="block text-black text-[10.5px]">Term {idx + 1}</label>
                  <button
                    onClick={() => updatePO({ termsAndConditions: po.termsAndConditions.filter((_, i) => i !== idx) })}
                    className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...po.termsAndConditions];
                    updated[idx] = e.target.value;
                    updatePO({ termsAndConditions: updated });
                  }}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs text-black focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* 8. GENERAL TERMS & DEFECT LIABILITY (PAGE 3) */}
        {activeSectionId === 'page3_terms' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="block font-bold uppercase text-[10.5px] text-[#0d3479]">
                General Terms & Defect Liability (Clauses 11–16)
              </span>
              <button
                onClick={() => updatePO({ page3Terms: [...po.page3Terms, 'New clause'] })}
                className="px-2 py-0.5 bg-[#0d3479] hover:bg-[#123f8f] text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Clause</span>
              </button>
            </div>
            {po.page3Terms.map((term, idx) => (
              <div key={idx} className="space-y-1 bg-white p-2 rounded border border-[#cccccc]">
                <div className="flex justify-between items-center">
                  <label className="block text-black text-[10.5px]">Clause {idx + 1}</label>
                  <button
                    onClick={() => updatePO({ page3Terms: po.page3Terms.filter((_, i) => i !== idx) })}
                    className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...po.page3Terms];
                    updated[idx] = e.target.value;
                    updatePO({ page3Terms: updated });
                  }}
                  className="w-full bg-white border border-[#cccccc] rounded-lg px-3 py-2 text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs text-xs text-black focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* 9. SIGNATURE BLOCKS */}
        {activeSectionId === 'signatures' && (
          <div className="space-y-4">
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
