'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  User,
  FolderGit2,
  Check,
  Save,
  RotateCcw,
  Sparkles,
  MapPin,
  FileText,
  Phone,
  Mail,
  Globe,
  Hash,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { ProjectItem, CompanyProfile } from '@/types/project';
import { LatexDocument } from '@/types/document';
import {
  formatGstInput,
  formatPanInput,
  sanitizePhoneInput,
} from '@/lib/validation';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectItem;
  onSaveProjectSettings: (updatedProject: ProjectItem, syncToDocuments: boolean) => void;
  activeDoc?: LatexDocument;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onSaveProjectSettings,
  activeDoc,
}) => {
  const [activeTab, setActiveTab] = useState<'project' | 'client' | 'company'>('project');
  const [syncToAllDocs, setSyncToAllDocs] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const effectiveDoc = activeDoc || project?.documents?.[0]?.document || project?.document;
  const activePO = effectiveDoc?.purchaseOrder;
  const activeQ = effectiveDoc?.quotation;
  const activeTax = effectiveDoc?.taxInvoice;
  const pCp = project?.companyProfile || ({} as Partial<CompanyProfile>);

  // Compute live initial values matching real Header & Footer
  const initCompName =
    pCp.companyName ||
    activePO?.tableCompanyName ||
    activePO?.companyName ||
    activeQ?.companyName ||
    activeTax?.companyName ||
    'GLOBAL INDUSTRIES';

  const initCompSubtitle =
    pCp.companySubtitle !== undefined
      ? pCp.companySubtitle
      : activePO?.tableCompanySubtitle ||
        activePO?.companySubtitle ||
        activeQ?.companySubtitle ||
        activeTax?.companySubtitle ||
        '';

  const initGstNo =
    pCp.companyGstNo ||
    activePO?.gstNo ||
    activeQ?.companyGstNo ||
    activeTax?.companyGstNo ||
    '24CLNPS9550H1ZI';

  const initPanNo = pCp.companyPanNo || activeTax?.companyPanNo || 'CLNPS9550H';
  const initEpfNo = pCp.companyEpfNo || activeTax?.companyEpfNo || 'GJ/VAD/1234567/000';
  const initPhone =
    pCp.companyPhone ||
    activePO?.companyPhone ||
    activeQ?.companyPhone ||
    activeTax?.companyPhone ||
    '+91 97254 45370';

  const initEmail =
    pCp.companyEmail ||
    activePO?.companyEmail ||
    activeQ?.companyEmail ||
    activeTax?.companyEmail ||
    'info@globalindustries.co';

  const initWebsite =
    pCp.companyWebsite ||
    activePO?.companyWebsite ||
    activeQ?.companyWebsite ||
    activeTax?.companyWebsite ||
    'www.globalindustries.co';

  const initAddrHeader =
    pCp.companyAddressHeader ||
    (activePO?.tableCompanyAddress || activePO?.companyAddress
      ? (activePO.tableCompanyAddress || activePO.companyAddress).join('\n')
      : '') ||
    activeQ?.companyAddressHeader ||
    activeTax?.companyAddressHeader ||
    'SO70 / 2nd Floor / Phase 2 Indiabulls, Jetalpur Road\nVadodara, Gujarat';

  const initAddrFooter =
    pCp.companyAddressFooter ||
    activePO?.companyAddressFooter ||
    activeQ?.companyAddressFooter ||
    activeTax?.companyAddressFooter ||
    'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243';

  // Form States initialized with accurate defaults
  const [projectTitle, setProjectTitle] = useState(
    project?.title || activePO?.projectName || effectiveDoc?.title || ''
  );
  const [projectCode, setProjectCode] = useState(
    project?.code || activePO?.poNumber || activeQ?.refNo || ''
  );
  const [projectLocation, setProjectLocation] = useState(
    project?.location || activePO?.projectLocation || activeQ?.toAddress || ''
  );
  const [projectBudget, setProjectBudget] = useState(project?.budget || '');

  const [clientName, setClientName] = useState(
    project?.clientName ||
      activePO?.contractorName ||
      activeQ?.toRecipient ||
      activeTax?.clientName ||
      ''
  );
  const [clientAddress, setClientAddress] = useState(
    project?.clientAddress || activeQ?.toAddress || activeTax?.clientAddressLine1 || ''
  );
  const [clientGstNo, setClientGstNo] = useState(
    project?.clientGstNo || activeTax?.clientGstNo || ''
  );
  const [contactPerson, setContactPerson] = useState(project?.contactPerson || '');

  const [companyName, setCompanyName] = useState(initCompName);
  const [companySubtitle, setCompanySubtitle] = useState(initCompSubtitle);
  const [companyGstNo, setCompanyGstNo] = useState(initGstNo);
  const [companyPanNo, setCompanyPanNo] = useState(initPanNo);
  const [companyEpfNo, setCompanyEpfNo] = useState(initEpfNo);
  const [companyPhone, setCompanyPhone] = useState(initPhone);
  const [companyEmail, setCompanyEmail] = useState(initEmail);
  const [companyWebsite, setCompanyWebsite] = useState(initWebsite);
  const [companyAddressHeader, setCompanyAddressHeader] = useState(initAddrHeader);
  const [companyAddressFooter, setCompanyAddressFooter] = useState(initAddrFooter);

  // Sync state whenever project, activeDoc, or modal open state updates
  useEffect(() => {
    if (project || effectiveDoc) {
      const liveDoc = activeDoc || project?.documents?.[0]?.document || project?.document;
      const livePO = liveDoc?.purchaseOrder;
      const liveQ = liveDoc?.quotation;
      const liveTax = liveDoc?.taxInvoice;
      const liveCp = project?.companyProfile || ({} as Partial<CompanyProfile>);

      // Project Title
      const titleVal = project?.title || livePO?.projectName || liveDoc?.title || '';
      setProjectTitle(titleVal);

      // Project Code
      const codeVal = project?.code || livePO?.poNumber || liveQ?.refNo || '';
      setProjectCode(codeVal);

      // Location
      const locVal = project?.location || livePO?.projectLocation || liveQ?.toAddress || '';
      setProjectLocation(locVal);

      // Budget
      setProjectBudget(project?.budget || '');

      // Client Name
      const clientVal =
        project?.clientName ||
        livePO?.contractorName ||
        liveQ?.toRecipient ||
        liveTax?.clientName ||
        '';
      setClientName(clientVal);

      // Client Address
      const clientAddrVal =
        project?.clientAddress || liveQ?.toAddress || liveTax?.clientAddressLine1 || '';
      setClientAddress(clientAddrVal);

      // Client GST No
      const clientGstVal = project?.clientGstNo || liveTax?.clientGstNo || '';
      setClientGstNo(clientGstVal);

      // Contact Person
      setContactPerson(project?.contactPerson || '');

      // Company Info
      const compNameVal =
        liveCp.companyName ||
        livePO?.tableCompanyName ||
        livePO?.companyName ||
        liveQ?.companyName ||
        liveTax?.companyName ||
        'GLOBAL INDUSTRIES';
      setCompanyName(compNameVal);

      const compSubtitleVal =
        liveCp.companySubtitle !== undefined
          ? liveCp.companySubtitle
          : livePO?.tableCompanySubtitle ||
            livePO?.companySubtitle ||
            liveQ?.companySubtitle ||
            liveTax?.companySubtitle ||
            '';
      setCompanySubtitle(compSubtitleVal);

      const compGstVal =
        liveCp.companyGstNo ||
        livePO?.gstNo ||
        liveQ?.companyGstNo ||
        liveTax?.companyGstNo ||
        '24CLNPS9550H1ZI';
      setCompanyGstNo(compGstVal);

      const compPanVal = liveCp.companyPanNo || liveTax?.companyPanNo || 'CLNPS9550H';
      setCompanyPanNo(compPanVal);

      const compEpfVal = liveCp.companyEpfNo || liveTax?.companyEpfNo || 'GJ/VAD/1234567/000';
      setCompanyEpfNo(compEpfVal);

      const compPhoneVal =
        liveCp.companyPhone ||
        livePO?.companyPhone ||
        liveQ?.companyPhone ||
        liveTax?.companyPhone ||
        '+91 97254 45370';
      setCompanyPhone(compPhoneVal);

      const compEmailVal =
        liveCp.companyEmail ||
        livePO?.companyEmail ||
        liveQ?.companyEmail ||
        liveTax?.companyEmail ||
        'info@globalindustries.co';
      setCompanyEmail(compEmailVal);

      const compWebVal =
        liveCp.companyWebsite ||
        livePO?.companyWebsite ||
        liveQ?.companyWebsite ||
        liveTax?.companyWebsite ||
        'www.globalindustries.co';
      setCompanyWebsite(compWebVal);

      const compAddrHVal =
        liveCp.companyAddressHeader ||
        (livePO?.tableCompanyAddress || livePO?.companyAddress
          ? (livePO.tableCompanyAddress || livePO.companyAddress).join('\n')
          : '') ||
        liveQ?.companyAddressHeader ||
        liveTax?.companyAddressHeader ||
        'SO70 / 2nd Floor / Phase 2 Indiabulls, Jetalpur Road\nVadodara, Gujarat';
      setCompanyAddressHeader(compAddrHVal);

      const compAddrFVal =
        liveCp.companyAddressFooter ||
        livePO?.companyAddressFooter ||
        liveQ?.companyAddressFooter ||
        liveTax?.companyAddressFooter ||
        'Block No. 1068/99, Ratnakar Business Hub, Por GIDC, Ramangamdi Road, Vadodara - 391243';
      setCompanyAddressFooter(compAddrFVal);
    }
  }, [project, activeDoc, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCompanyProfile: CompanyProfile = {
      ...(project.companyProfile || { leftServices: [], rightServices: [] }),
      companyName: companyName.trim(),
      companySubtitle: companySubtitle.trim(),
      companyGstNo: companyGstNo.trim(),
      companyPanNo: companyPanNo.trim(),
      companyEpfNo: companyEpfNo.trim(),
      companyPhone: companyPhone.trim(),
      companyEmail: companyEmail.trim(),
      companyWebsite: companyWebsite.trim(),
      companyAddressHeader: companyAddressHeader.trim(),
      companyAddressFooter: companyAddressFooter.trim(),
    };

    const updatedProject: ProjectItem = {
      ...project,
      title: projectTitle.trim() || project.title,
      code: projectCode.trim(),
      location: projectLocation.trim(),
      budget: projectBudget.trim(),
      clientName: clientName.trim(),
      clientAddress: clientAddress.trim(),
      clientGstNo: clientGstNo.trim(),
      contactPerson: contactPerson.trim(),
      companyProfile: updatedCompanyProfile,
      lastModified: 'Just now by You',
    };

    onSaveProjectSettings(updatedProject, syncToAllDocs);

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#0B101E] border border-[#1E293B] rounded-2xl max-w-2xl w-full text-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Project & Master Settings</h3>
              <p className="text-xs text-slate-400">
                Central source of truth for all documents in this project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-[#0F172A]/50 border-b border-[#1E293B] flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('project')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'project'
                ? 'border-indigo-500 text-indigo-400 bg-[#0B101E]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>Project Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('client')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'client'
                ? 'border-indigo-500 text-indigo-400 bg-[#0B101E]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Client / Party Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`px-4 py-2.5 rounded-t-lg text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === 'company'
                ? 'border-indigo-500 text-indigo-400 bg-[#0B101E]'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Issuer Company Profile</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
          {/* Tab 1: Project Details */}
          {activeTab === 'project' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Project Name / Title</span>
                  </label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    required
                    placeholder="e.g. Construction of Round Roof System (Trussless Roof)"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-medium placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Project Code / Ref</span>
                  </label>
                  <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    placeholder="e.g. GI-PRJ-2026-29"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Total Project Budget</span>
                  </label>
                  <input
                    type="text"
                    value={projectBudget}
                    onChange={(e) => setProjectBudget(e.target.value)}
                    placeholder="e.g. ₹15,00,000.00"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-medium placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Site / Project Location</span>
                  </label>
                  <textarea
                    rows={2}
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="e.g. Plot No 123, GIDC Industrial Estate, Savli, Vadodara, Gujarat"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Client / Party Info */}
          {activeTab === 'client' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Client / Contractor Name</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. ALEMBIC PHARMACEUTICALS LTD"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Client GST Number</span>
                  </label>
                  <input
                    type="text"
                    value={clientGstNo}
                    onChange={(e) => setClientGstNo(formatGstInput(e.target.value))}
                    placeholder="e.g. 24AAAAA1234A1Z5"
                    maxLength={15}
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Contact Person / Rep</span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Rajesh Patel (Project Head)"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Client Billing / Site Address</span>
                  </label>
                  <textarea
                    rows={3}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Enter complete client address with pin code..."
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Company Profile */}
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Issuer Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. BLUE GLOBAL"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-bold placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Company Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={companySubtitle}
                    onChange={(e) => setCompanySubtitle(e.target.value)}
                    placeholder="e.g. ENGINEERING & INFRASTRUCTURE"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Company GST Number
                  </label>
                  <input
                    type="text"
                    value={companyGstNo}
                    onChange={(e) => setCompanyGstNo(formatGstInput(e.target.value))}
                    placeholder="e.g. 24AAAAB1234C1Z1"
                    maxLength={15}
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Company PAN Number
                  </label>
                  <input
                    type="text"
                    value={companyPanNo}
                    onChange={(e) => setCompanyPanNo(formatPanInput(e.target.value))}
                    placeholder="e.g. AAAAB1234C"
                    maxLength={10}
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Official Phone / Contact</span>
                  </label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(sanitizePhoneInput(e.target.value))}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Official Email</span>
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="e.g. info@blueglobal.in"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Official Website</span>
                  </label>
                  <input
                    type="text"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="e.g. www.blueglobal.in"
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Header Letterhead Address
                  </label>
                  <textarea
                    rows={2}
                    value={companyAddressHeader}
                    onChange={(e) => setCompanyAddressHeader(e.target.value)}
                    placeholder="Full company address shown on top letterhead..."
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Footer Registered Office Address
                  </label>
                  <input
                    type="text"
                    value={companyAddressFooter}
                    onChange={(e) => setCompanyAddressFooter(e.target.value)}
                    placeholder="Registered Office single line address for page footer..."
                    className="w-full bg-[#131B2E] border border-[#23314D] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sync Checkbox & Notice */}
          <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncToAllDocs}
                onChange={(e) => setSyncToAllDocs(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-[#131B2E]"
              />
              <span className="text-xs text-slate-300 font-medium">
                Auto-sync updates to all existing documents in this project
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center space-x-1.5 cursor-pointer active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved & Synced!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Apply Master Info</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
