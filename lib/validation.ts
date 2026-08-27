/**
 * Input & Text Validation and Formatting Utilities
 */

// GST Number Validator (15-character Indian GST format)
export function validateGstNumber(gst: string): { isValid: boolean; message?: string } {
  if (!gst || gst.trim() === '') return { isValid: true };
  const clean = gst.trim().toUpperCase();
  if (clean.length !== 15) {
    return { isValid: false, message: `GST must be 15 characters (currently ${clean.length})` };
  }
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstRegex.test(clean)) {
    return { isValid: false, message: 'Invalid GST format (e.g. 24CLNPS9550H1ZI)' };
  }
  return { isValid: true };
}

// PAN Number Validator (10-character Indian PAN format)
export function validatePanNumber(pan: string): { isValid: boolean; message?: string } {
  if (!pan || pan.trim() === '') return { isValid: true };
  const clean = pan.trim().toUpperCase();
  if (clean.length !== 10) {
    return { isValid: false, message: `PAN must be 10 characters (currently ${clean.length})` };
  }
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(clean)) {
    return { isValid: false, message: 'Invalid PAN format (e.g. CLNPS9550H)' };
  }
  return { isValid: true };
}

// Email Validator
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Phone Number Validator
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 13;
}

// Sanitizes numeric inputs: only allows digits and single decimal point
export function sanitizeNumericInput(val: string, allowDecimal: boolean = true): string {
  if (!val) return '';
  if (!allowDecimal) {
    return val.replace(/[^0-9]/g, '');
  }
  // Allow digits and one dot
  let cleaned = val.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
}

// Auto formats GST input to uppercase and max 15 chars
export function formatGstInput(val: string): string {
  return val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
}

// Auto formats PAN input to uppercase and max 10 chars
export function formatPanInput(val: string): string {
  return val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 10);
}

// Formats HSN input (digits only, max 8 chars)
export function formatHsnInput(val: string): string {
  return val.replace(/[^0-9]/g, '').slice(0, 8);
}

// Auto formats and sanitizes Date inputs (DD/MM/YYYY)
export function formatDateInput(val: string): string {
  if (!val) return '';
  // Only allow digits and forward slash / dash, max 10 characters
  return val.replace(/[^0-9/-]/g, '').slice(0, 10);
}

// Auto formats phone input (+91 / digits / space / dash)
export function sanitizePhoneInput(val: string): string {
  if (!val) return '';
  return val.replace(/[^0-9+\s-]/g, '').slice(0, 18);
}
