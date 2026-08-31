const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

const cleanProfile = {
  companyName: 'GLOBAL',
  companySubtitle: 'INDUSTRIES',
  companyAddressHeader: 'Regd. Off. : SO7B / 2nd floor, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara, Gujarat - 391243',
  companyAddressFooter: 'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243',
  companyGstNo: '24CLNPS9550H1ZI',
  companyPanNo: 'CLNPS9550H',
  companyEpfNo: 'GJ/VAD/1234567/000',
  companyPhone: '+91 97254 45370',
  companyEmail: 'info@globalindustries.co',
  companyWebsite: 'www.globalindustries.co',
  leftServices: [
    '• Pre Engineering Building',
    '• Roofing Solution',
    '• Engineering Project & Designing',
    '• "Z" & "C" Purlins',
  ],
  rightServices: [
    '• Infra Materials',
    '• Puf Panels & Insulation Roofing',
    '• Skylight Sheets',
    '• Air Ventilators',
  ],
};

// 1. Update projects
const projects = db.prepare('SELECT id, companyProfile FROM projects').all();
const updateProj = db.prepare('UPDATE projects SET companyProfile = ? WHERE id = ?');
projects.forEach((p) => {
  updateProj.run(JSON.stringify(cleanProfile), p.id);
  console.log('Cleaned companyProfile for project:', p.id);
});

// 2. Update documents
const docs = db.prepare('SELECT id, document FROM documents').all();
const updateDoc = db.prepare('UPDATE documents SET document = ? WHERE id = ?');
docs.forEach((d) => {
  try {
    const docObj = JSON.parse(d.document);
    if (docObj.purchaseOrder) {
      docObj.purchaseOrder.companyName = 'GLOBAL';
      docObj.purchaseOrder.companySubtitle = 'INDUSTRIES';
      docObj.purchaseOrder.tableCompanyName = 'GLOBAL';
      docObj.purchaseOrder.tableCompanySubtitle = '';
      docObj.purchaseOrder.companyAddress = [
        'Regd. Off. : SO7B / 2nd floor, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara, Gujarat - 391243',
      ];
      docObj.purchaseOrder.leftServices = [
        '• Pre Engineering Building',
        '• Roofing Solution',
        '• Engineering Project & Designing',
        '• "Z" & "C" Purlins',
      ];
      docObj.purchaseOrder.rightServices = [
        '• Infra Materials',
        '• Puf Panels & Insulation Roofing',
        '• Skylight Sheets',
        '• Air Ventilators',
      ];
    }
    if (docObj.quotation) {
      docObj.quotation.companyName = 'GLOBAL';
      docObj.quotation.companySubtitle = 'INDUSTRIES';
      docObj.quotation.companyAddressHeader =
        'Regd. Off. : SO7B / 2nd floor, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara, Gujarat - 391243';
      docObj.quotation.companyAddressFooter =
        'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243';
      docObj.quotation.leftServices = [
        '• Pre Engineering Building',
        '• Roofing Solution',
        '• Engineering Project & Designing',
        '• "Z" & "C" Purlins',
      ];
      docObj.quotation.rightServices = [
        '• Infra Materials',
        '• Puf Panels & Insulation Roofing',
        '• Skylight Sheets',
        '• Air Ventilators',
      ];
    }
    updateDoc.run(JSON.stringify(docObj), d.id);
    console.log('Cleaned document data for doc:', d.id);
  } catch (e) {
    console.error(e);
  }
});
