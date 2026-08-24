const fs = require('fs');

const filePath = 'c:/Project/Web-tool/remix-latex-form-document-builder/app/project/[projectId]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add handleUpdateCompanyProfile
const updateStatusTarget = `  const handleUpdateProjectStatus = (status: ProjectStatus) => {`;
const handleUpdateCompanyProfileStr = `
  const handleUpdateCompanyProfile = (profile: any) => {
    if (!project) return;
    setProject({ ...project, companyProfile: profile });

    fetch(\`/api/projects/\${projectId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyProfile: profile,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to update company profile:', err));
  };

  const handleUpdateProjectStatus = (status: ProjectStatus) => {`;

if (!content.includes('handleUpdateCompanyProfile')) {
  content = content.replace(updateStatusTarget, handleUpdateCompanyProfileStr);
}

// 2. Pass to ProjectDetailView
const projectDetailViewPropsTarget = `      onUpdateProjectStatus={handleUpdateProjectStatus}
      onDeleteProject={handleDeleteProject}
    />`;
const projectDetailViewPropsReplace = `      onUpdateProjectStatus={handleUpdateProjectStatus}
      onUpdateCompanyProfile={handleUpdateCompanyProfile}
      onDeleteProject={handleDeleteProject}
    />`;

if (!content.includes('onUpdateCompanyProfile={handleUpdateCompanyProfile}')) {
  content = content.replace(projectDetailViewPropsTarget, projectDetailViewPropsReplace);
}

// 3. Update handleCreateDocument
// Find handleCreateDocument definition and inside it, before `const newDocId = ...`
const createDocTarget = `    const template = docType === 'quotation' ? SAMPLE_TEMPLATES.quotation
                   : docType === 'invoice' ? SAMPLE_TEMPLATES.tax_invoice
                   : docType === 'work_order' ? SAMPLE_TEMPLATES.labour_po
                   : SAMPLE_TEMPLATES.blank || LABOUR_PO_TEMPLATE;

    const newDocId = \`doc_\${Date.now()}\`;`;

const createDocReplace = `    // Clone template so we don't mutate defaults
    const templateStr = JSON.stringify(docType === 'quotation' ? SAMPLE_TEMPLATES.quotation
                   : docType === 'invoice' ? SAMPLE_TEMPLATES.tax_invoice
                   : docType === 'work_order' ? SAMPLE_TEMPLATES.labour_po
                   : SAMPLE_TEMPLATES.blank || LABOUR_PO_TEMPLATE);
    const template = JSON.parse(templateStr);

    // Inject company profile if available
    if (project.companyProfile) {
      const p = project.companyProfile;
      if (template.quotation) {
        if (p.companyName) template.quotation.companyName = p.companyName;
        if (p.companySubtitle) template.quotation.companySubtitle = p.companySubtitle;
        if (p.companyGstNo) template.quotation.companyGstNo = p.companyGstNo;
        if (p.companyPhone) template.quotation.companyPhone = p.companyPhone;
        if (p.companyEmail) template.quotation.companyEmail = p.companyEmail;
        if (p.companyWebsite) template.quotation.companyWebsite = p.companyWebsite;
        if (p.companyAddressHeader) template.quotation.companyAddressHeader = p.companyAddressHeader;
        if (p.companyAddressFooter) template.quotation.companyAddressFooter = p.companyAddressFooter;
        if (p.leftServices) template.quotation.leftServices = p.leftServices;
        if (p.rightServices) template.quotation.rightServices = p.rightServices;
      }
      if (template.taxInvoice) {
        if (p.companyName) template.taxInvoice.companyName = p.companyName;
        if (p.companySubtitle) template.taxInvoice.companySubtitle = p.companySubtitle;
        if (p.companyGstNo) template.taxInvoice.companyGstNo = p.companyGstNo;
        if (p.companyPanNo) template.taxInvoice.companyPanNo = p.companyPanNo;
        if (p.companyEpfNo) template.taxInvoice.companyEpfNo = p.companyEpfNo;
        if (p.companyPhone) template.taxInvoice.companyPhone = p.companyPhone;
        if (p.companyEmail) template.taxInvoice.companyEmail = p.companyEmail;
        if (p.companyWebsite) template.taxInvoice.companyWebsite = p.companyWebsite;
        if (p.companyAddressHeader) template.taxInvoice.companyAddressHeader = p.companyAddressHeader;
        if (p.companyAddressFooter) template.taxInvoice.companyAddressFooter = p.companyAddressFooter;
        if (p.leftServices) template.taxInvoice.leftServices = p.leftServices;
        if (p.rightServices) template.taxInvoice.rightServices = p.rightServices;
      }
      if (template.purchaseOrder) {
        if (p.companyName) template.purchaseOrder.companyName = p.companyName;
        if (p.companySubtitle) template.purchaseOrder.companySubtitle = p.companySubtitle;
        if (p.companyGstNo) template.purchaseOrder.gstNo = p.companyGstNo;
        if (p.companyPhone) template.purchaseOrder.companyPhone = p.companyPhone;
        if (p.companyEmail) template.purchaseOrder.companyEmail = p.companyEmail;
        if (p.companyWebsite) template.purchaseOrder.companyWebsite = p.companyWebsite;
        if (p.companyAddressHeader) {
           template.purchaseOrder.companyAddress = [p.companyAddressHeader];
        }
        if (p.companyAddressFooter) template.purchaseOrder.companyAddressFooter = p.companyAddressFooter;
        if (p.leftServices) template.purchaseOrder.leftServices = p.leftServices;
        if (p.rightServices) template.purchaseOrder.rightServices = p.rightServices;
      }
    }

    const newDocId = \`doc_\${Date.now()}\`;`;

if (!content.includes('// Inject company profile if available')) {
  content = content.replace(createDocTarget, createDocReplace);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated app/project/[projectId]/page.tsx');
