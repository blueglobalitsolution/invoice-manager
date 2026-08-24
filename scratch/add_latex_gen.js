const fs = require('fs');

const filePath = 'c:/Project/Web-tool/remix-latex-form-document-builder/lib/latex-generator.ts';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('generateCompanyProfileLatex')) {
  // Add import CompanyProfile
  content = content.replace(
    "import { LatexDocument, CustomSectionItem } from '@/types/document';",
    "import { LatexDocument, CustomSectionItem } from '@/types/document';\nimport { CompanyProfile } from '@/types/project';"
  );

  const newFunction = `
/**
 * Generates a LaTeX document containing ONLY the header and footer for previewing the Company Profile.
 */
export function generateCompanyProfileLatex(profile: CompanyProfile): string {
  const maxServices = Math.max(profile.leftServices.length, profile.rightServices.length);
  const servicesRows: string[] = [];
  for (let i = 0; i < maxServices; i++) {
    const left = profile.leftServices[i] ? profile.leftServices[i].replace(/&/g, '\\\\&') : '';
    const right = profile.rightServices[i] ? profile.rightServices[i].replace(/&/g, '\\\\&') : '';
    servicesRows.push(\`            \${left} & \${right} \\\\\\\\\`);
  }

  return \`\\\\documentclass[10pt,a4paper]{article}
\\\\usepackage[utf8]{inputenc}
\\\\usepackage[margin=0.6in,top=0.4in,bottom=0.4in]{geometry}
\\\\usepackage{graphicx}
\\\\usepackage{tabularx}
\\\\usepackage{array}
\\\\usepackage{xcolor}
\\\\usepackage{helvet}

\\\\renewcommand{\\\\familydefault}{\\\\sfdefault} % Sans-Serif font (Arial/Helvetica)
\\\\linespread{1.15}
\\\\pagestyle{empty} % Remove page numbers

\\\\newcommand{\\\\makeletterheader}{%
    \\\\begin{minipage}[c]{0.35\\\\textwidth}
        {\\\\Huge \\\\textbf{\${profile.companyName}}} \\\\\\\\\\[2pt]
        {\\\\Large \\\\textbf{\${profile.companySubtitle}}}
    \\\\end{minipage}%
    \\\\vrule width 0.8pt%
    \\\\hspace{0.02\\\\textwidth}%
    \\\\begin{minipage}[c]{0.60\\\\textwidth}
        \\\\footnotesize
        \\\\begin{tabular}{@{}l@{\\\\hspace{10pt}}l@{}}
\${servicesRows.join('\\n')}
        \\\\end{tabular}
    \\\\end{minipage}
    
    \\\\vspace{4pt}
    \\\\hrule height 0.8pt
    \\\\vspace{2pt}
    {\\\\footnotesize \\\\textbf{\${profile.companyAddressHeader}} \\\\hfill \\\\textbf{GST NO. : \${profile.companyGstNo}} \\\\par}
    \\\\vspace{4pt}
}

\\\\newcommand{\\\\makeletterfooter}{%
    \\\\vfill
    \\\\hrule height 0.8pt
    \\\\vspace{6pt}
    \\\\begin{raggedright}
        \\\\footnotesize
        \${profile.companyPhone} \\\\\\\\
        \${profile.companyAddressFooter} \\\\\\\\
        \${profile.companyEmail} \\\\qquad \${profile.companyWebsite}
    \\\\end{raggedright}
}

\\\\begin{document}

\\\\makeletterheader

\\\\vspace{150pt}
\\\\begin{center}
\\\\textcolor{gray}{\\\\Large \\\\textit{[ Document Body Preview Placeholder ]}}
\\\\end{center}
\\\\vspace{150pt}

\\\\makeletterfooter

\\\\end{document}
\`;
}
`;

  content = content + newFunction;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Added generateCompanyProfileLatex');
} else {
  console.log('Already added');
}
