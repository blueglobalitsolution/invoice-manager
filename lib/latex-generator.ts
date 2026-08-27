import { LatexDocument, CustomSectionItem } from '@/types/document';
import { CompanyProfile } from '@/types/project';

function renderSectionToLatex(sec: CustomSectionItem): string {
  let content = `\n{\\color{sectioncolor} \\large \\textbf{${sec.title}}}\n`;

  if (sec.contentType === 'bullet_list' && sec.bullets) {
    content += `\\begin{itemize}[leftmargin=14pt, topsep=2pt, itemsep=3pt]\n`;
    content += sec.bullets.map((b) => `    \\item ${b}`).join('\n');
    content += `\n\\end{itemize}\n`;
  } else if (sec.contentType === 'legal_clause' && sec.paragraphs) {
    content += `\\begin{enumerate}[label=\\textbf{\\arabic*.0}, leftmargin=18pt, topsep=2pt, itemsep=4pt]\n`;
    content += sec.paragraphs.map((p) => `    \\item ${p}`).join('\n');
    content += `\n\\end{enumerate}\n`;
  } else if (sec.contentType === 'paragraphs' && sec.paragraphs) {
    content += sec.paragraphs.map((p) => `\\vspace{4pt}\n${p}\n`).join('\n');
  } else if (sec.contentType === 'table' && sec.tableHeaders && sec.tableRows) {
    const colsCount = sec.tableHeaders.length;
    const colSpec = '|' + Array(colsCount).fill('X').join('|') + '|';
    content += `\\begin{center}\n\\begin{tabularx}{\\textwidth}{${colSpec}}\n\\hline\n`;
    content += sec.tableHeaders.map((h) => `\\textbf{${h}}`).join(' & ') + ` \\\\\n\\hline\n`;
    content += sec.tableRows
      .map((row) => row.join(' & ') + ` \\\\`)
      .join('\n');
    content += `\n\\hline\n\\end{tabularx}\n\\end{center}\n`;
  } else if (sec.contentType === 'key_value' && sec.keyValuePairs) {
    content += `\\begin{center}\n\\begin{tabularx}{\\textwidth}{|p{3.5cm}|X|}\n\\hline\n`;
    content += sec.keyValuePairs
      .map((kv) => `\\textbf{${kv.key}} & ${kv.value} \\\\`)
      .join('\n\\hline\n');
    content += `\n\\hline\n\\end{tabularx}\n\\end{center}\n`;
  } else if (sec.contentType === 'callout' && sec.calloutText) {
    content += `\\begin{center}\n\\fbox{\\begin{minipage}{0.96\\textwidth}\n`;
    content += `\\textbf{${(sec.calloutType || 'NOTICE').toUpperCase()}}\\\\\n`;
    content += `\\textit{${sec.calloutText}}\n`;
    content += `\\end{minipage}}\n\\end{center}\n`;
  }

  return content;
}

/**
 * Converts the structured LatexDocument form state into standard valid LaTeX source code (.tex).
 */
