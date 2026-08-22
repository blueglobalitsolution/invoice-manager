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
      case 'purchase_order':
        return <Package className="w-5 h-5 text-amber-600" />;
      case 'invoice':
        return <Receipt className="w-5 h-5 text-rose-600" />;
      case 'technical_specs':
        return <Layers className="w-5 h-5 text-teal-600" />;
      case 'contract':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FilePlus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Add Document to Project</h2>
              <p className="text-xs text-gray-500">
                Inside: <span className="text-emerald-600 font-semibold">{project.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Template Selection Grid */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">Select Document Type:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PROJECT_DOC_TEMPLATES.map((tmpl) => {
                const isSelected = selectedType === tmpl.type;
                return (
                  <div
                    key={tmpl.type}
                    onClick={() => handleSelectType(tmpl.type)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-500/50 shadow-sm text-blue-900'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(tmpl.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-[12px] truncate ${isSelected ? 'text-blue-950' : 'text-gray-900'}`}>
                          {tmpl.badge}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
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
            <label className="block text-gray-700 font-semibold mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`${currentTemplate.name} - ${project.title}`}
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Reference Number & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-blue-600" />
                <span>Reference / Document No.</span>
              </label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. GI/QT/2026/101"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valuation / Amount</span>
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. ₹8,45,000.00"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Inherited Project Metadata Note */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-800">Auto-Linked Project Context:</span>
              <p className="mt-0.5">
                This document will automatically inherit the project name{' '}
                <span className="text-gray-900 font-medium">"{project.title}"</span>, client{' '}
                <span className="text-gray-900 font-medium">"{project.clientName || 'Contractor'}"</span>,
                and location <span className="text-gray-900 font-medium">"{project.location || 'Site'}"</span> into its LaTeX A4 letterhead.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="brand-button active:scale-95 px-5 py-2 text-white font-semibold rounded-lg flex items-center space-x-2 transition-all cursor-pointer"
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
