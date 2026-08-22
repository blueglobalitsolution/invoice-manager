'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  FileSpreadsheet,
  FileCheck,
  Package,
  Receipt,
  Layers,
  FileText,
  FilePlus,
  Trash2,
  Copy,
  ExternalLink,
  Printer,
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
  Filter,
  Grid,
  List,
  ChevronDown,
  Sparkles,
  ShieldAlert,
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
  currentUser,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ProjectDocType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectDocStatus>('all');
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
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
        return <FileSpreadsheet className="w-4 h-4 text-blue-400" />;
      case 'work_order':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      case 'purchase_order':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-rose-400" />;
      case 'technical_specs':
        return <Layers className="w-4 h-4 text-teal-400" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getDocTypeBadgeColor = (type: ProjectDocType) => {
    switch (type) {
      case 'quotation':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'work_order':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'purchase_order':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'invoice':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'technical_specs':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'contract':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/15 text-gray-600 border-gray-500/30';
    }
  };

  const getStatusBadge = (status: ProjectDocStatus) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', color: 'bg-emerald-950 text-emerald-300 border-emerald-600/40', icon: CheckCircle2 };
      case 'signed':
        return { label: 'Signed', color: 'bg-indigo-950 text-indigo-300 border-indigo-600/40', icon: PenTool };
      case 'sent':
        return { label: 'Sent', color: 'bg-blue-950 text-blue-300 border-blue-600/40', icon: Send };
      case 'paid':
        return { label: 'Paid', color: 'bg-teal-950 text-teal-300 border-teal-600/40', icon: Check };
      case 'under_review':
        return { label: 'Under Review', color: 'bg-amber-950 text-amber-300 border-amber-600/40', icon: Clock };
      case 'draft':
      default:
        return { label: 'Draft', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: Clock };
    }
  };

  const docCountByType = {
    quotation: documents.filter((d) => d.docType === 'quotation').length,
    work_order: documents.filter((d) => d.docType === 'work_order').length,
    purchase_order: documents.filter((d) => d.docType === 'purchase_order').length,
    invoice: documents.filter((d) => d.docType === 'invoice').length,
    technical_specs: documents.filter((d) => d.docType === 'technical_specs').length,
  };

  return (
    <div className="app-shell flex min-h-screen w-full bg-gray-50 text-gray-900 overflow-hidden select-none">
      <DashboardSidebar
        currentUser={currentUser || null}
        onOpenAuth={() => {}}
        onLogout={onLogout || (() => {})}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar Navigation (Simplified) */}
        <header className="h-14 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex lg:hidden items-center space-x-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Project /</span>
              <span className="text-sm font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
                {project.title}
              </span>
              {project.code && (
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[11px] border border-gray-200 hidden md:inline">
                  {project.code}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreateDocModalOpen(true)}
              className="brand-button active:scale-95 px-3.5 py-1.5 text-white rounded-md font-medium text-sm flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Project Header Banner & Overview */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 via-blue-500/5 to-transparent pointer-events-none rounded-full blur-2xl"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-200">
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                  {project.category || 'Civil & PEB Construction'}
                </span>
                {project.code && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-600 bg-gray-100 border border-gray-200">
                    {project.code}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-600/40 capitalize">
                  {project.status || 'Active'}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 mt-2 tracking-tight">
                {project.title}
              </h1>
            </div>

          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-emerald-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 text-[11px]">Client / Contractor</div>
                <div className="font-semibold text-gray-900 truncate">
                  {project.clientName || 'Mohammad Kamil Shaikh'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-blue-400 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 text-[11px]">Project Location</div>
                <div className="font-semibold text-gray-900 truncate">
                  {project.location || 'Vadodara, Gujarat'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-amber-400 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 text-[11px]">Contract Budget</div>
                <div className="font-semibold text-amber-300 truncate">
                  {project.budget || '₹35,00,000.00'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-teal-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-gray-500 text-[11px]">Total Documents</div>
                <div className="font-semibold text-gray-900">
                  {documents.length} Related Document{documents.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section Header & Filter Tabs */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <span>Project Documents & Dossier</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-emerald-400 text-xs font-semibold border border-gray-200">
                  {filteredDocs.length}
                </span>
              </h2>
              <p className="text-xs text-gray-500">
                All quotes, purchase orders, invoices, and specs linked to this project
              </p>
            </div>

            {/* View Mode & Search */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in project..."
                  className="bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-44 md:w-56"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-0.5 flex items-center">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid'
                      ? 'bg-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded ${
                    viewMode === 'table'
                      ? 'bg-gray-200 text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
            >
              All Documents ({documents.length})
            </button>
            <button
              onClick={() => setTypeFilter('quotation')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                typeFilter === 'quotation'
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-3 h-3 text-blue-400" />
              <span>Quotations ({docCountByType.quotation})</span>
            </button>
            <button
              onClick={() => setTypeFilter('work_order')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                typeFilter === 'work_order'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
            >
              <FileCheck className="w-3 h-3 text-emerald-400" />
              <span>Labour POs ({docCountByType.work_order})</span>
            </button>
            <button
              onClick={() => setTypeFilter('purchase_order')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                typeFilter === 'purchase_order'
                  ? 'bg-amber-500 text-white shadow'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
            >
              <Package className="w-3 h-3 text-amber-400" />
              <span>Material POs ({docCountByType.purchase_order})</span>
            </button>
            <button
              onClick={() => setTypeFilter('invoice')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                typeFilter === 'invoice'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
            >
              <Receipt className="w-3 h-3 text-rose-400" />
              <span>Invoices & RA Bills ({docCountByType.invoice})</span>
            </button>
            <button
              onClick={() => setTypeFilter('technical_specs')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                typeFilter === 'technical_specs'
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-200'
              }`}
            >
              <Layers className="w-3 h-3 text-teal-400" />
              <span>Technical Specs ({docCountByType.technical_specs})</span>
            </button>
          </div>
        </div>

        {/* Documents Grid / Table View */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 mx-auto mb-3">
              <FilePlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No documents found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
              {searchQuery
                ? 'Try adjusting your search query or filter criteria.'
                : 'Get started by creating a commercial quotation, labour work order, or tax invoice for this project.'}
            </p>
            <button
              onClick={() => setIsCreateDocModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Document</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const statusInfo = getStatusBadge(doc.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div
                  key={doc.id}
                  className="bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-500/40 rounded-2xl p-5 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Type Tag & Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border flex items-center space-x-1 ${getDocTypeBadgeColor(
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
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center space-x-1 transition-colors cursor-pointer ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                          <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                        </button>

                        {/* Status change dropdown */}
                        {activeStatusMenuDocId === doc.id && (
                          <div
                            className="absolute right-0 mt-1 w-36 bg-[#16202f] border border-gray-200 rounded-xl shadow-2xl py-1 z-30 text-[11px]"
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
                                className="w-full text-left px-3 py-1.5 hover:bg-gray-100 text-gray-700 capitalize flex items-center justify-between"
                              >
                                <span>{st.replace('_', ' ')}</span>
                                {doc.status === st && (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                      className="font-bold text-gray-900 text-sm group-hover:text-emerald-300 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {doc.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2 text-[11px] font-mono text-gray-500">
                      <span className="bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200/60">
                        {doc.docNumber}
                      </span>
                    </div>

                    {/* Valuation / Amount */}
                    {doc.amount && doc.amount !== 'N/A' && (
                      <div className="mt-3 p-2 rounded-xl bg-gray-900/60 border border-gray-200/60 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">Document Value:</span>
                        <span className="font-bold text-emerald-400 text-xs">
                          {doc.amount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-gray-500">
                      Updated {doc.lastModified}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onDuplicateDocument(doc.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Document"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenDocument(doc.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow transition-all cursor-pointer ml-1"
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
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4">Document Title & Ref</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-600">
                  {filteredDocs.map((doc) => {
                    const statusInfo = getStatusBadge(doc.status);
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => onOpenDocument(doc.id)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {doc.title}
                          </div>
                          <div className="text-[11px] font-mono text-gray-500">
                            {doc.docNumber}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border inline-flex items-center space-x-1 ${getDocTypeBadgeColor(
                              doc.docType
                            )}`}
                          >
                            {getDocTypeIcon(doc.docType)}
                            <span className="capitalize">{doc.docType.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          {doc.amount || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border inline-flex items-center space-x-1 ${statusInfo.color}`}
                          >
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {doc.lastModified}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => onDuplicateDocument(doc.id)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDocument(doc.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenDocument(doc.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
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
