import { CustomSectionItem, SectionContentType } from '@/types/document';
import {
  ListChecks,
  Scale,
  Table as TableIcon,
  Layers,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Truck,
  CheckSquare,
  Building,
  FileSpreadsheet,
  FileSignature,
  FileCheck,
} from 'lucide-react';
import React from 'react';

export interface SectionPresetItem {
  id: string;
  name: string;
  title: string;
  description: string;
  contentType: SectionContentType;
  bullets?: string[];
  paragraphs?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
  keyValuePairs?: { key: string; value: string }[];
  calloutText?: string;
  calloutType?: 'warning' | 'important' | 'info';
}

export interface SectionTemplateCategory {
  id: string;
  name: string;
  shortLabel: string;
  badge: string;
  description: string;
  iconName: string;
  sections: SectionPresetItem[];
}

export interface TemplateSectionLibrary {
  templateId: string;
  templateName: string;
  categories: SectionTemplateCategory[];
}

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  list: ListChecks,
  scale: Scale,
  table: TableIcon,
  layers: Layers,
  alert: AlertTriangle,
  'file-text': FileText,
  shield: ShieldCheck,
  briefcase: Briefcase,
  dollar: DollarSign,
  truck: Truck,
  check: CheckSquare,
  building: Building,
  spreadsheet: FileSpreadsheet,
  signature: FileSignature,
  filecheck: FileCheck,
};

export const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
  return ICON_MAP[iconName] || Layers;
};

// =========================================================================
// 100% COMPLETE BUILT-IN LIBRARIES ACROSS ALL TEMPLATES
// =========================================================================

