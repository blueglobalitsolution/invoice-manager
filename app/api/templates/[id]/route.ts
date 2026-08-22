import { NextResponse } from 'next/server';
import db from '@/lib/db';

// DELETE custom template
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const deleteStmt = db.prepare('DELETE FROM templates WHERE id = ?');
    const result = deleteStmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
