'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FormEditor } from '@/components/FormEditor';
import { DocumentPreview } from '@/components/DocumentPreview';
import { TexCodePreview } from '@/components/TexCodePreview';
import { FooterStatus } from '@/components/FooterStatus';
import { ProjectsDashboard } from '@/components/ProjectsDashboard';
import { ProjectDetailView } from '@/components/ProjectDetailView';
import { EditorRail } from '@/components/EditorRail';
import { FileTreeSidebar } from '@/components/FileTreeSidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { GlobalVariablesModal } from '@/components/GlobalVariablesModal';
import { TemplateManagerDrawer } from '@/components/TemplateManagerDrawer';
import { TemplateBuilderStudio } from '@/components/TemplateBuilderStudio';
import { TexCodeModal } from '@/components/TexCodeModal';
import { CreateDocumentModal } from '@/components/CreateDocumentModal';
import { AuthPage } from '@/components/AuthPage';
import { SAMPLE_TEMPLATES, LABOUR_PO_DATA, LABOUR_PO_TEMPLATE } from '@/lib/templates';
import { INITIAL_PROJECTS } from '@/lib/initial-projects';
import { createProjectDocument } from '@/lib/project-doc-templates';
import {
  ProjectItem,
  ProjectDocumentItem,
  ProjectDocType,
  ProjectDocStatus,
  ProjectStatus,
} from '@/types/project';
import { LatexDocument, CustomPageDef, CustomSectionItem } from '@/types/document';
import { exportToPdf } from '@/lib/pdf-export';
import {
  moveSectionToPage,
  getDocumentOutlineGroups,
  moveQuotationSectionToPage,
  getQuotationOutlineGroups,
} from '@/lib/document-sections';

