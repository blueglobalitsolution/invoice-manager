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
  BookOpen,
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
} from 'lucide-react';
import { ProjectItem, ProjectDocType } from '@/types/project';
import { LatexDocument } from '@/types/document';
import { TemplateManagerDrawer } from '@/components/TemplateManagerDrawer';
import { CreateProjectModal } from '@/components/CreateProjectModal';

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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'your' | 'shared' | 'archived'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'archived' && !p.isArchived) return false;
    if (activeTab === 'all' && p.isArchived) return false;
    if (activeTab === 'shared') return false;
    if (activeTab === 'your' && p.isArchived) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.clientName && p.clientName.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q)) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
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

  // Metrics
  const totalProjectsCount = projects.length;
  const totalDocsCount = projects.reduce((acc, p) => acc + (p.documents?.length || 1), 0);

  return (
    <div className="flex h-screen w-full bg-[#0a0f18] text-gray-200 font-sans overflow-hidden select-none">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#101826] border-r border-gray-800/80 flex flex-col justify-between shrink-0 p-4 shadow-xl">
        <div className="space-y-6">
          {/* Overleaf / Enterprise Brand Logo Header */}
          <div className="flex items-center space-x-2.5 px-2">
            <div className="w-8 h-8 rounded-lg bg-[#15803d] flex items-center justify-center font-serif text-white font-bold text-2xl shadow-md">
              6
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight leading-none flex items-center">
                <span>GLOBAL</span>
                <span className="text-emerald-400 font-normal ml-1">DOCS</span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">
                Enterprise Project & Document Hub
              </div>
            </div>
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#15803d] text-white shadow-sm'
                  : 'text-gray-300 hover:bg-[#1a2538]'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>All Projects</span>
              <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 text-emerald-200">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('your')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'your'
                  ? 'bg-[#15803d] text-white font-semibold'
                  : 'text-gray-300 hover:bg-[#1a2538]'
              }`}
            >
              <span className="w-4"></span>
              <span>Active Projects</span>
            </button>

            <button
              onClick={() => setActiveTab('archived')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                activeTab === 'archived'
                  ? 'bg-[#15803d] text-white font-semibold'
                  : 'text-gray-300 hover:bg-[#1a2538]'
              }`}
            >
              <span className="w-4"></span>
              <span>Archived Projects</span>
            </button>

            <div className="pt-2 border-t border-gray-800/80 my-2 space-y-1">
              <button
                onClick={() => setIsTemplateManagerOpen(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs text-gray-300 hover:bg-[#1a2538] hover:text-white transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Template Library</span>
              </button>

              {onOpenTemplateBuilder && (
                <button
                  onClick={onOpenTemplateBuilder}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors font-medium border border-emerald-800/40 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Template Builder</span>
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-gray-800/80 space-y-1 text-xs relative">
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-gray-200 hover:text-white rounded-lg hover:bg-[#1a2538] transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-semibold">{currentUser.name}</span>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              </button>

              {isAccountMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-[#16202f] border border-gray-700 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-700/60">
                    <p className="font-semibold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-950/50 text-red-300 flex items-center space-x-2 transition-colors text-xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 space-y-1">
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full flex items-center space-x-2 px-2 py-1.5 text-gray-300 hover:text-white hover:bg-[#1a2538] rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full flex items-center space-x-2 px-2 py-1.5 bg-[#15803d] hover:bg-[#16a34a] text-white rounded-lg font-medium transition-colors shadow cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a0f18] relative">
        {/* Inner Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
          {/* Top Header & New Project CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Projects & Document Dossiers
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Create a project to organize all related quotations, purchase orders, invoices, and specs in one workspace.
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="bg-[#15803d] hover:bg-[#16a34a] active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Quick Portfolio Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-[#111c2e] border border-gray-800/80 rounded-xl shadow">
              <span className="text-gray-400 text-[11px] block">Total Projects</span>
              <span className="text-lg font-bold text-white mt-0.5 block">
                {totalProjectsCount} Active
              </span>
            </div>
            <div className="p-3.5 bg-[#111c2e] border border-gray-800/80 rounded-xl shadow">
              <span className="text-gray-400 text-[11px] block">Managed Documents</span>
              <span className="text-lg font-bold text-emerald-400 mt-0.5 block">
                {totalDocsCount} Documents
              </span>
            </div>
            <div className="p-3.5 bg-[#111c2e] border border-gray-800/80 rounded-xl shadow">
              <span className="text-gray-400 text-[11px] block">Document Formats</span>
              <span className="text-lg font-bold text-blue-400 mt-0.5 block">
                Quotes • POs • Invoices
              </span>
            </div>
            <div className="p-3.5 bg-[#111c2e] border border-gray-800/80 rounded-xl shadow">
              <span className="text-gray-400 text-[11px] block">Export Ready</span>
              <span className="text-lg font-bold text-amber-400 mt-0.5 block">
                LaTeX & PDF A4
              </span>
            </div>
          </div>

          {/* Search & View Mode Switcher */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by name, client, location, or code..."
                className="w-full bg-[#111c2e] border border-gray-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="bg-[#111c2e] border border-gray-700/80 rounded-xl p-0.5 flex items-center shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-gray-700 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Grid Card View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-gray-700 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">List</span>
              </button>
            </div>
          </div>

          {/* Projects View */}
          {filteredProjects.length === 0 ? (
            <div className="bg-[#111c2e] border border-gray-800 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-500 mx-auto mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No projects found</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-4">
                {searchQuery
                  ? 'No projects match your search keywords.'
                  : 'Get started by creating your first project workspace.'}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-950/40 inline-flex items-center space-x-2 cursor-pointer"
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
                    className="bg-[#111c2e] hover:bg-[#142238] border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-all"></div>

                    <div>
                      {/* Category & Status */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600/40">
                          {project.category || 'Civil & PEB'}
                        </span>
                        {project.code && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-300 bg-gray-800/80 border border-gray-700">
                            {project.code}
                          </span>
                        )}
                      </div>

                      {/* Project Title */}
                      <h3 className="text-sm md:text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                        {project.title}
                      </h3>

                      {/* Client & Location */}
                      <div className="mt-3 space-y-1.5 text-xs text-gray-400">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-200">
                            {project.clientName || 'Mohammad Kamil Shaikh'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate text-gray-300">
                            {project.location || 'Vadodara, Gujarat'}
                          </span>
                        </div>
                      </div>

                      {/* Documents Badge Strip */}
                      <div className="mt-4 pt-3 border-t border-gray-800/80">
                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <span className="font-semibold text-gray-300 flex items-center space-x-1">
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Related Documents ({docCount})</span>
                          </span>
                          {project.budget && (
                            <span className="font-bold text-amber-400 text-xs">
                              {project.budget}
                            </span>
                          )}
                        </div>

                        {/* Document type chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {docs.length > 0 ? (
                            docs.slice(0, 3).map((d) => (
                              <span
                                key={d.id}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-[#16202f] border border-gray-700 text-gray-300 font-medium truncate max-w-[140px]"
                              >
                                {d.docType === 'quotation' && '📄 Quote'}
                                {d.docType === 'work_order' && '📋 PO / Work Order'}
                                {d.docType === 'purchase_order' && '📦 Material PO'}
                                {d.docType === 'invoice' && '🧾 Tax Invoice'}
                                {d.docType === 'technical_specs' && '📑 Specs'}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-gray-500">1 Document inside</span>
                          )}
                          {docs.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">
                              +{docs.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-500">{project.lastModified}</span>

                      <div
                        className="flex items-center space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onDuplicateProject(project.id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate Project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProject(project.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenProjectDetail(project.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow transition-all cursor-pointer ml-1"
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
            <div className="border border-gray-800 rounded-2xl overflow-hidden bg-[#111c2e] shadow-xl text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#0d1624] text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredProjects.length > 0 &&
                          selectedProjectIds.length === filteredProjects.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded accent-[#15803d] cursor-pointer"
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
                <tbody className="divide-y divide-gray-800/60 font-medium">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedProjectIds.includes(project.id);
                    const docs = project.documents || [];
                    return (
                      <tr
                        key={project.id}
                        onClick={() => onOpenProjectDetail(project.id)}
                        className={`hover:bg-[#15233a] transition-colors cursor-pointer group ${
                          isSelected ? 'bg-[#15233a]/90' : ''
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
                            className="rounded accent-[#15803d] cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {project.title}
                          </div>
                          {project.code && (
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 mt-0.5 inline-block">
                              {project.code}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          <div>{project.clientName || 'Contractor'}</div>
                          <div className="text-[11px] text-gray-400">{project.location || 'Site'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-600/40 inline-flex items-center space-x-1">
                            <Layers className="w-3 h-3" />
                            <span>{docs.length} Documents</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-amber-400">
                          {project.budget || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                          {project.lastModified}
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => onDuplicateProject(project.id)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              title="Duplicate"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProject(project.id)}
                              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenProjectDetail(project.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
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

      {/* Template Manager Drawer */}
      <TemplateManagerDrawer
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        currentDocument={currentDocument}
        onLoadTemplate={onLoadTemplate}
        onCreateProjectFromTemplate={onCreateProjectFromTemplate}
      />
    </div>
  );
};
