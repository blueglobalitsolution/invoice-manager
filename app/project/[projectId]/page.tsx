'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProjectDetailView } from '@/components/ProjectDetailView';
import { Loader } from '@/components/ui/loader';
import { ProjectItem, ProjectDocType, ProjectDocStatus, ProjectStatus } from '@/types/project';
import { LABOUR_PO_TEMPLATE, SAMPLE_TEMPLATES } from '@/lib/templates';
import { createProjectDocument, syncProjectMasterToDocuments } from '@/lib/project-doc-templates';

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

    // Prefetch editor and dashboard for instant navigation
    router.prefetch('/dashboard');
    router.prefetch(`/editor/${projectId}`);
    router.prefetch(`/project/${projectId}/company-profile`);
  }, [projectId, currentUser, router]);

  const handleOpenDocument = (docId: string) => {
    router.push(`/editor/${projectId}?docId=${docId}`);
  };

  const handleCreateDocument = (
    docType: ProjectDocType,
    customTitle?: string,
    customNumber?: string,
    customAmount?: string,
    documentFields?: Record<string, string>
  ) => {
    if (!project) return;

    const docItem = createProjectDocument(
      docType,
      {
        title: project.title,
        clientName: project.clientName,
        clientAddress: project.clientAddress,
        clientGstNo: project.clientGstNo,
        contactPerson: project.contactPerson,
        location: project.location,
        code: project.code,
      },
      customTitle,
      customNumber,
      customAmount,
      documentFields
    );

    // Inject company profile if available
    if (project.companyProfile && docItem.document) {
      const p = project.companyProfile;
      const template = docItem.document;
      if (template.quotation) {
        if (p.companyName) template.quotation.companyName = p.companyName;
        if (p.companySubtitle) template.quotation.companySubtitle = p.companySubtitle;
        if (p.companyGstNo) template.quotation.companyGstNo = p.companyGstNo;
        if (p.companyPhone) template.quotation.companyPhone = p.companyPhone;
        if (p.companyEmail) template.quotation.companyEmail = p.companyEmail;
        if (p.companyWebsite) template.quotation.companyWebsite = p.companyWebsite;
        if (p.companyAddressHeader) template.quotation.companyAddressHeader = p.companyAddressHeader;
        if (p.companyAddressFooter) template.quotation.companyAddressFooter = p.companyAddressFooter;
        if (p.leftServices) template.quotation.leftServices = p.leftServices;
        if (p.rightServices) template.quotation.rightServices = p.rightServices;
      }
      if (template.taxInvoice) {
        if (p.companyName) template.taxInvoice.companyName = p.companyName;
        if (p.companySubtitle) template.taxInvoice.companySubtitle = p.companySubtitle;
        if (p.companyGstNo) template.taxInvoice.companyGstNo = p.companyGstNo;
        if (p.companyPanNo) template.taxInvoice.companyPanNo = p.companyPanNo;
        if (p.companyEpfNo) template.taxInvoice.companyEpfNo = p.companyEpfNo;
        if (p.companyPhone) template.taxInvoice.companyPhone = p.companyPhone;
        if (p.companyEmail) template.taxInvoice.companyEmail = p.companyEmail;
        if (p.companyWebsite) template.taxInvoice.companyWebsite = p.companyWebsite;
        if (p.companyAddressHeader) template.taxInvoice.companyAddressHeader = p.companyAddressHeader;
        if (p.companyAddressFooter) template.taxInvoice.companyAddressFooter = p.companyAddressFooter;
        if (p.leftServices) template.taxInvoice.leftServices = p.leftServices;
        if (p.rightServices) template.taxInvoice.rightServices = p.rightServices;
      }
      if (template.purchaseOrder) {
        if (p.companyName) template.purchaseOrder.companyName = p.companyName;
        if (p.companySubtitle) template.purchaseOrder.companySubtitle = p.companySubtitle;
        if (p.companyGstNo) template.purchaseOrder.gstNo = p.companyGstNo;
        if (p.companyPhone) template.purchaseOrder.companyPhone = p.companyPhone;
        if (p.companyEmail) template.purchaseOrder.companyEmail = p.companyEmail;
        if (p.companyWebsite) template.purchaseOrder.companyWebsite = p.companyWebsite;
        if (p.companyAddressHeader) {
          template.purchaseOrder.companyAddress = [p.companyAddressHeader];
        }
        if (p.companyAddressFooter) template.purchaseOrder.companyAddressFooter = p.companyAddressFooter;
        if (p.leftServices) template.purchaseOrder.leftServices = p.leftServices;
        if (p.rightServices) template.purchaseOrder.rightServices = p.rightServices;
      }
    }

    const updatedDocs = [docItem, ...(project.documents || [])];

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
        document: docItem.document,
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

    const updatedDocs = [duplicated, ...(project.documents || [])];

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

  const handleRenameDocument = (docId: string, newTitle: string, newDocNumber?: string) => {
    if (!project) return;
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const updatedDocs = (project.documents || []).map((d) => {
      if (d.id !== docId) return d;
      const updatedDoc = {
        ...d,
        title: trimmedTitle,
        ...(newDocNumber ? { docNumber: newDocNumber.trim() } : {}),
        lastModified: 'Just now',
      };
      if (updatedDoc.document) {
        updatedDoc.document = {
          ...updatedDoc.document,
          title: trimmedTitle,
        };
        if (updatedDoc.document.purchaseOrder && newDocNumber) {
          updatedDoc.document.purchaseOrder = {
            ...updatedDoc.document.purchaseOrder,
            poNumber: newDocNumber.trim(),
          };
        }
        if (updatedDoc.document.quotation && newDocNumber) {
          updatedDoc.document.quotation = {
            ...updatedDoc.document.quotation,
            refNo: newDocNumber.trim(),
          };
        }
        if (updatedDoc.document.taxInvoice && newDocNumber) {
          updatedDoc.document.taxInvoice = {
            ...updatedDoc.document.taxInvoice,
            invoiceNo: newDocNumber.trim(),
          };
        }
      }
      return updatedDoc;
    });

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
    }).catch((err) => console.error('Failed to rename document:', err));
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


  const handleUpdateCompanyProfile = (profile: any) => {
    if (!project) return;
    setProject({ ...project, companyProfile: profile });

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyProfile: profile,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to update company profile:', err));
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

  const handleUpdateProject = (updatedProject: ProjectItem) => {
    setProject(updatedProject);
    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updatedProject,
        lastModified: 'Just now by You',
      }),
    }).catch((err) => console.error('Failed to update project settings:', err));
  };

  const handleSaveProjectSettings = (updatedProject: ProjectItem, syncToDocs: boolean) => {
    let finalProject = { ...updatedProject };
    if (syncToDocs) {
      const syncedDocs = syncProjectMasterToDocuments(finalProject);
      finalProject.documents = syncedDocs;
    }
    finalProject.lastModified = 'Just now by You';
    setProject(finalProject);

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalProject),
    }).catch((err) => console.error('Failed to update project settings:', err));
  };

  const handleArchiveProject = () => {
    if (!project) return;
    const isCurrentlyArchived = Boolean(project.isArchived || project.status === 'archived');
    const actionText = isCurrentlyArchived ? 'unarchive' : 'archive';
    if (!confirm(`Are you sure you want to ${actionText} this project?`)) return;

    const nextIsArchived = !isCurrentlyArchived;
    const nextStatus: ProjectStatus = nextIsArchived ? 'archived' : 'active';

    fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        isArchived: nextIsArchived,
        lastModified: 'Just now by You',
      }),
    })
      .then(() => {
        router.push('/dashboard');
      })
      .catch((err) => console.error(`Failed to ${actionText} project:`, err));
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
      <div className="app-shell min-h-screen flex items-center justify-center">
        <Loader size={48} className="text-[#0d3479]" />
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
      onRenameDocument={handleRenameDocument}
      onUpdateDocumentStatus={handleUpdateDocumentStatus}
      onUpdateProjectStatus={handleUpdateProjectStatus}
      onDeleteProject={handleDeleteProject}
      onArchiveProject={handleArchiveProject}
      onUpdateCompanyProfile={handleUpdateCompanyProfile}
      onUpdateProject={handleUpdateProject}
      onSaveProjectSettings={handleSaveProjectSettings}
    />
  );
}
