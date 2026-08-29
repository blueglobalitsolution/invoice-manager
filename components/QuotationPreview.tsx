'use client';

import React, { useMemo } from 'react';
import {
  LatexDocument,
  QuotationData,
  CustomSectionItem,
  QuotationTechnicalItem,
  QuotationSpecItem,
  QuotationVendorItem,
  QuotationCommercialItem,
} from '@/types/document';
import { CompanyProfile } from '@/types/project';
import { applyVariables } from '@/lib/variables';
import { FormattedText } from '@/lib/format-text';
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
  companyProfile?: CompanyProfile;
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
  companyProfile,
}) => {
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  const companyName = applyVariables(pProfile.companyName || q.companyName || 'GLOBAL', globalVars);
  const companySubtitle = applyVariables(pProfile.companySubtitle || q.companySubtitle || 'INDUSTRIES', globalVars);
  const leftServices: string[] = pProfile.leftServices || q.leftServices || [];
  const rightServices: string[] = pProfile.rightServices || q.rightServices || [];
  const companyAddressHeader = applyVariables(
    pProfile.companyAddressHeader || q.companyAddressHeader || 'Regd. Off. : SO7B / 2nd floor / Phase 2, Indiabulls, Jetalpur road, Vadodara',
    globalVars
  );
  const companyAddressFooter = applyVariables(
    pProfile.companyAddressFooter || q.companyAddressFooter || 'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243',
    globalVars
  );
  const companyPhone = applyVariables(pProfile.companyPhone || q.companyPhone || '+91 97254 45370', globalVars);
  const companyEmail = applyVariables(pProfile.companyEmail || q.companyEmail || 'info@globalindustries.co', globalVars);
  const companyWebsite = applyVariables(pProfile.companyWebsite || q.companyWebsite || 'www.globalindustries.co', globalVars);
  const companyGstNo = applyVariables(pProfile.companyGstNo || q.companyGstNo || '24CLNPS9550H1ZI', globalVars);

  const isHeaderActive = activeSectionId === 'header_footer';
  const isHeaderHovered = hoveredSectionId === 'header_footer' && !isHeaderActive;

  // Retrieve dynamic page groups and sections
  const outlineGroups: OutlineGroup[] = useMemo(() => {
    return getQuotationOutlineGroups(q);
  }, [q]);

  const getSectionHighlightClass = (sectionId: string) => {
    const isActive = activeSectionId === sectionId;
    const isHovered = hoveredSectionId === sectionId && !isActive;
    if (isActive) return 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs print:ring-0 print:bg-transparent print:shadow-none';
    if (isHovered) return 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs print:ring-0 print:bg-transparent print:shadow-none';
    return 'hover:ring-1 hover:ring-[#0d3479]/30 print:ring-0 print:bg-transparent print:shadow-none';
  };

  // Accurate line counting that prevents double-counting \n and text-wrapping
  const countRenderedLines = (text: string, charsPerLine: number = 70) => {
    if (!text) return 1;
    return text.split('\n').reduce((acc, line) => {
      return acc + Math.max(1, Math.ceil(line.length / charsPerLine));
    }, 0);
  };

  const getSpecItemHeight = (spec: QuotationSpecItem) => {
    const titleLines = countRenderedLines(spec.title || '', 30);
    const detailLines = countRenderedLines(spec.details || '', 65);
    const lines = Math.max(titleLines, detailLines);
    return Math.max(24, lines * 16 + 10);
  };

  const getTechItemHeight = (td: { label: string; value: string }) => {
    const labelLines = countRenderedLines(td.label || '', 35);
    const valueLines = countRenderedLines(td.value || '', 55);
    const lines = Math.max(labelLines, valueLines);
    return Math.max(20, lines * 14 + 6);
  };

  const getVendorItemHeight = (v: QuotationVendorItem) => {
    const brandLines = countRenderedLines(v.brand || '', 45);
    const descLines = countRenderedLines(v.description || '', 30);
    const lines = Math.max(brandLines, descLines);
    return Math.max(20, lines * 14 + 6);
  };

  const getBoqItemHeight = (item: QuotationCommercialItem) => {
    const lines = countRenderedLines(item.description || '', 65);
    return Math.max(22, lines * 15 + 8);
  };

  // Dynamic layout partitioner logic (heuristic-based Word/LaTeX style auto-pagination)
  const paddingHeight = 80;
  const headerHeight = 110;
  const footerHeight = 45;
  const maxPageHeight = 1123;

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
      return maxPageHeight - paddingHeight - headerHeight - footerHeight; // 888px available budget
    };

    const budget = getAvailableHeight();

    group.sections.forEach((sec) => {
      let estimatedHeight = 35; // default minimum
      
      if (sec.id === 'q_cover_info') {
        estimatedHeight = 110;
      } else if (sec.id === 'q_cover_intro') {
        estimatedHeight = 80 + q.introParagraphs.reduce((acc, p) => acc + countRenderedLines(p, 85) * 14 + 6, 0);
      } else if (sec.id === 'q_tech_details') {
        estimatedHeight = 30 + q.technicalDetails.reduce((acc, td) => acc + getTechItemHeight(td), 0);
      } else if (sec.id === 'q_mat_specs') {
        estimatedHeight = 30 + q.specifications.reduce((acc, spec) => acc + getSpecItemHeight(spec), 0);
      } else if (sec.id === 'q_boq_items') {
        estimatedHeight = 85 + q.commercialItems.reduce((acc, item) => acc + getBoqItemHeight(item), 0);
      } else if (sec.id === 'q_payment_terms_fab') {
        estimatedHeight = 22 + q.paymentTermsFab.reduce((acc, p) => acc + countRenderedLines(p, 85) * 14 + 4, 0);
      } else if (sec.id === 'q_payment_terms_civil') {
        estimatedHeight = 22 + q.paymentTermsCivil.reduce((acc, p) => acc + countRenderedLines(p, 85) * 14 + 4, 0);
      } else if (sec.id === 'q_delivery_schedule') {
        estimatedHeight = 30 + q.deliverySchedule.reduce((acc, p) => acc + countRenderedLines(p, 85) * 14 + 6, 0);
      } else if (sec.id === 'q_vendors' || sec.id === 'q_vendors_part1' || sec.id === 'q_vendors_part2') {
        estimatedHeight = 30 + q.vendorList.reduce((acc, v) => acc + getVendorItemHeight(v), 0);
      } else if (sec.id === 'q_taxes_notes') {
        estimatedHeight = 35 + q.notes.length * 15 + q.deliveryChecklist.length * 14;
      } else if (sec.id === 'q_terms_part1') {
        estimatedHeight = 25 + q.commercialTerms.slice(0, 7).reduce((acc, t) => acc + countRenderedLines(t.content, 85) * 13 + 10, 0);
      } else if (sec.id === 'q_terms_part2') {
        estimatedHeight = 25 + q.commercialTerms.slice(7, 13).reduce((acc, t) => acc + countRenderedLines(t.content, 85) * 13 + 10, 0);
      } else if (sec.id === 'q_terms_part3') {
        estimatedHeight = 25 + q.commercialTerms.slice(13).reduce((acc, t) => acc + countRenderedLines(t.content, 85) * 13 + 10, 0);
      } else if (sec.id === 'q_exclusions') {
        estimatedHeight = 25 + q.exclusions.length * 15;
      } else if (sec.id === 'q_signatures') {
        estimatedHeight = 150;
      } else if (sec.isCustom && sec.customData) {
        const cs = sec.customData;
        estimatedHeight = 25;
        if (cs.contentType === 'bullet_list' && cs.bullets) {
          estimatedHeight += cs.bullets.reduce((acc, b) => acc + countRenderedLines(b, 80) * 13 + 6, 0);
        } else if (cs.contentType === 'paragraphs' && cs.paragraphs) {
          estimatedHeight += cs.paragraphs.reduce((acc, p) => acc + countRenderedLines(p, 85) * 13 + 8, 0);
        } else if (cs.contentType === 'legal_clause' && cs.paragraphs) {
          estimatedHeight += cs.paragraphs.reduce((acc, p) => acc + countRenderedLines(p, 80) * 13 + 10, 0);
        } else if (cs.contentType === 'table' && cs.tableRows) {
          estimatedHeight += 25 + cs.tableRows.length * 20;
        } else if (cs.contentType === 'key_value' && cs.keyValuePairs) {
          estimatedHeight += cs.keyValuePairs.length * 20;
        } else if (cs.contentType === 'callout') {
          estimatedHeight += 45;
        }
      }

      if (currentHeight + estimatedHeight <= budget) {
        currentPageSections.push(renderSectionItem(sec));
        currentHeight += estimatedHeight;
      } else {
        // Handle Splittable elements to partition them row-by-row or item-by-item
        if (
          sec.id === 'q_boq_items' ||
          sec.id === 'q_mat_specs' ||
          sec.id === 'q_tech_details' ||
          sec.id === 'q_vendors_part1' ||
          sec.id === 'q_vendors_part2' ||
          (sec.isCustom &&
            sec.customData &&
            (sec.customData.contentType === 'table' ||
              sec.customData.contentType === 'bullet_list' ||
              sec.customData.contentType === 'paragraphs' ||
              sec.customData.contentType === 'legal_clause'))
        ) {
          if (sec.id === 'q_mat_specs') {
            const list = q.specifications;
            let currentListIndex = 0;

            while (currentListIndex < list.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 50) {
                commitPage();
              }

              const pageRows: typeof list = [];
              let rowsHeight = 25;

              while (currentListIndex < list.length) {
                const spec = list[currentListIndex];
                const rowH = getSpecItemHeight(spec);
                if (rowsHeight + rowH <= budget - currentHeight) {
                  pageRows.push(spec);
                  rowsHeight += rowH;
                  currentListIndex++;
                } else {
                  break;
                }
              }

              if (pageRows.length === 0 && currentListIndex < list.length) {
                pageRows.push(list[currentListIndex]);
                rowsHeight += getSpecItemHeight(list[currentListIndex]);
                currentListIndex++;
              }

              currentPageSections.push(
                <div
                  key={`${sec.id}_split_${subPages.length}`}
                  className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}
                >
                  <div className="mt-1 mb-2 font-bold text-[13px] uppercase tracking-wide text-[#404040]">
                    Material Specifications {pageRows.length < list.length || currentListIndex > pageRows.length ? '(Continued)' : ''}:
                  </div>
                  <table className="w-full border-collapse border border-black text-[11px]">
                    <tbody>
                      {pageRows.map((spec, idx) => (
                        <tr key={idx} className="border-b border-black">
                          <td className="w-[32%] font-bold px-3 py-2 border-r border-black align-top bg-gray-50/50 whitespace-pre-line">
                            <FormattedText text={spec.title} globalVars={globalVars} />
                          </td>
                          <td className="px-3 py-2 align-top text-[11px] leading-relaxed whitespace-pre-line">
                            <FormattedText text={spec.details} globalVars={globalVars} />
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
          } else if (sec.id === 'q_tech_details') {
            const list = q.technicalDetails;
            let currentListIndex = 0;

            while (currentListIndex < list.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 50) {
                commitPage();
              }

              const pageRows: typeof list = [];
              let rowsHeight = 25;

              while (currentListIndex < list.length) {
                const td = list[currentListIndex];
                const rowH = getTechItemHeight(td);
                if (rowsHeight + rowH <= budget - currentHeight) {
                  pageRows.push(td);
                  rowsHeight += rowH;
                  currentListIndex++;
                } else {
                  break;
                }
              }

              if (pageRows.length === 0 && currentListIndex < list.length) {
                pageRows.push(list[currentListIndex]);
                rowsHeight += getTechItemHeight(list[currentListIndex]);
                currentListIndex++;
              }

              currentPageSections.push(
                <div
                  key={`${sec.id}_split_${subPages.length}`}
                  className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}
                >
                  <div className="mt-1 mb-2 font-bold text-[13px] uppercase tracking-wide text-[#404040]">
                    Technical Details {pageRows.length < list.length || currentListIndex > pageRows.length ? '(Continued)' : ''}:
                  </div>
                  <table className="w-full border-collapse border border-black text-[11.5px]">
                    <tbody>
                      {pageRows.map((td, idx) => (
                        <tr key={idx} className="border-b border-black">
                          <td className="w-[38%] font-bold px-3 py-1.5 border-r border-black align-top bg-gray-50/50">
                            {td.label}
                          </td>
                          <td className="px-3 py-1.5 align-top leading-snug"><FormattedText text={td.value} globalVars={globalVars} /></td>
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
          } else if (sec.id === 'q_vendors_part1' || sec.id === 'q_vendors_part2' || sec.id === 'q_vendors') {
            // When q_vendors_part2 is encountered in an outline where part1 already partitioned everything, skip to avoid duplicate
            if (sec.id === 'q_vendors_part2' && group.sections.some(s => s.id === 'q_vendors_part1' || s.id === 'q_vendors')) {
              // already handled
            } else {
              const list = q.vendorList;
              let currentListIndex = 0;

              while (currentListIndex < list.length) {
                const remainingBudget = budget - currentHeight;
                if (remainingBudget < 40) {
                  commitPage();
                }
                
                const pageRows: typeof list = [];
                let rowsHeight = 25;
                
                while (currentListIndex < list.length) {
                  const v = list[currentListIndex];
                  const rowH = getVendorItemHeight(v);
                  if (rowsHeight + rowH <= budget - currentHeight) {
                    pageRows.push(v);
                    rowsHeight += rowH;
                    currentListIndex++;
                  } else {
                    break;
                  }
                }

                if (pageRows.length === 0 && currentListIndex < list.length) {
                  pageRows.push(list[currentListIndex]);
                  rowsHeight += getVendorItemHeight(list[currentListIndex]);
                  currentListIndex++;
                }

                currentPageSections.push(
                  <div key={`${sec.id}_split_${subPages.length}`} className={`p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}>
                    <div className="text-center font-bold text-[13px] uppercase">
                      APPROVED VENDOR LIST {pageRows.length < list.length || currentListIndex > pageRows.length ? '(CONTINUED)' : ''}
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
            }
          } else if (sec.id === 'q_boq_items') {
            const list = q.commercialItems;
            let currentListIndex = 0;

            while (currentListIndex < list.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 40) {
                commitPage();
              }

              const pageRows: typeof list = [];
              let rowsHeight = 25;
              
              while (currentListIndex < list.length) {
                const item = list[currentListIndex];
                const rowH = getBoqItemHeight(item);
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
                rowsHeight += getBoqItemHeight(list[currentListIndex]);
                currentListIndex++;
              }

              const isFinalPart = currentListIndex === list.length;
              const totalsHeight = 70;
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
                            <td colSpan={2} className="px-2 py-0.5 text-[10px]"><FormattedText text={q.amountInWords} globalVars={globalVars} /></td>
                          </tr>
                          <tr className="border-b border-black font-bold bg-gray-50/50">
                            <td colSpan={2} className="px-2 py-0.5 text-[10px]"><FormattedText text={q.gstNote} globalVars={globalVars} /></td>
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
                          <td colSpan={2} className="px-2 py-0.5 text-[10px]"><FormattedText text={q.amountInWords} globalVars={globalVars} /></td>
                        </tr>
                        <tr className="border-b border-black font-bold bg-gray-50/50">
                          <td colSpan={2} className="px-2 py-0.5 text-[10px]"><FormattedText text={q.gstNote} globalVars={globalVars} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
                currentHeight += totalsHeight;
              }
            }
          } else if (sec.isCustom && sec.customData && sec.customData.contentType === 'table') {
            const cs = sec.customData;
            const headers = cs.tableHeaders || ['Item', 'Description'];
            const rows = cs.tableRows || [];
            let currentRowIndex = 0;

            while (currentRowIndex < rows.length) {
              const remainingBudget = budget - currentHeight;
              if (remainingBudget < 80) {
                commitPage();
              }

              const pageRows: typeof rows = [];
              let rowsH = 45;

              while (currentRowIndex < rows.length) {
                const row = rows[currentRowIndex];
                const maxCellLen = row.reduce((max, c) => Math.max(max, (c || '').length), 0);
                const rowH = Math.max(28, Math.ceil(maxCellLen / 40) * 16 + 8);
                if (rowsH + rowH <= budget - currentHeight) {
                  pageRows.push(row);
                  rowsH += rowH;
                  currentRowIndex++;
                } else {
                  break;
                }
              }

              if (pageRows.length === 0 && currentRowIndex < rows.length) {
                pageRows.push(rows[currentRowIndex]);
                rowsH += 35;
                currentRowIndex++;
              }

              currentPageSections.push(
                <div
                  key={`${sec.id}_split_${subPages.length}`}
                  className={`my-2 p-1.5 rounded relative ${getSectionHighlightClass(sec.id)}`}
                >
                  <h2 className="text-[12.5px] font-bold text-[#404040] mb-1.5 uppercase tracking-wide">
                    {applyVariables(cs.title, globalVars)} {currentRowIndex < rows.length || currentRowIndex > pageRows.length ? '(Continued)' : ''}
                  </h2>
                  <div className="border border-black my-1 text-[10.5px]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-black bg-gray-100 font-bold">
                          {headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-1.5 border-r border-black last:border-r-0 text-left"><FormattedText text={h} globalVars={globalVars} /></th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-black last:border-b-0">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 align-top"><FormattedText text={cell} globalVars={globalVars} /></td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );

              currentHeight += rowsH;
              if (currentRowIndex < rows.length) {
                commitPage();
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
                        <li key={bIdx} className="text-black"><FormattedText text={b} globalVars={globalVars} /></li>
                      ))}
                    </ul>
                  ) : cs.contentType === 'paragraphs' ? (
                    <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
                      {pageItems.map((p, pIdx) => (
                        <p key={pIdx}><FormattedText text={p} globalVars={globalVars} /></p>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
                      {pageItems.map((p, pIdx) => (
                        <div key={pIdx} className="flex items-start space-x-2">
                          <span className="font-bold text-black font-mono shrink-0 text-[11px]">
                            {currentItemIndex - pageItems.length + pIdx + 1}.0
                          </span>
                          <p className="flex-1"><FormattedText text={p} globalVars={globalVars} /></p>
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
          ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
          : isHeaderHovered
          ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
          : 'hover:ring-1 hover:ring-[#0d3479]/30'
      }`}
      title="Header & Footer (Click to edit)"
    >
      {isHeaderHovered && !isHeaderActive && (
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
        <div><FormattedText text={companyAddressHeader} globalVars={globalVars} /></div>
        <div>GST NO: {applyVariables(companyGstNo, globalVars)}</div>
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
          ? 'ring-2 ring-[#0d3479] bg-[#dfe7f4]/35 shadow-xs'
          : isHeaderHovered
          ? 'ring-2 ring-[#0d3479]/60 bg-[#dfe7f4]/20 shadow-xs'
          : 'hover:ring-1 hover:ring-[#0d3479]/30'
      }`}
      title="Header & Footer (Click to edit)"
    >
      {isHeaderHovered && !isHeaderActive && (
        <span className="absolute -top-6 right-1 text-[9px] bg-[#0d3479] text-white font-mono px-1.5 py-0.5 rounded shadow-xs opacity-90 pointer-events-none">
          Header & Footer
        </span>
      )}
      <div className="h-[1.5px] bg-black mb-1" />
      <div className="flex justify-between items-center text-[9px] leading-tight text-black">
        <div className="flex-1 text-center font-semibold">
          Phone: {applyVariables(companyPhone, globalVars)} &bull;{' '}
          {applyVariables(companyAddressFooter, globalVars)}
          <br />
          Email: {applyVariables(companyEmail, globalVars)} &bull; Website:{' '}
          {applyVariables(companyWebsite, globalVars)}
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
              <li key={bIdx} className="text-black"><FormattedText text={b} globalVars={globalVars} /></li>
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
                <p className="flex-1"><FormattedText text={p} globalVars={globalVars} /></p>
              </div>
            ))}
          </div>
        )}

        {sec.contentType === 'paragraphs' && sec.paragraphs && (
          <div className="space-y-1.5 text-justify leading-relaxed text-black text-[11px]">
            {sec.paragraphs.map((p, pIdx) => (
              <p key={pIdx}><FormattedText text={p} globalVars={globalVars} /></p>
            ))}
          </div>
        )}

        {sec.contentType === 'table' && sec.tableHeaders && sec.tableRows && (
          <div className="border border-black my-2">
            <table className="w-full border-collapse text-[10.5px]">
              <thead>
                <tr className="border-b border-black bg-gray-100 font-bold">
                  {sec.tableHeaders.map((h, hIdx) => (
                    <th key={hIdx} className="p-1.5 border-r border-black last:border-r-0 text-left"><FormattedText text={h} globalVars={globalVars} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sec.tableRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-black last:border-b-0">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5 border-r border-black last:border-r-0 align-top"><FormattedText text={cell} globalVars={globalVars} /></td>
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
                    <td className="p-1.5 font-bold border-r border-black w-1/3 bg-gray-50/50 align-top"><FormattedText text={kv.key} globalVars={globalVars} /></td>
                    <td className="p-1.5 align-top"><FormattedText text={kv.value} globalVars={globalVars} /></td>
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
            <p className="italic"><FormattedText text={sec.calloutText} globalVars={globalVars} /></p>
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
                <div className="font-bold"><FormattedText text={q.toRecipient} globalVars={globalVars} /></div>
                <div className="font-bold whitespace-pre-line"><FormattedText text={q.toAddress} globalVars={globalVars} /></div>
              </div>
              <div className="text-right">
                <div className="font-bold">Ref no.: <FormattedText text={q.refNo} globalVars={globalVars} /></div>
                <div className="font-bold">Date: <FormattedText text={q.date} globalVars={globalVars} /></div>
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
                <FormattedText text={q.subjectTitle} globalVars={globalVars} />
              </h2>
            </div>

            <div className="font-bold text-[12px]">Dear Sir,</div>

            <div className="mt-3 space-y-3 text-[11.5px] text-justify leading-relaxed whitespace-pre-line">
              {q.introParagraphs.map((para, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  <FormattedText text={para} globalVars={globalVars} />
                </p>
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
                      <FormattedText text={td.label} globalVars={globalVars} />
                    </td>
                    <td className="px-3 py-1.5 align-top leading-snug whitespace-pre-line">
                      <FormattedText text={td.value} globalVars={globalVars} />
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
                      <FormattedText text={spec.title} globalVars={globalVars} />
                    </td>
                    <td className="px-3 py-2 align-top text-[11px] leading-relaxed whitespace-pre-line">
                      <FormattedText text={spec.details} globalVars={globalVars} />
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
                        <FormattedText text={item.description} globalVars={globalVars} />
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
                    <td colSpan={2} className="px-2 py-0.5 text-[10px] whitespace-pre-line">
                      <FormattedText text={q.amountInWords} globalVars={globalVars} />
                    </td>
                  </tr>
                  <tr className="border-b border-black font-bold bg-gray-50/50">
                    <td colSpan={2} className="px-2 py-0.5 text-[10px] whitespace-pre-line">
                      <FormattedText text={q.gstNote} globalVars={globalVars} />
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
            <ul className="list-disc list-inside text-[10.5px] space-y-0.5 pl-2 mt-0.5 whitespace-pre-line">
              {q.paymentTermsFab.map((pt, idx) => (
                <li key={idx} className="leading-snug whitespace-pre-line">
                  <FormattedText text={pt} globalVars={globalVars} />
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
            <ol className="list-decimal list-inside text-[10.5px] space-y-0.5 pl-2 mt-0.5 whitespace-pre-line">
              {q.paymentTermsCivil.map((pt, idx) => (
                <li key={idx} className="leading-snug whitespace-pre-line">
                  <FormattedText text={pt} globalVars={globalVars} />
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
              <ol className="list-decimal list-inside text-[11.5px] space-y-3.5 pl-2 whitespace-pre-line">
                {q.deliverySchedule.map((ds, idx) => (
                  <li key={idx} className="leading-relaxed text-justify whitespace-pre-line">
                    <FormattedText text={ds} globalVars={globalVars} />
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

      case 'q_vendors':
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
                APPROVED VENDOR LIST
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
                  {q.vendorList.map((v, idx) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="px-1 py-1 text-center border-r border-black align-top">{v.srNo}</td>
                      <td className="px-2 py-1 border-r border-black align-top font-medium whitespace-pre-line">
                        <FormattedText text={v.description} globalVars={globalVars} />
                      </td>
                      <td className="px-2 py-1 align-top whitespace-pre-line leading-snug">
                        <FormattedText text={v.brand} globalVars={globalVars} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'q_vendors_part2': {
        return null;
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
              <span className="font-bold">Taxes:</span> <FormattedText text={q.taxNote} globalVars={globalVars} />
            </div>

            <div className="mt-1.5">
              <div className="font-bold text-[11px] underline uppercase">NOTES:</div>
              <ol className="list-decimal list-inside text-[10px] space-y-0.5 pl-2 mt-0.5 whitespace-pre-line">
                {q.notes.map((n, idx) => (
                  <li key={idx} className="leading-snug text-justify whitespace-pre-line">
                    <FormattedText text={n} globalVars={globalVars} />
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-1.5">
              <div className="font-bold text-[11px] underline uppercase">DELIVERY CONDITIONS:</div>
              <ul className="list-disc list-inside text-[10px] space-y-0.5 pl-2 mt-0.5 whitespace-pre-line">
                {q.deliveryChecklist.map((dc, idx) => (
                  <li key={idx} className="leading-snug whitespace-pre-line">
                    <FormattedText text={dc} globalVars={globalVars} />
                  </li>
                ))}
              </ul>
              <div className="text-[10px] leading-snug text-justify whitespace-pre-line mt-1">
                <FormattedText text={q.deliveryNotes} globalVars={globalVars} />
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
                    <span className="font-bold"><FormattedText text={term.title} globalVars={globalVars} /> </span>
                    <FormattedText text={term.content} globalVars={globalVars} />
                    {term.subItems && term.subItems.length > 0 && (
                      <ul className="list-disc list-inside pl-4 mt-0.5 space-y-0.5">
                        {term.subItems.map((sub, sIdx) => (
                          <li key={sIdx}><FormattedText text={sub} globalVars={globalVars} /></li>
                        ))}
                      </ul>
                    )}
                    {term.note && <div className="mt-0.5 font-bold">Note: <FormattedText text={term.note} globalVars={globalVars} /></div>}
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
                    <span className="font-bold"><FormattedText text={term.title} globalVars={globalVars} /> </span>
                    <span className="whitespace-pre-line">
                      <FormattedText text={term.content} globalVars={globalVars} />
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
                    <span className="font-bold"><FormattedText text={term.title} globalVars={globalVars} /> </span>
                    <FormattedText text={term.content} globalVars={globalVars} />
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
            <ul className="list-disc list-inside text-[9.5px] space-y-0.5 pl-2 mt-0.5 whitespace-pre-line">
              {q.exclusions.map((ex, idx) => (
                <li key={idx} className="leading-snug text-justify whitespace-pre-line">
                  <FormattedText text={ex} globalVars={globalVars} />
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
            <ul className="list-disc list-inside text-[9.5px] space-y-0.5 pl-2 mt-0.5 whitespace-pre-line">
              {q.specialNotes.map((sn, idx) => (
                <li key={idx} className="leading-snug text-justify whitespace-pre-line">
                  <FormattedText text={sn} globalVars={globalVars} />
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
          <div className="flex-1 flex flex-col min-h-0">
            <div className="shrink-0">
              {renderHeader(page.pageNum)}
            </div>

            <div className="flex-1 space-y-1 min-h-0">
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
          <div className="shrink-0">
            {renderFooter(pageIdx, paginatedPages.length)}
          </div>
        </div>
      ))}
    </div>
  );
};
