import { Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { StatusMessage } from "../components/StatusMessage";
import { assetUrl, paymentApi } from "../services/api";

export const PaymentSettingsPage = () => {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchName: "",
    editPassword: "",
    newEditPassword: ""
  });
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [currentQr, setCurrentQr] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    paymentApi.get().then(({ data }) => {
      setForm((current) => ({
        ...current,
        bankName: data.bankName,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        branchName: data.branchName
      }));
      setCurrentQr(data.qrImage || "");
    });
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (qrImage) data.append("qrImage", qrImage);

    try {
      const response = await paymentApi.update(data);
      setCurrentQr(response.data.qrImage || "");
      setForm((current) => ({ ...current, editPassword: "", newEditPassword: "" }));
      setMessage("Payment settings updated");
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not update payment settings");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(280px,420px)_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-panel p-3 sm:p-4 xl:sticky xl:top-28 xl:self-start">
        <h2 className="text-xl font-bold">QR payment settings</h2>
        {(["bankName", "accountName", "accountNumber", "branchName"] as const).map((field) => (
          <input
            key={field}
            value={form[field]}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
            placeholder={field.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
            className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
          />
        ))}
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setQrImage(event.target.files?.[0] || null)}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm"
        />
        <input
          type="password"
          placeholder="Current edit password"
          value={form.editPassword}
          onChange={(event) => setForm({ ...form, editPassword: event.target.value })}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
          required
        />
        <input
          type="password"
          placeholder="New edit password (optional)"
          value={form.newEditPassword}
          onChange={(event) => setForm({ ...form, newEditPassword: event.target.value })}
          className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
        />
        <StatusMessage message={message} />
        <StatusMessage message={error} tone="error" />
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-mint font-semibold text-ink">
          <Save size={17} />
          Save settings
        </button>
      </form>

      <section className="rounded-lg border border-line bg-panel p-3 sm:p-5">
        <h2 className="text-xl font-bold">Payment modal preview</h2>
        <div className="mt-5 rounded-lg border border-line bg-ink p-3 sm:p-5">
          {currentQr ? (
            <img src={assetUrl(currentQr)} alt="Saved QR" className="aspect-square w-full max-w-56 rounded-md object-contain" />
          ) : (
            <div className="grid aspect-square w-full max-w-56 place-items-center rounded-md border border-dashed border-line text-white/40">QR image</div>
          )}
          <div className="mt-5 space-y-1 break-words text-white/80">
            <p>{form.bankName}</p>
            <p>{form.accountName}</p>
            <p>{form.accountNumber}</p>
            <p>{form.branchName}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
