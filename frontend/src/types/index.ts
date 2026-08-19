export type Role = 'ADMIN' | 'WORKER';

export type PaymentMode = 'CASH' | 'UPI' | 'CARD';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
  _count?: {
    orders?: number;
  };
}

export interface Category {
  id: number;
  name: string;
  _count?: {
    items: number;
  };
}

export interface Item {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  price: number | string;
  unit: string; // scoop, piece, glass, slice, tub
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  itemId: number;
  item: Item;
  quantity: number;
  unitPrice: number | string;
}

export interface Order {
  id: string;
  orderNumber: string;
  cashierId: string;
  cashier: {
    id: string;
    name: string;
    username: string;
    role?: Role;
  };
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  paymentMode: PaymentMode;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalTax: number;
  totalSubtotal: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
}

export interface PaymentModeSummary {
  CASH: { count: number; total: number };
  UPI: { count: number; total: number };
  CARD: { count: number; total: number };
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface TopSellingItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  unit: string;
}

export interface CashierPerformance {
  id: string;
  name: string;
  username: string;
  ordersCount: number;
  totalRevenue: number;
}

export interface SalesReportData {
  meta: {
    period: 'daily' | 'monthly' | 'yearly';
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
  summary: SalesReportSummary;
  paymentModes: PaymentModeSummary;
  chartData: ChartDataPoint[];
  topSellingItems: TopSellingItem[];
  cashierPerformance: CashierPerformance[];
  recentOrders: Order[];
}
