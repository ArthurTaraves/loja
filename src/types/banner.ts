export interface Banner {
  id: string;
  imageDesktopUrl: string;
  imageDesktopPublicId: string;
  imageMobileUrl?: string;
  imageMobilePublicId?: string;
  link?: string;
  order: number;
  active: boolean;
  createdAt: number;
}
