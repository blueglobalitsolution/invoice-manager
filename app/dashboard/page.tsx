'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsDashboard } from '@/components/ProjectsDashboard';
import { ProjectItem } from '@/types/project';
import { LatexDocument } from '@/types/document';
import { LABOUR_PO_TEMPLATE } from '@/lib/templates';
import { createProjectDocument } from '@/lib/project-doc-templates';
import { Loader } from '@/components/ui/loader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/components/ui/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Authentication check
  useEffect(() => {
    const storedUser = localStorage.getItem('latex_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Fetch projects from DB
  useEffect(() => {
    if (!currentUser) return;

    fetch(`/api/projects?userId=${currentUser.email}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          // Prefetch top projects and editor routes for instant page-to-page navigation
          data.slice(0, 5).forEach((p: ProjectItem) => {
            router.prefetch(`/project/${p.id}`);
            router.prefetch(`/editor/${p.id}`);
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch projects error:', err);
        setLoading(false);
      });

    router.prefetch('/template-builder');
  }, [currentUser, router]);

  const handleCreateProject = ({
    title,
    code,
    clientName,
    clientAddress,
    clientGstNo,
    contactPerson,
    location,
    category,
    budget,
    initialDocTypes,
    globalVariables,
  }: {
    title: string;
    code: string;
    clientName: string;
    clientAddress?: string;
    clientGstNo?: string;
    contactPerson?: string;
    location: string;
    category: string;
    budget: string;
    initialDocTypes: any[];
    globalVariables?: Record<string, string>;
  }) => {
    if (!currentUser) return;

    const newProjId = `proj_${Date.now()}`;
    const initialDocuments = (initialDocTypes || []).map((docType) => {
      const docItem = createProjectDocument(docType as any, {
        title,
        clientName,
        clientAddress,
        clientGstNo,
        contactPerson,
        location,
        code,
      });
      if (globalVariables && docItem.document) {
        docItem.document.globalVariables = {
          ...(docItem.document.globalVariables || {}),
          ...globalVariables,
        };
      }
      return docItem;
    });

    const defaultDoc = initialDocuments[0]?.document || null;

    const newProj = {
      id: newProjId,
      userId: currentUser.email,
      title,
      code,
      clientName,
      clientAddress,
      clientGstNo,
      contactPerson,
      location,
      category,
      budget,
      status: 'active',
      owner: currentUser.name,
      lastModified: 'Just now',
      tags: [category, ...(initialDocTypes || [])],
      isArchived: false,
      documents: initialDocuments,
      document: defaultDoc,
    };

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create project');
        return res.json();
      })
      .then(() => {
        toast.success(`Project "${title}" created successfully.`);
        if (initialDocuments.length > 0) {
          router.push(`/editor/${newProjId}?docId=${initialDocuments[0].id}`);
        } else {
          router.push(`/project/${newProjId}`);
        }
      })
      .catch((err) => {
        console.error('Create project error:', err);
        toast.error('Failed to create project.');
      });
  };

  const handleDeleteProject = (projectId: string) => {
    const p = projects.find((x) => x.id === projectId);
    setConfirmState({
      isOpen: true,
      title: 'Delete Project Dossier',
      message: `Are you sure you want to permanently delete "${p?.title || 'this project'}"? All associated document files will be removed.`,
      confirmText: 'Delete Project',
      variant: 'danger',
      onConfirm: () => {
        fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        })
          .then((res) => res.json())
          .then(() => {
            setProjects((prev) => prev.filter((item) => item.id !== projectId));
            toast.success(`Project "${p?.title || ''}" deleted successfully.`);
          })
          .catch((err) => {
            console.error('Delete project error:', err);
            toast.error('Failed to delete project.');
          });
      },
    });
  };

  const handleDuplicateProject = (projectId: string) => {
    const orig = projects.find((p) => p.id === projectId);
    if (!orig || !currentUser) return;

    const newProjId = `proj_${Date.now()}`;
    const duplicatedDocs = (orig.documents || []).map((d, index) => ({
      ...d,
      id: `doc_${Date.now()}_${index}`,
      projectId: newProjId,
      lastModified: 'Just now',
    }));

    const duplicated = {
      ...orig,
      id: newProjId,
      title: `${orig.title} (Copy)`,
      code: `${orig.code}-COPY`,
      lastModified: 'Just now',
      isArchived: false,
      documents: duplicatedDocs,
      document: duplicatedDocs[0]?.document || orig.document || null,
    };

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(duplicated),
    })
      .then((res) => res.json())
      .then(() => {
        setProjects((prev) => [duplicated as any, ...prev]);
        toast.success(`Project "${orig.title}" duplicated successfully.`);
      })
      .catch((err) => {
        console.error('Duplicate project error:', err);
        toast.error('Failed to duplicate project.');
      });
  };

  const handleToggleArchiveProject = (projectId: string, currentIsArchived: boolean) => {
    const nextIsArchived = !currentIsArchived;
    const nextStatus = nextIsArchived ? 'archived' : 'active';
    const actionText = nextIsArchived ? 'archive' : 'unarchive';
    const p = projects.find((x) => x.id === projectId);

    setConfirmState({
      isOpen: true,
      title: nextIsArchived ? 'Archive Project' : 'Unarchive Project',
      message: `Are you sure you want to ${actionText} "${p?.title || 'this project'}"?`,
      confirmText: nextIsArchived ? 'Archive' : 'Unarchive',
      variant: 'info',
      onConfirm: () => {
        fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            isArchived: nextIsArchived,
            lastModified: 'Just now',
          }),
        })
          .then((res) => res.json())
          .then(() => {
            setProjects((prev) =>
              prev.map((item) =>
                item.id === projectId
                  ? { ...item, status: nextStatus, isArchived: nextIsArchived }
                  : item
              )
            );
            toast.success(`Project "${p?.title || ''}" ${nextIsArchived ? 'archived' : 'unarchived'} successfully.`);
          })
          .catch((err) => {
            console.error('Archive project error:', err);
            toast.error(`Failed to ${actionText} project.`);
          });
      },
    });
  };

  const handleCreateProjectFromTemplate = (templateDoc: LatexDocument, projectName: string, meta?: any) => {
    if (!currentUser) return;

    const newProjId = `proj_${Date.now()}`;
    
    // Replace template placeholders dynamically
    let templateStr = JSON.stringify(templateDoc);
    if (meta) {
      if (meta.clientName) {
        templateStr = templateStr.replace(/\{\{CONTRACTOR_NAME\}\}/g, meta.clientName);
        templateStr = templateStr.replace(/\{\{CLIENT_NAME\}\}/g, meta.clientName);
      }
      if (meta.location) {
        templateStr = templateStr.replace(/\{\{PROJECT_LOCATION\}\}/g, meta.location);
        templateStr = templateStr.replace(/\{\{LOCATION\}\}/g, meta.location);
      }
      templateStr = templateStr.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    }
    const processedTemplate: LatexDocument = JSON.parse(templateStr);

    const newProj = {
      id: newProjId,
      userId: currentUser.email,
      title: projectName,
      code: meta?.code || `GI-PRJ-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      clientName: meta?.clientName || 'Valued Contractor / Client',
      location: meta?.location || 'Site Location',
      category: meta?.category || 'Civil & PEB Construction',
      status: 'active',
      owner: currentUser.name,
      lastModified: 'Just now',
      tags: [meta?.category || 'Template'],
      isArchived: false,
      document: processedTemplate,
    };

    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProj),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create project from template');
        return res.json();
      })
      .then(() => {
        router.push(`/editor/${newProjId}`);
      })
      .catch((err) => console.error('Create project from template error:', err));
  };

  const handleLogout = () => {
    localStorage.removeItem('latex_user');
    router.push('/login');
  };

  if (loading || !currentUser) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <Loader size={48} className="text-[#0d3479]" />
      </div>
    );
  }

  return (
    <>
      <ProjectsDashboard
        projects={projects}
        onSelectProject={(projId) => router.push(`/project/${projId}`)}
        onOpenProjectDetail={(projId) => router.push(`/project/${projId}`)}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onDuplicateProject={handleDuplicateProject}
        currentDocument={LABOUR_PO_TEMPLATE}
        onLoadTemplate={() => {}}
        onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
        currentUser={currentUser}
        onOpenAuth={() => {}}
        onLogout={handleLogout}
        onOpenTemplateBuilder={() => router.push('/template-builder')}
        onArchiveProject={handleToggleArchiveProject}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}
