/**
 * Exports document to PDF using the native browser print engine.
 * Generates true vector text, crisp embedded fonts, and exact A4 pagination.
 */
export async function exportToPdf(_element?: HTMLElement | null, filename: string = 'document.pdf') {
  if (typeof window === 'undefined') return;

  const originalTitle = document.title;
  try {
    // Set tab title to document name so browser defaults the PDF filename
    const cleanName = filename.replace(/\.pdf$/i, '');
    if (cleanName) {
      document.title = cleanName;
    }

    // Trigger browser print dialog
    window.print();
  } catch (err) {
    console.error('PDF export error:', err);
  } finally {
    setTimeout(() => {
      document.title = originalTitle;
    }, 1200);
  }
}

