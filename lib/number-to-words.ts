/**
 * Indian Number to Words Converter
 * Converts numeric amounts into Indian Currency English Words.
 * e.g., 380696 -> "Rupee: Three Lakhs Eighty Thousand Six Hundred Ninety-Six Only."
 */

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    str += `${TENS[Math.floor(n / 10)]}${n % 10 !== 0 ? `-${ONES[n % 10]}` : ''} `;
  } else if (n > 0) {
    str += `${ONES[n]} `;
  }
  return str.trim();
}

export function numberToIndianWords(amount: number | string, prefix: string = 'Rupee: '): string {
  if (amount === undefined || amount === null || amount === '') {
    return '';
  }

  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  if (isNaN(num) || num === 0) return `${prefix}Zero Only.`;

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const rupees = Math.floor(absNum);
  const paise = Math.round((absNum - rupees) * 100);

  let crore = Math.floor(rupees / 10000000);
  let rem = rupees % 10000000;
  let lakh = Math.floor(rem / 100000);
  rem %= 100000;
  let thousand = Math.floor(rem / 1000);
  rem %= 1000;
  let hundred = rem;

  let words = '';

  if (crore > 0) {
    words += `${convertBelowThousand(crore)} ${crore > 1 ? 'Crores' : 'Crore'} `;
  }
  if (lakh > 0) {
    words += `${convertBelowThousand(lakh)} ${lakh > 1 ? 'Lakhs' : 'Lakh'} `;
  }
  if (thousand > 0) {
    words += `${convertBelowThousand(thousand)} Thousand `;
  }
  if (hundred > 0) {
    words += `${convertBelowThousand(hundred)} `;
  }

  words = words.trim();
  if (!words) words = 'Zero';

  let result = `${prefix}${isNegative ? 'Minus ' : ''}${words}`;

  if (paise > 0) {
    result += ` and ${convertBelowThousand(paise)} Paise`;
  }

  result += ' Only.';
  return result;
}
