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
} from 'lucide-react';
import {
  LatexDocument,
  PurchaseOrderData,
  PORateItem,
  CustomSectionItem,
} from '@/types/document';
import { TaxInvoiceFormEditor } from './TaxInvoiceFormEditor';
import { QuotationFormEditor } from './QuotationFormEditor';
import { PREDEFINED_SECTION_TYPES } from '@/lib/section-presets';
import {
  getSectionPageNumber,
  getDocumentOutlineGroups,
  moveSectionToPage,
} from '@/lib/document-sections';

interface FormEditorProps {
  document: LatexDocument;
  activeSectionId: string;
  onSelectSection?: (secId: string) => void;
  onChange: (updatedDoc: LatexDocument) => void;
  onOpenGlobalVariables?: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  document: doc,
  activeSectionId,
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
        onChange={onChange}
        onOpenGlobalVariables={onOpenGlobalVariables}
      />
    );
  }

  if (!doc.purchaseOrder) {
    return (
      <aside className="w-full bg-[#111927] text-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 bg-[#0c131f] flex justify-between items-center shrink-0">
          <h2 className="font-bold text-xs uppercase tracking-wider text-gray-300">
            Document Settings
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-300 uppercase">
              Document Title
            </label>
            <input
              type="text"
              value={doc.title}
              onChange={(e) => updateDoc({ title: e.target.value })}
              className="w-full bg-[#1b2535] border border-gray-700 rounded px-3 py-2 text-sm text-white font-medium"
            />
          </div>
        </div>
      </aside>
    );
  }

  const po = doc.purchaseOrder;

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
  const outlineGroups = getDocumentOutlineGroups(po);

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
  const handleRateChange = (id: string, field: keyof PORateItem, val: string) => {
    const updated = po.rateItems.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: val };
        if (field === 'qty' || field === 'rate') {
          const q = parseFloat(field === 'qty' ? val : next.qty) || 0;
          const r = parseFloat(field === 'rate' ? val : next.rate) || 0;
          if (q && r) {
            next.total = `${(q * r).toLocaleString('en-IN')}/-`;
          }
        }
        return next;
      }
      return item;
    });
    updatePO({ rateItems: updated });
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
    updatePO({ rateItems: [...po.rateItems, newItem] });
  };

  const handleDeleteRateRow = (id: string) => {
    updatePO({ rateItems: po.rateItems.filter((i) => i.id !== id) });
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
    <aside className="w-full bg-[#111927] text-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-gray-800 bg-[#0c131f] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-emerald-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-gray-200">
            PURCHASE ORDER INPUTS
          </h2>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded">
          {typeof currentSectionPage === 'number' ? `Page ${currentSectionPage}` : currentSectionPage}
        </span>
      </div>

      {/* Active Section Banner */}
      <div className="px-4 py-2 bg-[#162234] border-b border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-emerald-900/60 rounded border border-emerald-700/50 text-emerald-300 shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{currentMeta.title}</div>
            <div className="text-[10px] text-gray-400 truncate">{currentMeta.subtitle}</div>
          </div>
        </div>

        {onOpenGlobalVariables && (
          <button
            onClick={onOpenGlobalVariables}
            className="px-2 py-1 bg-[#1e2a3b] hover:bg-emerald-900/50 text-emerald-400 hover:text-white border border-gray-700 hover:border-emerald-700 rounded text-[10px] font-mono font-bold flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
            title="Open Global Variables panel"
          >
            <span>{`{{Vars}}`}</span>
          </button>
        )}
      </div>

      {/* Page Assignment / Move to Page Selector Bar */}
      {!isGlobalHeader && (
        <div className="px-4 py-2 bg-[#0d1522] border-b border-gray-800 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-semibold text-[11px] flex items-center space-x-1">
            <span>Assigned Page / Group:</span>
          </span>
          <select
            value={currentSectionPage}
            onChange={(e) => {
              const targetPage = Number(e.target.value);
              const updatedPO = moveSectionToPage(po, activeSectionId, targetPage);
              updatePO(updatedPO);
            }}
            className="bg-[#172334] border border-emerald-700/60 rounded px-2.5 py-1 text-emerald-300 font-bold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer shadow-xs"
            title="Change the page where this section appears"
          >
            {outlineGroups.map((g) => (
              <option key={g.pageNum} value={g.pageNum}>
                Page {g.pageNum}: {g.groupTitle}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamic Configuration Form based on Active Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
        {/* ========================================================================= */}
        {/* DEDICATED HEADER & FOOTER ONLY SECTION */}
        {/* ========================================================================= */}
        {(activeSectionId === 'header_footer' || activeSectionId === 'letterhead' || activeSectionId === 'footer') && (
          <div className="space-y-5">
            {/* Header Letterhead Box */}
            <div className="p-3 bg-[#15202f] border border-emerald-900/60 rounded-lg space-y-3 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
                <LayoutTemplate className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400 uppercase text-[11px] tracking-wide">
                  Top Letterhead Header
                </span>
              </div>

              {/* Company Branding */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-medium text-gray-300 text-[10.5px]">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={po.companyName}
                    onChange={(e) => updatePO({ companyName: e.target.value })}
                    className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-300 text-[10.5px]">
                    Subtitle / Type
                  </label>
                  <input
                    type="text"
                    value={po.companySubtitle}
                    onChange={(e) => updatePO({ companySubtitle: e.target.value })}
                    className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white font-semibold"
                  />
                </div>
              </div>

              {/* GST Number */}
              <div className="space-y-1">
                <label className="block font-medium text-gray-300 text-[10.5px]">
                  GST Number
                </label>
                <input
                  type="text"
                  value={po.gstNo}
                  onChange={(e) => updatePO({ gstNo: e.target.value })}
                  placeholder="e.g. 24AABCA1234F1Z5"
                  className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white font-mono font-bold"
                />
              </div>

              {/* Company Registered Address in Header */}
              <div className="space-y-1.5">
                <label className="block font-medium text-gray-300 text-[10.5px] flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
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
                    className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1 text-white text-[11px]"
                  />
                ))}
              </div>

              {/* 2-Column Services / Offerings */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/80">
                {/* Left Services */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300 text-[10px] uppercase">
                      Left Services ({po.leftServices.length})
                    </span>
                    <button
                      onClick={() =>
                        updatePO({ leftServices: [...po.leftServices, 'NEW SERVICE'] })
                      }
                      className="p-0.5 text-emerald-400 hover:text-emerald-300 rounded cursor-pointer"
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
                        className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2 py-1 text-[10.5px] text-white"
                      />
                      {po.leftServices.length > 1 && (
                        <button
                          onClick={() =>
                            updatePO({
                              leftServices: po.leftServices.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
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
                    <span className="font-bold text-gray-300 text-[10px] uppercase">
                      Right Services ({po.rightServices.length})
                    </span>
                    <button
                      onClick={() =>
                        updatePO({ rightServices: [...po.rightServices, 'NEW SERVICE'] })
                      }
                      className="p-0.5 text-emerald-400 hover:text-emerald-300 rounded cursor-pointer"
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
                        className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2 py-1 text-[10.5px] text-white"
                      />
                      {po.rightServices.length > 1 && (
                        <button
                          onClick={() =>
                            updatePO({
                              rightServices: po.rightServices.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
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
            <div className="p-3 bg-[#15202f] border border-emerald-900/60 rounded-lg space-y-3 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-400 uppercase text-[11px] tracking-wide">
                  Bottom Letterhead Footer
                </span>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block font-medium text-gray-300 text-[10.5px] flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>Company Phone Number</span>
                </label>
                <input
                  type="text"
                  value={po.companyPhone}
                  onChange={(e) => updatePO({ companyPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs"
                />
              </div>

              {/* Footer Address */}
              <div className="space-y-1">
                <label className="block font-medium text-gray-300 text-[10.5px] flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Registered Footer Address</span>
                </label>
                <input
                  type="text"
                  value={po.companyAddressFooter}
                  onChange={(e) => updatePO({ companyAddressFooter: e.target.value })}
                  className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs"
                />
              </div>

              {/* Email & Website */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block font-medium text-gray-300 text-[10.5px] flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-emerald-400" />
                    <span>Email</span>
                  </label>
                  <input
                    type="text"
                    value={po.companyEmail}
                    onChange={(e) => updatePO({ companyEmail: e.target.value })}
                    className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-medium text-gray-300 text-[10.5px] flex items-center space-x-1">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Website</span>
                  </label>
                  <input
                    type="text"
                    value={po.companyWebsite}
                    onChange={(e) => updatePO({ companyWebsite: e.target.value })}
                    className="w-full bg-[#1e2a3c] border border-gray-700 rounded px-2.5 py-1.5 text-white text-xs"
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
              <label className="block font-bold text-gray-300 uppercase text-[10px]">
                Document Heading Title
              </label>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => updateDoc({ title: e.target.value })}
                placeholder="LABOUR CONTRACT PURCHASE ORDER"
                className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 font-bold text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block font-bold text-gray-300 uppercase text-[10px]">
                  PO Number
                </label>
                <input
                  type="text"
                  value={po.poNumber}
                  onChange={(e) => updatePO({ poNumber: e.target.value })}
                  className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-300 uppercase text-[10px]">
                  PO Date
                </label>
                <input
                  type="text"
                  value={po.poDate}
                  onChange={(e) => updatePO({ poDate: e.target.value })}
                  className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 text-white font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-[#16202e] border border-gray-700/80 rounded space-y-2.5">
              <span className="block font-bold text-emerald-400 uppercase text-[10.5px]">
                Contractor & Project Info
              </span>

              <div className="space-y-1">
                <label className="block font-medium text-gray-400">Contractor Name</label>
                <input
                  type="text"
                  value={po.contractorName}
                  onChange={(e) => updatePO({ contractorName: e.target.value })}
                  className="w-full bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-gray-400">Project Name</label>
                <input
                  type="text"
                  value={po.projectName}
                  onChange={(e) => updatePO({ projectName: e.target.value })}
                  className="w-full bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-gray-400">Project Location</label>
                <input
                  type="text"
                  value={po.projectLocation}
                  onChange={(e) => updatePO({ projectLocation: e.target.value })}
                  className="w-full bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-white font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SCOPE OF WORK (PAGE 1) */}
        {activeSectionId === 'scope' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase text-[10.5px]">
                Scope of Work Items ({po.scopeOfWork.length})
              </span>
              <button
                onClick={() =>
                  updatePO({
                    scopeOfWork: [...po.scopeOfWork, 'New item execution clause...'],
                  })
                }
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            {po.scopeOfWork.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="font-bold text-gray-400 text-xs mt-1.5">{idx + 1}.</span>
                <textarea
                  rows={2}
                  value={item}
                  onChange={(e) => {
                    const updated = [...po.scopeOfWork];
                    updated[idx] = e.target.value;
                    updatePO({ scopeOfWork: updated });
                  }}
                  className="flex-1 bg-[#1b2535] border border-gray-700 rounded p-2 text-xs text-white"
                />
                <button
                  onClick={() => {
                    const updated = po.scopeOfWork.filter((_, i) => i !== idx);
                    updatePO({ scopeOfWork: updated });
                  }}
                  className="p-1 text-gray-500 hover:text-red-400 rounded mt-1 cursor-pointer"
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
              <span className="font-bold text-emerald-400 uppercase text-[10.5px]">
                Line Items ({po.rateItems.length})
              </span>
              <button
                onClick={handleAddRateRow}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {po.rateItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-[#16202e] border border-gray-700/80 rounded space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300 text-[11px]">
                      Item #{index + 1}
                    </span>
                    {po.rateItems.length > 1 && (
                      <button
                        onClick={() => handleDeleteRateRow(item.id)}
                        className="p-1 text-gray-500 hover:text-red-400 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleRateChange(item.id, 'description', e.target.value)
                    }
                    placeholder="Description"
                    className="w-full bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-white font-medium text-xs"
                  />

                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <label className="block text-[9.5px] text-gray-400 uppercase">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleRateChange(item.id, 'unit', e.target.value)
                        }
                        className="w-full bg-[#1f2d40] border border-gray-700 rounded px-1.5 py-1 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-gray-400 uppercase">Qty</label>
                      <input
                        type="text"
                        value={item.qty}
                        onChange={(e) =>
                          handleRateChange(item.id, 'qty', e.target.value)
                        }
                        className="w-full bg-[#1f2d40] border border-gray-700 rounded px-1.5 py-1 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-gray-400 uppercase">Rate</label>
                      <input
                        type="text"
                        value={item.rate}
                        onChange={(e) =>
                          handleRateChange(item.id, 'rate', e.target.value)
                        }
                        className="w-full bg-[#1f2d40] border border-gray-700 rounded px-1.5 py-1 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] text-gray-400 uppercase">Total</label>
                      <input
                        type="text"
                        value={item.total}
                        onChange={(e) =>
                          handleRateChange(item.id, 'total', e.target.value)
                        }
                        className="w-full bg-[#1f2d40] border border-gray-700 rounded px-1.5 py-1 text-white font-bold font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1 pt-2 border-t border-gray-800">
              <label className="block font-medium text-gray-400">
                Amount in Words
              </label>
              <input
                type="text"
                value={po.amountInWords}
                onChange={(e) => updatePO({ amountInWords: e.target.value })}
                className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-white font-semibold"
              />
            </div>
          </div>
        )}

        {/* 4. SCOPE OF CONTRACTOR (PAGE 2) */}
        {activeSectionId === 'scope_contractor' && (
          <div className="space-y-3">
            <span className="block font-bold uppercase text-[10.5px] text-emerald-400">
              Scope of Contractor Clauses (Page 2)
            </span>
            {po.scopeOfContractor.map((clause, idx) => (
              <textarea
                key={idx}
                rows={3}
                value={clause}
                onChange={(e) => {
                  const updated = [...po.scopeOfContractor];
                  updated[idx] = e.target.value;
                  updatePO({ scopeOfContractor: updated });
                }}
                className="w-full bg-[#1b2535] border border-gray-700 rounded p-2 text-xs text-white"
              />
            ))}
          </div>
        )}

        {/* 5. PAYMENT TERMS (PAGE 2) */}
        {activeSectionId === 'payment_terms' && (
          <div className="space-y-3">
            <span className="block font-bold uppercase text-[10.5px] text-emerald-400">
              Payment Terms Clauses (Page 2)
            </span>
            {po.paymentTerms.map((term, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-gray-400 text-[10.5px]">Clause {idx + 1}</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...po.paymentTerms];
                    updated[idx] = e.target.value;
                    updatePO({ paymentTerms: updated });
                  }}
                  className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* 6. QUALITY, MATERIALS & SAFETY */}
        {activeSectionId === 'measurement' && (
          <div className="space-y-3">
            <span className="block font-bold uppercase text-[10.5px] text-emerald-400">
              Quality, Materials & Safety Clauses (5–7)
            </span>
            {po.measurementClause.map((clause, idx) => (
              <textarea
                key={idx}
                rows={3}
                value={clause}
                onChange={(e) => {
                  const updated = [...po.measurementClause];
                  updated[idx] = e.target.value;
                  updatePO({ measurementClause: updated });
                }}
                className="w-full bg-[#1b2535] border border-gray-700 rounded p-2 text-xs text-white"
              />
            ))}
          </div>
        )}

        {/* 7. COMMERCIAL & LABOUR TERMS (PAGE 2) */}
        {activeSectionId === 'terms' && (
          <div className="space-y-3">
            <span className="block font-bold uppercase text-[10.5px] text-emerald-400">
              Commercial & Labour Terms (Clauses 8–10)
            </span>
            {po.termsAndConditions.map((term, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-gray-400 text-[10.5px]">Term {idx + 1}</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...po.termsAndConditions];
                    updated[idx] = e.target.value;
                    updatePO({ termsAndConditions: updated });
                  }}
                  className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* 8. GENERAL TERMS & DEFECT LIABILITY (PAGE 3) */}
        {activeSectionId === 'page3_terms' && (
          <div className="space-y-3">
            <span className="block font-bold uppercase text-[10.5px] text-emerald-400">
              General Terms & Defect Liability (Clauses 11–16)
            </span>
            {po.page3Terms.map((term, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-gray-400 text-[10.5px]">Clause {idx + 1}</label>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => {
                    const updated = [...po.page3Terms];
                    updated[idx] = e.target.value;
                    updatePO({ page3Terms: updated });
                  }}
                  className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            ))}
          </div>
        )}

        {/* 9. SIGNATURE BLOCKS */}
        {activeSectionId === 'signatures' && (
          <div className="space-y-4">
            <div className="p-3 bg-[#16202e] border border-gray-700/80 rounded space-y-2">
              <span className="block font-bold text-emerald-400 uppercase text-[10.5px]">
                Company Signature Designation
              </span>
              <input
                type="text"
                value={`For ${po.companyName}`}
                readOnly
                className="w-full bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-white font-bold text-xs"
              />
              <p className="text-[10px] text-gray-400">
                Rendered on Page 3 with authorized signatory stamp block.
              </p>
            </div>

            <div className="p-3 bg-[#16202e] border border-gray-700/80 rounded space-y-2">
              <span className="block font-bold text-emerald-400 uppercase text-[10.5px]">
                Contractor Acceptance Designation
              </span>
              <input
                type="text"
                value={`Accepted By Contractor: ${po.contractorName}`}
                readOnly
                className="w-full bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-white font-bold text-xs"
              />
              <p className="text-[10px] text-gray-400">
                Rendered on Page 3 with contractor signature and seal acknowledgment.
              </p>
            </div>
          </div>
        )}

        {/* 10. DYNAMIC CUSTOM SECTION EDITOR */}
        {customSection && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase text-[10px]">
                Section Title
              </label>
              <input
                type="text"
                value={customSection.title}
                onChange={(e) => handleUpdateCustomSection({ title: e.target.value })}
                className="w-full bg-[#1b2535] border border-gray-700 rounded px-2.5 py-1.5 text-white font-bold"
              />
            </div>

            {/* Page Number Selector */}
            <div className="space-y-1">
              <label className="block font-bold text-gray-300 uppercase text-[10px]">
                Assigned Page Number
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      const updatedPO = moveSectionToPage(po, customSection.id, pageNum);
                      updatePO(updatedPO);
                    }}
                    className={`flex-1 py-1 rounded text-xs font-bold border cursor-pointer ${
                      currentSectionPage === pageNum
                        ? 'bg-emerald-700 border-emerald-500 text-white'
                        : 'bg-[#1b2535] border-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    P{pageNum}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400">
                Move this section to another page or drag it in the Document Outline.
              </p>
            </div>

            {/* Content Type Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-gray-300 uppercase text-[10px]">
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
                    className="bg-[#1f2d40] text-emerald-300 border border-emerald-700/60 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    <option value="" disabled>
                      ⚡ Insert Preset Template...
                    </option>
                    {PREDEFINED_SECTION_TYPES.map((opt) => (
                      <optgroup key={opt.type} label={opt.label}>
                        {opt.presets.map((p, idx) => (
                          <option key={idx} value={`${opt.type}:${idx}`}>
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
                        ? 'bg-emerald-700 border-emerald-500 text-white font-bold'
                        : 'bg-[#1b2535] border-gray-700 text-gray-300 hover:text-white'
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
                  <span className="font-bold text-gray-300 text-[10.5px]">
                    Bullet Items ({(customSection.bullets || []).length})
                  </span>
                  <button
                    onClick={() => {
                      const cur = customSection.bullets || [];
                      handleUpdateCustomSection({
                        bullets: [...cur, 'New bullet item text...'],
                      });
                    }}
                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
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
                      className="w-full bg-[#1b2535] border border-gray-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        const cur = (customSection.bullets || []).filter((_, i) => i !== idx);
                        handleUpdateCustomSection({ bullets: cur });
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
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
                  <span className="font-bold text-gray-300 text-[10.5px]">
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
                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Clause</span>
                  </button>
                </div>
                {(customSection.paragraphs || []).map((p, idx) => (
                  <div key={idx} className="flex items-start space-x-1.5 bg-[#172232] p-2 rounded border border-gray-800">
                    <span className="font-mono font-bold text-emerald-400 text-xs mt-1 shrink-0">
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
                      className="w-full bg-[#1b2535] border border-gray-700 rounded p-2 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        const cur = (customSection.paragraphs || []).filter((_, i) => i !== idx);
                        handleUpdateCustomSection({ paragraphs: cur });
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 cursor-pointer mt-1"
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
                  <span className="font-bold text-gray-300 text-[10.5px]">
                    Key-Value Parameters ({(customSection.keyValuePairs || []).length})
                  </span>
                  <button
                    onClick={() => {
                      const cur = customSection.keyValuePairs || [];
                      handleUpdateCustomSection({
                        keyValuePairs: [...cur, { key: 'Parameter Name', value: 'Specific Value' }],
                      });
                    }}
                    className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
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
                      className="w-1/3 bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-xs font-semibold text-emerald-300"
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
                      className="w-2/3 bg-[#1b2535] border border-gray-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        const cur = (customSection.keyValuePairs || []).filter((_, i) => i !== idx);
                        handleUpdateCustomSection({ keyValuePairs: cur });
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
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
                  <span className="font-bold text-gray-300 text-[10.5px]">
                    Notice Callout Settings
                  </span>
                  <select
                    value={customSection.calloutType || 'warning'}
                    onChange={(e) =>
                      handleUpdateCustomSection({
                        calloutType: e.target.value as 'info' | 'warning' | 'important',
                      })
                    }
                    className="bg-[#1f2d40] text-amber-300 border border-amber-700/60 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer"
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
                  className="w-full bg-[#1b2535] border border-amber-800/60 rounded p-2 text-xs text-amber-200"
                />
              </div>
            )}

            {/* Table Editor */}
            {customSection.contentType === 'table' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-300 text-[10.5px]">
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
                    className="px-2 py-0.5 bg-[#1f2d40] hover:bg-emerald-800 text-gray-200 hover:text-white rounded text-[10px] font-bold cursor-pointer"
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
                          className="bg-[#1f2d40] border border-gray-700 rounded px-2 py-1 text-[11px] font-bold text-white flex-1 min-w-[80px]"
                        />
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300 text-[10.5px]">
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
                      className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
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
                            className="bg-[#1b2535] border border-gray-700 rounded px-2 py-1 text-xs text-white flex-1 min-w-[70px]"
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const cur = (customSection.tableRows || []).filter((_, i) => i !== rIdx);
                          handleUpdateCustomSection({ tableRows: cur });
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 cursor-pointer shrink-0"
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
