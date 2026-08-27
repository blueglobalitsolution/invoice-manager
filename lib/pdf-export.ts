/**
 * Directly downloads the document as a genuine vector text .pdf file into the user's storage.
 * Uses headless Chromium on the backend for 100% selectable, copyable text, crisp typography, and zero print dialog.
 */
export async function exportToPdf(element?: HTMLElement | null, filename: string = 'document.pdf') {
  if (typeof window === 'undefined') return;

  const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const container = element || document.getElementById('pdf-preview-container');

  if (!container) {
    console.error('PDF preview container not found.');
    return;
  }

  // Clone container to clean it up before sending to server
  const clone = container.cloneNode(true) as HTMLElement;

  // Remove any zoom transform
  clone.style.zoom = '1';
  clone.style.transform = 'none';

  // Strip all selection rings, outlines, and active emerald backgrounds on cloned DOM
  const highlighted = clone.querySelectorAll<HTMLElement>('.ring-2, [class*="ring-"], [class*="bg-emerald"]');
  highlighted.forEach((el) => {
    el.classList.remove(
      'ring-2',
      'ring-emerald-600',
      'ring-emerald-400',
      'ring-emerald-500',
      'ring-emerald-300',
      'bg-emerald-50',
      'bg-emerald-500',
      'shadow-xs'
    );
    el.style.boxShadow = 'none';
    el.style.outline = 'none';
    if (el.className.includes('bg-emerald')) {
      el.style.backgroundColor = 'transparent';
    }
  });

  // Extract all compiled CSS rules from document.styleSheets
  let inlinedCss = '';
  try {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach((rule) => {
            inlinedCss += rule.cssText + '\n';
          });
        }
      } catch (e) {
        // Fallback for cross-origin sheets
      }
    });
  } catch (e) {
    console.warn('Could not read styleSheets:', e);
  }

  // Also collect all inline <style> elements
  document.querySelectorAll('style').forEach((tag) => {
    if (tag.textContent) {
      inlinedCss += tag.textContent + '\n';
    }
  });

  // Collect external stylesheet links with absolute URLs
  let headLinks = '';
  document.querySelectorAll('link[rel="stylesheet"]').forEach((linkTag) => {
    const href = linkTag.getAttribute('href');
    if (href) {
      const absoluteHref = new URL(href, window.location.origin).href;
      headLinks += `<link rel="stylesheet" href="${absoluteHref}">\n`;
    }
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <base href="${window.location.origin}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=STIX+Two+Text:ital,wght@0,400..700;1,400..700&family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap">
  ${headLinks}
  <style>
    ${inlinedCss}
  </style>
  <style>
    @page {
      size: A4 portrait;
      margin: 0mm;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    .latex-paper {
      margin: 0 auto !important;
      box-shadow: none !important;
      border: none !important;
      width: 210mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      height: 297mm !important;
      box-sizing: border-box !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden !important;
    }
    .latex-paper:last-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    *, *::before, *::after {
      box-shadow: none !important;
      outline: none !important;
      --tw-ring-shadow: none !important;
      --tw-ring-offset-shadow: none !important;
      --tw-shadow: none !important;
      --tw-ring-color: transparent !important;
    }
    [class*="ring-"],
    [class*="bg-emerald"] {
      box-shadow: none !important;
      outline: none !important;
      background-color: transparent !important;
    }
  </style>
</head>
<body style="background: #ffffff; margin: 0; padding: 0;">
  ${clone.outerHTML}
</body>
</html>`;

  try {
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: fullHtml, filename: cleanName }),
    });

    if (!response.ok) {
      throw new Error(`PDF generation failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = cleanName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
  } catch (err) {
    console.error('Vector PDF export error:', err);
    throw err;
  }
}