export const DEFAULT_TEMPLATE_LIBRARIES: TemplateSectionLibrary[] = [
  // =========================================================================
  // 1. COMMERCIAL QUOTATION TEMPLATE (ALL 10 PAGES OF SECTIONS)
  // =========================================================================
  {
    templateId: 'quotation',
    templateName: 'Commercial Quotation (10-Page System)',
    categories: [
      {
        id: 'cat_q_letter',
        name: 'Cover, Offer Letter & Subject',
        shortLabel: 'Cover Letter',
        badge: 'Page 1',
        description: 'Client details, reference number, date, and formal introductory offer letter',
        iconName: 'building',
        sections: [
          {
            id: 'sec_q_cover_info',
            name: 'Client & Offer Reference Info',
            title: 'Offer Reference & Client Information',
            description: 'To Client Address, Reference No., Date, and Subject Line',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'To / Client Name', value: 'Mr. Apurvabhai Patel' },
              { key: 'Client Address', value: 'Vadodara, Gujarat' },
              { key: 'Reference No.', value: 'GI-PRE-FAB-EQ-0786/1002' },
              { key: 'Quotation Date', value: '27/03/2026' },
              { key: 'Subject Line', value: 'Quotation for Construction of Round Roof System (Trussless Roof)' },
            ],
          },
          {
            id: 'sec_q_intro_letter',
            name: 'Formal Offer Letter Introduction',
            title: 'Offer Letter & Valued Enquiry Response',
            description: 'Standard 5-paragraph executive intro letter for commercial bids',
            contentType: 'paragraphs',
            paragraphs: [
              'With reference to your Valued Enquiry, we hereby submit our Technical Offer as under.',
              'We thank you for giving us the opportunity to submit our proposal for the above-mentioned project.',
              'Our scope of work covers the design, fabrication, Civil, supply and erection of materials in accordance with the enclosed standards and specifications of M/S. Global Industries Metal Building system, unless otherwise stated.',
              'This proposal is indexed for easy reference and includes scope of supply, building description and design loads/criteria, standard product specifications and standard conditions of sale.',
              'We assure you of our best attention and services and look forward to your favorable response at the earliest.',
            ],
          },
        ],
      },
      {
        id: 'cat_q_tech_specs',
        name: 'Technical Specifications',
        shortLabel: 'Tech Specs',
        badge: 'Page 2',
        description: 'Building size, eave height, purlins, sheeting, structural geometry matrix',
        iconName: 'layers',
        sections: [
          {
            id: 'sec_q_tech_matrix',
            name: 'Technical Details Matrix',
            title: 'Technical Details & Geometry Specifications',
            description: 'Building Area, Dimensions, Clear Height, Roof Panels & Steel Makes',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Building Area', value: '8775.00 SQFT' },
              { key: 'Width (m)', value: '20 MTR (Clear Span)' },
              { key: 'Length (m)', value: '41 MTR' },
              { key: 'Eave Clear Height', value: '25 Ft Clear Height' },
              { key: 'Bay Spacing', value: '3 MT Side Wall Spacing' },
              { key: 'Roof Panels', value: '1 mm thk Colour Coated Galvalume Arch Panels' },
              { key: 'Side Wall', value: '10 Foot Brick / RCC Wall' },
              { key: 'RCC Flooring Work', value: '4" Inch Trimix Concrete Work' },
              { key: 'Framed Openings', value: '2 Nos Heavy Duty Sliding Doors' },
              { key: 'Primary Steel Make', value: 'SAIL / JINDAL / TATA / ESSAR / AMNS' },
            ],
          },
          {
            id: 'sec_q_design_basis',
            name: 'Structural Design Basis',
            title: 'Structural Design Basis & Loading Criteria',
            description: 'Design wind speed, seismic zones, and design standards',
            contentType: 'bullet_list',
            bullets: [
              'Design standard conforming to IS 800:2007, IS 875 (Part 1, 2, 3) for Wind Loads.',
              'Basic Wind Speed considered: 44 m/s (Zone 4) with terrain category 2.',
              'Seismic design parameters according to IS 1893:2016 (Zone III).',
              'Primary frame yield strength minimum 345 MPa (ASTM A572 Grade 50).',
            ],
          },
        ],
      },
      {
        id: 'cat_q_mat_specs',
        name: 'Material Specifications',
        shortLabel: 'Materials',
        badge: 'Page 3',
        description: 'TMT steel, foundation cement, plastering cement, and high-tensile fasteners',
        iconName: 'filecheck',
        sections: [
          {
            id: 'sec_q_material_table',
            name: 'Material Specifications Schedule',
            title: 'Material Specifications & Brand Standards',
            description: 'TMT Steel Fe-550D, Foundation OPC Cement, PPC Slab Cement, Fasteners',
            contentType: 'bullet_list',
            bullets: [
              'TMT Steel Bar: Grade Fe-500D / Fe-550 compliant with IS 1786:2008 with continuous CNC-rolled ribs.',
              'Foundation Works Cement: 53-Grade Ordinary Portland Cement (OPC) for maximum compressive strength.',
              'Chhantar / Slab & Plastering: Portland Pozzolana Cement (PPC) for superior workability and crack resistance.',
              'Roofing Fasteners: High-tensile carbon steel self-drilling fasteners with Ruspert zinc coating and EPDM washers.',
            ],
          },
          {
            id: 'sec_q_testing_methods',
            name: 'Testing & Quality Protocol',
            title: 'Shop Inspection & Testing Protocols',
            description: 'Standard factory tests before dispatch',
            contentType: 'bullet_list',
            bullets: [
              '100% Visual inspection of all fillet and groove welds by certified welding inspectors.',
              'Radiography / Ultrasonic testing on 10% critical butt-weld joints.',
              'Coating dry film thickness (DFT) gauge verification and surface profile checks.',
              'Client inspection clearance required prior to material release.',
            ],
          },
        ],
      },
      {
        id: 'cat_q_commercial_boq',
        name: 'Commercial BOQ & Payment Terms',
        shortLabel: 'BOQ & Pricing',
        badge: 'Page 4',
        description: 'Itemized works contract BOQ, rates, totals in INR, and payment stages',
        iconName: 'dollar',
        sections: [
          {
            id: 'sec_q_boq_table',
            name: 'Commercial BOQ & Pricing Table',
            title: 'Commercial BOQ & Pricing Matrix',
            description: 'Execution of Works Contract, Fabrication Work, Civil Work, and Subtotals',
            contentType: 'table',
            tableHeaders: ['Item & Work Description', 'Total Price in INR'],
            tableRows: [
              ['Execution of Works Contract for Self Supporting Roof (SAC: 9954) Span: 20m, Length: 41m, Arch Rise: 4.57m, Galvalume 1.10mm BMT, Steel column & purlin fabrication (15000 kgs), Erection (13000 kgs), Roofing sheet 600 SQM & 8mm Air Bubble Insulation', '₹ 24,07,227.20'],
              ['FABRICATION WORK 6000X150 (Structural Steel Trusses, Girders & Columns)', '₹ 9,00,000.00'],
              ['Civil Work (8823.2 Sqft @ ₹ 850/- per Sqft inclusive of Foundation, Plinth & Flooring)', '₹ 74,99,550.00'],
            ],
          },
          {
            id: 'sec_q_payment_fab',
            name: 'Payment Terms (Fabrication)',
            title: 'Payment Terms & Conditions for Fabrication',
            description: '25% advance, 75% against PI before dispatch',
            contentType: 'bullet_list',
            bullets: [
              '25% advance along with your confirmed order in favor of GLOBAL INDUSTRIES.',
              '75% against PI prior to material dispatch and machine planning.',
              'Payments to be issued to us by way of Pay-order/DD/at par Cheque favoring GLOBAL INDUSTRIES.',
              'All payments received by us will be forfeited in case of cancellation of order.',
            ],
          },
          {
            id: 'sec_q_payment_civil',
            name: 'Payment Terms (Civil Work)',
            title: 'Payment Terms & Milestone Stages for Civil Work',
            description: '25% advance, 30% footing casting, 25% brickwork, 20% flooring',
            contentType: 'bullet_list',
            bullets: [
              '25% Advance with confirmed Purchase Order.',
              '30% at the time of Footing Casting completion.',
              '25% at the time of Brick wall work completion.',
              '20% at the time of Flooring completion and site handover.',
            ],
          },
        ],
      },
      {
        id: 'cat_q_delivery',
        name: 'Delivery Schedule & Prerequisites',
        shortLabel: 'Delivery',
        badge: 'Page 5',
        description: 'Delivery timelines, mobilization criteria, and site readiness prerequisites',
        iconName: 'truck',
        sections: [
          {
            id: 'sec_q_delivery_schedule',
            name: 'Delivery Schedule & Milestone Timeline',
            title: 'Delivery Schedule & Dispatch Timeline',
            description: '10-12 weeks material delivery, 2 weeks mobilization after site readiness',
            contentType: 'bullet_list',
            bullets: [
              'Material will be delivered to your site within 10 to 12 weeks from receipt of clear purchase order.',
              'Machinery and manpower will be mobilized within 2 weeks from date of complete site readiness.',
              'Joint site progress reviews shall be conducted at regular bi-weekly intervals.',
              'Any idling of machine/crane due to non-readiness of site shall be charged at ₹20,000 per 8-hour shift.',
            ],
          },
          {
            id: 'sec_q_site_prereq',
            name: 'Site Readiness & Client Scope',
            title: 'Site Readiness & Delivery Prerequisites',
            description: 'Site access, crane unloading, 3-phase power & water supply',
            contentType: 'callout',
            calloutType: 'important',
            calloutText:
              'SITE READINESS PREREQUISITES: Site access must be clear and hardened for heavy trailer movement. Unloading, crane arrangements, safe locked storage, construction water, and 3-phase electricity must be provided at site by Client.',
          },
        ],
      },
      {
        id: 'cat_q_vendors',
        name: 'Approved Vendor List',
        shortLabel: 'Vendors',
        badge: 'Page 6',
        description: 'Complete 25-item approved raw material vendor makes and brand directory',
        iconName: 'check',
        sections: [
          {
            id: 'sec_q_vendor_list',
            name: 'Approved Vendor List Table (25 Items)',
            title: 'Approved Vendor List & Material Brand Makes',
            description: 'Complete standard make list for Steel, Paints, Screws, Turbo Vents & Insulation',
            contentType: 'table',
            tableHeaders: ['Sr. No', 'Material / Component Description', 'Approved Brand / Make / Company Name'],
            tableRows: [
              ['1', 'Steel Plates', 'Essar Steel (ArcelorMittal Nippon) / JSW Steel / TATA Steel'],
              ['2', 'Bare & PPGL Panels', 'JSW Steel / Tata BSL Steel / AMNS'],
              ['3', 'GI Coil (for Purlins)', 'Essar Steel / JSW / Apollo / Goodluck India'],
              ['4', 'Hot Rolled Sections (ISMB/ISMC)', 'Jindal Steel & Power (JSPL) / SAIL / Topworth / Varsana'],
              ['5', 'Paints & Primers', 'Hempel / Asian Paints / Berger / AkzoNobel / Sigma'],
              ['6', 'Fasteners (Grade 8.8 / 4.6)', 'Pooja Forge / Deepak Fasteners / Karamtara / KM Fasteners'],
              ['7', 'Polycarbonate Skylight Sheets', 'Tuflite / GE Lexan / Skylight (10-Year Warranty)'],
              ['8', 'Turbo Ventilators (Ø 600 mm)', 'Sudha Ventilating Systems / Global Industries'],
              ['9', 'Insulation (Glasswool / Bubble)', 'UP Twiga / Owens Corning / Aerolam / Alutix'],
              ['10', 'Puff Sandwich Panels', 'Kingspan Jindal / Rinac / Sintex / Metecno'],
              ['11', 'Welding Consumables', 'Ador Welding / Lincoln Electric / ESAB / Kiswel'],
              ['12', 'Life Line & Safety Posts', 'Karam / MT&T Dual Lanyard GI Wire Posts'],
            ],
          },
        ],
      },
      {
        id: 'cat_q_taxes_notes',
        name: 'Taxes, Notes & Delivery Conditions',
        shortLabel: 'Taxes & Notes',
        badge: 'Page 7',
        description: 'Tax applicability notes, delivery notes, and drawing return conditions',
        iconName: 'alert',
        sections: [
          {
            id: 'sec_q_tax_directive',
            name: 'Taxes & GST Applicability Directive',
            title: 'Taxes & Statutory Rates Directive',
            description: 'GST @ 18% extra note and tax change safeguards',
            contentType: 'callout',
            calloutType: 'info',
            calloutText:
              'TAXES: GST @ 18% Extra on quoted rates. Any variation in statutory tax structure announced by the Government will be billed extra at actuals during invoicing.',
          },
          {
            id: 'sec_q_key_notes',
            name: 'Key Commercial & Measurement Notes',
            title: 'Key Technical & Commercial Notes',
            description: 'Actual laid roof curved measurement, consumables ownership, transit insurance',
            contentType: 'bullet_list',
            bullets: [
              'The quoted area is approximate; final invoice will be billed as per actual curved dimensions of laid roof.',
              'Quoted rates include required consumables; excess residual materials remain property of Company.',
              'Material transit insurance from factory to site is inclusive in the quoted contract value.',
              'Unloading of materials and local staging at site is in the scope of the Client.',
            ],
          },
          {
            id: 'sec_q_delivery_conditions',
            name: 'Delivery Clearance Checklist',
            title: 'Mandatory Delivery Conditions & Checklist',
            description: 'General Arrangement Drawing approvals, signed contract, advance payments',
            contentType: 'bullet_list',
            bullets: [
              'Submission and signoff of General Arrangement (GA) Drawings within 7 days.',
              'Acknowledgement and receipt of signed Contract Agreement copy.',
              'Receipt of advance payment as per commercial payment terms.',
            ],
          },
        ],
      },
      {
        id: 'cat_q_terms',
        name: 'Commercial Terms (Clauses 1–17)',
        shortLabel: 'Terms 1-17',
        badge: 'Pages 8-10',
        description: 'Complete legal provisions: Validity, Cancellation, Force Majeure, Arbitration',
        iconName: 'scale',
        sections: [
          {
            id: 'sec_q_terms_1_7',
            name: 'Commercial Terms Part 1 (Clauses 1–7)',
            title: 'Commercial Terms & Conditions (Clauses 1 to 7)',
            description: 'Validity, Contract Duration, Specification Changes, Cancellation, Release, Shipment, Interest',
            contentType: 'legal_clause',
            paragraphs: [
              'Proposal Validity: This proposal is valid for 7 (Seven) days from the date of submission. Any extension must be confirmed in writing by Global Industries.',
              'Contract Validity: Projects with no drawing progress or payment delays exceeding 2 months shall be subject to price revision or cancellation policies.',
              'Specification Changes: The Seller reserves the right to modify standard building designs to incorporate engineering improvements without compromising structural capacity.',
              'Order Cancellation: In the event of order cancellation by Buyer, a 10% engineering charge plus raw material manufacturing costs incurred to date shall be deducted.',
              'Release for Production: Portions of orders not released for production within 2 months due to client delays shall be subject to material price escalation.',
              'Delayed Payments: Any overdue running payment shall attract interest at 0.3% per week on a compound interest basis.',
            ],
          },
          {
            id: 'sec_q_terms_8_13',
            name: 'Commercial Terms Part 2 (Clauses 8–13)',
            title: 'Commercial Terms & Conditions (Clauses 8 to 13)',
            description: 'LC Bank Charges, Variation Orders, Force Majeure, Road Permits, Material Inspection, Delivery',
            contentType: 'legal_clause',
            paragraphs: [
              'Bank Charges: All bank charges pertaining to Letters of Credit (LC) shall be borne by Buyer except Seller bank processing fees.',
              'Variation Orders: Any change in agreed scope shall lead to an equitable price and delivery timeline adjustment.',
              'Force Majeure: Seller shall not be liable for delays caused by acts of God, floods, transporter strikes, war, or government lockdown orders.',
              'Permits & Road Approvals: Buyer is responsible for furnishing all state entry permits and local road transport clearance certificates.',
              'Inspection of Product: Buyer or third-party inspection shall be completed at factory premises upon notification of readiness prior to dispatch.',
            ],
          },
          {
            id: 'sec_q_terms_14_17',
            name: 'Commercial Terms Part 3 (Clauses 14–17)',
            title: 'Commercial Terms & Conditions (Clauses 14 to 17)',
            description: '20-Year Structural Stability, Governing Laws, Dispute Arbitration, Exclusive Jurisdiction',
            contentType: 'legal_clause',
            paragraphs: [
              'Structure Stability Guarantee: Global Industries offers a 20-Year Structural Stability Certificate for its engineered building system.',
              'Entire Agreement: This agreement supersedes all prior verbal or written representations between the parties.',
              'Governing Law: This agreement shall be construed and enforced in accordance with the substantive laws of India.',
              'Arbitration Jurisdiction: All unresolved disputes shall be finally settled by arbitration under the Indian Arbitration Act seated exclusively at Vadodara, Gujarat.',
            ],
          },
        ],
      },
      {
        id: 'cat_q_exclusions_signatures',
        name: 'Exclusions & Dual Signatures',
        shortLabel: 'Exclusions & Sign',
        badge: 'Page 10',
        description: 'Exclusions list, special notes, and dual-party authorization signature block',
        iconName: 'signature',
        sections: [
          {
            id: 'sec_q_exclusions',
            name: 'Scope of Exclusions List',
            title: 'Specific Scope of Exclusions',
            description: 'Civil foundations, crane equipment, external electricals, non-scope items',
            contentType: 'bullet_list',
            bullets: [
              'All civil foundation works, plinth beam casting, concrete curing, and grouting under column base plates.',
              'Heavy mobile crane arrangements and rigging for high-elevation sheet erection.',
              'Construction 3-phase electricity, local generator fuel, and water supply at site.',
              'Any item not explicitly enumerated in Global Industries offer specification.',
            ],
          },
          {
            id: 'sec_q_signatures_block',
            name: 'Special Notes & Dual Signatures',
            title: 'Special Project Notes & Dual Authorization',
            description: 'Shop drawing delivery commitments and authorized signatory designation',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Issued By', value: 'GLOBAL INDUSTRIES (Vadodara)' },
              { key: 'Authorized Representative', value: 'Mr. Arvind Sharma (Senior Commercial Manager)' },
              { key: 'Company Phone', value: '+91 97254 45370 / +91 97258 65370' },
              { key: 'Company Email', value: 'info@globalindustries.co' },
              { key: 'Client Acceptance Status', value: 'Accepted & Confirmed by Client Authorized Signatory' },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 2. WORK ORDER & LABOUR PO TEMPLATE (ALL CORE SECTIONS)
  // =========================================================================
  {
    templateId: 'labour_po',
    templateName: 'Work Order & Labour PO',
    categories: [
      {
        id: 'cat_po_info',
        name: 'Order Information & Parties',
        shortLabel: 'PO Info',
        badge: 'Page 1',
        description: 'Purchase Order No, Date, Contractor, Project Name and Site Location',
        iconName: 'building',
        sections: [
          {
            id: 'sec_po_info_grid',
            name: 'PO Info & Contractor Details',
            title: 'Purchase Order Information & Parties',
            description: 'Contractor Name, Project Name, Location, PO Number and Date',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Purchase Order No.', value: 'GI/CIVIL/2026/101' },
              { key: 'Order Date', value: '05/08/2026' },
              { key: 'Contractor Name', value: 'Mohammad Kamil Shaikh' },
              { key: 'Project Name', value: 'Civil Construction & Pre-Fab Erection Work' },
              { key: 'Project Site Location', value: 'Sevasi TP-1, Vadodara, Gujarat' },
            ],
          },
        ],
      },
      {
        id: 'cat_po_scope',
        name: 'Scope of Work & Obligations',
        shortLabel: 'Scope',
        badge: 'Page 1-2',
        description: '15-item execution duties, company materials vs contractor resources',
        iconName: 'briefcase',
        sections: [
          {
            id: 'sec_po_scope_list',
            name: 'Scope of Execution & Work Tasks',
            title: 'Scope of Work & Execution Deliverables',
            description: 'Complete 15-item civil & structural execution duties',
            contentType: 'bullet_list',
            bullets: [
              'Site cleaning, grading, and layout pegging assistance.',
              'Excavation and backfilling for foundation pits.',
              'PCC work, RCC Footings, Pedestals, Columns, and Plinth Beams.',
              'Reinforcement cutting, bending, staging, and binding.',
              'Centering, shuttering, and safe formwork erection.',
              'Concrete pouring, mechanical vibrating, and mandatory curing.',
              'Brick and block masonry works as per approved drawings.',
              'Internal and external cement plastering.',
              'Trimix flooring and surface hardener application.',
              'Final site cleanup and snag clearance.',
            ],
          },
          {
            id: 'sec_po_contractor_scope',
            name: 'Contractor Resource Scope & Value',
            title: 'Contract Value & Contractor Scope Obligations',
            description: 'Lumpsum value ₹4,70,000/-, manpower, shuttering, and tools obligations',
            contentType: 'paragraphs',
            paragraphs: [
              '1. Contract Value: The total contract value is ₹4,70,000/- (Rupees Four Lakh Seventy Thousand Only) on a Lumpsum Labour Contract Basis. No extra payment shall be made unless specifically approved in writing.',
              '2. Scope of Work: The contractor shall execute complete civil labour work strictly as per approved drawings, specifications, and Site Engineer instructions.',
              '3. Company Scope: Global Industries shall supply only construction materials including Cement, Steel, Sand, Aggregate, Bricks/Blocks, RMC/Concrete, and Water.',
              '4. Contractor Scope: The contractor shall arrange at his own cost Skilled/Unskilled Labour, Masons, Carpenters, Bar Benders, Site Supervisor, Centering/Shuttering Material, Scaffolding, Tools & Tackles, Vibrators, Cutting Machines, and PPE.',
            ],
          },
        ],
      },
      {
        id: 'cat_po_rates',
        name: 'Rates & Pricing Schedule',
        shortLabel: 'Rates',
        badge: 'Page 2',
        description: 'Lumpsum contract value, line item descriptions, and amount in words',
        iconName: 'dollar',
        sections: [
          {
            id: 'sec_po_rates_table',
            name: 'Labour Contract Rate Matrix',
            title: 'Rates & Pricing Matrix',
            description: 'Complete civil labour contract lumpsum rate item',
            contentType: 'table',
            tableHeaders: ['Description of Work', 'Unit', 'Qty', 'Agreed Rate (INR)', 'Total Amount (INR)'],
            tableRows: [
              [
                'Complete Civil Labour Contract (Lumpsum/Uchak) including supervision, skilled/unskilled manpower, tools & tackles, centering/shuttering materials, scaffolding, machinery, equipment, transportation, curing, and safety equipment.',
                'Lumpsum',
                '1 Job',
                '₹ 4,70,000.00',
                '₹ 4,70,000.00',
              ],
            ],
          },
          {
            id: 'sec_po_extra_schedule',
            name: 'Optional Extra Work Unit Rates',
            title: 'Schedule of Rates for Additional / Extra Works',
            description: 'Standard unit rates for extra steel fabrication, primer, and scaffolding',
            contentType: 'table',
            tableHeaders: ['Item No', 'Work Description', 'Unit', 'Agreed Rate (INR)', 'Remarks'],
            tableRows: [
              ['1.01', 'Additional structural steel fabrication (ISMC/ISMB)', 'MT', '₹ 14,500.00', 'Inclusive of staging & consumables'],
              ['1.02', 'Sandblasting and two coats of epoxy primer', 'SQM', '₹ 185.00', 'DFT min 75 microns'],
              ['1.03', 'High-tensile Grade 8.8 bolting & torque tightening', 'KGS', '₹ 120.00', 'Torque wrench certified'],
              ['1.04', 'Mobile crane hiring charges (50 MT)', 'Shift', '₹ 18,000.00', '8 hours per shift with fuel'],
            ],
          },
        ],
      },
      {
        id: 'cat_po_payments',
        name: 'Payment Terms & Milestones',
        shortLabel: 'Payments',
        badge: 'Page 2',
        description: 'Stage-wise milestone release conditions and verification criteria',
        iconName: 'spreadsheet',
        sections: [
          {
            id: 'sec_po_milestones_list',
            name: 'Stage-Wise Milestone Payment Schedule',
            title: 'Payment Terms & Milestone Release Schedule',
            description: 'Footing ₹50k, Beam ₹20k, Plinth ₹50k, Masonry ₹100k, Plaster ₹80k, Flooring ₹120k, Final ₹50k',
            contentType: 'bullet_list',
            bullets: [
              'Footing Work Completion: ₹ 50,000/-',
              'RCC Beam Work Completion: ₹ 20,000/-',
              'Plinth Level Completion: ₹ 50,000/-',
              'Masonry & RCC Column Completion: ₹ 1,00,000/-',
              'Plaster Work Completion: ₹ 80,000/-',
              'Floor Concrete Work Completion: ₹ 1,20,000/-',
              'Final Handover & Snag Clearance: ₹ 50,000/-',
              'All payments released after verification & certification by Site Engineer with TDS deduction.',
            ],
          },
        ],
      },
      {
        id: 'cat_po_quality_safety',
        name: 'Quality, Safety & Statutory Rules',
        shortLabel: 'Quality & Safety',
        badge: 'Page 2-3',
        description: 'Clauses 5–10: Quality standards, materials responsibility, PPE, and labour laws',
        iconName: 'shield',
        sections: [
          {
            id: 'sec_po_quality_safety_clauses',
            name: 'Quality, Materials & Safety (Clauses 5–7)',
            title: 'Quality, Material Responsibility & Safety Norms',
            description: 'Rework at contractor cost, company materials protection, mandatory PPE',
            contentType: 'legal_clause',
            paragraphs: [
              'Quality: The contractor shall execute all works strictly as per approved drawings, specifications and Site Engineer instructions. Any defective work shall be dismantled and re-executed at contractor cost.',
              'Material Responsibility: All materials supplied by Global Industries shall remain Company property. Any loss, damage, or excessive wastage due to negligence shall be recovered from running bills.',
              'Safety & PPE: Contractor shall strictly comply with all safety rules. All workers must wear safety helmets, steel-toe boots, and safety harnesses. Contractor is solely responsible for any accidents.',
            ],
          },
          {
            id: 'sec_po_labour_terms',
            name: 'Commercial & Labour Compliance (Clauses 8–10)',
            title: 'Labour Laws, Measurements & Time Schedule',
            description: 'Minimum Wages, PF/ESIC compliance, 60-day completion with ₹2,000/day penalty',
            contentType: 'legal_clause',
            paragraphs: [
              'Labour Laws: Contractor shall comply with Minimum Wages Act, Labour License, PF, ESIC, Workmen Compensation, and BOCW Act. All labour disputes are the sole responsibility of the contractor.',
              'Measurement & Payment: Payments are released upon stage certification by the Site Engineer against valid GST invoices.',
              'Time Schedule: Completion within 60 (Sixty) calendar days from commencement. Delay penalty of ₹2,000/- per day applies.',
            ],
          },
          {
            id: 'sec_po_zero_harm_callout',
            name: 'Zero Harm Safety Directive',
            title: 'Mandatory Zero-Tolerance Safety Directive',
            description: 'Safety PPE directive with ₹5,000 fine alert',
            contentType: 'callout',
            calloutType: 'warning',
            calloutText:
              'MANDATORY SAFETY COMPLIANCE: All workmen and supervisory personnel entering the site must wear full PPE (helmet, vest, steel-toe boots, double lanyard harness). Any violation carries a ₹ 5,000 fine per occurrence and removal from site.',
          },
        ],
      },
      {
        id: 'cat_po_general_terms',
        name: 'General Terms & Authorization',
        shortLabel: 'General Terms',
        badge: 'Page 3',
        description: 'Clauses 11–16: Housekeeping, 6-Month DLP Warranty, Termination, Jurisdiction & Dual Signatures',
        iconName: 'scale',
        sections: [
          {
            id: 'sec_po_gen_terms_clauses',
            name: 'General Execution Terms (Clauses 11–16)',
            title: 'General Contract & Execution Terms',
            description: 'Housekeeping, 6-Month Defect Liability, Termination, Force Majeure, Vadodara Jurisdiction',
            contentType: 'legal_clause',
            paragraphs: [
              'Housekeeping: Work areas must be kept clean throughout execution with regular debris removal.',
              'Defect Liability Warranty: Contractor shall rectify all workmanship defects observed within 6 months from completion without extra cost.',
              'Variation / Extra Work: Extra work requires prior written approval from Global Industries.',
              'Termination: Global Industries reserves the right to terminate without notice in case of poor workmanship, safety violations, or delays.',
              'Jurisdiction: Subject to exclusive jurisdiction of competent courts at Vadodara, Gujarat only.',
            ],
          },
          {
            id: 'sec_po_dual_signatures',
            name: 'Company & Contractor Signatures',
            title: 'Dual-Party Acceptance & Authorization Block',
            description: 'For Global Industries Authorized Signatory & Accepted by Contractor',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Issued By', value: 'GLOBAL INDUSTRIES (Vadodara)' },
              { key: 'Authorized Signatory', value: 'Senior Project Engineer' },
              { key: 'Accepted By Contractor', value: 'Mohammad Kamil Shaikh' },
              { key: 'Contractor Signature Status', value: 'Signed, Accepted & Confirmed' },
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 3. TAX INVOICE & GST BILLING TEMPLATE
  // =========================================================================
  {
    templateId: 'tax_invoice',
    templateName: 'Tax Invoice & GST Billing',
    categories: [
      {
        id: 'cat_inv_parties',
        name: 'Invoice Details & Buyer Information',
        shortLabel: 'Buyer Info',
        badge: 'Header',
        description: 'Invoice No., Date, Buyer Name, GSTIN, State Code, Consignee Details',
        iconName: 'building',
        sections: [
          {
            id: 'sec_inv_buyer_info',
            name: 'Invoice & Buyer Billing Details',
            title: 'Invoice Metadata & Buyer Details',
            description: 'Invoice Number, Date, M/s Alembic Ltd details, GSTIN, State Code',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Invoice No.', value: 'TI/26-27/00013' },
              { key: 'Invoice Date', value: '14/08/2026' },
              { key: 'Buyer (Bill To)', value: 'M/s. ALEMBIC LTD' },
              { key: 'Buyer Address', value: 'Alembic Road, Gorwa, Vadodara - 390003, Gujarat' },
              { key: 'Buyer GSTIN', value: '24AAACA1234A1Z5' },
              { key: 'State & Code', value: 'Gujarat (Code 24)' },
              { key: 'Place of Supply', value: 'Vadodara, Gujarat' },
            ],
          },
        ],
      },
      {
        id: 'cat_inv_items',
        name: 'Itemized Billing & GST Calculation',
        shortLabel: 'Items Table',
        badge: 'Items & HSN',
        description: 'Item description, HSN code, quantities, rate, taxable value, and CGST/SGST/IGST breakdown',
        iconName: 'table',
        sections: [
          {
            id: 'sec_inv_items_matrix',
            name: 'GST Itemized Billing Schedule',
            title: 'Tax Invoice Itemized Billing Schedule',
            description: 'Item descriptions with HSN codes, UOM, quantities, rates, and amounts',
            contentType: 'table',
            tableHeaders: ['Sr No', 'Description of Goods / Services', 'HSN/SAC', 'Qty', 'Unit', 'Rate (INR)', 'Amount (INR)'],
            tableRows: [
              ['1', 'Supply & Erection of Structural Steel Members (ISMB / ISMC / Purlins)', '7308', '12.50', 'MT', '₹ 85,000.00', '₹ 10,62,500.00'],
              ['2', 'Supply of Galvalume Colour Coated Roofing Sheet (0.50mm BMT)', '7210', '850.00', 'SQM', '₹ 420.00', '₹ 3,57,000.00'],
              ['3', 'High Tensile Self Drilling Screws & Fasteners (Grade 8.8)', '7318', '2500', 'Nos', '₹ 8.50', '₹ 21,250.00'],
            ],
          },
        ],
      },
      {
        id: 'cat_inv_bank_terms',
        name: 'Bank Details, Terms & Authorization',
        shortLabel: 'Bank & Terms',
        badge: 'Footer',
        description: 'Bank A/C, IFSC, declaration, and authorized signatory block',
        iconName: 'signature',
        sections: [
          {
            id: 'sec_inv_bank_details',
            name: 'Bank Account & Payment Details',
            title: 'Bank Details & Payment Instructions',
            description: 'Account Name, Bank Name, A/C Number, IFSC Code, Branch',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Bank Account Name', value: 'GLOBAL INDUSTRIES' },
              { key: 'Bank Name', value: 'HDFC Bank Ltd' },
              { key: 'Account Number', value: '50200012345678' },
              { key: 'IFSC Code', value: 'HDFC0000123' },
              { key: 'Branch', value: 'Alkapuri, Vadodara, Gujarat' },
            ],
          },
          {
            id: 'sec_inv_terms_declaration',
            name: 'Invoice Terms & Statutory Declaration',
            title: 'Terms of Sale & Statutory Declaration',
            description: 'Interest on delayed payments, subject to Vadodara jurisdiction, certification declaration',
            contentType: 'bullet_list',
            bullets: [
              'Goods once sold will not be taken back or exchanged under any circumstances.',
              'Interest @ 18% per annum will be charged on all delayed bills not cleared within 30 days.',
              'Subject to exclusive jurisdiction of competent courts at Vadodara, Gujarat only.',
              'Certified that the particulars given above are true and correct and the amount indicated represents the price actually charged.',
            ],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // 4. SUBCONTRACT AGREEMENT TEMPLATE (FULL INDUSTRY STANDARDS)
  // =========================================================================
  {
    templateId: 'subcontract',
    templateName: 'Subcontract & Work Order Agreement',
    categories: [
      {
        id: 'cat_sub_parties',
        name: 'Agreement Parties & Recitals',
        shortLabel: 'Parties',
        badge: 'Page 1',
        description: 'Principal Contractor, Subcontractor Details, Effective Date, Project Location',
        iconName: 'building',
        sections: [
          {
            id: 'sec_sub_parties_grid',
            name: 'Subcontract Metadata & Parties',
            title: 'Subcontract Agreement Information & Parties',
            description: 'Agreement No, Date, Principal Contractor, Subcontractor Legal Entity & GSTIN',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'Agreement Number', value: 'GI/SUB-CONT/2026/044' },
              { key: 'Effective Date', value: '15/08/2026' },
              { key: 'Principal Contractor', value: 'GLOBAL INDUSTRIES (Vadodara)' },
              { key: 'Subcontractor Entity', value: 'M/s. Kamil Structural Fabrication Works' },
              { key: 'Project Title', value: 'Turnkey Industrial PEB & Civil Construction' },
              { key: 'Site Location', value: 'Sevasi TP-1, Vadodara, Gujarat' },
            ],
          },
          {
            id: 'sec_sub_recitals',
            name: 'Background & Recitals Clauses',
            title: 'Recitals & Legal Background',
            description: 'Standard 4-point recitals establishing subcontractor expertise and acceptance',
            contentType: 'legal_clause',
            paragraphs: [
              'WHEREAS Principal Contractor has been awarded the prime contract for construction and execution of the Project.',
              'AND WHEREAS Subcontractor represents that it possesses the requisite expertise, qualified manpower, tools, machinery, and financial capacity to execute the specialized works.',
              'NOW THEREFORE, in consideration of the mutual covenants and agreed contract sums, the Parties hereby agree to the terms and conditions outlined herein.',
            ],
          },
        ],
      },
      {
        id: 'cat_sub_scope',
        name: 'Subcontract Scope & Deliverables',
        shortLabel: 'Scope & Work',
        badge: 'Page 1-2',
        description: 'Itemized execution tasks, free-issue materials, tools, staging, and plant obligations',
        iconName: 'briefcase',
        sections: [
          {
            id: 'sec_sub_scope_tasks',
            name: 'Specialized Scope of Execution',
            title: 'Subcontract Scope of Work & Deliverables',
            description: 'Complete fabrication, assembly, welding, crane erection, and finishing duties',
            contentType: 'bullet_list',
            bullets: [
              'Structural steel column, rafter, and purlin fabrication at site workshop.',
              'Full penetration butt welding and fillet welding as per AWS D1.1 standards.',
              'Surface preparation, red oxide zinc chromate primer, and epoxy top coat application.',
              'Safe crane rigging, hoisting, bolting, and torque tightening of primary frames.',
              'Installation of roof sheeting, ridge caps, gutters, downspouts, and PUF panels.',
              'Daily housekeeping, scrap sorting, and debris clearance from the work zones.',
            ],
          },
          {
            id: 'sec_sub_materials_resp',
            name: 'Material & Machinery Responsibilities',
            title: 'Free-Issue Materials vs Subcontractor Equipment',
            description: 'Principal contractor free-issue steel vs subcontractor cranes, welding machines, and scaffolding',
            contentType: 'table',
            tableHeaders: ['Category', 'Provided by Principal Contractor', 'Arranged by Subcontractor at Own Cost'],
            tableRows: [
              ['Raw Materials', 'Primary Steel Plates, ISMC/ISMB sections, Roof Sheets', 'Welding Electrodes (E7018), Cutting Gas, Grinding Discs'],
              ['Machinery & Plant', 'Electricity & Water connection point at site', 'Welding Rectifiers, DG Sets, Cranes, Hydra, Scaffolding'],
              ['Manpower & Safety', 'Site Engineer & QA inspection', 'Certified Welders, Riggers, Fitters, Safety Officer, Full PPE'],
            ],
          },
        ],
      },
      {
        id: 'cat_sub_payments',
        name: 'Payment Milestones & Retention',
        shortLabel: 'Payments',
        badge: 'Page 2',
        description: 'Mobilization advance, RA progressive bills, 5% retention, and TDS compliance',
        iconName: 'dollar',
        sections: [
          {
            id: 'sec_sub_milestones_table',
            name: 'Subcontract Milestone Payment Schedule',
            title: 'Stage-Wise Subcontract Milestone Schedule',
            description: 'Mobilization 15%, Fabrication 40%, Erection 35%, Snag Clearance 10%',
            contentType: 'table',
            tableHeaders: ['Stage No', 'Milestone Description', 'Release %', 'Cumulative %'],
            tableRows: [
              ['Stage 1', 'Mobilization & Setup of Site Fabrication Yard', '15.00%', '15.00%'],
              ['Stage 2', 'Completion of Primary Member Fabrication & Priming', '40.00%', '55.00%'],
              ['Stage 3', 'Structural Erection, Alignment & High-Tensile Bolting', '35.00%', '90.00%'],
              ['Stage 4', 'Final Snag Clearance, Sheeting & Handover', '10.00%', '100.00%'],
            ],
          },
          {
            id: 'sec_sub_retention_rules',
            name: 'Retention Money & Deduction Terms',
            title: 'Retention Deductions & Statutory Recovery',
            description: '5% retention from every running bill, released after 6-month defect liability',
            contentType: 'bullet_list',
            bullets: [
              'Retention Deduction: 5% shall be retained from each Running Account (RA) bill towards security.',
              'Release of Retention: 50% retention released upon Final Completion Certificate; remaining 50% released after 12-month DLP.',
              'Statutory Deductions: TDS under Section 194C, GST-TDS, and Labour Welfare Cess deducted at applicable statutory rates.',
              'Payment Timeline: Verified RA bills cleared within 15 working days from submission with measurement sheets.',
            ],
          },
        ],
      },
      {
        id: 'cat_sub_safety_legal',
        name: 'Safety, DLP Warranty & Indemnity',
        shortLabel: 'Safety & Warranty',
        badge: 'Page 2-3',
        description: 'Defect Liability Period, 100% PPE compliance, third-party indemnity, and labour laws',
        iconName: 'shield',
        sections: [
          {
            id: 'sec_sub_dlp_warranty',
            name: '12-Month Defect Liability Warranty (DLP)',
            title: 'Defect Liability Period & Performance Warranty',
            description: '12-month free rectification warranty for structural or welding failures',
            contentType: 'legal_clause',
            paragraphs: [
              'Defect Liability Period: Subcontractor guarantees all works for a period of 12 (Twelve) months from formal commissioning against defective workmanship, poor welding, or structural misalignments.',
              'Rectification Notice: Upon written notice from Principal Contractor, Subcontractor shall initiate rectification within 48 hours at its sole expense. Failure to do so authorizes Principal Contractor to engage third parties and recover costs from retention.',
            ],
          },
          {
            id: 'sec_sub_safety_indemnity',
            name: 'Site Safety & Comprehensive Indemnity',
            title: 'Zero Harm Safety Directive & Indemnification',
            description: 'Full indemnification of principal contractor against accidents, labour claims, or penalties',
            contentType: 'legal_clause',
            paragraphs: [
              'Statutory Labour Compliance: Subcontractor confirms full compliance with PF, ESIC, Workmen Compensation, Minimum Wages Act, and BOCW Act. Subcontractor holds Principal Contractor harmless against all statutory claims.',
              'Comprehensive Indemnity: Subcontractor shall fully indemnify and defend Principal Contractor, its directors, and clients from any liabilities, damages, fines, or losses arising from subcontractor operations at site.',
            ],
          },
          {
            id: 'sec_sub_safety_callout',
            name: 'Mandatory Safety & PPE Alert',
            title: 'Strict Zero-Tolerance Safety Protocol',
            description: 'Mandatory double-lanyard harness, crane safety certificates, and ₹10,000 fine warning',
            contentType: 'callout',
            calloutType: 'warning',
            calloutText:
              'MANDATORY WORK-AT-HEIGHT DIRECTIVE: All personnel working above 2 meters must use certified double-lanyard full body harnesses hooked to rigid life-lines. Any unauthorized bypass will attract an instant ₹ 10,000 penalty and immediate suspension.',
          },
        ],
      },
      {
        id: 'cat_sub_execution',
        name: 'Dispute Resolution & Signatures',
        shortLabel: 'Signatures',
        badge: 'Page 3',
        description: 'Arbitration in Vadodara, termination notice, and formal dual-party execution block',
        iconName: 'signature',
        sections: [
          {
            id: 'sec_sub_arbitration',
            name: 'Dispute Resolution & Jurisdiction',
            title: 'Governing Law, Arbitration & Jurisdiction',
            description: 'Sole arbitrator appointed in Vadodara under Indian Arbitration & Conciliation Act',
            contentType: 'legal_clause',
            paragraphs: [
              'Amicable Settlement: Any dispute arising under this Agreement shall first be resolved through good-faith executive negotiations within 30 days.',
              'Arbitration: Unresolved disputes shall be referred to a Sole Arbitrator appointed mutually in Vadodara in accordance with the Arbitration and Conciliation Act, 1996.',
              'Jurisdiction: Courts at Vadodara, Gujarat shall possess exclusive territorial jurisdiction.',
            ],
          },
          {
            id: 'sec_sub_execution_block',
            name: 'Dual-Party Subcontract Execution',
            title: 'Formal Subcontract Execution & Acceptance Block',
            description: 'Authorized Signatures for Principal Contractor and Subcontractor',
            contentType: 'key_value',
            keyValuePairs: [
              { key: 'For Principal Contractor', value: 'GLOBAL INDUSTRIES (Vadodara)' },
              { key: 'Principal Signatory', value: 'Managing Director / Project Head' },
              { key: 'For Subcontractor', value: 'M/s. Kamil Structural Fabrication Works' },
              { key: 'Subcontractor Signatory', value: 'Proprietor / Managing Partner' },
              { key: 'Witness 1 (Name & Sign)', value: 'Project QA Engineer (Global Industries)' },
              { key: 'Witness 2 (Name & Sign)', value: 'Site In-Charge (Subcontractor)' },
            ],
          },
        ],
      },
    ],
  },
];

// LocalStorage Persistence Key (Incremented to v5 for complete subcontract & tax invoice initialization)
const STORAGE_KEY = 'custom_template_section_library_v5';

/**
 * Loads the complete template section library (synced with LocalStorage)
 */
export function loadTemplateSectionLibrary(): TemplateSectionLibrary[] {
  if (typeof window === 'undefined') {
    return DEFAULT_TEMPLATE_LIBRARIES;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Deep merge with DEFAULT_TEMPLATE_LIBRARIES to ensure new libraries and categories are always available
        const merged = [...parsed];
        DEFAULT_TEMPLATE_LIBRARIES.forEach((defaultLib) => {
          const existingLib = merged.find((m) => m.templateId === defaultLib.templateId);
          if (!existingLib) {
            merged.push(defaultLib);
          } else {
            defaultLib.categories.forEach((defaultCat) => {
              if (!existingLib.categories.some((c: any) => c.id === defaultCat.id)) {
                existingLib.categories.push(defaultCat);
              }
            });
          }
        });
        return merged;
      }
    }
  } catch (e) {
    console.error('Failed to load custom section library from localStorage:', e);
  }
  return DEFAULT_TEMPLATE_LIBRARIES;
}

/**
 * Saves the template section library to LocalStorage
 */
export function saveTemplateSectionLibrary(library: TemplateSectionLibrary[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save section library to localStorage:', e);
  }
}

/**
 * Gets the library for a specific template or falls back to the first one
 */
export function getLibraryForTemplate(templateId: string): TemplateSectionLibrary {
  const all = loadTemplateSectionLibrary();
  return all.find((l) => l.templateId === templateId) || all[0] || DEFAULT_TEMPLATE_LIBRARIES[0];
}

/**
 * Adds a new category to a template
 */
export function addCategoryToTemplate(templateId: string, category: SectionTemplateCategory): void {
  const all = loadTemplateSectionLibrary();
  const target = all.find((l) => l.templateId === templateId);
  if (target) {
    target.categories.push(category);
    saveTemplateSectionLibrary(all);
  } else {
    all.push({
      templateId,
      templateName: templateId,
      categories: [category],
    });
    saveTemplateSectionLibrary(all);
  }
}

/**
 * Updates a category in a template
 */
export function updateCategoryInTemplate(
  templateId: string,
  categoryId: string,
  updates: Partial<SectionTemplateCategory>
): void {
  const all = loadTemplateSectionLibrary();
  const target = all.find((l) => l.templateId === templateId);
  if (target) {
    const catIdx = target.categories.findIndex((c) => c.id === categoryId);
    if (catIdx !== -1) {
      target.categories[catIdx] = { ...target.categories[catIdx], ...updates };
      saveTemplateSectionLibrary(all);
    }
  }
}

/**
 * Deletes a category from a template
 */
export function deleteCategoryFromTemplate(templateId: string, categoryId: string): void {
  const all = loadTemplateSectionLibrary();
  const target = all.find((l) => l.templateId === templateId);
  if (target) {
    target.categories = target.categories.filter((c) => c.id !== categoryId);
    saveTemplateSectionLibrary(all);
  }
}

/**
 * Adds a new section preset to a specific category
 */
export function addSectionToCategory(
  templateId: string,
  categoryId: string,
  section: SectionPresetItem
): void {
  const all = loadTemplateSectionLibrary();
  const target = all.find((l) => l.templateId === templateId);
  if (target) {
    const cat = target.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.sections.push(section);
      saveTemplateSectionLibrary(all);
    }
  }
}

/**
 * Updates a section preset in a category
 */
export function updateSectionInLibrary(
  templateId: string,
  categoryId: string,
  section: SectionPresetItem
): void {
  const all = loadTemplateSectionLibrary();
  const target = all.find((l) => l.templateId === templateId);
  if (target) {
    const cat = target.categories.find((c) => c.id === categoryId);
    if (cat) {
      const secIdx = cat.sections.findIndex((s) => s.id === section.id);
      if (secIdx !== -1) {
        cat.sections[secIdx] = section;
        saveTemplateSectionLibrary(all);
      }
    }
  }
}

/**
 * Deletes a section preset from a category
 */
export function deleteSectionFromLibrary(
  templateId: string,
  categoryId: string,
  sectionId: string
): void {
  const all = loadTemplateSectionLibrary();
  const target = all.find((l) => l.templateId === templateId);
  if (target) {
    const cat = target.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.sections = cat.sections.filter((s) => s.id !== sectionId);
      saveTemplateSectionLibrary(all);
    }
  }
}

/**
 * Resets the entire library to system defaults
 */
export function resetLibraryToDefaults(): TemplateSectionLibrary[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('custom_template_section_library_v2');
    localStorage.removeItem('custom_template_section_library_v1');
  }
  return DEFAULT_TEMPLATE_LIBRARIES;
}

// =========================================================================
// COMPATIBILITY ADAPTERS FOR EXISTING ADD SECTION MODAL & SIDEBAR
// =========================================================================

export interface SectionTypeOption {
  type: SectionContentType;
  label: string;
  shortLabel: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultTitle: string;
  presets: {
    name: string;
    title: string;
    description: string;
    factory: () => Partial<CustomSectionItem>;
  }[];
}

/**
 * Retrieves all categories formatted for AddSectionModal with live presets
 */
export function getAvailableSectionTypes(templateId?: string): SectionTypeOption[] {
  const libraries = loadTemplateSectionLibrary();
  let categories: SectionTemplateCategory[] = [];

  if (templateId) {
    const target = libraries.find((l) => l.templateId === templateId);
    if (target) categories = target.categories;
  }

  if (categories.length === 0) {
    // Collect all unique categories across all template libraries
    categories = libraries.flatMap((l) => l.categories);
  }

  // Deduplicate categories by ID or name
  const seen = new Set<string>();
  const uniqueCategories = categories.filter((cat) => {
    if (seen.has(cat.id)) return false;
    seen.add(cat.id);
    return true;
  });

  return uniqueCategories.map((cat) => {
    const firstSection = cat.sections[0];
    const defaultType: SectionContentType = firstSection?.contentType || 'bullet_list';

    return {
      type: defaultType,
      label: cat.name,
      shortLabel: cat.shortLabel,
      badge: cat.badge,
      description: cat.description,
      icon: getIconComponent(cat.iconName),
      defaultTitle: firstSection?.title || cat.name,
      presets: cat.sections.map((sec) => ({
        name: sec.name,
        title: sec.title,
        description: sec.description,
        factory: () => ({
          contentType: sec.contentType,
          bullets: sec.bullets ? [...sec.bullets] : undefined,
          paragraphs: sec.paragraphs ? [...sec.paragraphs] : undefined,
          tableHeaders: sec.tableHeaders ? [...sec.tableHeaders] : undefined,
          tableRows: sec.tableRows ? sec.tableRows.map((r) => [...r]) : undefined,
          keyValuePairs: sec.keyValuePairs ? sec.keyValuePairs.map((kv) => ({ ...kv })) : undefined,
          calloutText: sec.calloutText,
          calloutType: sec.calloutType,
        }),
      })),
    };
  });
}

export const PREDEFINED_SECTION_TYPES: SectionTypeOption[] = getAvailableSectionTypes();

/**
 * Instantiates a concrete CustomSectionItem from a preset
 */
export function createSectionFromPreset(
  type: SectionContentType,
  presetIndex: number = 0,
  pageNumber: number = 1,
  customTitle?: string
): CustomSectionItem {
  const availableTypes = getAvailableSectionTypes();
  const option = availableTypes.find((t) => t.type === type) || availableTypes[0];
  const preset = option?.presets[presetIndex] || option?.presets[0];
  const templateData = preset ? preset.factory() : { contentType: type };

  return {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: customTitle?.trim() || preset?.title || option?.defaultTitle || 'Custom Section',
    pageNumber: pageNumber,
    contentType: (templateData.contentType as SectionContentType) || type,
    bullets: templateData.bullets,
    paragraphs: templateData.paragraphs,
    tableHeaders: templateData.tableHeaders,
    tableRows: templateData.tableRows,
    keyValuePairs: templateData.keyValuePairs,
    calloutText: templateData.calloutText,
    calloutType: templateData.calloutType,
  };
}
