'use client';

import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Eye, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface VersionEntry {
  id: number;
  documentId: string;
  projectId: string;
  versionNumber: number;
  savedAt: string;
  savedBy: string;
}

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  documentId: string;
  onRestore: (versionId: number) => void;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  isOpen,
  onClose,
  projectId,
  documentId,
  onRestore,
}) => {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !documentId) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}/versions?docId=${documentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVersions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch versions error:', err);
        setLoading(false);
      });
  }, [isOpen, projectId, documentId]);

  const handlePreview = (versionId: number) => {
    if (expandedId === versionId) {
      setExpandedId(null);
      setPreviewData(null);
      return;
    }
    setExpandedId(versionId);
    setPreviewLoading(true);
    fetch(`/api/projects/${projectId}/versions?docId=${documentId}&versionId=${versionId}`)
      .then((res) => res.json())
      .then((data) => {
        setPreviewData(data);
        setPreviewLoading(false);
      })
      .catch(() => setPreviewLoading(false));
  };

  const handleRestore = async (versionId: number) => {
    if (!confirm('Are you sure you want to restore this version? Your current changes will be saved as a new version.')) return;
    setRestoringId(versionId);
    try {
      await fetch(`/api/projects/${projectId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: documentId, versionId }),
      });
      onRestore(versionId);
    } catch (err) {
      console.error('Restore version error:', err);
    }
    setRestoringId(null);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-[#0d3479]/5 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0d3479] flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Version History</h2>
              <p className="text-[11px] text-gray-500">{versions.length} saved versions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-[#0d3479] animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No versions yet</p>
              <p className="text-xs text-gray-500 mt-1">Versions are created automatically when you save changes.</p>
            </div>
          ) : (
            versions.map((v, i) => (
              <div
                key={v.id}
                className={`rounded-2xl border transition-all ${
                  expandedId === v.id
                    ? 'border-[#0d3479]/30 bg-[#0d3479]/[0.03] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-[#0d3479] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      v{v.versionNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {i === 0 ? 'Latest saved version' : `Version ${v.versionNumber}`}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(v.savedAt)}</span>
                        <span className="text-gray-300">•</span>
                        <span>{v.savedBy}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handlePreview(v.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                      title="Preview"
                    >
                      {expandedId === v.id ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRestore(v.id)}
                      disabled={restoringId !== null}
                      className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-700 transition-colors cursor-pointer disabled:opacity-50"
                      title="Restore this version"
                    >
                      {restoringId === v.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview Expanded */}
                {expandedId === v.id && (
                  <div className="px-3.5 pb-3.5 border-t border-gray-100 pt-3">
                    {previewLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 text-[#0d3479] animate-spin" />
                      </div>
                    ) : previewData?.document ? (
                      <div className="space-y-2 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Title:</span>
                          <span className="font-medium text-gray-900 truncate ml-2">{previewData.document.title || '—'}</span>
                        </div>
                        {previewData.document.purchaseOrder && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium text-blue-700">Purchase Order</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Contractor:</span>
                              <span className="font-medium text-gray-900 truncate ml-2">{previewData.document.purchaseOrder.contractorName || '—'}</span>
                            </div>
                          </>
                        )}
                        {previewData.document.quotation && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium text-blue-700">Quotation</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Ref:</span>
                              <span className="font-medium text-gray-900 truncate ml-2">{previewData.document.quotation.refNo || '—'}</span>
                            </div>
                          </>
                        )}
                        {previewData.document.taxInvoice && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium text-blue-700">Tax Invoice</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Invoice No:</span>
                              <span className="font-medium text-gray-900 truncate ml-2">{previewData.document.taxInvoice.invoiceNo || '—'}</span>
                            </div>
                          </>
                        )}
                        <button
                          onClick={() => handleRestore(v.id)}
                          disabled={restoringId !== null}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-[#0d3479] text-white text-xs font-semibold hover:bg-[#0a2a5c] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore Version {v.versionNumber}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-2">No preview available</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