export function generateLatexCode(doc: LatexDocument, companyProfile?: CompanyProfile): string {
  // If this document is a Quotation
  if (doc.quotation) {
    return generateQuotationLatex(doc, companyProfile);
  }

  // If this document is a Tax Invoice
  if (doc.taxInvoice) {
    return generateTaxInvoiceLatex(doc, companyProfile);
  }

  // If this document is a Purchase Order (Labour Contract Purchase Order)
  if (doc.purchaseOrder) {
    const po = doc.purchaseOrder;
    const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
    const customSections = po.customSections || [];
    const customPages = po.customPages || [];

    const maxServices = Math.max(
      pProfile.leftServices?.length || po.leftServices.length,
      pProfile.rightServices?.length || po.rightServices.length
    );
    const servicesRows: string[] = [];
    const leftServicesSrc = pProfile.leftServices || po.leftServices;
    const rightServicesSrc = pProfile.rightServices || po.rightServices;
    for (let i = 0; i < maxServices; i++) {
      const left = leftServicesSrc[i] ? leftServicesSrc[i].replace(/&/g, '\\&') : '';
      const right = rightServicesSrc[i] ? rightServicesSrc[i].replace(/&/g, '\\&') : '';
      servicesRows.push(`            ${left} & ${right} \\\\`);
    }

    const page1CustomSecs = customSections
      .filter((s) => s.pageNumber === 1)
      .map(renderSectionToLatex)
      .join('\n');

    const page2CustomSecs = customSections
      .filter((s) => s.pageNumber === 2)
      .map(renderSectionToLatex)
      .join('\n');

    const page3CustomSecs = customSections
      .filter((s) => s.pageNumber === 3)
      .map(renderSectionToLatex)
      .join('\n');

    const customPagesLatex = customPages
      .map((cp) => {
        const pSecs = customSections
          .filter((s) => s.pageNumber === cp.pageNum)
          .map(renderSectionToLatex)
          .join('\n');

        return `\\newpage\n% ==================== ANNEXURE (PAGE ${cp.pageNum}) ====================\n\\makeletterheader\n\n\\begin{center}\n    {\\Large \\textbf{${cp.title.toUpperCase()}}}\n\\end{center}\n\n${pSecs}\n\n\\makeletterfooter\n`;
      })
      .join('\n');

    return `\\documentclass[${doc.settings.fontSize || '10pt'},${doc.settings.paperSize || 'a4paper'}]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in,top=0.4in,bottom=0.4in]{geometry}
\\usepackage{graphicx}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{helvet}

\\renewcommand{\\familydefault}{\\sfdefault} % Sans-Serif font (Arial/Helvetica)
\\linespread{1.15}

\\pagestyle{empty} % Remove page numbers

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{6pt}

% Heading Color Definition
\\definecolor{sectioncolor}{RGB}{80, 80, 80}

% Fixed Header Macro
\\newcommand{\\makeletterheader}{%
    \\begin{minipage}[c]{0.35\\textwidth}
        {\\Huge \\textbf{${pProfile.companyName || po.companyName}}} \\\\[2pt]
        {\\Large \\textbf{${pProfile.companySubtitle || po.companySubtitle}}}
    \\end{minipage}%
    \\vrule width 0.8pt%
    \\hspace{0.02\\textwidth}%
    \\begin{minipage}[c]{0.60\\textwidth}
        \\footnotesize
        \\begin{tabular}{@{}l@{\\hspace{10pt}}l@{}}
${servicesRows.join('\n')}
        \\end{tabular}
    \\end{minipage}
    
    \\vspace{4pt}
    \\hrule height 0.8pt
    \\vspace{2pt}
    {\\raggedleft \\footnotesize \\textbf{GST NO. : ${pProfile.companyGstNo || po.gstNo}} \\par}
    \\vspace{4pt}
}

% Fixed Footer Macro
\\newcommand{\\makeletterfooter}{%
    \\vfill
    \\hrule height 0.8pt
    \\vspace{6pt}
    \\begin{raggedright}
        \\footnotesize
        ${pProfile.companyPhone || po.companyPhone} \\\\
        ${pProfile.companyAddressFooter || po.companyAddressFooter} \\\\
        ${pProfile.companyEmail || po.companyEmail} \\qquad ${pProfile.companyWebsite || po.companyWebsite}
    \\end{raggedright}
}

\\begin{document}

% ==================== PAGE 1 ====================
\\makeletterheader

\\vspace{10pt}

\\begin{center}
    {\\Large \\textbf{${doc.title || 'LABOUR CONTRACT PURCHASE ORDER'}}}
\\end{center}

\\vspace{10pt}

% Info Box (Full Width)
\\renewcommand{\\arraystretch}{1.2}
\\begin{center}
\\begin{tabularx}{\\textwidth}{|X|X|}
\\hline
\\textbf{Company: ${po.companyName} ${po.companySubtitle}} & \\textbf{Contractor Name: ${po.contractorName}} \\\\
\\textbf{${po.companyAddress[0] || 'SO7B / 2nd floor / Phase 2'}} & \\textbf{Project Name: ${po.projectName}} \\\\
\\textbf{${po.companyAddress[1] || 'Indiabulls, Jetalpur road'}} & \\textbf{Project Location: ${po.projectLocation}} \\\\
\\textbf{${po.companyAddress[2] || 'Vadodara'}} & \\\\
\\textbf{PO No.: ${po.poNumber}} & \\\\
\\textbf{Date: ${po.poDate}} & \\\\
\\hline
\\end{tabularx}
\\end{center}

\\vspace{10pt}

{\\color{sectioncolor} \\large \\textbf{Scope of Work}}
\\begin{itemize}[leftmargin=14pt, topsep=2pt, itemsep=3pt]
${po.scopeOfWork.map((item) => `    \\item ${item}`).join('\n')}
\\end{itemize}

\\vspace{10pt}

{\\color{sectioncolor} \\large \\textbf{Rate}}

\\vspace{4pt}

% Rate Table with Explicit Fixed Widths for Small Columns
\\begin{center}
\\begin{tabularx}{\\textwidth}{|X|p{1.1cm}|p{1.8cm}|p{1.1cm}|p{2.2cm}|}
\\hline
\\textbf{Description} & \\textbf{Unit} & \\textbf{Qty} & \\textbf{Rate} & \\raggedleft \\arraybackslash \\textbf{Total} \\\\
\\hline
${po.rateItems
  .map(
    (item) =>
      `${item.description} & ${item.unit} & ${item.qty} & ${item.rate} & \\raggedleft \\arraybackslash ${item.total} \\\\`
  )
  .join('\n') ||
  'Fabrication, erection, alignment, welding, gas cutting, grinding, surface preparation, and application of two coats of Red Oxide Primer, including all associated labour. & Per kgs. & 25000 kgs & 14/- & \\raggedleft \\arraybackslash 350000.00 \\\\'
}
\\hline
\\multicolumn{5}{|l|}{\\textbf{Amount in work: ${po.amountInWords}}} \\\\
\\hline
\\end{tabularx}
\\end{center}

\\makeletterfooter

\\newpage

% ==================== PAGE 2 ====================
\\makeletterheader

\\vspace{\\vfill}

{\\color{sectioncolor} \\large \\textbf{Scope of Contractor (Clauses 1–4)}}

${po.scopeOfContractor
  .map((p, idx) => `\\vspace{${idx === 0 ? '2pt' : '4pt'}}\n${p}\n`)
  .join('\n')}

\\vspace{\\vfill}

{\\color{sectioncolor} \\large \\textbf{Payment Terms \\& Milestones}}
\\begin{itemize}[leftmargin=14pt, topsep=4pt, itemsep=4pt]
${po.paymentTerms.map((term) => `    \\item ${term}`).join('\n')}
\\end{itemize}

\\vspace{\\vfill}

{\\color{sectioncolor} \\large \\textbf{Quality, Materials \\& Safety (Clauses 5–7)}}

${po.measurementClause
  .map((clause, idx) => `\\vspace{${idx === 0 ? '2pt' : '4pt'}}\n${clause}\n`)
  .join('\n')}

\\vspace{\\vfill}

{\\color{sectioncolor} \\large \\textbf{Commercial \\& Labour Terms (Clauses 8–10)}}
\\begin{itemize}[leftmargin=14pt, topsep=4pt, itemsep=4pt]
${po.termsAndConditions.map((term) => `    \\item ${term}`).join('\n')}
\\end{itemize}

\\vspace{\\vfill}

\\makeletterfooter

\\newpage

% ==================== PAGE 3 ====================
\\makeletterheader

\\vspace{10pt}

{\\color{sectioncolor} \\large \\textbf{General Terms \\& Defect Liability (Clauses 11–16)}}
\\begin{itemize}[leftmargin=14pt, topsep=4pt, itemsep=6pt]
${po.page3Terms.map((term) => `    \\item ${term}`).join('\n')}
\\end{itemize}

\\vfill

\\begin{minipage}[t]{0.45\\textwidth}
    \\textbf{For ${po.companyName} ${po.companySubtitle}} \\\\[60pt]
    \\textbf{Authorized Signatory}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
    \\raggedleft
    \\textbf{Accepted By Contractor} \\\\[60pt]
    \\textbf{Name \\& Signature}
\\end{minipage}

\\vspace{40pt}

\\makeletterfooter
${customPagesLatex}
\\end{document}`;
  }

  const { settings } = doc;

  const fontPkg =
    settings.fontFamily === 'times'
      ? '\\usepackage{mathptmx}'
      : settings.fontFamily === 'helvetica'
      ? '\\usepackage{helvet}\n\\renewcommand{\\familydefault}{\\sfdefault}'
      : settings.fontFamily === 'latin-modern'
      ? '\\usepackage{lmodern}'
      : '% Default STIX/Computer Modern fonts';

  const marginVal =
    settings.margins === 'compact'
      ? '0.75in'
      : settings.margins === 'wide'
      ? '1.25in'
      : '1.0in';

  let tex = `% Created with Contracti
\\documentclass[${settings.fontSize}, ${settings.paperSize}, ${settings.columns}]{article}

\\usepackage[utf8]{inputenc}
\\usepackage[margin=${marginVal}]{geometry}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{hyperref}
${fontPkg}

% Theorem Definitions
\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}{Lemma}
\\newtheorem{definition}{Definition}
\\newtheorem{corollary}{Corollary}

\\title{${escapeLatex(doc.title)}${doc.subtitle ? `\\\\ \\large ${escapeLatex(doc.subtitle)}` : ''}}

\\author{
${doc.authors
  .map(
    (a) =>
      `  ${escapeLatex(a.name)}\\\\ \\small ${escapeLatex(a.affiliation)}\\\\ \\small \\texttt{${escapeLatex(a.email)}}`
  )
  .join(' \\and\n')}
}

${settings.showDate ? `\\date{${escapeLatex(doc.date)}}` : '\\date{}'}

\\begin{document}

\\maketitle

${
  doc.abstract
    ? `\\begin{abstract}
${doc.abstract}
\\end{abstract}
`
    : ''
}

${
  doc.keywords && doc.keywords.length > 0
    ? `\\noindent\\textbf{Keywords:} ${doc.keywords.join(', ')}\n\n`
    : ''
}
`;

  // Render Sections
  doc.sections.forEach((section) => {
    tex += `\\section{${escapeLatex(section.title)}}\n\n`;

    section.subsections.forEach((sub) => {
      if (sub.title && sub.title !== section.title) {
        tex += `\\subsection{${escapeLatex(sub.title)}}\n\n`;
      }

      if (sub.contentType === 'paragraph') {
        tex += `${sub.body}\n\n`;
      } else if (sub.contentType === 'bullet_list') {
        if (sub.body) tex += `${sub.body}\n`;
        tex += `\\begin{itemize}\n`;
        sub.bullets?.forEach((bullet) => {
          tex += `  \\item ${bullet}\n`;
        });
        tex += `\\end{itemize}\n\n`;
      } else if (sub.contentType === 'equation') {
        const eq = doc.equations.find((e) => e.id === sub.equationRefId);
        if (eq) {
          tex += `\\begin{equation}\n  ${eq.latex} \\label{${eq.label}}\n\\end{equation}\n\n`;
        } else if (sub.body) {
          tex += `\\begin{equation}\n  ${sub.body}\n\\end{equation}\n\n`;
        }
      } else if (sub.contentType === 'theorem') {
        const typeEnv = (sub.theoremType || 'theorem').toLowerCase();
        tex += `\\begin{${typeEnv}}\n${sub.body}\n\\end{${typeEnv}}\n\n`;
      } else if (sub.contentType === 'figure') {
        const fig = doc.figures.find((f) => f.id === sub.figureRefId);
        if (fig) {
          tex += `\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=${(fig.widthPercentage / 100).toFixed(2)}\\linewidth]{${fig.imageUrl}}
  \\caption{${escapeLatex(fig.caption)}}
  \\label{${fig.label}}
\\end{figure}\n\n`;
        }
      } else if (sub.contentType === 'table') {
        const tbl = doc.tables.find((t) => t.id === sub.tableRefId);
        if (tbl) {
          const alignStr = tbl.columns.map((c) => c.align[0]).join(' ');
          tex += `\\begin{table}[htbp]
  \\centering
  \\caption{${escapeLatex(tbl.caption)}}
  \\label{${tbl.label}}
  \\begin{tabular}{${alignStr}}
    \\toprule
    ${tbl.columns.map((c) => `\\textbf{${escapeLatex(c.header)}}`).join(' & ')} \\\\
    \\midrule
`;
          tbl.rows.forEach((row) => {
            const rowVals = tbl.columns.map((c) => escapeLatex(row[c.id] || ''));
            tex += `    ${rowVals.join(' & ')} \\\\\n`;
          });
          tex += `    \\bottomrule
  \\end{tabular}
\\end{table}\n\n`;
        }
      }
    });
  });

  // Bibliography Section
  if (doc.references && doc.references.length > 0) {
    tex += `\\begin{thebibliography}{99}\n`;
    doc.references.forEach((ref) => {
      tex += `\\bibitem{${ref.citeKey}} ${escapeLatex(ref.authors)} (${ref.year}). \\textit{${escapeLatex(
        ref.title
      )}}. ${escapeLatex(ref.journalOrBook)}.${ref.doiOrUrl ? ` DOI/URL: ${ref.doiOrUrl}` : ''}\n`;
    });
    tex += `\\end{thebibliography}\n\n`;
  }

  tex += `\\end{document}`;
  return tex;
}

