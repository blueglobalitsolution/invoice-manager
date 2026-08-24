import { LatexDocument, PurchaseOrderData, TaxInvoiceData } from '@/types/document';
import { ProjectDocType, ProjectDocumentItem } from '@/types/project';
import { LABOUR_PO_TEMPLATE, TAX_INVOICE_TEMPLATE, QUOTATION_TEMPLATE } from './templates';

export interface DocTemplateDefinition {
  type: ProjectDocType;
  name: string;
  badge: string;
  description: string;
  iconName: string;
  defaultPrefix: string;
  defaultAmount: string;
}

export const PROJECT_DOC_TEMPLATES: DocTemplateDefinition[] = [
  {
    type: 'quotation',
    name: 'Commercial Quotation / Bid Proposal',
    badge: 'Quotation',
    description: 'Detailed commercial offer with itemized BOQ, material rates, payment schedule, and terms.',
    iconName: 'FileSpreadsheet',
    defaultPrefix: 'GI/QT',
    defaultAmount: '₹8,45,000.00',
  },
  {
    type: 'work_order',
    name: 'Civil Labour Contract Work Order',
    badge: 'Work Order',
    description: 'Standard 3-page labour PO with scope matrix, lumpsum rate terms, measurement & safety rules.',
    iconName: 'FileCheck',
    defaultPrefix: 'GI/WORK',
    defaultAmount: '₹4,70,000.00',
  },

  {
    type: 'invoice',
    name: 'Tax Invoice & RA Billing Summary',
    badge: 'Tax Invoice',
    description: 'Running Account (RA) bill with milestone stage certification, retention deductions, and GST.',
    iconName: 'Receipt',
    defaultPrefix: 'GI/INV',
    defaultAmount: '₹3,50,000.00',
  },
  {
    type: 'custom',
    name: 'Blank Document (Global)',
    badge: 'Blank',
    description: 'A global blank document template for general-purpose use.',
    iconName: 'FileText',
    defaultPrefix: 'GI/DOC',
    defaultAmount: '₹0.00',
  }
];

/**
 * Creates a project document prepopulated with project context
 */
