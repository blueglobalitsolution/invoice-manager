import {
  Building,
  Briefcase,
  DollarSign,
  Layers,
  FileCheck,
  CheckCircle2,
  FileSignature,
  FileSpreadsheet,
  BookmarkCheck,
  Truck,
  ListOrdered,
  ShieldAlert,
  FileText,
} from 'lucide-react';
import {
  PurchaseOrderData,
  QuotationData,
  CustomSectionItem,
  CustomPageDef,
} from '@/types/document';

export interface BuiltinSectionDef {
  id: string;
  label: string;
  icon: any;
  defaultPage: number;
  description: string;
}

export const BUILTIN_SECTIONS: BuiltinSectionDef[] = [
  {
    id: 'info',
    label: 'PO Info & Parties',
    icon: Building,
    defaultPage: 1,
    description: 'PO Number, Date, Contractor, Project details',
  },
  {
    id: 'scope',
    label: 'Scope of Work',
    icon: Briefcase,
    defaultPage: 1,
    description: 'Itemized list of execution duties & responsibilities',
  },
  {
    id: 'rates',
    label: 'Rates & Pricing Table',
    icon: DollarSign,
    defaultPage: 1,
    description: 'Line items, description, unit, qty, rate, and amount in words',
  },
  {
    id: 'scope_contractor',
    label: 'Scope of Contractor',
    icon: Layers,
    defaultPage: 2,
    description: 'Contractor site & resource obligations',
  },
  {
    id: 'payment_terms',
    label: 'Payment Terms & Milestones',
    icon: DollarSign,
    defaultPage: 2,
    description: 'Stage-wise milestone payments and billing breakdown',
  },
  {
    id: 'measurement',
    label: 'Quality, Materials & Safety (Clauses 5–7)',
    icon: ShieldAlert,
    defaultPage: 2,
    description: 'Quality standards, company material responsibility, and PPE safety rules',
  },
  {
    id: 'terms',
    label: 'Commercial & Labour Terms (Clauses 8–10)',
    icon: FileCheck,
    defaultPage: 2,
    description: 'Labour compliance, measurement verification, and 60-day completion schedule',
  },
  {
    id: 'page3_terms',
    label: 'General Terms & Execution (Clauses 11–16)',
    icon: CheckCircle2,
    defaultPage: 3,
    description: 'Housekeeping, defect liability warranty, termination, and jurisdiction',
  },
  {
    id: 'signatures',
    label: 'Signature Blocks',
    icon: FileSignature,
    defaultPage: 3,
    description: 'Dual-party authorization & acceptance designations',
  },
];

export const DEFAULT_PAGE_TITLES: Record<number, string> = {
  1: 'Order & Scope Details',
  2: 'Clauses & Technical Specs',
  3: 'Compliance & Authorization',
};

