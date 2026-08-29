'use client';

import React, { useState } from 'react';
import {
  X,
  FolderPlus,
  Building2,
  MapPin,
  DollarSign,
  Tag,
  FileSpreadsheet,
  FileCheck,
  Receipt,
  User,
  Hash,
  Sparkles,
  Check,
} from 'lucide-react';
import { ProjectDocType } from '@/types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: {
    title: string;
    code: string;
    clientName: string;
    clientAddress?: string;
    clientGstNo?: string;
    contactPerson?: string;
    location: string;
    category: string;
    budget: string;
    initialDocTypes: ProjectDocType[];
    globalVariables?: Record<string, string>;
  }) => void;
}

const CATEGORIES = [
  'Civil Construction',
  'PEB & Roofing Solutions',
  'Industrial Infrastructure',
  'Commercial MEP & Civil',
  'Turnkey EPC Project',
  'Maintenance & Renovation',
];

const INITIAL_DOC_OPTIONS: { type: ProjectDocType; label: string; desc: string; icon: any }[] = [
  {
    type: 'quotation',
    label: 'Commercial Quotation',
    desc: 'Itemized BOQ rate matrix with payment schedule',
    icon: FileSpreadsheet,
  },
  {
    type: 'work_order',
    label: 'Labour Contract Work Order',
    desc: '3-page civil labour PO with milestones & terms',
    icon: FileCheck,
  },
  {
    type: 'invoice',
    label: 'Tax Invoice & RA Bill',
    desc: 'Running Account progress billing with retention',
    icon: Receipt,
  },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const currentYear = new Date().getFullYear();
  const randomNum = Math.floor(10 + Math.random() * 90);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState(`GI-PRJ-${currentYear}-${randomNum}`);
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('Alembic Road, Gorwa, Vadodara, Gujarat');
  const [clientGstNo, setClientGstNo] = useState('24AABCA7950P1ZB');
  const [contactPerson, setContactPerson] = useState('Mr. Apurvabhai Patel');
  const [location, setLocation] = useState('Sevasi TP-1, Vadodara, Gujarat');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budget, setBudget] = useState('₹ 15,00,000.00');
  const [selectedDocTypes, setSelectedDocTypes] = useState<ProjectDocType[]>([
    'quotation',
    'work_order',
  ]);

  if (!isOpen) return null;

  const toggleDocType = (type: ProjectDocType) => {
    setSelectedDocTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Standardized Global Variables automatically mapped from simple form inputs
    const vars: Record<string, string> = {
      PROJECT_NAME: title.trim(),
      PROJECT_CODE: code.trim() || `GI-PRJ-${currentYear}-${randomNum}`,
      CLIENT_NAME: clientName.trim() || 'M/s. ALEMBIC LTD',
      CLIENT_ADDRESS: clientAddress.trim() || 'Vadodara, Gujarat',
      CLIENT_GST_NO: clientGstNo.trim() || '24AABCA7950P1ZB',
      CONTACT_PERSON: contactPerson.trim() || 'Apurvabhai Patel',
      PROJECT_LOCATION: location.trim() || 'Vadodara, Gujarat',
      PROJECT_BUDGET: budget.trim() || '₹ 0.00',
    };

    onCreate({
      title: title.trim(),
      code: code.trim() || `GI-PRJ-${currentYear}-${randomNum}`,
      clientName: clientName.trim() || 'M/s. ALEMBIC LTD',
      clientAddress: clientAddress.trim() || 'Vadodara, Gujarat',
      clientGstNo: clientGstNo.trim() || '24AABCA7950P1ZB',
      contactPerson: contactPerson.trim() || 'Apurvabhai Patel',
      location: location.trim() || 'Vadodara, Gujarat',
      category,
      budget: budget.trim() || '₹ 0.00',
      initialDocTypes: selectedDocTypes,
      globalVariables: vars,
    });

    setTitle('');
    setClientName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#cccccc]/80 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl text-black">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cccccc] flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Create New Project</h2>
              <p className="text-xs text-[#333333]">
                Universal project context that auto-fills across all quotations, POs, and invoices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#333333] hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 scrollbar-thin">
          
          {/* Section 1: Project Identity */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-1.5">
              <span>1. Project Identity</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-black mb-1.5">
                  Project Title / Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Construction & Pre-Fab Erection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-[#333333]" />
                  <span>Project Code</span>
                </label>
                <input
                  type="text"
                  placeholder="GI-PRJ-2026-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-[#333333]" />
                  <span>Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#333333]" />
                  <span>Site Location / City</span>
                </label>
                <input
                  type="text"
                  placeholder="Sevasi TP-1, Vadodara, Gujarat"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#333333]" />
                  <span>Estimated Budget</span>
                </label>
                <input
                  type="text"
                  placeholder="₹ 15,00,000.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Client & Party Information */}
          <div className="border-t border-[#cccccc] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center space-x-1.5">
              <span>2. Client & Party Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-[#333333]" />
                  <span>Client / Company Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. M/s. ALEMBIC LTD"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-[#333333]" />
                  <span>Contact Person / Attention To</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Apurvabhai Patel"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Client Address & State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alembic Road, Gorwa, Vadodara, Gujarat"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5">
                  Client GSTIN / Tax ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24AABCA7950P1ZB"
                  value={clientGstNo}
                  onChange={(e) => setClientGstNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Initial Documents Selection */}
          <div className="border-t border-[#cccccc] pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              3. Initial Documents to Generate in Project
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {INITIAL_DOC_OPTIONS.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedDocTypes.includes(doc.type);
                return (
                  <div
                    key={doc.type}
                    onClick={() => toggleDocType(doc.type)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-xs'
                        : 'bg-white border-[#cccccc] text-[#333333] hover:bg-white hover:border-[#cccccc]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-[#333333]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <h4 className="font-bold text-xs text-white mb-0.5">{doc.label}</h4>
                      <p className="text-[10px] text-[#333333] leading-snug">{doc.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#cccccc] pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-black rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-[#002057] hover:bg-[#0d3479] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
