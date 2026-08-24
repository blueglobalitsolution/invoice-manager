'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  FileSpreadsheet,
  FileCheck,
  Receipt,
  FileText,
  FilePlus,
  Trash2,
  Copy,
  ExternalLink,
  Building2,
  MapPin,
  DollarSign,
  Tag,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  PenTool,
  Check,
  Grid,
  List,
  ChevronDown,
  Archive,
  FolderOpen,
} from 'lucide-react';
import {
  ProjectItem,
  ProjectDocumentItem,
  ProjectDocType,
  ProjectDocStatus,
  ProjectStatus,
} from '@/types/project';
import { CreateDocumentModal } from '@/components/CreateDocumentModal';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useRouter } from 'next/navigation';

interface ProjectDetailViewProps {
  project: ProjectItem;
  onBack: () => void;
  onOpenDocument: (documentId: string) => void;
  onCreateDocument: (
    docType: ProjectDocType,
    customTitle?: string,
    customNumber?: string,
    customAmount?: string
  ) => void;
  onDeleteDocument: (documentId: string) => void;
  onDuplicateDocument: (documentId: string) => void;
  onUpdateDocumentStatus: (documentId: string, status: ProjectDocStatus) => void;
  onUpdateProjectStatus: (status: ProjectStatus) => void;
  onDeleteProject: () => void;
  onArchiveProject?: () => void;
  onUpdateCompanyProfile?: (profile: any) => void;
  currentUser?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onOpenDocument,
  onCreateDocument,
  onDeleteDocument,
  onDuplicateDocument,
  onUpdateDocumentStatus,
  onUpdateProjectStatus,
  onDeleteProject,
  onArchiveProject,
  onUpdateCompanyProfile,
  currentUser,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ProjectDocType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectDocStatus>('all');
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const router = useRouter();
  const [activeStatusMenuDocId, setActiveStatusMenuDocId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const documents = project.documents || [];

  const filteredDocs = documents.filter((doc) => {
    if (typeFilter !== 'all' && doc.docType !== typeFilter) return false;
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.docNumber.toLowerCase().includes(q) ||
      doc.docType.toLowerCase().includes(q) ||
      (doc.amount && doc.amount.toLowerCase().includes(q))
    );
  });

  const getDocTypeIcon = (type: ProjectDocType) => {
    switch (type) {
      case 'quotation':
        return <FileSpreadsheet className="w-4 h-4 text-[#0d3479]" />;
      case 'work_order':
        return <FileCheck className="w-4 h-4 text-emerald-700" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-rose-700" />;
      default:
        return <FileText className="w-4 h-4 text-gray-700" />;
    }
  };

