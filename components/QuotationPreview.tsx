'use client';

import React, { useMemo } from 'react';
import { LatexDocument, QuotationData, CustomSectionItem } from '@/types/document';
import { applyVariables } from '@/lib/variables';
import {
  getQuotationOutlineGroups,
  OutlineGroup,
  OutlineSectionItem,
} from '@/lib/document-sections';

interface QuotationPreviewProps {
  doc: LatexDocument;
  quotation: QuotationData;
  fontFamilyStyle: string;
  printRef?: React.RefObject<HTMLDivElement | null>;
  activeSectionId?: string;
  hoveredSectionId?: string | null;
  onHoverSection?: (sectionId: string | null) => void;
  onSelectSection?: (sectionId: string) => void;
  globalVars?: Record<string, string>;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
  doc,
  quotation: q,
  fontFamilyStyle,
  printRef,
  activeSectionId,
  hoveredSectionId,
  onHoverSection,
  onSelectSection,
  globalVars,
}) => {
  const companyName = applyVariables(q.companyName || 'GLOBAL', globalVars);
  const companySubtitle = applyVariables(q.companySubtitle || 'INDUSTRIES', globalVars);
  const leftServices = q.leftServices || [
    '• Pre Engineering Building',
    '• Roofing Solution',
    '• Engineering Project & Designing',
    '• "Z" & "C" Purlins',
    '• UPVC Roofing Sheet',
  ];
  const rightServices = q.rightServices || [
    '• Infra Materials',
    '• Puf Panels & Insulation Roofing',
    '• Skylight Sheets',
    '• Air Ventilators',
  ];

  const isHeaderActive = activeSectionId === 'header_footer';
  const isHeaderHovered = hoveredSectionId === 'header_footer' && !isHeaderActive;

  // Retrieve dynamic page groups and sections
  const outlineGroups: OutlineGroup[] = useMemo(() => {
    return getQuotationOutlineGroups(q);
  }, [q]);

  // Dynamic layout partitioner logic (heuristic-based Word/LaTeX style auto-pagination)
  const paddingHeight = 80;
  const headerHeight = 125;
  const footerHeight = 45;
  const maxPageHeight = 1123;

  const getSectionHighlightClass = (sectionId: string) => {
    const isActive = activeSectionId === sectionId;
    const isHovered = hoveredSectionId === sectionId && !isActive;
    if (isActive) return 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs';
    if (isHovered) return 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs';
    return 'hover:ring-1 hover:ring-emerald-300/40';
  };

  const partitionGroupSections = (group: OutlineGroup) => {
    const subPages: { sections: React.ReactNode[] }[] = [];
    let currentPageSections: React.ReactNode[] = [];
    let currentHeight = 0;

    const commitPage = () => {
      subPages.push({ sections: currentPageSections });
      currentPageSections = [];
      currentHeight = 0;
    };

    const getAvailableHeight = () => {
      // In Quotation, every page gets renderHeader and renderFooter.
      return maxPageHeight - paddingHeight - headerHeight - footerHeight;
    };

    const budget = getAvailableHeight();

    group.sections.forEach((sec) => {
      let estimatedHeight = 50; // default minimum
      
      if (sec.id === 'q_cover_info') {
        estimatedHeight = 150;
      } else if (sec.id === 'q_cover_intro') {
        estimatedHeight = 260 + q.introParagraphs.reduce((acc, p) => acc + Math.ceil(p.length / 90) * 16 + 12, 0);
      } else if (sec.id === 'q_tech_details') {
        estimatedHeight = 35 + q.technicalDetails.length * 35;
      } else if (sec.id === 'q_mat_specs') {
        estimatedHeight = 35 + q.specifications.reduce((acc, spec) => acc + Math.max(40, Math.ceil(spec.details.length / 80) * 16), 0);
      } else if (sec.id === 'q_boq_items') {
        estimatedHeight = 150 + q.commercialItems.reduce((acc, item) => acc + Math.max(30, Math.ceil(item.description.length / 50) * 16), 0);
      } else if (sec.id === 'q_payment_terms_fab') {
        estimatedHeight = 35 + q.paymentTermsFab.length * 20;
      } else if (sec.id === 'q_payment_terms_civil') {
        estimatedHeight = 30 + q.paymentTermsCivil.length * 20;
      } else if (sec.id === 'q_delivery_schedule') {
        estimatedHeight = 150 + q.deliverySchedule.length * 40;
      } else if (sec.id === 'q_vendors_part1') {
        estimatedHeight = 45 + q.vendorList.slice(0, 14).reduce((acc, v) => acc + Math.max(30, Math.ceil(v.description.length / 30) * 15, Math.ceil(v.brand.length / 35) * 15), 0);
      } else if (sec.id === 'q_vendors_part2') {
        estimatedHeight = 35 + q.vendorList.slice(14).reduce((acc, v) => acc + Math.max(30, Math.ceil(v.description.length / 30) * 15, Math.ceil(v.brand.length / 35) * 15), 0);
      } else if (sec.id === 'q_taxes_notes') {
        estimatedHeight = 40 + q.notes.length * 20;
      } else if (sec.id === 'q_terms_part1') {
        estimatedHeight = 30 + q.commercialTerms.slice(0, 7).reduce((acc, t) => acc + Math.ceil(t.content.length / 80) * 15 + 20, 0);
      } else if (sec.id === 'q_terms_part2') {
        estimatedHeight = 30 + q.commercialTerms.slice(7, 13).reduce((acc, t) => acc + Math.ceil(t.content.length / 80) * 15 + 20, 0);
      } else if (sec.id === 'q_terms_part3') {
        estimatedHeight = 30 + q.commercialTerms.slice(13).reduce((acc, t) => acc + Math.ceil(t.content.length / 80) * 15 + 20, 0);
      } else if (sec.id === 'q_exclusions') {
        estimatedHeight = 30 + q.exclusions.length * 20;
      } else if (sec.id === 'q_signatures') {
        estimatedHeight = 220;
      } else if (sec.isCustom && sec.customData) {
        const cs = sec.customData;
        estimatedHeight = 30;
        if (cs.contentType === 'bullet_list' && cs.bullets) {
          estimatedHeight += cs.bullets.reduce((acc, b) => acc + Math.ceil(b.length / 70) * 15 + 8, 0);
        } else if (cs.contentType === 'paragraphs' && cs.paragraphs) {
          estimatedHeight += cs.paragraphs.reduce((acc, p) => acc + Math.ceil(p.length / 80) * 15 + 10, 0);
        } else if (cs.contentType === 'legal_clause' && cs.paragraphs) {
          estimatedHeight += cs.paragraphs.reduce((acc, p) => acc + Math.ceil(p.length / 70) * 15 + 12, 0);
        } else if (cs.contentType === 'table' && cs.tableRows) {
          estimatedHeight += 30 + cs.tableRows.length * 25;
        } else if (cs.contentType === 'key_value' && cs.keyValuePairs) {
          estimatedHeight += cs.keyValuePairs.length * 25;
        } else if (cs.contentType === 'callout') {
          estimatedHeight += 50;
        }
      }

      if (currentHeight + estimatedHeight <= budget) {
        currentPageSections.push(renderSectionItem(sec));
        currentHeight += estimatedHeight;
      } else {
        // Handle Splittable elements to partition them row-by-row or item-by-item
        if (sec.id === 'q_boq_items' || sec.id === 'q_vendors_part1' || sec.id === 'q_vendors_part2' || (sec.isCustom && sec.customData && (sec.customData.contentType === 'table' || sec.customData.contentType === 'bullet_list' || sec.customData.contentType === 'paragraphs' || sec.customData.contentType === 'legal_clause'))) {
          if (sec.id === 'q_vendors_part1' || sec.id === 'q_vendors_part2') {
            const list = sec.id === 'q_vendors_part1' ? q.vendorList.slice(0, 14) : q.vendorList.slice(14);
            let currentListIndex = 0;

            while (currentListIndex < list.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 75) {
                commitPage();
              }
              
              const pageRows: typeof list = [];
              let rowsHeight = 45;
              
              while (currentListIndex < list.length) {
                const v = list[currentListIndex];
                const rowH = Math.max(30, Math.ceil(v.description.length / 30) * 15, Math.ceil(v.brand.length / 35) * 15);
                if (rowsHeight + rowH <= budget - currentHeight) {
                  pageRows.push(v);
                  rowsHeight += rowH;
                  currentListIndex++;
                } else {
                  break;
                }
              }

              currentPageSections.push(
                <div key={`${sec.id}_split_${subPages.length}`} className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}>
                  <div className="text-center font-bold text-[13px] uppercase">
                    {sec.id === 'q_vendors_part1' ? 'APPROVED VENDOR LIST (PART 1)' : 'APPROVED VENDOR LIST (PART 2)'} {pageRows.length < list.length ? '(Continued)' : ''}
                  </div>
                  <table className="w-full border-collapse border border-black text-[10.5px] mt-2">
                    <thead>
                      <tr className="border-b border-black bg-gray-100 font-bold">
                        <th className="w-[45px] px-1.5 py-1 text-center border-r border-black">Sr. No</th>
                        <th className="w-[180px] px-2 py-1 text-center border-r border-black">Description</th>
                        <th className="px-2 py-1 text-center">Brand/Make/Company Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((v, rIdx) => (
                        <tr key={rIdx} className="border-b border-black">
                          <td className="px-1 py-1 text-center border-r border-black align-top">{v.srNo}</td>
                          <td className="px-2 py-1 border-r border-black align-top font-medium">{v.description}</td>
                          <td className="px-2 py-1 align-top whitespace-pre-line leading-snug">
                            {v.brand.replace(/\\newline/g, '\n').replace(/\\textbf{([^}]+)}/g, '$1').replace(/\\&/g, '&')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );

              currentHeight += rowsHeight;
              if (currentListIndex < list.length) {
                commitPage();
              }
            }
          } else if (sec.id === 'q_boq_items') {
            const list = q.commercialItems;
            let currentListIndex = 0;

            while (currentListIndex < list.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 80) {
                commitPage();
              }

              const pageRows: typeof list = [];
              let rowsHeight = 50;
              
              while (currentListIndex < list.length) {
                const item = list[currentListIndex];
                const rowH = Math.max(30, Math.ceil(item.description.length / 50) * 16);
                if (rowsHeight + rowH <= budget - currentHeight) {
                  pageRows.push(item);
                  rowsHeight += rowH;
                  currentListIndex++;
                } else {
                  break;
                }
              }

              const isFinalPart = currentListIndex === list.length;
              const totalsHeight = 100;
              const fitsTotals = rowsHeight + totalsHeight <= budget - currentHeight;

              currentPageSections.push(
                <div key={`${sec.id}_split_${subPages.length}`} className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}>
                  <div className="font-bold text-[13px] uppercase tracking-wide text-[#404040]">COMMERCIAL:</div>
                  <div className="font-bold text-[11.5px] text-gray-800">{q.commercialSubtitle} {pageRows.length < list.length ? '(Continued)' : ''}</div>
                  <table className="w-full border-collapse border border-black text-[10.5px] mt-2">
                    <thead>
                      <tr className="border-b border-black bg-gray-100/70 font-bold">
                        <th className="px-2 py-1 text-center border-r border-black">Description</th>
                        <th className="w-[120px] px-2 py-1 text-center">Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((item, rIdx) => (
                        <tr key={rIdx} className="border-b border-black">
                          <td className="px-2 py-1 border-r border-black align-top text-justify whitespace-pre-line leading-snug">
                            {item.description.replace(/\\newline/g, '\n').replace(/\\textbf{([^}]+)}/g, '$1').replace(/\\&/g, '&')}
                          </td>
                          <td className="px-2 py-1 text-right align-top font-medium">{item.price}</td>
                        </tr>
                      ))}
                      {isFinalPart && fitsTotals && (
                        <>
                          <tr className="border-b border-black font-bold">
                            <td className="px-2 py-0.5 text-left border-r border-black">Total Price In INR</td>
                            <td className="px-2 py-0.5 text-right">{q.totalPriceInInr}</td>
                          </tr>
                          <tr className="border-b border-black font-bold">
                            <td className="px-2 py-0.5 text-left border-r border-black">Sub Total</td>
                            <td className="px-2 py-0.5 text-right">{q.subTotal}</td>
                          </tr>
                          <tr className="border-b border-black font-bold">
                            <td colSpan={2} className="px-2 py-0.5 text-[10px]">{q.amountInWords}</td>
                          </tr>
                          <tr className="border-b border-black font-bold bg-gray-50/50">
                            <td colSpan={2} className="px-2 py-0.5 text-[10px]">{q.gstNote}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              );

              currentHeight += rowsHeight;
              if (isFinalPart && fitsTotals) {
                currentHeight += totalsHeight;
              }

              if (currentListIndex < list.length) {
                commitPage();
              } else if (!fitsTotals) {
                commitPage();
                currentPageSections.push(
                  <div key={`${sec.id}_totals`} className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}>
                    <table className="w-full border-collapse border border-black text-[10.5px]">
                      <tbody>
                        <tr className="border-b border-black font-bold">
                          <td className="px-2 py-0.5 text-left border-r border-black">Total Price In INR</td>
                          <td className="px-2 py-0.5 text-right">{q.totalPriceInInr}</td>
                        </tr>
                        <tr className="border-b border-black font-bold">
                          <td className="px-2 py-0.5 text-left border-r border-black">Sub Total</td>
                          <td className="px-2 py-0.5 text-right">{q.subTotal}</td>
                        </tr>
                        <tr className="border-b border-black font-bold">
                          <td colSpan={2} className="px-2 py-0.5 text-[10px]">{q.amountInWords}</td>
                        </tr>
                        <tr className="border-b border-black font-bold bg-gray-50/50">
                          <td colSpan={2} className="px-2 py-0.5 text-[10px]">{q.gstNote}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
                currentHeight += totalsHeight;
              }
            }
          } else if (sec.isCustom && sec.customData && (sec.customData.contentType === 'bullet_list' || sec.customData.contentType === 'paragraphs' || sec.customData.contentType === 'legal_clause')) {
            const cs = sec.customData;
            const items = cs.contentType === 'bullet_list' ? (cs.bullets || []) : (cs.paragraphs || []);
            let currentItemIndex = 0;

            while (currentItemIndex < items.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 40) {
                commitPage();
              }

              const pageItems: string[] = [];
              let itemsH = 30;

              while (currentItemIndex < items.length) {
                const text = items[currentItemIndex];
                const itemH = Math.ceil(text.length / 70) * 15 + 8;
                if (itemsH + itemH <= budget - currentHeight) {
                  pageItems.push(text);
                  itemsH += itemH;
                  currentItemIndex++;
                } else {
                  break;
                }
              }

              currentPageSections.push(
                <div key={`${sec.id}_split_${subPages.length}`} className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}>
                  <h2 className="text-[12.5px] font-bold text-[#404040] mb-1.5 uppercase tracking-wide">
                    {applyVariables(cs.title, globalVars)} {currentItemIndex < items.length ? '(Continued)' : ''}
                  </h2>
                  {cs.contentType === 'bullet_list' ? (
                    <ul className="list-disc list-inside space-y-1 pl-1 text-justify text-[11px] leading-relaxed">
                      {pageItems.map((b, bIdx) => (
                        <li key={bIdx} className="text-black">{applyVariables(b, globalVars)}</li>
                      ))}
                    </ul>
                  ) : cs.contentType === 'paragraphs' ? (
                    <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
                      {pageItems.map((p, pIdx) => (
                        <p key={pIdx}>{applyVariables(p, globalVars)}</p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
                      {pageItems.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-start space-x-2">
                          <span className="font-bold text-black font-mono shrink-0 text-[11px]">
                            {currentItemIndex - pageItems.length + pIdx + 1}.0
                          </span>
                          <p className="flex-1">{applyVariables(p, globalVars)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );

              currentHeight += itemsH;
              if (currentItemIndex < items.length) {
                commitPage();
              }
            }
          }
        } else {
          commitPage();
          currentPageSections.push(renderSectionItem(sec));
          currentHeight = estimatedHeight;
        }
      }
    });

    if (currentPageSections.length > 0) {
      subPages.push({ sections: currentPageSections });
    }

    return subPages;
  };

  const paginatedPages = useMemo(() => {
    return outlineGroups.flatMap((group) => {
      const subPages = partitionGroupSections(group);
      return subPages.map((sub, idx) => ({
        pageNum: group.pageNum,
        groupId: `${group.groupId}_sub_${idx}`,
        isCustomGroup: group.isCustomGroup,
        groupTitle: idx > 0 ? `${group.groupTitle} (Continued)` : group.groupTitle,
        sections: sub.sections,
      }));
    });
  }, [outlineGroups, q, globalVars]);

  // Standard Header Macro
  const renderHeader = (pageNumber: number) => (
    <div
      id="preview-sec-header_footer"
      onClick={() => onSelectSection?.('header_footer')}
      onMouseEnter={() => onHoverSection?.('header_footer')}
      onMouseLeave={() => onHoverSection?.(null)}
      className={`mb-2 p-1 rounded relative cursor-pointer transition-all duration-200 select-none ${
        isHeaderActive
          ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
          : isHeaderHovered
          ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
          : 'hover:ring-1 hover:ring-emerald-300/40'
      }`}
      title="Header & Footer (Click to edit)"
    >
      {isHeaderHovered && !isHeaderActive && (
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
        <div>Regd. Off. : SO7B / 2nd floor / Phase 2, Indiabulls, Jetalpur road, Vadodara</div>
        <div>GST NO: {applyVariables(q.companyGstNo || '24CLNPS9550H1ZI', globalVars)}</div>
      </div>

      <div className="h-[1px] bg-black my-1" />
    </div>
  );

  // Standard Footer Macro
  const renderFooter = (pageIndex: number, totalPages: number) => (
    <div
      onClick={() => onSelectSection?.('header_footer')}
      onMouseEnter={() => onHoverSection?.('header_footer')}
      onMouseLeave={() => onHoverSection?.(null)}
      className={`pt-2 mt-auto select-none rounded p-1 transition-all duration-200 cursor-pointer relative ${
        isHeaderActive
          ? 'ring-2 ring-emerald-600 bg-emerald-50/20 shadow-xs'
          : isHeaderHovered
          ? 'ring-2 ring-emerald-400/80 bg-emerald-500/[0.05] shadow-xs'
          : 'hover:ring-1 hover:ring-emerald-300/40'
      }`}
      title="Header & Footer (Click to edit)"
    >
      {isHeaderHovered && !isHeaderActive && (
        <span className="absolute -top-6 right-1 text-[9px] bg-emerald-700 text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
          Header & Footer
        </span>
      )}
      <div className="h-[1.5px] bg-black mb-1" />
      <div className="flex justify-between items-center text-[9px] leading-tight text-black">
        <div className="flex-1 text-center font-semibold">
          Phone: {applyVariables(q.companyPhone || '+91 97254 45370', globalVars)} &bull;{' '}
          {applyVariables(
            q.companyAddressFooter ||
              'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243',
            globalVars
          )}
          <br />
          Email: {applyVariables(q.companyEmail || 'info@globalindustries.co', globalVars)} &bull; Website:{' '}
          {applyVariables(q.companyWebsite || 'www.globalindustries.co', globalVars)}
        </div>
        <div className="text-[10px] font-mono font-bold text-gray-700 shrink-0 pl-2">
          Page {pageIndex + 1} of {totalPages}
        </div>
      </div>
    </div>
  );

  // Page container style with consistent A4 proportions
  const pageStyle: React.CSSProperties = {
    fontFamily: fontFamilyStyle || 'Helvetica, Arial, sans-serif',
    width: '794px',
    height: '1123px',
    maxHeight: '1123px',
    overflow: 'hidden',
  };

  // Custom Section Renderer for user-added sections
  const renderCustomSection = (sec: CustomSectionItem) => {
    const isSecActive = activeSectionId === sec.id;
    const isSecHovered = hoveredSectionId === sec.id && !isSecActive;
    const sectionTitle = applyVariables(sec.title, globalVars);

    return (
      <div
        key={sec.id}
        id={`preview-sec-${sec.id}`}
        onClick={() => onSelectSection?.(sec.id)}
        onMouseEnter={() => onHoverSection?.(sec.id)}
        onMouseLeave={() => onHoverSection?.(null)}
        className={`my-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
          sec.id
        )}`}
        title={`${sectionTitle} (Click to edit)`}
      >
        {isSecHovered && !isSecActive && (
          <span className="absolute top-1 right-1 text-[9px] bg-gray-800 text-white font-mono px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
            {sectionTitle}
          </span>
        )}
        <h2 className="text-[12.5px] font-bold text-[#404040] mb-1.5 uppercase tracking-wide">
          {sectionTitle}
        </h2>

        {sec.contentType === 'bullet_list' && sec.bullets && (
          <ul className="list-disc list-inside space-y-1 pl-1 text-justify text-[11px] leading-relaxed">
            {sec.bullets.map((b, bIdx) => (
              <li key={bIdx} className="text-black">
                {applyVariables(b, globalVars)}
              </li>
            ))}
          </ul>
        )}

        {sec.contentType === 'legal_clause' && sec.paragraphs && (
          <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
            {sec.paragraphs.map((p, pIdx) => (
              <div key={pIdx} className="flex items-start space-x-2">
                <span className="font-bold text-black font-mono shrink-0 text-[11px]">
                  {pIdx + 1}.0
                </span>
                <p className="flex-1">{applyVariables(p, globalVars)}</p>
              </div>
            ))}
          </div>
        )}

        {sec.contentType === 'paragraphs' && sec.paragraphs && (
          <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
            {sec.paragraphs.map((p, pIdx) => (
              <p key={pIdx}>{applyVariables(p, globalVars)}</p>
            ))}
          </div>
        )}

        {sec.contentType === 'table' && sec.tableHeaders && sec.tableRows && (
          <div className="border border-black my-2">
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr className="border-b border-black bg-gray-100 font-bold">
                  {sec.tableHeaders.map((h, hIdx) => (
                    <th key={hIdx} className="p-1.5 border-r border-black last:border-r-0 text-left">
                      {applyVariables(h, globalVars)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sec.tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-black last:border-b-0">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 align-top">
                        {applyVariables(cell, globalVars)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sec.contentType === 'key_value' && sec.keyValuePairs && (
          <div className="border border-black my-2 text-[11px]">
            <table className="w-full border-collapse">
              <tbody>
                {sec.keyValuePairs.map((kv, kvIdx) => (
                  <tr key={kvIdx} className="border-b border-black last:border-b-0">
                    <td className="p-1.5 font-bold border-r border-black w-1/3 bg-gray-50/50 align-top">
                      {applyVariables(kv.key, globalVars)}
                    </td>
                    <td className="p-1.5 align-top">
                      {applyVariables(kv.value, globalVars)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sec.contentType === 'callout' && sec.calloutText && (
          <div className="border-2 border-black p-2.5 my-2.5 bg-gray-50 text-[11px] leading-relaxed">
            <div className="font-bold text-[11.5px] uppercase tracking-wider mb-1 text-black">
              {sec.calloutType === 'warning'
                ? 'MANDATORY DIRECTIVE / WARNING'
                : sec.calloutType === 'important'
                ? 'IMPORTANT NOTICE'
                : 'SPECIAL NOTICE'}
            </div>
            <p className="italic">{applyVariables(sec.calloutText, globalVars)}</p>
          </div>
        )}
      </div>
    );
  };

  // Render individual built-in sections
  function renderSectionItem(sec: OutlineSectionItem) {
    if (sec.isCustom && sec.customData) {
      return renderCustomSection(sec.customData);
    }

    switch (sec.id) {
      case 'q_cover_info':
      case 'page_1': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="flex justify-between items-start text-[11.5px]">
              <div>
                <div className="font-bold">To,</div>
                <div className="font-bold">{applyVariables(q.toRecipient, globalVars)}</div>
                <div className="font-bold">{applyVariables(q.toAddress, globalVars)}</div>
              </div>
              <div className="text-right">
                <div className="font-bold">Ref no.: {applyVariables(q.refNo, globalVars)}</div>
                <div className="font-bold">Date: {applyVariables(q.date, globalVars)}</div>
              </div>
            </div>
          </div>
        );
      }

      case 'q_cover_intro': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="my-4 text-center">
              <h2 className="text-[13.5px] font-bold underline inline-block tracking-wide uppercase">
                {applyVariables(q.subjectTitle, globalVars)}
              </h2>
            </div>

            <div className="font-bold text-[12px]">Dear Sir,</div>

            <div className="mt-3 space-y-3 text-[11.5px] text-justify leading-relaxed">
              {q.introParagraphs.map((para, idx) => (
                <p key={idx}>{applyVariables(para, globalVars)}</p>
              ))}
            </div>

            <div className="mt-8 text-[11.5px]">
              <div className="font-bold">Best regards,</div>
              <div className="font-bold mt-1 text-[12px]">{q.signatoryName || 'Global Industries'}</div>
              {q.signatoryPhones.map((ph, idx) => (
                <div key={idx} className="text-gray-900 font-medium">
                  {ph}
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'q_tech_details':
      case 'page_2': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1 mb-2 font-bold text-[13px] uppercase tracking-wide text-[#404040]">
              Technical Details:
            </div>
            <table className="w-full border-collapse border border-black text-[11.5px]">
              <tbody>
                {q.technicalDetails.map((td, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="w-[38%] font-bold px-3 py-1.5 border-r border-black align-top bg-gray-50/50">
                      {td.label}
                    </td>
                    <td className="px-3 py-1.5 align-top leading-snug">
                      {applyVariables(td.value, globalVars)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'q_mat_specs':
      case 'page_3': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1 mb-2 font-bold text-[13px] uppercase tracking-wide text-[#404040]">
              Material Specifications:
            </div>
            <table className="w-full border-collapse border border-black text-[11px]">
              <tbody>
                {q.specifications.map((spec, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="w-[32%] font-bold px-3 py-2 border-r border-black align-top bg-gray-50/50 whitespace-pre-line">
                      {spec.title.replace(/\\newline/g, '\n').replace(/\\textbf{([^}]+)}/g, '$1')}
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] leading-relaxed whitespace-pre-line">
                      {spec.details
                        .replace(/\\newline/g, '\n')
                        .replace(/\\textbf{([^}]+)}/g, '$1')
                        .replace(/\\&/g, '&')
                        .replace(/\\\$/g, '$')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'q_boq_items':
      case 'page_4': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1">
              <div className="font-bold text-[13px] uppercase tracking-wide text-[#404040]">
                COMMERCIAL:
              </div>
              <div className="font-bold text-[11.5px] text-gray-800">{q.commercialSubtitle}</div>
            </div>

            <div className="mt-1.5">
              <table className="w-full border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="border-b border-black bg-gray-100/70 font-bold">
                    <th className="px-2 py-1 text-center border-r border-black">Description</th>
                    <th className="w-[120px] px-2 py-1 text-center">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {q.commercialItems.map((item, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="px-2 py-1 border-r border-black align-top text-justify whitespace-pre-line leading-snug">
                        {item.description
                          .replace(/\\newline/g, '\n')
                          .replace(/\\textbf{([^}]+)}/g, '$1')
                          .replace(/\\&/g, '&')}
                      </td>
                      <td className="px-2 py-1 text-right align-top font-medium">{item.price}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-black font-bold">
                    <td className="px-2 py-0.5 text-left border-r border-black">Total Price In INR</td>
                    <td className="px-2 py-0.5 text-right">{q.totalPriceInInr}</td>
                  </tr>
                  <tr className="border-b border-black font-bold">
                    <td className="px-2 py-0.5 text-left border-r border-black">Sub Total</td>
                    <td className="px-2 py-0.5 text-right">{q.subTotal}</td>
                  </tr>
                  <tr className="border-b border-black font-bold">
                    <td colSpan={2} className="px-2 py-0.5 text-[10px]">
                      {q.amountInWords}
                    </td>
                  </tr>
                  <tr className="border-b border-black font-bold bg-gray-50/50">
                    <td colSpan={2} className="px-2 py-0.5 text-[10px]">
                      {q.gstNote}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'q_payment_terms_fab': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="font-bold underline text-[11.5px] uppercase tracking-wide">
              Payment Terms:
            </div>
            <div className="font-bold text-[11px] mt-0.5">For Fabrication:</div>
            <ul className="list-disc list-inside text-[10.5px] space-y-0.5 pl-2 mt-0.5">
              {q.paymentTermsFab.map((pt, idx) => (
                <li key={idx} className="leading-snug">
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'q_payment_terms_civil': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-1 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="font-bold text-[11px] mt-0.5">For Civil Work:</div>
            <ol className="list-decimal list-inside text-[10.5px] space-y-0.5 pl-2 mt-0.5">
              {q.paymentTermsCivil.map((pt, idx) => (
                <li key={idx} className="leading-snug">
                  {pt}
                </li>
              ))}
            </ol>
          </div>
        );
      }

      case 'q_delivery_schedule':
      case 'page_5': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-2 text-center">
              <h3 className="font-bold text-[13px] underline tracking-wide uppercase">
                DELIVERY SCHEDULE & PROJECT TIMELINE
              </h3>
            </div>

            <div className="mt-3">
              <ol className="list-decimal list-inside text-[11.5px] space-y-3.5 pl-2">
                {q.deliverySchedule.map((ds, idx) => (
                  <li key={idx} className="leading-relaxed text-justify">
                    {ds}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-6 border border-black p-3 bg-gray-50/50 text-[11px] space-y-2">
              <div className="font-bold text-[11.5px] uppercase tracking-wide">
                Site Readiness & Delivery Prerequisites:
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 leading-relaxed">
                <li>Site access must be clear and hardened for heavy trailer/truck movement.</li>
                <li>Unloading, crane arrangements, and safe storage area are in scope of Client.</li>
                <li>Water and 3-phase electricity must be made available by the client at site.</li>
                <li>Foundation anchor bolts casting certification must be provided before dispatch.</li>
              </ul>
            </div>
          </div>
        );
      }

      case 'q_vendors_part1':
      case 'page_6': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1 text-center">
              <h3 className="font-bold text-[13px] uppercase tracking-wide">
                APPROVED VENDOR LIST (PART 1)
              </h3>
            </div>

            <div className="mt-2">
              <table className="w-full border-collapse border border-black text-[10.5px]">
                <thead>
                  <tr className="border-b border-black bg-gray-100 font-bold">
                    <th className="w-[45px] px-1.5 py-1 text-center border-r border-black">Sr. No</th>
                    <th className="w-[180px] px-2 py-1 text-center border-r border-black">Description</th>
                    <th className="px-2 py-1 text-center">Brand/Make/Company Name</th>
                  </tr>
                </thead>
                <tbody>
                  {q.vendorList.slice(0, 14).map((v, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="px-1 py-1 text-center border-r border-black align-top">{v.srNo}</td>
                      <td className="px-2 py-1 border-r border-black align-top font-medium">
                        {v.description}
                      </td>
                      <td className="px-2 py-1 align-top whitespace-pre-line leading-snug">
                        {v.brand
                          .replace(/\\newline/g, '\n')
                          .replace(/\\textbf{([^}]+)}/g, '$1')
                          .replace(/\\&/g, '&')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'q_vendors_part2':
      case 'page_7': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="border-b border-black bg-gray-100 font-bold">
                  <th className="w-[45px] px-1.5 py-0.5 text-center border-r border-black">Sr. No</th>
                  <th className="w-[180px] px-2 py-0.5 text-center border-r border-black">Description</th>
                  <th className="px-2 py-0.5 text-center">Brand/Make/Company Name</th>
                </tr>
              </thead>
              <tbody>
                {q.vendorList.slice(14).map((v, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="px-1 py-0.5 text-center border-r border-black align-top">{v.srNo}</td>
                    <td className="px-2 py-0.5 border-r border-black align-top font-medium">
                      {v.description}
                    </td>
                    <td className="px-2 py-0.5 align-top">{v.brand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      case 'q_taxes_notes': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="text-[10.5px] leading-snug">
              <span className="font-bold">Taxes:</span> {q.taxNote}
            </div>

            <div className="mt-1.5">
              <div className="font-bold text-[11px] underline uppercase">NOTES:</div>
              <ol className="list-decimal list-inside text-[10px] space-y-0.5 pl-2 mt-0.5">
                {q.notes.map((n, idx) => (
                  <li key={idx} className="leading-snug text-justify">
                    {n}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-1.5">
              <div className="font-bold text-[11px] underline uppercase">DELIVERY CONDITIONS:</div>
              <ul className="list-disc list-inside text-[10px] space-y-0.5 pl-2 mt-0.5">
                {q.deliveryChecklist.map((dc, idx) => (
                  <li key={idx} className="leading-snug">
                    {dc}
                  </li>
                ))}
              </ul>
              <div className="text-[10px] leading-snug text-justify whitespace-pre-line mt-1">
                {q.deliveryNotes}
              </div>
            </div>
          </div>
        );
      }

      case 'q_terms_part1':
      case 'page_8': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1 text-center">
              <h3 className="font-bold text-[13px] underline tracking-wide uppercase">
                OTHER COMMERCIAL TERMS
              </h3>
            </div>

            <div className="mt-3">
              <ol className="list-decimal list-inside text-[10.5px] space-y-2.5 pl-2">
                {q.commercialTerms.slice(0, 7).map((term, idx) => (
                  <li key={idx} className="leading-relaxed text-justify">
                    <span className="font-bold">{term.title} </span>
                    {term.content
                      .replace(/\\newline/g, '\n')
                      .replace(/\\textsuperscript{st}/g, 'st')
                      .replace(/\\%/g, '%')
                      .replace(/\\&/g, '&')}
                    {term.subItems && term.subItems.length > 0 && (
                      <ul className="list-disc list-inside pl-4 mt-0.5 space-y-0.5">
                        {term.subItems.map((sub, sIdx) => (
                          <li key={sIdx}>{sub}</li>
                        ))}
                      </ul>
                    )}
                    {term.note && <div className="mt-0.5 font-bold">Note: {term.note}</div>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      }

      case 'q_terms_part2':
      case 'page_9': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1">
              <ol start={8} className="list-decimal list-inside text-[10.5px] space-y-2.5 pl-2">
                {q.commercialTerms.slice(7, 13).map((term, idx) => (
                  <li key={idx} className="leading-relaxed text-justify">
                    <span className="font-bold">{term.title} </span>
                    <span className="whitespace-pre-line">
                      {term.content
                        .replace(/\\newline/g, '\n')
                        .replace(/\\textbf{([^}]+)}/g, '$1')
                        .replace(/\\textsuperscript{([^}]+)}/g, '$1')
                        .replace(/\\%/g, '%')
                        .replace(/\\&/g, '&')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      }

      case 'q_terms_part3':
      case 'page_10': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="mt-1">
              <ol start={14} className="list-decimal list-inside text-[10px] space-y-1 pl-2">
                {q.commercialTerms.slice(13).map((term, idx) => (
                  <li key={idx} className="leading-snug text-justify">
                    <span className="font-bold">{term.title} </span>
                    {term.content}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        );
      }

      case 'q_exclusions': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="font-bold text-[10.5px] underline uppercase">Section 7: EXCLUSIONS</div>
            <ul className="list-disc list-inside text-[9.5px] space-y-0.5 pl-2 mt-0.5">
              {q.exclusions.map((ex, idx) => (
                <li key={idx} className="leading-snug text-justify">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      case 'q_signatures': {
        return (
          <div
            key={sec.id}
            id={`preview-sec-${sec.id}`}
            onClick={() => onSelectSection?.(sec.id)}
            onMouseEnter={() => onHoverSection?.(sec.id)}
            onMouseLeave={() => onHoverSection?.(null)}
            className={`mt-2 p-1.5 rounded relative cursor-pointer transition-all duration-200 ${getSectionHighlightClass(
              sec.id
            )}`}
          >
            <div className="font-bold text-[10.5px] underline uppercase">Section 8: SPECIAL NOTES</div>
            <ul className="list-disc list-inside text-[9.5px] space-y-0.5 pl-2 mt-0.5">
              {q.specialNotes.map((sn, idx) => (
                <li key={idx} className="leading-snug text-justify">
                  {sn}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between items-end px-2 pt-2">
              <div className="text-left text-[10.5px]">
                <div className="font-bold">Accepted & Confirmed by Client</div>
                <div className="h-9" />
                <div className="font-bold text-[10px] border-t border-black/50 pt-1">
                  Name, Seal & Signatory
                </div>
              </div>
              <div className="text-right text-[10.5px]">
                <div className="font-bold">{q.finalSignatoryCompany || 'For, GLOBAL INDUSTRIES'}</div>
                <div className="h-9" />
                <div className="font-bold text-[10px] border-t border-black/50 pt-1">
                  {q.finalSignatoryTitle || '(Authorized Signatory)'}
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

  return (
    <div ref={printRef} className="space-y-12 print-area flex flex-col items-center select-text">
      {paginatedPages.map((page, pageIdx) => (
        <div
          key={`q_page_${page.groupId}`}
          id={`preview-sec-${page.groupId}`}
          style={pageStyle}
          className="latex-paper bg-white text-black p-10 shadow-2xl relative flex flex-col justify-between text-[11.5px] leading-normal"
        >
          {/* Header & Page Sections */}
          <div className="flex-1 flex flex-col">
            {renderHeader(page.pageNum)}

            <div className="flex-1 space-y-1">
              {page.sections.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic text-xs border-2 border-dashed border-gray-200 rounded my-8">
                  Empty Page / Section Group &bull; Drag sections here from Document Outline
                </div>
              ) : (
                page.sections.map((secNode) => secNode)
              )}
            </div>
          </div>

          {/* Constant Standard Footer with Page Number */}
          {renderFooter(pageIdx, paginatedPages.length)}
        </div>
      ))}
    </div>
  );
};
