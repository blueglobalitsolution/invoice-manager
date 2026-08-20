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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151f30]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Project</h2>
              <p className="text-xs text-gray-400">
                Setup a new project workspace. All related quotations, POs, and invoices will be organized here.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Project Title & Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-gray-300 font-semibold mb-1">
                Project Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sanand Heavy Engineering Industrial Shed"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Project Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Client Name & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Client / Contractor Name</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Mohammad Kamil Shaikh / Tata Motors"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Project Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sevasi TP-1, Vadodara, Gujarat"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Category / Domain</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Estimated Contract Budget</span>
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. ₹25,00,000.00"
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Initial Document Selection */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-200 font-bold">
                Initial Documents to Generate in this Project:
              </label>
              <span className="text-[11px] text-gray-400">
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
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-2.5 ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                        : 'bg-[#151f2e] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-gray-600 bg-gray-800'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-[11px] truncate">{opt.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition-all cursor-pointer"
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
