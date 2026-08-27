export interface Author {
  id: string;
  name: string;
  affiliation: string;
  email: string;
}

export interface Subsection {
  id: string;
  title: string;
  contentType: 'paragraph' | 'bullet_list' | 'equation' | 'theorem' | 'figure' | 'table';
  body?: string;
  bullets?: string[];
  equationRefId?: string;
  theoremType?: string;
  figureRefId?: string;
  tableRefId?: string;
}

export interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

export interface EquationItem {
  id: string;
  latex: string;
  label: string;
  explanation?: string;
}

export interface FigureItem {
  id: string;
  imageUrl: string;
  caption: string;
  label: string;
  widthPercentage: number;
}

export interface TableColumn {
  id: string;
  header: string;
  align: 'left' | 'center' | 'right';
}

export interface TableData {
  id: string;
  caption: string;
  label: string;
  columns: TableColumn[];
  rows: Record<string, string>[];
}

export interface ReferenceItem {
  id: string;
  citeKey: string;
  title: string;
  authors: string;
  year: string;
  journalOrBook: string;
  doiOrUrl?: string;
}

export type PaperSize = 'a4paper' | 'letterpaper';
export type FontSize = '10pt' | '11pt' | '12pt';
export type ColumnMode = 'onecolumn' | 'twocolumn';
export type FontFamily = 'times' | 'helvetica' | 'latin-modern' | 'computer-modern';
export type MarginSize = 'compact' | 'normal' | 'wide';

export interface DocumentSettings {
  paperSize: PaperSize;
  fontSize: FontSize;
  columns: ColumnMode;
  fontFamily: FontFamily;
  margins: MarginSize;
  showPageNumbers: boolean;
  showDate: boolean;
  accentColor: string;
}

export interface PORateItem {
  id: string;
  description: string;
  unit: string;
  qty: string;
  rate: string;
  total: string;
}

export type SectionContentType =
  | 'bullet_list'
  | 'paragraphs'
  | 'table'
  | 'legal_clause'
  | 'key_value'
  | 'callout';

export interface KeyValuePairItem {
  id?: string;
  key: string;
  value: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  pageNumber: number;
  contentType: SectionContentType;
  bullets?: string[];
  paragraphs?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
  keyValuePairs?: KeyValuePairItem[];
  calloutText?: string;
  calloutType?: 'info' | 'warning' | 'important';
}

export interface CustomPageDef {
  id: string;
  pageNum: number;
  title: string;
  includeLetterHeader: boolean;
  includeLetterFooter: boolean;
}

export interface PurchaseOrderData {
  companyName: string;
  companySubtitle: string;
  companyAddress: string[];
  gstNo: string;
  companyPhone: string;
  companyAddressFooter: string;
  companyEmail: string;
  companyWebsite: string;
  leftServices: string[];
  rightServices: string[];
  
  contractorName: string;
  projectName: string;
  projectLocation: string;
  poNumber: string;
  poDate: string;
  
  // Specific to PO Info Table (left column)
  tableCompanyName?: string;
  tableCompanySubtitle?: string;
  tableCompanyAddress?: string[];
  
  scopeOfWork: string[];
  rateItems: PORateItem[];
  amountInWords: string;
  
  scopeOfContractor: string[];
  paymentTerms: string[];
  measurementClause: string[];
  termsAndConditions: string[];
  page3Terms: string[];
  
  signatoryCompany: string;
  signatoryContractor: string;

  // Custom pages & sections & reordering & visibility
  customPages?: CustomPageDef[];
  customSections?: CustomSectionItem[];
  sectionPageMap?: Record<string, number>;
  sectionOrder?: string[];
  hiddenSections?: string[];
  deletedPages?: number[];
  pageTitles?: Record<number, string>;
}

export interface TaxInvoiceItem {
  id: string;
  srNo: string;
  description: string;
  hsn: string;
  qty: string;
  rate: string;
  total: string;
}

