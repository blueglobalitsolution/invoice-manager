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
  const [selectedDocTypes, setSelectedDocTypes] = useState<ProjectDocType[]>([]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
      <div className="bg-[#f4f3eb] border border-[#cccccc] rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl text-black">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#cccccc] flex items-center justify-between bg-[#f0efe6]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shadow-xs">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black leading-tight">Create New Project</h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Universal project context that auto-fills across all quotations, POs, and invoices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:text-black rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 bg-[#f4f3eb] scrollbar-thin">
          
          {/* Section 1: Project Identity Card */}
          <div className="bg-white rounded-xl border border-[#cccccc] p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d3479] flex items-center space-x-1.5 pb-2 border-b border-[#f0efe6]">
              <span>1. Project Identity</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-black mb-1.5">
                  Project Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Construction & Pre-Fab Erection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Project Code</span>
                </label>
                <input
                  type="text"
                  placeholder="GI-PRJ-2026-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f7f7f2] border border-[#cccccc] rounded-lg text-xs font-mono font-bold text-[#0d3479] focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Site Location / City</span>
                </label>
                <input
                  type="text"
                  placeholder="Sevasi TP-1, Vadodara, Gujarat"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Estimated Budget</span>
                </label>
                <input
                  type="text"
                  placeholder="₹ 15,00,000.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs font-mono text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Client & Party Information Card */}
          <div className="bg-white rounded-xl border border-[#cccccc] p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0d3479] flex items-center space-x-1.5 pb-2 border-b border-[#f0efe6]">
              <span>2. Client & Party Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Client / Company Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. M/s. ALEMBIC LTD"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1.5 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-[#0d3479]" />
                  <span>Contact Person / Attention To</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Apurvabhai Patel"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
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
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
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
                  className="w-full px-3 py-2 bg-white border border-[#cccccc] rounded-lg text-xs font-mono text-black font-semibold focus:outline-none focus:border-[#0d3479] shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Initial Documents Selection Card */}
          <div className="bg-white rounded-xl border border-[#cccccc] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0efe6]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0d3479]">
                  3. Initial Documents <span className="text-[11px] font-normal text-[#666666] normal-case">(Optional)</span>
                </label>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Select templates to pre-generate, or leave empty to start with a blank project.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                {selectedDocTypes.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedDocTypes([])}
                    className="text-[11px] text-[#8a3b2f] hover:underline font-bold cursor-pointer"
                  >
                    Clear (Empty Project)
                  </button>
                ) : (
                  <span className="text-[11px] text-[#0d3479] bg-[#dfe7f4] border border-[#b9c7de] font-semibold px-2 py-0.5 rounded-md">
                    Empty Project
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {INITIAL_DOC_OPTIONS.map((doc) => {
                const Icon = doc.icon;
                const isSelected = selectedDocTypes.includes(doc.type);
                return (
                  <div
                    key={doc.type}
                    onClick={() => toggleDocType(doc.type)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                      isSelected
                        ? 'bg-[#dfe7f4] border-[#0d3479] text-[#0d3479] ring-2 ring-[#0d3479]/20'
                        : 'bg-white border-[#cccccc] text-black hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-[#0d3479] text-white' : 'bg-[#f0efe6] text-[#0d3479]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0d3479]" />}
                      </div>
                      <h4 className={`font-bold text-xs mb-0.5 ${isSelected ? 'text-[#0d3479]' : 'text-black'}`}>{doc.label}</h4>
                      <p className="text-[10px] text-[#666666] leading-snug">{doc.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-3.5 bg-[#f0efe6] border-t border-[#cccccc] -mx-6 -mb-6 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-black border border-[#cccccc] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-[#002057] hover:bg-[#0d3479] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all cursor-pointer active:scale-95"
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
