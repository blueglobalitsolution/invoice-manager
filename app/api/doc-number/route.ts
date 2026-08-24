import { NextResponse } from 'next/server';
import db from '@/lib/db';

function getFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();
  
  // Indian fiscal year: April to March
  if (month >= 3) { // April onwards
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

function getPrefix(docType: string): string {
  switch (docType) {
    case 'invoice':
    case 'tax_invoice':
      return 'INV';
    case 'quotation':
      return 'QTN';
    case 'work_order':
      return 'WO';
    case 'purchase_order':
      return 'PO';
    case 'technical_specs':
      return 'TS';
    case 'contract':
      return 'CON';
    default:
      return 'DOC';
  }
}

export async function POST(request: Request) {
  try {
    const { userId, docType } = await request.json();

    if (!userId || !docType) {
      return NextResponse.json({ error: 'userId and docType are required' }, { status: 400 });
    }

    const counterId = `${userId}:${docType}`;
    const fy = getFinancialYear();
    const prefix = getPrefix(docType);

    // Upsert the counter
    const existing = db.prepare('SELECT lastNumber FROM doc_counters WHERE id = ?').get(counterId) as { lastNumber: number } | undefined;
    
    let nextNumber: number;
    if (existing) {
      nextNumber = existing.lastNumber + 1;
      db.prepare('UPDATE doc_counters SET lastNumber = ? WHERE id = ?').run(nextNumber, counterId);
    } else {
      nextNumber = 1;
      db.prepare('INSERT INTO doc_counters (id, userId, docType, lastNumber) VALUES (?, ?, ?, ?)').run(counterId, userId, docType, nextNumber);
    }

    const paddedNumber = nextNumber.toString().padStart(3, '0');
    const docNumber = `GI/${prefix}/${fy}/${paddedNumber}`;

    return NextResponse.json({ docNumber, nextNumber });
  } catch (error: any) {
    console.error('Generate doc number error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
