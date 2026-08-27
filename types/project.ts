import { LatexDocument } from './document';

export interface CompanyProfile {
  companyName: string;
  companySubtitle: string;
  companyAddressHeader: string;
  companyAddressFooter: string;
  companyGstNo: string;
  companyPanNo: string;
  companyEpfNo: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  leftServices: string[];
  rightServices: string[];
}

export type ProjectDocType =
  | 'quotation'
  | 'work_order'
  | 'purchase_order'
  | 'invoice'
  | 'technical_specs'
  | 'contract'
  | 'custom';

export type ProjectDocStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'sent'
  | 'signed'
  | 'paid';

export type ProjectStatus =
  | 'active'
  | 'in_progress'
  | 'under_review'
  | 'completed'
  | 'archived';

export interface ProjectDocumentItem {
  id: string;
  title: string;
  docType: ProjectDocType;
  docNumber: string;
  status: ProjectDocStatus;
  amount?: string;
  createdAt?: string;
  lastModified: string;
  author?: string;
  description?: string;
  document: LatexDocument;
}

export interface ProjectTag {
  label: string;
  color: string; // hex color like '#ef4444'
}

export interface ProjectItem {
  id: string;
  title: string;
  code?: string;
  clientName?: string;
  clientAddress?: string;
  clientGstNo?: string;
  contactPerson?: string;
  location?: string;
  category?: string;
  status?: ProjectStatus;
  budget?: string;
  owner: string;
  lastModified: string;
  tags: (string | ProjectTag)[];
  isArchived?: boolean;
  isFavourite?: boolean;
  documents?: ProjectDocumentItem[];
  document?: LatexDocument;
  companyProfile?: CompanyProfile;
}
