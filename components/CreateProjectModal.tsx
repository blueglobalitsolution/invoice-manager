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
  Package,
  Receipt,
  Layers,
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
    location: string;
    category: string;
    budget: string;
    initialDocTypes: ProjectDocType[];
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
    type: 'purchase_order',
    label: 'Material Purchase Order',
    desc: 'Procurement order for PEB steel & roofing sheets',
    icon: Package,
  },
  {
    type: 'invoice',
    label: 'Tax Invoice & RA Bill',
    desc: 'Running Account progress billing with retention',
    icon: Receipt,
  },
  {
    type: 'technical_specs',
    label: 'Technical Specs Annexure',
    desc: 'Engineering tolerances & QA/QC inspection plans',
    icon: Layers,
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
  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [budget, setBudget] = useState('₹15,00,000.00');
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

    onCreate({
      title: title.trim(),
      code: code.trim() || `GI-PRJ-${currentYear}-${randomNum}`,
      clientName: clientName.trim() || 'Valued Client / Contractor',
      location: location.trim() || 'Vadodara, Gujarat',
      category,
      budget: budget.trim() || '₹0.00',
      initialDocTypes: selectedDocTypes,
    });

    setTitle('');
    setClientName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d3479]/18 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-card rounded-[32px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-[#cccccc] flex items-center justify-between bg-white/35">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[20px] bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[30px] leading-[0.95]">Create New Project</h2>
              <p className="text-sm text-[#666666] mt-2">
                Setup a new project workspace. All related quotations, POs, and invoices will be organized here.
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[#666666] font-semibold mb-2">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sanand Heavy Engineering Industrial Shed"
                className="brand-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-[#666666] font-semibold mb-2">Project Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="brand-input w-full px-4 py-3 text-sm font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#666666] font-semibold mb-2 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>Client / Contractor Name</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Mohammad Kamil Shaikh / Tata Motors"
                className="brand-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-[#666666] font-semibold mb-2 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>Project Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sevasi TP-1, Vadodara, Gujarat"
                className="brand-input w-full px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#666666] font-semibold mb-2 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>Category / Domain</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="brand-input w-full px-4 py-3 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#666666] font-semibold mb-2 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-[#0d3479]" />
                <span>Estimated Contract Budget</span>
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. ₹25,00,000.00"
                className="brand-input w-full px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-sm">
                Initial Documents to Generate in this Project:
              </label>
              <span className="text-[11px] text-[#666666]">
                {selectedDocTypes.length} document{selectedDocTypes.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INITIAL_DOC_OPTIONS.map((opt) => {
                const isChecked = selectedDocTypes.includes(opt.type);
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.type}
                    onClick={() => toggleDocType(opt.type)}
                    className={`p-3 rounded-[20px] border transition-all cursor-pointer flex items-start space-x-2.5 ${
                      isChecked
                        ? 'bg-[#dfe7f4] border-[#b9c7de] text-black'
                        : 'bg-white/45 border-[#cccccc] text-[#666666] hover:bg-white/75 hover:text-black'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-[#0d3479] border-[#0d3479] text-white'
                          : 'border-[#cccccc] bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5 text-[#0d3479] shrink-0" />
                        <span className="font-semibold text-[11px] truncate">{opt.label}</span>
                      </div>
                      <p className="text-[10px] text-[#666666] mt-0.5 line-clamp-1">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
              disabled={!title.trim()}
              className="brand-button px-5 py-3 disabled:opacity-50 text-white font-semibold rounded-[12px] flex items-center space-x-2 transition-all cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Project & Dossier</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
