export type PressType = 'ARTICLE' | 'VIDEO' | 'PHOTO' | 'COMMUNIQUE';
export type PressStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';

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
}
