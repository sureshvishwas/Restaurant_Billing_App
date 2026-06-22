export type User = {
  id: string;
  name: string;
  email: string;
};

export type MenuItem = {
  _id: string;
  name: string;
  price: number;
  taxRate: number;
  category: string;
  image?: string;
};

export type BillItem = {
  menuItem: string;
  name: string;
  price: number;
  taxRate: number;
  quantity: number;
};

export type TableBill = {
  tableNumber: number;
  customerMobile: string;
  items: BillItem[];
  paid: boolean;
};

export type PaymentSetting = {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  qrImage?: string;
};

export type Order = {
  _id: string;
  tableNumber: number;
  customerName: string;
  customerMobile?: string;
  items: BillItem[];
  paymentMethod: "cash" | "qr" | "card";
  subtotal: number;
  tax: number;
  total: number;
  status: "paid";
  createdAt: string;
};
