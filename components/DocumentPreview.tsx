'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import {
  LatexDocument,
  PurchaseOrderData,
  CustomSectionItem,
  PORateItem,
} from '@/types/document';
import { TaxInvoicePreview } from './TaxInvoicePreview';
import { QuotationPreview } from './QuotationPreview';
import { DynamicTemplatePreview } from './DynamicTemplatePreview';
import { ShortcutsDropdown } from './ShortcutsDropdown';
import { LatexFormattedText } from '@/lib/katex-renderer';
import { applyVariables, applyVariablesToArray } from '@/lib/variables';
import { FormattedText } from '@/lib/format-text';
import {
  getDocumentOutlineGroups,
  OutlineGroup,
  OutlineSectionItem,
} from '@/lib/document-sections';
import { CompanyProfile } from '@/types/project';
import { SAMPLE_GENERIC_TEMPLATE } from '@/lib/sample_template';

interface DocumentPreviewProps {
  document: LatexDocument;
  companyProfile?: CompanyProfile;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  printRef?: React.RefObject<HTMLDivElement | null>;
  activeSectionId?: string;
  hoveredSectionId?: string | null;
  onHoverSection?: (sectionId: string | null) => void;
  onSelectSection?: (sectionId: string) => void;
  onMoveCustomSectionPage?: (sectionId: string, newPageNum: number) => void;
  onOpenLatexCode?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document: doc,
  companyProfile,
  zoomLevel,
  setZoomLevel,
  printRef,
  activeSectionId,
  hoveredSectionId,
  onHoverSection,
  onSelectSection,
  onOpenLatexCode,
}) => {
  const { settings } = doc;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const fontSizeClass =
    settings.fontSize === '10pt'
      ? 'text-[13px] leading-relaxed'
      : settings.fontSize === '12pt'
      ? 'text-[16px] leading-loose'
      : 'text-[14px] leading-relaxed';

  const fontFamilyStyle =
    settings.fontFamily === 'times'
      ? "'Times New Roman', Times, serif"
      : settings.fontFamily === 'helvetica'
      ? 'Arial, Helvetica, sans-serif'
      : settings.fontFamily === 'latin-modern'
      ? "'EB Garamond', serif"
      : "'STIX Two Text', 'Computer Modern', serif";

  // Auto-scroll DocumentPreview to active section when selected
  useEffect(() => {
    if (!activeSectionId) return;

    let targetElementId = `preview-sec-${activeSectionId}`;
    if (activeSectionId === 'letterhead' || activeSectionId === 'footer') {
      targetElementId = 'preview-sec-header_footer';
    }

    const element = document.getElementById(targetElementId);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [activeSectionId]);



  return (
    <div className="flex-1 flex flex-col bg-[#64748b] overflow-hidden relative h-full min-h-0 print:bg-white print:overflow-visible">
      {/* Top Preview Toolbar */}
      <div className="h-[49px] bg-[#f0efe6] flex items-center justify-between px-5 border-b border-[#cccccc] shrink-0 z-10 select-none print:hidden shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="flex bg-white rounded-xl border border-[#cccccc] overflow-hidden text-xs text-[#333333] shadow-xs">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
              className="px-2.5 py-1.5 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 text-black font-mono font-semibold text-[11px] border-x border-[#cccccc]">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(175, zoomLevel + 15))}
              className="px-2.5 py-1.5 hover:bg-slate-100 hover:text-black transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-3 py-1.5 hover:bg-slate-100 hover:text-black transition-colors font-semibold text-[11px] cursor-pointer border-l border-[#cccccc]"
            >
              Reset
            </button>
          </div>

          {activeSectionId && (
            <div className="hidden sm:flex items-center space-x-2 text-[11px] text-[#0d3479] bg-[#dfe7f4] px-3 py-1 rounded-lg border border-[#b9c7de] font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0d3479] animate-pulse" />
              <span>Section: {activeSectionId.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Right Preview Toolbar Action */}
        <ShortcutsDropdown />
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#64748b] scrollbar-thin scroll-smooth text-center print:p-0 print:m-0 print:bg-white print:overflow-visible"
      >
        {/* Centered preview container scaled natively using CSS zoom */}
        <div
          id="pdf-preview-container"
          style={{
            zoom: zoomLevel / 100,
            transition: 'zoom 0.15s ease-out',
            display: 'inline-block',
            margin: '0 auto',
            textAlign: 'left',
          }}
          className="mb-20 space-y-12 print:m-0 print:p-0 print:space-y-0 print:block"
        >
          {doc.quotation ? (
            <QuotationPreview
              doc={doc}
              quotation={doc.quotation}
              companyProfile={companyProfile}
              fontFamilyStyle={fontFamilyStyle}
              printRef={printRef || { current: null }}
              activeSectionId={activeSectionId}
              hoveredSectionId={hoveredSectionId}
              onHoverSection={onHoverSection}
              onSelectSection={onSelectSection}
              globalVars={doc.globalVariables}
            />
          ) : doc.taxInvoice ? (
            <TaxInvoicePreview
              doc={doc}
              invoice={doc.taxInvoice}
              companyProfile={companyProfile}
              fontFamilyStyle={fontFamilyStyle}
              printRef={printRef || { current: null }}
              activeSectionId={activeSectionId}
              hoveredSectionId={hoveredSectionId}
              onHoverSection={onHoverSection}
              onSelectSection={onSelectSection}
              globalVars={doc.globalVariables}
            />
          ) : doc.purchaseOrder ? (
            <PurchaseOrderPages
              doc={doc}
              po={doc.purchaseOrder}
              companyProfile={companyProfile}
              fontFamilyStyle={fontFamilyStyle}
              printRef={printRef}
              activeSectionId={activeSectionId}
              hoveredSectionId={hoveredSectionId}
              onHoverSection={onHoverSection}
              onSelectSection={onSelectSection}
              globalVars={doc.globalVariables}
            />
          ) : doc.dynamicTemplate ? (
            <DynamicTemplatePreview
              schema={SAMPLE_GENERIC_TEMPLATE}
              documentData={doc.dynamicTemplate}
              zoomLevel={zoomLevel}
              activeSectionId={activeSectionId}
              hoveredSectionId={hoveredSectionId}
              onHoverSection={onHoverSection}
              onSelectSection={onSelectSection}
            />
          ) : (
            <div
              ref={printRef}
              style={{
                fontFamily: fontFamilyStyle,
                width: settings.paperSize === 'a4paper' ? '794px' : '816px',
                minHeight: settings.paperSize === 'a4paper' ? '1123px' : '1056px',
              }}
              className={`latex-paper print-area bg-white text-gray-900 p-12 md:p-16 shadow-2xl relative flex flex-col justify-between ${fontSizeClass}`}
            >
              <div>
                <div className="text-center mb-8 border-b pb-6 border-gray-200">
                  <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-2 text-gray-900 tracking-tight">
                    <FormattedText text={doc.title || 'Untitled Document'} globalVars={doc.globalVariables} po={doc.purchaseOrder} />
                  </h1>
                </div>

                {doc.sections.map((section, sIndex) => {
                  const isSecActive = activeSectionId === section.id;
                  const isSecHovered = hoveredSectionId === section.id && !isSecActive;

                  return (
                    <div
                      key={section.id}
                      id={`preview-sec-${section.id}`}
                      onClick={() => onSelectSection?.(section.id)}
                      onMouseEnter={() => onHoverSection?.(section.id)}
                      onMouseLeave={() => onHoverSection?.(null)}
                      className={`mb-6 p-2 rounded relative cursor-pointer transition-all duration-200 ${
                        isSecActive
                          ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                          : isSecHovered
                          ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                          : 'hover:ring-1 hover:ring-[#0d3479]/30'
                      }`}
                    >
                      {isSecHovered && (
                        <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                          Focus
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                        {sIndex + 1}. <FormattedText text={section.title} globalVars={doc.globalVariables} po={doc.purchaseOrder} />
                      </h2>
                      {section.subsections.map((sub) => (
                        <div key={sub.id} className="my-2">
                          {sub.title && (
                            <h3 className="font-bold text-sm mb-1">
                              <FormattedText text={sub.title} globalVars={doc.globalVariables} po={doc.purchaseOrder} />
                            </h3>
                          )}
                          {sub.body && (
                            <p className="text-gray-900 leading-relaxed indent-4">
                              <FormattedText text={sub.body} globalVars={doc.globalVariables} po={doc.purchaseOrder} />
                            </p>
                          )}
                          {sub.bullets && sub.bullets.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                              {sub.bullets.map((b, bIdx) => (
                                <li key={bIdx}>
                                  <FormattedText text={b} globalVars={doc.globalVariables} po={doc.purchaseOrder} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ==================== LETTERHEAD & FOOTER COMPONENTS ==================== */

interface LetterHeaderProps {
  po: PurchaseOrderData;
  globalVars?: Record<string, string>;
  isActive?: boolean;
  isHovered?: boolean;
  onHover?: (hovering: boolean) => void;
  onSelect?: () => void;
  companyProfile?: CompanyProfile;
}

const LetterHeader: React.FC<LetterHeaderProps> = ({
  po,
  globalVars,
  isActive,
  isHovered,
  onHover,
  onSelect,
  companyProfile,
}) => {
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  const companyName = applyVariables(
    po.companyName !== undefined && po.companyName !== ''
      ? po.companyName
      : pProfile.companyName || '',
    globalVars,
    po
  );
  const companySubtitle = applyVariables(
    po.companySubtitle !== undefined && po.companySubtitle !== ''
      ? po.companySubtitle
      : pProfile.companySubtitle || '',
    globalVars,
    po
  );
  const leftServices = applyVariablesToArray(
    po.leftServices && po.leftServices.length > 0 ? po.leftServices : pProfile.leftServices || [],
    globalVars,
    po
  );
  const rightServices = applyVariablesToArray(
    po.rightServices && po.rightServices.length > 0 ? po.rightServices : pProfile.rightServices || [],
    globalVars,
    po
  );

  return (
    <div
      id="preview-sec-header_footer"
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`mb-3 p-1 rounded relative cursor-pointer transition-all duration-200 select-none ${
        isActive
          ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
          : isHovered
          ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
          : 'hover:ring-1 hover:ring-[#0d3479]/30'
      }`}
      title="Header & Footer (Click to edit)"
    >
      {isHovered && !isActive && (
        <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
          Header & Footer
        </span>
      )}
      <div className="flex items-center justify-between pb-1">
        <div className="w-[35%] pr-3">
          <div className="text-2xl font-black tracking-wider text-black leading-tight">
            {companyName}
          </div>
          <div className="text-lg font-bold tracking-widest text-black leading-tight">
            {companySubtitle}
          </div>
        </div>
        <div className="w-[1px] bg-black self-stretch mx-2" />
        <div className="w-[60%] pl-2 text-[10px] leading-tight text-gray-900">
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
            <div>
              {leftServices.map((svc, i) => (
                <div key={i} className="truncate">
                  {svc}
                </div>
              ))}
            </div>
            <div>
              {rightServices.map((svc, i) => (
                <div key={i} className="truncate">
                  {svc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 my-1">
        <div className="flex-1 h-[2px] bg-black" />
        <div className="w-1.5 h-1.5 rotate-45 border border-black" />
        <div className="flex-1 h-[2px] bg-black" />
      </div>

      <div className="flex justify-between items-center text-[10px] font-bold text-gray-900">
        <div>{applyVariables(companyProfile?.companyAddressHeader || po.companyAddress?.join(', ') || '', globalVars, po)}</div>
        <div>GST NO: {applyVariables(companyProfile?.companyGstNo || po.gstNo, globalVars, po)}</div>
      </div>

      <div className="h-[1px] bg-black my-1" />
    </div>
  );
};

interface LetterFooterProps {
  po: PurchaseOrderData;
  globalVars?: Record<string, string>;
  pageIndex?: number;
  totalPages?: number;
  companyProfile?: CompanyProfile;
}

const LetterFooter: React.FC<LetterFooterProps> = ({
  po,
  globalVars,
  pageIndex,
  totalPages,
  companyProfile,
}) => {
  return (
    <div className="pt-2 mt-auto select-none">
      <div className="h-[1.5px] bg-black mb-1" />
      <div className="flex justify-between items-center text-[9px] leading-tight text-black">
        <div className="flex-1 text-center font-semibold">
          Phone: {applyVariables(po.companyPhone !== undefined && po.companyPhone !== '' ? po.companyPhone : companyProfile?.companyPhone || '', globalVars, po)} &bull;{' '}
          {applyVariables(po.companyAddressFooter !== undefined && po.companyAddressFooter !== '' ? po.companyAddressFooter : companyProfile?.companyAddressFooter || '', globalVars, po)}
          <br />
          Email: {applyVariables(po.companyEmail !== undefined && po.companyEmail !== '' ? po.companyEmail : companyProfile?.companyEmail || '', globalVars, po)} &bull; Website:{' '}
          {applyVariables(po.companyWebsite !== undefined && po.companyWebsite !== '' ? po.companyWebsite : companyProfile?.companyWebsite || '', globalVars, po)}
        </div>
        {pageIndex !== undefined && totalPages !== undefined && totalPages > 1 && (
          <div className="text-[10px] font-mono font-bold text-gray-700 shrink-0 pl-2">
            Page {pageIndex + 1} of {totalPages}
          </div>
        )}
      </div>
    </div>
  );
};

/* ==================== CUSTOM SECTION RENDERER ==================== */

interface CustomSectionRendererProps {
  section: CustomSectionItem;
  globalVars?: Record<string, string>;
  po?: PurchaseOrderData;
  isActive?: boolean;
  isHovered?: boolean;
  onHover?: (hovering: boolean) => void;
  onSelect?: () => void;
}

const CustomSectionRenderer: React.FC<CustomSectionRendererProps> = ({
  section,
  globalVars,
  po,
  isActive,
  isHovered,
  onHover,
  onSelect,
}) => {
  const sectionTitle = applyVariables(section.title, globalVars, po);

  return (
    <div
      id={`preview-sec-${section.id}`}
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`my-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
        isActive
          ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
          : isHovered
          ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
          : 'hover:ring-1 hover:ring-[#0d3479]/30'
      }`}
      title={`${sectionTitle} (Click to edit)`}
    >
      {isHovered && !isActive && (
        <span className="absolute top-1 right-1 text-[9px] bg-gray-800 text-white font-mono px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
          {sectionTitle}
        </span>
      )}
      <h2 className="text-[13px] font-bold text-[#505050] mb-1.5 uppercase tracking-wide">
        {sectionTitle}
      </h2>

      {section.contentType === 'bullet_list' && section.bullets && (
        <ul className="list-disc list-inside space-y-1 pl-1 text-justify whitespace-pre-line">
          {section.bullets.map((b, bIdx) => (
            <li key={bIdx} className="text-black whitespace-pre-line">
              <FormattedText text={b} globalVars={globalVars} po={po} />
            </li>
          ))}
        </ul>
      )}

      {section.contentType === 'legal_clause' && section.paragraphs && (
        <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px] whitespace-pre-line">
          {section.paragraphs.map((p, pIdx) => (
            <div key={pIdx} className="flex items-start space-x-2">
              <span className="font-bold text-black font-mono shrink-0 text-[11px]">
                {pIdx + 1}.0
              </span>
              <p className="flex-1 whitespace-pre-line">
                <FormattedText text={p} globalVars={globalVars} po={po} />
              </p>
            </div>
          ))}
        </div>
      )}

      {section.contentType === 'paragraphs' && section.paragraphs && (
        <div className="space-y-1.5 text-justify leading-relaxed text-black whitespace-pre-line">
          {section.paragraphs.map((p, pIdx) => (
            <p key={pIdx} className="whitespace-pre-line">
              <FormattedText text={p} globalVars={globalVars} po={po} />
            </p>
          ))}
        </div>
      )}

      {section.contentType === 'table' && section.tableHeaders && section.tableRows && (
        <div className="border border-black my-2">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-black bg-gray-100 font-bold">
                {section.tableHeaders.map((h, hIdx) => (
                  <th key={hIdx} className="p-1.5 border-r border-black last:border-r-0 text-left">
                    <FormattedText text={h} globalVars={globalVars} po={po} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-black last:border-b-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 align-top whitespace-pre-line">
                      <FormattedText text={cell} globalVars={globalVars} po={po} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.contentType === 'key_value' && section.keyValuePairs && (
        <div className="border border-black my-2 text-[11px]">
          <table className="w-full border-collapse">
            <tbody>
              {section.keyValuePairs.map((kv, kvIdx) => (
                <tr key={kvIdx} className="border-b border-black last:border-b-0">
                  <td className="p-1.5 font-bold border-r border-black w-1/3 bg-gray-50/50 align-top">
                    <FormattedText text={kv.key} globalVars={globalVars} po={po} />
                  </td>
                  <td className="p-1.5 align-top whitespace-pre-line">
                    <FormattedText text={kv.value} globalVars={globalVars} po={po} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.contentType === 'callout' && section.calloutText && (
        <div className="border-2 border-black p-2.5 my-2.5 bg-gray-50 text-[11px] leading-relaxed whitespace-pre-line">
          <div className="font-bold text-[11.5px] uppercase tracking-wider mb-1 text-black">
            {section.calloutType === 'warning'
              ? 'MANDATORY DIRECTIVE / WARNING'
              : section.calloutType === 'important'
              ? 'IMPORTANT NOTICE'
              : 'SPECIAL NOTICE'}
          </div>
          <p className="italic whitespace-pre-line">
            <FormattedText text={section.calloutText} globalVars={globalVars} po={po} />
          </p>
        </div>
      )}
    </div>
  );
};

/* ==================== MULTI-PAGE RENDERER ==================== */

interface PurchaseOrderPagesProps {
  doc: LatexDocument;
  po: PurchaseOrderData;
  fontFamilyStyle: string;
  printRef?: React.RefObject<HTMLDivElement | null>;
  activeSectionId?: string;
  hoveredSectionId?: string | null;
  onHoverSection?: (sectionId: string | null) => void;
  onSelectSection?: (sectionId: string) => void;
  globalVars?: Record<string, string>;
  companyProfile?: CompanyProfile;
}

const PurchaseOrderPages: React.FC<PurchaseOrderPagesProps> = ({
  doc,
  po,
  fontFamilyStyle,
  printRef,
  activeSectionId,
  hoveredSectionId,
  onHoverSection,
  onSelectSection,
  globalVars,
  companyProfile,
}) => {
  // Strict A4 Page Dimensions (794px width x 1123px height at standard 96 DPI screen/print)
  const pageStyle: React.CSSProperties = {
    fontFamily: fontFamilyStyle,
    width: '794px',
    height: '1123px',
    maxHeight: '1123px',
    overflow: 'hidden',
  };

  // Resolved dynamic variables
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  const companyName = applyVariables(
    po.companyName !== undefined && po.companyName !== ''
      ? po.companyName
      : pProfile.companyName || '',
    globalVars,
    po
  );
  const companySubtitle = applyVariables(
    po.companySubtitle !== undefined && po.companySubtitle !== ''
      ? po.companySubtitle
      : pProfile.companySubtitle || '',
    globalVars,
    po
  );
  const tableCompanyName = applyVariables(
    po.tableCompanyName !== undefined
      ? po.tableCompanyName
      : (po.companyName || pProfile.companyName || ''),
    globalVars,
    po
  );
  const tableCompanySubtitle = applyVariables(
    po.tableCompanySubtitle !== undefined
      ? po.tableCompanySubtitle
      : (po.companySubtitle || pProfile.companySubtitle || ''),
    globalVars,
    po
  );
  const tableCompanyAddress = po.tableCompanyAddress !== undefined ? po.tableCompanyAddress : (po.companyAddress || []);
  
  const companyAddressHeader = po.companyAddress?.join(', ') ?? pProfile.companyAddressHeader ?? '';
  const companyGstNo = po.gstNo ?? pProfile.companyGstNo ?? '';
  const companyPhone = po.companyPhone !== undefined && po.companyPhone !== '' ? po.companyPhone : pProfile.companyPhone || '+91 97254 45370';
  const companyAddressFooter = po.companyAddressFooter !== undefined && po.companyAddressFooter !== '' ? po.companyAddressFooter : pProfile.companyAddressFooter || 'Block No. 1068/99, Ratnakar Business Hub...';
  const companyEmail = po.companyEmail !== undefined && po.companyEmail !== '' ? po.companyEmail : pProfile.companyEmail || 'info@globalindustries.co';
  const companyWebsite = po.companyWebsite !== undefined && po.companyWebsite !== '' ? po.companyWebsite : pProfile.companyWebsite || 'www.globalindustries.co';
  const poNumber = applyVariables(po.poNumber, globalVars, po);
  const poDate = applyVariables(po.poDate, globalVars, po);
  const contractorName = applyVariables(po.contractorName, globalVars, po);
  const projectName = applyVariables(po.projectName, globalVars, po);
  const projectLocation = applyVariables(po.projectLocation, globalVars, po);
  const amountInWords = applyVariables(po.amountInWords, globalVars, po);
  const docTitle = applyVariables(doc.title || 'LABOUR CONTRACT PURCHASE ORDER', globalVars, po);

  const isHeaderActive = activeSectionId === 'letterhead' || activeSectionId === 'footer';
  const isHeaderHovered =
    (hoveredSectionId === 'letterhead' || hoveredSectionId === 'footer') && !isHeaderActive;

  // Retrieve all structured page groups with their assigned sections
  const outlineGroups: OutlineGroup[] = useMemo(() => {
    return getDocumentOutlineGroups(po);
  }, [po]);

  // Render individual document section by ID
  const renderSectionItem = (sec: OutlineSectionItem, isFirstSectionOnPage: boolean, isPage1: boolean) => {
    const isSecActive = activeSectionId === sec.id;
    const isSecHovered = hoveredSectionId === sec.id && !isSecActive;

    if (sec.isCustom && sec.customData) {
      return (
        <CustomSectionRenderer
          key={sec.id}
          section={sec.customData}
          globalVars={globalVars}
          po={po}
          isActive={isSecActive}
          isHovered={isSecHovered}
          onHover={(h) => onHoverSection?.(h ? sec.id : null)}
          onSelect={() => onSelectSection?.(sec.id)}
        />
      );
    }

    switch (sec.id) {
      case 'info': {
        return (
          <div key="info_container">
            {isPage1 && (
              <div className="text-center my-2">
                <h1 className="text-lg font-bold uppercase tracking-wide text-black">
                  {docTitle}
                </h1>
              </div>
            )}
            <div
              id="preview-sec-info"
              onClick={() => onSelectSection?.('info')}
              onMouseEnter={() => onHoverSection?.('info')}
              onMouseLeave={() => onHoverSection?.(null)}
              className={`border border-black my-2 text-[11.5px] p-0.5 rounded relative cursor-pointer transition-all duration-200 ${
                isSecActive
                  ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                  : isSecHovered
                  ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                  : 'hover:ring-1 hover:ring-[#0d3479]/30'
              }`}
              title="PO Info & Parties (Click to edit)"
            >
              {isSecHovered && (
                <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                  PO Info & Parties
                </span>
              )}
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-1/2 p-2 border-r border-black font-bold align-top space-y-0.5">
                      {(tableCompanyName || tableCompanySubtitle) && (
                        <div>Company: {tableCompanyName} {tableCompanySubtitle}</div>
                      )}
                      {tableCompanyAddress.map((addrLine, aIdx) => {
                        const resolved = applyVariables(addrLine, globalVars, po);
                        if (!resolved || resolved.trim() === '') {
                          return <div key={aIdx} className="h-3.5">&nbsp;</div>;
                        }
                        return (
                          <div key={aIdx} className="font-bold">
                            {resolved}
                          </div>
                        );
                      })}
                      {poNumber && <div className="font-bold mt-1">PO No.: {poNumber}</div>}
                      {poDate && <div className="font-bold">Date: {poDate}</div>}
                    </td>
                    <td className="w-1/2 p-2 font-bold align-top space-y-0.5 whitespace-pre-line">
                      {contractorName && <div>Contractor Name: {contractorName}</div>}
                      {projectName && <div>Project Name: {projectName}</div>}
                      {projectLocation && <div>Project Location: {projectLocation}</div>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'scope': {
        return (
          <div
            key="scope"
            id="preview-sec-scope"
            onClick={() => onSelectSection?.('scope')}
            onMouseEnter={() => onHoverSection?.('scope')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Scope of Work (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Scope of Work
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">Scope of Work</h2>
            <ul className="list-disc list-inside space-y-1 pl-1 whitespace-pre-line">
              {po.scopeOfWork.map((item, i) => (
                <li key={i} className="text-black whitespace-pre-line">
                  <FormattedText text={item} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'rates': {
        return (
          <div
            key="rates"
            id="preview-sec-rates"
            onClick={() => onSelectSection?.('rates')}
            onMouseEnter={() => onHoverSection?.('rates')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Rate & Pricing Table (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Rates & Pricing
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1.5">Rate</h2>

            <div className="border border-black">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-black bg-gray-50/50 font-bold">
                    <th className="p-1.5 border-r border-black text-left">Description</th>
                    <th className="p-1.5 border-r border-black text-left w-16">Unit</th>
                    <th className="p-1.5 border-r border-black text-left w-24">Qty</th>
                    <th className="p-1.5 border-r border-black text-left w-16">Rate</th>
                    <th className="p-1.5 text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(po.rateItems || []).map((item) => (
                    <tr key={item.id} className="border-b border-black">
                      <td className="p-1.5 border-r border-black leading-snug align-top whitespace-pre-line">
                        <FormattedText text={item.description} globalVars={globalVars} po={po} />
                      </td>
                      <td className="p-1.5 border-r border-black align-top whitespace-nowrap">
                        <FormattedText text={item.unit} globalVars={globalVars} po={po} />
                      </td>
                      <td className="p-1.5 border-r border-black align-top whitespace-nowrap">
                        <FormattedText text={item.qty} globalVars={globalVars} po={po} />
                      </td>
                      <td className="p-1.5 border-r border-black align-top whitespace-nowrap">
                        <FormattedText text={item.rate} globalVars={globalVars} po={po} />
                      </td>
                      <td className="p-1.5 text-right align-top font-mono">
                        <FormattedText text={item.total} globalVars={globalVars} po={po} />
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="p-1.5 font-bold whitespace-pre-line">
                      Amount in work: <FormattedText text={amountInWords} globalVars={globalVars} po={po} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'scope_contractor': {
        return (
          <div
            key="scope_contractor"
            id="preview-sec-scope_contractor"
            onClick={() => onSelectSection?.('scope_contractor')}
            onMouseEnter={() => onHoverSection?.('scope_contractor')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Scope of Contractor (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Scope of Contractor
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Scope of Contractor
            </h2>
            <div className="space-y-1.5 text-justify leading-relaxed whitespace-pre-line">
              {po.scopeOfContractor.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={p} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'payment_terms': {
        return (
          <div
            key="payment_terms"
            id="preview-sec-payment_terms"
            onClick={() => onSelectSection?.('payment_terms')}
            onMouseEnter={() => onHoverSection?.('payment_terms')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Payment Terms & Milestones (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Payment Milestones
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Payment Terms & Milestones
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-1 whitespace-pre-line">
              {po.paymentTerms.map((term, i) => (
                <li key={i} className="whitespace-pre-line">
                  <FormattedText text={term} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'measurement': {
        return (
          <div
            key="measurement"
            id="preview-sec-measurement"
            onClick={() => onSelectSection?.('measurement')}
            onMouseEnter={() => onHoverSection?.('measurement')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Quality, Materials & Safety (Clauses 5–7) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Quality & Safety
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Quality, Materials & Safety (Clauses 5–7)
            </h2>
            <div className="space-y-1.5 text-justify leading-relaxed whitespace-pre-line">
              {po.measurementClause.map((clause, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={clause} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'terms': {
        return (
          <div
            key="terms"
            id="preview-sec-terms"
            onClick={() => onSelectSection?.('terms')}
            onMouseEnter={() => onHoverSection?.('terms')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Commercial, Labour & Measurement Terms (Clauses 8–10) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Commercial & Labour Terms
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Commercial & Labour Terms (Clauses 8–10)
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-1 whitespace-pre-line">
              {po.termsAndConditions.map((term, i) => (
                <li key={i} className="whitespace-pre-line">
                  <FormattedText text={term} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'page3_terms': {
        return (
          <div
            key="page3_terms"
            id="preview-sec-page3_terms"
            onClick={() => onSelectSection?.('page3_terms')}
            onMouseEnter={() => onHoverSection?.('page3_terms')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="General Terms & Defect Liability (Clauses 11–16) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                General Terms & Liabilities
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              General Terms & Defect Liability (Clauses 11–16)
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-justify whitespace-pre-line">
              {po.page3Terms.map((term, i) => (
                <li key={i} className="whitespace-pre-line">
                  <FormattedText text={term} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'signatures': {
        return (
          <div
            key="signatures"
            id="preview-sec-signatures"
            onClick={() => onSelectSection?.('signatures')}
            onMouseEnter={() => onHoverSection?.('signatures')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-10 flex justify-between items-end px-4 p-2 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Signatures & Execution Block (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Signatures
              </span>
            )}
            <div>
              <div className="font-bold text-sm">
                For {companyName} {companySubtitle}
              </div>
              <div className="h-14" />
              <div className="font-bold text-xs border-t border-black/40 pt-1">
                {applyVariables(po.signatoryCompany || 'Authorized Signatory', globalVars, po)}
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-sm">Accepted By Contractor</div>
              <div className="h-14" />
              <div className="font-bold text-xs border-t border-black/40 pt-1">
                {applyVariables(po.signatoryContractor || 'Name & Signature', globalVars, po)}
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Accurate line counting that prevents double-counting \n and text-wrapping
  const countRenderedLines = (text: string, charsPerLine: number = 70) => {
    if (!text) return 1;
    return text.split('\n').reduce((acc, line) => {
      return acc + Math.max(1, Math.ceil(line.length / charsPerLine));
    }, 0);
  };

  // Precise row height estimation helpers matching 11px CSS rendering
  const getPoRateItemHeight = (item: PORateItem) => {
    const lines = countRenderedLines(item.description || '', 55);
    return Math.max(22, lines * 15 + 8);
  };

  const getPoScopeHeight = (item: string) => {
    const lines = countRenderedLines(item || '', 80);
    return Math.max(18, lines * 14 + 4);
  };

  const getPoTermHeight = (term: string) => {
    const lines = countRenderedLines(term || '', 80);
    return Math.max(18, lines * 14 + 4);
  };

  // Dynamic layout partitioner logic (heuristic-based Word/LaTeX style auto-pagination)
  const partitionGroupSections = (group: OutlineGroup) => {
    const subPages: { sections: React.ReactNode[] }[] = [];
    let currentPageSections: React.ReactNode[] = [];
    let currentHeight = 0;

    const isPage1 = group.pageNum === 1;
    // Page 1 has LetterHeader (185px) + Doc Title (40px) + Padding (80px) + Footer (65px) -> Safe Content Budget = 660px
    // Continuation pages have Header (110px) + Padding (80px) + Footer (65px) -> Safe Content Budget = 760px
    const budget = isPage1 ? 660 : 760;

    const commitPage = () => {
      if (currentPageSections.length > 0) {
        subPages.push({ sections: currentPageSections });
        currentPageSections = [];
        currentHeight = 0;
      }
    };

    group.sections.forEach((sec) => {
      let estimatedHeight = 35;
      if (sec.id === 'info') {
        estimatedHeight = 175;
      } else if (sec.id === 'scope') {
        estimatedHeight = 30 + (po.scopeOfWork || []).reduce((acc, s) => acc + getPoScopeHeight(s), 0);
      } else if (sec.id === 'rates') {
        estimatedHeight = 35 + (po.rateItems || []).reduce((acc, r) => acc + getPoRateItemHeight(r), 0) + 35;
      } else if (sec.id === 'scope_contractor') {
        estimatedHeight = 30 + (po.scopeOfContractor || []).reduce((acc, s) => acc + getPoScopeHeight(s), 0);
      } else if (sec.id === 'payment_terms') {
        estimatedHeight = 30 + (po.paymentTerms || []).reduce((acc, s) => acc + getPoTermHeight(s), 0);
      } else if (sec.id === 'measurement') {
        estimatedHeight = 95;
      } else if (sec.id === 'safety') {
        estimatedHeight = 95;
      } else if (sec.id === 'page3_terms') {
        estimatedHeight = 30 + (po.page3Terms || []).reduce((acc, s) => acc + getPoTermHeight(s), 0);
      } else if (sec.id === 'signatures') {
        estimatedHeight = 160;
      } else if (sec.isCustom && sec.customData) {
        const cs = sec.customData;
        estimatedHeight = 35;
        if (cs.contentType === 'bullet_list' && cs.bullets) {
          estimatedHeight += cs.bullets.reduce((acc, b) => acc + Math.max(20, countRenderedLines(b, 65) * 15 + 6), 0);
        } else if (cs.contentType === 'paragraphs' && cs.paragraphs) {
          estimatedHeight += cs.paragraphs.reduce((acc, p) => acc + Math.max(22, countRenderedLines(p, 70) * 15 + 8), 0);
        } else if (cs.contentType === 'legal_clause' && cs.paragraphs) {
          estimatedHeight += cs.paragraphs.reduce((acc, p) => acc + Math.max(24, countRenderedLines(p, 70) * 15 + 10), 0);
        } else if (cs.contentType === 'table' && cs.tableRows) {
          const headersHeight = 34;
          const rowsHeight = cs.tableRows.reduce((acc, row) => {
            const maxCellLines = row.reduce(
              (maxL, cell) => Math.max(maxL, countRenderedLines(cell, 30)),
              1
            );
            return acc + Math.max(26, maxCellLines * 16 + 8);
          }, 0);
          estimatedHeight += headersHeight + rowsHeight + 10;
        } else if (cs.contentType === 'key_value' && cs.keyValuePairs) {
          estimatedHeight += cs.keyValuePairs.reduce((acc, kv) => {
            const kLines = countRenderedLines(kv.key, 22);
            const vLines = countRenderedLines(kv.value, 40);
            return acc + Math.max(26, Math.max(kLines, vLines) * 16 + 6);
          }, 0) + 10;
        } else if (cs.contentType === 'callout') {
          estimatedHeight += Math.max(80, countRenderedLines(cs.calloutText || '', 65) * 16 + 45);
        }
      }

      if (currentHeight + estimatedHeight <= budget) {
        currentPageSections.push(renderSectionItem(sec, currentPageSections.length === 0, group.pageNum === 1));
        currentHeight += estimatedHeight;
      } else {
        if (sec.id === 'rates') {
          const list = po.rateItems || [];
          let currentListIndex = 0;

          while (currentListIndex < list.length) {
            const remainingBudget = budget - currentHeight;
            if (remainingBudget < 50) {
              commitPage();
            }

            const pageRows: typeof list = [];
            let rowsHeight = 30;

            while (currentListIndex < list.length) {
              const item = list[currentListIndex];
              const rowH = getPoRateItemHeight(item);
              if (rowsHeight + rowH <= budget - currentHeight) {
                pageRows.push(item);
                rowsHeight += rowH;
                currentListIndex++;
              } else {
                break;
              }
            }

            if (pageRows.length === 0 && currentListIndex < list.length) {
              pageRows.push(list[currentListIndex]);
              rowsHeight += getPoRateItemHeight(list[currentListIndex]);
              currentListIndex++;
            }

            const isFinalPart = currentListIndex === list.length;
            const amountInWordsHeight = 30;
            const fitsAmount = isFinalPart && (rowsHeight + amountInWordsHeight <= budget - currentHeight);

            currentPageSections.push(
              <div
                key={`${sec.id}_split_${subPages.length}`}
                className={`mt-2 p-1.5 rounded relative ${
                  activeSectionId === 'rates'
                    ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                    : hoveredSectionId === 'rates'
                    ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                    : 'hover:ring-1 hover:ring-[#0d3479]/30'
                }`}
              >
                <h2 className="text-[13px] font-bold text-[#505050] mb-1.5">
                  Rate {pageRows.length < list.length || currentListIndex > pageRows.length ? '(Continued)' : ''}
                </h2>
                <div className="border border-black">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-black bg-gray-50/50 font-bold">
                        <th className="p-1.5 border-r border-black text-left">Description</th>
                        <th className="p-1.5 border-r border-black text-left w-16">Unit</th>
                        <th className="p-1.5 border-r border-black text-left w-24">Qty</th>
                        <th className="p-1.5 border-r border-black text-left w-16">Rate</th>
                        <th className="p-1.5 text-right w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((item) => (
                        <tr key={item.id} className="border-b border-black">
                          <td className="p-1.5 border-r border-black leading-snug align-top">
                            {applyVariables(item.description, globalVars, po)}
                          </td>
                          <td className="p-1.5 border-r border-black align-top whitespace-nowrap">
                            {applyVariables(item.unit, globalVars, po)}
                          </td>
                          <td className="p-1.5 border-r border-black align-top whitespace-nowrap">
                            {applyVariables(item.qty, globalVars, po)}
                          </td>
                          <td className="p-1.5 border-r border-black align-top whitespace-nowrap">
                            {applyVariables(item.rate, globalVars, po)}
                          </td>
                          <td className="p-1.5 text-right align-top font-mono">
                            {applyVariables(item.total, globalVars, po)}
                          </td>
                        </tr>
                      ))}
                      {fitsAmount && (
                        <tr>
                          <td colSpan={5} className="p-1.5 font-bold">
                            Amount in words: {amountInWords}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );

            currentHeight += rowsHeight;
            if (currentListIndex < list.length) {
              commitPage();
            }
          }
        } else if (
          sec.isCustom &&
          sec.customData &&
          sec.customData.contentType === 'table' &&
          sec.customData.tableRows
        ) {
          const rows = sec.customData.tableRows;
          const headers = sec.customData.tableHeaders || [];
          let currentListIndex = 0;

          while (currentListIndex < rows.length) {
            const remainingBudget = budget - currentHeight;
            if (remainingBudget < 50) {
              commitPage();
            }

            const pageRows: typeof rows = [];
            let rowsHeight = 30;

            while (currentListIndex < rows.length) {
              const r = rows[currentListIndex];
              const maxCellLines = r.reduce((acc, cell) => Math.max(acc, cell.split('\n').length, Math.ceil(cell.length / 35)), 1);
              const rowH = Math.max(22, maxCellLines * 15 + 8);
              if (rowsHeight + rowH <= budget - currentHeight) {
                pageRows.push(r);
                rowsHeight += rowH;
                currentListIndex++;
              } else {
                break;
              }
            }

            if (pageRows.length === 0 && currentListIndex < rows.length) {
              pageRows.push(rows[currentListIndex]);
              rowsHeight += 30;
              currentListIndex++;
            }

            currentPageSections.push(
              <div key={`${sec.id}_split_${subPages.length}`} className="my-2 p-1.5 rounded relative">
                <h2 className="text-[12.5px] font-bold text-[#404040] mb-1.5 uppercase tracking-wide">
                  {applyVariables(sec.customData.title, globalVars, po)} {pageRows.length < rows.length || currentListIndex > pageRows.length ? '(Continued)' : ''}
                </h2>
                <div className="border border-black my-2">
                  <table className="w-full border-collapse text-[10.5px]">
                    <thead>
                      <tr className="border-b border-black bg-gray-100 font-bold">
                        {headers.map((h, hIdx) => (
                          <th key={hIdx} className="p-1.5 border-r border-black last:border-r-0 text-left">
                            {applyVariables(h, globalVars, po)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-black last:border-b-0">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 align-top whitespace-pre-wrap">
                              {applyVariables(cell, globalVars, po)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

            currentHeight += rowsHeight;
            if (currentListIndex < rows.length) {
              commitPage();
            }
          }
        } else {
          commitPage();
          currentPageSections.push(renderSectionItem(sec, true, group.pageNum === 1));
          currentHeight = estimatedHeight;
        }
      }
    });

    if (currentPageSections.length > 0) {
      commitPage();
    }

    return subPages;
  };

  const paginatedPages = useMemo(() => {
    const pages: {
      groupId: string;
      pageNum: number;
      groupTitle: string;
      sections: React.ReactNode[];
    }[] = [];

    let curPageNum = 1;

    outlineGroups.forEach((group) => {
      const subPages = partitionGroupSections(group);
      subPages.forEach((sp, spIdx) => {
        pages.push({
          groupId: `${group.groupId}_p${spIdx}`,
          pageNum: curPageNum++,
          groupTitle: spIdx > 0 ? `${group.groupTitle} (Continued)` : group.groupTitle,
          sections: sp.sections,
        });
      });
    });

    return pages;
  }, [outlineGroups, po, globalVars, activeSectionId, hoveredSectionId, doc.title, doc]);

  return (
    <div ref={printRef} className="space-y-12 print-area flex flex-col items-center select-text">
      {paginatedPages.map((page, pageIdx) => (
        <div
          key={`page_${page.groupId}`}
          style={pageStyle}
          className="latex-paper bg-white text-black p-10 shadow-2xl relative flex flex-col justify-between text-[11.5px] leading-normal"
        >
          {/* Header & Page Sections */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0">
              <LetterHeader
                po={po}
                globalVars={globalVars}
                companyProfile={companyProfile}
                isActive={isHeaderActive}
                isHovered={isHeaderHovered}
                onHover={(h) => onHoverSection?.(h ? 'letterhead' : null)}
                onSelect={() => onSelectSection?.('letterhead')}
              />
            </div>

            <div className="flex-1 space-y-2 min-h-0">
              {page.sections.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic text-xs border-2 border-dashed border-gray-200 rounded my-8">
                  Empty Page / Section Group &bull; Drag sections here from the Document Outline
                </div>
              ) : (
                page.sections.map((secNode) => secNode)
              )}
            </div>
          </div>

          {/* Constant Standard Footer with Page Number */}
          <div className="shrink-0">
            <LetterFooter
              po={po}
              globalVars={globalVars}
              companyProfile={companyProfile}
              pageIndex={pageIdx}
              totalPages={paginatedPages.length}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
