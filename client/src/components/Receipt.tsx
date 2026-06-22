import type { Order } from "../types";
import { currency } from "../hooks/useTotals";

export const Receipt = ({ order }: { order: Order }) => (
  <div id="receipt-print" className="w-full max-w-md rounded-lg border border-line bg-white p-4 text-ink sm:p-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold">BillFast Restaurant</h2>
      <p className="text-sm text-black/60">{new Date(order.createdAt).toLocaleString()}</p>
    </div>
    <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
      <span>Table</span>
      <strong className="text-right">#{order.tableNumber}</strong>
      <span>Customer</span>
      <strong className="text-right">{order.customerName || "Walk-in"}</strong>
      {order.customerMobile && (
        <>
          <span>Mobile</span>
          <strong className="text-right">{order.customerMobile}</strong>
        </>
      )}
      <span>Status</span>
      <strong className="text-right uppercase">{order.status}</strong>
    </div>
    <div className="mt-5 space-y-2 border-y border-black/15 py-4">
      {order.items.map((item) => (
        <div key={`${item.menuItem}-${item.name}`} className="flex justify-between gap-3 text-sm">
          <span className="min-w-0 break-words">
            {item.name} x {item.quantity}
          </span>
          <span className="shrink-0">{currency(item.price * item.quantity)}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 space-y-1 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{currency(order.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax</span>
        <span>{currency(order.tax)}</span>
      </div>
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{currency(order.total)}</span>
      </div>
    </div>
  </div>
);