function escapeLatex(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function generateTaxInvoiceLatex(doc: LatexDocument, companyProfile?: CompanyProfile): string {
  const inv = doc.taxInvoice!;
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);
  
  const leftServices = pProfile.leftServices || inv.leftServices || [
    '• Pre Engineering Building',
    '• Roofing Solution',
    '• Engineering Project & Designing',
    '• "Z" & "C" Purlins',
  ];
  const rightServices = pProfile.rightServices || inv.rightServices || [
    '• Infra Materials',
    '• Puf Panels & Insulation Roofing',
    '• Skylight Sheets',
    '• Air Ventilators',
  ];
  const maxServices = Math.max(leftServices.length, rightServices.length);
  const servicesRows: string[] = [];
  for (let i = 0; i < maxServices; i++) {
    const left = leftServices[i] ? leftServices[i].replace(/&/g, '\\&') : '';
    const right = rightServices[i] ? rightServices[i].replace(/&/g, '\\&') : '';
    servicesRows.push(`            ${left} & ${right} \\\\`);
  }

  // Items table rows
  const itemsRows = (inv.items || []).map((item) => {
    const desc = item.description.replace(/%/g, '\\%').replace(/&/g, '\\&');
    return `${item.srNo} & ${desc} & ${item.hsn} & ${item.qty} & \\centering ${item.rate} & ${item.total} \\\\ \\hline`;
  }).join('\n');

  const termsBlock = (inv.termsLines || [
    '1. GOODS ONCE SOLD WILL NOT BE TAKEN BACK.',
    '2. PAYMENT SHOULD BE MADE AS PER TERMS.',
    '3. SUBECT TO BE VADODARA JURISDICATION ONLY.',
  ]).map((t) => `        \\textbf{${t}} \\\\`).join('\n');

  const bankName = inv.bankDetails?.bankName || 'BANK OF BARODA';
  const ifsc = inv.bankDetails?.ifsc || 'BARB0INDMAK';
  const acct = inv.bankDetails?.accountNo || '05730400000392';
  const branch = inv.bankDetails?.branch || 'MAKARPURA GIDC.';

  // Format words block
  const wordsLines = inv.amountInWords.includes('\n')
    ? inv.amountInWords.split('\n').map((l) => `        \\textbf{${l}}`).join(' \\\\\n')
    : `        \\textbf{${inv.amountInWords}}`;

  const sgstRateStr = inv.sgstRate.includes('%') ? inv.sgstRate.replace(/%/g, '\\%') : `${inv.sgstRate}\\%`;
  const cgstRateStr = inv.cgstRate.includes('%') ? inv.cgstRate.replace(/%/g, '\\%') : `${inv.cgstRate}\\%`;

  return `\\documentclass[${doc.settings.fontSize || '10pt'},${doc.settings.paperSize || 'a4paper'}]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in,top=0.4in,bottom=0.4in]{geometry}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{helvet}

\\renewcommand{\\familydefault}{\\sfdefault}
\\linespread{1.12}

\\pagestyle{empty}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Fixed Header Macro
\\newcommand{\\makeletterheader}{%
    \\noindent
    \\begin{minipage}[c]{0.35\\textwidth}
        {\\Huge \\textbf{${pProfile.companyName || inv.companyName || 'GLOBAL'}}} \\\\[2pt]
        {\\Large \\textbf{${pProfile.companySubtitle || inv.companySubtitle || 'INDUSTRIES'}}}
    \\end{minipage}%
    \\vrule width 0.8pt%
    \\hspace{0.02\\textwidth}%
    \\begin{minipage}[c]{0.60\\textwidth}
        \\footnotesize
        \\begin{tabular}{@{}l@{\\hspace{10pt}}l@{}}
${servicesRows.join('\n')}
        \\end{tabular}
    \\end{minipage}
    
    \\vspace{3pt}
    {\\raggedright \\footnotesize \\textbf{${pProfile.companyAddressHeader || inv.companyAddressHeader || ''}}} \\hfill
    {\\raggedleft \\footnotesize \\textbf{GST NO. : ${pProfile.companyGstNo || inv.companyGstNo || '24CLNPS9550H1ZI'}}} \\par
    \\vspace{4pt}
}

% Fixed Footer Macro
\\newcommand{\\makeletterfooter}{%
    \\vfill
    \\hrule height 0.8pt
    \\vspace{4pt}
    \\begin{raggedright}
        \\footnotesize
        ${pProfile.companyPhone || inv.companyPhone || '+91 97254 45370'} \\\\
        ${pProfile.companyAddressFooter || inv.companyAddressFooter || 'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243'} \\\\
        ${pProfile.companyEmail || inv.companyEmail || 'info@globalindustries.co'} \\qquad ${pProfile.companyWebsite || inv.companyWebsite || 'www.globalindustries.co'}
    \\end{raggedright}
}

\\begin{document}

% --- Header ---
\\makeletterheader

\\vspace{3pt}

% --- Title ---
\\begin{center}
    \\textbf{\\large \\underline{TAX-INVOICE}}
\\end{center}

\\vspace{3pt}

% --- Invoice Body Table (Exact Full \\textwidth Alignment) ---
\\noindent
\\begin{tabularx}{\\textwidth}{|>{\\centering\\arraybackslash}p{0.8cm}|X|>{\\centering\\arraybackslash}p{1.7cm}|>{\\centering\\arraybackslash}p{1.5cm}|p{2.3cm}|>{\\raggedleft\\arraybackslash}p{2.2cm}|}
\\hline
\\multicolumn{2}{|l|}{\\textbf{${inv.clientName || 'M/s. ALEMBIC LTD,'}}} & \\multicolumn{2}{l|}{\\textbf{Invoice No.}} & \\multicolumn{2}{l|}{\\textbf{${inv.invoiceNo || 'TI/26-27/00013'}}} \\\\
\\multicolumn{2}{|l|}{\\textbf{${inv.clientAddressLine1 || 'Alembic Road, Gorwa,'}}} & \\multicolumn{2}{l|}{} & \\multicolumn{2}{l|}{} \\\\
\\multicolumn{2}{|l|}{\\textbf{${inv.clientAddressLine2 || 'Vadodara. Gujarat'}}} & \\multicolumn{2}{l|}{\\textbf{Invoice Date:}} & \\multicolumn{2}{l|}{\\textbf{${inv.invoiceDate || '19/08/2026'}}} \\\\ \\cline{3-6}
\\multicolumn{2}{|l|}{} & \\multicolumn{2}{l|}{\\textbf{P.O. No.}} & \\multicolumn{2}{l|}{\\textbf{${inv.poNo || '1300000567'}}} \\\\ \\cline{3-6}
\\multicolumn{2}{|l|}{\\textbf{GST NO. ${inv.clientGstNo || '24AABCA7950P1ZB'}}} & \\multicolumn{2}{l|}{\\textbf{P.O. Date:}} & \\multicolumn{2}{l|}{\\textbf{${inv.poDate || '08/06/2026'}}} \\\\ \\cline{3-6}
\\multicolumn{2}{|l|}{} & \\multicolumn{2}{l|}{\\textbf{PROJECT NAME}} & \\multicolumn{2}{l|}{\\textbf{${inv.projectName || 'Tadpole Academy'}}} \\\\ \\hline

\\textbf{Sr. No.} & \\centering\\textbf{Description of Goods} & \\textbf{HSN} & \\textbf{Qty.} & \\centering\\textbf{Rate} & \\centering\\arraybackslash\\textbf{Total} \\\\ \\hline
${itemsRows}
\\multicolumn{4}{|c|}{} & \\textbf{Total Amount} & ${inv.totalAmount} \\\\ \\cline{5-6}
\\multicolumn{4}{|c|}{} & \\textbf{SGST@${sgstRateStr}} & ${inv.sgstAmount} \\\\ \\cline{5-6}
\\multicolumn{4}{|c|}{} & \\textbf{CGST@${cgstRateStr}} & ${inv.cgstAmount} \\\\ \\cline{5-6}
\\multicolumn{4}{|c|}{} & \\textbf{Net Amount} & ${inv.netAmount} \\\\ \\hline
\\multicolumn{4}{|l|}{%
    \\begin{tabular}{@{}l@{}}
${wordsLines}
    \\end{tabular}%
} & \\textbf{Final Amount} & \\textbf{${inv.finalAmount}} \\\\ \\hline

\\multicolumn{4}{|l|}{%
    \\begin{minipage}[t]{0.64\\textwidth}
        \\vspace{2pt}
        \\textbf{GSTTIN: ${inv.companyGstNo || '24CLNPS9550H1ZI'}} \\\\[3pt]
        \\textbf{PAN NO. ${inv.companyPanNo || 'CLNPS9550H'}} \\\\[3pt]
        \\textbf{EPF NO. ${inv.companyEpfNo || 'VDBRD18741500'}} \\\\[4pt]
        \\scriptsize
${termsBlock}
        \\textbf{4. COMPANAY'S BANK DETAIS- ${bankName} - IFSC ${ifsc}} \\\\
        \\hspace*{8pt}\\textbf{BANK A/C NO- ${acct}, BRANCH: ${branch}}
        \\vspace{3pt}
    \\end{minipage}%
} & \\multicolumn{2}{l|}{%
    \\begin{minipage}[t]{\\dimexpr2.3cm+2.2cm+2\\tabcolsep\\relax}
        \\vspace{2pt}
        \\raggedleft \\textbf{${inv.signatoryCompany || 'For, GLOBAL INDUSTRIES'}} \\newline
        \\vspace{38pt}
        \\centering (Authorized Signatory)
        \\vspace{3pt}
    \\end{minipage}%
} \\\\ \\hline
\\end{tabularx}

% --- Footer ---
\\makeletterfooter

\\end{document}`;
}

