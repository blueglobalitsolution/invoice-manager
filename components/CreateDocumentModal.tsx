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
    } else if (type === 'purchase_order') {
      const poNo = `GI/PO/${year}/${rnd}`;
      setDocNumber(poNo);
      setTitle(`Fabrication Labour Purchase Order - ${project.title}`);
      setAgreedAmount('₹ 3,50,000.00');
      setContractorName('RAJESHBHAI GIRI');
    } else {
      setDocNumber(`GI/DOC/${year}/${rnd}`);
      setTitle(`${tmpl?.name || 'Document'} - ${project.title}`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSelectType(selectedType);
    }
  }, [isOpen, project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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

  const getDocTypeIcon = (type: ProjectDocType, isSelected: boolean) => {
    const iconClass = isSelected ? 'w-5 h-5 text-white' : 'w-5 h-5 text-[#0d3479]';
    switch (type) {
      case 'quotation':
        return <FileSpreadsheet className={iconClass} />;
      case 'work_order':
        return <FileCheck className={iconClass} />;
      case 'invoice':
        return <Receipt className={iconClass} />;
      default:
        return <FileText className={iconClass} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs select-none">
      {/* Backdrop overlay for closing */}
      <div onClick={onClose} className="fixed inset-0 cursor-pointer" title="Click outside to close" />

      {/* Right Drawer Container */}
      <div className="relative w-full sm:max-w-2xl lg:max-w-3xl bg-white border-l border-[#cccccc] h-full flex flex-col shadow-2xl text-black z-10">
        {/* Drawer Header */}
        <div className="px-6 py-4.5 border-b border-[#cccccc] flex items-center justify-between bg-[#f0efe6] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shadow-xs">
              <FilePlus className="w-5 h-5 text-[#0d3479]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-bold text-black leading-tight">Create Document in Project</h2>
                <span className="text-xs bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de] px-2.5 py-0.5 rounded-full font-semibold">
                  {project.title}
                </span>
              </div>
              <p className="text-xs text-[#555555] mt-0.5">
                Client: <span className="text-black font-semibold">{project.clientName || 'M/s. ALEMBIC LTD'}</span> • Location: <span className="text-black font-medium">{project.location || 'Vadodara'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#666666] hover:text-black rounded-xl hover:bg-white border border-transparent hover:border-[#cccccc] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          
          <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin bg-white">
            {/* 1. Document Type Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0d3479] mb-2.5">
                1. Choose Document Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PROJECT_DOC_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedType === tmpl.type;
                  return (
                    <div
                      key={tmpl.type}
                      onClick={() => handleSelectType(tmpl.type)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#dfe7f4] border-[#0d3479] text-[#0d3479] shadow-sm'
                          : 'bg-white border-[#cccccc] text-black hover:bg-[#f7f7f2] hover:border-[#0d3479]/50 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              isSelected ? 'bg-[#002057] text-white shadow-xs' : 'bg-[#eef2f8] text-[#0d3479]'
                            }`}
                          >
                            {getDocTypeIcon(tmpl.type, isSelected)}
                          </div>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-[#002057] text-white' : 'bg-[#eef2f8] text-[#0d3479]'
                          }`}>
                            {tmpl.badge}
                          </span>
                        </div>
                        <h4 className={`font-bold text-xs mb-0.5 ${isSelected ? 'text-[#002057]' : 'text-black'}`}>{tmpl.name}</h4>
                        <p className={`text-[10.5px] leading-snug ${isSelected ? 'text-[#153e82]' : 'text-[#666666]'}`}>{tmpl.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Core Document Metadata */}
            <div className="border-t border-[#cccccc] pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d3479] mb-3">
                2. Document Title & References
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-black mb-1.5">
                    Document Title <span className="text-[#0d3479]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black focus:outline-none focus:border-[#0d3479] font-bold shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-[#0d3479]" />
                    <span>Document / Ref No.</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f7f7f2] border border-[#cccccc] rounded-xl text-xs font-mono text-[#002057] focus:outline-none focus:border-[#0d3479] font-bold shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#0d3479]" />
                    <span>Document Date</span>
                  </label>
                  <input
                    type="text"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-[#0d3479]" />
                    <span>Target Amount / Value</span>
                  </label>
                  <input
                    type="text"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs font-mono text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* 3. Document-Specific Fields */}
            <div className="border-t border-[#cccccc] pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d3479] mb-3 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>3. Specific {selectedType.toUpperCase().replace('_', ' ')} Details</span>
              </h3>

              {/* If Tax Invoice */}
              {selectedType === 'invoice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f7f7f2] p-4 rounded-xl border border-[#cccccc] shadow-xs">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Client P.O. Number
                    </label>
                    <input
                      type="text"
                      value={clientPoNumber}
                      onChange={(e) => setClientPoNumber(e.target.value)}
                      placeholder="e.g. 1300000567"
                      className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black font-mono focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Client P.O. Date
                    </label>
                    <input
                      type="text"
                      value={clientPoDate}
                      onChange={(e) => setClientPoDate(e.target.value)}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* If Commercial Quotation */}
              {selectedType === 'quotation' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f7f7f2] p-4 rounded-xl border border-[#cccccc] shadow-xs">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Offer Subject Line
                    </label>
                    <input
                      type="text"
                      value={subjectLine}
                      onChange={(e) => setSubjectLine(e.target.value)}
                      placeholder="e.g. Quotation for Construction of Round Roof System (Trussless Roof)"
                      className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Building Total Area (SQFT)
                    </label>
                    <input
                      type="text"
                      value={buildingAreaSqft}
                      onChange={(e) => setBuildingAreaSqft(e.target.value)}
                      placeholder="e.g. 8775.00 SQFT"
                      className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* If Work Order / Labour PO */}
              {selectedType === 'work_order' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f7f7f2] p-4 rounded-xl border border-[#cccccc] shadow-xs">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Contractor / Agency Name
                    </label>
                    <input
                      type="text"
                      value={contractorName}
                      onChange={(e) => setContractorName(e.target.value)}
                      placeholder="e.g. Mohammad Kamil Shaikh"
                      className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-black font-bold focus:outline-none focus:border-[#0d3479] shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-black mb-1.5">
                      Project Site Location
                    </label>
                    <input
                      type="text"
                      value={project.location || 'Sevasi TP-1, Vadodara, Gujarat'}
                      disabled
                      className="w-full px-3 py-2 bg-white/70 border border-[#cccccc] rounded-xl text-xs text-[#555555] font-semibold cursor-not-allowed shadow-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Drawer Footer Actions */}
          <div className="border-t border-[#cccccc] px-6 py-4 bg-[#f0efe6] flex items-center justify-between shrink-0">
            <div className="text-xs text-[#666666]">
              Project: <span className="font-semibold text-black">{project.title}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-black border border-[#cccccc] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !docNumber.trim()}
                className="px-5 py-2 bg-[#002057] hover:bg-[#0d3479] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <FilePlus className="w-4 h-4 text-white" />
                <span>Create Document</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
