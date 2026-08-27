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
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'budget' | 'docs'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const getTagLabel = (t: string | { label: string; color: string }) => typeof t === 'string' ? t : t.label;

  const parseProjTime = (p: ProjectItem) => {
    const m = p.id.match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };

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
          cmp = parseProjTime(a) - parseProjTime(b);
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
    <div className="app-shell flex h-screen max-h-screen w-full text-black font-sans overflow-hidden select-none bg-gray-50">
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
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
              className="brand-button active:scale-95 text-white font-bold px-5 py-3 rounded-[12px] text-sm flex items-center space-x-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto shadow"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                className="brand-button px-4 py-3 text-sm font-semibold inline-flex items-center space-x-2 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            /* Table / List View */
            <div className="glass-card rounded-[32px] overflow-hidden text-xs border border-[#cccccc] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#cccccc] bg-white/50 text-[#666666] uppercase text-[10px] tracking-wider font-semibold">
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
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Documents</th>
                      <th className="py-3 px-4">Budget</th>
                      <th className="py-3 px-4">Last Modified</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cccccc] font-medium text-black">
                    {filteredProjects.map((project) => {
                      const isSelected = selectedProjectIds.includes(project.id);
                      const docs = project.documents || [];
                      return (
                        <tr
                          key={project.id}
                          onClick={() => onOpenProjectDetail(project.id)}
                          className={`hover:bg-white/60 transition-colors cursor-pointer group ${
                            isSelected ? 'bg-white/70' : ''
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
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-black group-hover:text-[#0d3479] transition-colors">
                                {project.title}
                              </span>
                              {(project.isArchived || project.status === 'archived') && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                  Archived
                                </span>
                              )}
                            </div>
                            {project.code && (
                              <span className="text-[10px] font-mono text-[#666666] bg-white/80 px-1.5 py-0.5 rounded border border-[#cccccc] mt-1 inline-block">
                                {project.code}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-black">{project.clientName || 'Contractor'}</div>
                            <div className="text-[11px] text-[#666666] flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#8b9dbc] shrink-0" />
                              <span>{project.location || 'Site Location'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de]">
                              {project.category || 'Civil & PEB'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#dfe7f4] text-[#0d3479] border border-[#b9c7de] inline-flex items-center space-x-1">
                              <Layers className="w-3 h-3" />
                              <span>{docs.length} Doc{docs.length !== 1 ? 's' : ''}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#0d3479]">
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
                                  className="p-2 text-[#666666] hover:text-black hover:bg-white rounded-[10px] transition-colors cursor-pointer"
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
                                className="p-2 text-[#666666] hover:text-black hover:bg-white rounded-[10px] transition-colors cursor-pointer"
                                title="Duplicate Project"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteProject(project.id)}
                                className="p-2 text-[#666666] hover:text-[#8a3b2f] hover:bg-[#fff3f0] rounded-[10px] transition-colors cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onOpenProjectDetail(project.id)}
                                className="brand-button active:scale-95 px-3 py-1.5 rounded-[10px] text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer ml-1 shadow"
                              >
                                <span>Open</span>
                                <ChevronRight className="w-3.5 h-3.5" />
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
