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
    clientAddress?: string;
    clientGstNo?: string;
    contactPerson?: string;
    location?: string;
    code?: string;
  },
  customTitle?: string,
  customNumber?: string,
  customAmount?: string,
  documentFields?: Record<string, string>
): ProjectDocumentItem {
  const now = new Date();
  const dateStr = documentFields?.DOC_DATE || now.toLocaleDateString('en-GB'); // DD/MM/YYYY
  const year = now.getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const docId = `doc_${docType}_${Date.now()}`;

  let docNumber = customNumber || '';
  let docTitle = customTitle || '';
  let docAmount = customAmount || '₹0.00';
  let initialLatexDoc: LatexDocument;

  const client = projectInfo.clientName || 'M/s. ALEMBIC LTD';
  const projectName = projectInfo.title || 'Civil Construction Project';
  const location = projectInfo.location || 'Sevasi TP-1, Vadodara, Gujarat';
  const clientAddr = projectInfo.clientAddress || 'Alembic Road, Gorwa, Vadodara, Gujarat';
  const clientGst = projectInfo.clientGstNo || '24AABCA7950P1ZB';
  const contact = projectInfo.contactPerson || 'Mr. Apurvabhai Patel';

  switch (docType) {
    case 'quotation': {
      if (!docNumber) docNumber = `GI-PRE-FAB-EQ-${randomSuffix}/1002`;
      if (!docTitle) docTitle = `Commercial Quotation - ${projectName}`;
      if (!docAmount || docAmount === '₹0.00') docAmount = '₹8,45,000.00';

      const qData = JSON.parse(JSON.stringify(QUOTATION_TEMPLATE.quotation!));
      qData.toRecipient = contact ? `${contact}` : client;
      qData.toAddress = `${clientAddr}`;
      qData.refNo = docNumber;
      qData.date = dateStr;
      if (documentFields?.SUBJECT_LINE) {
        qData.subject = documentFields.SUBJECT_LINE;
      }

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
      if (!docNumber) docNumber = `GI/CIVIL/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Civil Labour Contract Work Order - ${projectName}`;
      if (!docAmount || docAmount === '₹0.00') docAmount = '₹4,70,000.00';

      const poData = JSON.parse(JSON.stringify(LABOUR_PO_TEMPLATE.purchaseOrder!));
      poData.contractorName = documentFields?.CONTRACTOR_NAME || client;
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
      if (!docNumber) docNumber = `GI/PO/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Material Purchase Order - ${projectName}`;
      if (!docAmount || docAmount === '₹0.00') docAmount = '₹14,20,000.00';

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
      if (!docNumber) docNumber = `TI/${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}/${randomSuffix.toString().padStart(5, '0')}`;
      if (!docTitle) docTitle = `Tax Invoice - ${projectName}`;
      if (!docAmount || docAmount === '₹0.00') docAmount = '₹4,71,731.00';

      const taxInvData: TaxInvoiceData = {
        ...JSON.parse(JSON.stringify(TAX_INVOICE_TEMPLATE.taxInvoice!)),
        clientName: client.startsWith('M/s.') ? `${client},` : `M/s. ${client},`,
        clientAddress: clientAddr.split(', ').map(s => s.trim()),
        clientGst: clientGst,
        projectName: projectName,
        invoiceNo: docNumber,
        invoiceDate: dateStr,
        poNo: documentFields?.CLIENT_PO_NUMBER || '1300000567',
        poDate: documentFields?.CLIENT_PO_DATE || dateStr,
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

    case 'custom': {
      docNumber = customNumber || `GI/DOC/${year}/${randomSuffix}`;
      if (!docTitle) docTitle = `Generic Document - ${projectName}`;
      docAmount = customAmount || '₹0.00';
      
      const { SAMPLE_GENERIC_TEMPLATE } = require('@/lib/sample_template');

      initialLatexDoc = {
        id: docId,
        title: docTitle,
        authors: [],
        date: dateStr,
        abstract: '',
        keywords: [],
        sections: [],
        equations: [],
        figures: [],
        tables: [],
        references: [],
        settings: {
          paperSize: 'a4paper',
          fontSize: '11pt',
          columns: 'onecolumn',
          fontFamily: 'times',
          margins: 'normal',
          showPageNumbers: true,
          showDate: true,
          accentColor: '#000000',
        },
        dynamicTemplate: {
          templateId: SAMPLE_GENERIC_TEMPLATE.id,
          data: {
            ...SAMPLE_GENERIC_TEMPLATE.defaults,
            subject: docTitle,
            toName: client,
            toAddress: location,
            refNo: docNumber,
          }
        }
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

/**
 * Syncs project master settings (Company Profile, Client Info, Project Details)
 * across all existing documents in a project.
 */
export function syncProjectMasterToDocuments(project: import('@/types/project').ProjectItem): ProjectDocumentItem[] {
  const docs = project.documents || [];
  const cp = project.companyProfile;
  const clientName = project.clientName || '';
  const clientAddr = project.clientAddress || '';
  const clientGst = project.clientGstNo || '';
  const contact = project.contactPerson || '';
  const projectName = project.title || '';
  const location = project.location || '';

  return docs.map((docItem) => {
    if (!docItem.document) return docItem;

    const doc = JSON.parse(JSON.stringify(docItem.document)) as LatexDocument;

    // 1. Sync Purchase Order / Work Order
    if (doc.purchaseOrder) {
      if (clientName) doc.purchaseOrder.contractorName = clientName;
      if (projectName) doc.purchaseOrder.projectName = projectName;
      if (location) doc.purchaseOrder.projectLocation = location;

      if (cp) {
        if (cp.companyName) {
          doc.purchaseOrder.companyName = cp.companyName;
          doc.purchaseOrder.tableCompanyName = cp.companyName;
        }
        if (cp.companySubtitle !== undefined) {
          doc.purchaseOrder.companySubtitle = cp.companySubtitle;
          doc.purchaseOrder.tableCompanySubtitle = cp.companySubtitle;
        }
        if (cp.companyGstNo) doc.purchaseOrder.gstNo = cp.companyGstNo;
        if (cp.companyPhone) doc.purchaseOrder.companyPhone = cp.companyPhone;
        if (cp.companyEmail) doc.purchaseOrder.companyEmail = cp.companyEmail;
        if (cp.companyWebsite) doc.purchaseOrder.companyWebsite = cp.companyWebsite;
        if (cp.companyAddressFooter) doc.purchaseOrder.companyAddressFooter = cp.companyAddressFooter;
        if (cp.companyAddressHeader) {
          const addrLines = cp.companyAddressHeader.split('\n').map((l) => l.trim()).filter(Boolean);
          if (addrLines.length > 0) {
            doc.purchaseOrder.companyAddress = addrLines;
            doc.purchaseOrder.tableCompanyAddress = addrLines;
          }
        }
        if (cp.leftServices && cp.leftServices.length > 0) doc.purchaseOrder.leftServices = cp.leftServices;
        if (cp.rightServices && cp.rightServices.length > 0) doc.purchaseOrder.rightServices = cp.rightServices;
      }
    }

    // 2. Sync Quotation
    if (doc.quotation) {
      if (clientName) doc.quotation.toRecipient = contact ? `${contact} (${clientName})` : clientName;
      if (clientAddr) doc.quotation.toAddress = clientAddr;

      if (cp) {
        if (cp.companyName) doc.quotation.companyName = cp.companyName;
        if (cp.companySubtitle !== undefined) doc.quotation.companySubtitle = cp.companySubtitle;
        if (cp.companyGstNo) doc.quotation.companyGstNo = cp.companyGstNo;
        if (cp.companyPhone) doc.quotation.companyPhone = cp.companyPhone;
        if (cp.companyEmail) doc.quotation.companyEmail = cp.companyEmail;
        if (cp.companyWebsite) doc.quotation.companyWebsite = cp.companyWebsite;
        if (cp.companyAddressHeader) doc.quotation.companyAddressHeader = cp.companyAddressHeader;
        if (cp.companyAddressFooter) doc.quotation.companyAddressFooter = cp.companyAddressFooter;
        if (cp.leftServices && cp.leftServices.length > 0) doc.quotation.leftServices = cp.leftServices;
        if (cp.rightServices && cp.rightServices.length > 0) doc.quotation.rightServices = cp.rightServices;
      }
    }

    // 3. Sync Tax Invoice
    if (doc.taxInvoice) {
      if (clientName) doc.taxInvoice.clientName = clientName.startsWith('M/s.') ? `${clientName},` : `M/s. ${clientName},`;
      if (clientAddr) {
        doc.taxInvoice.clientAddressLine1 = clientAddr;
      }
      if (clientGst) doc.taxInvoice.clientGstNo = clientGst;
      if (projectName) doc.taxInvoice.projectName = projectName;

      if (cp) {
        if (cp.companyName) doc.taxInvoice.companyName = cp.companyName;
        if (cp.companySubtitle) doc.taxInvoice.companySubtitle = cp.companySubtitle;
        if (cp.companyGstNo) doc.taxInvoice.companyGstNo = cp.companyGstNo;
        if (cp.companyPanNo) doc.taxInvoice.companyPanNo = cp.companyPanNo;
        if (cp.companyEpfNo) doc.taxInvoice.companyEpfNo = cp.companyEpfNo;
        if (cp.companyPhone) doc.taxInvoice.companyPhone = cp.companyPhone;
        if (cp.companyEmail) doc.taxInvoice.companyEmail = cp.companyEmail;
        if (cp.companyWebsite) doc.taxInvoice.companyWebsite = cp.companyWebsite;
        if (cp.companyAddressHeader) doc.taxInvoice.companyAddressHeader = cp.companyAddressHeader;
        if (cp.companyAddressFooter) doc.taxInvoice.companyAddressFooter = cp.companyAddressFooter;
        if (cp.leftServices && cp.leftServices.length > 0) doc.taxInvoice.leftServices = cp.leftServices;
        if (cp.rightServices && cp.rightServices.length > 0) doc.taxInvoice.rightServices = cp.rightServices;
      }
    }

    return {
      ...docItem,
      lastModified: 'Just now',
      document: doc,
    };
  });
}
