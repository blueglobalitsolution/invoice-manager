import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const userId = searchParams.get('userId') || 'guest';

    if (!query) {
      return NextResponse.json([]);
    }

    const likeQuery = `%${query}%`;

    // Search in projects
    const projectResults = db.prepare(`
      SELECT id, title, code, clientName, location, category, budget, status, lastModified, tags
      FROM projects
      WHERE userId = ? AND (
        title LIKE ? OR
        code LIKE ? OR
        clientName LIKE ? OR
        location LIKE ? OR
        category LIKE ? OR
        budget LIKE ? OR
        tags LIKE ?
      )
      ORDER BY lastModified DESC
      LIMIT 20
    `).all(userId, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery) as any[];

    // Search in documents
    const docResults = db.prepare(`
      SELECT d.id, d.projectId, d.title, d.docType, d.docNumber, d.status, d.lastModified, d.document,
             p.title as projectTitle, p.code as projectCode
      FROM documents d
      JOIN projects p ON d.projectId = p.id
      WHERE p.userId = ? AND (
        d.title LIKE ? OR
        d.docNumber LIKE ? OR
        d.docType LIKE ? OR
        d.document LIKE ?
      )
      ORDER BY d.lastModified DESC
      LIMIT 30
    `).all(userId, likeQuery, likeQuery, likeQuery, likeQuery) as any[];

    // Format results
    const results = {
      projects: projectResults.map((p: any) => ({
        type: 'project' as const,
        id: p.id,
        title: p.title,
        code: p.code,
        clientName: p.clientName,
        location: p.location,
        category: p.category,
        status: p.status,
        lastModified: p.lastModified,
      })),
      documents: docResults.map((d: any) => {
        // Find matching field in document content
        let matchContext = '';
        if (d.document) {
          try {
            const docStr = d.document.toLowerCase();
            const idx = docStr.indexOf(query.toLowerCase());
            if (idx >= 0) {
              const start = Math.max(0, idx - 30);
              const end = Math.min(docStr.length, idx + query.length + 30);
              matchContext = '...' + d.document.substring(start, end) + '...';
            }
          } catch {}
        }

        return {
          type: 'document' as const,
          id: d.id,
          projectId: d.projectId,
          projectTitle: d.projectTitle,
          projectCode: d.projectCode,
          title: d.title,
          docType: d.docType,
          docNumber: d.docNumber,
          status: d.status,
          lastModified: d.lastModified,
          matchContext,
        };
      }),
    };

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
