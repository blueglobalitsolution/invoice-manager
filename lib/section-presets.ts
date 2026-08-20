import { CustomSectionItem, SectionContentType } from '@/types/document';
import {
  ListChecks,
  Scale,
  Table as TableIcon,
  Layers,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import React from 'react';

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

export const PREDEFINED_SECTION_TYPES: SectionTypeOption[] = [
  {
    type: 'bullet_list',
    label: 'List & Specifications',
    shortLabel: 'List',
    badge: 'Items & Scopes',
    description: 'Itemized bullet points for technical requirements, work scopes, or inspection items',
    icon: ListChecks,
    defaultTitle: 'Technical Specifications & Conditions',
    presets: [
      {
        name: 'Technical Specifications',
        title: 'Technical Specifications & Standards',
        description: 'Standard engineering and fabrication tolerances',
        factory: () => ({
          contentType: 'bullet_list',
          bullets: [
            'All fabrication tolerances and workmanship shall strictly conform to IS / BS specifications.',
            'Inspection and testing certificates must be furnished prior to dispatch or erection at site.',
            'Contractor shall deploy certified qualified welders, fitters, and skilled tradesmen only.',
            'Quality control check sheets must be signed off jointly after each milestone completion.',
          ],
        }),
      },
      {
        name: 'Scope & Deliverables',
        title: 'Scope of Deliverables & Milestones',
        description: 'Key deliverables, site handover, and drawing approvals',
        factory: () => ({
          contentType: 'bullet_list',
          bullets: [
            'Submission of detailed fabrication and shop drawings within 7 days of order receipt.',
            'Supply and staging of all required safety PPE and scaffolding material conforming to standards.',
            'Daily progress reporting and material reconciliation records to be maintained on site.',
            'Final handover upon clearance of snag list and submission of as-built documentation.',
          ],
        }),
      },
      {
        name: 'Quality & Inspection Checklist',
        title: 'Quality & Material Testing Checklist',
        description: 'Mandatory quality clearance checks before handover',
        factory: () => ({
          contentType: 'bullet_list',
          bullets: [
            'Mill test certificates (MTC) required for all structural steel and reinforcement batches.',
            'Non-destructive testing (NDT/UT/DPT) for critical load-bearing weld joints.',
            'Cube testing certificates for concrete works at 7-day and 28-day intervals.',
            'Zero tolerance for unapproved substitutions of raw materials.',
          ],
        }),
      },
    ],
  },
  {
    type: 'legal_clause',
    label: 'Legal Clause & Terms',
    shortLabel: 'Legal Clause',
    badge: 'Statutory & Terms',
    description: 'Numbered legal provisions, indemnity liabilities, arbitration, and statutory clauses',
    icon: Scale,
    defaultTitle: 'Indemnity & Legal Conditions',
    presets: [
      {
        name: 'Indemnity & Insurance Liability',
        title: 'Indemnification & Insurance Obligations',
        description: 'Contractor indemnity against third-party damage, claims, and workmen compensation',
        factory: () => ({
          contentType: 'legal_clause',
          paragraphs: [
            'The Contractor shall fully indemnify and keep indemnified {{COMPANY_NAME}} against all actions, claims, damages, liabilities, losses, costs, and expenses arising directly or indirectly from any act, neglect, or default of the Contractor or its workmen deployed at {{PROJECT_NAME}}.',
            'The Contractor shall take out and maintain at its own cost Workmen Compensation Insurance and Third-Party General Public Liability Insurance covering all personnel engaged for the duration of the contract.',
            'In the event of any statutory penalty or labor law non-compliance, {{COMPANY_NAME}} reserves the immediate right to deduct the full penalty amount plus administrative fees from running bills.',
          ],
        }),
      },
      {
        name: 'Dispute Resolution & Arbitration',
        title: 'Governing Law & Dispute Resolution',
        description: 'Formal arbitration jurisdiction clause under standard Arbitration Act',
        factory: () => ({
          contentType: 'legal_clause',
          paragraphs: [
            'This Contract and Purchase Order shall in all respects be governed by and construed in accordance with the laws of the applicable jurisdiction.',
            'Any dispute, controversy, or claim arising out of or relating to this Contract shall first be settled through amicable negotiation between designated senior executives of {{COMPANY_NAME}} and {{CONTRACTOR_NAME}} within 30 days.',
            'If unresolved amicably, the dispute shall be referred to and finally resolved by a sole arbitrator mutually agreed upon, seated at {{PROJECT_LOCATION}}.',
          ],
        }),
      },
      {
        name: 'Force Majeure & Suspension',
        title: 'Force Majeure & Suspension of Work',
        description: 'Unforeseen acts of God, civil commotion, and notice timelines',
        factory: () => ({
          contentType: 'legal_clause',
          paragraphs: [
            'Neither party shall be liable for delay or failure to perform its contractual obligations if such failure arises from an event beyond reasonable control, including acts of God, flood, war, riots, or government lockdowns.',
            'The affected party must give written notice within 48 hours of the occurrence of the Force Majeure event with verifiable evidence.',
            'If the Force Majeure event persists continuously for exceeding 60 days, either party may terminate the contract without penalty upon written notice.',
          ],
        }),
      },
      {
        name: 'Confidentiality & NDA',
        title: 'Confidentiality & Non-Disclosure',
        description: 'Protection of proprietary drawings, specifications, and project commercials',
        factory: () => ({
          contentType: 'legal_clause',
          paragraphs: [
            'The Contractor agrees to treat all drawings, specifications, engineering calculations, and commercial data shared for {{PROJECT_NAME}} as strictly confidential proprietary information.',
            'No proprietary materials or digital files shall be duplicated, distributed, or disclosed to third parties without prior written consent from {{COMPANY_NAME}}.',
          ],
        }),
      },
    ],
  },
  {
    type: 'table',
    label: 'Table & Data Schedule',
    shortLabel: 'Table',
    badge: 'Tabular Matrix',
    description: 'Custom multi-column matrix for milestone payments, rate schedules, or technical parameters',
    icon: TableIcon,
    defaultTitle: 'Schedule of Quantities & Milestones',
    presets: [
      {
        name: 'Milestone Payment Schedule',
        title: 'Milestone & Staged Payment Schedule',
        description: 'Staged completion milestones with payable percentage and deliverables',
        factory: () => ({
          contentType: 'table',
          tableHeaders: ['Stage / Milestone', 'Deliverable / Scope Requirement', '% Payable', 'Release Conditions'],
          tableRows: [
            ['Milestone 1: Mobilization', 'Mobilization of machinery, manpower & safety signoff', '10%', 'Within 7 days of site handover'],
            ['Milestone 2: 50% Execution', 'Completion of 50% civil/fabrication works as per drawings', '35%', 'Joint inspection & measurement'],
            ['Milestone 3: 100% Erection', 'Completion of full erection & alignment inspection', '40%', 'Quality clearance certificate'],
            ['Milestone 4: Final Handover', 'Snag list clearance, as-built drawings & site cleanup', '10%', 'Commercial reconciliation'],
            ['Milestone 5: Retention Release', 'Completion of 12-month Defect Liability Period (DLP)', '5%', 'Final DLP clearance certificate'],
          ],
        }),
      },
      {
        name: 'Schedule of Materials & Rates',
        title: 'Schedule of Optional / Extra Work Rates',
        description: 'Standard unit rates for extra or additional work items',
        factory: () => ({
          contentType: 'table',
          tableHeaders: ['Item No', 'Item Description & Specification', 'Unit', 'Agreed Rate (INR)', 'Remarks'],
          tableRows: [
            ['1.01', 'Additional structural steel fabrication (ISMC/ISMB)', 'MT', '₹ 14,500.00', 'Inclusive of staging & consumables'],
            ['1.02', 'Sandblasting and two coats of epoxy primer', 'SQM', '₹ 185.00', 'DFT min 75 microns'],
            ['1.03', 'High-tensile Grade 8.8 bolting & torque tightening', 'KGS', '₹ 120.00', 'Torque wrench certified'],
            ['1.04', 'Mobile crane hiring charges (50 MT)', 'Shift', '₹ 18,000.00', '8 hours per shift with fuel'],
          ],
        }),
      },
      {
        name: 'Equipment & Machinery Deployment',
        title: 'Mandatory Machinery & Equipment Deployment',
        description: 'Contractor equipment commitments at project site',
        factory: () => ({
          contentType: 'table',
          tableHeaders: ['Equipment / Machinery', 'Capacity / Model', 'Min Qty', 'Fitness / Test Cert'],
          tableRows: [
            ['Inverter Welding Machines (400A)', 'Heavy Duty 3-Phase', '4 Nos', 'Valid Calibrated Cert'],
            ['Air Compressor (300 CFM)', 'Diesel Driven Mobile', '1 No', 'Emission & Noise Passed'],
            ['Torque Wrenches (Calibrated)', '50 - 500 Nm', '2 Nos', 'Valid Calibration Lab Report'],
            ['Safety Harness & Lifelines', 'Dual Lanyard EN361', '10 Sets', 'CE / ISI Approved'],
          ],
        }),
      },
    ],
  },
  {
    type: 'key_value',
    label: 'Key-Value Matrix',
    shortLabel: 'Key-Value',
    badge: 'Properties Grid',
    description: 'Structured 2-column parameter/value grid for project parameters, contacts, or commercial summaries',
    icon: Layers,
    defaultTitle: 'Contract Parameters & Project Summary',
    presets: [
      {
        name: 'Project Site & Supervision Directory',
        title: 'Project Supervision & Key Contacts',
        description: 'Designated site in-charge and contact personnel',
        factory: () => ({
          contentType: 'key_value',
          keyValuePairs: [
            { key: 'Project Name', value: '{{PROJECT_NAME}}' },
            { key: 'Site Location', value: '{{PROJECT_LOCATION}}' },
            { key: 'Client In-Charge / Resident Engineer', value: 'Mr. Arvind Sharma (+91-98765-43210)' },
            { key: 'Contractor Project Manager', value: 'Mr. Rajesh Kumar (+91-98234-56789)' },
            { key: 'Safety Officer on Site', value: 'Certified EHS Officer (Mandatory Daily Presence)' },
            { key: 'Commencement Date', value: '{{PO_DATE}}' },
            { key: 'Defect Liability Period (DLP)', value: '12 Calendar Months from Final Handover' },
          ],
        }),
      },
      {
        name: 'Commercial & Financial Summary',
        title: 'Key Commercial Terms Summary',
        description: 'Quick reference parameter summary for finance & billing',
        factory: () => ({
          contentType: 'key_value',
          keyValuePairs: [
            { key: 'Purchase Order No.', value: '{{PO_NUMBER}}' },
            { key: 'GST Registration No.', value: '{{GST_NO}}' },
            { key: 'Payment Currency', value: 'Indian Rupees (INR)' },
            { key: 'Billing Cycle', value: 'Monthly running account (RA) bills against certified measurements' },
            { key: 'Retention Money Percentage', value: '5% deduction from each running invoice' },
            { key: 'Performance Bank Guarantee (PBG)', value: '10% of total contract value valid till DLP' },
            { key: 'Liquidated Damages (LD)', value: '0.5% per week of delay up to maximum 5% total' },
          ],
        }),
      },
    ],
  },
  {
    type: 'callout',
    label: 'Notice & Safety Callout',
    shortLabel: 'Notice Box',
    badge: 'Warning & Alert',
    description: 'Prominently bordered notice box for critical safety rules, zero-tolerance directives, or warnings',
    icon: AlertTriangle,
    defaultTitle: 'Mandatory Safety & Compliance Notice',
    presets: [
      {
        name: 'Zero Harm Safety Directive',
        title: 'Mandatory Safety & Zero-Tolerance Directive',
        description: 'Strict site safety and PPE compliance warning',
        factory: () => ({
          contentType: 'callout',
          calloutType: 'warning',
          calloutText:
            'MANDATORY SAFETY COMPLIANCE: All workmen and supervisory personnel entering {{PROJECT_NAME}} must be equipped with full personal protective equipment (safety helmet, high-visibility vest, steel-toe safety boots, and double lanyard harness for work at height). Any safety violation will result in an immediate ₹ 5,000 fine per occurrence and removal of the individual from site.',
        }),
      },
      {
        name: 'Subcontracting Prohibition Notice',
        title: 'Restriction Against Unauthorized Subcontracting',
        description: 'Prohibition of unauthorized piece-rate subletting',
        factory: () => ({
          contentType: 'callout',
          calloutType: 'important',
          calloutText:
            'IMPORTANT: The Contractor shall NOT assign, transfer, or sub-let this contract or any substantial part thereof to any third-party sub-contractor without explicit prior written approval from {{COMPANY_NAME}}. Any unauthorized subletting shall be deemed a material breach and cause for immediate termination with forfeiture of security deposit.',
        }),
      },
    ],
  },
];

export function createSectionFromPreset(
  type: SectionContentType,
  presetIndex: number = 0,
  pageNumber: number = 1,
  customTitle?: string
): CustomSectionItem {
  const option = PREDEFINED_SECTION_TYPES.find((t) => t.type === type) || PREDEFINED_SECTION_TYPES[0];
  const preset = option.presets[presetIndex] || option.presets[0];
  const templateData = preset.factory();

  return {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: customTitle?.trim() || preset.title || option.defaultTitle,
    pageNumber: pageNumber,
    contentType: type,
    bullets: templateData.bullets,
    paragraphs: templateData.paragraphs,
    tableHeaders: templateData.tableHeaders,
    tableRows: templateData.tableRows,
    keyValuePairs: templateData.keyValuePairs,
    calloutText: templateData.calloutText,
    calloutType: templateData.calloutType,
  };
}
