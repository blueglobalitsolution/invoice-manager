import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all projects (along with their documents)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';

    // Fetch projects (newest inserted on top)
    const stmt = db.prepare('SELECT * FROM projects WHERE userId = ? ORDER BY rowid DESC');
    const projectRows = stmt.all(userId) as any[];

    const projects = projectRows.map((row) => {
      // Fetch documents belonging to this project (newest on top)
      const docStmt = db.prepare('SELECT * FROM documents WHERE projectId = ? ORDER BY rowid DESC');
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
        clientAddress: row.clientAddress || '',
        clientGstNo: row.clientGstNo || '',
        contactPerson: row.contactPerson || '',
        location: row.location,
        category: row.category,
        budget: row.budget || '',
        status: row.status,
        owner: row.owner,
        lastModified: row.lastModified,
        tags: row.tags ? JSON.parse(row.tags) : [],
        companyProfile: row.companyProfile ? JSON.parse(row.companyProfile) : undefined,
        isArchived: row.isArchived === 1,
        isFavourite: row.isFavourite === 1,
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
    const newProject = await request.json();
    const { id, title, category, code, document } = newProject;

    if (!id || !title) {
      return NextResponse.json({ error: 'ID and title are required' }, { status: 400 });
    }

    // Insert project record
    const stmt = db.prepare(`
      INSERT INTO projects (id, userId, title, code, clientName, clientAddress, clientGstNo, contactPerson, location, category, budget, status, owner, lastModified, tags, companyProfile, isArchived)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      newProject.id,
      newProject.userId || 'guest',
      newProject.title,
      newProject.code || '',
      newProject.clientName || '',
      newProject.clientAddress || '',
      newProject.clientGstNo || '',
      newProject.contactPerson || '',
      newProject.location || '',
      newProject.category || '',
      newProject.budget || '',
      newProject.status || 'active',
      newProject.owner || 'You',
      newProject.lastModified || new Date().toLocaleString(),
      JSON.stringify(newProject.tags || []),
      newProject.companyProfile ? JSON.stringify(newProject.companyProfile) : null,
      newProject.isArchived ? 1 : 0
    );

    // Insert document records linked to this project
    const insertDocStmt = db.prepare(`
      INSERT INTO documents (id, projectId, title, docType, docNumber, status, lastModified, document)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    if (newProject.documents && Array.isArray(newProject.documents)) {
      if (newProject.documents.length > 0) {
        for (const [idx, doc] of newProject.documents.entries()) {
          const docId = doc.id && doc.projectId === id ? doc.id : `doc_${id.split('_')[1] || Date.now()}_${idx}`;
          insertDocStmt.run(
            docId,
            id,
            doc.title || title || 'Untitled Document',
            doc.docType || 'quotation',
            doc.docNumber || code || '',
            doc.status || 'draft',
            doc.lastModified || newProject.lastModified || new Date().toLocaleString(),
            doc.document ? JSON.stringify(doc.document) : '{}'
          );
        }
      }
      // If newProject.documents is empty array ([]), do NOT insert any documents. It is an empty project.
    } else if (newProject.document) {
      // Legacy Fallback: Insert single initial document only if documents array was not provided
      const docId = `doc_${id.split('_')[1] || Date.now()}`;
      const docType = category?.toLowerCase().includes('invoice') 
        ? 'tax_invoice' 
        : category?.toLowerCase().includes('quotation') 
        ? 'quotation' 
        : 'work_order';

      insertDocStmt.run(
        docId,
        id,
        title,
        docType,
        code || '',
        'draft',
        newProject.lastModified || new Date().toLocaleString(),
        JSON.stringify(newProject.document)
      );
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
