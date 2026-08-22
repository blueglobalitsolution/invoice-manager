import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all projects (along with their documents)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';

    // Fetch projects
    const stmt = db.prepare('SELECT * FROM projects WHERE userId = ? ORDER BY lastModified DESC');
    const projectRows = stmt.all(userId) as any[];

    const projects = projectRows.map((row) => {
      // Fetch documents belonging to this project
      const docStmt = db.prepare('SELECT * FROM documents WHERE projectId = ? ORDER BY lastModified DESC');
      const docRows = docStmt.all(row.id) as any[];

      const documents = docRows.map((d) => ({
        id: d.id,
        projectId: d.projectId,
        title: d.title,
        docType: d.docType,
        docNumber: d.docNumber,
        status: d.status,
        lastModified: d.lastModified,
        document: d.document ? JSON.parse(d.document) : null,
      }));

      // Fallback/Legacy support: populate first document as main project document
      const activeDoc = documents[0] || null;

      return {
        id: row.id,
        userId: row.userId,
        title: row.title,
        code: row.code,
        clientName: row.clientName,
        location: row.location,
        category: row.category,
        budget: row.budget || '',
        status: row.status,
        owner: row.owner,
        lastModified: row.lastModified,
        tags: row.tags ? JSON.parse(row.tags) : [],
        isArchived: row.isArchived === 1,
        documents: documents,
        document: activeDoc ? activeDoc.document : null,
      };
    });

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Fetch projects error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create project
export async function POST(request: Request) {
  try {
    const { id, userId, title, code, clientName, location, category, budget, status, owner, lastModified, tags, isArchived, document } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: 'ID and title are required' }, { status: 400 });
    }

    // Insert project record
    const insertProjStmt = db.prepare(`
      INSERT INTO projects (id, userId, title, code, clientName, location, category, budget, status, owner, lastModified, tags, isArchived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProjStmt.run(
      id,
      userId || 'guest',
      title,
      code || '',
      clientName || '',
      location || '',
      category || '',
      budget || '',
      status || 'active',
      owner || 'You',
      lastModified || new Date().toLocaleString(),
      tags ? JSON.stringify(tags) : '[]',
      isArchived ? 1 : 0
    );

    // Insert initial document record linked to this project
    const docId = `doc_${id.split('_')[1] || Date.now()}`;
    const docType = category?.toLowerCase().includes('invoice') 
      ? 'tax_invoice' 
      : category?.toLowerCase().includes('quotation') 
      ? 'quotation' 
      : 'work_order';

    const insertDocStmt = db.prepare(`
      INSERT INTO documents (id, projectId, title, docType, docNumber, status, lastModified, document)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDocStmt.run(
      docId,
      id,
      title,
      docType,
      code || '',
      'draft',
      lastModified || new Date().toLocaleString(),
      document ? JSON.stringify(document) : '{}'
    );

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