  const getDocTypeBadgeColor = (type: ProjectDocType) => {
    switch (type) {
      case 'quotation':
        return 'bg-[#dfe7f4] text-[#0d3479] border-[#b9c7de]';
      case 'work_order':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'invoice':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status: ProjectDocStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'signed':
        return { label: 'Signed', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: PenTool };
      case 'sent':
        return { label: 'Sent', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Send };
      case 'paid':
        return { label: 'Paid', color: 'bg-teal-50 text-teal-700 border-teal-200', icon: Check };
      case 'under_review':
        return { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
      case 'draft':
      default:
        return { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock };
    }
  };

  const docCountByType = {
    quotation: documents.filter((d) => d.docType === 'quotation').length,
    work_order: documents.filter((d) => d.docType === 'work_order').length,
    invoice: documents.filter((d) => d.docType === 'invoice').length,
    custom: documents.filter((d) => d.docType === 'custom').length,
  };

  return (
    <div className="app-shell flex min-h-screen w-full bg-gray-50 text-black font-sans overflow-hidden select-none">
      <DashboardSidebar
        currentUser={currentUser || null}
        onOpenAuth={() => {}}
        onLogout={onLogout || (() => {})}
        projectId={project.id}
        projectName={project.title}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Navigation */}
        <header className="h-16 px-4 md:px-6 flex items-center justify-between shrink-0 border-b border-[#cccccc] bg-white/40 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#0d3479]">Project</span>
              <span className="text-gray-400">/</span>
              <span className="text-sm font-bold text-black truncate max-w-[200px] md:max-w-md">
                {project.title}
              </span>
              {project.code && (
                <span className="px-2 py-0.5 rounded-[8px] bg-[#dfe7f4] text-[#0d3479] font-mono text-[11px] border border-[#b9c7de] hidden md:inline">
                  {project.code}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onArchiveProject && (
              <button
                onClick={onArchiveProject}
                className="px-4 py-2.5 bg-white/65 hover:bg-white text-[#666666] hover:text-black rounded-[12px] font-medium text-xs flex items-center space-x-1.5 border border-[#cccccc] transition-colors cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>{project.status === 'archived' || project.isArchived ? 'Unarchive Project' : 'Archive'}</span>
              </button>
            )}
            <button
              onClick={() => setIsCreateDocModalOpen(true)}
              className="brand-button active:scale-95 px-4 py-2.5 text-white rounded-[12px] font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Project Header Banner & Overview */}
          <div className="glass-card rounded-[32px] p-5 md:p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#cccccc]">
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de]">
                    {project.category || 'Civil & PEB'}
                  </span>
                  {project.code && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-[#666666] bg-white border border-[#cccccc]">
                      {project.code}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border capitalize ${
                    project.status === 'archived' || project.isArchived
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-[#dfe7f4] text-[#0d3479] border-[#b9c7de]'
                  }`}>
                    {project.status === 'archived' || project.isArchived ? 'Archived' : (project.status || 'Active')}
                  </span>
                </div>
                <h1 className="text-[28px] md:text-[34px] font-bold text-black mt-2 leading-tight tracking-tight">
                  {project.title}
                </h1>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 text-xs">
              <div className="surface-card rounded-[24px] p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-[16px] bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#666666] text-[11px] uppercase tracking-[0.12em]">Client / Contractor</div>
                  <div className="font-bold text-black truncate mt-0.5">
                    {project.clientName || 'Mohammad Kamil Shaikh'}
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[24px] p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-[16px] bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#666666] text-[11px] uppercase tracking-[0.12em]">Project Location</div>
                  <div className="font-bold text-black truncate mt-0.5">
                    {project.location || 'Vadodara, Gujarat'}
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[24px] p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-[16px] bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#666666] text-[11px] uppercase tracking-[0.12em]">Contract Budget</div>
                  <div className="font-bold text-black truncate mt-0.5">
                    {project.budget || '₹15,00,000.00'}
                  </div>
                </div>
              </div>

              <div className="surface-card rounded-[24px] p-4 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-[16px] bg-[#dfe7f4] border border-[#b9c7de] flex items-center justify-center text-[#0d3479] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[#666666] text-[11px] uppercase tracking-[0.12em]">Total Documents</div>
                  <div className="font-bold text-[#0d3479] mt-0.5">
                    {documents.length} Dossier Item{documents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section Header & Filter Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0d3479]">
                  Dossier Management
                </p>
                <h2 className="text-[24px] font-bold text-black mt-1 leading-tight flex items-center space-x-2">
                  <span>Project Documents</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#dfe7f4] text-[#0d3479] text-xs font-semibold border border-[#b9c7de]">
                    {filteredDocs.length}
                  </span>
                </h2>
              </div>

              {/* View Mode & Search */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8b9dbc] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in project..."
                    className="brand-input pl-9 pr-3 py-2 text-xs w-44 md:w-56"
                  />
                </div>

                <div className="surface-card rounded-[20px] p-1 flex items-center shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-[12px] text-sm font-medium flex items-center space-x-1 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#0d3479] text-white shadow'
                        : 'text-[#666666] hover:text-black'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 rounded-[12px] text-sm font-medium flex items-center space-x-1 transition-colors ${
                      viewMode === 'table'
                        ? 'bg-[#0d3479] text-white shadow'
                        : 'text-[#666666] hover:text-black'
                    }`}
                    title="Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3.5 py-1.5 rounded-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-[#0d3479] text-white shadow'
                    : 'surface-card text-[#666666] hover:text-black border border-[#cccccc]'
                }`}
              >
                All Documents ({documents.length})
              </button>
              <button
                onClick={() => setTypeFilter('quotation')}
                className={`px-3.5 py-1.5 rounded-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  typeFilter === 'quotation'
                    ? 'bg-[#0d3479] text-white shadow'
                    : 'surface-card text-[#666666] hover:text-black border border-[#cccccc]'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Quotations ({docCountByType.quotation})</span>
              </button>
              <button
                onClick={() => setTypeFilter('work_order')}
                className={`px-3.5 py-1.5 rounded-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  typeFilter === 'work_order'
                    ? 'bg-[#0d3479] text-white shadow'
                    : 'surface-card text-[#666666] hover:text-black border border-[#cccccc]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Labour POs ({docCountByType.work_order})</span>
              </button>
              <button
                onClick={() => setTypeFilter('invoice')}
                className={`px-3.5 py-1.5 rounded-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                  typeFilter === 'invoice'
                    ? 'bg-[#0d3479] text-white shadow'
                    : 'surface-card text-[#666666] hover:text-black border border-[#cccccc]'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Tax Invoices ({docCountByType.invoice})</span>
              </button>
              {docCountByType.custom > 0 && (
                <button
                  onClick={() => setTypeFilter('custom')}
                  className={`px-3.5 py-1.5 rounded-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                    typeFilter === 'custom'
                      ? 'bg-[#0d3479] text-white shadow'
                      : 'surface-card text-[#666666] hover:text-black border border-[#cccccc]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Blank Docs ({docCountByType.custom})</span>
                </button>
              )}
            </div>
          </div>

          {/* Documents Grid / Table View */}
          {filteredDocs.length === 0 ? (
            <div className="glass-card rounded-[32px] p-12 text-center">
              <div className="w-14 h-14 rounded-[20px] bg-[#dfe7f4] flex items-center justify-center text-[#0d3479] mx-auto mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-black">No documents found</h3>
              <p className="text-sm text-[#666666] max-w-md mx-auto mt-2 mb-4">
                {searchQuery
                  ? 'Try adjusting your search query or filter criteria.'
                  : 'Get started by creating a commercial quotation, labour work order, or tax invoice for this project.'}
              </p>
              <button
                onClick={() => setIsCreateDocModalOpen(true)}
                className="brand-button px-5 py-3 text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Document</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc) => {
                const statusInfo = getStatusBadge(doc.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={doc.id}
                    className="glass-card hover:bg-white/85 border border-[#cccccc] rounded-[32px] p-5 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  >
                    <div>
                      {/* Top Row: Type Tag & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border flex items-center space-x-1.5 ${getDocTypeBadgeColor(
                            doc.docType
                          )}`}
                        >
                          {getDocTypeIcon(doc.docType)}
                          <span>{doc.docType.replace('_', ' ')}</span>
                        </div>

                        {/* Status Dropdown Trigger */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStatusMenuDocId(
                                activeStatusMenuDocId === doc.id ? null : doc.id
                              );
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center space-x-1 transition-colors cursor-pointer ${statusInfo.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusInfo.label}</span>
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>

                          {/* Status change dropdown */}
                          {activeStatusMenuDocId === doc.id && (
                            <div
                              className="absolute right-0 mt-1 w-36 bg-white border border-[#cccccc] rounded-[16px] shadow-xl py-1.5 z-30 text-[11px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(
                                [
                                  'draft',
                                  'under_review',
                                  'approved',
                                  'sent',
                                  'signed',
                                  'paid',
                                ] as ProjectDocStatus[]
                              ).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    onUpdateDocumentStatus(doc.id, st);
                                    setActiveStatusMenuDocId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-[#dfe7f4]/40 text-black capitalize flex items-center justify-between font-medium"
                                >
                                  <span>{st.replace('_', ' ')}</span>
                                  {doc.status === st && (
                                    <Check className="w-3.5 h-3.5 text-[#0d3479]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Document Title & Reference Number */}
                      <h3
                        onClick={() => onOpenDocument(doc.id)}
                        className="font-bold text-black text-base group-hover:text-[#0d3479] transition-colors line-clamp-2 cursor-pointer"
                      >
                        {doc.title}
                      </h3>
                      <div className="mt-2 flex items-center space-x-2 text-[11px] font-mono text-[#666666]">
                        <span className="bg-[#dfe7f4]/40 px-2 py-0.5 rounded-[8px] border border-[#b9c7de]/50 font-bold">
                          {doc.docNumber}
                        </span>
                      </div>

                      {/* Valuation / Amount */}
                      {doc.amount && doc.amount !== 'N/A' && (
                        <div className="mt-3 p-3 rounded-[16px] bg-white/60 border border-[#cccccc] flex items-center justify-between">
                          <span className="text-[11px] text-[#666666] uppercase tracking-wider font-semibold">Value:</span>
                          <span className="font-bold text-[#0d3479] text-sm">
                            {doc.amount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-[#cccccc] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#666666]">
                        {doc.lastModified}
                      </span>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onDuplicateDocument(doc.id)}
                          className="p-2 text-[#666666] hover:text-black hover:bg-white rounded-[10px] transition-colors cursor-pointer border border-transparent hover:border-[#cccccc]"
                          title="Duplicate Document"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-2 text-[#666666] hover:text-red-600 hover:bg-white rounded-[10px] transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDocument(doc.id)}
                          className="brand-button active:scale-95 px-3.5 py-1.5 text-white rounded-[10px] text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ml-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="surface-card rounded-[24px] overflow-hidden border border-[#cccccc] text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#cccccc] bg-white/40 text-[#666666] uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-3.5 px-4">Document Title & Ref</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Modified</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cccccc] text-black">
                    {filteredDocs.map((doc) => {
                      const statusInfo = getStatusBadge(doc.status);
                      return (
                        <tr
                          key={doc.id}
                          onClick={() => onOpenDocument(doc.id)}
                          className="hover:bg-[#dfe7f4]/30 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-black group-hover:text-[#0d3479] transition-colors">
                              {doc.title}
                            </div>
                            <div className="text-[11px] font-mono text-[#666666] mt-0.5">
                              {doc.docNumber}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center space-x-1 ${getDocTypeBadgeColor(
                                doc.docType
                              )}`}
                            >
                              {getDocTypeIcon(doc.docType)}
                              <span className="capitalize">{doc.docType.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#0d3479]">
                            {doc.amount || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-flex items-center space-x-1 ${statusInfo.color}`}
                            >
                              <span>{statusInfo.label}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#666666] text-[11px]">
                            {doc.lastModified}
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => onDuplicateDocument(doc.id)}
                                className="p-2 text-[#666666] hover:text-black hover:bg-white rounded-[10px] transition-colors cursor-pointer border border-transparent hover:border-[#cccccc]"
                                title="Duplicate"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteDocument(doc.id)}
                                className="p-2 text-[#666666] hover:text-red-600 hover:bg-white rounded-[10px] transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenDocument(doc.id)}
                                className="brand-button active:scale-95 px-3 py-1.5 text-white rounded-[10px] text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create Document Modal */}
        <CreateDocumentModal
          isOpen={isCreateDocModalOpen}
          onClose={() => setIsCreateDocModalOpen(false)}
          project={project}
          onCreateDocument={onCreateDocument}
        />
      </div>
    </div>
  );
};
