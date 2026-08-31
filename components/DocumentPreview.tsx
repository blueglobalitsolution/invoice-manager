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
import { WatermarkOverlay } from './WatermarkOverlay';
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
  onSelect,
  onHover,
  companyProfile,
}) => {
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  
  const rawCompanyName = pProfile.companyName || po.companyName || 'GLOBAL';
  const rawCompanySubtitle = pProfile.companySubtitle !== undefined ? pProfile.companySubtitle : (po.companySubtitle || 'INDUSTRIES');

  const companyName = applyVariables(rawCompanyName, globalVars, po);
  const companySubtitle = applyVariables(rawCompanySubtitle, globalVars, po);

  const leftServices = applyVariablesToArray(
    pProfile.leftServices && pProfile.leftServices.length > 0
      ? pProfile.leftServices
      : (po.leftServices && po.leftServices.length > 0 ? po.leftServices : [
          '• Pre Engineering Building',
          '• Roofing Solution',
          '• Engineering Project & Designing',
          '• "Z" & "C" Purlins',
        ]),
    globalVars,
    po
  );
  const rightServices = applyVariablesToArray(
    pProfile.rightServices && pProfile.rightServices.length > 0
      ? pProfile.rightServices
      : (po.rightServices && po.rightServices.length > 0 ? po.rightServices : [
          '• Infra Materials',
          '• Puf Panels & Insulation Roofing',
          '• Skylight Sheets',
          '• Air Ventilators',
        ]),
    globalVars,
    po
  );

  const rawHeaderAddr = pProfile.companyAddressHeader || (Array.isArray(po.companyAddress) ? po.companyAddress.join(', ') : '') || 'Regd. Off. : SO7B / 2nd floor, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara, Gujarat - 391243';

  const companyAddressHeader = applyVariables(rawHeaderAddr, globalVars, po);
  const companyGstNo = applyVariables(
    pProfile.companyGstNo || po.gstNo || '24CLNPS9550H1ZI',
    globalVars,
    po
  );

  return (
    <div className="mb-2 p-1 select-none">
      <div className="flex items-center justify-between">
        {/* Left Brand */}
        <div className="w-[35%] pr-2">
          <div className="text-[26px] font-black tracking-tight leading-none text-black">
            <FormattedText text={companyName} globalVars={globalVars} po={po} />
          </div>
          <div className="text-[17px] font-extrabold tracking-wider leading-tight text-black mt-0.5">
            <FormattedText text={companySubtitle} globalVars={globalVars} po={po} />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-[0.8pt] bg-black self-stretch mx-2" />

        {/* Right Services List */}
        <div className="w-[60%] pl-2 text-[10px] leading-[1.3] text-black">
          <div className="grid grid-cols-2 gap-x-3">
            <div>
              {leftServices.map((svc, i) => (
                <div key={i} className="truncate">
                  <FormattedText text={svc} globalVars={globalVars} po={po} />
                </div>
              ))}
            </div>
            <div>
              {rightServices.map((svc, i) => (
                <div key={i} className="truncate">
                  <FormattedText text={svc} globalVars={globalVars} po={po} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider and GST */}
      <div className="h-[0.8pt] bg-black w-full my-1.5" />
      <div className="flex justify-between items-center text-[10px] font-bold text-black tracking-wide">
        <div><FormattedText text={companyAddressHeader} globalVars={globalVars} po={po} /></div>
        <div>GST NO. : <FormattedText text={companyGstNo} globalVars={globalVars} po={po} /></div>
      </div>
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
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  const phone = pProfile.companyPhone || '+91 97254 45370';
  const addressFooter =
    pProfile.companyAddressFooter ||
    'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243';
  const email = pProfile.companyEmail || 'info@globalindustries.co';
  const website = pProfile.companyWebsite || 'www.globalindustries.co';

  return (
    <div className="pt-2 mt-auto select-none">
      <div className="h-[0.8pt] bg-black mb-1" />
      <div className="flex justify-between items-center text-[9px] leading-tight text-black">
        <div className="flex-1 text-center font-semibold">
          Phone: {applyVariables(phone, globalVars, po)} &bull;{' '}
          {applyVariables(addressFooter, globalVars, po)}
          <br />
          Email: {applyVariables(email, globalVars, po)} &bull; Website:{' '}
          {applyVariables(website, globalVars, po)}
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
  itemsOverride?: any[];
  isContinued?: boolean;
}

const CustomSectionRenderer: React.FC<CustomSectionRendererProps> = ({
  section,
  globalVars,
  po,
  isActive,
  isHovered,
  onHover,
  onSelect,
  itemsOverride,
  isContinued,
}) => {
  const sectionTitle = applyVariables(section.title, globalVars, po);

  const bullets = (itemsOverride as string[]) || section.bullets || [];
  const paragraphs = (itemsOverride as string[]) || section.paragraphs || [];
  const tableRows = (itemsOverride as string[][]) || section.tableRows || [];

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
        {sectionTitle} {isContinued ? '(Continued)' : ''}
      </h2>

      {section.contentType === 'bullet_list' && bullets.length > 0 && (
        <ul className="list-disc list-inside space-y-1 pl-1 text-justify whitespace-pre-line">
          {bullets.map((b, bIdx) => (
            <li key={bIdx} className="text-black whitespace-pre-line">
              <FormattedText text={b} globalVars={globalVars} po={po} />
            </li>
          ))}
        </ul>
      )}

      {section.contentType === 'legal_clause' && paragraphs.length > 0 && (
        <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px] whitespace-pre-line">
          {paragraphs.map((p, pIdx) => (
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

      {section.contentType === 'paragraphs' && paragraphs.length > 0 && (
        <div className="space-y-1.5 text-justify leading-relaxed text-black whitespace-pre-line">
          {paragraphs.map((p, pIdx) => (
            <p key={pIdx} className="whitespace-pre-line">
              <FormattedText text={p} globalVars={globalVars} po={po} />
            </p>
          ))}
        </div>
      )}

      {section.contentType === 'table' && section.tableHeaders && tableRows.length > 0 && (
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
              {tableRows.map((row, rIdx) => (
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
  const renderSectionItem = (
    sec: OutlineSectionItem,
    isFirstSectionOnPage: boolean,
    isPage1: boolean,
    itemsOverride?: any[],
    isContinued = false,
    uniqueKeySuffix = ''
  ) => {
    const isSecActive = activeSectionId === sec.id;
    const isSecHovered = hoveredSectionId === sec.id && !isSecActive;

    if (sec.isCustom && sec.customData) {
      return (
        <CustomSectionRenderer
          key={`${sec.id}${uniqueKeySuffix}`}
          section={sec.customData}
          globalVars={globalVars}
          po={po}
          isActive={isSecActive}
          isHovered={isSecHovered}
          onHover={(h) => onHoverSection?.(h ? sec.id : null)}
          onSelect={() => onSelectSection?.(sec.id)}
          itemsOverride={itemsOverride}
          isContinued={isContinued}
        />
      );
    }

    switch (sec.id) {
      case 'info': {
        return (
          <div key={`info_container${uniqueKeySuffix}`}>
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
                    <td className="w-1/2 p-2 border-r border-black align-top space-y-0.5">
                      <div className="font-bold uppercase text-[11px] text-black mb-1 tracking-wide">
                        COMPANY
                      </div>
                      {(tableCompanyName || tableCompanySubtitle) ? (
                        <div className="font-bold text-black text-[12px]">{tableCompanyName} {tableCompanySubtitle}</div>
                      ) : (
                        <div className="font-bold text-black text-[12px]">{companyProfile?.companyName || 'GLOBAL INDUSTRIES'}</div>
                      )}
                      {(tableCompanyAddress && tableCompanyAddress.length > 0) ? (
                        tableCompanyAddress.map((addrLine, aIdx) => {
                          const resolved = applyVariables(addrLine, globalVars, po);
                          if (!resolved || resolved.trim() === '') {
                            return <div key={aIdx} className="h-3.5">&nbsp;</div>;
                          }
                          return (
                            <div key={aIdx} className="font-medium text-black">
                              {resolved}
                            </div>
                          );
                        })
                      ) : companyProfile?.companyAddressHeader ? (
                        <div className="font-medium text-black">
                          {applyVariables(companyProfile.companyAddressHeader, globalVars, po)}
                        </div>
                      ) : (
                        (po.companyAddress || []).map((addrLine: string, aIdx: number) => (
                          <div key={aIdx} className="font-medium text-black">
                            {applyVariables(addrLine, globalVars, po)}
                          </div>
                        ))
                      )}
                      {poNumber && <div className="font-bold text-black mt-1">PO No.: {poNumber}</div>}
                      {poDate && <div className="font-bold text-black">Date: {poDate}</div>}
                    </td>
                    <td className="w-1/2 p-2 font-bold text-black align-top space-y-1 whitespace-pre-line">
                      {contractorName && <div>CONTRACTOR NAME: <span className="font-normal">{contractorName}</span></div>}
                      {projectName && <div>PROJECT: <span className="font-normal">{projectName}</span></div>}
                      {projectLocation && <div>PROJECT LOCATION: <span className="font-normal">{projectLocation}</span></div>}
                      {po.contractType && <div>CONTRACT TYPE: <span className="font-normal">{po.contractType}</span></div>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'award_letter': {
        if (po.showAwardLetter === false) return null;
        const recipient = po.awardRecipient || (po.contractorName ? `M/s. ${po.contractorName}` : '');
        const designation = po.awardDesignation || 'Labour Contractor';
        const subject = po.awardSubject || 'Award of Civil Labour Contract';
        const greeting = po.awardGreeting || 'Dear Sir,';
        const body =
          po.awardLetterBody ||
          'We are pleased to award you the Civil Labour Contract for the above-mentioned project on the following terms and conditions.';

        return (
          <div
            key={`award_letter${uniqueKeySuffix}`}
            id="preview-sec-award_letter"
            onClick={() => onSelectSection?.('award_letter')}
            onMouseEnter={() => onHoverSection?.('award_letter')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`my-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Award Letter & Salutation (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Award Letter & Salutation
              </span>
            )}
            <div className="text-[12px] font-bold text-black leading-snug space-y-0.5">
              <div>{po.awardToPrefix || 'To,'}</div>
              {recipient && <div><FormattedText text={recipient} globalVars={globalVars} po={po} /></div>}
              {designation && <div className="text-black font-semibold"><FormattedText text={designation} globalVars={globalVars} po={po} /></div>}
            </div>

            {subject && (
              <div className="mt-2 text-[12px] font-bold text-black">
                <span>Subject: </span>
                <span className="underline"><FormattedText text={subject} globalVars={globalVars} po={po} /></span>
              </div>
            )}

            <div className="mt-2 text-[12px] font-semibold text-black space-y-1">
              {greeting && <div>{greeting}</div>}
              {body && (
                <p className="leading-relaxed text-justify font-normal text-[11.5px] text-black">
                  <FormattedText text={body} globalVars={globalVars} po={po} />
                </p>
              )}
            </div>
          </div>
        );
      }

      case 'contract_value': {
        const list = po.contractValueClause || [];
        if (list.length === 0) return null;
        return (
          <div
            key={`contract_value${uniqueKeySuffix}`}
            id="preview-sec-contract_value"
            onClick={() => onSelectSection?.('contract_value')}
            onMouseEnter={() => onHoverSection?.('contract_value')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`my-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="1. Contract Value (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                1. Contract Value
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              1. Contract Value {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1.5 text-[11.5px] text-justify leading-relaxed text-black">
              {list.map((para, pIdx) => (
                <p key={pIdx}>
                  <FormattedText text={para} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'scope': {
        const list = (itemsOverride as string[]) || po.scopeOfWork || [];
        return (
          <div
            key={`scope${uniqueKeySuffix}`}
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
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              2. Scope of Work {isContinued ? '(Continued)' : ''}
            </h2>
            {po.scopeIntro && !isContinued && (
              <p className="text-[11.5px] text-black mb-1 leading-relaxed">
                <FormattedText text={po.scopeIntro} globalVars={globalVars} po={po} />
              </p>
            )}
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black whitespace-pre-line leading-relaxed">
              {list.map((item, i) => (
                <li key={i} className="text-black whitespace-pre-line">
                  <FormattedText text={item} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'rates': {
        if (po.showAwardLetter || (po.contractValueClause && po.contractValueClause.length > 0) || po.contractType?.toLowerCase().includes('civil')) {
          return null;
        }
        const list = (itemsOverride as PORateItem[]) || po.rateItems || [];
        if (list.length === 0) return null;
        return (
          <div
            key={`rates${uniqueKeySuffix}`}
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
            <h2 className="text-[13px] font-bold text-[#505050] mb-1.5">
              Rate {isContinued ? '(Continued)' : ''}
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
                  {list.map((item) => (
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
                  {(!itemsOverride || itemsOverride.length === (po.rateItems || []).length) && (
                    <tr>
                      <td colSpan={5} className="p-1.5 font-bold whitespace-pre-line">
                        Amount in words: <FormattedText text={amountInWords} globalVars={globalVars} po={po} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'company_scope': {
        const list = (itemsOverride as string[]) || po.companyScope || [];
        if (list.length === 0 && !po.companyScopeIntro) return null;
        return (
          <div
            key={`company_scope${uniqueKeySuffix}`}
            id="preview-sec-company_scope"
            onClick={() => onSelectSection?.('company_scope')}
            onMouseEnter={() => onHoverSection?.('company_scope')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="3. Company Scope (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                3. Company Scope
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              3. Company Scope {isContinued ? '(Continued)' : ''}
            </h2>
            {po.companyScopeIntro && !isContinued && (
              <p className="text-[11.5px] text-black mb-1 leading-relaxed">
                <FormattedText text={po.companyScopeIntro} globalVars={globalVars} po={po} />
              </p>
            )}
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black">
              {list.map((item, i) => (
                <li key={i} className="text-black">
                  <FormattedText text={item} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'contractor_scope': {
        const hasStructured = po.contractorScope && po.contractorScope.length > 0;
        if (hasStructured) {
          const list = (itemsOverride as string[]) || po.contractorScope || [];
          return (
            <div
              key={`contractor_scope${uniqueKeySuffix}`}
              id="preview-sec-contractor_scope"
              onClick={() => onSelectSection?.('contractor_scope')}
              onMouseEnter={() => onHoverSection?.('contractor_scope')}
              onMouseLeave={() => onHoverSection?.(null)}
              className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
                isSecActive
                  ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                  : isSecHovered
                  ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                  : 'hover:ring-1 hover:ring-[#0d3479]/30'
              }`}
              title="4. Contractor Scope (Click to edit)"
            >
              {isSecHovered && (
                <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                  4. Contractor Scope
                </span>
              )}
              <h2 className="text-[12.5px] font-bold text-black mb-1">
                4. Contractor Scope {isContinued ? '(Continued)' : ''}
              </h2>
              {po.contractorScopeIntro && !isContinued && (
                <p className="text-[11.5px] text-black mb-1 leading-relaxed">
                  <FormattedText text={po.contractorScopeIntro} globalVars={globalVars} po={po} />
                </p>
              )}
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black">
                {list.map((item, i) => (
                  <li key={i} className="text-black">
                    <FormattedText text={item} globalVars={globalVars} po={po} />
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        const list = (itemsOverride as string[]) || po.scopeOfContractor || [];
        if (list.length === 0) return null;
        return (
          <div
            key={`contractor_scope${uniqueKeySuffix}`}
            id="preview-sec-contractor_scope"
            onClick={() => onSelectSection?.('contractor_scope')}
            onMouseEnter={() => onHoverSection?.('contractor_scope')}
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
              Scope of Contractor {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1.5 text-justify leading-relaxed whitespace-pre-line text-[11.5px]">
              {list.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={p} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'scope_contractor': {
        const hasStructuredScopes =
          (po.companyScope && po.companyScope.length > 0) ||
          (po.contractorScope && po.contractorScope.length > 0);

        if (hasStructuredScopes) {
          return (
            <div key={`scope_contractor${uniqueKeySuffix}`}>
              {po.companyScope && po.companyScope.length > 0 && (
                <div
                  id="preview-sec-company_scope"
                  onClick={() => onSelectSection?.('company_scope')}
                  onMouseEnter={() => onHoverSection?.('company_scope')}
                  onMouseLeave={() => onHoverSection?.(null)}
                  className={`p-1.5 mb-3 rounded relative cursor-pointer transition-all duration-200 ${
                    activeSectionId === 'company_scope'
                      ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                      : hoveredSectionId === 'company_scope'
                      ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                      : 'hover:ring-1 hover:ring-[#0d3479]/30'
                  }`}
                  title="3. Company Scope (Click to edit)"
                >
                  <h2 className="text-[12.5px] font-bold text-black mb-1">
                    3. Company Scope {isContinued ? '(Continued)' : ''}
                  </h2>
                  {po.companyScopeIntro && !isContinued && (
                    <p className="text-[11.5px] text-black mb-1 leading-relaxed">
                      <FormattedText text={po.companyScopeIntro} globalVars={globalVars} po={po} />
                    </p>
                  )}
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black">
                    {po.companyScope.map((item, i) => (
                      <li key={i} className="text-black">
                        <FormattedText text={item} globalVars={globalVars} po={po} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {po.contractorScope && po.contractorScope.length > 0 && (
                <div
                  id="preview-sec-contractor_scope"
                  onClick={() => onSelectSection?.('contractor_scope')}
                  onMouseEnter={() => onHoverSection?.('contractor_scope')}
                  onMouseLeave={() => onHoverSection?.(null)}
                  className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
                    activeSectionId === 'contractor_scope'
                      ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                      : hoveredSectionId === 'contractor_scope'
                      ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                      : 'hover:ring-1 hover:ring-[#0d3479]/30'
                  }`}
                  title="4. Contractor Scope (Click to edit)"
                >
                  <h2 className="text-[12.5px] font-bold text-black mb-1">
                    4. Contractor Scope {isContinued ? '(Continued)' : ''}
                  </h2>
                  {po.contractorScopeIntro && !isContinued && (
                    <p className="text-[11.5px] text-black mb-1 leading-relaxed">
                      <FormattedText text={po.contractorScopeIntro} globalVars={globalVars} po={po} />
                    </p>
                  )}
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black">
                    {po.contractorScope.map((item, i) => (
                      <li key={i} className="text-black">
                        <FormattedText text={item} globalVars={globalVars} po={po} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }

        const list = (itemsOverride as string[]) || po.scopeOfContractor || [];
        return (
          <div
            key={`scope_contractor${uniqueKeySuffix}`}
            id="preview-sec-contractor_scope"
            onClick={() => onSelectSection?.('contractor_scope')}
            onMouseEnter={() => onHoverSection?.('contractor_scope')}
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
              Scope of Contractor {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1.5 text-justify leading-relaxed whitespace-pre-line text-[11.5px]">
              {list.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={p} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'payment_terms': {
        const list = (itemsOverride as string[]) || po.paymentTerms || [];
        return (
          <div
            key={`payment_terms${uniqueKeySuffix}`}
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
              Payment Terms & Milestones {isContinued ? '(Continued)' : ''}
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-1 whitespace-pre-line text-[11.5px]">
              {list.map((term, i) => (
                <li key={i} className="whitespace-pre-line">
                  <FormattedText text={term} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'quality_clause': {
        const defaultList = [
          'The contractor shall execute all works strictly as per approved drawings, specifications and Site Engineer instructions.',
          'Any defective, rejected or poor-quality work shall be dismantled and re-executed by the contractor at his own cost without any additional payment.',
        ];
        const list = (itemsOverride as string[]) || (po.qualityClause && po.qualityClause.length > 0 ? po.qualityClause : defaultList);
        return (
          <div
            key={`quality_clause${uniqueKeySuffix}`}
            id="preview-sec-quality_clause"
            onClick={() => onSelectSection?.('quality_clause')}
            onMouseEnter={() => onHoverSection?.('quality_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="5. Quality (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                5. Quality
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              5. Quality {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed whitespace-pre-line text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={p} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'material_clause': {
        const defaultList = [
          'All materials supplied by Global Industries shall remain the sole property of the Company. The contractor shall ensure proper handling, storage and usage. Any loss, theft, damage or excessive wastage due to negligence shall be recovered from the contractor\'s bills.',
        ];
        const list = (itemsOverride as string[]) || (po.materialClause && po.materialClause.length > 0 ? po.materialClause : defaultList);
        return (
          <div
            key={`material_clause${uniqueKeySuffix}`}
            id="preview-sec-material_clause"
            onClick={() => onSelectSection?.('material_clause')}
            onMouseEnter={() => onHoverSection?.('material_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="6. Material Responsibility (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                6. Material Responsibility
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              6. Material Responsibility {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed whitespace-pre-line text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={p} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'safety_clause': {
        const defaultList = [
          'The contractor shall strictly comply with all applicable safety rules and regulations. All workers shall wear proper PPE while working. The contractor shall be solely responsible for any accident, injury, death or property damage arising due to negligence or violation of safety norms.',
        ];
        const list = (itemsOverride as string[]) || (po.safetyClause && po.safetyClause.length > 0 ? po.safetyClause : defaultList);
        return (
          <div
            key={`safety_clause${uniqueKeySuffix}`}
            id="preview-sec-safety_clause"
            onClick={() => onSelectSection?.('safety_clause')}
            onMouseEnter={() => onHoverSection?.('safety_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="7. Safety (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                7. Safety
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              7. Safety {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed whitespace-pre-line text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  <FormattedText text={p} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'measurement': {
        const list = (itemsOverride as string[]) || po.measurementClause || [];
        if (list.length === 0) return null;

        const isFabrication =
          po.measurementClause?.some(
            (c) => c.toLowerCase().includes('25,000') || c.toLowerCase().includes('weight (in kgs)')
          ) || po.tableCompanyName?.includes('GLOBAL INDUSTRIES') || sec.label === 'Measurement & Payment Clause';
        const sectionTitle =
          sec.label && sec.label !== 'Quality, Materials & Safety (Clauses 5–7)'
            ? sec.label
            : isFabrication
            ? 'Measurement & Payment Clause'
            : '5. Quality, 6. Materials & 7. Safety';

        return (
          <div
            key={`measurement${uniqueKeySuffix}`}
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
            title={`${sectionTitle} (Click to edit)`}
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                {sectionTitle}
              </span>
            )}
            <div className="space-y-2 text-justify leading-relaxed whitespace-pre-line text-[11.5px]">
              {list.map((clause, i) => {
                const parts = clause.split(':');
                if (parts.length > 1 && /^[0-9]+\.\s*/.test(parts[0])) {
                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="font-bold text-black">{parts[0]}</div>
                      <p className="text-black">
                        <FormattedText text={parts.slice(1).join(':').trim()} globalVars={globalVars} po={po} />
                      </p>
                    </div>
                  );
                }
                return (
                  <p key={i} className="whitespace-pre-line text-black">
                    <FormattedText text={clause} globalVars={globalVars} po={po} />
                  </p>
                );
              })}
            </div>
          </div>
        );
      }

      case 'labour_laws': {
        const defaultLaws = [
          'Minimum Wages Act / applicable minimum wage requirements',
          'Labour License',
          'PF',
          'ESIC',
          'Workmen Compensation Insurance',
          'Building & Other Construction Workers Act',
          'Any other applicable statutory requirement',
        ];
        const list = (itemsOverride as string[]) || (po.labourLawsItems && po.labourLawsItems.length > 0 ? po.labourLawsItems : defaultLaws);
        const intro = po.labourLawsIntro || 'The contractor shall comply with all applicable labour laws and statutory requirements, including:';
        const disclaimer = po.labourLawsDisclaimer || 'All labour-related statutory liabilities, compliances and labour disputes shall be the sole responsibility of the Labour Contractor. Global Industries shall not be responsible for the same.';

        return (
          <div
            key={`labour_laws${uniqueKeySuffix}`}
            id="preview-sec-labour_laws"
            onClick={() => onSelectSection?.('labour_laws')}
            onMouseEnter={() => onHoverSection?.('labour_laws')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="8. Labour Laws (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                8. Labour Laws
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              8. Labour Laws {isContinued ? '(Continued)' : ''}
            </h2>
            {intro && !isContinued && (
              <p className="text-[11.5px] text-black mb-1 leading-relaxed">
                <FormattedText text={intro} globalVars={globalVars} po={po} />
              </p>
            )}
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black">
              {list.map((law, idx) => (
                <li key={idx} className="text-black">
                  <FormattedText text={law} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
            {disclaimer && !isContinued && (
              <p className="text-[11.5px] text-black mt-1 leading-relaxed text-justify">
                <FormattedText text={disclaimer} globalVars={globalVars} po={po} />
              </p>
            )}
          </div>
        );
      }

      case 'payment_clause': {
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
        const milestones = (itemsOverride as string[]) || (po.paymentMilestones && po.paymentMilestones.length > 0 ? po.paymentMilestones : (po.paymentTerms || defaultMilestones));
        const deductions = po.paymentDeductionTerms && po.paymentDeductionTerms.length > 0 ? po.paymentDeductionTerms : defaultDeductions;

        return (
          <div
            key={`payment_clause${uniqueKeySuffix}`}
            id="preview-sec-payment_clause"
            onClick={() => onSelectSection?.('payment_clause')}
            onMouseEnter={() => onHoverSection?.('payment_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="9. Measurement & Payment (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                9. Measurement & Payment
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              9. Measurement & Payment {isContinued ? '(Continued)' : ''}
            </h2>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black">
              {milestones.map((ms, idx) => (
                <li key={idx} className="text-black">
                  <FormattedText text={ms} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
            {deductions && deductions.length > 0 && !isContinued && (
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11.5px] text-black mt-1">
                {deductions.map((term, idx) => (
                  <li key={idx} className="text-black">
                    <FormattedText text={term} globalVars={globalVars} po={po} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      case 'terms': {
        const list = (itemsOverride as string[]) || po.termsAndConditions || [];
        if (list.length === 0) return null;

        const isFabrication =
          po.measurementClause?.some((c) => c.toLowerCase().includes('25,000')) ||
          po.tableCompanyName?.includes('GLOBAL INDUSTRIES') ||
          sec.label === 'Terms & Conditions';
        const sectionTitle =
          sec.label && sec.label !== 'Commercial & Labour Terms (Clauses 8–10)'
            ? sec.label
            : isFabrication
            ? 'Terms & Conditions'
            : 'Commercial & Labour Terms (Clauses 8–10)';

        return (
          <div
            key={`terms${uniqueKeySuffix}`}
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
            title={`${sectionTitle} (Click to edit)`}
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                {sectionTitle}
              </span>
            )}
            <h2 className="text-[13px] font-bold text-[#505050] mb-1">
              {sectionTitle} {isContinued ? '(Continued)' : ''}
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-1 whitespace-pre-line text-[11.5px]">
              {list.map((term, i) => (
                <li key={i} className="whitespace-pre-line">
                  <FormattedText text={term} globalVars={globalVars} po={po} />
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'time_schedule': {
        const defaultTime = [
          'The entire civil construction work shall be completed within 60 (Sixty) days from the date of commencement of work at site. In case of unexcused delay, a penalty of ₹2,000/- per day shall be deducted from the contractor\'s bills.',
        ];
        const list = (itemsOverride as string[]) || (po.timeScheduleClause && po.timeScheduleClause.length > 0 ? po.timeScheduleClause : (po.termsAndConditions && po.termsAndConditions.length > 0 ? po.termsAndConditions : defaultTime));

        return (
          <div
            key={`time_schedule${uniqueKeySuffix}`}
            id="preview-sec-time_schedule"
            onClick={() => onSelectSection?.('time_schedule')}
            onMouseEnter={() => onHoverSection?.('time_schedule')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="10. Time Schedule (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                10. Time Schedule
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-1">
              10. Time Schedule {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="text-black">
                  <FormattedText text={p.replace(/^10\.\s*Time Schedule:\s*/i, '')} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'housekeeping_clause': {
        const defaultText = ['The contractor shall maintain the work area in neat and clean condition throughout the execution period and remove debris regularly.'];
        const list = (itemsOverride as string[]) || (po.housekeepingClause && po.housekeepingClause.length > 0 ? po.housekeepingClause : defaultText);
        return (
          <div
            key={`housekeeping_clause${uniqueKeySuffix}`}
            id="preview-sec-housekeeping_clause"
            onClick={() => onSelectSection?.('housekeeping_clause')}
            onMouseEnter={() => onHoverSection?.('housekeeping_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="11. Housekeeping (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                11. Housekeeping
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              11. Housekeeping {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="text-black">
                  <FormattedText text={p.replace(/^11\.\s*Housekeeping:\s*/i, '')} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'warranty_clause': {
        const defaultText = ['The contractor shall rectify any workmanship defects observed during execution or within 6 months from completion of the work without claiming any additional payment.'];
        const list = (itemsOverride as string[]) || (po.warrantyClause && po.warrantyClause.length > 0 ? po.warrantyClause : defaultText);
        return (
          <div
            key={`warranty_clause${uniqueKeySuffix}`}
            id="preview-sec-warranty_clause"
            onClick={() => onSelectSection?.('warranty_clause')}
            onMouseEnter={() => onHoverSection?.('warranty_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="12. Warranty / Defect Liability (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                12. Warranty / Defect Liability
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              12. Warranty / Defect Liability {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="text-black">
                  <FormattedText text={p.replace(/^12\.\s*Warranty\s*\/\s*Defect Liability:\s*/i, '')} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'variation_clause': {
        const defaultText = [
          'Any additional or extra work beyond the scope of this Work Order shall be carried out only after obtaining prior written approval from Global Industries.',
          'No verbal instructions shall be considered for extra payment.',
        ];
        const list = (itemsOverride as string[]) || (po.variationClause && po.variationClause.length > 0 ? po.variationClause : defaultText);
        return (
          <div
            key={`variation_clause${uniqueKeySuffix}`}
            id="preview-sec-variation_clause"
            onClick={() => onSelectSection?.('variation_clause')}
            onMouseEnter={() => onHoverSection?.('variation_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="13. Variation / Extra Work (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                13. Variation / Extra Work
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              13. Variation / Extra Work {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="text-black">
                  <FormattedText text={p.replace(/^13\.\s*Variation\s*\/\s*Extra Work:\s*/i, '')} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'termination_clause': {
        const defaultText = [
          'Global Industries reserves the right to terminate this Work Order without prior notice in case of:\n• Poor workmanship\n• Delay in execution\n• Safety violations\n• Labour shortage\n• Non-compliance with statutory requirements\n• Breach of any terms and conditions',
        ];
        const list = (itemsOverride as string[]) || (po.terminationClause && po.terminationClause.length > 0 ? po.terminationClause : defaultText);
        return (
          <div
            key={`termination_clause${uniqueKeySuffix}`}
            id="preview-sec-termination_clause"
            onClick={() => onSelectSection?.('termination_clause')}
            onMouseEnter={() => onHoverSection?.('termination_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="14. Termination (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                14. Termination
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              14. Termination {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => {
                const cleanP = p.replace(/^14\.\s*Termination:\s*/i, '');
                const lines = cleanP.split('\n').map(l => l.trim()).filter(Boolean);
                const bullets = lines.filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));
                const nonBullets = lines.filter(l => !l.startsWith('•') && !l.startsWith('-') && !l.startsWith('*'));

                return (
                  <div key={i} className="space-y-0.5">
                    {nonBullets.map((nb, nbi) => (
                      <p key={nbi} className="text-black leading-relaxed">
                        <FormattedText text={nb} globalVars={globalVars} po={po} />
                      </p>
                    ))}
                    {bullets.length > 0 && (
                      <ul className="list-disc list-inside pl-2 space-y-0.5 text-black">
                        {bullets.map((b, bi) => (
                          <li key={bi} className="text-black">
                            <FormattedText text={b.replace(/^[•\-*]\s*/, '')} globalVars={globalVars} po={po} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'force_majeure_clause': {
        const defaultText = ['Neither party shall be held responsible for delay caused due to natural calamities, Government restrictions, war, flood, earthquake or any event beyond reasonable control.'];
        const list = (itemsOverride as string[]) || (po.forceMajeureClause && po.forceMajeureClause.length > 0 ? po.forceMajeureClause : defaultText);
        return (
          <div
            key={`force_majeure_clause${uniqueKeySuffix}`}
            id="preview-sec-force_majeure_clause"
            onClick={() => onSelectSection?.('force_majeure_clause')}
            onMouseEnter={() => onHoverSection?.('force_majeure_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="15. Force Majeure (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                15. Force Majeure
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              15. Force Majeure {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="text-black">
                  <FormattedText text={p.replace(/^15\.\s*Force Majeure:\s*/i, '')} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'jurisdiction_clause': {
        const defaultText = ['Any dispute arising out of this Work Order shall be subject to the exclusive jurisdiction of the competent courts at Vadodara, Gujarat only.'];
        const list = (itemsOverride as string[]) || (po.jurisdictionClause && po.jurisdictionClause.length > 0 ? po.jurisdictionClause : defaultText);
        return (
          <div
            key={`jurisdiction_clause${uniqueKeySuffix}`}
            id="preview-sec-jurisdiction_clause"
            onClick={() => onSelectSection?.('jurisdiction_clause')}
            onMouseEnter={() => onHoverSection?.('jurisdiction_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="16. Jurisdiction (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                16. Jurisdiction
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              16. Jurisdiction {isContinued ? '(Continued)' : ''}
            </h2>
            <div className="space-y-1 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((p, i) => (
                <p key={i} className="text-black">
                  <FormattedText text={p.replace(/^16\.\s*Jurisdiction:\s*/i, '')} globalVars={globalVars} po={po} />
                </p>
              ))}
            </div>
          </div>
        );
      }

      case 'acceptance_clause': {
        const text = po.acceptanceClause || 'I/We have read, understood and accepted all the above terms and conditions of this Work Order.';
        return (
          <div
            key={`acceptance_clause${uniqueKeySuffix}`}
            id="preview-sec-acceptance_clause"
            onClick={() => onSelectSection?.('acceptance_clause')}
            onMouseEnter={() => onHoverSection?.('acceptance_clause')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Acceptance (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Acceptance
              </span>
            )}
            <h2 className="text-[12.5px] font-bold text-black mb-0.5">
              Acceptance
            </h2>
            <p className="text-[11.5px] text-black leading-relaxed">
              <FormattedText text={text} globalVars={globalVars} po={po} />
            </p>
          </div>
        );
      }

      case 'page3_terms': {
        const defaultPage3 = [
          '11. Housekeeping: The contractor shall maintain the work area in neat and clean condition throughout the execution period and remove debris regularly.',
          '12. Warranty / Defect Liability: The contractor shall rectify any workmanship defects observed during execution or within 6 months from completion of the work without claiming any additional payment.',
          '13. Variation / Extra Work: Any additional or extra work beyond the scope of this Work Order shall be carried out only after obtaining prior written approval from Global Industries.\nNo verbal instructions shall be considered for extra payment.',
          '14. Termination: Global Industries reserves the right to terminate this Work Order without prior notice in case of:\n• Poor workmanship\n• Delay in execution\n• Safety violations\n• Labour shortage\n• Non-compliance with statutory requirements\n• Breach of any terms and conditions',
          '15. Force Majeure: Neither party shall be held responsible for delay caused due to natural calamities, Government restrictions, war, flood, earthquake or any event beyond reasonable control.',
          '16. Jurisdiction: Any dispute arising out of this Work Order shall be subject to the exclusive jurisdiction of the competent courts at Vadodara, Gujarat only.',
        ];
        const rawList = (itemsOverride as string[]) || (po.page3Terms && po.page3Terms.length > 0 ? po.page3Terms : defaultPage3);
        const list = rawList.some(t => t.includes('neat and clean condition')) ? rawList : defaultPage3;
        if (list.length === 0) return null;

        return (
          <div
            key={`page3_terms${uniqueKeySuffix}`}
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
            title="General Terms (Clauses 11–16) (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                General Terms (11–16)
              </span>
            )}
            <div className="space-y-2 text-justify leading-relaxed text-[11.5px] text-black">
              {list.map((term, i) => {
                const colonIdx = term.indexOf(':');
                if (colonIdx > 0 && /^[0-9]+\.\s*/.test(term.substring(0, colonIdx))) {
                  const heading = term.substring(0, colonIdx).trim();
                  const body = term.substring(colonIdx + 1).trim();
                  const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
                  const bullets = lines.filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));
                  const nonBullets = lines.filter(l => !l.startsWith('•') && !l.startsWith('-') && !l.startsWith('*'));

                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="font-bold text-black">{heading}</div>
                      {nonBullets.map((nb, nbi) => (
                        <p key={nbi} className="text-black leading-relaxed">
                          <FormattedText text={nb} globalVars={globalVars} po={po} />
                        </p>
                      ))}
                      {bullets.length > 0 && (
                        <ul className="list-disc list-inside pl-2 space-y-0.5 text-black">
                          {bullets.map((b, bi) => (
                            <li key={bi} className="text-black">
                              <FormattedText text={b.replace(/^[•\-*]\s*/, '')} globalVars={globalVars} po={po} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }
                return (
                  <p key={i} className="text-black whitespace-pre-line leading-relaxed">
                    <FormattedText text={term} globalVars={globalVars} po={po} />
                  </p>
                );
              })}

              {/* Acceptance */}
              <div className="pt-1.5">
                <h2 className="text-[12.5px] font-bold text-black mb-0.5">
                  Acceptance
                </h2>
                <p className="text-[11.5px] text-black leading-relaxed">
                  <FormattedText
                    text={po.acceptanceClause || 'I/We have read, understood and accepted all the above terms and conditions of this Work Order.'}
                    globalVars={globalVars}
                    po={po}
                  />
                </p>
              </div>
            </div>
          </div>
        );
      }

      case 'signatures': {
        const isCivilContract = !!(po.showAwardLetter || (po.contractValueClause && po.contractValueClause.length > 0) || po.contractType?.toLowerCase().includes('civil'));
        if (isCivilContract) return null;

        const acceptance = po.acceptanceClause || 'I/We have read, understood and accepted all the above terms and conditions of this Work Order.';
        return (
          <div
            key={`signatures${uniqueKeySuffix}`}
            id="preview-sec-signatures"
            onClick={() => onSelectSection?.('signatures')}
            onMouseEnter={() => onHoverSection?.('signatures')}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${
              isSecActive
                ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
                : isSecHovered
                ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
                : 'hover:ring-1 hover:ring-[#0d3479]/30'
            }`}
            title="Acceptance & Signatures (Click to edit)"
          >
            {isSecHovered && (
              <span className="absolute top-1 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
                Acceptance & Signatures
              </span>
            )}
            {acceptance && (
              <div className="mb-4 pt-1">
                <h2 className="text-[12.5px] font-bold text-black mb-1">
                  Acceptance
                </h2>
                <p className="text-[11.5px] text-black">
                  <FormattedText text={acceptance} globalVars={globalVars} po={po} />
                </p>
              </div>
            )}
            <div className="flex justify-between items-end px-2 pt-4">
              <div>
                <div className="font-bold text-sm">
                  For {companyName} {companySubtitle}
                </div>
                <div className="h-10 md:h-12" />
                <div className="font-bold text-xs border-t border-black/40 pt-1">
                  {applyVariables(po.signatoryCompany || 'Authorized Signatory', globalVars, po)}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-sm">Accepted By Contractor</div>
                <div className="h-10 md:h-12" />
                <div className="font-bold text-xs border-t border-black/40 pt-1">
                  {applyVariables(po.signatoryContractor || 'Name & Signature', globalVars, po)}
                </div>
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
  const countRenderedLines = (text: string, charsPerLine: number = 75) => {
    if (!text) return 1;
    return text.split('\n').reduce((acc, line) => {
      return acc + Math.max(1, Math.ceil(line.length / charsPerLine));
    }, 0);
  };

  // Precise row height estimation helpers matching standard 11.5px CSS rendering
  const getPoRateItemHeight = (item: PORateItem) => {
    const lines = countRenderedLines(item.description || '', 60);
    return Math.max(20, lines * 14 + 4);
  };

  const getPoScopeHeight = (item: string) => {
    const lines = countRenderedLines(item || '', 75);
    return Math.max(16, lines * 14 + 2);
  };

  const getPoTermHeight = (term: string) => {
    const lines = countRenderedLines(term || '', 75);
    return Math.max(16, lines * 14 + 3);
  };

  const getSectionEstimatedHeight = (sec: OutlineSectionItem): number => {
    let h = 24;
    if (sec.id === 'info') {
      return 135;
    } else if (sec.id === 'award_letter') {
      const pCount = (po.awardLetterBody || '').split('\n').filter(Boolean).length;
      return 60 + Math.max(1, pCount) * 18;
    } else if (sec.id === 'contract_value') {
      const items = (po.contractValueClause && po.contractValueClause.length > 0) ? po.contractValueClause : ['value1'];
      return 22 + items.reduce((acc, s) => acc + getPoTermHeight(s), 0);
    } else if (sec.id === 'scope') {
      return 24 + (po.scopeOfWork || []).reduce((acc, s) => acc + getPoScopeHeight(s), 0);
    } else if (sec.id === 'rates') {
      return 24 + 26 + (po.rateItems || []).reduce((acc, r) => acc + getPoRateItemHeight(r), 0) + 24;
    } else if (sec.id === 'company_scope') {
      return 24 + (po.companyScope || []).reduce((acc, s) => acc + getPoScopeHeight(s), 0);
    } else if (sec.id === 'contractor_scope' || sec.id === 'scope_contractor') {
      const items = (po.contractorScope && po.contractorScope.length > 0) ? po.contractorScope : (po.scopeOfContractor || []);
      return 24 + items.reduce((acc, s) => acc + getPoScopeHeight(s), 0);
    } else if (sec.id === 'labour_laws') {
      const items = (po.labourLawsItems && po.labourLawsItems.length > 0) ? po.labourLawsItems : [1, 2, 3, 4, 5, 6, 7];
      return 40 + items.length * 22 + 60;
    } else if (sec.id === 'payment_clause') {
      const milestones = (po.paymentMilestones && po.paymentMilestones.length > 0) ? po.paymentMilestones : [1, 2, 3, 4, 5, 6, 7, 8];
      const deductions = (po.paymentDeductionTerms && po.paymentDeductionTerms.length > 0) ? po.paymentDeductionTerms : [1, 2, 3, 4];
      return 40 + milestones.length * 22 + 30 + deductions.length * 36;
    } else if (sec.id === 'payment_terms') {
      return 30 + (po.paymentTerms || []).reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'quality_clause') {
      const items = (po.qualityClause && po.qualityClause.length > 0) ? po.qualityClause : ['quality1', 'quality2'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'material_clause') {
      const items = (po.materialClause && po.materialClause.length > 0) ? po.materialClause : ['material1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'safety_clause') {
      const items = (po.safetyClause && po.safetyClause.length > 0) ? po.safetyClause : ['safety1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'measurement') {
      if (!po.measurementClause || po.measurementClause.length === 0) return 0;
      return 30 + (po.measurementClause || []).reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'safety') {
      return 95;
    } else if (sec.id === 'time_schedule') {
      const items = (po.timeScheduleClause && po.timeScheduleClause.length > 0) ? po.timeScheduleClause : ['schedule1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'housekeeping_clause') {
      const items = (po.housekeepingClause && po.housekeepingClause.length > 0) ? po.housekeepingClause : ['housekeeping1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'warranty_clause') {
      const items = (po.warrantyClause && po.warrantyClause.length > 0) ? po.warrantyClause : ['warranty1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'variation_clause') {
      const items = (po.variationClause && po.variationClause.length > 0) ? po.variationClause : ['var1', 'var2'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'termination_clause') {
      const items = (po.terminationClause && po.terminationClause.length > 0) ? po.terminationClause : ['term1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0) + 140;
    } else if (sec.id === 'force_majeure_clause') {
      const items = (po.forceMajeureClause && po.forceMajeureClause.length > 0) ? po.forceMajeureClause : ['force1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'jurisdiction_clause') {
      const items = (po.jurisdictionClause && po.jurisdictionClause.length > 0) ? po.jurisdictionClause : ['jurisdiction1'];
      return 30 + items.reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'acceptance_clause') {
      return 60;
    } else if (sec.id === 'terms') {
      if (!po.termsAndConditions || po.termsAndConditions.length === 0) return 0;
      return 30 + (po.termsAndConditions || []).reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'page3_terms') {
      if (!po.page3Terms || po.page3Terms.length === 0) return 0;
      return 30 + (po.page3Terms || []).reduce((acc, s) => acc + getPoTermHeight(s) + 6, 0);
    } else if (sec.id === 'signatures') {
      const isCivilContract = !!(po.showAwardLetter || (po.contractValueClause && po.contractValueClause.length > 0) || po.contractType?.toLowerCase().includes('civil'));
      if (isCivilContract) return 0;
      return 150;
    } else if (sec.isCustom && sec.customData) {
      const cs = sec.customData;
      h = 24;
      if (cs.contentType === 'bullet_list' && cs.bullets) {
        h += cs.bullets.reduce((acc, b) => acc + Math.max(16, countRenderedLines(b, 75) * 14 + 2), 0);
      } else if (cs.contentType === 'paragraphs' && cs.paragraphs) {
        h += cs.paragraphs.reduce((acc, p) => acc + Math.max(18, countRenderedLines(p, 75) * 14 + 4), 0);
      } else if (cs.contentType === 'legal_clause' && cs.paragraphs) {
        h += cs.paragraphs.reduce((acc, p) => acc + Math.max(20, countRenderedLines(p, 75) * 14 + 6), 0);
      } else if (cs.contentType === 'table' && cs.tableRows) {
        const headersHeight = 28;
        const rowsHeight = cs.tableRows.reduce((acc, row) => {
          const maxCellLines = row.reduce(
            (maxL, cell) => Math.max(maxL, countRenderedLines(cell, 30)),
            1
          );
          return acc + Math.max(22, maxCellLines * 14 + 6);
        }, 0);
        h += headersHeight + rowsHeight + 6;
      } else if (cs.contentType === 'key_value' && cs.keyValuePairs) {
        h += cs.keyValuePairs.reduce((acc, kv) => {
          const kLines = countRenderedLines(kv.key, 25);
          const vLines = countRenderedLines(kv.value, 40);
          return acc + Math.max(22, Math.max(kLines, vLines) * 14 + 4);
        }, 0) + 6;
      } else if (cs.contentType === 'callout') {
        h += Math.max(65, countRenderedLines(cs.calloutText || '', 70) * 14 + 35);
      }
      return h;
    }
    return h;
  };

  // Dynamic layout partitioner logic (Word/LaTeX style multi-page pagination with absolute footer safety)
  const partitionGroupSections = (group: OutlineGroup) => {
    const subPages: { sections: React.ReactNode[] }[] = [];
    let currentPageSections: React.ReactNode[] = [];
    let currentHeight = 0;

    const isPage1 = group.pageNum === 1;
    // Strict budget to prevent ANY overlap with header or footer:
    // Page 1 budget = 520px, Continuation pages = 540px
    const budget = isPage1 ? 520 : 540;

    const commitPage = () => {
      if (currentPageSections.length > 0) {
        subPages.push({ sections: currentPageSections });
        currentPageSections = [];
        currentHeight = 0;
      }
    };

    group.sections.forEach((sec) => {
      // 1. Get raw list items if this section is a list
      let itemList: any[] | null = null;
      let getItemHeight: ((item: any) => number) | null = null;

      if (sec.id === 'scope') {
        itemList = po.scopeOfWork || [];
        getItemHeight = getPoScopeHeight;
      } else if (sec.id === 'rates') {
        itemList = po.rateItems || [];
        getItemHeight = getPoRateItemHeight;
      } else if (sec.id === 'company_scope') {
        itemList = po.companyScope || [];
        getItemHeight = getPoScopeHeight;
      } else if (sec.id === 'contractor_scope' || sec.id === 'scope_contractor') {
        itemList = (po.contractorScope && po.contractorScope.length > 0) ? po.contractorScope : (po.scopeOfContractor || []);
        getItemHeight = getPoScopeHeight;
      } else if (sec.id === 'payment_terms') {
        itemList = po.paymentTerms || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'quality_clause') {
        itemList = po.qualityClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'material_clause') {
        itemList = po.materialClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'safety_clause') {
        itemList = po.safetyClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'measurement') {
        itemList = po.measurementClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'time_schedule') {
        itemList = (po.timeScheduleClause && po.timeScheduleClause.length > 0) ? po.timeScheduleClause : (po.termsAndConditions || []);
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'housekeeping_clause') {
        itemList = po.housekeepingClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'warranty_clause') {
        itemList = po.warrantyClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'variation_clause') {
        itemList = po.variationClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'termination_clause') {
        itemList = po.terminationClause || [];
        getItemHeight = (p: string) => 22 + countRenderedLines(p, 70) * 14 + 100;
      } else if (sec.id === 'force_majeure_clause') {
        itemList = po.forceMajeureClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'jurisdiction_clause') {
        itemList = po.jurisdictionClause || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'terms') {
        itemList = po.termsAndConditions || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.id === 'page3_terms') {
        itemList = po.page3Terms || [];
        getItemHeight = getPoTermHeight;
      } else if (sec.isCustom && sec.customData) {
        const cs = sec.customData;
        if (cs.contentType === 'bullet_list' && cs.bullets) {
          itemList = cs.bullets;
          getItemHeight = (b: string) => Math.max(16, countRenderedLines(b, 75) * 14 + 2);
        } else if (cs.contentType === 'paragraphs' && cs.paragraphs) {
          itemList = cs.paragraphs;
          getItemHeight = (p: string) => Math.max(18, countRenderedLines(p, 75) * 14 + 4);
        } else if (cs.contentType === 'legal_clause' && cs.paragraphs) {
          itemList = cs.paragraphs;
          getItemHeight = (p: string) => Math.max(20, countRenderedLines(p, 75) * 14 + 6);
        } else if (cs.contentType === 'table' && cs.tableRows) {
          itemList = cs.tableRows;
          getItemHeight = (row: string[]) => {
            const maxCellLines = row.reduce((maxL, cell) => Math.max(maxL, countRenderedLines(cell, 30)), 1);
            return Math.max(22, maxCellLines * 14 + 6);
          };
        }
      }

      const totalEstimatedHeight = getSectionEstimatedHeight(sec);

      // Case A: Whole section fits comfortably on current page
      if (currentHeight + totalEstimatedHeight <= budget) {
        currentPageSections.push(renderSectionItem(sec, currentPageSections.length === 0, group.pageNum === 1));
        currentHeight += totalEstimatedHeight;
        return;
      }

      // Case B: If current page has some content and the section cannot fit, SHIFT the whole section to next page!
      if (currentHeight > 0) {
        commitPage();
      }

      // Case C: On fresh page, if whole section fits, place it completely!
      if (totalEstimatedHeight <= budget || !itemList || !getItemHeight || itemList.length <= 1) {
        currentPageSections.push(renderSectionItem(sec, currentPageSections.length === 0, group.pageNum === 1));
        currentHeight = totalEstimatedHeight;
        return;
      }

      // Case D: Only if a single section exceeds a full empty page budget (e.g. 40 items), split its items cleanly
      const headerHeight = 24;
      let itemIdx = 0;
      let isFirstSliceOfSec = true;

      while (itemIdx < itemList.length) {
        const availableBudget = budget - currentHeight;
        if (availableBudget < 60) {
          commitPage();
        }

        const sliceItems: any[] = [];
        let sliceHeight = headerHeight;

        while (itemIdx < itemList.length) {
          const it = itemList[itemIdx];
          const itH = getItemHeight(it);
          if (sliceHeight + itH <= budget - currentHeight) {
            sliceItems.push(it);
            sliceHeight += itH;
            itemIdx++;
          } else {
            break;
          }
        }

        // Ensure at least 1 item to make forward progress
        if (sliceItems.length === 0 && itemIdx < itemList.length) {
          sliceItems.push(itemList[itemIdx]);
          sliceHeight += getItemHeight(itemList[itemIdx]);
          itemIdx++;
        }

        const isContinued = !isFirstSliceOfSec;
        currentPageSections.push(
          renderSectionItem(
            sec,
            currentPageSections.length === 0,
            group.pageNum === 1,
            sliceItems,
            isContinued,
            `_split_${subPages.length}_${itemIdx}`
          )
        );
        currentHeight += sliceHeight;
        isFirstSliceOfSec = false;

        if (itemIdx < itemList.length) {
          commitPage();
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
          className="latex-paper bg-white text-black p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between text-[11.5px] leading-normal"
        >
          {/* Background Center Watermark */}
          <WatermarkOverlay config={doc.settings?.watermark} />

          {/* Header & Page Sections */}
          <div className="flex-1 flex flex-col min-h-0 relative z-1">
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
          <div className="shrink-0 relative z-1">
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
