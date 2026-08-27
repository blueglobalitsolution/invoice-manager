import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

// Locate installed Chrome or Edge on Windows/Linux/Mac
function getBrowserExecutablePath(): string {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

export async function POST(request: Request) {
  try {
    const { html, filename } = await request.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    const executablePath = getBrowserExecutablePath();

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    try {
      const page = await browser.newPage();
      
      // Set viewport to exact A4 pixel dimensions
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

      await page.setContent(html, {
        waitUntil: 'load',
        timeout: 30000,
      });

      // Wait for all custom fonts to finish loading
      try {
        await page.evaluateHandle('document.fonts.ready');
      } catch (e) {
        // Continue if fonts ready check fails
      }

      await page.emulateMediaType('print');

      // Generate true vector PDF with embedded fonts and selectable text
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });

      const safeFilename = (filename || 'document.pdf').replace(/[^\w\s.-]/gi, '_');

      return new NextResponse(Buffer.from(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeFilename}"`,
          'Content-Length': pdfBuffer.length.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error('Vector PDF generation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
