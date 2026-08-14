export interface ManagingCommitteeMember {
  documentId: string;
  name: string;
  slug: string;
  role: string | null;
  diocese: string | null;
  parish: string | null;
  serialNumber: number | null;
  order: number;
  isCurrent: boolean;
  termYear: number | null;
  notes: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
}

export interface ManagingCommitteeMembersListResult {
  members: ManagingCommitteeMember[];
  pagination: {
    page: number;
    pageCount: number;
    pageSize: number;
    total: number;
  };
}

export interface ManagingCommitteeMembersListOptions {
  nameSearch?: string;
  termYear?: number;
  isCurrent?: boolean;
  page?: number;
  pageSize?: number;
  loadAll?: boolean;
}
