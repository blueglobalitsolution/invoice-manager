'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { FormEditor } from '@/components/FormEditor';
import { DocumentPreview } from '@/components/DocumentPreview';
import { TexCodePreview } from '@/components/TexCodePreview';
import { FooterStatus } from '@/components/FooterStatus';
import { EditorRail } from '@/components/EditorRail';
import { FileTreeSidebar } from '@/components/FileTreeSidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { GlobalVariablesModal } from '@/components/GlobalVariablesModal';
import { TexCodeModal } from '@/components/TexCodeModal';
import { CreateDocumentModal } from '@/components/CreateDocumentModal';
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { Loader } from '@/components/ui/loader';
import { LatexDocument, DocumentSettings } from '@/types/document';
import { ProjectItem, ProjectDocumentItem, ProjectDocStatus, ProjectDocType } from '@/types/project';
import { LABOUR_PO_TEMPLATE, SAMPLE_TEMPLATES } from '@/lib/templates';
import { moveQuotationSectionToPage, moveSectionToPage, getQuotationSectionPageNumber } from '@/lib/document-sections';
import { exportToPdf } from '@/lib/pdf-export';

export default function EditorPage() {
  const router = useRouter();
  const rawParams = useParams();
  const searchParams = useSearchParams();
  const projectId = rawParams?.projectId as string;
  const docId = searchParams?.get('docId');

  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Layout UI States
  const [railTab, setRailTab] = useState<'filetree' | 'header_footer' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings'>('filetree');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlobalVarsOpen, setIsGlobalVarsOpen] = useState(false);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [isLatexCodeModalOpen, setIsLatexCodeModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(85);
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('info');
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Resize split panel states
  const [editorWidth, setEditorWidth] = useState<number>(45); // percentage
  const [isDragging, setIsDragging] = useState(false);

  // Split Panel Dragging logic
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const railWidth = 64;
      const filetreeWidth = railTab === 'filetree' ? 240 : 0;
      const containerWidth = window.innerWidth - railWidth - filetreeWidth;
      if (containerWidth <= 0) return;

      const clientX = e.clientX - railWidth - filetreeWidth;
      const percentage = Math.max(20, Math.min(80, (clientX / containerWidth) * 100));
      setEditorWidth(percentage);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, railTab]);


  // Undo / Redo history stacks
  const [undoStack, setUndoStack] = useState<LatexDocument[]>([]);
  const [redoStack, setRedoStack] = useState<LatexDocument[]>([]);

  // Auth Guard check
  useEffect(() => {
    const storedUser = localStorage.getItem('latex_user');
    if (!storedUser) {
      router.push('/login');
    } else {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, [router]);

  // Load project from API
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
        console.error('Fetch project error:', err);
        setError('Project not found. Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      });
  }, [projectId, currentUser, router]);

  // Access document state inside project object
  let docState: LatexDocument;
  if (docId && project?.documents) {
    const found = project.documents.find(d => d.id === docId);
    docState = found?.document || project?.document || LABOUR_PO_TEMPLATE;
  } else {
    docState = project?.document || LABOUR_PO_TEMPLATE;
  }

  // Save changes to SQLite database (Debounced)
  useEffect(() => {
    if (!project || loading) return;

    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: project.document,
          documents: project.documents,
          title: project.title,
          lastModified: 'Just now by You',
        }),
      }).catch((err) => console.error('Save project error:', err));
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [project, projectId, loading]);

  // Update doc state with history push
  const setDocState = (updatedDoc: LatexDocument, saveHistory: boolean = true) => {
    if (!project) return;

    if (saveHistory) {
      setUndoStack((prev) => [...prev.slice(-30), JSON.parse(JSON.stringify(docState))]);
      setRedoStack([]);
    }

    let updatedProject = { ...project, lastModified: 'Just now by You' };
    
    if (docId && project.documents) {
      updatedProject.documents = project.documents.map(d => 
        d.id === docId ? { ...d, document: updatedDoc, title: updatedDoc.title, lastModified: 'Just now' } : d
      );
      // Fallback update legacy document if it happens to be the same
      if (project.document?.id === docId) {
        updatedProject.document = updatedDoc;
      }
    } else {
      updatedProject.document = updatedDoc;
    }

    setProject(updatedProject);
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

  // Keyboard shortcut Ctrl+Z / Ctrl+Y / Ctrl+S / Ctrl+P / Ctrl+Shift+L / Ctrl+B / Ctrl+Shift+H / Ctrl+/
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if (mod && key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (mod && key === 's') {
        e.preventDefault();
        // Force save
        if (project) {
          fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              document: project.document,
              title: project.document?.title || project.title,
              lastModified: 'Just now by You',
            }),
          }).then(() => {
            setSaveToast(true);
            setTimeout(() => setSaveToast(false), 2000);
          }).catch((err) => console.error('Save error:', err));
        }
      } else if (mod && key === 'p') {
        e.preventDefault();
        handleExportPdf();
      } else if (mod && e.shiftKey && key === 'l') {
        e.preventDefault();
        setIsLatexCodeModalOpen((prev) => !prev);
      } else if (mod && key === 'b') {
        e.preventDefault();
        setRailTab((prev) => prev === 'filetree' ? 'settings' : 'filetree');
      } else if (mod && e.shiftKey && key === 'h') {
        e.preventDefault();
        setIsVersionHistoryOpen((prev) => !prev);
      } else if (mod && key === '/') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, docState, project, projectId]);

  const handleRecompile = () => {
    setIsRecompiling(true);
    setTimeout(() => setIsRecompiling(false), 900);
  };

  const handleExportPdf = async () => {
    try {
      const container = document.getElementById('pdf-preview-container');
      await exportToPdf(container, `${docState.title || 'Document'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    }
  };

  // Section & Page Handlers
  const handleAddPage = () => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const customPages = po.customPages || [];
      const nextNum = 3 + customPages.length + 1;
      const newPage = {
        id: `page_${Date.now()}`,
        pageNum: nextNum,
        title: `Annexure Page ${nextNum}`,
        includeLetterHeader: false,
        includeLetterFooter: true,
      };

      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          customPages: [...customPages, newPage],
        },
      });
    } else if (docState.quotation) {
      const q = docState.quotation;
      const customPages = q.customPages || [];
      const nextNum = 10 + customPages.length + 1;
      const newPage = {
        id: `page_${Date.now()}`,
        pageNum: nextNum,
        title: `Annexure Page ${nextNum}`,
        includeLetterHeader: false,
        includeLetterFooter: true,
      };

      setDocState({
        ...docState,
        quotation: {
          ...q,
          customPages: [...customPages, newPage],
        },
      });
    }
  };

  const handleDeletePage = (pageNum: number) => {
    if (!confirm(`Are you sure you want to delete Page ${pageNum}?`)) return;

    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const deleted = [...(po.deletedPages || []), pageNum];
      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          deletedPages: deleted,
        },
      });
    } else if (docState.quotation) {
      const q = docState.quotation;
      const deleted = [...(q.deletedPages || []), pageNum];
      setDocState({
        ...docState,
        quotation: {
          ...q,
          deletedPages: deleted,
        },
      });
    }
  };

  const handleReorderSections = (sourceId: string, targetId: string, targetPageNum: number) => {
    if (docState.purchaseOrder) {
      const updatedPo = moveSectionToPage(docState.purchaseOrder, sourceId, targetPageNum, targetId);
      setDocState({
        ...docState,
        purchaseOrder: updatedPo,
      });
    } else if (docState.quotation) {
      const updatedQ = moveQuotationSectionToPage(docState.quotation, sourceId, targetPageNum, targetId);
      setDocState({
        ...docState,
        quotation: updatedQ,
      });
    }
  };

  const handleMoveSectionToPage = (sectionId: string, pageNum: number) => {
    if (docState.purchaseOrder) {
      const map = { ...(docState.purchaseOrder.sectionPageMap || {}) };
      map[sectionId] = pageNum;
      setDocState({
        ...docState,
        purchaseOrder: {
          ...docState.purchaseOrder,
          sectionPageMap: map,
        },
      });
    } else if (docState.quotation) {
      const updatedQ = moveQuotationSectionToPage(docState.quotation, sectionId, pageNum);
      setDocState({
        ...docState,
        quotation: updatedQ,
      });
    }
  };

  const handleUpdateSettings = (newSettings: Partial<DocumentSettings>) => {
    setDocState({
      ...docState,
      settings: {
        ...docState.settings,
        ...newSettings,
      },
    });
  };

  const handleUpdateTitle = (title: string) => {
    setDocState({
      ...docState,
      title,
    });
  };

  const handleUpdateVariables = (variables: Record<string, string>) => {
    setDocState({
      ...docState,
      globalVariables: variables,
    });
  };

  if (loading || !project) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <Loader size={48} className="text-[#0d3479]" />
      </div>
    );
  }

  return (
    <div className="app-shell flex flex-col h-screen w-full text-slate-300 font-sans overflow-hidden bg-[#070A13]">
      <div className="print:hidden w-full shrink-0">
        <Header
          document={docState}
          project={project}
          activeDocumentId={project.id}
          onSelectDocument={() => {}}
          onOpenProjectDetail={() => router.push(`/project/${projectId}`)}
          onOpenAddDocumentModal={() => setIsCreateDocModalOpen(true)}
          onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
          onExportPdf={handleExportPdf}
          isRecompiling={isRecompiling}
          onRecompile={handleRecompile}
          onGoBackToDashboard={() => router.push(`/project/${projectId}`)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          currentUser={currentUser}
          onOpenAuth={() => {}}
          onLogout={() => {
            localStorage.removeItem('latex_user');
            router.push('/login');
          }}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      <main className="flex flex-1 overflow-hidden relative print:overflow-visible">
        <div className="print:hidden h-full flex shrink-0">
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
            onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
            onGoBackToDashboard={() => router.push(`/project/${projectId}`)}
          />
        </div>

        <div className="flex flex-1 overflow-hidden print:overflow-visible">
          {railTab === 'filetree' && (
            <div className="print:hidden shrink-0 h-full">
              <FileTreeSidebar
                document={docState}
                activeSectionId={activeSectionId}
                onSelectSection={(id) => {
                  setActiveSectionId(id);
                  setRailTab('filetree');
                }}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
                onReorderSections={handleReorderSections}
                onMoveSectionToPage={handleMoveSectionToPage}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative print:overflow-visible print:block">
            
            {/* Form Inputs Sidebar (Resizable width) */}
            <div 
              style={{ width: `${editorWidth}%` }} 
              className="h-full flex flex-col shrink-0 min-w-[300px] overflow-hidden print:hidden"
            >
              <FormEditor
                document={docState}
                onChange={setDocState}
                activeSectionId={activeSectionId}
                onSelectSection={setActiveSectionId}
              />
            </div>

            {/* Vertical Split Resizer Line */}
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              className={`hidden md:block w-[1px] hover:w-1 hover:bg-[#6366f1] bg-[#151C2C] cursor-col-resize h-full shrink-0 transition-all z-20 print:hidden ${
                isDragging ? 'bg-[#6366f1] w-1' : ''
              }`}
            />

            {/* PDF Live compilation Preview Panel */}
            <div className="flex-1 h-full min-w-[320px] overflow-hidden relative print:overflow-visible print:w-full print:absolute print:inset-0 print:z-50 print:bg-white">
              <DocumentPreview
                document={docState}
                companyProfile={project?.companyProfile}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                activeSectionId={activeSectionId}
                hoveredSectionId={hoveredSectionId}
                onHoverSection={setHoveredSectionId}
                onSelectSection={(id) => {
                  setActiveSectionId(id);
                  setRailTab('filetree');
                }}
                onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
              />
            </div>

          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        document={docState}
        settings={docState.settings}
        onUpdateSettings={handleUpdateSettings}
        projectTitle={docState.title}
        onUpdateTitle={handleUpdateTitle}
        onUpdateVariables={handleUpdateVariables}
      />

      <GlobalVariablesModal
        isOpen={isGlobalVarsOpen}
        onClose={() => setIsGlobalVarsOpen(false)}
        document={docState}
        onUpdateVariables={handleUpdateVariables}
      />

      <TexCodeModal
        isOpen={isLatexCodeModalOpen}
        onClose={() => setIsLatexCodeModalOpen(false)}
        document={docState}
        companyProfile={project?.companyProfile}
      />

      {project && (
        <CreateDocumentModal
          isOpen={isCreateDocModalOpen}
          onClose={() => setIsCreateDocModalOpen(false)}
          project={project}
          onCreateDocument={(docType: ProjectDocType, customTitle?: string, customNumber?: string, customAmount?: string) => {
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
            
            setProject({
              ...project,
              documents: updatedDocs,
              document: template,
            });
            
            fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documents: updatedDocs,
                document: template,
                lastModified: 'Just now by You',
              }),
            }).catch(console.error);
            
            setIsCreateDocModalOpen(false);
          }}
        />
      )}

      <FooterStatus document={docState} />

      {/* Save Toast */}
      {saveToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-[#0d3479] text-white text-sm font-semibold rounded-2xl shadow-xl animate-in fade-in zoom-in-95 flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Saved successfully</span>
        </div>
      )}

      {/* Version History Panel */}
      <VersionHistoryPanel
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        projectId={projectId}
        documentId={project?.documents?.[0]?.id || ''}
        onRestore={() => {
          setIsVersionHistoryOpen(false);
          // Reload project from API
          fetch(`/api/projects/${projectId}`)
            .then((res) => res.json())
            .then((data) => setProject(data))
            .catch(console.error);
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}
