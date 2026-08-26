import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET single project along with its documents
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Fetch documents linked to this project (newest on top)
    const docStmt = db.prepare('SELECT * FROM documents WHERE projectId = ? ORDER BY rowid DESC');
    const docRows = docStmt.all(id) as any[];

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

    const activeDoc = documents[0] || null;

    const project = {
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
      companyProfile: row.companyProfile ? JSON.parse(row.companyProfile) : undefined,
      isArchived: row.isArchived === 1,
      isFavourite: row.isFavourite === 1,
      documents: documents,
      document: activeDoc ? activeDoc.document : null,
    };

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Fetch project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update project
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    // Check if project exists
    const checkStmt = db.prepare('SELECT id FROM projects WHERE id = ?');
    const existing = checkStmt.get(id);
    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update Projects Metadata
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    const allowedFields = [
      'title',
      'code',
      'clientName',
      'location',
      'category',
      'budget',
      'owner',
      'lastModified',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        fieldsToUpdate.push(`${field} = ?`);
        values.push(body[field]);
      }
    });

    if (body.tags !== undefined) {
      fieldsToUpdate.push('tags = ?');
      values.push(JSON.stringify(body.tags));
    }

    if (body.companyProfile !== undefined) {
      fieldsToUpdate.push('companyProfile = ?');
      values.push(body.companyProfile ? JSON.stringify(body.companyProfile) : null);
    }

    if (body.status !== undefined) {
      fieldsToUpdate.push('status = ?');
      values.push(body.status);
      if (body.isArchived === undefined) {
        fieldsToUpdate.push('isArchived = ?');
        values.push(body.status === 'archived' ? 1 : 0);
      }
    }

    if (body.isArchived !== undefined) {
      fieldsToUpdate.push('isArchived = ?');
      values.push(body.isArchived ? 1 : 0);
      if (body.status === undefined) {
        fieldsToUpdate.push('status = ?');
        values.push(body.isArchived ? 'archived' : 'active');
      }
    }

    if (body.isFavourite !== undefined) {
      fieldsToUpdate.push('isFavourite = ?');
      values.push(body.isFavourite ? 1 : 0);
    }

    if (fieldsToUpdate.length > 0) {
      values.push(id);
      const updateProjStmt = db.prepare(`
        UPDATE projects 
        SET ${fieldsToUpdate.join(', ')}
        WHERE id = ?
      `);
      updateProjStmt.run(...values);
    }

    // Update linked Document JSON state if document payload is provided
    // Save version snapshots before updating
    const saveVersionSnapshot = (docId: string, projectId: string) => {
      try {
        const existingDoc = db.prepare('SELECT document FROM documents WHERE id = ?').get(docId) as { document: string } | undefined;
        if (existingDoc?.document) {
          const maxVersion = db.prepare('SELECT MAX(versionNumber) as maxV FROM document_versions WHERE documentId = ?').get(docId) as { maxV: number | null } | undefined;
          const nextVersion = (maxVersion?.maxV || 0) + 1;
          db.prepare(`
            INSERT INTO document_versions (documentId, projectId, versionNumber, savedAt, savedBy, document)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(docId, projectId, nextVersion, new Date().toISOString(), body.savedBy || 'User', existingDoc.document);
          
          // Keep only last 50 versions per document
          const countResult = db.prepare('SELECT COUNT(*) as cnt FROM document_versions WHERE documentId = ?').get(docId) as { cnt: number };
          if (countResult.cnt > 50) {
            db.prepare(`
              DELETE FROM document_versions WHERE documentId = ? AND id NOT IN (
                SELECT id FROM document_versions WHERE documentId = ? ORDER BY versionNumber DESC LIMIT 50
              )
            `).run(docId, docId);
          }
        }
      } catch (err) {
        console.error('Error saving version snapshot:', err);
      }
    };

    if (body.documents && Array.isArray(body.documents)) {
      const upsertDocStmt = db.prepare(`
        INSERT INTO documents (id, projectId, title, docType, docNumber, status, lastModified, document)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          docType = excluded.docType,
          docNumber = excluded.docNumber,
          status = excluded.status,
          lastModified = excluded.lastModified,
          document = excluded.document
      `);
      
      const deleteDocStmt = db.prepare('DELETE FROM documents WHERE projectId = ? AND id NOT IN (SELECT value FROM json_each(?))');

      const incomingIds = body.documents.map((d: any) => d.id);
      
      db.transaction(() => {
         if (incomingIds.length > 0) {
           deleteDocStmt.run(id, JSON.stringify(incomingIds));
         } else {
           db.prepare('DELETE FROM documents WHERE projectId = ?').run(id);
         }

         for (const doc of body.documents) {
            if (doc.document) saveVersionSnapshot(doc.id, id);
            upsertDocStmt.run(
              doc.id,
              id,
              doc.title || 'Untitled Document',
              doc.docType || 'quotation',
              doc.docNumber || '',
              doc.status || 'draft',
              doc.lastModified || body.lastModified || new Date().toLocaleString(),
              doc.document ? JSON.stringify(doc.document) : null
            );
         }
      })();
    } else if (body.document !== undefined) {
      // Find the first document of this project to update
      const docCheckStmt = db.prepare('SELECT id FROM documents WHERE projectId = ? LIMIT 1');
      const docRecord = docCheckStmt.get(id) as { id: string } | undefined;

      if (docRecord) {
        saveVersionSnapshot(docRecord.id, id);
        const updateDocStmt = db.prepare(`
          UPDATE documents
          SET document = ?, lastModified = ?, title = ?
          WHERE id = ?
        `);
        updateDocStmt.run(
          JSON.stringify(body.document),
          body.lastModified || new Date().toLocaleString(),
          body.title || body.document.title || 'Untitled Document',
          docRecord.id
        );
      } else {
        // Fallback: create a new document entry if somehow missing
        const newDocId = `doc_${id.split('_')[1] || Date.now()}`;
        const docType = body.category?.toLowerCase().includes('invoice') ? 'tax_invoice' : 'quotation';
        const insertDocStmt = db.prepare(`
          INSERT INTO documents (id, projectId, title, docType, docNumber, status, lastModified, document)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insertDocStmt.run(
          newDocId,
          id,
          body.title || 'Untitled Document',
          docType,
          body.code || '',
          'draft',
          body.lastModified || new Date().toLocaleString(),
          JSON.stringify(body.document)
        );
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE project
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const deleteStmt = db.prepare('DELETE FROM projects WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
