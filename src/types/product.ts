export interface ProductImage {
  url: string;
  publicId: string;
  order: number;
}

export interface VariationOption {
  label: string;
  stock: number;
}

export interface ProductVariation {
  name: string;
  options: VariationOption[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  images: ProductImage[];
  price: number;
  promoPrice?: number;
  variations?: ProductVariation[];
  stock?: number;
  featured: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}
