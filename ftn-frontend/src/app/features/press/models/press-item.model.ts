export type PressType = 
  | 'ARTICLE' 
  | 'VIDEO' 
  | 'PHOTO' 
  | 'COMMUNIQUE'
  | 'COMPETITIONS' 
  | 'RESULTS' 
  | 'OFFICIAL_COMMUNICATIONS' 
  | 'NATIONAL_SELECTIONS' 
  | 'TRAININGS' 
  | 'FEDERAL_EVENTS';

export type PressStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';

export interface PressItem {
  idPressItem?: number;
  title: string;
  content: string;
  mediaUrl?: string;
  linkUrl?: string;
  discipline: string;
  type: PressType;
  status?: PressStatus;
  publishedAt?: string;
  createdAt?: string;
  
  summary?: string;
  author?: string;
  views?: number;
  scheduledAt?: string;
  importance?: string;
  readTime?: number;
  downloadsCount?: number;
  gallery?: string;
  documents?: string;
}
