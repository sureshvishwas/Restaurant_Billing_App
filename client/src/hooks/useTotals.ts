import type { BillItem } from "../types";

export const getTotals = (items: BillItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = items.reduce((sum, item) => sum + item.price * item.quantity * ((item.taxRate || 0) / 100), 0);
  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
};

export const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
