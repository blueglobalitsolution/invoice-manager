'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectItem, CompanyProfile } from '@/types/project';
import { CompanyProfileEditor } from '@/components/CompanyProfileEditor';
import { CompanyProfilePreview } from '@/components/CompanyProfilePreview';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const defaultProfile: CompanyProfile = {
  companyName: '',
  companySubtitle: '',
  companyAddressHeader: '',
  companyAddressFooter: '',
  companyGstNo: '',
  companyPanNo: '',
  companyEpfNo: '',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  leftServices: [],
  rightServices: [],
};

export default function CompanyProfilePage() {
  const { projectId } = useParams() as { projectId: string };
  const router = useRouter();
  
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile);
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
        if (data.companyProfile) {
          setProfile(data.companyProfile);
        }
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
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyProfile: profile,
          lastModified: 'Just now by You',
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      // Briefly show success or redirect back
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
