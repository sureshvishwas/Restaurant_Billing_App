import { Edit, ImageOff, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { StatusMessage } from "../components/StatusMessage";
import { assetUrl, menuApi } from "../services/api";
import type { MenuItem } from "../types";
import { currency } from "../hooks/useTotals";

const foodCategories = ["Mains", "Starters", "Sides", "Drinks", "Desserts", "Soups", "Salads", "Rice", "Breads", "Specials"];

export const MenuPage = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState({ name: "", price: "", taxRate: "", category: "" });
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => menuApi.list().then(({ data }) => setItems(data));

  useEffect(() => {
    load().catch(() => setError("Could not load menu items"));
  }, []);

  const startEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({ name: item.name, price: String(item.price), taxRate: String(item.taxRate || 0), category: item.category });
    setImage(null);
    setRemoveImage(false);
  };

  const reset = () => {
    setEditing(null);
    setForm({ name: "", price: "", taxRate: "", category: "" });
    setImage(null);
    setRemoveImage(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const data = new FormData();
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("taxRate", form.taxRate || "0");
    data.append("category", form.category);
    if (image) data.append("image", image);
    if (editing && removeImage && !image) data.append("image", "");

    try {
      if (editing) {
        await menuApi.update(editing._id, data);
        setMessage("Menu item updated");
      } else {
        await menuApi.create(data);
        setMessage("Menu item added");
      }
      reset();
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not save menu item");
    }
  };

  const remove = async (id: string) => {
    await menuApi.remove(id);
    setMessage("Menu item deleted");
    await load();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
      <form onSubmit={submit} className="h-fit space-y-4 rounded-lg border border-line bg-panel p-3 sm:p-4 xl:sticky xl:top-28">
        <h2 className="text-xl font-bold">{editing ? "Edit menu item" : "Add menu item"}</h2>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
          required
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Tax rate (%)"
          value={form.taxRate}
          onChange={(event) => setForm({ ...form, taxRate: event.target.value })}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
        />
        <select
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
          required
        >
          <option value="">Select category</option>
          {foodCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            setImage(event.target.files?.[0] || null);
            setRemoveImage(false);
          }}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm"
        />
        {editing?.image && !removeImage && !image && (
          <div className="rounded-md border border-line bg-ink p-2">
            <div className="aspect-[16/10] overflow-hidden rounded-md bg-panel">
              <img src={assetUrl(editing.image)} alt={editing.name} className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-coral px-3 text-coral"
            >
              <ImageOff size={17} />
              Remove food image
            </button>
          </div>
        )}
        {editing && removeImage && !image && (
          <p className="rounded-md border border-coral/50 bg-coral/10 px-3 py-2 text-sm text-red-100">
            Current food image will be removed after saving.
          </p>
        )}
        {editing && image && (
          <p className="rounded-md border border-mint/50 bg-mint/10 px-3 py-2 text-sm text-emerald-100">
            New image selected. Saving will replace the current food image.
          </p>
        )}
        <StatusMessage message={message} />
        <StatusMessage message={error} tone="error" />
        <div className="flex gap-2">
          <button className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-mint font-semibold text-ink">
            <Plus size={17} />
            Save
          </button>
          {editing && (
            <button type="button" onClick={reset} className="h-10 rounded-md border border-line px-3">
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => (
          <article key={item._id} className="rounded-lg border border-line bg-panel p-3">
            <div className="aspect-[4/3] overflow-hidden rounded-md bg-ink min-[480px]:aspect-[16/10] lg:aspect-[16/9] xl:aspect-[16/10]">
              {item.image ? (
                <img
                  src={assetUrl(item.image)}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/40">{item.category}</div>
              )}
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words font-semibold">{item.name}</h3>
                <p className="text-sm text-white/55">
                  {item.category} - Tax {item.taxRate || 0}%
                </p>
              </div>
              <span className="shrink-0 font-bold text-mint">{currency(item.price)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => startEdit(item)} className="grid h-9 w-9 place-items-center rounded-md border border-line" title="Edit item">
                <Edit size={16} />
              </button>
              <button onClick={() => remove(item._id)} className="grid h-9 w-9 place-items-center rounded-md border border-coral text-coral" title="Delete item">
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
