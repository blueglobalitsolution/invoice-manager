'use client';

import React, { useState } from 'react';
import {
  X,
  FilePlus,
  FileSpreadsheet,
  FileCheck,
  Package,
  Receipt,
  Layers,
  FileText,
  DollarSign,
  Hash,
  Sparkles,
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
    customAmount?: string
  ) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  project,
  onCreateDocument,
}) => {
  const [selectedType, setSelectedType] = useState<ProjectDocType>('quotation');
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const currentTemplate = PROJECT_DOC_TEMPLATES.find((t) => t.type === selectedType) || PROJECT_DOC_TEMPLATES[0];

  const handleSelectType = (type: ProjectDocType) => {
    setSelectedType(type);
    const tmpl = PROJECT_DOC_TEMPLATES.find((t) => t.type === type);
    if (tmpl) {
      const year = new Date().getFullYear();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setDocNumber(`${tmpl.defaultPrefix}/${year}/${randomSuffix}`);
      setAmount(tmpl.defaultAmount);
      setTitle(`${tmpl.name} - ${project.title}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateDocument(
      selectedType,
      title.trim() || undefined,
      docNumber.trim() || undefined,
      amount.trim() || undefined
    );
    onClose();
  };

  const getIcon = (type: ProjectDocType) => {
    switch (type) {
      case 'quotation':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case 'work_order':
        return <FileCheck className="w-5 h-5 text-emerald-600" />;
      case 'invoice':
        return <Receipt className="w-5 h-5 text-rose-600" />;
      case 'custom':
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <FilePlus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d3479]/18 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-card rounded-[32px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#cccccc] flex items-center justify-between bg-white/35">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[20px] bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479]">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[30px] leading-[0.95]">Add Document to Project</h2>
              <p className="text-sm text-[#666666] mt-2">
                Inside: <span className="text-[#0d3479] font-bold">{project.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#666666] hover:text-black rounded-[12px] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Template Selection Grid */}
          <div>
            <label className="block text-[#666666] font-semibold mb-2">Select Document Type:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROJECT_DOC_TEMPLATES.map((tmpl) => {
                const isSelected = selectedType === tmpl.type;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => handleSelectType(tmpl.type)}
                    className={`p-3 rounded-[20px] border transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-[#dfe7f4] border-[#b9c7de] text-black shadow-sm'
                        : 'bg-white/45 border-[#cccccc] text-[#666666] hover:bg-white/75 hover:text-black'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(tmpl.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-[12px] truncate ${isSelected ? 'text-[#0d3479]' : 'text-black'}`}>
                          {tmpl.badge}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#0d3479]"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#666666] mt-0.5 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-[#666666] font-semibold mb-2">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${currentTemplate.name} - ${project.title}`}
              className="brand-input w-full px-4 py-3 text-sm"
            />
          </div>

          {/* Reference Number & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#666666] font-semibold mb-2 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>Reference / Document No.</span>
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. GI/QT/2026/101"
                className="brand-input w-full px-4 py-3 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[#666666] font-semibold mb-2 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>Valuation / Amount</span>
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. ₹8,45,000.00"
                className="brand-input w-full px-4 py-3 text-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#cccccc] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-white/65 hover:bg-white text-[#666666] rounded-[12px] font-medium transition-colors cursor-pointer border border-[#cccccc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="brand-button active:scale-95 px-5 py-3 text-white font-semibold rounded-[12px] flex items-center space-x-2 transition-all cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create & Open Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
