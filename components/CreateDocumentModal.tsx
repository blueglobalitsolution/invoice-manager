'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FilePlus,
  FileSpreadsheet,
  FileCheck,
  Receipt,
  FileText,
  Calendar,
  Hash,
  Sparkles,
  Building,
  User,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { ProjectDocType, ProjectItem } from '@/types/project';
import { PROJECT_DOC_TEMPLATES } from '@/lib/project-doc-templates';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  onCreateDocument: (
    docType: ProjectDocType,
    customTitle?: string,
    customNumber?: string,
    customAmount?: string,
    documentFields?: Record<string, string>
  ) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  project,
  onCreateDocument,
}) => {
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const todayStr = new Date().toLocaleDateString('en-GB');

  const [selectedType, setSelectedType] = useState<ProjectDocType>('quotation');
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docDate, setDocDate] = useState(todayStr);

  // Specific Form Fields per Document Type
  // Tax Invoice specific
  const [clientPoNumber, setClientPoNumber] = useState('1300000567');
  const [clientPoDate, setClientPoDate] = useState(todayStr);
  const [dispatchDocNo, setDispatchDocNo] = useState('');

  // Quotation specific
  const [subjectLine, setSubjectLine] = useState('Quotation for Construction of Round Roof System (Trussless Roof)');
  const [buildingAreaSqft, setBuildingAreaSqft] = useState('8775.00 SQFT');

  // Work Order specific
  const [contractorName, setContractorName] = useState(project.clientName || 'Mohammad Kamil Shaikh');
  const [agreedAmount, setAgreedAmount] = useState('₹ 4,70,000.00');

  useEffect(() => {
    if (isOpen) {
      handleSelectType(selectedType);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleSelectType = (type: ProjectDocType) => {
    setSelectedType(type);
    const tmpl = PROJECT_DOC_TEMPLATES.find((t) => t.type === type);
    const year = new Date().getFullYear();
    const rnd = Math.floor(100 + Math.random() * 900);

    if (type === 'invoice') {
      const invNo = `TI/${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}/${rnd.toString().padStart(5, '0')}`;
      setDocNumber(invNo);
      setTitle(`Tax Invoice - ${project.title}`);
      setAgreedAmount('₹ 4,71,731.00');
    } else if (type === 'quotation') {
      const qNo = `GI-PRE-FAB-EQ-${rnd}/1002`;
      setDocNumber(qNo);
      setTitle(`Commercial Quotation - ${project.title}`);
      setAgreedAmount('₹ 8,45,000.00');
    } else if (type === 'work_order') {
      const poNo = `GI/CIVIL/${year}/${rnd}`;
      setDocNumber(poNo);
      setTitle(`Civil Labour Contract Work Order - ${project.title}`);
      setAgreedAmount('₹ 4,70,000.00');
    } else {
      setDocNumber(`GI/DOC/${year}/${rnd}`);
      setTitle(`${tmpl?.name || 'Document'} - ${project.title}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Bundle all specific document fields to pass into template instantiator
    const fields: Record<string, string> = {
      DOC_TITLE: title.trim() || `${selectedType.toUpperCase()} Sheet`,
      DOC_NUMBER: docNumber.trim() || '',
      DOC_DATE: docDate.trim() || todayStr,
      DOC_AMOUNT: agreedAmount.trim() || '₹ 0.00',
      CLIENT_PO_NUMBER: clientPoNumber.trim(),
      CLIENT_PO_DATE: clientPoDate.trim(),
      DISPATCH_DOC_NO: dispatchDocNo.trim(),
      SUBJECT_LINE: subjectLine.trim(),
      BUILDING_AREA_SQFT: buildingAreaSqft.trim(),
      CONTRACTOR_NAME: contractorName.trim() || project.clientName || 'Mohammad Kamil Shaikh',
    };

    onCreateDocument(
      selectedType,
      title.trim() || undefined,
      docNumber.trim() || undefined,
      agreedAmount.trim() || undefined,
      fields
    );

    onClose();
  };

  const getDocTypeIcon = (type: ProjectDocType) => {
    switch (type) {
      case 'quotation':
        return <FileSpreadsheet className="w-5 h-5 text-blue-400" />;
      case 'work_order':
        return <FileCheck className="w-5 h-5 text-emerald-400" />;
      case 'invoice':
        return <Receipt className="w-5 h-5 text-rose-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl text-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#16202f]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shadow-xs">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white leading-tight">Create Document in Project</h2>
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-mono font-medium">
                  {project.title}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Client: <span className="text-gray-200 font-semibold">{project.clientName || 'M/s. ALEMBIC LTD'}</span> • Location: <span className="text-gray-200">{project.location || 'Vadodara'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 scrollbar-thin">
          
          {/* 1. Document Type Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              1. Choose Document Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PROJECT_DOC_TEMPLATES.map((tmpl) => {
                const isSelected = selectedType === tmpl.type;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => handleSelectType(tmpl.type)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'bg-[#16202f] border-gray-800 text-gray-400 hover:bg-[#1d2b3f] hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {getDocTypeIcon(tmpl.type)}
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-emerald-400">
                          {tmpl.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white mb-0.5">{tmpl.name}</h4>
                      <p className="text-[10px] text-gray-400 leading-snug">{tmpl.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Core Document Metadata */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              2. Document Title & References
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  Document Title <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                  <span>Document / Ref No.</span>
                </label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Document Date</span>
                </label>
                <input
                  type="text"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span>Target Amount / Value</span>
                </label>
                <input
                  type="text"
                  value={agreedAmount}
                  onChange={(e) => setAgreedAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Document-Specific Fields */}
          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Specific {selectedType.toUpperCase().replace('_', ' ')} Details</span>
            </h3>

            {/* If Tax Invoice */}
            {selectedType === 'invoice' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#16202f] p-4 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Client P.O. Number
                  </label>
                  <input
                    type="text"
                    value={clientPoNumber}
                    onChange={(e) => setClientPoNumber(e.target.value)}
                    placeholder="e.g. 1300000567"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Client P.O. Date
                  </label>
                  <input
                    type="text"
                    value={clientPoDate}
                    onChange={(e) => setClientPoDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* If Commercial Quotation */}
            {selectedType === 'quotation' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#16202f] p-4 rounded-xl border border-gray-800">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Offer Subject Line
                  </label>
                  <input
                    type="text"
                    value={subjectLine}
                    onChange={(e) => setSubjectLine(e.target.value)}
                    placeholder="e.g. Quotation for Construction of Round Roof System (Trussless Roof)"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Building Total Area (SQFT)
                  </label>
                  <input
                    type="text"
                    value={buildingAreaSqft}
                    onChange={(e) => setBuildingAreaSqft(e.target.value)}
                    placeholder="e.g. 8775.00 SQFT"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* If Work Order / Labour PO */}
            {selectedType === 'work_order' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#16202f] p-4 rounded-xl border border-gray-800">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Contractor / Agency Name
                  </label>
                  <input
                    type="text"
                    value={contractorName}
                    onChange={(e) => setContractorName(e.target.value)}
                    placeholder="e.g. Mohammad Kamil Shaikh"
                    className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Project Site Location
                  </label>
                  <input
                    type="text"
                    value={project.location || 'Sevasi TP-1, Vadodara, Gujarat'}
                    disabled
                    className="w-full px-3 py-2 bg-[#1e293b]/60 border border-gray-800 rounded-xl text-xs text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-800 pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !docNumber.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create Document</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
