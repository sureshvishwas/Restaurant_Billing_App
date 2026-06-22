import { Printer, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Receipt } from "../components/Receipt";
import { StatusMessage } from "../components/StatusMessage";
import { currency } from "../hooks/useTotals";
import { orderApi } from "../services/api";
import type { Order } from "../types";

export const HistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [message, setMessage] = useState("");

  const load = () => orderApi.list().then(({ data }) => setOrders(data));

  useEffect(() => {
    load();
  }, []);

  const clear = async () => {
    await orderApi.clear();
    setSelected(null);
    setMessage("Order history cleared");
    await load();
  };

  const printOrder = (order: Order) => {
    setSelected(order);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Order history</h2>
          <p className="text-sm text-white/55">Completed paid orders are saved automatically.</p>
        </div>
        <button onClick={clear} className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-coral px-3 text-coral">
          <Trash2 size={17} />
          Clear history
        </button>
      </div>
      <StatusMessage message={message} />
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="hidden grid-cols-[70px_minmax(0,1fr)_90px_110px_70px] gap-3 border-b border-line px-4 py-3 text-sm text-white/55 lg:grid xl:grid-cols-[90px_minmax(0,1fr)_140px_140px_110px]">
          <span>Table</span>
          <span>Customer</span>
          <span>Payment</span>
          <span>Total</span>
          <span>Receipt</span>
        </div>
        {orders.map((order) => (
          <article key={order._id} className="grid gap-3 border-b border-line px-3 py-4 sm:px-4 lg:grid-cols-[70px_minmax(0,1fr)_90px_110px_70px] lg:items-center xl:grid-cols-[90px_minmax(0,1fr)_140px_140px_110px]">
            <div>
              <span className="text-xs uppercase text-white/45 lg:hidden">Table</span>
              <p className="font-semibold">#{order.tableNumber}</p>
            </div>
            <div className="min-w-0">
              <span className="text-xs uppercase text-white/45 lg:hidden">Customer</span>
              <p>{order.customerName || "Walk-in customer"}</p>
              {order.customerMobile && <p className="text-sm text-white/50">Mobile: {order.customerMobile}</p>}
              <p className="text-sm text-white/50">{new Date(order.createdAt).toLocaleString()}</p>
              <p className="break-words text-sm text-white/50">{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-white/45 lg:hidden">Payment</span>
              <p className="uppercase text-mint">{order.paymentMethod}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-white/45 lg:hidden">Total</span>
              <p className="font-bold">{currency(order.total)}</p>
            </div>
            <button onClick={() => printOrder(order)} className="grid h-9 w-9 place-items-center rounded-md border border-line" title="Print receipt">
              <Printer size={16} />
            </button>
          </article>
        ))}
        {!orders.length && <p className="p-5 text-sm text-white/55">No paid orders yet.</p>}
      </div>
      {selected && (
        <div className="absolute -left-[9999px] top-0">
          <Receipt order={selected} />
        </div>
      )}
    </div>
  );
};
