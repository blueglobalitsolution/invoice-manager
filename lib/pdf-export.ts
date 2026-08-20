import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exports all document pages (.latex-paper) to a clean multi-page A4 PDF file,
 * or triggers the native browser print dialog as fallback.
 */
export async function exportToPdf(element: HTMLElement | null, filename: string = 'document.pdf') {
  if (!element) {
    window.print();
    return;
  }

  try {
    const pageElements = element.querySelectorAll<HTMLElement>('.latex-paper');
    
    if (pageElements.length > 0) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        
        const canvas = await html2canvas(pageEl, {
          scale: 2, // High resolution (300 DPI equivalent)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Exact standard A4 dimensions in mm: 210 x 297
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      return;
    }

    // Fallback if no .latex-paper elements found
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } catch (err) {
    console.error('Canvas PDF export error, falling back to print dialog:', err);
    window.print();
  }
}