// ==========================================
// QUOTATION BUILTIN SECTIONS (10 Pages)
// ==========================================
export const QUOTATION_BUILTIN_SECTIONS: BuiltinSectionDef[] = [
  {
    id: 'q_cover_info',
    label: 'Client & Offer Reference',
    icon: Building,
    defaultPage: 1,
    description: 'To / Client address, Reference No, Date',
  },
  {
    id: 'q_cover_intro',
    label: 'Offer Letter & Valued Enquiry',
    icon: FileText,
    defaultPage: 1,
    description: 'Subject, Introductory paragraphs & Signatory',
  },
  {
    id: 'q_tech_details',
    label: 'Technical Specifications Table',
    icon: Layers,
    defaultPage: 2,
    description: 'Building Size, Eave Height, Structure, Purlins & Sheeting',
  },
  {
    id: 'q_mat_specs',
    label: 'Material Specifications Table',
    icon: FileCheck,
    defaultPage: 3,
    description: 'TMT, Cement, Fasteners, Structural Steel Specifications',
  },
  {
    id: 'q_boq_items',
    label: 'Commercial BOQ & Pricing Table',
    icon: DollarSign,
    defaultPage: 4,
    description: 'Itemized description, price, total in INR & GST note',
  },
  {
    id: 'q_payment_terms_fab',
    label: 'Payment Terms (Fabrication)',
    icon: DollarSign,
    defaultPage: 4,
    description: 'Advance, procurement, dispatch and completion milestones',
  },
  {
    id: 'q_payment_terms_civil',
    label: 'Payment Terms (Civil Work)',
    icon: DollarSign,
    defaultPage: 4,
    description: 'Advance, foundation, column, slab & finish milestones',
  },
  {
    id: 'q_delivery_schedule',
    label: 'Delivery Schedule & Prerequisites',
    icon: Truck,
    defaultPage: 5,
    description: 'Project timeline milestones & Site readiness checklist',
  },
  {
    id: 'q_vendors',
    label: 'Approved Vendor List Table',
    icon: CheckCircle2,
    defaultPage: 6,
    description: 'Comprehensive approved make & brand list for all materials, roofing & accessories',
  },
  {
    id: 'q_taxes_notes',
    label: 'Taxes, Notes & Delivery Conditions',
    icon: FileSpreadsheet,
    defaultPage: 7,
    description: 'GST applicability, 6 key notes & site delivery requisites',
  },
  {
    id: 'q_terms_part1',
    label: 'Commercial Terms (Terms 1 to 7)',
    icon: ListOrdered,
    defaultPage: 8,
    description: 'Validity, Price Basis, Terms of Payment, Delay & Inspection',
  },
  {
    id: 'q_terms_part2',
    label: 'Commercial Terms (Terms 8 to 13)',
    icon: ListOrdered,
    defaultPage: 9,
    description: 'Force Majeure, Statutory Compliances, Termination & Arbitration',
  },
  {
    id: 'q_terms_part3',
    label: 'Commercial Terms (Terms 14 to 17)',
    icon: ListOrdered,
    defaultPage: 10,
    description: 'Site Clearance, Workmanship Guarantee, Insurance & Title',
  },
  {
    id: 'q_exclusions',
    label: 'Section 7: Scope of Exclusions',
    icon: ShieldAlert,
    defaultPage: 10,
    description: 'Explicit list of non-scope items (civil power, crane, permissions)',
  },
  {
    id: 'q_signatures',
    label: 'Special Notes & Dual Signatures',
    icon: FileSignature,
    defaultPage: 10,
    description: 'Special notes and Client / Company authorization acceptance block',
  },
];

export const QUOTATION_DEFAULT_PAGE_TITLES: Record<number, string> = {
  1: 'Page 1: Offer Letter & Subject',
  2: 'Page 2: Technical Specifications',
  3: 'Page 3: Material Specifications',
  4: 'Page 4: Commercial BOQ & Payment Terms',
  5: 'Page 5: Delivery Schedule & Timeline',
  6: 'Page 6: Approved Vendor List',
  7: 'Page 7: Taxes, Notes & Delivery',
  8: 'Page 8: Commercial Terms (1-7)',
  9: 'Page 9: Commercial Terms (8-13)',
  10: 'Page 10: Terms (14-17) & Exclusions',
};

export interface OutlineSectionItem {
  id: string;
  label: string;
  icon: any;
  isCustom: boolean;
  pageNumber: number;
  customData?: CustomSectionItem;
}

export interface OutlineGroup {
  pageNum: number;
  groupTitle: string;
  groupId: string;
  isCustomGroup: boolean;
  sections: OutlineSectionItem[];
}

/**
 * Gets the current page number of a section (either builtin or custom) for Purchase Order
 */
export function getSectionPageNumber(secId: string, po: PurchaseOrderData): number {
  if (po.sectionPageMap && po.sectionPageMap[secId] !== undefined) {
    return po.sectionPageMap[secId];
  }
  const custom = po.customSections?.find((s) => s.id === secId);
  if (custom) return custom.pageNumber;

  const builtin = BUILTIN_SECTIONS.find((b) => b.id === secId);
  return builtin ? builtin.defaultPage : 1;
}

/**
 * Generates all structured groups with their assigned sections for Purchase Order
 */
