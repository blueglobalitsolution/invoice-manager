import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET custom templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';

    const stmt = db.prepare('SELECT * FROM templates WHERE userId = ? ORDER BY createdAt DESC');
    const rows = stmt.all(userId) as any[];

    const templates = rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description,
      createdAt: row.createdAt,
      document: row.document ? JSON.parse(row.document) : null,
    }));

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Fetch templates error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create custom template
export async function POST(request: Request) {
  try {
    const { id, userId, name, description, createdAt, document } = await request.json();

    if (!id || !name || !document) {
      return NextResponse.json({ error: 'ID, name, and document are required' }, { status: 400 });
    }

    const insertStmt = db.prepare(`
      INSERT INTO templates (id, userId, name, description, createdAt, document)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      id,
      userId || 'guest',
      name,
      description || '',
      createdAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      JSON.stringify(document)
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
