export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  imageUrl?: string;
  imagePublicId?: string;
  active: boolean;
  createdAt: number;
}
