export type MenuItem = {
  _id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured: boolean;
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