export function generateQuotationLatex(doc: LatexDocument, companyProfile?: CompanyProfile): string {
  const q = doc.quotation!;
  const pProfile = companyProfile || ({} as Partial<CompanyProfile>);

  // Services table for header
  const leftServices = pProfile.leftServices || q.leftServices || [
    '• Pre Engineering Building',
    '• Roofing Solution',
    '• Engineering Project & Designing',
    '• "Z" & "C" Purlins',
    '• UPVC Roofing Sheet',
  ];
  const rightServices = pProfile.rightServices || q.rightServices || [
    '• Infra Materials',
    '• Puf Panels & Insulation Roofing',
    '• Skylight Sheets',
    '• Air Ventilators',
  ];
  const maxServices = Math.max(leftServices.length, rightServices.length);
  const servicesRows: string[] = [];
  for (let i = 0; i < maxServices; i++) {
    const left = leftServices[i] ? leftServices[i].replace(/&/g, '\\&') : '';
    const right = rightServices[i] ? rightServices[i].replace(/&/g, '\\&') : '';
    servicesRows.push(`            ${left} & ${right} \\\\`);
  }

  const formatLatexMultiline = (str: string): string => {
    if (!str) return '';
    const cleaned = str.replace(/\\newline/g, '\n').replace(/&/g, '\\&');
    return cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' \\newline\n');
  };

  // Page 2: Technical details
  const techDetailsRows = q.technicalDetails
    .map((td) => `\\textbf{${td.label}} & ${formatLatexMultiline(td.value)} \\\\ \\hline`)
    .join('\n');

  // Page 3: Specifications
  const specsRows = q.specifications
    .map((sp) => `\\textbf{${sp.title}} & ${formatLatexMultiline(sp.details)} \\\\ \\hline`)
    .join('\n\n');

  // Page 4: Commercial BOQ
  const commercialRows = q.commercialItems
    .map((item) => `${formatLatexMultiline(item.description)} & ${item.price} \\\\ \\hline`)
    .join('\n');

  // Payment terms
  const paymentFabList = q.paymentTermsFab
    .map((p) => `    \\item ${p}`)
    .join('\n');

  const paymentCivilList = q.paymentTermsCivil
    .map((p) => `    \\item ${p}`)
    .join('\n');

  // Delivery schedule
  const deliveryList = q.deliverySchedule
    .map((d) => `    \\item ${d}`)
    .join('\n');

