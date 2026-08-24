import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET versions for a document
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id: projectId } = params;
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');
    const versionId = searchParams.get('versionId');

    if (!docId) {
      return NextResponse.json({ error: 'docId query parameter is required' }, { status: 400 });
    }

    // If versionId is specified, return the full document for that version
    if (versionId) {
      const version = db.prepare(
        'SELECT * FROM document_versions WHERE id = ? AND documentId = ?'
      ).get(Number(versionId), docId) as any;

      if (!version) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: version.id,
        documentId: version.documentId,
        projectId: version.projectId,
        versionNumber: version.versionNumber,
        savedAt: version.savedAt,
        savedBy: version.savedBy,
        document: version.document ? JSON.parse(version.document) : null,
      });
    }

    // Otherwise, return metadata list of all versions (without full document JSON)
    const versions = db.prepare(
      'SELECT id, documentId, projectId, versionNumber, savedAt, savedBy FROM document_versions WHERE documentId = ? AND projectId = ? ORDER BY versionNumber DESC'
    ).all(docId, projectId) as any[];

    return NextResponse.json(versions);
  } catch (error: any) {
    console.error('Fetch versions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST restore a version
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id: projectId } = params;
    const body = await request.json();
    const { docId, versionId } = body;

    if (!docId || !versionId) {
      return NextResponse.json({ error: 'docId and versionId are required' }, { status: 400 });
    }

    // Get the version's document snapshot
    const version = db.prepare(
      'SELECT document FROM document_versions WHERE id = ? AND documentId = ?'
    ).get(Number(versionId), docId) as { document: string } | undefined;

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Save current state as a new version before restoring
    const existingDoc = db.prepare('SELECT document FROM documents WHERE id = ?').get(docId) as { document: string } | undefined;
    if (existingDoc?.document) {
      const maxVersion = db.prepare('SELECT MAX(versionNumber) as maxV FROM document_versions WHERE documentId = ?').get(docId) as { maxV: number | null } | undefined;
      const nextVersion = (maxVersion?.maxV || 0) + 1;
      db.prepare(`
        INSERT INTO document_versions (documentId, projectId, versionNumber, savedAt, savedBy, document)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(docId, projectId, nextVersion, new Date().toISOString(), 'System (before restore)', existingDoc.document);
    }

    // Restore: update the document with the version's content
    db.prepare('UPDATE documents SET document = ?, lastModified = ? WHERE id = ?')
      .run(version.document, new Date().toLocaleString(), docId);

    return NextResponse.json({ success: true, message: 'Version restored successfully' });
  } catch (error: any) {
    console.error('Restore version error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
