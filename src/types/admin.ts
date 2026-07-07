export type AdminRole = {
  id: string;
  name: string;
  permissions: string[];
  isSystemOwner: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole | null;
};

export type AdminLoginResponse = {
  token: string;
  user: AdminUser;
};

export type AdminDashboardResponse = {
  modules: string[];
  nextPhase?: string;
  totalOrders?: number;
  pendingOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalSales?: number;
  refundedSales?: number;
  pendingPaymentOrders?: number;
  paidOrders?: number;
  bestSelling?: Array<{ _id: string; quantity: number; sales: number }>;
  newOrders?: Array<{ orderId: string; customerName: string; phone: string; grandTotal: number }>;
};

export type AdminSettings = {
  restaurantName: {
    en: string;
    bn: string;
  };
  acceptingOrders: boolean;
  stockDecreaseTrigger: "Pending" | "Confirmed" | "Preparing";
  currency: string;
};