// Page 6 & 7: Vendor list (Split dynamically if > 18)
  const splitIdx = Math.min(18, q.vendorList.length);
  const vendorP1 = q.vendorList.slice(0, splitIdx)
    .map((v) => `${v.srNo} & ${v.description} & ${formatLatexMultiline(v.brand)} \\\\ \\hline`)
    .join('\n');

  const vendorP2Rows = q.vendorList.slice(splitIdx);
  const vendorP2 = vendorP2Rows
    .map((v) => `${v.srNo} & ${v.description} & ${formatLatexMultiline(v.brand)} \\\\ \\hline`)
    .join('\n');
  const vendorP2Table = vendorP2Rows.length > 0 ? `
\\begin{center}
    {\\large \\textbf{APPROVED VENDOR LIST (CONTINUED)}}
\\end{center}
\\vspace{4pt}
\\renewcommand{\\arraystretch}{1.15}
\\noindent
\\begin{tabularx}{\\textwidth}{|>{\\centering\\arraybackslash}p{0.7cm}|p{5.5cm}|X|}
\\hline
\\textbf{Sr. No} & \\centering\\arraybackslash\\textbf{Description} & \\centering\\arraybackslash\\textbf{Brand/Make/Company Name} \\\\ \\hline
${vendorP2}
\\end{tabularx}
\\vspace{5pt}
` : '';

  // Notes
  const notesList = q.notes
    .map((n) => `    \\item ${n}`)
    .join('\n');

  // Delivery checklist
  const deliveryChecklist = q.deliveryChecklist
    .map((dc) => `    \\item ${dc}`)
    .join('\n');

  // Commercial terms (1-7 on Page 8, 8-13 on Page 9, 14-17 on Page 10)
  const termsP1 = q.commercialTerms.slice(0, 7); // 1-7
  const termsP2 = q.commercialTerms.slice(7, 13); // 8-13
  const termsP3 = q.commercialTerms.slice(13); // 14-17

  const renderTerm = (term: typeof q.commercialTerms[0]) => {
    let out = `    \\item \\textbf{${term.title}} ${term.content}`;
    if (term.subItems && term.subItems.length > 0) {
      out += `\n    \\begin{itemize}[leftmargin=12pt, topsep=1pt, itemsep=1pt]\n`;
      out += term.subItems.map((si) => `        \\item ${si}`).join('\n');
      out += `\n    \\end{itemize}`;
    }
    if (term.note) {
      out += `\n    \\textbf{Note:} ${term.note}`;
    }
    return out;
  };

  const termsBlockP1 = termsP1.map(renderTerm).join('\n');
  const termsBlockP2 = termsP2.map(renderTerm).join('\n');
  const termsBlockP3 = termsP3.map(renderTerm).join('\n');

  // Exclusions
  const exclusionsList = q.exclusions
    .map((ex) => `    \\item ${ex}`)
    .join('\n');

  // Special notes
  const specialNotesList = q.specialNotes
    .map((sn) => `    \\item ${sn}`)
    .join('\n');

  const signatoryPhonesList = q.signatoryPhones
    .map((ph) => `${ph} \\\\[2pt]`)
    .join('\n');

  const customSections = q.customSections || [];
  const renderCustomSectionsForPage = (pageNum: number) => {
    const list = customSections.filter((cs) => cs.pageNumber === pageNum);
    if (list.length === 0) return '';
    return '\n' + list.map((cs) => renderSectionToLatex(cs)).join('\n') + '\n';
  };

  const extraPages = Array.from(
    new Set(customSections.filter((cs) => cs.pageNumber > 10).map((cs) => cs.pageNumber))
  ).sort((a, b) => a - b);
  const extraPagesLatex = extraPages
    .map(
      (pNum) => `
\\newpage
\\makeletterheader
\\vspace{10pt}
${renderCustomSectionsForPage(pNum)}
\\makeletterfooter
`
    )
    .join('\n');

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in,top=0.4in,bottom=0.4in]{geometry}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{amsmath,amssymb}
\\usepackage{helvet}