export default function Home() {
  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('latex_projects');
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0]?.id || 'proj_sevasi');
  const [activeDocumentId, setActiveDocumentId] = useState<string>(
    INITIAL_PROJECTS[0]?.documents?.[0]?.id || ''
  );

  const [railTab, setRailTab] = useState<
    'filetree' | 'header_footer' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings'
  >('filetree');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGlobalVarsOpen, setIsGlobalVarsOpen] = useState<boolean>(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState<boolean>(false);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState<boolean>(false);
  const [isLatexCodeModalOpen, setIsLatexCodeModalOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isRecompiling, setIsRecompiling] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('info');
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  // Authentication & Navigation State
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'project_detail' | 'editor' | 'login' | 'signup' | 'forgot' | 'template_builder'
  >('login');

  const handleOpenAuth = (mode: 'login' | 'signup' | 'forgot') => {
    setCurrentView(mode);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleSaveCustomTemplate = (tName: string, tDesc: string, tDoc: LatexDocument) => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('latex_custom_templates');
        const list = stored ? JSON.parse(stored) : [];
        const newTemplate = {
          id: `tmpl_${Date.now()}`,
          name: tName,
          description: tDesc,
          createdAt: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          document: JSON.parse(JSON.stringify(tDoc)),
        };
        localStorage.setItem('latex_custom_templates', JSON.stringify([newTemplate, ...list]));
      } catch (e) {
        console.error('Failed to save template', e);
      }
    }
  };

  const printRef = useRef<HTMLDivElement | null>(null);

  // Active Project & Active Document Resolution
  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  const activeDocItem: ProjectDocumentItem | undefined =
    activeProject?.documents?.find((d) => d.id === activeDocumentId) ||
    activeProject?.documents?.[0];

  // Guaranteed valid docState
  const docState: LatexDocument =
    activeDocItem?.document ||
    activeProject?.document ||
    LABOUR_PO_TEMPLATE;

  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<LatexDocument[]>([]);
  const [redoStack, setRedoStack] = useState<LatexDocument[]>([]);

  // Update document with undo history push
  const setDocState = (updatedDoc: LatexDocument, saveHistory: boolean = true) => {
    if (saveHistory) {
      setUndoStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(docState))]);
      setRedoStack([]);
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;

        const currentTargetDocId = activeDocItem?.id || activeDocumentId;
        const updatedDocs = (p.documents || []).map((d) =>
          d.id === currentTargetDocId
            ? {
                ...d,
                document: updatedDoc,
                title: updatedDoc.title || d.title,
                lastModified: 'Just now by You',
              }
            : d
        );

        return {
          ...p,
          documents: updatedDocs,
          document: updatedDoc,
          lastModified: 'Just now by You',
        };
      })
    );
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousDoc = undoStack[undoStack.length - 1];
    const newUndo = undoStack.slice(0, -1);
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(docState))]);
    setUndoStack(newUndo);
    setDocState(previousDoc, false);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextDoc = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(docState))]);
    setRedoStack(newRedo);
    setDocState(nextDoc, false);
  };

  // Keyboard shortcut support for Ctrl+Z (Undo) and Ctrl+Y (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, docState]);

  const handleLoadTemplate = (templateDoc: LatexDocument) => {
    setDocState({
      ...templateDoc,
      id: docState.id,
      title: docState.title,
    });
  };

  const handleCreateProjectFromTemplate = (templateDoc: LatexDocument, projectName: string) => {
    const newProjId = `proj_${Date.now()}`;
    const newDocId = `doc_${Date.now()}`;
    const docItem: ProjectDocumentItem = {
      id: newDocId,
      title: projectName,
      docType: 'work_order',
      docNumber: `GI/DOC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      status: 'draft',
      lastModified: 'Just now by You',
      document: {
        ...templateDoc,
        id: newDocId,
        title: projectName,
      },
    };

    const newProj: ProjectItem = {
      id: newProjId,
      title: projectName,
      code: `GI-PRJ-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      clientName: 'Valued Contractor / Client',
      location: 'Site Location',
      category: 'Civil & PEB Construction',
      status: 'active',
      owner: currentUser?.name || 'You',
      lastModified: 'Just now',
      tags: ['Template'],
      isArchived: false,
      documents: [docItem],
      document: docItem.document,
    };

    setProjects([newProj, ...projects]);
    setActiveProjectId(newProjId);
    setActiveDocumentId(newDocId);
    setCurrentView('editor');
  };

  // Section & Page Handlers
  const handleAddPage = () => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const currentCustomPages = po.customPages || [];
      const currentOutline = getDocumentOutlineGroups(po);
      const maxPage = currentOutline.reduce((max, g) => Math.max(max, g.pageNum), 0);
      const nextNum = Math.max(maxPage + 1, 1);

      const pageTitle = `Annexure: Additional Specifications`;

      const newPage: CustomPageDef = {
        id: `page_${Date.now()}`,
        pageNum: nextNum,
        title: pageTitle,
        includeLetterHeader: true,
        includeLetterFooter: true,
      };

      const firstSection: CustomSectionItem = {
        id: `sec_${Date.now()}`,
        title: 'Specifications & Conditions',
        pageNumber: nextNum,
        contentType: 'bullet_list',
        bullets: [
          'All fabrication tolerances shall conform to standard engineering guidelines.',
          'Inspection reports must be submitted prior to dispatch/erection.',
        ],
      };

      const deletedPages = (po.deletedPages || []).filter((p) => p !== nextNum);

      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          customPages: [...currentCustomPages, newPage],
          customSections: [...(po.customSections || []), firstSection],
          deletedPages,
        },
      });

      setActiveSectionId(firstSection.id);
    } else if (docState.quotation) {
      const q = docState.quotation;
      const currentCustomPages = q.customPages || [];
      const currentOutline = getQuotationOutlineGroups(q);
      const maxPage = currentOutline.reduce((max, g) => Math.max(max, g.pageNum), 0);
      const nextNum = Math.max(maxPage + 1, 1);

      const pageTitle = `Annexure: Additional Quotation Annexure`;

      const newPage: CustomPageDef = {
        id: `page_${Date.now()}`,
        pageNum: nextNum,
        title: pageTitle,
        includeLetterHeader: true,
        includeLetterFooter: true,
      };

      const firstSection: CustomSectionItem = {
        id: `sec_${Date.now()}`,
        title: 'Additional Terms & Scope',
        pageNumber: nextNum,
        contentType: 'bullet_list',
        bullets: [
          'All design computations are compliant with relevant IS codes.',
          'Any statutory clearance for local municipal body shall be managed by client.',
        ],
      };

      const deletedPages = (q.deletedPages || []).filter((p) => p !== nextNum);

      setDocState({
        ...docState,
        quotation: {
          ...q,
          customPages: [...currentCustomPages, newPage],
          customSections: [...(q.customSections || []), firstSection],
          deletedPages,
        },
      });

      setActiveSectionId(firstSection.id);
    }
  };

  const handleAddSectionItem = (newSection: CustomSectionItem) => {
    if (docState.purchaseOrder) {
      setDocState({
        ...docState,
        purchaseOrder: {
          ...docState.purchaseOrder,
          customSections: [...(docState.purchaseOrder.customSections || []), newSection],
        },
      });
      setActiveSectionId(newSection.id);
    } else if (docState.quotation) {
      setDocState({
        ...docState,
        quotation: {
          ...docState.quotation,
          customSections: [...(docState.quotation.customSections || []), newSection],
        },
      });
      setActiveSectionId(newSection.id);
    }
  };

  const handleAddSection = (pageNumber: number) => {
    const secTitle = 'Special Instructions';
    const newSection: CustomSectionItem = {
      id: `sec_${Date.now()}`,
      title: secTitle,
      pageNumber: pageNumber,
      contentType: 'bullet_list',
      bullets: [
        'Contractor must comply with all environmental and safety standards.',
        'Any discrepancy in drawings must be reported immediately.',
      ],
    };

    handleAddSectionItem(newSection);
  };

  const handleDeletePage = (pageNumber: number, pageId?: string) => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;

      const remainingPages = (po.customPages || []).filter(
        (p) => p.id !== pageId && p.pageNum !== pageNumber
      );

      const remainingCustomSections = (po.customSections || []).filter(
        (s) => s.pageNumber !== pageNumber
      );

      const allGroups = getDocumentOutlineGroups(po);
      const targetGroup = allGroups.find((g) => g.pageNum === pageNumber);
      const hiddenSections = new Set<string>(po.hiddenSections || []);

      if (targetGroup) {
        targetGroup.sections.forEach((sec) => {
          if (!sec.isCustom) {
            hiddenSections.add(sec.id);
          }
        });
      }

      const deletedPages = Array.from(new Set([...(po.deletedPages || []), pageNumber]));

      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          customPages: remainingPages,
          customSections: remainingCustomSections,
          hiddenSections: Array.from(hiddenSections),
          deletedPages,
        },
      });

      setActiveSectionId('info');
    } else if (docState.quotation) {
      const q = docState.quotation;

      const remainingPages = (q.customPages || []).filter(
        (p) => p.id !== pageId && p.pageNum !== pageNumber
      );

      const remainingCustomSections = (q.customSections || []).filter(
        (s) => s.pageNumber !== pageNumber
      );

      const allGroups = getQuotationOutlineGroups(q);
      const targetGroup = allGroups.find((g) => g.pageNum === pageNumber);
      const hiddenSections = new Set<string>(q.hiddenSections || []);

      if (targetGroup) {
        targetGroup.sections.forEach((sec) => {
          if (!sec.isCustom) {
            hiddenSections.add(sec.id);
          }
        });
      }

      const deletedPages = Array.from(new Set([...(q.deletedPages || []), pageNumber]));

      setDocState({
        ...docState,
        quotation: {
          ...q,
          customPages: remainingPages,
          customSections: remainingCustomSections,
          hiddenSections: Array.from(hiddenSections),
          deletedPages,
        },
      });

      setActiveSectionId('q_cover_info');
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;

      const isCustom = (po.customSections || []).some((s) => s.id === sectionId);
      if (isCustom) {
        const remainingSections = (po.customSections || []).filter((s) => s.id !== sectionId);
        setDocState({
          ...docState,
          purchaseOrder: {
            ...po,
            customSections: remainingSections,
          },
        });
      } else {
        const hiddenSections = Array.from(new Set([...(po.hiddenSections || []), sectionId]));
        setDocState({
          ...docState,
          purchaseOrder: {
            ...po,
            hiddenSections,
          },
        });
      }

      setActiveSectionId('info');
    } else if (docState.quotation) {
      const q = docState.quotation;

      const isCustom = (q.customSections || []).some((s) => s.id === sectionId);
      if (isCustom) {
        const remainingSections = (q.customSections || []).filter((s) => s.id !== sectionId);
        setDocState({
          ...docState,
          quotation: {
            ...q,
            customSections: remainingSections,
          },
        });
      } else {
        const hiddenSections = Array.from(new Set([...(q.hiddenSections || []), sectionId]));
        setDocState({
          ...docState,
          quotation: {
            ...q,
            hiddenSections,
          },
        });
      }

      setActiveSectionId('q_cover_info');
    }
  };

  const handleMoveSectionPage = (sectionId: string, newPageNum: number) => {
    if (docState.purchaseOrder) {
      const updatedPO = moveSectionToPage(docState.purchaseOrder, sectionId, Math.max(1, newPageNum));
      setDocState({
        ...docState,
        purchaseOrder: updatedPO,
      });
      setActiveSectionId(sectionId);
    } else if (docState.quotation) {
      const updatedQ = moveQuotationSectionToPage(docState.quotation, sectionId, Math.max(1, newPageNum));
      setDocState({
        ...docState,
        quotation: updatedQ,
      });
      setActiveSectionId(sectionId);
    }
  };

  const handleReorderSections = (sourceId: string, targetId: string, targetPageNum: number) => {
    if (docState.purchaseOrder) {
      const updatedPO = moveSectionToPage(
        docState.purchaseOrder,
        sourceId,
        Math.max(1, targetPageNum),
        targetId || undefined,
        true
      );
      setDocState({
        ...docState,
        purchaseOrder: updatedPO,
      });
      setActiveSectionId(sourceId);
    } else if (docState.quotation) {
      const updatedQ = moveQuotationSectionToPage(
        docState.quotation,
        sourceId,
        Math.max(1, targetPageNum),
        targetId || undefined,
        true
      );
      setDocState({
        ...docState,
        quotation: updatedQ,
      });
      setActiveSectionId(sourceId);
    }
  };

  // Project & Document Management Handlers
  const handleOpenProjectDetail = (projectId: string) => {
    setActiveProjectId(projectId);
    const targetPrj = projects.find((p) => p.id === projectId);
    if (targetPrj?.documents && targetPrj.documents.length > 0) {
      setActiveDocumentId(targetPrj.documents[0].id);
    }
    setCurrentView('project_detail');
  };

  const handleOpenDocumentInEditor = (documentId: string) => {
    setActiveDocumentId(documentId);
    setCurrentView('editor');
  };

  const handleCreateProject = (projectData: {
    title: string;
    code: string;
    clientName: string;
    location: string;
    category: string;
    budget: string;
    initialDocTypes: ProjectDocType[];
  }) => {
    const newProjId = `proj_${Date.now()}`;
    const prjInfo = {
      title: projectData.title,
      clientName: projectData.clientName,
      location: projectData.location,
      code: projectData.code,
    };

    const initialDocs: ProjectDocumentItem[] =
      projectData.initialDocTypes.length > 0
        ? projectData.initialDocTypes.map((type) => createProjectDocument(type, prjInfo))
        : [createProjectDocument('quotation', prjInfo), createProjectDocument('work_order', prjInfo)];

    const newProj: ProjectItem = {
      id: newProjId,
      title: projectData.title,
      code: projectData.code,
      clientName: projectData.clientName,
      location: projectData.location,
      category: projectData.category,
      budget: projectData.budget,
      status: 'active',
      owner: currentUser?.name || 'You',
      lastModified: 'Just now by You',
      tags: [projectData.category, 'Project'],
      isArchived: false,
      documents: initialDocs,
      document: initialDocs[0]?.document || LABOUR_PO_TEMPLATE,
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProjId);
    if (initialDocs.length > 0) {
      setActiveDocumentId(initialDocs[0].id);
    }
    setCurrentView('project_detail');
  };

  const handleCreateDocumentInProject = (
    docType: ProjectDocType,
    customTitle?: string,
    customNumber?: string,
    customAmount?: string
  ) => {
    if (!activeProject) return;
    const prjInfo = {
      title: activeProject.title,
      clientName: activeProject.clientName || 'Contractor',
      location: activeProject.location || 'Site',
      code: activeProject.code || 'GI-PRJ-2026',
    };

    const newDoc = createProjectDocument(docType, prjInfo, customTitle, customNumber, customAmount);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              documents: [...(p.documents || []), newDoc],
              lastModified: 'Just now by You',
            }
          : p
      )
    );

    setActiveDocumentId(newDoc.id);
    setCurrentView('editor');
  };

  const handleDeleteDocumentInProject = (docId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const updatedDocs = (p.documents || []).filter((d) => d.id !== docId);
        return {
          ...p,
          documents: updatedDocs,
        };
      })
    );
    if (activeDocumentId === docId) {
      const remaining = activeProject.documents?.filter((d) => d.id !== docId) || [];
      if (remaining.length > 0) {
        setActiveDocumentId(remaining[0].id);
      }
    }
  };

  const handleDuplicateDocumentInProject = (docId: string) => {
    const targetDoc = activeProject.documents?.find((d) => d.id === docId);
    if (!targetDoc) return;
    const dupDoc: ProjectDocumentItem = {
      ...JSON.parse(JSON.stringify(targetDoc)),
      id: `doc_${Date.now()}`,
      title: `${targetDoc.title} (Copy)`,
      docNumber: `${targetDoc.docNumber}-REV`,
      status: 'draft',
      lastModified: 'Just now by You',
    };
    dupDoc.document.title = dupDoc.title;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              documents: [...(p.documents || []), dupDoc],
              lastModified: 'Just now by You',
            }
          : p
      )
    );
  };

  const handleUpdateDocumentStatus = (docId: string, status: ProjectDocStatus) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        return {
          ...p,
          documents: (p.documents || []).map((d) =>
            d.id === docId ? { ...d, status, lastModified: 'Just now by You' } : d
          ),
        };
      })
    );
  };

  const handleUpdateProjectStatus = (status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, status, lastModified: 'Just now by You' } : p
      )
    );
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      if (activeProjectId === projectId && updated.length > 0) {
        setActiveProjectId(updated[0].id);
      }
      return updated;
    });
    setCurrentView('dashboard');
  };

  const handleDuplicateProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    const dupProj: ProjectItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `proj_${Date.now()}`,
      title: `${target.title} (Copy)`,
      code: `${target.code || 'PRJ'}-COPY`,
      lastModified: 'Just now by You',
    };
    setProjects((prev) => [dupProj, ...prev]);
  };

  const handleExportPdf = async () => {
    setIsRecompiling(true);
    setTimeout(async () => {
      await exportToPdf(
        printRef.current,
        `${docState.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'document'}.pdf`
      );
      setIsRecompiling(false);
    }, 400);
  };

  const handleRecompile = () => {
    setIsRecompiling(true);
    setTimeout(() => {
      setIsRecompiling(false);
    }, 300);
  };

  // Auth Guard
  if (
    !currentUser ||
    currentView === 'login' ||
    currentView === 'signup' ||
    currentView === 'forgot'
  ) {
    return (
      <AuthPage
        initialMode={
          currentView === 'login' || currentView === 'signup' || currentView === 'forgot'
            ? currentView
            : 'login'
        }
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  // Template Builder Studio View
  if (currentView === 'template_builder') {
    return (
      <TemplateBuilderStudio
        onBack={() => setCurrentView('dashboard')}
        onSaveTemplate={handleSaveCustomTemplate}
        onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
        initialDocument={docState}
      />
    );
  }

  // Project Dossier / Detail View (inside a selected Project)
  if (currentView === 'project_detail' && activeProject) {
    return (
      <ProjectDetailView
        project={activeProject}
        onBack={() => setCurrentView('dashboard')}
        onOpenDocument={handleOpenDocumentInEditor}
        onCreateDocument={handleCreateDocumentInProject}
        onDeleteDocument={handleDeleteDocumentInProject}
        onDuplicateDocument={handleDuplicateDocumentInProject}
        onUpdateDocumentStatus={handleUpdateDocumentStatus}
        onUpdateProjectStatus={handleUpdateProjectStatus}
        onDeleteProject={() => handleDeleteProject(activeProject.id)}
      />
    );
  }

  // Projects Dashboard View
  if (currentView === 'dashboard') {
    return (
      <div className="h-screen w-full overflow-hidden relative">
        <ProjectsDashboard
          projects={projects}
          onSelectProject={(pId) => {
            handleOpenProjectDetail(pId);
          }}
          onOpenProjectDetail={handleOpenProjectDetail}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          currentDocument={docState}
          onLoadTemplate={handleLoadTemplate}
          onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          onOpenTemplateBuilder={() => setCurrentView('template_builder')}
        />
      </div>
    );
  }

  // Document Editor View
  return (
    <div className="flex flex-col h-screen w-full bg-[#16202c] text-[#334155] font-sans overflow-hidden">
      {/* Top Header Menu Bar */}
      <Header
        document={docState}
        project={activeProject}
        activeDocumentId={activeDocItem?.id || activeDocumentId}
        onSelectDocument={(docId) => setActiveDocumentId(docId)}
        onOpenProjectDetail={() => setCurrentView('project_detail')}
        onOpenAddDocumentModal={() => setIsCreateDocModalOpen(true)}
        onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
        onExportPdf={handleExportPdf}
        isRecompiling={isRecompiling}
        onRecompile={handleRecompile}
        onGoBackToDashboard={() => setCurrentView('dashboard')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main Workspace Layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Leftmost Icon Rail */}
        <EditorRail
          activeTab={activeSectionId === 'header_footer' ? 'header_footer' : railTab}
          setActiveTab={(tab) => {
            setRailTab(tab);
            if (tab === 'header_footer') {
              setActiveSectionId('header_footer');
            } else if (tab === 'variables') {
              setIsGlobalVarsOpen(true);
            } else if (tab === 'filetree') {
              if (activeSectionId === 'header_footer') {
                setActiveSectionId('info');
              }
            }
            if (tab === 'settings') setIsSettingsOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGlobalVariables={() => setIsGlobalVarsOpen(true)}
          onOpenTemplates={() => setIsTemplateManagerOpen(true)}
          onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
          onGoBackToDashboard={() => setCurrentView('project_detail')}
        />

        {/* Main 3-Pane Editing & Live Rendering Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Document Sections Outline (hidden for single-page structured tax invoice) */}
          {!docState.taxInvoice && (
            <FileTreeSidebar
              document={docState}
              activeSectionId={activeSectionId}
              hoveredSectionId={hoveredSectionId}
              onHoverSection={setHoveredSectionId}
              onSelectSection={(secId) => setActiveSectionId(secId)}
              onAddPage={handleAddPage}
              onAddSection={handleAddSection}
              onAddSectionItem={handleAddSectionItem}
              onDeletePage={handleDeletePage}
              onDeleteSection={handleDeleteSection}
              onReorderSections={handleReorderSections}
              onMoveSectionToPage={handleMoveSectionPage}
              onOpenGlobalVariables={() => setIsGlobalVarsOpen(true)}
            />
          )}

          {/* Middle Configuration Settings Panel */}
          <div className={`${docState.taxInvoice ? 'w-[430px]' : 'w-[380px]'} shrink-0 h-full overflow-hidden flex flex-col bg-[#111927] border-r border-gray-800`}>
            <FormEditor
              document={docState}
              activeSectionId={activeSectionId}
              onSelectSection={(secId) => setActiveSectionId(secId)}
              onChange={setDocState}
              onOpenGlobalVariables={() => setIsGlobalVarsOpen(true)}
            />
          </div>

          {/* Optional Code View Pane */}
          {railTab === 'code' && (
            <div className="w-[420px] shrink-0 h-full flex flex-col overflow-hidden bg-[#1e2633] border-r border-gray-800">
              <TexCodePreview document={docState} onExportTex={() => {}} />
            </div>
          )}

          {/* Right Live Document Preview Canvas with Auto-Scroll */}
          <DocumentPreview
            document={docState}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            printRef={printRef}
            activeSectionId={activeSectionId}
            hoveredSectionId={hoveredSectionId}
            onHoverSection={setHoveredSectionId}
            onSelectSection={setActiveSectionId}
            onMoveCustomSectionPage={handleMoveSectionPage}
            onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
          />
        </div>
      </main>

      {/* Global Variables Settings Modal */}
      <GlobalVariablesModal
        isOpen={isGlobalVarsOpen}
        onClose={() => setIsGlobalVarsOpen(false)}
        document={docState}
        onUpdateVariables={(newVars) => {
          setDocState({
            ...docState,
            globalVariables: newVars,
          });
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={docState.settings}
        projectTitle={docState.title}
        document={docState}
        onUpdateTitle={(title) => {
          setDocState({ ...docState, title });
        }}
        onUpdateSettings={(newSettings) => {
          setDocState({
            ...docState,
            settings: { ...docState.settings, ...newSettings },
          });
        }}
        onUpdateVariables={(newVars) => {
          setDocState({
            ...docState,
            globalVariables: newVars,
          });
        }}
      />

      {/* Template Manager Drawer */}
      <TemplateManagerDrawer
        isOpen={isTemplateManagerOpen}
        onClose={() => setIsTemplateManagerOpen(false)}
        currentDocument={docState}
        onLoadTemplate={handleLoadTemplate}
        onCreateProjectFromTemplate={handleCreateProjectFromTemplate}
      />

      {/* Create Document Modal (when triggered from Header) */}
      {activeProject && (
        <CreateDocumentModal
          isOpen={isCreateDocModalOpen}
          onClose={() => setIsCreateDocModalOpen(false)}
          project={activeProject}
          onCreateDocument={handleCreateDocumentInProject}
        />
      )}

      {/* LaTeX Code Inspector Modal */}
      <TexCodeModal
        isOpen={isLatexCodeModalOpen}
        onClose={() => setIsLatexCodeModalOpen(false)}
        document={docState}
      />

      {/* Bottom Status Bar */}
      <FooterStatus document={docState} />
    </div>
  );
}
