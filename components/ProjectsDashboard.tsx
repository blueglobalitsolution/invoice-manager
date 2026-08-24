'use client';

import React, { useState } from 'react';
import {
  Folder,
  Search,
  Plus,
  Trash2,
  Copy,
  User,
  ExternalLink,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Grid,
  List,
  FileSpreadsheet,
  FileCheck,
  Package,
  Receipt,
  Layers,
  FolderOpen,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  Archive,
  ArchiveRestore,
  Star,
  ArrowUpDown,
} from 'lucide-react';
import { ProjectItem, ProjectDocType } from '@/types/project';
import { LatexDocument } from '@/types/document';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { DashboardSidebar } from '@/components/DashboardSidebar';

interface ProjectsDashboardProps {
  projects: ProjectItem[];
  onSelectProject: (projectId: string) => void;
  onOpenProjectDetail: (projectId: string) => void;
  onCreateProject: (projectData: {
    title: string;
    code: string;
    clientName: string;
    location: string;
    category: string;
    budget: string;
    initialDocTypes: ProjectDocType[];
  }) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  currentDocument: LatexDocument;
  onLoadTemplate: (templateDoc: LatexDocument) => void;
  onCreateProjectFromTemplate: (templateDoc: LatexDocument, projectName: string) => void;
  currentUser: { name: string; email: string } | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenTemplateBuilder?: () => void;
  onArchiveProject?: (projectId: string, isArchived: boolean) => void;
  onToggleFavourite?: (projectId: string) => void;
}