\\renewcommand{\\familydefault}{\\sfdefault}
\\linespread{1.12}

\\pagestyle{empty}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Fixed Header Macro (Identical to PO Template)
\\newcommand{\\makeletterheader}{%
    \\noindent
    \\begin{minipage}[c]{0.35\\textwidth}
        {\\Huge \\textbf{${pProfile.companyName || q.companyName || 'GLOBAL'}}} \\\\[2pt]
        {\\Large \\textbf{${pProfile.companySubtitle || q.companySubtitle || 'INDUSTRIES'}}}
    \\end{minipage}%
    \\vrule width 0.8pt%
    \\hspace{0.02\\textwidth}%
    \\begin{minipage}[c]{0.60\\textwidth}
        \\footnotesize
        \\begin{tabular}{@{}l@{\\hspace{10pt}}l@{}}
${servicesRows.join('\n')}
        \\end{tabular}
    \\end{minipage}
    
    \\vspace{4pt}
    \\hrule height 0.8pt
    \\vspace{2pt}
    {\\raggedright \\footnotesize \\textbf{${pProfile.companyAddressHeader || q.companyAddressHeader || 'Regd. Off. : SO7B / 2nd floor / Phase 2, Indiabulls, Jetalpur road, Vadodara'}}} \\hfill
    {\\raggedleft \\footnotesize \\textbf{GST NO. : ${pProfile.companyGstNo || q.companyGstNo || '24CLNPS9550H1ZI'}}} \\par
    \\vspace{4pt}
    \\hrule height 0.5pt
    \\vspace{4pt}
}

