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

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'GLOBAL',
  companySubtitle: 'INDUSTRIES',
  companyAddressHeader: 'Regd. Off. : SO7B / 2nd floor, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara, Gujarat - 391243',
  companyAddressFooter: 'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243',
  companyGstNo: '24CLNPS9550H1ZI',
  companyPanNo: 'CLNPS9550H',
  companyEpfNo: 'GJ/VAD/1234567/000',
  companyPhone: '+91 97254 45370',
  companyEmail: 'info@globalindustries.co',
  companyWebsite: 'www.globalindustries.co',
  leftServices: [
    '• Pre Engineering Building',
    '• Roofing Solution',
    '• Engineering Project & Designing',
    '• "Z" & "C" Purlins',
  ],
  rightServices: [
    '• Infra Materials',
    '• Puf Panels & Insulation Roofing',
    '• Skylight Sheets',
    '• Air Ventilators',
  ],
};

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
