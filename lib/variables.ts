import { LatexDocument, PurchaseOrderData } from '@/types/document';

export const DEFAULT_GLOBAL_VARIABLES: Record<string, string> = {
  CLIENT_NAME: 'M/s. R. K. Engineering Works',
  PROJECT_NAME: 'Structural & Piping Erection Project',
  PROJECT_LOCATION: 'Reliance Complex, Jamnagar, Gujarat',
  PO_NUMBER: 'SGE/PO/2024-25/089',
  PO_DATE: '14/08/2024',
  COMPANY_NAME: 'SHREE GANESH ENGINEERING',
  GST_NO: '24AAFPS8712C123',
  TOTAL_AMOUNT: '₹ 10,69,250/-',
  AMOUNT_IN_WORDS: 'Ten Lakh Sixty-Nine Thousand Two Hundred Fifty Only.',
  COMPANY_PHONE: '+91 98250 12345',
  COMPANY_EMAIL: 'shreeganesheng@gmail.com',
  RETENTION_PCT: '5%',
  MOBILIZATION_ADVANCE: '15%',
  BILLING_CYCLE: '25th of every month',
  JURISDICTION_CITY: 'Vadodara, Gujarat',
};

/**
 * Replace placeholders like {{CLIENT_NAME}} with their variable values
 */
export function applyVariables(
  text: string | undefined | null,
  customVariables?: Record<string, string>,
  po?: PurchaseOrderData
): string {
  if (!text) return '';

  // Merge built-in PO values, defaults, and custom variables
  const mergedVars: Record<string, string> = {
    ...DEFAULT_GLOBAL_VARIABLES,
  };

  if (po) {
    if (po.contractorName) mergedVars.CLIENT_NAME = po.contractorName;
    if (po.projectName) mergedVars.PROJECT_NAME = po.projectName;
    if (po.projectLocation) mergedVars.PROJECT_LOCATION = po.projectLocation;
    if (po.poNumber) mergedVars.PO_NUMBER = po.poNumber;
    if (po.poDate) mergedVars.PO_DATE = po.poDate;
    if (po.companyName) mergedVars.COMPANY_NAME = `${po.companyName} ${po.companySubtitle || ''}`.trim();
    if (po.gstNo) mergedVars.GST_NO = po.gstNo;
    if (po.amountInWords) mergedVars.AMOUNT_IN_WORDS = po.amountInWords;
    if (po.companyPhone) mergedVars.COMPANY_PHONE = po.companyPhone;
    if (po.companyEmail) mergedVars.COMPANY_EMAIL = po.companyEmail;
  }

  if (customVariables) {
    Object.assign(mergedVars, customVariables);
  }

  // Replace {{VAR_NAME}} or {{ VAR_NAME }}
  return text.replace(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g, (match, key) => {
    const uppercaseKey = key.toUpperCase();
    if (mergedVars[uppercaseKey] !== undefined) {
      return mergedVars[uppercaseKey];
    }
    if (mergedVars[key] !== undefined) {
      return mergedVars[key];
    }
    // Return original placeholder if not found
    return match;
  });
}

/**
 * Helper to replace variables in an array of strings
 */
export function applyVariablesToArray(
  items: string[] | undefined,
  customVariables?: Record<string, string>,
  po?: PurchaseOrderData
): string[] {
  if (!items) return [];
  return items.map((item) => applyVariables(item, customVariables, po));
}
