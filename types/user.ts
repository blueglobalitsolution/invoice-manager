export type UserRole = 'Admin' | 'Project Manager' | 'Estimator' | 'Billing Specialist' | 'Viewer';

export type UserStatus = 'Active' | 'Pending' | 'Inactive';

export interface UserPermissions {
  canCreateDocs: boolean;
  canEditTemplates: boolean;
  canDeleteDocs: boolean;
  canExportPdf: boolean;
  canManageUsers: boolean;
}

export interface UserMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  lastActive: string;
  avatarColor: string;
  phone?: string;
  permissions: UserPermissions;
}

export const DEFAULT_USERS: UserMember[] = [
  {
    id: 'usr_1',
    name: 'Mohammad Kamil Shaikh',
    email: 'kamil@globalindustries.co',
    role: 'Admin',
    department: 'Executive / Civil Contracts',
    status: 'Active',
    lastActive: 'Just now',
    avatarColor: 'bg-emerald-600',
    phone: '+91 97254 45370',
    permissions: {
      canCreateDocs: true,
      canEditTemplates: true,
      canDeleteDocs: true,
      canExportPdf: true,
      canManageUsers: true,
    },
  },
  {
    id: 'usr_2',
    name: 'Rajesh Patel',
    email: 'rajesh.p@globalindustries.co',
    role: 'Project Manager',
    department: 'Site Operations & PEB',
    status: 'Active',
    lastActive: '2 hours ago',
    avatarColor: 'bg-blue-600',
    phone: '+91 98250 11223',
    permissions: {
      canCreateDocs: true,
      canEditTemplates: true,
      canDeleteDocs: false,
      canExportPdf: true,
      canManageUsers: false,
    },
  },
  {
    id: 'usr_3',
    name: 'Priya Sharma',
    email: 'priya.s@globalindustries.co',
    role: 'Estimator',
    department: 'Tendering & Cost Estimation',
    status: 'Active',
    lastActive: 'Yesterday',
    avatarColor: 'bg-amber-600',
    phone: '+91 99044 55667',
    permissions: {
      canCreateDocs: true,
      canEditTemplates: false,
      canDeleteDocs: false,
      canExportPdf: true,
      canManageUsers: false,
    },
  },
  {
    id: 'usr_4',
    name: 'Amitabh Verma',
    email: 'amitabh.v@globalindustries.co',
    role: 'Billing Specialist',
    department: 'Accounts & Finance',
    status: 'Active',
    lastActive: '3 days ago',
    avatarColor: 'bg-purple-600',
    phone: '+91 94260 88990',
    permissions: {
      canCreateDocs: true,
      canEditTemplates: false,
      canDeleteDocs: false,
      canExportPdf: true,
      canManageUsers: false,
    },
  },
  {
    id: 'usr_5',
    name: 'Suresh Parmar',
    email: 'suresh.site@globalindustries.co',
    role: 'Viewer',
    department: 'Quality & Safety Audit',
    status: 'Pending',
    lastActive: 'Never',
    avatarColor: 'bg-teal-600',
    phone: '+91 97123 44556',
    permissions: {
      canCreateDocs: false,
      canEditTemplates: false,
      canDeleteDocs: false,
      canExportPdf: true,
      canManageUsers: false,
    },
  },
];