export function createProjectDocument(
  docType: ProjectDocType,
  projectInfo: {
    title: string;
    clientName?: string;
    location?: string;
    code?: string;
  },
  customTitle?: string,
  customNumber?: string,
  customAmount?: string
): ProjectDocumentItem {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const year = now.getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const docId = `doc_${docType}_${Date.now()}`;

  let docNumber = customNumber || '';
  let docTitle = customTitle || '';
  let docAmount = customAmount || '₹0.00';
  let initialLatexDoc: LatexDocument;

  const client = projectInfo.clientName || 'Mohammad Kamil Shaikh';
  const projectName = projectInfo.title || 'Civil Construction Project';
  const location = projectInfo.location || 'Sevasi TP-1, Vadodara, Gujarat';

  switch (docType) {
    case 'quotation': {
      docNumber = `GI/QT/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Commercial Quotation - ${projectName}`;
      docAmount = '₹8,45,000.00';

      const qData = JSON.parse(JSON.stringify(QUOTATION_TEMPLATE.quotation!));
      qData.toRecipient = client;
      qData.toAddress = location;
      qData.refNo = docNumber;
      qData.date = dateStr;

      initialLatexDoc = {
        ...JSON.parse(JSON.stringify(QUOTATION_TEMPLATE)),
        id: docId,
        title: docTitle,
        subtitle: docNumber,
        date: dateStr,
        quotation: qData,
      };
      break;
    }

    case 'work_order': {
      docNumber = `GI/CIVIL/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Civil Labour Contract Work Order - ${projectName}`;
      docAmount = '₹4,70,000.00';

      const poData = JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE.purchaseOrder!));
      poData.contractorName = client;
      poData.projectName = projectName;
      poData.projectLocation = location;
      poData.poNumber = docNumber;
      poData.poDate = dateStr;

      initialLatexDoc = {
        ...JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE)),
        id: docId,
        title: docTitle,
        subtitle: docNumber,
        date: dateStr,
        purchaseOrder: poData,
        settings: {
          ...LABOUR_PO_TEMPLATE.settings,
          accentColor: '#15803d', // Forest Green for Work Orders
        },
      };
      break;
    }

    case 'purchase_order': {
      docNumber = `GI/PO/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Material Purchase Order - ${projectName}`;
      docAmount = '₹14,20,000.00';

      const poData: PurchaseOrderData = {
        ...JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE.purchaseOrder!)),
        contractorName: client,
        projectName: projectName,
        projectLocation: location,
        poNumber: docNumber,
        poDate: dateStr,
        scopeOfWork: [
          'Supply of IS 2062 Grade E250 Steel Beams & Columns',
          'Supply of High Tensile Grade 8.8 Structural Bolts, Nuts & Washers',
          'Supply of Self-Drilling Screws with EPDM Washers (Class 3)',
          'Supply of 50mm PUF Sandwich Panels (Density 40 ± 2 kg/m³)',
          'Supply of Color Coated Flashing, Gutters & Downspouts',
        ],
        rateItems: [
          {
            id: 'mat_1',
            description: 'Pre-Engineered Building Structural Steel Frames (Columns, Rafters, Bracings) with factory red oxide primer.',
            unit: 'MT',
            qty: '18.0 MT',
            rate: '₹68,500 / MT',
            total: '1233000.00',
          },
          {
            id: 'mat_2',
            description: 'Roof & Wall PUF Insulation Panels (50mm thick, 0.45mm pre-painted top/bottom Galvalume sheet).',
            unit: 'Sq. Mtr',
            qty: '420 Sq.M',
            rate: '₹1,150 / Sq.M',
            total: '483000.00',
          },
          {
            id: 'mat_3',
            description: 'Galvanized Cold-Rolled Z Purlins (Z200 x 65 x 20 x 2.0mm).',
            unit: 'MT',
            qty: '3.5 MT',
            rate: '₹76,000 / MT',
            total: '266000.00',
          },
        ],
        amountInWords: 'Rupees Nineteen Lakh Eighty-Two Thousand Only',
        scopeOfContractor: [
          '1. Quality Standard: All materials must be accompanied by Manufacturer Test Certificates (MTC) for chemical and physical properties.',
          '2. Inspection: Inspection will be conducted at vendor works prior to dispatch by Global Industries QA representative.',
          '3. Delivery Location: Site unloading bay at ' + location + '.',
        ],
        paymentTerms: [
          '1. 20% mobilization advance against submission of Bank Guarantee / Proforma.',
          '2. 70% against dispatch documents and proof of LR (Lorry Receipt).',
          '3. 10% after physical verification and quality clearance at site.',
        ],
        termsAndConditions: [
          '1. Delivery Date: Delivery must be completed within 21 days from purchase order acceptance.',
          '2. Liquidated Damages: 1% per week of delay subject to a maximum of 10% of PO value.',
          '3. Rejections: Any material not conforming to specifications shall be replaced at vendor cost within 5 working days.',
        ],
        page3Terms: [
          '4. Taxes: GST @ 18% applicable extra. E-Way bill must accompany transport vehicle.',
        ],
      };

      initialLatexDoc = {
        ...JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE)),
        id: docId,
        title: docTitle,
        subtitle: docNumber,
        date: dateStr,
        purchaseOrder: poData,
        settings: {
          ...LABOUR_PO_TEMPLATE.settings,
          accentColor: '#334155', // Charcoal Slate
        },
      };
      break;
    }

    case 'invoice': {
      docNumber = `TI/${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}/${randomSuffix.toString().padStart(5, '0')}`;
      if (!docTitle) docTitle = `Tax Invoice - ${projectName}`;
      docAmount = '₹4,71,731.00';

      const taxInvData: TaxInvoiceData = {
        ...JSON.parse(JSON.stringify(TAX_INVOICE_TEMPLATE.taxInvoice!)),
        clientName: `M/s. ${client},`,
        projectName: projectName,
        invoiceNo: docNumber,
        invoiceDate: dateStr,
      };

      initialLatexDoc = {
        ...JSON.parse(JSON.stringify(TAX_INVOICE_TEMPLATE)),
        id: docId,
        title: `TAX-INVOICE - ${client}`,
        subtitle: docNumber,
        date: dateStr,
        taxInvoice: taxInvData,
      };
      break;
    }

    case 'technical_specs': {
      docNumber = `GI/SPEC/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Technical Specifications Annexure - ${projectName}`;
      docAmount = 'N/A';

      const poData: PurchaseOrderData = {
        ...JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE.purchaseOrder!)),
        contractorName: client,
        projectName: projectName,
        projectLocation: location,
        poNumber: docNumber,
        poDate: dateStr,
        scopeOfWork: [
          '1. Structural Steel: IS 2062 Grade E250 / E350 with yield strength >= 250/350 MPa.',
          '2. Cold-Formed Sections: High tensile steel conform to IS 801 / ASTM A653 with 275 GSM galvanizing.',
          '3. Roof & Wall Sheeting: 550 MPa yield Galvalume with AZ150 coating (55% Al, 43.4% Zn, 1.6% Si).',
          '4. Fasteners: Hex head self-drilling screws Class 3 with integrated EPDM bonded washers.',
          '5. Tolerances: Deflection limits as per IS 800:2007 (Main frame L/180, Purlins L/150).',
          '6. Welding: Submerged Arc Welding (SAW) for built-up and Shielded Metal Arc Welding (SMAW) as per AWS D1.1.',
        ],
        rateItems: [
          {
            id: 'spec_1',
            description: 'Engineering Design & Fabrication Quality Specification Annexure A-1',
            unit: 'Document',
            qty: '1 Set',
            rate: 'Included',
            total: '0.00',
          },
        ],
        amountInWords: 'Quality & Technical Compliance Document',
        scopeOfContractor: [
          '1. QA/QC Plan: Contractor shall submit detailed Weld Procedure Specifications (WPS) and Welder Qualification Records.',
          '2. Non-Destructive Testing (NDT): 100% visual inspection and 10% Ultrasonic Testing (UT) of butt welds.',
          '3. Surface Preparation: Structural steel shall be shot blasted to SA 2.5 standard before applying primer.',
        ],
        paymentTerms: [
          'Technical Annexure forms an integral part of the primary contract agreement.',
        ],
        termsAndConditions: [
          '1. All materials subject to third-party lab verification if deemed necessary by the Engineer-in-Charge.',
          '2. Any variation from approved specifications requires written engineering deviation permit.',
        ],
        page3Terms: [],
      };

      initialLatexDoc = {
        ...JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE)),
        id: docId,
        title: docTitle,
        subtitle: docNumber,
        date: dateStr,
        purchaseOrder: poData,
        settings: {
          ...LABOUR_PO_TEMPLATE.settings,
          accentColor: '#059669', // Emerald Teal
        },
      };
      break;
    }

    default: {
      docNumber = `GI/DOC/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Document - ${projectName}`;
      docAmount = '₹0.00';

      const poData = JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE.purchaseOrder!));
      poData.contractorName = client;
      poData.projectName = projectName;
      poData.projectLocation = location;
      poData.poNumber = docNumber;
      poData.poDate = dateStr;

      initialLatexDoc = {
        ...JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE)),
        id: docId,
        title: docTitle,
        subtitle: docNumber,
        date: dateStr,
        purchaseOrder: poData,
      };
      break;
    }
  }

  return {
    id: docId,
    title: docTitle,
    docType,
    docNumber,
    status: 'draft',
    amount: docAmount,
    createdAt: dateStr,
    lastModified: 'Just now by You',
    author: 'You',
    description: `${PROJECT_DOC_TEMPLATES.find((t) => t.type === docType)?.name || 'Document'} for ${projectName}`,
    document: initialLatexDoc,
  };
}