export const ProjectsDashboard: React.FC<ProjectsDashboardProps> = ({
  projects,
  onSelectProject,
  onOpenProjectDetail,
  onCreateProject,
  onDeleteProject,
  onDuplicateProject,
  currentDocument,
  onLoadTemplate,
  onCreateProjectFromTemplate,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenTemplateBuilder,
  onArchiveProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'your' | 'shared' | 'archived' | 'starred'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget' | 'docs'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const getTagLabel = (t: string | { label: string; color: string }) => typeof t === 'string' ? t : t.label;

  const filteredProjects = projects
    .filter((p) => {
      const isArchived = Boolean(p.isArchived || p.status === 'archived');
      if (activeTab === 'archived') {
        if (!isArchived) return false;
      } else if (activeTab === 'starred') {
        if (!p.isFavourite || isArchived) return false;
      } else {
        if (isArchived) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.clientName && p.clientName.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        p.tags.some((t) => getTagLabel(t).toLowerCase().includes(q)) ||
        (p.documents || []).some((d) =>
          d.title.toLowerCase().includes(q) ||
          (d.docNumber && d.docNumber.toLowerCase().includes(q)) ||
          d.docType.toLowerCase().includes(q)
        )
      );
    })
    .sort((a, b) => {
      // Starred projects always on top (except in archived tab)
      if (activeTab !== 'archived' && activeTab !== 'starred') {
        if (a.isFavourite && !b.isFavourite) return -1;
        if (!a.isFavourite && b.isFavourite) return 1;
      }
      
      let cmp = 0;
      switch (sortBy) {
        case 'name':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'budget': {
          const parseNum = (s?: string) => parseFloat((s || '0').replace(/[^0-9.]/g, '')) || 0;
          cmp = parseNum(a.budget) - parseNum(b.budget);
          break;
        }
        case 'docs':
          cmp = (a.documents?.length || 0) - (b.documents?.length || 0);
          break;
        case 'date':
        default:
          cmp = 0; // keep API order (already sorted by lastModified DESC)
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  const handleToggleSelectAll = () => {
    if (selectedProjectIds.length === filteredProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(filteredProjects.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleToggleFavourite = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const nextFav = !project.isFavourite;
    // Optimistic update via parent callback
    if (onArchiveProject) {
      // We don't use onArchiveProject for this — we need a separate handler
    }
    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavourite: nextFav }),
    }).catch(console.error);
  };

  // Metrics
  const activeProjects = projects.filter((p) => !(p.isArchived || p.status === 'archived'));
  const totalProjectsCount = activeProjects.length;
  const totalDocsCount = activeProjects.reduce((acc, p) => acc + (p.documents?.length || 1), 0);

  return (
    <div className="app-shell flex min-h-screen w-full text-black font-sans overflow-hidden select-none bg-gray-50">
      {/* Left Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projectsCount={projects.length}
        onOpenTemplateBuilder={onOpenTemplateBuilder}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />

      {/* Main Content Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#0d3479]">
                Projects
              </p>
              <h1 className="mt-3 text-[40px] leading-[1]">
                Projects & Document Dossiers
              </h1>
              <p className="text-sm text-[#666666] mt-3 max-w-2xl">
                Create a project to organize all related quotations, purchase orders, invoices, and specs in one workspace.
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="brand-button active:scale-95 text-white font-bold px-5 py-3 rounded-[12px] text-sm flex items-center space-x-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="surface-card rounded-[24px] p-4">
              <span className="text-[#666666] text-[11px] block uppercase tracking-[0.16em]">Total Projects</span>
              <span className="text-lg font-bold mt-1 block">
                {totalProjectsCount} Active
              </span>
            </div>
            <div className="surface-card rounded-[24px] p-4">
              <span className="text-[#666666] text-[11px] block uppercase tracking-[0.16em]">Managed Documents</span>
              <span className="text-lg font-bold text-[#0d3479] mt-1 block">
                {totalDocsCount} Documents
              </span>
            </div>
            <div className="surface-card rounded-[24px] p-4">
              <span className="text-[#666666] text-[11px] block uppercase tracking-[0.16em]">Document Formats</span>
              <span className="text-lg font-bold mt-1 block">
                Quotes • POs • Invoices
              </span>
            </div>
            <div className="surface-card rounded-[24px] p-4">
              <span className="text-[#666666] text-[11px] block uppercase tracking-[0.16em]">Export Ready</span>
              <span className="text-lg font-bold mt-1 block">
                LaTeX & PDF A4
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[#8b9dbc] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, client, location, or code..."
                className="brand-input w-full pl-10 pr-4 py-3 text-sm transition-colors"
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
                title="Grid Card View"
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
                title="Table List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">List</span>
              </button>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="glass-card rounded-[32px] p-12 text-center">
              <div className="w-14 h-14 rounded-[20px] bg-[#dfe7f4] flex items-center justify-center text-[#0d3479] mx-auto mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold">No projects found</h3>
              <p className="text-sm text-[#666666] max-w-md mx-auto mt-2 mb-4">
                {searchQuery
                  ? 'No projects match your search keywords.'
                  : 'Get started by creating your first project workspace.'}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="brand-button px-4 py-3 text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Rich Project Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const docs = project.documents || [];
                const docCount = docs.length;

                return (
                  <div
                    key={project.id}
                    onClick={() => onOpenProjectDetail(project.id)}
                    className="glass-card hover:bg-white/75 border border-[#cccccc] rounded-[32px] p-5 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b9dbc]/15 rounded-full blur-xl pointer-events-none group-hover:bg-[#8b9dbc]/25 transition-all"></div>

                    <div>
                      {/* Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de]">
                            {project.category || 'Civil & PEB'}
                          </span>
                          {(project.isArchived || project.status === 'archived') && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Archived
                            </span>
                          )}
                        </div>
                        {project.code && (
                          <span className="px-2 py-1 rounded text-[10px] font-mono text-[#666666] bg-white/70 border border-[#cccccc]">
                            {project.code}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm md:text-base font-bold group-hover:text-[#0d3479] transition-colors line-clamp-2 leading-snug">
                        {project.title}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-[#666666]">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-[#8b9dbc] shrink-0" />
                          <span className="truncate text-black">
                            {project.clientName || 'Mohammad Kamil Shaikh'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-[#8b9dbc] shrink-0" />
                          <span className="truncate">
                            {project.location || 'Vadodara, Gujarat'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#cccccc]">
                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <span className="font-semibold text-[#666666] flex items-center space-x-1">
                            <Layers className="w-3.5 h-3.5 text-[#0d3479]" />
                            <span>Related Documents ({docCount})</span>
                          </span>
                          {project.budget && (
                            <span className="font-bold text-xs">
                              {project.budget}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {docs.length > 0 ? (
                            docs.slice(0, 3).map((d) => (
                              <span
                                key={d.id}
                                className="px-2 py-1 rounded-[12px] text-[10px] bg-white/75 border border-[#cccccc] text-[#666666] font-medium truncate max-w-[140px]"
                              >
                                {d.docType === 'quotation' && '📄 Quote'}
                                {d.docType === 'work_order' && '📋 PO / Work Order'}
                                {d.docType === 'purchase_order' && '📦 Material PO'}
                                {d.docType === 'invoice' && '🧾 Tax Invoice'}
                                {d.docType === 'technical_specs' && '📑 Specs'}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[#666666]">1 Document inside</span>
                          )}
                          {docs.length > 3 && (
                            <span className="px-1.5 py-1 rounded text-[10px] bg-[#dfe7f4] text-[#0d3479]">
                              +{docs.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#cccccc] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#666666]">{project.lastModified}</span>

                      <div
                        className="flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onArchiveProject && (
                          <button
                            onClick={() => onArchiveProject(project.id, Boolean(project.isArchived || project.status === 'archived'))}
                            className="p-2 text-[#666666] hover:text-black hover:bg-white rounded-[12px] transition-colors cursor-pointer"
                            title={project.isArchived || project.status === 'archived' ? 'Unarchive Project' : 'Archive Project'}
                          >
                            {project.isArchived || project.status === 'archived' ? (
                              <ArchiveRestore className="w-3.5 h-3.5 text-amber-600" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => onDuplicateProject(project.id)}
                          className="p-2 text-[#666666] hover:text-black hover:bg-white rounded-[12px] transition-colors cursor-pointer"
                          title="Duplicate Project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-2 text-[#666666] hover:text-[#8a3b2f] hover:bg-[#fff3f0] rounded-[12px] transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenProjectDetail(project.id)}
                          className="brand-button px-3 py-2 rounded-[12px] text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ml-1"
                        >
                          <span>Open Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="glass-card rounded-[32px] overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#cccccc] bg-white/40 text-[#666666] uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredProjects.length > 0 &&
                          selectedProjectIds.length === filteredProjects.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded accent-[#0d3479] cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Project Name & Code</th>
                    <th className="py-3 px-4">Client & Location</th>
                    <th className="py-3 px-4">Documents</th>
                    <th className="py-3 px-4">Budget</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cccccc] font-medium">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedProjectIds.includes(project.id);
                    const docs = project.documents || [];
                    return (
                      <tr
                        key={project.id}
                        onClick={() => onOpenProjectDetail(project.id)}
                        className={`hover:bg-white/55 transition-colors cursor-pointer group ${
                          isSelected ? 'bg-white/65' : ''
                        }`}
                      >
                        <td
                          className="py-3.5 px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectOne(project.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(project.id)}
                            className="rounded accent-[#0d3479] cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold group-hover:text-[#0d3479] transition-colors">
                            {project.title}
                          </div>
                          {project.code && (
                            <span className="text-[10px] font-mono text-[#666666] bg-white/75 px-1.5 py-0.5 rounded border border-[#cccccc] mt-0.5 inline-block">
                              {project.code}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div>{project.clientName || 'Contractor'}</div>
                          <div className="text-[11px] text-[#666666]">{project.location || 'Site'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de] inline-flex items-center space-x-1">
                            <Layers className="w-3 h-3" />
                            <span>{docs.length} Documents</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          {project.budget || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-[#666666] text-[11px]">
                          {project.lastModified}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            {onArchiveProject && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onArchiveProject(project.id, Boolean(project.isArchived || project.status === 'archived'));
                                }}
                                className="p-1.5 text-[#666666] hover:text-black hover:bg-white rounded-[12px] transition-colors cursor-pointer"
                                title={project.isArchived || project.status === 'archived' ? 'Unarchive' : 'Archive'}
                              >
                                {project.isArchived || project.status === 'archived' ? (
                                  <ArchiveRestore className="w-3.5 h-3.5 text-amber-600" />
                                ) : (
                                  <Archive className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => onDuplicateProject(project.id)}
                              className="p-1.5 text-[#666666] hover:text-black hover:bg-white rounded-[12px] transition-colors cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(project.id)}
                              className="p-1.5 text-[#666666] hover:text-[#8a3b2f] hover:bg-[#fff3f0] rounded-[12px] transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenProjectDetail(project.id)}
                              className="brand-button px-2.5 py-2 rounded-[12px] text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                            >
                              <span>Open</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal Dialog */}
      <CreateProjectModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={onCreateProject}
      />


    </div>
  );
};