% Fixed Footer Macro (Identical to PO Template)
\\newcommand{\\makeletterfooter}{%
    \\vfill
    \\hrule height 0.8pt
    \\vspace{4pt}
    \\begin{center}
        \\footnotesize
        ${pProfile.companyPhone || q.companyPhone || '+91 97254 45370'} \\\\
        ${pProfile.companyAddressFooter || q.companyAddressFooter || 'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243'} \\\\
        ${pProfile.companyEmail || q.companyEmail || 'info@globalindustries.co'} \\qquad ${pProfile.companyWebsite || q.companyWebsite || 'www.globalindustries.co'}
    \\end{center}
}

\\begin{document}

% ==================== PAGE 1 ====================
\\makeletterheader

\\vspace{6pt}

\\begin{minipage}[t]{0.5\\textwidth}
    \\textbf{To,} \\\\
    \\textbf{${q.toRecipient}} \\\\
    \\textbf{${q.toAddress}}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
    \\raggedleft
    \\textbf{Ref no.: ${q.refNo}} \\\\
    \\textbf{Date: ${q.date}}
\\end{minipage}

\\vspace{14pt}

\\begin{center}
    {\\large \\textbf{\\underline{${q.subjectTitle}}}}
\\end{center}

\\vspace{10pt}

\\textbf{Dear Sir,}

${q.introParagraphs.map((p) => `\\vspace{6pt}\n\n${p}`).join('\n')}

\\vspace{20pt}

\\textbf{Best regards,} \\\\[4pt]
\\textbf{${q.signatoryName || 'Global Industries'}} \\\\[2pt]
${signatoryPhonesList}

\\makeletterfooter

\\newpage

% ==================== PAGE 2 ====================
\\makeletterheader

\\vspace{6pt}

{\\large \\textbf{\\underline{Technical Details:}}}

\\vspace{6pt}

\\renewcommand{\\arraystretch}{1.35}
\\noindent
\\begin{tabularx}{\\textwidth}{|p{5.5cm}|X|}
\\hline
${techDetailsRows}
\\end{tabularx}

\\makeletterfooter

\\newpage

% ==================== PAGE 3 ====================
\\makeletterheader

\\vspace{6pt}

{\\large \\textbf{\\underline{Material Specifications:}}}

\\vspace{6pt}

\\renewcommand{\\arraystretch}{1.3}
\\noindent
\\begin{tabularx}{\\textwidth}{|p{4.8cm}|X|}
\\hline
${specsRows}
\\end{tabularx}

\\makeletterfooter

\\newpage

% ==================== PAGE 4 ====================
\\makeletterheader

\\vspace{4pt}

{\\large \\textbf{COMMERCIAL:}} \\\\[2pt]
\\textbf{${q.commercialSubtitle}}

\\vspace{4pt}

\\renewcommand{\\arraystretch}{1.15}
\\noindent
\\begin{tabularx}{\\textwidth}{|X|r|}
\\hline
\\centering\\arraybackslash\\textbf{Description} & \\centering\\arraybackslash\\textbf{Total Price} \\\\ \\hline
${commercialRows}
\\textbf{Total Price In INR} & \\textbf{${q.totalPriceInInr}} \\\\ \\hline
\\textbf{Sub Total} & \\textbf{${q.subTotal}} \\\\ \\hline
\\multicolumn{2}{|l|}{\\textbf{${q.amountInWords}}} \\\\ \\hline
\\multicolumn{2}{|l|}{\\textbf{${q.gstNote}}} \\\\ \\hline
\\end{tabularx}

\\vspace{6pt}

\\textbf{\\underline{Payment Terms:}} \\\\[3pt]
\\textbf{For Fabrication:}
\\begin{itemize}[leftmargin=12pt, topsep=1pt, itemsep=1.5pt]
${paymentFabList}
\\end{itemize}

\\vspace{3pt}
\\textbf{For Civil Work:}
\\begin{enumerate}[leftmargin=12pt, topsep=1pt, itemsep=1.5pt]
${paymentCivilList}
\\end{enumerate}

\\makeletterfooter

\\newpage

% ==================== PAGE 5 ====================
\\makeletterheader

\\vspace{6pt}

\\begin{center}
    {\\large \\textbf{\\underline{DELIVERY SCHEDULE \\& PROJECT TIMELINE}}}
\\end{center}

\\vspace{8pt}

\\begin{enumerate}[leftmargin=14pt, topsep=4pt, itemsep=7pt]
${deliveryList}
\\end{enumerate}

\\vspace{14pt}

\\noindent
\\begin{tabularx}{\\textwidth}{|X|}
\\hline
\\textbf{Site Readiness \\& Delivery Prerequisites:} \\\\
\\begin{itemize}[leftmargin=12pt, topsep=2pt, itemsep=2pt]
    \\item Site access must be clear and hardened for heavy trailer/truck movement.
    \\item Unloading, crane arrangements, and safe storage area are in scope of Client.
    \\item Water and 3-phase electricity must be made available by the client at site.
    \\item Foundation anchor bolts casting certification must be provided before dispatch.
\\end{itemize} \\\\ \\hline
\\end{tabularx}

\\makeletterfooter

\\newpage

% ==================== PAGE 6 ====================
\\makeletterheader

\\vspace{4pt}

\\begin{center}
    {\\large \\textbf{APPROVED VENDOR LIST}}
\\end{center}

\\vspace{4pt}

