export interface Club {
  id?: number;
  name: string;
  region?: string;
  address?: string;
  contact?: string;
  manager?: string;
  affiliationDate?: string;
  swimmers?: unknown[];
}

export interface ClubJoinRequest {
  id: number;
  swimmerId: number;
  swimmerName: string;
  swimmerEmail: string;
  clubId: number;
  clubName: string;
  clubRegion: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedAt: string;
}