export function getDocumentOutlineGroups(po: PurchaseOrderData): OutlineGroup[] {
  const customPages: CustomPageDef[] = po.customPages || [];
  const customSections: CustomSectionItem[] = po.customSections || [];
  const hiddenSections = new Set<string>(po.hiddenSections || []);
  const deletedPages = new Set<number>(po.deletedPages || []);

  // Determine all available page numbers
  const pageNumbersSet = new Set<number>();
  [1, 2, 3].forEach((p) => {
    if (!deletedPages.has(p)) pageNumbersSet.add(p);
  });
  customPages.forEach((cp) => {
    if (!deletedPages.has(cp.pageNum)) pageNumbersSet.add(cp.pageNum);
  });
  customSections.forEach((cs) => {
    if (!hiddenSections.has(cs.id) && !deletedPages.has(cs.pageNumber)) {
      pageNumbersSet.add(cs.pageNumber);
    }
  });
  if (po.sectionPageMap) {
    Object.entries(po.sectionPageMap).forEach(([secId, p]) => {
      if (!hiddenSections.has(secId) && !deletedPages.has(p)) {
        pageNumbersSet.add(p);
      }
    });
  }

  // If all pages are deleted, provide at least one empty page
  if (pageNumbersSet.size === 0) {
    pageNumbersSet.add(1);
  }

  const sortedPageNumbers = Array.from(pageNumbersSet).sort((a, b) => a - b);

  // Build items list
  const allSections: OutlineSectionItem[] = [];

  // Add builtin sections (if not hidden/deleted)
  BUILTIN_SECTIONS.forEach((b) => {
    if (hiddenSections.has(b.id)) return;
    const pageNum = getSectionPageNumber(b.id, po);
    allSections.push({
      id: b.id,
      label: b.label,
      icon: b.icon,
      isCustom: false,
      pageNumber: pageNum,
    });
  });

  // Add custom sections (if not hidden/deleted)
  customSections.forEach((cs) => {
    if (hiddenSections.has(cs.id)) return;
    allSections.push({
      id: cs.id,
      label: cs.title,
      icon: BookmarkCheck,
      isCustom: true,
      pageNumber: cs.pageNumber,
      customData: cs,
    });
  });

  // If custom order exists in po.sectionOrder, sort by it
  if (po.sectionOrder && po.sectionOrder.length > 0) {
    const orderMap = new Map<string, number>();
    po.sectionOrder.forEach((id, idx) => orderMap.set(id, idx));

    allSections.sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
      const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
      const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
      return orderA - orderB;
    });
  }

  // Group by page number
  const groups: OutlineGroup[] = sortedPageNumbers.map((pNum) => {
    const customPageDef = customPages.find((cp) => cp.pageNum === pNum);
    const customTitle = po.pageTitles && po.pageTitles[pNum];
    const title = customTitle
      ? customTitle
      : customPageDef
      ? customPageDef.title
      : DEFAULT_PAGE_TITLES[pNum] || `Annexure: Page ${pNum}`;

    const sectionsForPage = allSections.filter((s) => s.pageNumber === pNum);

    return {
      pageNum: pNum,
      groupTitle: title,
      groupId: customPageDef ? customPageDef.id : `page_${pNum}`,
      isCustomGroup: !!customPageDef || pNum > 3,
      sections: sectionsForPage,
    };
  });

  return groups;
}

/**
 * Gets current page number of a section for Quotation
 */
export function getQuotationSectionPageNumber(secId: string, q: QuotationData): number {
  if (q.sectionPageMap && q.sectionPageMap[secId] !== undefined) {
    return q.sectionPageMap[secId];
  }
  if ((secId === 'q_vendors_part1' || secId === 'q_vendors_part2') && q.sectionPageMap && q.sectionPageMap['q_vendors'] !== undefined) {
    return q.sectionPageMap['q_vendors'];
  }
  const custom = q.customSections?.find((s) => s.id === secId);
  if (custom) return custom.pageNumber;

  const builtin = QUOTATION_BUILTIN_SECTIONS.find((b) => b.id === secId);
  if (builtin) return builtin.defaultPage;
  if (secId === 'q_vendors_part1') return 6;
  if (secId === 'q_vendors_part2') return 7;
  return 1;
}

/**
 * Generates all structured groups with their assigned sections for Quotation
 */
