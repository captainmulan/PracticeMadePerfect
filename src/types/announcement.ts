export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
  isActive: boolean;
  sortOrder?: number;
}
