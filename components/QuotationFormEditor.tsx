'use client';

import React from 'react';
import {
  Building,
  User,
  Calendar,
  FileText,
  DollarSign,
  Truck,
  CheckSquare,
  ShieldAlert,
  ListOrdered,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Phone,
  Mail,
  Globe,
  MapPin,
  HelpCircle,
  CreditCard,
  Clock,
  ArrowUp,
  ArrowDown,
  LayoutTemplate,
  FileCheck,
  CheckCircle2,
  FileSpreadsheet,
  FileSignature,
} from 'lucide-react';
import {
  LatexDocument,
  QuotationData,
  QuotationTechnicalItem,
  QuotationCommercialItem,
  QuotationVendorItem,
} from '@/types/document';
import {
  getQuotationSectionPageNumber,
  getQuotationOutlineGroups,
  moveQuotationSectionToPage,
} from '@/lib/document-sections';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface QuotationFormEditorProps {
  document: LatexDocument;
  activeSectionId?: string;
  onChange: (updatedDoc: LatexDocument) => void;
  onOpenGlobalVariables?: () => void;
}

export const QuotationFormEditor: React.FC<QuotationFormEditorProps> = ({
  document: doc,
  activeSectionId = 'q_cover_info',
  onChange,
  onOpenGlobalVariables,
}) => {
  const q = doc.quotation!;
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cleanDisplayValue = (val: string | undefined): string => {
    if (!val) return '';
    return val.replace(/\\newline/g, '\n').replace(/\\textbf{([^}]+)}/g, '$1').replace(/\\&/g, '&');
  };

  const updateQuotation = (fields: Partial<QuotationData>) => {
    onChange({
      ...doc,
      quotation: {
        ...q,
        ...fields,
      },
    });
  };

  // Section title and page mapping
  const sectionMeta: Record<
    string,
    { title: string; subtitle: string; page: string | number; icon: React.ElementType }
  > = {
    header_footer: {
      title: 'Letterhead & Brand Header',
      subtitle: 'Company branding, subtitle, GST number and letterhead',
      page: 'Global',
      icon: LayoutTemplate,
    },
    q_cover_info: {
      title: 'Client & Offer Reference',
      subtitle: 'Recipient / Client details, Ref No, Date & Subject (Page 1)',
      page: 1,
      icon: Building,
    },
    q_cover_intro: {
      title: 'Offer Letter & Valued Enquiry',
      subtitle: 'Introductory paragraphs, greeting & company signatory (Page 1)',
      page: 1,
      icon: FileText,
    },
    page_1: {
      title: 'Cover Page Details',
      subtitle: 'Recipient, Ref No, Introductory letter & Pitch (Page 1)',
      page: 1,
      icon: User,
    },
    q_tech_details: {
      title: 'Technical Specifications Table',
      subtitle: 'Building Size, Eave Height, Structure, Purlins & Sheeting (Page 2)',
      page: 2,
      icon: Layers,
    },
    page_2: {
      title: 'Technical Specifications Table',
      subtitle: 'Building Size, Eave Height, Structure, Purlins & Sheeting (Page 2)',
      page: 2,
      icon: Layers,
    },
    q_mat_specs: {
      title: 'Material Specifications Table',
      subtitle: 'TMT, Cement, Fasteners, Structural Steel Specifications (Page 3)',
      page: 3,
      icon: FileCheck,
    },
    page_3: {
      title: 'Material Specifications Table',
      subtitle: 'TMT, Cement, Fasteners, Structural Steel Specifications (Page 3)',
      page: 3,
      icon: FileCheck,
    },
    q_boq_items: {
      title: 'Commercial BOQ & Pricing Table',
      subtitle: 'Itemized description, price, total in INR & GST note (Page 4)',
      page: 4,
      icon: DollarSign,
    },
    page_4: {
      title: 'Commercial BOQ & Payment Terms',
      subtitle: 'Pricing Table, Fabrication & Civil Payment Milestones (Page 4)',
      page: 4,
      icon: DollarSign,
    },
    q_payment_terms_fab: {
      title: 'Payment Terms (Fabrication)',
      subtitle: 'Advance, procurement, dispatch and completion milestones (Page 4)',
      page: 4,
      icon: DollarSign,
    },
    q_payment_terms_civil: {
      title: 'Payment Terms (Civil Work)',
      subtitle: 'Advance, foundation, column, slab & finish milestones (Page 4)',
      page: 4,
      icon: DollarSign,
    },
    q_delivery_schedule: {
      title: 'Delivery Schedule & Prerequisites',
      subtitle: 'Project timeline milestones & Site readiness checklist (Page 5)',
      page: 5,
      icon: Truck,
    },
    page_5: {
      title: 'Delivery Schedule & Prerequisites',
      subtitle: 'Project timeline milestones & Site readiness checklist (Page 5)',
      page: 5,
      icon: Truck,
    },
    q_vendors_part1: {
      title: 'Approved Vendor List (Part 1: 1-14)',
      subtitle: 'Primary structural steel, purlins & roofing sheet vendors (Page 6)',
      page: 6,
      icon: CheckCircle2,
    },
    page_6: {
      title: 'Approved Vendor List (Part 1: 1-14)',
      subtitle: 'Primary structural steel, purlins & roofing sheet vendors (Page 6)',
      page: 6,
      icon: CheckCircle2,
    },
    q_vendors_part2: {
      title: 'Approved Vendor List (Part 2: 15-25)',
      subtitle: 'Secondary hardware, bolts, primer, paint & ventilator makes (Page 7)',
      page: 7,
      icon: CheckCircle2,
    },
    q_taxes_notes: {
      title: 'Taxes, Notes & Delivery Conditions',
      subtitle: 'GST applicability, 6 key notes & site delivery requisites (Page 7)',
      page: 7,
      icon: FileSpreadsheet,
    },
    page_7: {
      title: 'Vendors (15-25) & Delivery Conditions',
      subtitle: 'Approved brands, taxes, delivery terms & notes (Page 7)',
      page: 7,
      icon: CheckCircle2,
    },
    q_terms_part1: {
      title: 'Commercial Terms (Terms 1 to 7)',
      subtitle: 'Validity, Price Basis, Terms of Payment, Delay & Inspection (Page 8)',
      page: 8,
      icon: ListOrdered,
    },
    page_8: {
      title: 'Commercial Terms (Terms 1 to 7)',
      subtitle: 'Validity, Price Basis, Terms of Payment, Delay & Inspection (Page 8)',
      page: 8,
      icon: ListOrdered,
    },
    q_terms_part2: {
      title: 'Commercial Terms (Terms 8 to 13)',
      subtitle: 'Force Majeure, Statutory Compliances, Termination & Arbitration (Page 9)',
      page: 9,
      icon: ListOrdered,
    },
    page_9: {
      title: 'Commercial Terms (Terms 8 to 13)',
      subtitle: 'Force Majeure, Statutory Compliances, Termination & Arbitration (Page 9)',
      page: 9,
      icon: ListOrdered,
    },
    q_terms_part3: {
      title: 'Commercial Terms (Terms 14 to 17)',
      subtitle: 'Site Clearance, Workmanship Guarantee, Insurance & Title (Page 10)',
      page: 10,
      icon: ListOrdered,
    },
    q_exclusions: {
      title: 'Section 7: Scope of Exclusions',
      subtitle: 'Explicit list of non-scope items (civil power, crane, permissions) (Page 10)',
      page: 10,
      icon: ShieldAlert,
    },
    q_signatures: {
      title: 'Special Notes & Dual Signatures',
      subtitle: 'Special notes and Client / Company authorization acceptance block (Page 10)',
      page: 10,
      icon: FileSignature,
    },
    page_10: {
      title: 'Terms (14-17), Exclusions & Signatures',
      subtitle: 'Commercial terms, non-scope items & authorization blocks (Page 10)',
      page: 10,
      icon: FileSignature,
    },
  };

  const isGlobalHeader =
    activeSectionId === 'header_footer' ||
    activeSectionId === 'letterhead' ||
    activeSectionId === 'footer';

  const currentSectionPage = isGlobalHeader
    ? 'Global'
    : getQuotationSectionPageNumber(activeSectionId, q);
  const outlineGroups = getQuotationOutlineGroups(q);

  const currentMeta = sectionMeta[activeSectionId] || sectionMeta.q_cover_info;
  const CurrentIcon = currentMeta.icon;

  return (
    <aside className="w-full bg-[#080d1a] text-gray-200 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Single Unified Header */}
      <div className="px-4 py-3 border-b border-[#141f33] bg-[#0a1120] flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 bg-[#0d3479]/30 rounded-xl border border-[#0d3479]/50 text-blue-300 shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">{currentMeta.title}</div>
            <div className="text-[10px] text-slate-400 truncate">{currentMeta.subtitle}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onOpenGlobalVariables && (
            <button
              onClick={onOpenGlobalVariables}
              className="px-2.5 py-1 bg-[#0d3479]/20 hover:bg-[#0d3479]/50 text-blue-300 hover:text-white border border-[#0d3479]/40 rounded-lg text-[10px] font-mono font-bold flex items-center space-x-1 transition-colors cursor-pointer"
              title="Open Global Variables panel"
            >
              <span>{`{{Vars}}`}</span>
            </button>
          )}
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 bg-[#0d3479]/40 text-blue-200 border border-[#0d3479] rounded-lg font-semibold">
            {typeof currentSectionPage === 'number' ? `Page ${currentSectionPage}` : currentSectionPage}
          </span>
        </div>
      </div>



      {/* Main Section Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {/* =========================================================================
            HEADER & FOOTER (GLOBAL)
            ========================================================================= */}
        {isGlobalHeader && (
          <div className="space-y-4">
            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5" />
                <span>Letterhead & Company Branding</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Company Name</label>
                  <input
                    type="text"
                    value={q.companyName}
                    onChange={(e) => updateQuotation({ companyName: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Subtitle</label>
                  <input
                    type="text"
                    value={q.companySubtitle}
                    onChange={(e) => updateQuotation({ companySubtitle: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Company GST No.</label>
                <input
                  type="text"
                  value={q.companyGstNo}
                  onChange={(e) => updateQuotation({ companyGstNo: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Header Address</label>
                <input
                  type="text"
                  value={q.companyAddressHeader || ''}
                  onChange={(e) => updateQuotation({ companyAddressHeader: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  placeholder="Regd. Off. : SO7B / 2nd floor..."
                />
              </div>

              {/* 2-Column Services / Offerings */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#141f33]/80">
                {/* Left Services */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-400 text-[10px] uppercase">
                      Left Services ({(q.leftServices || []).length})
                    </span>
                    <button
                      onClick={() =>
                        updateQuotation({ leftServices: [...(q.leftServices || []), '• NEW SERVICE'] })
                      }
                      className="p-0.5 text-blue-400 hover:text-blue-300 rounded cursor-pointer"
                      title="Add Left Service"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {(q.leftServices || []).map((svc, idx) => (
                    <div key={idx} className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={svc}
                        onChange={(e) => {
                          const updated = [...(q.leftServices || [])];
                          updated[idx] = e.target.value;
                          updateQuotation({ leftServices: updated });
                        }}
                        className="w-full bg-[#070c18] border border-[#16233a] rounded px-2 py-1 text-[10.5px] text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                      />
                      {(q.leftServices || []).length > 1 && (
                        <button
                          onClick={() =>
                            updateQuotation({
                              leftServices: (q.leftServices || []).filter((_, i) => i !== idx),
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
                    <span className="font-bold text-gray-400 text-[10px] uppercase">
                      Right Services ({(q.rightServices || []).length})
                    </span>
                    <button
                      onClick={() =>
                        updateQuotation({ rightServices: [...(q.rightServices || []), '• NEW SERVICE'] })
                      }
                      className="p-0.5 text-blue-400 hover:text-blue-300 rounded cursor-pointer"
                      title="Add Right Service"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {(q.rightServices || []).map((svc, idx) => (
                    <div key={idx} className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={svc}
                        onChange={(e) => {
                          const updated = [...(q.rightServices || [])];
                          updated[idx] = e.target.value;
                          updateQuotation({ rightServices: updated });
                        }}
                        className="w-full bg-[#070c18] border border-[#16233a] rounded px-2 py-1 text-[10.5px] text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                      />
                      {(q.rightServices || []).length > 1 && (
                        <button
                          onClick={() =>
                            updateQuotation({
                              rightServices: (q.rightServices || []).filter((_, i) => i !== idx),
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

            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Footer Details</span>
              </h3>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Address (Footer)</label>
                <textarea
                  value={q.companyAddressFooter || ''}
                  onChange={(e) => updateQuotation({ companyAddressFooter: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Phone</label>
                  <input
                    type="text"
                    value={q.companyPhone || ''}
                    onChange={(e) => updateQuotation({ companyPhone: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Email</label>
                  <input
                    type="text"
                    value={q.companyEmail || ''}
                    onChange={(e) => updateQuotation({ companyEmail: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Website</label>
                <input
                  type="text"
                  value={q.companyWebsite || ''}
                  onChange={(e) => updateQuotation({ companyWebsite: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            COVER & CLIENT DETAILS (PAGE 1)
            ========================================================================= */}
        {(activeSectionId === 'q_cover_info' || activeSectionId === 'page_1') && (
          <div className="space-y-4">
            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Recipient / Client Info</span>
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Recipient Name (To,)</label>
                <input
                  type="text"
                  value={q.toRecipient}
                  onChange={(e) => updateQuotation({ toRecipient: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Recipient Address</label>
                <textarea
                  rows={2}
                  value={q.toAddress}
                  onChange={(e) => updateQuotation({ toAddress: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Ref. No.</label>
                  <input
                    type="text"
                    value={q.refNo}
                    onChange={(e) => updateQuotation({ refNo: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Quotation Date</label>
                  <input
                    type="text"
                    value={q.date}
                    onChange={(e) => updateQuotation({ date: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeSectionId === 'q_cover_intro' || activeSectionId === 'page_1') && (
          <div className="space-y-4">
            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Subject & Introductory Pitch</span>
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400">Subject Heading</label>
                <input
                  type="text"
                  value={q.subjectTitle}
                  onChange={(e) => updateQuotation({ subjectTitle: e.target.value })}
                  className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-semibold text-gray-400">Introduction Paragraphs</label>
                  <button
                    onClick={() => {
                      const updated = [...q.introParagraphs, ''];
                      updateQuotation({ introParagraphs: updated });
                    }}
                    className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Paragraph</span>
                  </button>
                </div>
                {q.introParagraphs.map((para, idx) => (
                  <div key={idx} className="space-y-1 bg-[#070c18] p-2 rounded border border-[#141f33]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-500 font-mono">Paragraph #{idx + 1}</span>
                      <button
                        onClick={() => {
                          const updated = q.introParagraphs.filter((_, i) => i !== idx);
                          updateQuotation({ introParagraphs: updated });
                        }}
                        className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                        title="Remove Paragraph"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={para}
                      onChange={(e) => {
                        const updated = [...q.introParagraphs];
                        updated[idx] = e.target.value;
                        updateQuotation({ introParagraphs: updated });
                      }}
                      className="w-full mt-1 px-2.5 py-1.5 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              {/* Signatory Settings */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#141f33]">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400">Signatory Company/Name</label>
                  <input
                    type="text"
                    value={q.signatoryName || ''}
                    placeholder="e.g. Global Industries"
                    onChange={(e) => updateQuotation({ signatoryName: e.target.value })}
                    className="w-full mt-1 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-semibold text-gray-400">Signatory Phones</label>
                    <button
                      onClick={() => {
                        const updated = [...(q.signatoryPhones || []), ''];
                        updateQuotation({ signatoryPhones: updated });
                      }}
                      className="px-1.5 py-0.5 bg-blue-900/50 hover:bg-blue-800/80 text-blue-300 rounded text-[9px] font-semibold cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="mt-1 space-y-1.5">
                    {(q.signatoryPhones || []).map((ph, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          value={ph}
                          placeholder="e.g. 09725445370"
                          onChange={(e) => {
                            const updated = [...(q.signatoryPhones || [])];
                            updated[idx] = e.target.value;
                            updateQuotation({ signatoryPhones: updated });
                          }}
                          className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded text-[11px] text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const updated = (q.signatoryPhones || []).filter((_, i) => i !== idx);
                            updateQuotation({ signatoryPhones: updated });
                          }}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            TECHNICAL DETAILS (PAGE 2)
            ========================================================================= */}
        {(activeSectionId === 'q_tech_details' || activeSectionId === 'page_2') && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-400 font-semibold">
                Technical Specifications Table (Page 2)
              </span>
              <button
                onClick={() => {
                  const updated = [...q.technicalDetails, { label: 'New Parameter', value: 'Specification Value' }];
                  updateQuotation({ technicalDetails: updated });
                }}
                className="px-2.5 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {q.technicalDetails.map((td, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b1426] p-2.5 rounded-2xl border border-[#141f33] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-blue-400">Item #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const updated = q.technicalDetails.filter((_, i) => i !== idx);
                        updateQuotation({ technicalDetails: updated });
                      }}
                      className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                      title="Remove Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="Parameter Label"
                        value={td.label}
                        onChange={(e) => {
                          const updated = [...q.technicalDetails];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          updateQuotation({ technicalDetails: updated });
                        }}
                        className="w-full px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-semibold"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Value"
                        value={td.value}
                        onChange={(e) => {
                          const updated = [...q.technicalDetails];
                          updated[idx] = { ...updated[idx], value: e.target.value };
                          updateQuotation({ technicalDetails: updated });
                        }}
                        className="w-full px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MATERIAL SPECS (PAGE 3)
            ========================================================================= */}
        {(activeSectionId === 'q_mat_specs' || activeSectionId === 'page_3') && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-gray-400 font-semibold block">
                Material Compliance & Standards Specifications (Page 3)
              </span>
              <button
                onClick={() => {
                  const updated = [...q.specifications, { title: 'New Spec', details: 'Details...' }];
                  updateQuotation({ specifications: updated });
                }}
                className="px-2 py-0.5 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Spec</span>
              </button>
            </div>

            <div className="space-y-3">
              {q.specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="bg-[#0b1426] p-3 rounded-2xl border border-[#141f33] space-y-2 relative"
                >
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-blue-400">Spec Title</label>
                    <button
                      onClick={() => {
                        const updated = q.specifications.filter((_, i) => i !== idx);
                        updateQuotation({ specifications: updated });
                      }}
                      className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={spec.title}
                    onChange={(e) => {
                      const updated = [...q.specifications];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      updateQuotation({ specifications: updated });
                    }}
                    className="w-full mt-0.5 px-2.5 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-semibold"
                  />

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400">Technical Details / Standards</label>
                    <textarea
                      rows={4}
                      value={cleanDisplayValue(spec.details)}
                      onChange={(e) => {
                        const updated = [...q.specifications];
                        updated[idx] = { ...updated[idx], details: e.target.value };
                        updateQuotation({ specifications: updated });
                      }}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            COMMERCIAL BOQ ITEMS (PAGE 4)
            ========================================================================= */}
        {(activeSectionId === 'q_boq_items' || activeSectionId === 'page_4') && (
          <div className="space-y-4">
            <div id="form-sec-q_boq_items" className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Commercial BOQ Items</span>
                </h3>
                <button
                  onClick={() => {
                    const updated = [
                      ...q.commercialItems,
                      { description: 'Additional Scope of Work Item', price: '1,00,000.00' },
                    ];
                    updateQuotation({ commercialItems: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add BOQ Item</span>
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400">Commercial Subtitle</label>
                <input
                  type="text"
                  value={q.commercialSubtitle || ''}
                  onChange={(e) => updateQuotation({ commercialSubtitle: e.target.value })}
                  placeholder="e.g., (A) PRICE BASIS: SUPPLY OF PEB STRUCTURE"
                  className="w-full mt-0.5 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                />
              </div>

              <div className="space-y-2.5">
                {q.commercialItems.map((item, idx) => (
                  <div key={idx} className="bg-[#070c18] p-2.5 rounded border border-[#16233a] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-gray-400">BOQ Item #{idx + 1}</span>
                      <div className="flex items-center space-x-1">
                        {idx > 0 && (
                          <button
                            onClick={() => {
                              const updated = [...q.commercialItems];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              updateQuotation({ commercialItems: updated });
                            }}
                            className="p-1 text-gray-400 hover:text-white"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {idx < q.commercialItems.length - 1 && (
                          <button
                            onClick={() => {
                              const updated = [...q.commercialItems];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              updateQuotation({ commercialItems: updated });
                            }}
                            className="p-1 text-gray-400 hover:text-white"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const updated = q.commercialItems.filter((_, i) => i !== idx);
                            updateQuotation({ commercialItems: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        value={cleanDisplayValue(item.description)}
                        onChange={(e) => {
                          const updated = [...q.commercialItems];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          updateQuotation({ commercialItems: updated });
                        }}
                        className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                      <span className="text-[11px] text-gray-400 font-semibold">Total Price (INR):</span>
                      <input
                        type="text"
                        value={item.price}
                        onChange={(e) => {
                          const updated = [...q.commercialItems];
                          updated[idx] = { ...updated[idx], price: e.target.value };
                          updateQuotation({ commercialItems: updated });
                        }}
                        className="w-36 px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white text-right font-mono focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#141f33]">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400">Total Price In INR</label>
                  <input
                    type="text"
                    value={q.totalPriceInInr}
                    onChange={(e) => updateQuotation({ totalPriceInInr: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-400">Sub Total</label>
                  <input
                    type="text"
                    value={q.subTotal}
                    onChange={(e) => updateQuotation({ subTotal: e.target.value })}
                    className="w-full mt-0.5 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400">Amount In Words</label>
                <input
                  type="text"
                  value={q.amountInWords}
                  onChange={(e) => updateQuotation({ amountInWords: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400">GST Note</label>
                <input
                  type="text"
                  value={q.gstNote}
                  onChange={(e) => updateQuotation({ gstNote: e.target.value })}
                  className="w-full mt-0.5 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAYMENT TERMS (FABRICATION)
            ========================================================================= */}
        {(activeSectionId === 'q_payment_terms_fab' || (activeSectionId === 'page_4' && false)) && (
          <div className="space-y-4">
            <div id="form-sec-q_payment_terms_fab" className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Payment Terms: For Fabrication</span>
                </h3>
                <button
                  onClick={() => {
                    const updated = [...q.paymentTermsFab, '10% milestone upon completion of phase'];
                    updateQuotation({ paymentTermsFab: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10.5px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-2">
                {q.paymentTermsFab.map((pt, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-gray-500 w-5 text-right">{idx + 1}.</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const updated = [...q.paymentTermsFab];
                        updated[idx] = e.target.value;
                        updateQuotation({ paymentTermsFab: updated });
                      }}
                      className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const updated = q.paymentTermsFab.filter((_, i) => i !== idx);
                        updateQuotation({ paymentTermsFab: updated });
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAYMENT TERMS (CIVIL WORK)
            ========================================================================= */}
        {activeSectionId === 'q_payment_terms_civil' && (
          <div className="space-y-4">
            <div id="form-sec-q_payment_terms_civil" className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Payment Terms: For Civil Work</span>
                </h3>
                <button
                  onClick={() => {
                    const updated = [...q.paymentTermsCivil, '15% on completion of plinth level'];
                    updateQuotation({ paymentTermsCivil: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10.5px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-2">
                {q.paymentTermsCivil.map((pt, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-gray-500 w-5 text-right">{idx + 1}.</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const updated = [...q.paymentTermsCivil];
                        updated[idx] = e.target.value;
                        updateQuotation({ paymentTermsCivil: updated });
                      }}
                      className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const updated = q.paymentTermsCivil.filter((_, i) => i !== idx);
                        updateQuotation({ paymentTermsCivil: updated });
                      }}
                      className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            DELIVERY SCHEDULE (PAGE 5)
            ========================================================================= */}
        {(activeSectionId === 'q_delivery_schedule' || activeSectionId === 'page_5') && (
          <div className="space-y-4">
            <div id="form-sec-q_delivery_schedule" className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 
                  onClick={() => toggleSection('q_delivery_schedule')}
                  className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5 cursor-pointer hover:text-blue-300 transition-colors select-none"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery Schedule & Timeline (Page 5)</span>
                  {collapsedSections['q_delivery_schedule'] ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronUp className="w-4 h-4 text-blue-500" />}
                </h3>
                <button
                  onClick={() => {
                    const updated = [
                      ...q.deliverySchedule,
                      'Drawings submission within 7-10 working days from PO confirmation.',
                    ];
                    updateQuotation({ deliverySchedule: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10.5px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Timeline Item</span>
                </button>
              </div>

              {!collapsedSections['q_delivery_schedule'] && (
                <div className="space-y-2.5">
                  {q.deliverySchedule.map((ds, idx) => (
                    <div key={idx} className="bg-[#070c18] p-2 rounded border border-[#16233a] space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-400">Milestone #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = q.deliverySchedule.filter((_, i) => i !== idx);
                            updateQuotation({ deliverySchedule: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={ds}
                        onChange={(e) => {
                          const updated = [...q.deliverySchedule];
                          updated[idx] = e.target.value;
                          updateQuotation({ deliverySchedule: updated });
                        }}
                        className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            APPROVED VENDOR LIST (PART 1: 1-14) (PAGE 6)
            ========================================================================= */}
        {(activeSectionId === 'q_vendors_part1' || activeSectionId === 'page_6') && (
          <div className="space-y-4">
            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Approved Vendor List (Part 1: 1-14)</span>
                </h3>
                <button
                  onClick={() => {
                    const updated = [
                      ...q.vendorList,
                      {
                        srNo: `${q.vendorList.length + 1}`,
                        description: 'New Material / Component',
                        brand: 'Standard Make / Approved Brand',
                      },
                    ];
                    updateQuotation({ vendorList: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Vendor</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {q.vendorList.slice(0, 14).map((v, idx) => (
                  <div key={idx} className="bg-[#070c18] p-2 rounded border border-[#16233a] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-gray-400">Sr. {v.srNo}</span>
                      <button
                        onClick={() => {
                          const updated = q.vendorList.filter((_, i) => i !== idx);
                          updateQuotation({ vendorList: updated });
                        }}
                        className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500">Description</label>
                        <input
                          type="text"
                          value={v.description}
                          onChange={(e) => {
                            const updated = [...q.vendorList];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            updateQuotation({ vendorList: updated });
                          }}
                          className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Brand / Make</label>
                        <input
                          type="text"
                          value={v.brand}
                          onChange={(e) => {
                            const updated = [...q.vendorList];
                            updated[idx] = { ...updated[idx], brand: e.target.value };
                            updateQuotation({ vendorList: updated });
                          }}
                          className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            APPROVED VENDORS PART 2 & TAXES (PAGE 7)
            ========================================================================= */}
        {(activeSectionId === 'q_vendors_part2' || activeSectionId === 'q_taxes_notes' || activeSectionId === 'page_7') && (
          <div className="space-y-4">
            {(activeSectionId === 'q_vendors_part2' || activeSectionId === 'page_7') && (
              <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Approved Vendor List (Part 2: 15-25)</span>
                  </h3>
                  <button
                    onClick={() => {
                      const updated = [
                        ...q.vendorList,
                        {
                          srNo: `${q.vendorList.length + 1}`,
                          description: 'New Material / Component',
                          brand: 'Standard Make / Approved Brand',
                        },
                      ];
                      updateQuotation({ vendorList: updated });
                    }}
                    className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Vendor Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {q.vendorList.slice(14).map((v, relativeIdx) => {
                    const actualIdx = relativeIdx + 14;
                    return (
                      <div key={actualIdx} className="bg-[#070c18] p-2 rounded border border-[#16233a] space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-gray-400">Sr. {v.srNo}</span>
                          <button
                            onClick={() => {
                              const updated = q.vendorList.filter((_, i) => i !== actualIdx);
                              updateQuotation({ vendorList: updated });
                            }}
                            className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-500">Description</label>
                            <input
                              type="text"
                              value={v.description}
                              onChange={(e) => {
                                const updated = [...q.vendorList];
                                updated[actualIdx] = { ...updated[actualIdx], description: e.target.value };
                                updateQuotation({ vendorList: updated });
                              }}
                              className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500">Brand / Make</label>
                            <input
                              type="text"
                              value={cleanDisplayValue(v.brand)}
                              onChange={(e) => {
                                const updated = [...q.vendorList];
                                updated[actualIdx] = { ...updated[actualIdx], brand: e.target.value };
                                updateQuotation({ vendorList: updated });
                              }}
                              className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(activeSectionId === 'q_taxes_notes' || activeSectionId === 'page_7') && (
              <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-4">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide">
                  Taxes, Notes & Delivery Conditions
                </h3>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Tax Note</label>
                  <input
                    type="text"
                    value={q.taxNote}
                    onChange={(e) => updateQuotation({ taxNote: e.target.value })}
                    className="w-full px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-semibold text-gray-400">Key Notes</label>
                    <button
                      onClick={() => {
                        const updated = [...(q.notes || []), 'New key note here.'];
                        updateQuotation({ notes: updated });
                      }}
                      className="px-1.5 py-0.5 bg-blue-900/50 hover:bg-blue-800/80 text-blue-300 rounded text-[9px] font-semibold cursor-pointer"
                    >
                      + Add Note
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(q.notes || []).map((note, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5">
                        <span className="text-[10px] font-mono text-gray-500 w-4 text-right pt-1">{idx + 1}.</span>
                        <textarea
                          rows={2}
                          value={note}
                          onChange={(e) => {
                            const updated = [...(q.notes || [])];
                            updated[idx] = e.target.value;
                            updateQuotation({ notes: updated });
                          }}
                          className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded text-[11px] text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const updated = (q.notes || []).filter((_, i) => i !== idx);
                            updateQuotation({ notes: updated });
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#141f33]">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-semibold text-gray-400">Delivery Checklist</label>
                    <button
                      onClick={() => {
                        const updated = [...(q.deliveryChecklist || []), 'New checklist item.'];
                        updateQuotation({ deliveryChecklist: updated });
                      }}
                      className="px-1.5 py-0.5 bg-blue-900/50 hover:bg-blue-800/80 text-blue-300 rounded text-[9px] font-semibold cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(q.deliveryChecklist || []).map((chk, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <CheckSquare className="w-3 h-3 text-gray-500 shrink-0" />
                        <input
                          type="text"
                          value={chk}
                          onChange={(e) => {
                            const updated = [...(q.deliveryChecklist || [])];
                            updated[idx] = e.target.value;
                            updateQuotation({ deliveryChecklist: updated });
                          }}
                          className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded text-[11px] text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const updated = (q.deliveryChecklist || []).filter((_, i) => i !== idx);
                            updateQuotation({ deliveryChecklist: updated });
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#141f33]">
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">Delivery Notes Text</label>
                  <textarea
                    rows={3}
                    value={q.deliveryNotes}
                    onChange={(e) => updateQuotation({ deliveryNotes: e.target.value })}
                    className="w-full px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            COMMERCIAL TERMS 1 TO 7 (PAGE 8)
            ========================================================================= */}
        {(activeSectionId === 'q_terms_part1' || activeSectionId === 'page_8') && (
          <div className="space-y-4">
            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Commercial Terms (Terms 1 to 7)</span>
                </h3>
                <button
                  onClick={() => {
                    const updated = [
                      ...q.commercialTerms,
                      {
                        number: q.commercialTerms.length + 1,
                        title: 'New Commercial Clause:',
                        content: 'Standard clause details and obligations.',
                      },
                    ];
                    updateQuotation({ commercialTerms: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Term</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {q.commercialTerms.slice(0, 7).map((term, idx) => (
                  <div key={idx} className="bg-[#070c18] p-2.5 rounded border border-[#16233a] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-blue-400">Term #{idx + 1}</span>
                      <button
                        onClick={() => {
                          const updated = q.commercialTerms.filter((_, i) => i !== idx);
                          updateQuotation({ commercialTerms: updated });
                        }}
                        className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500">Term Title</label>
                      <input
                        type="text"
                        value={term.title}
                        onChange={(e) => {
                          const updated = [...q.commercialTerms];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          updateQuotation({ commercialTerms: updated });
                        }}
                        className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500">Content</label>
                      <textarea
                        rows={2}
                        value={cleanDisplayValue(term.content)}
                        onChange={(e) => {
                          const updated = [...q.commercialTerms];
                          updated[idx] = { ...updated[idx], content: e.target.value };
                          updateQuotation({ commercialTerms: updated });
                        }}
                        className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            COMMERCIAL TERMS 8 TO 13 (PAGE 9)
            ========================================================================= */}
        {(activeSectionId === 'q_terms_part2' || activeSectionId === 'page_9') && (
          <div className="space-y-4">
            <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Commercial Terms (Terms 8 to 13)</span>
                </h3>
                <button
                  onClick={() => {
                    const updated = [
                      ...q.commercialTerms,
                      {
                        number: q.commercialTerms.length + 1,
                        title: 'New Commercial Clause:',
                        content: 'Standard clause details and obligations.',
                      },
                    ];
                    updateQuotation({ commercialTerms: updated });
                  }}
                  className="px-2 py-1 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Term</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {q.commercialTerms.slice(7, 13).map((term, relativeIdx) => {
                  const actualIdx = relativeIdx + 7;
                  return (
                    <div key={actualIdx} className="bg-[#070c18] p-2.5 rounded border border-[#16233a] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-blue-400">Term #{actualIdx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = q.commercialTerms.filter((_, i) => i !== actualIdx);
                            updateQuotation({ commercialTerms: updated });
                          }}
                          className="text-red-400 hover:text-red-300 p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Term Title</label>
                        <input
                          type="text"
                          value={term.title}
                          onChange={(e) => {
                            const updated = [...q.commercialTerms];
                            updated[actualIdx] = { ...updated[actualIdx], title: e.target.value };
                            updateQuotation({ commercialTerms: updated });
                          }}
                          className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500">Content</label>
                        <textarea
                          rows={2}
                          value={cleanDisplayValue(term.content)}
                          onChange={(e) => {
                            const updated = [...q.commercialTerms];
                            updated[actualIdx] = { ...updated[actualIdx], content: e.target.value };
                            updateQuotation({ commercialTerms: updated });
                          }}
                          className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TERMS (14-17), EXCLUSIONS & SIGNATURES (PAGE 10)
            ========================================================================= */}
        {(activeSectionId === 'q_terms_part3' ||
          activeSectionId === 'q_exclusions' ||
          activeSectionId === 'q_signatures' ||
          activeSectionId === 'page_10') && (
          <div className="space-y-4">
            {(activeSectionId === 'q_terms_part3' || activeSectionId === 'page_10') && (
              <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
                <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Commercial Terms (Terms 14 to 17)</span>
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {q.commercialTerms.slice(13).map((term, relativeIdx) => {
                    const actualIdx = relativeIdx + 13;
                    return (
                      <div key={actualIdx} className="bg-[#070c18] p-2.5 rounded border border-[#16233a] space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-blue-400">Term #{actualIdx + 1}</span>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={term.title}
                            onChange={(e) => {
                              const updated = [...q.commercialTerms];
                              updated[actualIdx] = { ...updated[actualIdx], title: e.target.value };
                              updateQuotation({ commercialTerms: updated });
                            }}
                            className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white font-bold"
                          />
                        </div>
                        <div>
                          <textarea
                            rows={2}
                            value={cleanDisplayValue(term.content)}
                            onChange={(e) => {
                              const updated = [...q.commercialTerms];
                              updated[actualIdx] = { ...updated[actualIdx], content: e.target.value };
                              updateQuotation({ commercialTerms: updated });
                            }}
                            className="w-full px-2 py-1 bg-[#0b1426] border border-[#16233a] rounded-xl text-xs text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(activeSectionId === 'q_exclusions' || activeSectionId === 'page_10') && (
              <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide">
                    Section 7: Exclusions ({q.exclusions.length} items)
                  </h3>
                  <button
                    onClick={() => {
                      const updated = [...q.exclusions, 'Civil foundation anchor bolt setting work'];
                      updateQuotation({ exclusions: updated });
                    }}
                    className="px-2 py-0.5 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {q.exclusions.map((ex, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-gray-500 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={ex}
                        onChange={(e) => {
                          const updated = [...q.exclusions];
                          updated[idx] = e.target.value;
                          updateQuotation({ exclusions: updated });
                        }}
                        className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          const updated = q.exclusions.filter((_, i) => i !== idx);
                          updateQuotation({ exclusions: updated });
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeSectionId === 'q_signatures' || activeSectionId === 'page_10') && (
              <div className="bg-[#0b1426] p-3.5 rounded-2xl border border-[#141f33] space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xs text-blue-400 uppercase tracking-wide">
                    Section 8: Special Notes
                  </h3>
                  <button
                    onClick={() => {
                      const updated = [...q.specialNotes, 'Work permits to be arranged prior to execution.'];
                      updateQuotation({ specialNotes: updated });
                    }}
                    className="px-2 py-0.5 bg-[#0d3479]/40 hover:bg-[#0d3479]/80 text-blue-200 border border-[#0d3479]/80 rounded text-[10px] font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {q.specialNotes.map((sn, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-gray-500 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        value={sn}
                        onChange={(e) => {
                          const updated = [...q.specialNotes];
                          updated[idx] = e.target.value;
                          updateQuotation({ specialNotes: updated });
                        }}
                        className="flex-1 px-2 py-1 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white"
                      />
                      <button
                        onClick={() => {
                          const updated = q.specialNotes.filter((_, i) => i !== idx);
                          updateQuotation({ specialNotes: updated });
                        }}
                        className="p-1 text-gray-400 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Final Signatory Block */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#141f33]">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Final Signatory Company</label>
                    <input
                      type="text"
                      value={q.finalSignatoryCompany || ''}
                      placeholder="e.g. For, GLOBAL INDUSTRIES"
                      onChange={(e) => updateQuotation({ finalSignatoryCompany: e.target.value })}
                      className="w-full px-2 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 mb-1">Final Signatory Title</label>
                    <input
                      type="text"
                      value={q.finalSignatoryTitle || ''}
                      placeholder="e.g. (Authorized Signatory)"
                      onChange={(e) => updateQuotation({ finalSignatoryTitle: e.target.value })}
                      className="w-full px-2 py-1.5 bg-[#070c18] border border-[#16233a] rounded-xl text-xs text-white focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