export function getQuotationOutlineGroups(q: QuotationData): OutlineGroup[] {
  const customPages: CustomPageDef[] = q.customPages || [];
  const customSections: CustomSectionItem[] = q.customSections || [];
  const hiddenSections = new Set<string>(q.hiddenSections || []);
  const deletedPages = new Set<number>(q.deletedPages || []);

  // Determine all available page numbers (1 to 10 by default)
  const pageNumbersSet = new Set<number>();
  for (let p = 1; p <= 10; p++) {
    if (!deletedPages.has(p)) pageNumbersSet.add(p);
  }
  customPages.forEach((cp) => {
    if (!deletedPages.has(cp.pageNum)) pageNumbersSet.add(cp.pageNum);
  });
  customSections.forEach((cs) => {
    if (!hiddenSections.has(cs.id) && !deletedPages.has(cs.pageNumber)) {
      pageNumbersSet.add(cs.pageNumber);
    }
  });
  if (q.sectionPageMap) {
    Object.entries(q.sectionPageMap).forEach(([secId, p]) => {
      if (!hiddenSections.has(secId) && !deletedPages.has(p)) {
        pageNumbersSet.add(p);
      }
    });
  }

  if (pageNumbersSet.size === 0) {
    pageNumbersSet.add(1);
  }

  const sortedPageNumbers = Array.from(pageNumbersSet).sort((a, b) => a - b);

  // Build items list
  const allSections: OutlineSectionItem[] = [];

  // Add builtin sections (if not hidden/deleted)
  QUOTATION_BUILTIN_SECTIONS.forEach((b) => {
    if (hiddenSections.has(b.id)) return;
    const pageNum = getQuotationSectionPageNumber(b.id, q);
    allSections.push({
      id: b.id,
      label: b.label,
      icon: b.icon,
      isCustom: false,
      pageNumber: pageNum,
    });
  });

  // Add custom sections (if not hidden/deleted)
  customSections.forEach((cs) => {
    if (hiddenSections.has(cs.id)) return;
    allSections.push({
      id: cs.id,
      label: cs.title,
      icon: BookmarkCheck,
      isCustom: true,
      pageNumber: cs.pageNumber,
      customData: cs,
    });
  });

  // If custom order exists in q.sectionOrder, sort by it
  if (q.sectionOrder && q.sectionOrder.length > 0) {
    const orderMap = new Map<string, number>();
    q.sectionOrder.forEach((id, idx) => orderMap.set(id, idx));

    allSections.sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
      const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
      const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
      return orderA - orderB;
    });
  }

  // Group by page number
  const groups: OutlineGroup[] = sortedPageNumbers.map((pNum) => {
    const customPageDef = customPages.find((cp) => cp.pageNum === pNum);
    const customTitle = q.pageTitles && q.pageTitles[pNum];
    const title = customTitle
      ? customTitle
      : customPageDef
      ? customPageDef.title
      : QUOTATION_DEFAULT_PAGE_TITLES[pNum] || `Annexure: Page ${pNum}`;

    const sectionsForPage = allSections.filter((s) => s.pageNumber === pNum);

    return {
      pageNum: pNum,
      groupTitle: title,
      groupId: customPageDef ? customPageDef.id : `page_${pNum}`,
      isCustomGroup: !!customPageDef || pNum > 10,
      sections: sectionsForPage,
    };
  });

  return groups;
}

/**
 * Moves any section (builtin or custom) to a target page and reorders it for Quotation
 */
export function moveQuotationSectionToPage(
  q: QuotationData,
  sourceSecId: string,
  targetPageNum: number,
  targetSecId?: string,
  insertAfter: boolean = true
): QuotationData {
  const currentMap = { ...(q.sectionPageMap || {}) };
  const currentSections = [...(q.customSections || [])];

  // Update page mapping
  const isCustom = currentSections.some((s) => s.id === sourceSecId);
  if (isCustom) {
    const customIdx = currentSections.findIndex((s) => s.id === sourceSecId);
    if (customIdx !== -1) {
      currentSections[customIdx] = {
        ...currentSections[customIdx],
        pageNumber: targetPageNum,
      };
    }
  } else {
    currentMap[sourceSecId] = targetPageNum;
  }

  // Update section order array
  let order = q.sectionOrder ? [...q.sectionOrder] : [];
  if (order.length === 0) {
    const allGroups = getQuotationOutlineGroups(q);
    order = allGroups.flatMap((g) => g.sections.map((s) => s.id));
  }

  order = order.filter((id) => id !== sourceSecId);

  if (targetSecId && targetSecId !== sourceSecId) {
    const targetIdx = order.indexOf(targetSecId);
    if (targetIdx !== -1) {
      order.splice(insertAfter ? targetIdx + 1 : targetIdx, 0, sourceSecId);
    } else {
      order.push(sourceSecId);
    }
  } else {
    order.push(sourceSecId);
  }

  return {
    ...q,
    sectionPageMap: currentMap,
    customSections: currentSections,
    sectionOrder: order,
  };
}

