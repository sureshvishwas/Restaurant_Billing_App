import { Minus, Plus, Printer, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Receipt } from "../components/Receipt";
import { StatusMessage } from "../components/StatusMessage";
import { assetUrl, gatewayApi, menuApi, orderApi, paymentApi } from "../services/api";
import type { BillItem, MenuItem, Order, PaymentSetting, TableBill } from "../types";
import { currency, getTotals } from "../hooks/useTotals";

const initialTables: TableBill[] = Array.from({ length: 4 }, (_, index) => ({
  tableNumber: index + 1,
  customerMobile: "",
  items: [],
  paid: false
}));

const defaultCategories = ["Mains", "Starters", "Sides", "Drinks", "Desserts", "Soups", "Salads", "Rice", "Breads", "Specials"];

export const BillingPage = () => {
  const [tables, setTables] = useState<TableBill[]>(initialTables);
  const [activeTable, setActiveTable] = useState(1);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentSetting, setPaymentSetting] = useState<PaymentSetting | null>(null);
  const [paymentMode, setPaymentMode] = useState<"cash" | "qr" | "card">("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [paidOrder, setPaidOrder] = useState<Order | null>(null);
  const [promptMessage, setPromptMessage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const promptTimer = useRef<number | null>(null);

  const table = tables.find((item) => item.tableNumber === activeTable) || tables[0];
  const totals = useMemo(() => getTotals(table.items), [table.items]);
  const change = Math.max(Number(cashReceived || 0) - totals.total, 0);
  const categories = useMemo(() => {
    const savedCategories = menu.map((item) => item.category).filter(Boolean);
    return ["All", ...Array.from(new Set([...defaultCategories, ...savedCategories]))];
  }, [menu]);
  const visibleMenu = useMemo(
    () => (selectedCategory === "All" ? menu : menu.filter((item) => item.category === selectedCategory)),
    [menu, selectedCategory]
  );

  useEffect(() => {
    Promise.all([menuApi.list(), paymentApi.get()])
      .then(([menuResponse, paymentResponse]) => {
        setMenu(menuResponse.data);
        setPaymentSetting(paymentResponse.data);
      })
      .catch(() => setError("Could not load billing data"));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("stripe_session_id");
    const cancelled = params.get("stripe_cancelled");
    const pendingOrder = sessionStorage.getItem("billfast_pending_card_order");

    if (cancelled) {
      setError("Card payment was cancelled");
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }

    if (!sessionId || !pendingOrder) return;

    gatewayApi
      .getStripeCheckoutSession(sessionId)
      .then(async ({ data }) => {
        if (data.paymentStatus !== "paid") {
          setError("Card payment was not completed");
          return;
        }

        const orderPayload = JSON.parse(pendingOrder);
        const response = await orderApi.create(orderPayload);
        setPaidOrder(response.data);
        updateTable(orderPayload.tableNumber, (current) => ({ ...current, paid: true }));
        setMessage("Card payment saved and order added to history");
        sessionStorage.removeItem("billfast_pending_card_order");
      })
      .catch(() => setError("Could not verify card payment"))
      .finally(() => window.history.replaceState({}, "", window.location.pathname));
  }, []);

  const showPrompt = (text: string) => {
    setPromptMessage(text);
    if (promptTimer.current) {
      window.clearTimeout(promptTimer.current);
    }
    promptTimer.current = window.setTimeout(() => setPromptMessage(""), 1800);
  };

  const updateTable = (tableNumber: number, updater: (table: TableBill) => TableBill) => {
    setTables((current) => current.map((item) => (item.tableNumber === tableNumber ? updater(item) : item)));
  };

  const addItem = (item: MenuItem) => {
    updateTable(activeTable, (current) => {
      const existing = current.items.find((billItem) => billItem.menuItem === item._id);
      const items = existing
        ? current.items.map((billItem) =>
            billItem.menuItem === item._id ? { ...billItem, quantity: billItem.quantity + 1 } : billItem
      )
        : [...current.items, { menuItem: item._id, name: item.name, price: item.price, taxRate: item.taxRate || 0, quantity: 1 }];
      return { ...current, items, paid: false };
    });
    showPrompt(`${item.name} added to Table ${activeTable}`);
  };

  const updateQty = (menuItem: string, quantity: number) => {
    updateTable(activeTable, (current) => ({
      ...current,
      paid: false,
      items: current.items.map((item) => (item.menuItem === menuItem ? { ...item, quantity } : item)).filter((item) => item.quantity > 0)
    }));
  };

  const clearBill = () => {
    updateTable(activeTable, (current) => ({ ...current, customerMobile: "", items: [], paid: false }));
    setPaidOrder(null);
    showPrompt(`Table ${activeTable} bill cleared`);
  };

  const completePayment = async (shouldPrint: boolean) => {
    setError("");
    if (!table.items.length) {
      setError("Add at least one item before payment");
      return;
    }
    if (paymentMode === "cash" && Number(cashReceived || 0) < totals.total) {
      setError("Cash received must cover the total");
      return;
    }

    const orderPayload = {
      tableNumber: table.tableNumber,
      customerName: "",
      customerMobile: table.customerMobile,
      items: table.items,
      paymentMethod: paymentMode,
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total
    };

    if (paymentMode === "card") {
      sessionStorage.setItem("billfast_pending_card_order", JSON.stringify(orderPayload));
      const { data } = await gatewayApi.createStripeCheckoutSession({
        tableNumber: table.tableNumber,
        items: table.items,
        total: totals.total
      });
      window.location.href = data.url;
      return;
    }

    const { data } = await orderApi.create(orderPayload);
    setPaidOrder(data);
    updateTable(activeTable, (current) => ({ ...current, paid: true }));
    setMessage("Payment saved and order added to history");
    if (shouldPrint) setTimeout(() => window.print(), 100);
  };

  return (
    <div className="min-w-0 space-y-6">
      {promptMessage && (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center px-4">
          <div className="rounded-lg border border-mint/60 bg-panel px-5 py-3 text-center text-sm font-semibold text-mint shadow-2xl shadow-black/40">
            {promptMessage}
          </div>
        </div>
      )}
      <div className="w-full min-w-0 overflow-hidden">
        <div className="flex w-full min-w-0 snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {tables.map((item) => (
          <button
            key={item.tableNumber}
            onClick={() => {
              setActiveTable(item.tableNumber);
              setPaidOrder(null);
              setMessage("");
              setError("");
            }}
            className={`w-32 shrink-0 snap-start rounded-lg border p-3 text-left transition min-[380px]:w-36 sm:w-44 sm:p-4 lg:w-auto ${
              activeTable === item.tableNumber ? "border-mint bg-mint text-ink" : "border-line bg-panel hover:border-white/40"
            }`}
          >
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <span className="whitespace-nowrap text-base font-bold sm:text-lg">Table {item.tableNumber}</span>
              <span className={`w-fit rounded-full px-2 py-1 text-xs ${item.paid ? "bg-emerald-500 text-ink" : "bg-amber text-ink"}`}>
                {item.paid ? "Paid" : "Unpaid"}
              </span>
            </div>
            <p className="mt-2 text-sm opacity-75">{item.items.length} items</p>
          </button>
        ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="min-w-0 space-y-4">
          <div className="w-full min-w-0 overflow-hidden">
            <div className="flex w-full min-w-0 snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  title={category}
                  className={`flex h-11 min-w-28 max-w-40 shrink-0 snap-start items-center justify-center rounded-lg border px-3 text-sm font-medium transition sm:min-w-32 ${
                    selectedCategory === category ? "border-mint bg-mint text-ink" : "border-line bg-panel text-white/75 hover:border-white/40"
                  }`}
                >
                  <span className="truncate">{category}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {visibleMenu.map((item) => (
              <button
                key={item._id}
                onClick={() => addItem(item)}
                className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-3 rounded-lg border border-line bg-panel p-2 text-left hover:border-mint min-[380px]:grid-cols-[96px_minmax(0,1fr)] min-[480px]:grid-cols-[112px_minmax(0,1fr)] sm:block sm:p-3"
              >
                <div className="aspect-square overflow-hidden rounded-md bg-ink sm:aspect-[16/10] lg:aspect-[16/9]">
                  {item.image ? (
                    <img
                      src={assetUrl(item.image)}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/45">{item.category}</div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col justify-between sm:mt-3 sm:block">
                  <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:justify-between sm:gap-3">
                    <span className="min-w-0 break-words text-sm font-semibold sm:text-base">{item.name}</span>
                    <span className="shrink-0 text-sm font-semibold text-mint sm:text-base">{currency(item.price)}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/45 sm:text-sm">Tax {item.taxRate || 0}%</p>
                </div>
              </button>
            ))}
            {!visibleMenu.length && (
              <p className="rounded-md border border-dashed border-line p-4 text-sm text-white/55 sm:col-span-2 xl:col-span-3">
                No menu items in this category.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-line bg-panel p-3 sm:p-4">
            <div className="mb-3 flex flex-col gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
              <h2 className="text-base font-semibold">Table {table.tableNumber} details</h2>
              <span className="text-sm text-white/55">{table.items.length} items</span>
            </div>
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <label className="block text-sm">
                <span className="text-white/65">Customer mobile (optional)</span>
                <input
                  type="tel"
                  value={table.customerMobile}
                  onChange={(event) => updateTable(activeTable, (current) => ({ ...current, customerMobile: event.target.value, paid: false }))}
                  className="mt-1 h-11 w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
                />
              </label>
              <button onClick={clearBill} className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-md border border-coral px-3 text-coral lg:w-auto">
                <Trash2 size={17} />
                Clear bill
              </button>
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-4 rounded-lg border border-line bg-panel p-3 sm:p-4 2xl:sticky 2xl:top-28 2xl:self-start">
          <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
            <h2 className="text-lg font-bold sm:text-xl">Table {table.tableNumber} bill</h2>
            <span className={`rounded-full px-2 py-1 text-xs ${table.paid ? "bg-emerald-500 text-ink" : "bg-amber text-ink"}`}>
              {table.paid ? "Paid" : "Unpaid"}
            </span>
          </div>
          <div className="space-y-3">
            {table.items.map((item: BillItem) => (
              <div key={item.menuItem} className="rounded-md border border-line bg-ink p-3">
                <div className="grid gap-2 min-[420px]:grid-cols-[minmax(0,1fr)_auto] min-[420px]:items-start">
                  <span className="min-w-0 break-words font-medium">{item.name}</span>
                  <span className="shrink-0 font-semibold text-mint">{currency(item.price * item.quantity)}</span>
                </div>
                <div className="mt-3 grid grid-cols-[40px_1fr_40px] items-center gap-2 min-[420px]:flex min-[420px]:w-fit">
                  <button onClick={() => updateQty(item.menuItem, item.quantity - 1)} className="grid h-10 w-10 place-items-center rounded-md border border-line">
                    <Minus size={16} />
                  </button>
                  <span className="text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.menuItem, item.quantity + 1)} className="grid h-10 w-10 place-items-center rounded-md border border-line">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
            {!table.items.length && <p className="rounded-md border border-dashed border-line p-4 text-sm text-white/55">No items added yet.</p>}
          </div>

          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex min-w-0 justify-between gap-3 text-white/70">
              <span>Subtotal</span>
              <span className="shrink-0">{currency(totals.subtotal)}</span>
            </div>
            <div className="flex min-w-0 justify-between gap-3 text-white/70">
              <span>Tax amount</span>
              <span className="shrink-0">{currency(totals.tax)}</span>
            </div>
            <div className="flex min-w-0 justify-between gap-3 text-xl font-bold">
              <span>Total</span>
              <span className="shrink-0">{currency(totals.total)}</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-line pt-4">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setPaymentMode("cash")} className={`h-10 rounded-md border ${paymentMode === "cash" ? "border-mint bg-mint text-ink" : "border-line"}`}>
                Cash
              </button>
              <button onClick={() => setPaymentMode("qr")} className={`h-10 rounded-md border ${paymentMode === "qr" ? "border-mint bg-mint text-ink" : "border-line"}`}>
                QR
              </button>
              <button onClick={() => setPaymentMode("card")} className={`h-10 rounded-md border ${paymentMode === "card" ? "border-mint bg-mint text-ink" : "border-line"}`}>
                Card
              </button>
            </div>
            {paymentMode === "cash" ? (
              <label className="block text-sm">
                <span className="text-white/65">Cash received</span>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                  className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
                />
                <span className="mt-1 block text-mint">Change: {currency(change)}</span>
              </label>
            ) : paymentMode === "qr" ? (
              <div className="rounded-md border border-line bg-ink p-3 text-sm">
                {paymentSetting?.qrImage && (
                  <img
                    src={assetUrl(paymentSetting.qrImage)}
                    alt="QR payment"
                    className="mb-3 aspect-square w-full max-w-40 rounded-md object-contain"
                  />
                )}
                <p>{paymentSetting?.bankName}</p>
                <p>{paymentSetting?.accountName}</p>
                <p>{paymentSetting?.accountNumber}</p>
                <p>{paymentSetting?.branchName}</p>
              </div>
            ) : (
              <div className="rounded-md border border-line bg-ink p-3 text-sm text-white/70">
                Card payment opens Stripe Checkout in a secure hosted page.
              </div>
            )}
            <StatusMessage message={message} />
            <StatusMessage message={error} tone="error" />
            <div className="grid gap-2 min-[420px]:grid-cols-2">
              <button onClick={() => completePayment(true)} className="flex h-11 items-center justify-center gap-2 rounded-md bg-mint font-semibold text-ink">
                <Printer size={17} />
                Confirm & print
              </button>
              <button onClick={() => completePayment(false)} className="h-11 rounded-md border border-mint font-semibold text-mint">
                Confirm only
              </button>
            </div>
          </div>
          {paidOrder && <Receipt order={paidOrder} />}
        </aside>
      </div>
    </div>
  );
};
