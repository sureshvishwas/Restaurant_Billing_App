export const StatusMessage = ({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) => {
  if (!message) return null;

  return (
    <p
      className={`rounded-md border px-3 py-2 text-sm ${
        tone === "error" ? "border-coral/50 bg-coral/10 text-red-100" : "border-mint/50 bg-mint/10 text-emerald-100"
      }`}
    >
      {message}
    </p>
  );
};
