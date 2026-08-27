'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectItem, CompanyProfile, DEFAULT_COMPANY_PROFILE } from '@/types/project';
import { CompanyProfileEditor } from '@/components/CompanyProfileEditor';
import { CompanyProfilePreview } from '@/components/CompanyProfilePreview';
import { syncProjectMasterToDocuments } from '@/lib/project-doc-templates';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function CompanyProfilePage() {
  const { projectId } = useParams() as { projectId: string };
  const router = useRouter();
  
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch project');
        return res.json();
      })
      .then((data: ProjectItem) => {
        setProject(data);
        const activeDoc = data.documents?.[0]?.document || data.document;
        const activePO = activeDoc?.purchaseOrder;
        const activeQ = activeDoc?.quotation;
        const activeTax = activeDoc?.taxInvoice;

        const mergedProfile: CompanyProfile = {
          companyName:
            data.companyProfile?.companyName ||
            activePO?.tableCompanyName ||
            activePO?.companyName ||
            activeQ?.companyName ||
            activeTax?.companyName ||
            DEFAULT_COMPANY_PROFILE.companyName,
          companySubtitle:
            data.companyProfile?.companySubtitle !== undefined && data.companyProfile.companySubtitle !== ''
              ? data.companyProfile.companySubtitle
              : activePO?.tableCompanySubtitle ||
                activePO?.companySubtitle ||
                activeQ?.companySubtitle ||
                activeTax?.companySubtitle ||
                DEFAULT_COMPANY_PROFILE.companySubtitle,
          companyAddressHeader:
            data.companyProfile?.companyAddressHeader ||
            (activePO?.tableCompanyAddress || activePO?.companyAddress
              ? (activePO.tableCompanyAddress || activePO.companyAddress).join('\n')
              : '') ||
            activeQ?.companyAddressHeader ||
            activeTax?.companyAddressHeader ||
            DEFAULT_COMPANY_PROFILE.companyAddressHeader,
          companyAddressFooter:
            data.companyProfile?.companyAddressFooter ||
            activePO?.companyAddressFooter ||
            activeQ?.companyAddressFooter ||
            activeTax?.companyAddressFooter ||
            DEFAULT_COMPANY_PROFILE.companyAddressFooter,
          companyGstNo:
            data.companyProfile?.companyGstNo ||
            activePO?.gstNo ||
            activeQ?.companyGstNo ||
            activeTax?.companyGstNo ||
            DEFAULT_COMPANY_PROFILE.companyGstNo,
          companyPanNo:
            data.companyProfile?.companyPanNo ||
            activeTax?.companyPanNo ||
            DEFAULT_COMPANY_PROFILE.companyPanNo,
          companyEpfNo:
            data.companyProfile?.companyEpfNo ||
            activeTax?.companyEpfNo ||
            DEFAULT_COMPANY_PROFILE.companyEpfNo,
          companyPhone:
            data.companyProfile?.companyPhone ||
            activePO?.companyPhone ||
            activeQ?.companyPhone ||
            activeTax?.companyPhone ||
            DEFAULT_COMPANY_PROFILE.companyPhone,
          companyEmail:
            data.companyProfile?.companyEmail ||
            activePO?.companyEmail ||
            activeQ?.companyEmail ||
            activeTax?.companyEmail ||
            DEFAULT_COMPANY_PROFILE.companyEmail,
          companyWebsite:
            data.companyProfile?.companyWebsite ||
            activePO?.companyWebsite ||
            activeQ?.companyWebsite ||
            activeTax?.companyWebsite ||
            DEFAULT_COMPANY_PROFILE.companyWebsite,
          leftServices:
            data.companyProfile?.leftServices && data.companyProfile.leftServices.length > 0
              ? data.companyProfile.leftServices
              : activePO?.leftServices ||
                activeQ?.leftServices ||
                activeTax?.leftServices ||
                DEFAULT_COMPANY_PROFILE.leftServices,
          rightServices:
            data.companyProfile?.rightServices && data.companyProfile.rightServices.length > 0
              ? data.companyProfile.rightServices
              : activePO?.rightServices ||
                activeQ?.rightServices ||
                activeTax?.rightServices ||
                DEFAULT_COMPANY_PROFILE.rightServices,
        };

        setProfile(mergedProfile);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [projectId]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      const updatedProject: ProjectItem = {
        ...project,
        companyProfile: profile,
        lastModified: 'Just now by You',
      };
      const syncedDocs = syncProjectMasterToDocuments(updatedProject);
      updatedProject.documents = syncedDocs;
      if (syncedDocs[0]?.document) {
        updatedProject.document = syncedDocs[0].document;
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject),
      });
      if (!res.ok) throw new Error('Failed to save');
      // Redirect back to project detail view
      router.push(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f18]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a0f18] text-gray-200">
      {/* Top Header */}
      <header className="h-14 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/project/${projectId}`)}
            className="p-1.5 hover:bg-gray-800 text-gray-400 hover:text-white rounded transition-colors"
            title="Back to Project"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-sm font-semibold text-white flex items-center space-x-2">
              <span className="uppercase tracking-wider text-xs text-emerald-500">Project / {project?.code}</span>
              <span className="text-gray-500">|</span>
              <span>Company Profile (Header & Footer)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Saving...' : 'Save to Project'}</span>
          </button>
        </div>
      </header>

      {/* Split View Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Inputs */}
        <div className="w-1/2 lg:w-5/12 xl:w-1/3 border-r border-gray-800 overflow-y-auto custom-scrollbar">
          <CompanyProfileEditor profile={profile} onChange={setProfile} />
        </div>
        
        {/* Right: PDF Preview */}
        <div className="flex-1 bg-[#0a0f18] relative overflow-hidden flex flex-col">
          <CompanyProfilePreview profile={profile} />
        </div>
      </div>
    </div>
  );
}
