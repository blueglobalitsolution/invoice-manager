'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, FileCode } from 'lucide-react';
import {
  LatexDocument,
  PurchaseOrderData,
  CustomSectionItem,
} from '@/types/document';
import { TaxInvoicePreview } from './TaxInvoicePreview';
import { QuotationPreview } from './QuotationPreview';
import { LatexFormattedText } from '@/lib/katex-renderer';
import { applyVariables, applyVariablesToArray } from '@/lib/variables';
import {
  getDocumentOutlineGroups,
  OutlineGroup,
  OutlineSectionItem,
} from '@/lib/document-sections';
import { CompanyProfile } from '@/types/project';

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
    <div className="flex-1 flex flex-col bg-[#4B5563] overflow-hidden relative h-full min-h-0">
      {/* Top Preview Toolbar */}
      <div className="h-10 bg-[#374151] flex items-center justify-between px-4 border-b border-gray-600 shrink-0 z-10 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex bg-[#1F2937] rounded border border-gray-700 overflow-hidden text-xs text-gray-300">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
              className="px-2 py-1 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-1 bg-[#111827] text-white font-mono font-medium text-[11px] border-x border-gray-700">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(175, zoomLevel + 15))}
              className="px-2 py-1 hover:bg-gray-700 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              className="px-2.5 py-1 hover:bg-gray-700 hover:text-white transition-colors font-medium text-[11px] cursor-pointer"
            >
              Reset
            </button>
          </div>

          {activeSectionId && (
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-emerald-400 bg-[#1F2937]/90 px-2.5 py-1 rounded border border-emerald-800/60 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Section: {activeSectionId.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Right Preview Toolbar Action */}
        {onOpenLatexCode && (
          <button
            onClick={onOpenLatexCode}
            className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#1F2937] hover:bg-gray-700 text-sky-300 hover:text-white rounded border border-gray-700 hover:border-gray-500 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            title="View generated LaTeX (.tex) source"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>LaTeX Code</span>
          </button>
        )}
      </div>

      {/* Main Canvas Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#52525B] scrollbar-thin scroll-smooth text-center"
      >
        {/* Centered preview container scaled natively using CSS zoom */}
        <div
          style={{
            zoom: zoomLevel / 100,
            transition: 'zoom 0.15s ease-out',
            display: 'inline-block',
            margin: '0 auto',
            textAlign: 'left',
          }}
          className="mb-20 space-y-12"
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
                    <LatexFormattedText text={applyVariables(doc.title || 'Untitled Document', doc.globalVariables, doc.purchaseOrder)} />
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
                          ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                          : isSecHovered
                          ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                          : 'hover:ring-1 hover:ring-emerald-300/40'
                      }`}
                    >
                      {isSecHovered && (
                        <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                          Focus
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-gray-900 border-b border-gray-300 pb-1 mb-3">
                        {sIndex + 1}. <LatexFormattedText text={applyVariables(section.title, doc.globalVariables, doc.purchaseOrder)} />
                      </h2>
                      {section.subsections.map((sub) => (
                        <div key={sub.id} className="my-2">
                          {sub.title && (
                            <h3 className="font-bold text-sm mb-1">
                              {applyVariables(sub.title, doc.globalVariables, doc.purchaseOrder)}
                            </h3>
                          )}
                          {sub.body && (
                            <p className="text-gray-900 leading-relaxed indent-4">
                              <LatexFormattedText text={applyVariables(sub.body, doc.globalVariables, doc.purchaseOrder)} />
                            </p>
                          )}
                          {sub.bullets && sub.bullets.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                              {sub.bullets.map((b, bIdx) => (
                                <li key={bIdx}>
                                  <LatexFormattedText text={applyVariables(b, doc.globalVariables, doc.purchaseOrder)} />
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
  const companyName = applyVariables(pProfile.companyName || po.companyName, globalVars, po);
  const companySubtitle = applyVariables(pProfile.companySubtitle || po.companySubtitle, globalVars, po);
  const leftServices = applyVariablesToArray(pProfile.leftServices || po.leftServices, globalVars, po);
  const rightServices = applyVariablesToArray(pProfile.rightServices || po.rightServices, globalVars, po);

  return (
    <div
      id="preview-sec-header_footer"
      onClick={onSelect}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      className={`mb-3 p-1 rounded relative cursor-pointer transition-all duration-200 select-none ${
        isActive
          ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
          : isHovered
          ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
          : 'hover:ring-1 hover:ring-emerald-300/40'
      }`}
      title="Header & Footer (Click to edit)"
    >
      {isHovered && !isActive && (
        <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
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
          Phone: {applyVariables(companyProfile?.companyPhone || po.companyPhone, globalVars, po)} &bull;{' '}
          {applyVariables(companyProfile?.companyAddressFooter || po.companyAddressFooter, globalVars, po)}
          <br />
          Email: {applyVariables(companyProfile?.companyEmail || po.companyEmail, globalVars, po)} &bull; Website:{' '}
          {applyVariables(companyProfile?.companyWebsite || po.companyWebsite, globalVars, po)}
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
          ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
          : isHovered
          ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
          : 'hover:ring-1 hover:ring-emerald-300/40'
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
        <ul className="list-disc list-inside space-y-1 pl-1 text-justify">
          {section.bullets.map((b, bIdx) => (
            <li key={bIdx} className="text-black">
              {applyVariables(b, globalVars, po)}
            </li>
          ))}
        </ul>
      )}

      {section.contentType === 'legal_clause' && section.paragraphs && (
        <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
          {section.paragraphs.map((p, pIdx) => (
            <div key={pIdx} className="flex items-start space-x-2">
              <span className="font-bold text-black font-mono shrink-0 text-[11px]">
                {pIdx + 1}.0
              </span>
              <p className="flex-1">{applyVariables(p, globalVars, po)}</p>
            </div>
          ))}
        </div>
      )}

      {section.contentType === 'paragraphs' && section.paragraphs && (
        <div className="space-y-1.5 text-justify leading-relaxed text-black">
          {section.paragraphs.map((p, pIdx) => (
            <p key={pIdx}>{applyVariables(p, globalVars, po)}</p>
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
                    {applyVariables(h, globalVars, po)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-black last:border-b-0">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 align-top">
                      {applyVariables(cell, globalVars, po)}
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
                    {applyVariables(kv.key, globalVars, po)}
                  </td>
                  <td className="p-1.5 align-top">
                    {applyVariables(kv.value, globalVars, po)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.contentType === 'callout' && section.calloutText && (
        <div className="border-2 border-black p-2.5 my-2.5 bg-gray-50 text-[11px] leading-relaxed">
          <div className="font-bold text-[11.5px] uppercase tracking-wider mb-1 text-black">
            {section.calloutType === 'warning'
              ? 'MANDATORY DIRECTIVE / WARNING'
              : section.calloutType === 'important'
              ? 'IMPORTANT NOTICE'
              : 'SPECIAL NOTICE'}
          </div>
          <p className="italic">{applyVariables(section.calloutText, globalVars, po)}</p>
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
  const companyName = applyVariables(pProfile.companyName || po.companyName, globalVars, po);
  const companySubtitle = applyVariables(pProfile.companySubtitle || po.companySubtitle, globalVars, po);
  const leftServices = pProfile.leftServices || po.leftServices || [];
  const rightServices = pProfile.rightServices || po.rightServices || [];
  
  const companyAddressHeader = pProfile.companyAddressHeader || po.companyAddress?.join(', ') || '';
  const companyGstNo = pProfile.companyGstNo || po.gstNo || '';
  const companyPhone = pProfile.companyPhone || po.companyPhone || '+91 97254 45370';
  const companyAddressFooter = pProfile.companyAddressFooter || po.companyAddressFooter || 'Block No. 1068/99, Ratnakar Business Hub...';
  const companyEmail = pProfile.companyEmail || po.companyEmail || 'info@globalindustries.co';
  const companyWebsite = pProfile.companyWebsite || po.companyWebsite || 'www.globalindustries.co';
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
                  ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                  : isSecHovered
                  ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                  : 'hover:ring-1 hover:ring-emerald-300/40'
              }`}
              title="PO Info & Parties (Click to edit)"
            >
              {isSecHovered && (
                <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                  PO Info & Parties
                </span>
              )}
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="w-1/2 p-2 border-r border-black font-bold align-top">
                      Company: {companyName} {companySubtitle}
                      <div className="font-bold">
                        {applyVariables(po.companyAddress[0], globalVars, po)}
                      </div>
                      <div className="font-bold">
                        {applyVariables(po.companyAddress[1], globalVars, po)}
                      </div>
                      <div className="font-bold">
                        {applyVariables(po.companyAddress[2], globalVars, po)}
                      </div>
                      <div className="font-bold mt-1">PO No.: {poNumber}</div>
                      <div className="font-bold">Date: {poDate}</div>
                    </td>
                    <td className="w-1/2 p-2 font-bold align-top space-y-0.5">
                      <div>Contractor Name: {contractorName}</div>
                      <div>Project Name: {projectName}</div>
                      <div>Project Location: {projectLocation}</div>
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Scope of Work (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Scope of Work
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">Scope of Work</h2>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {po.scopeOfWork.map((item, i) => (
                <li key={i} className="text-black">
                  {applyVariables(item, globalVars, po)}
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Rate & Pricing Table (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
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
                  <tr>
                    <td colSpan={5} className="p-1.5 font-bold">
                      Amount in work: {amountInWords}
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Scope of Contractor (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Scope of Contractor
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Scope of Contractor
            </h2>
            <div className="space-y-1.5 text-justify leading-relaxed">
              {po.scopeOfContractor.map((p, i) => (
                <p key={i}>{applyVariables(p, globalVars, po)}</p>
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Payment Terms & Milestones (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Payment Milestones
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Payment Terms & Milestones
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {po.paymentTerms.map((term, i) => (
                <li key={i}>{applyVariables(term, globalVars, po)}</li>
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Quality, Materials & Safety (Clauses 5–7) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Quality & Safety
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Quality, Materials & Safety (Clauses 5–7)
            </h2>
            <div className="space-y-1.5 text-justify leading-relaxed">
              {po.measurementClause.map((clause, i) => (
                <p key={i}>{applyVariables(clause, globalVars, po)}</p>
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Commercial, Labour & Measurement Terms (Clauses 8–10) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Commercial & Labour Terms
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              Commercial & Labour Terms (Clauses 8–10)
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {po.termsAndConditions.map((term, i) => (
                <li key={i}>{applyVariables(term, globalVars, po)}</li>
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="General Terms & Defect Liability (Clauses 11–16) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                General Terms & Liabilities
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              General Terms & Defect Liability (Clauses 11–16)
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-justify">
              {po.page3Terms.map((term, i) => (
                <li key={i}>{applyVariables(term, globalVars, po)}</li>
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
                ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
                : 'hover:ring-1 hover:ring-emerald-300/40'
            }`}
            title="Signatures & Execution Block (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
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

  return (
    <div ref={printRef} className="space-y-12 print-area">
      {outlineGroups.map((group, pageIdx) => (
        <div
          key={`page_${group.pageNum}_${pageIdx}`}
          style={pageStyle}
          className="latex-paper bg-white text-black p-10 shadow-2xl relative flex flex-col justify-between text-[11.5px] leading-normal"
        >
          {/* Header & Page Sections */}
          <div className="flex-1 flex flex-col">
            <LetterHeader
              po={po}
              globalVars={globalVars}
              companyProfile={companyProfile}
              isActive={isHeaderActive}
              isHovered={isHeaderHovered}
              onHover={(h) => onHoverSection?.(h ? 'letterhead' : null)}
              onSelect={() => onSelectSection?.('letterhead')}
            />

            <div className="flex-1 space-y-2">
              {group.sections.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic text-xs border-2 border-dashed border-gray-200 rounded my-8">
                  Empty Page / Section Group &bull; Drag sections here from the Document Outline
                </div>
              ) : (
                group.sections.map((sec, idx) =>
                  renderSectionItem(sec, idx === 0, group.pageNum === 1)
                )
              )}
            </div>
          </div>

          {/* Constant Standard Footer with Page Number */}
          <LetterFooter
            po={po}
            globalVars={globalVars}
            companyProfile={companyProfile}
            pageIndex={pageIdx}
            totalPages={outlineGroups.length}
          />
        </div>
      ))}
    </div>
  );
};
