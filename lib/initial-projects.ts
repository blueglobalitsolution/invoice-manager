import { ProjectItem } from '@/types/project';
import { createProjectDocument } from './project-doc-templates';
import { LABOUR_PO_TEMPLATE } from './templates';

// Pre-populate realistic projects, each with multiple related documents
const prj1Info = {
  title: 'Sevasi Commercial Complex & Warehouse Project',
  clientName: 'Mohammad Kamil Shaikh',
  location: 'Sevasi TP-1, Vadodara, Gujarat',
  code: 'GI-PRJ-2026-01',
};

const doc1_1 = createProjectDocument('quotation', prj1Info, 'Commercial Quotation - PEB Shed & Civil Work');
doc1_1.docNumber = 'GI/QT/2026/101';
doc1_1.status = 'approved';
doc1_1.amount = '₹8,45,000.00';

const doc1_2 = createProjectDocument('work_order', prj1Info, 'GLOBAL INDUSTRIES CIVIL LABOUR CONTRACT WORK ORDER');
doc1_2.docNumber = 'GI/CIVIL/2026/101';
doc1_2.status = 'signed';
doc1_2.amount = '₹4,70,000.00';
doc1_2.document = JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE)); // Use the verified Labour PO

const doc1_3 = createProjectDocument('purchase_order', prj1Info, 'PEB Structural Steel & Roofing Material PO');
doc1_3.docNumber = 'GI/PO/2026/101';
doc1_3.status = 'sent';
doc1_3.amount = '₹14,20,000.00';

const doc1_4 = createProjectDocument('invoice', prj1Info, 'Running Account Tax Invoice RA-01');
doc1_4.docNumber = 'GI/INV/2026/101';
doc1_4.status = 'paid';
doc1_4.amount = '₹3,50,000.00';

const doc1_5 = createProjectDocument('technical_specs', prj1Info, 'Technical Specifications & Quality Assurance Annexure');
doc1_5.docNumber = 'GI/SPEC/2026/101';
doc1_5.status = 'approved';

// Project 2: Tata Motors Industrial Shed
const prj2Info = {
  title: 'Tata Motors Sanand Plant Extension - Bay 4 Shed',
  clientName: 'Tata Motors Heavy Engineering',
  location: 'Sanand GIDC, Ahmedabad, Gujarat',
  code: 'GI-PRJ-2026-02',
};

const doc2_1 = createProjectDocument('quotation', prj2Info, 'Comprehensive PEB Structure & Heavy Crane Shed Quotation');
doc2_1.docNumber = 'GI/QT/2026/204';
doc2_1.status = 'sent';
doc2_1.amount = '₹52,80,000.00';

const doc2_2 = createProjectDocument('work_order', prj2Info, 'Structural Erection & Foundation Civil Work Order');
doc2_2.docNumber = 'GI/CIVIL/2026/204';
doc2_2.status = 'draft';
doc2_2.amount = '₹18,40,000.00';

const doc2_3 = createProjectDocument('technical_specs', prj2Info, 'Industrial Tolerances & AWS Welding Standard Annexure');
doc2_3.docNumber = 'GI/SPEC/2026/204';
doc2_3.status = 'under_review';

// Project 3: Sterling Biotech Pharma Warehouse
const prj3Info = {
  title: 'Sterling Biotech Por GIDC Manufacturing Unit',
  clientName: 'Sterling Biotech Pharma Ltd',
  location: 'Por Ramangamdi Road, Vadodara',
  code: 'GI-PRJ-2026-03',
};

const doc3_1 = createProjectDocument('quotation', prj3Info, 'PUF Insulation & Cleanroom Roofing Quotation');
doc3_1.docNumber = 'GI/QT/2026/305';
doc3_1.status = 'approved';
doc3_1.amount = '₹16,50,000.00';

const doc3_2 = createProjectDocument('purchase_order', prj3Info, 'High Tensile Galvalume Sheet & PUF Panel Material PO');
doc3_2.docNumber = 'GI/PO/2026/305';
doc3_2.status = 'signed';
doc3_2.amount = '₹11,50,000.00';

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_sevasi',
    title: 'Sevasi Commercial Complex & Warehouse Project',
    code: 'GI-PRJ-2026-01',
    clientName: 'Mohammad Kamil Shaikh',
    location: 'Sevasi TP-1, Vadodara, Gujarat',
    category: 'Civil & PEB Construction',
    status: 'active',
    budget: '₹35,00,000.00',
    owner: 'You',
    lastModified: 'Just now by You',
    tags: ['Civil', 'PEB', 'Vadodara', 'Global Industries'],
    isArchived: false,
    documents: [doc1_1, doc1_2, doc1_3, doc1_4, doc1_5],
    document: doc1_2.document, // active doc fallback
  },
  {
    id: 'proj_tata',
    title: 'Tata Motors Sanand Plant Extension - Bay 4 Shed',
    code: 'GI-PRJ-2026-02',
    clientName: 'Tata Motors Heavy Engineering',
    location: 'Sanand GIDC, Ahmedabad, Gujarat',
    category: 'Industrial Infrastructure',
    status: 'in_progress',
    budget: '₹75,00,000.00',
    owner: 'You',
    lastModified: 'Yesterday by You',
    tags: ['Industrial', 'Sanand', 'PEB Structure'],
    isArchived: false,
    documents: [doc2_1, doc2_2, doc2_3],
    document: doc2_1.document,
  },
  {
    id: 'proj_sterling',
    title: 'Sterling Biotech Por GIDC Manufacturing Unit',
    code: 'GI-PRJ-2026-03',
    clientName: 'Sterling Biotech Pharma Ltd',
    location: 'Por Ramangamdi Road, Vadodara',
    category: 'PEB & Cleanroom Roofing',
    status: 'active',
    budget: '₹28,00,000.00',
    owner: 'You',
    lastModified: '3 days ago by You',
    tags: ['Pharma', 'Cleanroom', 'PUF Panels'],
    isArchived: false,
    documents: [doc3_1, doc3_2],
    document: doc3_1.document,
  },
];
