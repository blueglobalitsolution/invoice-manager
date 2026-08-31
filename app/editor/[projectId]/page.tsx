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
import { AddSectionModal } from '@/components/AddSectionModal';
import { ProjectSettingsModal } from '@/components/ProjectSettingsModal';
import { TexCodeModal } from '@/components/TexCodeModal';
import { CreateDocumentModal } from '@/components/CreateDocumentModal';
import { VersionHistoryPanel } from '@/components/VersionHistoryPanel';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { WatermarkModal } from '@/components/WatermarkModal';
import { Loader } from '@/components/ui/loader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/components/ui/Toast';
import { LatexDocument, DocumentSettings, CustomSectionItem, WatermarkConfig } from '@/types/document';
import { ProjectItem, ProjectDocumentItem, ProjectDocStatus, ProjectDocType } from '@/types/project';
import { LABOUR_PO_TEMPLATE, SAMPLE_TEMPLATES } from '@/lib/templates';
import {
  moveQuotationSectionToPage,
  moveSectionToPage,
  getQuotationSectionPageNumber,
  getSectionPageNumber,
  getDocumentOutlineGroups,
  getQuotationOutlineGroups,
  moveSectionUp,
  moveSectionDown,
  moveQuotationSectionUp,
  moveQuotationSectionDown,
  BUILTIN_SECTIONS,
  QUOTATION_BUILTIN_SECTIONS,
} from '@/lib/document-sections';
import { exportToPdf } from '@/lib/pdf-export';
import { createProjectDocument, syncProjectMasterToDocuments } from '@/lib/project-doc-templates';

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

  const [railTab, setRailTab] = useState<'filetree' | 'variables' | 'search' | 'code' | 'media' | 'chat' | 'ai' | 'settings'>('filetree');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlobalVarsOpen, setIsGlobalVarsOpen] = useState(false);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [isLatexCodeModalOpen, setIsLatexCodeModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(85);
  const [isRecompiling, setIsRecompiling] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('info');
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
        if (!res.ok) {
          setError('Project not found or was deleted. Redirecting to dashboard...');
          setLoading(false);
          toast.error('Project not found. Redirecting to dashboard...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1200);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch project error:', err);
        setError('Unable to load project.');
        setLoading(false);
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

  // Backfill clauses and clear rateItems for civil labour work orders
  if (docState.purchaseOrder?.showAwardLetter || docState.purchaseOrder?.contractType?.toLowerCase().includes('civil')) {
    const po = docState.purchaseOrder;
    const needsClauseBackfill = !po.contractValueClause || po.contractValueClause.length === 0;
    const needsQualityBackfill = !po.qualityClause || po.qualityClause.length === 0;
    const needsMaterialBackfill = !po.materialClause || po.materialClause.length === 0;
    const needsSafetyBackfill = !po.safetyClause || po.safetyClause.length === 0;
    const needsLabourBackfill = !po.labourLawsItems || po.labourLawsItems.length === 0;
    const needsPaymentBackfill = !po.paymentMilestones || po.paymentMilestones.length === 0;
    const needsTimeScheduleBackfill = !po.timeScheduleClause || po.timeScheduleClause.length === 0 || !po.timeScheduleClause.some(t => t.includes('Rupees Two Thousand Only'));
    const needsPage3Backfill = !po.page3Terms || po.page3Terms.length === 0 || !po.page3Terms.some(t => t.includes('neat and clean condition'));
    const needsHousekeepingBackfill = !po.housekeepingClause || po.housekeepingClause.length === 0;
    const needsWarrantyBackfill = !po.warrantyClause || po.warrantyClause.length === 0;
    const needsVariationBackfill = !po.variationClause || po.variationClause.length === 0;
    const needsTerminationBackfill = !po.terminationClause || po.terminationClause.length === 0;
    const needsForceMajeureBackfill = !po.forceMajeureClause || po.forceMajeureClause.length === 0;
    const needsJurisdictionBackfill = !po.jurisdictionClause || po.jurisdictionClause.length === 0;
    const needsAcceptanceBackfill = !po.acceptanceClause;
    const hasRateItems = po.rateItems && po.rateItems.length > 0;
    if (needsClauseBackfill || needsQualityBackfill || needsMaterialBackfill || needsSafetyBackfill || needsLabourBackfill || needsPaymentBackfill || needsTimeScheduleBackfill || needsHousekeepingBackfill || needsWarrantyBackfill || needsVariationBackfill || needsTerminationBackfill || needsForceMajeureBackfill || needsJurisdictionBackfill || needsPage3Backfill || needsAcceptanceBackfill || hasRateItems) {
      docState = {
        ...docState,
        purchaseOrder: {
          ...po,
          contractValueClause: needsClauseBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.contractValueClause || [])
            : po.contractValueClause,
          qualityClause: needsQualityBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.qualityClause || [])
            : po.qualityClause,
          materialClause: needsMaterialBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.materialClause || [])
            : po.materialClause,
          safetyClause: needsSafetyBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.safetyClause || [])
            : po.safetyClause,
          labourLawsIntro: needsLabourBackfill
            ? LABOUR_PO_TEMPLATE.purchaseOrder!.labourLawsIntro
            : po.labourLawsIntro,
          labourLawsItems: needsLabourBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.labourLawsItems || [])
            : po.labourLawsItems,
          labourLawsDisclaimer: needsLabourBackfill
            ? LABOUR_PO_TEMPLATE.purchaseOrder!.labourLawsDisclaimer
            : po.labourLawsDisclaimer,
          paymentMilestones: needsPaymentBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.paymentMilestones || [])
            : po.paymentMilestones,
          paymentDeductionTerms: needsPaymentBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.paymentDeductionTerms || [])
            : po.paymentDeductionTerms,
          timeScheduleClause: needsTimeScheduleBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.timeScheduleClause || [])
            : po.timeScheduleClause,
          housekeepingClause: needsHousekeepingBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.housekeepingClause || [])
            : po.housekeepingClause,
          warrantyClause: needsWarrantyBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.warrantyClause || [])
            : po.warrantyClause,
          variationClause: needsVariationBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.variationClause || [])
            : po.variationClause,
          terminationClause: needsTerminationBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.terminationClause || [])
            : po.terminationClause,
          forceMajeureClause: needsForceMajeureBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.forceMajeureClause || [])
            : po.forceMajeureClause,
          jurisdictionClause: needsJurisdictionBackfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.jurisdictionClause || [])
            : po.jurisdictionClause,
          page3Terms: needsPage3Backfill
            ? (LABOUR_PO_TEMPLATE.purchaseOrder!.page3Terms || [])
            : po.page3Terms,
          acceptanceClause: needsAcceptanceBackfill
            ? LABOUR_PO_TEMPLATE.purchaseOrder!.acceptanceClause
            : po.acceptanceClause,
          rateItems: [],
        },
      };
    }
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
    setIsExporting(true);
    // Yield to browser event loop to let React re-render DOM with isExporting = true and clean state
    await new Promise((resolve) => setTimeout(resolve, 150));
    try {
      const container = document.getElementById('pdf-preview-container');
      await exportToPdf(container, `${docState.title || 'Document'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Section & Page Handlers
  const handleAddPage = () => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const currentGroups = getDocumentOutlineGroups(po);
      const currentPages = currentGroups.map((g) => g.pageNum);
      const nextNum = (currentPages.length > 0 ? Math.max(...currentPages) : 0) + 1;
      const newPage = {
        id: `page_${Date.now()}`,
        pageNum: nextNum,
        title: `Page ${nextNum}`,
        includeLetterHeader: false,
        includeLetterFooter: true,
      };

      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          deletedPages: (po.deletedPages || []).filter((p) => p !== nextNum),
          customPages: [...(po.customPages || []), newPage],
        },
      });
    } else if (docState.quotation) {
      const q = docState.quotation;
      const currentGroups = getQuotationOutlineGroups(q);
      const currentPages = currentGroups.map((g) => g.pageNum);
      const nextNum = (currentPages.length > 0 ? Math.max(...currentPages) : 0) + 1;
      const newPage = {
        id: `page_${Date.now()}`,
        pageNum: nextNum,
        title: `Page ${nextNum}`,
        includeLetterHeader: false,
        includeLetterFooter: true,
      };

      setDocState({
        ...docState,
        quotation: {
          ...q,
          deletedPages: (q.deletedPages || []).filter((p) => p !== nextNum),
          customPages: [...(q.customPages || []), newPage],
        },
      });
    }
  };

  const handleDeletePage = (pageNum: number) => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const currentGroups = getDocumentOutlineGroups(po);
      if (currentGroups.length <= 1) {
        toast.warning('Document must have at least one page.');
        return;
      }

      setConfirmState({
        isOpen: true,
        title: `Delete Page ${pageNum}`,
        message: `Are you sure you want to delete Page ${pageNum}? All custom sections on this page will be removed.`,
        confirmText: 'Delete Page',
        variant: 'danger',
        onConfirm: () => {
          const deleted = Array.from(new Set([...(po.deletedPages || []), pageNum]));
          const nextCustomSections = (po.customSections || []).filter((s) => s.pageNumber !== pageNum);
          const builtinSectionsOnPage = BUILTIN_SECTIONS.filter((b) => getSectionPageNumber(b.id, po) === pageNum).map((b) => b.id);
          const hidden = Array.from(new Set([...(po.hiddenSections || []), ...builtinSectionsOnPage]));
          const nextCustomPages = (po.customPages || []).filter((p) => p.pageNum !== pageNum);

          // If activeSection was on this page, reset active section to a remaining section
          const activeIsOnPage =
            (po.customSections || []).some((s) => s.id === activeSectionId && s.pageNumber === pageNum) ||
            builtinSectionsOnPage.includes(activeSectionId);

          if (activeIsOnPage) {
            const remainingGroup = currentGroups.find((g) => g.pageNum !== pageNum);
            if (remainingGroup && remainingGroup.sections.length > 0) {
              setActiveSectionId(remainingGroup.sections[0].id);
            }
          }

          setDocState({
            ...docState,
            purchaseOrder: {
              ...po,
              deletedPages: deleted,
              customSections: nextCustomSections,
              hiddenSections: hidden,
              customPages: nextCustomPages,
            },
          });
          toast.success(`Page ${pageNum} removed successfully.`);
        },
      });
    } else if (docState.quotation) {
      const q = docState.quotation;
      const currentGroups = getQuotationOutlineGroups(q);
      if (currentGroups.length <= 1) {
        toast.warning('Document must have at least one page.');
        return;
      }

      setConfirmState({
        isOpen: true,
        title: `Delete Page ${pageNum}`,
        message: `Are you sure you want to delete Page ${pageNum}? All custom sections on this page will be removed.`,
        confirmText: 'Delete Page',
        variant: 'danger',
        onConfirm: () => {
          const deleted = Array.from(new Set([...(q.deletedPages || []), pageNum]));
          const nextCustomSections = (q.customSections || []).filter((s) => s.pageNumber !== pageNum);
          const builtinSectionsOnPage = QUOTATION_BUILTIN_SECTIONS.filter((b) => getQuotationSectionPageNumber(b.id, q) === pageNum).map((b) => b.id);
          const hidden = Array.from(new Set([...(q.hiddenSections || []), ...builtinSectionsOnPage]));
          const nextCustomPages = (q.customPages || []).filter((p) => p.pageNum !== pageNum);

          const activeIsOnPage =
            (q.customSections || []).some((s) => s.id === activeSectionId && s.pageNumber === pageNum) ||
            builtinSectionsOnPage.includes(activeSectionId);

          if (activeIsOnPage) {
            const remainingGroup = currentGroups.find((g) => g.pageNum !== pageNum);
            if (remainingGroup && remainingGroup.sections.length > 0) {
              setActiveSectionId(remainingGroup.sections[0].id);
            }
          }

          setDocState({
            ...docState,
            quotation: {
              ...q,
              deletedPages: deleted,
              customSections: nextCustomSections,
              hiddenSections: hidden,
              customPages: nextCustomPages,
            },
          });
          toast.success(`Page ${pageNum} removed successfully.`);
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
      const updatedPo = moveSectionToPage(docState.purchaseOrder, sectionId, pageNum);
      setDocState({
        ...docState,
        purchaseOrder: updatedPo,
      });
    } else if (docState.quotation) {
      const updatedQ = moveQuotationSectionToPage(docState.quotation, sectionId, pageNum);
      setDocState({
        ...docState,
        quotation: updatedQ,
      });
    }
  };

  const handleMoveSectionUp = (sectionId: string) => {
    if (docState.purchaseOrder) {
      setDocState({
        ...docState,
        purchaseOrder: moveSectionUp(docState.purchaseOrder, sectionId),
      });
    } else if (docState.quotation) {
      setDocState({
        ...docState,
        quotation: moveQuotationSectionUp(docState.quotation, sectionId),
      });
    }
  };

  const handleMoveSectionDown = (sectionId: string) => {
    if (docState.purchaseOrder) {
      setDocState({
        ...docState,
        purchaseOrder: moveSectionDown(docState.purchaseOrder, sectionId),
      });
    } else if (docState.quotation) {
      setDocState({
        ...docState,
        quotation: moveQuotationSectionDown(docState.quotation, sectionId),
      });
    }
  };

  const handleDuplicateSection = (sectionId: string) => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const currentGroups = getDocumentOutlineGroups(po);
      let targetPageNum = 1;
      let originalLabel = 'Section';

      for (const group of currentGroups) {
        const found = group.sections.find((s) => s.id === sectionId);
        if (found) {
          targetPageNum = group.pageNum;
          originalLabel = found.label;
          break;
        }
      }

      const newId = `cs-${Date.now()}`;
      let newCustomSection: CustomSectionItem;

      // 1. Check if sectionId is already a custom section
      const existingCustom = (po.customSections || []).find((s) => s.id === sectionId);
      if (existingCustom) {
        newCustomSection = {
          ...JSON.parse(JSON.stringify(existingCustom)),
          id: newId,
          title: `${existingCustom.title} (Copy)`,
          pageNumber: targetPageNum,
        };
      } else {
        // 2. Builtin section cloning
        let contentType: CustomSectionItem['contentType'] = 'paragraphs';
        let paragraphs: string[] | undefined = undefined;
        let bullets: string[] | undefined = undefined;
        let tableHeaders: string[] | undefined = undefined;
        let tableRows: string[][] | undefined = undefined;

        if (sectionId === 'scope') {
          contentType = 'bullet_list';
          bullets = [...(po.scopeOfWork || [])];
        } else if (sectionId === 'company_scope') {
          contentType = 'bullet_list';
          bullets = [...(po.companyScope || [])];
        } else if (sectionId === 'contractor_scope' || sectionId === 'scope_contractor') {
          contentType = 'bullet_list';
          bullets = [...(po.contractorScope || po.scopeOfContractor || [])];
        } else if (sectionId === 'labour_laws') {
          contentType = 'bullet_list';
          bullets = [...(po.labourLawsItems || [])];
        } else if (sectionId === 'payment_clause' || sectionId === 'payment_terms') {
          contentType = 'bullet_list';
          bullets = [...(po.paymentMilestones || po.paymentTerms || [])];
        } else if (sectionId === 'contract_value') {
          contentType = 'paragraphs';
          paragraphs = [...(po.contractValueClause || [])];
        } else if (sectionId === 'award_letter') {
          contentType = 'paragraphs';
          paragraphs = [po.awardSubject || '', po.awardLetterBody || ''].filter(Boolean);
        } else if (sectionId === 'quality_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.qualityClause || [])];
        } else if (sectionId === 'material_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.materialClause || [])];
        } else if (sectionId === 'safety_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.safetyClause || [])];
        } else if (sectionId === 'time_schedule') {
          contentType = 'paragraphs';
          paragraphs = [...(po.timeScheduleClause || [])];
        } else if (sectionId === 'housekeeping_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.housekeepingClause || [])];
        } else if (sectionId === 'warranty_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.warrantyClause || [])];
        } else if (sectionId === 'variation_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.variationClause || [])];
        } else if (sectionId === 'termination_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.terminationClause || [])];
        } else if (sectionId === 'force_majeure_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.forceMajeureClause || [])];
        } else if (sectionId === 'jurisdiction_clause') {
          contentType = 'paragraphs';
          paragraphs = [...(po.jurisdictionClause || [])];
        } else if (sectionId === 'acceptance_clause') {
          contentType = 'paragraphs';
          paragraphs = [po.acceptanceClause || 'I/We have read, understood and accepted all the above terms and conditions of this Work Order.'];
        } else if (sectionId === 'rates') {
          contentType = 'table';
          tableHeaders = ['Item', 'Description', 'Qty', 'Unit', 'Rate (₹)', 'Amount (₹)'];
          tableRows = (po.rateItems || []).map((r, idx) => [
            String(idx + 1),
            r.description || '',
            String(r.qty || 1),
            r.unit || '',
            String(r.rate || 0),
            String(r.total || 0),
          ]);
        } else {
          contentType = 'paragraphs';
          paragraphs = ['Duplicated section content'];
        }

        newCustomSection = {
          id: newId,
          title: `${originalLabel} (Copy)`,
          pageNumber: targetPageNum,
          contentType,
          paragraphs,
          bullets,
          tableHeaders,
          tableRows,
        };
      }

      // Insert new section in sectionOrder right after sectionId if order exists
      const currentOrder = currentGroups.flatMap((g) => g.sections.map((s) => s.id));
      const secIdx = currentOrder.indexOf(sectionId);
      const nextOrder = secIdx !== -1
        ? [...currentOrder.slice(0, secIdx + 1), newId, ...currentOrder.slice(secIdx + 1)]
        : [...currentOrder, newId];

      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          customSections: [...(po.customSections || []), newCustomSection],
          sectionOrder: nextOrder,
          sectionPageMap: {
            ...(po.sectionPageMap || {}),
            [newId]: targetPageNum,
          },
        },
      });
      setActiveSectionId(newId);
      toast.success(`Duplicated "${originalLabel}" successfully!`);
    } else if (docState.quotation) {
      const q = docState.quotation;
      const currentGroups = getQuotationOutlineGroups(q);
      let targetPageNum = 1;
      let originalLabel = 'Section';

      for (const group of currentGroups) {
        const found = group.sections.find((s) => s.id === sectionId);
        if (found) {
          targetPageNum = group.pageNum;
          originalLabel = found.label;
          break;
        }
      }

      const newId = `cs-${Date.now()}`;
      const existingCustom = (q.customSections || []).find((s) => s.id === sectionId);
      let newCustomSection: CustomSectionItem;

      if (existingCustom) {
        newCustomSection = {
          ...JSON.parse(JSON.stringify(existingCustom)),
          id: newId,
          title: `${existingCustom.title} (Copy)`,
          pageNumber: targetPageNum,
        };
      } else {
        newCustomSection = {
          id: newId,
          title: `${originalLabel} (Copy)`,
          pageNumber: targetPageNum,
          contentType: 'paragraphs',
          paragraphs: ['Duplicated quotation section content'],
        };
      }

      const currentOrder = currentGroups.flatMap((g) => g.sections.map((s) => s.id));
      const secIdx = currentOrder.indexOf(sectionId);
      const nextOrder = secIdx !== -1
        ? [...currentOrder.slice(0, secIdx + 1), newId, ...currentOrder.slice(secIdx + 1)]
        : [...currentOrder, newId];

      setDocState({
        ...docState,
        quotation: {
          ...q,
          customSections: [...(q.customSections || []), newCustomSection],
          sectionOrder: nextOrder,
          sectionPageMap: {
            ...(q.sectionPageMap || {}),
            [newId]: targetPageNum,
          },
        },
      });
      setActiveSectionId(newId);
      toast.success(`Duplicated "${originalLabel}" successfully!`);
    }
  };

  const handleRenameTitle = (newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setDocState({
      ...docState,
      title: trimmed,
    });

    if (project && docId) {
      const updatedDocs = (project.documents || []).map((d) =>
        d.id === docId ? { ...d, title: trimmed, lastModified: 'Just now' } : d
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
      }).catch((err) => console.error('Failed to update title:', err));
    }
  };

  const handleAddSectionItem = (newSection: CustomSectionItem) => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const customSections = [...(po.customSections || []), newSection];
      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          customSections,
        },
      });
      setActiveSectionId(newSection.id);
    } else if (docState.quotation) {
      const q = docState.quotation;
      const customSections = [...(q.customSections || []), newSection];
      setDocState({
        ...docState,
        quotation: {
          ...q,
          customSections,
        },
      });
      setActiveSectionId(newSection.id);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    if (docState.purchaseOrder) {
      const po = docState.purchaseOrder;
      const customSections = (po.customSections || []).filter((s) => s.id !== sectionId);
      setDocState({
        ...docState,
        purchaseOrder: {
          ...po,
          customSections,
        },
      });
      if (activeSectionId === sectionId) {
        setActiveSectionId('info');
      }
    } else if (docState.quotation) {
      const q = docState.quotation;
      const customSections = (q.customSections || []).filter((s) => s.id !== sectionId);
      setDocState({
        ...docState,
        quotation: {
          ...q,
          customSections,
        },
      });
      if (activeSectionId === sectionId) {
        setActiveSectionId('q_cover_info');
      }
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

  const handleSaveAndExit = async () => {
    const targetUrl = projectId && projectId !== 'default' ? `/project/${projectId}` : '/dashboard';

    if (!project) {
      router.push(targetUrl);
      return;
    }

    try {
      let updatedDocs = project.documents ? [...project.documents] : [];
      let updatedDocument = project.document || docState;

      if (docId && updatedDocs.length > 0) {
        updatedDocs = updatedDocs.map((d) =>
          d.id === docId
            ? { ...d, document: docState, title: docState.title, lastModified: 'Just now' }
            : d
        );
        if (project.document?.id === docId) {
          updatedDocument = docState;
        }
      } else {
        updatedDocument = docState;
      }

      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: updatedDocument,
          documents: updatedDocs,
          title: project.title,
          lastModified: 'Just now by You',
        }),
      });

      router.push(targetUrl);
    } catch (err) {
      console.error('Save & Exit error:', err);
      router.push(targetUrl);
    }
  };

  if (loading || !project) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <Loader size={48} className="text-[#0d3479]" />
      </div>
    );
  }

  const isInvoice = !!docState.taxInvoice || docState.id === 'tax_invoice' || !!(docState.purchaseOrder as any)?.invoiceNumber;
  const templateId = docState.quotation ? 'quotation' : docState.purchaseOrder ? 'labour_po' : undefined;

  return (
    <div className="app-shell flex flex-col h-screen w-full text-black font-sans overflow-hidden">
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
          isExporting={isExporting}
          isRecompiling={isRecompiling}
          onRecompile={handleRecompile}
          onGoBackToDashboard={() => router.push(`/project/${projectId}`)}
          onSaveAndExit={handleSaveAndExit}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRenameTitle={handleRenameTitle}
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
            activeTab={railTab}
            setActiveTab={(tab) => {
              setRailTab(tab);
              if (tab === 'variables') {
                setIsGlobalVarsOpen(true);
              }
              if (tab === 'settings') setIsSettingsOpen(true);
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGlobalVariables={() => setIsGlobalVarsOpen(true)}
            onOpenLatexCode={() => setIsLatexCodeModalOpen(true)}
            onOpenAddSection={() => setIsAddSectionModalOpen(true)}
            onOpenWatermark={() => setIsWatermarkModalOpen(true)}
            isInvoice={isInvoice}
            onGoBackToDashboard={() => router.push(`/project/${projectId}`)}
          />
        </div>

        <div className="flex flex-1 overflow-hidden print:overflow-visible">
          {railTab === 'filetree' && !isInvoice && (
            <div className="print:hidden shrink-0 h-full">
              <FileTreeSidebar
                document={docState}
                activeSectionId={activeSectionId}
                onSelectSection={(id) => {
                  setActiveSectionId(id);
                  setRailTab('filetree');
                }}
                onAddPage={handleAddPage}
                onAddSectionItem={handleAddSectionItem}
                onDeletePage={handleDeletePage}
                onDeleteSection={handleDeleteSection}
                onDuplicateSection={handleDuplicateSection}
                onReorderSections={handleReorderSections}
                onMoveSectionToPage={handleMoveSectionToPage}
                onMoveSectionUp={handleMoveSectionUp}
                onMoveSectionDown={handleMoveSectionDown}
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
              className={`hidden md:block w-[1px] hover:w-1 hover:bg-[#0d3479] bg-[#cccccc] cursor-col-resize h-full shrink-0 transition-all z-20 print:hidden ${
                isDragging ? 'bg-[#0d3479] w-1' : ''
              }`}
            />

            {/* PDF Live compilation Preview Panel */}
            <div className="flex-1 h-full min-w-[320px] overflow-hidden relative print:overflow-visible print:w-full print:absolute print:inset-0 print:z-50 print:bg-white">
              <DocumentPreview
                document={docState}
                companyProfile={project?.companyProfile}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                activeSectionId={isExporting ? '' : activeSectionId}
                hoveredSectionId={isExporting ? null : hoveredSectionId}
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

      {project && (
        <ProjectSettingsModal
          isOpen={isSettingsOpen || isGlobalVarsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setIsGlobalVarsOpen(false);
          }}
          project={project}
          activeDoc={docState}
          onSaveProjectSettings={(updatedProject, syncToDocs) => {
            let finalProject = { ...updatedProject };
            if (syncToDocs) {
              const syncedDocs = syncProjectMasterToDocuments(finalProject);
              finalProject.documents = syncedDocs;

              // Also sync current active document state in editor live
              const activeDocUpdated =
                (docId ? syncedDocs.find((d) => d.id === docId) : null) ||
                syncedDocs.find((d) => d.id === docState.id) ||
                syncedDocs[0];
              if (activeDocUpdated?.document) {
                setDocState(activeDocUpdated.document);
              }
            }
            finalProject.lastModified = 'Just now by You';
            setProject(finalProject);

            fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...finalProject,
                document: finalProject.documents?.[0]?.document || finalProject.document,
              }),
            }).catch(console.error);

            setIsSettingsOpen(false);
            setIsGlobalVarsOpen(false);
          }}
        />
      )}

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
          onCreateDocument={(docType: ProjectDocType, customTitle?: string, customNumber?: string, customAmount?: string, documentFields?: Record<string, string>) => {
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
            
            const updatedDocs = [...(project.documents || []), docItem];
            
            setProject({
              ...project,
              documents: updatedDocs,
              document: docItem.document,
            });
            
            fetch(`/api/projects/${projectId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                documents: updatedDocs,
                document: docItem.document,
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

      {/* Add Section Modal Triggered from Rail */}
      {isAddSectionModalOpen && (
        <AddSectionModal
          isOpen={true}
          onClose={() => setIsAddSectionModalOpen(false)}
          targetPageNum={1}
          groupTitle="Select Section Preset"
          templateId={docState.quotation ? 'quotation' : docState.purchaseOrder ? 'labour_po' : undefined}
          onAddSectionItem={(newSection) => {
            handleAddSectionItem(newSection);
            setIsAddSectionModalOpen(false);
          }}
        />
      )}

      {/* Watermark & Media Modal */}
      <WatermarkModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        config={docState.settings?.watermark}
        onSave={(updatedWatermark) => {
          const updatedDoc: LatexDocument = {
            ...docState,
            settings: {
              ...(docState.settings || ({} as any)),
              watermark: updatedWatermark,
            },
          };
          setDocState(updatedDoc);
          toast.success('Watermark settings applied successfully.');
        }}
      />

      {/* Confirm Modal */}
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
    </div>
  );
}
