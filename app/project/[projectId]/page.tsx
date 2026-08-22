'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProjectDetailView } from '@/components/ProjectDetailView';
import { FadingRing } from '@/components/ui/fading-ring';
import { ProjectItem, ProjectDocType, ProjectDocStatus, ProjectStatus } from '@/types/project';
import { LABOUR_PO_TEMPLATE, SAMPLE_TEMPLATES } from '@/lib/templates';

export default function ProjectDetailPage() {
  const router = useRouter();
  const rawParams = useParams();
  const projectId = rawParams?.projectId as string;

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    const storedUser = localStorage.getItem('latex_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Fetch project from database
  useEffect(() => {
    if (!projectId || !currentUser) return;

    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Project not found');
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch project details error:', err);
        router.push('/dashboard');
      });
  }, [projectId, currentUser, router]);

  const handleOpenDocument = (docId: string) => {
    // Navigate directly to the editor workspace of this project
    router.push(`/editor/${projectId}`);
  };

  const handleCreateDocument = (
    docType: ProjectDocType,
    customTitle?: string,
    customNumber?: string,
    customAmount?: string
  ) => {
    if (!project) return;

    const template = docType === 'quotation' ? SAMPLE_TEMPLATES.quotation
                   : docType === 'invoice' ? SAMPLE_TEMPLATES.tax_invoice
                   : docType === 'work_order' ? SAMPLE_TEMPLATES.labour_po
                   : SAMPLE_TEMPLATES.blank || LABOUR_PO_TEMPLATE;

    const newDocId = `doc_${Date.now()}`;
    const newDocItem = {
      id: newDocId,
      projectId: project.id,
      title: customTitle || `${docType.toUpperCase()} Sheet`,
      docType,
      docNumber: customNumber || `GI-${docType.substring(0,3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      status: 'draft' as ProjectDocStatus,
      lastModified: 'Just now',
      amount: customAmount || '₹ 0.00',
      document: template,
    };

    const updatedDocs = [...(project.documents || []), newDocItem];

    // Optimistically update client UI
    setProject({
      ...project,
      documents: updatedDocs,
    });

    // Save update via API
    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: updatedDocs,
        document: template,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to save document:', err));
  };

  const handleDeleteDocument = (docId: string) => {
    if (!project) return;
    if (!confirm('Are you sure you want to delete this document sheet?')) return;

    const updatedDocs = (project.documents || []).filter((d) => d.id !== docId);

    setProject({
      ...project,
      documents: updatedDocs,
    });

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: updatedDocs,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to delete document:', err));
  };

  const handleDuplicateDocument = (docId: string) => {
    if (!project) return;
    const target = (project.documents || []).find((d) => d.id === docId);
    if (!target) return;

    const newDocId = `doc_${Date.now()}`;
    const duplicated = {
      ...target,
      id: newDocId,
      title: `${target.title} (Copy)`,
      docNumber: `${target.docNumber}-COPY`,
      lastModified: 'Just now',
    };

    const updatedDocs = [...(project.documents || []), duplicated];

    setProject({
      ...project,
      documents: updatedDocs,
    });

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: updatedDocs,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to duplicate document:', err));
  };

  const handleUpdateDocumentStatus = (docId: string, status: ProjectDocStatus) => {
    if (!project) return;

    const updatedDocs = (project.documents || []).map((d) =>
      d.id === docId ? { ...d, status, lastModified: 'Just now' } : d
    );

    setProject({
      ...project,
      documents: updatedDocs,
    });

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documents: updatedDocs,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to update document status:', err));
  };

  const handleUpdateProjectStatus = (status: ProjectStatus) => {
    if (!project) return;

    setProject({
      ...project,
      status,
    });

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to update project status:', err));
  };

  const handleDeleteProject = () => {
    if (!project) return;
    if (!confirm('Are you sure you want to delete this entire project?')) return;

    fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        router.push('/dashboard');
      })
      .catch((err) => console.error('Failed to delete project:', err));
  };

  if (loading || !project) {
    return (
      <div className="app-shell min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <FadingRing size={48} className="text-emerald-500" />
      </div>
    );
  }

  return (
    <ProjectDetailView
      project={project}
      currentUser={currentUser}
      onLogout={() => {
        localStorage.removeItem('latex_user');
        router.push('/login');
      }}
      onBack={() => router.push('/dashboard')}
      onOpenDocument={handleOpenDocument}
      onCreateDocument={handleCreateDocument}
      onDeleteDocument={handleDeleteDocument}
      onDuplicateDocument={handleDuplicateDocument}
      onUpdateDocumentStatus={handleUpdateDocumentStatus}
      onUpdateProjectStatus={handleUpdateProjectStatus}
      onDeleteProject={handleDeleteProject}
    />
  );
}
