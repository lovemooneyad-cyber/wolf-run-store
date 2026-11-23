export type SneakerSize = 41 | 42 | 43 | 44 | 45 | 46;

export type SneakerCategory = 'الكل' | 'كوتشيات فردي' | 'العروض والباقات';

export type PriceSortOrder = 'default' | 'price-asc' | 'price-desc';

export interface BundlePiece {
  id: string;
  label: string;
  availableSizes: SneakerSize[];
}

export interface Sneaker {
  id: string;
  name: string;
  arabicTagline: string;
  category: Exclude<SneakerCategory, 'الكل'>;
  price: number;
  originalPrice?: number;
  savingsNote?: string;
  availableSizes: SneakerSize[];
  bundleItems?: BundlePiece[];
  colorway: string;
  material: string;
  soleTech: string;
  image: string;
  description: string;
  availabilityNote?: string;
}

export interface CartItem {
  key: string;
  sneaker: Sneaker;
  size: SneakerSize;
  bundleSizes?: Record<string, SneakerSize>;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  governorate: string;
  address: string;
  notes: string;
}