/**
 * Moves any section (builtin or custom) to a target page and reorders it
 */
export function moveSectionToPage(
  po: PurchaseOrderData,
  sourceSecId: string,
  targetPageNum: number,
  targetSecId?: string,
  insertAfter: boolean = true
): PurchaseOrderData {
  const currentMap = { ...(po.sectionPageMap || {}) };
  const currentSections = [...(po.customSections || [])];

  // Update page mapping
  const isCustom = currentSections.some((s) => s.id === sourceSecId);
  if (isCustom) {
    const customIdx = currentSections.findIndex((s) => s.id === sourceSecId);
    if (customIdx !== -1) {
      currentSections[customIdx] = {
        ...currentSections[customIdx],
        pageNumber: targetPageNum,
      };
    }
  } else {
    currentMap[sourceSecId] = targetPageNum;
  }

  // Update section order array
  let order = po.sectionOrder ? [...po.sectionOrder] : [];
  if (order.length === 0) {
    // initialize full current order
    const allGroups = getDocumentOutlineGroups(po);
    order = allGroups.flatMap((g) => g.sections.map((s) => s.id));
  }

  // Remove source
  order = order.filter((id) => id !== sourceSecId);

  // Insert relative to targetSecId or append to page's sections
  if (targetSecId && targetSecId !== sourceSecId) {
    const targetIdx = order.indexOf(targetSecId);
    if (targetIdx !== -1) {
      order.splice(insertAfter ? targetIdx + 1 : targetIdx, 0, sourceSecId);
    } else {
      order.push(sourceSecId);
    }
  } else {
    // Append at the end of that page's items in order
    order.push(sourceSecId);
  }

  return {
    ...po,
    sectionPageMap: currentMap,
    customSections: currentSections,
    sectionOrder: order,
  };
}

/**
 * Moves a section UP within its page in PurchaseOrderData
 */
export function moveSectionUp(po: PurchaseOrderData, secId: string): PurchaseOrderData {
  const groups = getDocumentOutlineGroups(po);
  const currentGroup = groups.find((g) => g.sections.some((s) => s.id === secId));
  if (!currentGroup) return po;

  const secIdx = currentGroup.sections.findIndex((s) => s.id === secId);
  if (secIdx <= 0) return po;

  const prevSec = currentGroup.sections[secIdx - 1];
  return moveSectionToPage(po, secId, currentGroup.pageNum, prevSec.id, false);
}

/**
 * Moves a section DOWN within its page in PurchaseOrderData
 */
export function moveSectionDown(po: PurchaseOrderData, secId: string): PurchaseOrderData {
  const groups = getDocumentOutlineGroups(po);
  const currentGroup = groups.find((g) => g.sections.some((s) => s.id === secId));
  if (!currentGroup) return po;

  const secIdx = currentGroup.sections.findIndex((s) => s.id === secId);
  if (secIdx === -1 || secIdx >= currentGroup.sections.length - 1) return po;

  const nextSec = currentGroup.sections[secIdx + 1];
  return moveSectionToPage(po, secId, currentGroup.pageNum, nextSec.id, true);
}

/**
 * Moves a section UP within its page in QuotationData
 */
export function moveQuotationSectionUp(q: QuotationData, secId: string): QuotationData {
  const groups = getQuotationOutlineGroups(q);
  const currentGroup = groups.find((g) => g.sections.some((s) => s.id === secId));
  if (!currentGroup) return q;

  const secIdx = currentGroup.sections.findIndex((s) => s.id === secId);
  if (secIdx <= 0) return q;

  const prevSec = currentGroup.sections[secIdx - 1];
  return moveQuotationSectionToPage(q, secId, currentGroup.pageNum, prevSec.id, false);
}

/**
 * Moves a section DOWN within its page in QuotationData
 */
export function moveQuotationSectionDown(q: QuotationData, secId: string): QuotationData {
  const groups = getQuotationOutlineGroups(q);
  const currentGroup = groups.find((g) => g.sections.some((s) => s.id === secId));
  if (!currentGroup) return q;

  const secIdx = currentGroup.sections.findIndex((s) => s.id === secId);
  if (secIdx === -1 || secIdx >= currentGroup.sections.length - 1) return q;

  const nextSec = currentGroup.sections[secIdx + 1];
  return moveQuotationSectionToPage(q, secId, currentGroup.pageNum, nextSec.id, true);
}