\\renewcommand{\\arraystretch}{1.22}
\\noindent
\\begin{tabularx}{\\textwidth}{|>{\\centering\\arraybackslash}p{0.7cm}|p{5.5cm}|X|}
\\hline
\\textbf{Sr. No} & \\centering\\arraybackslash\\textbf{Description} & \\centering\\arraybackslash\\textbf{Brand/Make/Company Name} \\\\ \\hline
${vendorP1}
\\end{tabularx}

\\makeletterfooter

\\newpage

% ==================== PAGE 7 ====================
\\makeletterheader

\\vspace{4pt}

${vendorP2Table}

\\textbf{Taxes:} ${q.taxNote}

\\vspace{4pt}

\\textbf{\\underline{NOTES:}}
\\begin{enumerate}[leftmargin=14pt, topsep=2pt, itemsep=2pt]
${notesList}
\\end{enumerate}

\\vspace{4pt}

\\textbf{\\underline{DELIVERY CONDITIONS:}}
\\begin{itemize}[leftmargin=14pt, topsep=2pt, itemsep=2pt]
${deliveryChecklist}
\\end{itemize}
\\vspace{2pt}
${q.deliveryNotes}

\\makeletterfooter

\\newpage

% ==================== PAGE 8 ====================
\\makeletterheader

\\vspace{4pt}

\\begin{center}
    {\\large \\textbf{\\underline{OTHER COMMERCIAL TERMS}}}
\\end{center}

\\vspace{4pt}

\\begin{enumerate}[leftmargin=14pt, topsep=2pt, itemsep=4.5pt]
${termsBlockP1}
\\end{enumerate}

\\makeletterfooter

\\newpage

% ==================== PAGE 9 ====================
\\makeletterheader

\\vspace{4pt}

\\begin{enumerate}[leftmargin=14pt, topsep=2pt, itemsep=4.5pt, start=8]
${termsBlockP2}
\\end{enumerate}

\\makeletterfooter

\\newpage

% ==================== PAGE 10 ====================
\\makeletterheader

\\vspace{3pt}

\\begin{enumerate}[leftmargin=14pt, topsep=2pt, itemsep=2.5pt, start=14]
${termsBlockP3}
\\end{enumerate}

\\vspace{3pt}

{\\textbf{\\underline{Section 7: EXCLUSIONS}}}
\\begin{itemize}[leftmargin=14pt, topsep=1pt, itemsep=1pt]
${exclusionsList}
\\end{itemize}

\\vspace{3pt}

{\\textbf{\\underline{Section 8: SPECIAL NOTES}}}
\\begin{itemize}[leftmargin=14pt, topsep=1pt, itemsep=1pt]
${specialNotesList}
\\end{itemize}

\\vspace{10pt}

\\noindent
\\begin{minipage}[t]{0.48\\textwidth}
    \\textbf{Accepted \\& Confirmed by Client} \\\\[30pt]
    \\textbf{Name, Seal \\& Signatory}
\\end{minipage}%
\\hfill
\\begin{minipage}[t]{0.48\\textwidth}
    \\raggedleft
    \\textbf{${q.finalSignatoryCompany || 'For, GLOBAL INDUSTRIES'}} \\\\[30pt]
    \\textbf{${q.finalSignatoryTitle || '(Authorized Signatory)'}}
\\end{minipage}

\\makeletterfooter
${extraPagesLatex}
\\end{document}`;
}


/**
 * Generates a LaTeX document containing ONLY the header and footer for previewing the Company Profile.
 */
export function generateCompanyProfileLatex(profile: CompanyProfile): string {
  const maxServices = Math.max(profile.leftServices.length, profile.rightServices.length);
  const servicesRows: string[] = [];
  for (let i = 0; i < maxServices; i++) {
    const left = profile.leftServices[i] ? profile.leftServices[i].replace(/&/g, '\\&') : '';
    const right = profile.rightServices[i] ? profile.rightServices[i].replace(/&/g, '\\&') : '';
    servicesRows.push(`            ${left} & ${right} \\\\`);
  }

  return `\\documentclass[10pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.6in,top=0.4in,bottom=0.4in]{geometry}
\\usepackage{graphicx}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{xcolor}
\\usepackage{helvet}

\\renewcommand{\\familydefault}{\\sfdefault} % Sans-Serif font (Arial/Helvetica)
\\linespread{1.15}
\\pagestyle{empty} % Remove page numbers

\\newcommand{\\makeletterheader}{%
    \\begin{minipage}[c]{0.35\\textwidth}
        {\\Huge \\textbf{${profile.companyName}}} \\\\\[2pt]
        {\\Large \\textbf{${profile.companySubtitle}}}
    \\end{minipage}%
    \\vrule width 0.8pt%
    \\hspace{0.02\\textwidth}%
    \\begin{minipage}[c]{0.60\\textwidth}
        \\footnotesize
        \\begin{tabular}{@{}l@{\\hspace{10pt}}l@{}}
${servicesRows.join('\n')}
        \\end{tabular}
    \\end{minipage}
    
    \\vspace{4pt}
    \\hrule height 0.8pt
    \\vspace{2pt}
    {\\footnotesize \\textbf{${profile.companyAddressHeader}} \\hfill \\textbf{GST NO. : ${profile.companyGstNo}} \\par}
    \\vspace{4pt}
}

\\newcommand{\\makeletterfooter}{%
    \\vfill
    \\hrule height 0.8pt
    \\vspace{6pt}
    \\begin{raggedright}
        \\footnotesize
        ${profile.companyPhone} \\\\
        ${profile.companyAddressFooter} \\\\
        ${profile.companyEmail} \\qquad ${profile.companyWebsite}
    \\end{raggedright}
}

\\begin{document}

\\makeletterheader

\\vspace{150pt}
\\begin{center}
\\textcolor{gray}{\\Large \\textit{[ Document Body Preview Placeholder ]}}
\\end{center}
\\vspace{150pt}

\\makeletterfooter

\\end{document}
`;
}
