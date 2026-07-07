export type MenuItem = {
  _id?: string;
  name: string;
  nameBn?: string;
  description: string;
  descriptionBn?: string;
  category: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular?: boolean;
  stockQuantity?: number;
  variations?: Array<{
    _id: string;
    name: { en: string; bn?: string };
    price: number;
    stockQuantity: number;
    isAvailable: boolean;
  }>;
  addOns?: Array<{
    _id: string;
    name: { en: string; bn?: string };
    price: number;
    stockQuantity: number;
    isAvailable: boolean;
  }>;
};

export type MenuItemsResponse = {
  items: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