export interface TaxInvoiceData {
  companyName: string;
  companySubtitle: string;
  companyAddressFooter: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyGstNo: string;
  companyAddressHeader: string;
  companyPanNo?: string;
  companyEpfNo?: string;
  leftServices: string[];
  rightServices: string[];

  // Client Details
  clientName: string;
  clientAddressLine1: string;
  clientAddressLine2: string;
  clientGstNo: string;

  // Invoice Numbers & Dates
  invoiceNo: string;
  invoiceDate: string;
  poNo: string;
  poDate: string;
  projectName: string;

  // Items and Amounts
  items: TaxInvoiceItem[];
  totalAmount: string;
  sgstRate: string; // e.g. "9%"
  sgstAmount: string;
  cgstRate: string; // e.g. "9%"
  cgstAmount: string;
  netAmount: string;
  amountInWords: string;
  finalAmount: string;

  // Terms and Bank Details
  termsLines?: string[];
  bankDetails?: {
    bankName: string;
    ifsc: string;
    accountNo: string;
    branch: string;
  };

  signatoryCompany?: string;
}

export interface QuotationTechnicalItem {
  label: string;
  value: string;
}

export interface QuotationSpecItem {
  title: string;
  details: string;
}

export interface QuotationCommercialItem {
  description: string;
  price: string;
}

export interface QuotationVendorItem {
  srNo: string;
  description: string;
  brand: string;
}

export interface QuotationCommercialTerm {
  number: number;
  title: string;
  content: string;
  subItems?: string[];
  note?: string;
}

export interface QuotationData {
  companyName: string;
  companySubtitle: string;
  companyAddressFooter: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  companyGstNo: string;
  companyAddressHeader: string;
  leftServices: string[];
  rightServices: string[];

  // Page 1: Cover & Greeting
  toRecipient: string;
  toAddress: string;
  refNo: string;
  date: string;
  subjectTitle: string;
  introParagraphs: string[];
  signatoryName: string;
  signatoryPhones: string[];

  // Page 2: Technical Details
  technicalDetails: QuotationTechnicalItem[];

  // Page 3: Material Specifications
  specifications: QuotationSpecItem[];

  // Page 4: Commercial BOQ & Payment Terms
  commercialSubtitle: string;
  commercialItems: QuotationCommercialItem[];
  totalPriceInInr: string;
  subTotal: string;
  amountInWords: string;
  gstNote: string;
  paymentTermsFab: string[];
  paymentTermsCivil: string[];

  // Page 5: Delivery Schedule
  deliverySchedule: string[];

  // Page 6 & 7: Approved Vendor List & Notes
  vendorList: QuotationVendorItem[];
  taxNote: string;
  notes: string[];
  deliveryChecklist: string[];
  deliveryNotes: string;

  // Page 8, 9, 10: Commercial Terms, Exclusions, Special Notes
  commercialTerms: QuotationCommercialTerm[];
  exclusions: string[];
  specialNotes: string[];
  finalSignatoryCompany: string;
  finalSignatoryTitle: string;

  // Custom pages & sections & reordering & visibility
  customPages?: CustomPageDef[];
  customSections?: CustomSectionItem[];
  sectionPageMap?: Record<string, number>;
  sectionOrder?: string[];
  hiddenSections?: string[];
  deletedPages?: number[];
  pageTitles?: Record<number, string>;
}

export interface LatexDocument {
  id: string;
  title: string;
  subtitle?: string;
  authors: Author[];
  date: string;
  abstract: string;
  keywords: string[];
  sections: Section[];
  equations: EquationItem[];
  figures: FigureItem[];
  tables: TableData[];
  references: ReferenceItem[];
  settings: DocumentSettings;
  purchaseOrder?: PurchaseOrderData;
  taxInvoice?: TaxInvoiceData;
  quotation?: QuotationData;
  dynamicTemplate?: any; // Avoiding circular/complex imports for now or use proper import
  globalVariables?: Record<string, string>;
}
