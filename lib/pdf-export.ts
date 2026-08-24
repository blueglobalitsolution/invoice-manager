import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports all document pages (.latex-paper) to a clean multi-page A4 PDF file,
 * or triggers the native browser print dialog as fallback.
 */
export async function exportToPdf(element: HTMLElement | null, filename: string = 'document.pdf') {
  const container = element || document.getElementById('pdf-preview-container') || document.body;
  const originalZoom = container.style.zoom;

  try {
    // Reset zoom temporarily for crisp 1:1 scale rendering
    container.style.zoom = '1';
    await new Promise((resolve) => setTimeout(resolve, 80));

    const pageElements = document.querySelectorAll<HTMLElement>('.latex-paper');
    
    if (pageElements.length > 0) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        
        const canvas = await html2canvas(pageEl, {
          scale: 2, // 300 DPI equivalent
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Standard A4 dimensions in mm: 210 x 297
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return;
    }

    // Fallback if no .latex-paper elements found
    window.print();
  } catch (err) {
    console.error('Canvas PDF export error, falling back to print dialog:', err);
    window.print();
  } finally {
    container.style.zoom = originalZoom;
  }
}

