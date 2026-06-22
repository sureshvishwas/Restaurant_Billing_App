import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { StatusMessage } from "../components/StatusMessage";
import { authApi } from "../services/api";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestReset = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const { data } = await authApi.forgotPassword(email);
    setToken(data.resetToken || "");
    setMessage(data.resetToken ? "Reset token generated. Paste it below to set a new password." : data.message);
  };

  const resetPassword = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await authApi.resetPassword(token, newPassword);
      setMessage("Password updated. You can login with your new password.");
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-3 py-6 text-white sm:px-4 sm:py-10">
      <div className="w-full max-w-lg rounded-lg border border-line bg-panel p-4 sm:p-6">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <form onSubmit={requestReset} className="mt-5 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
            required
          />
          <button className="min-h-10 rounded-md bg-mint px-4 py-2 font-semibold text-ink">Generate reset token</button>
        </form>
        <form onSubmit={resetPassword} className="mt-6 space-y-3">
          <input
            placeholder="Reset token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
            required
            minLength={6}
          />
          <button className="min-h-10 rounded-md border border-mint px-4 py-2 text-mint">Reset password</button>
        </form>
        <div className="mt-4 space-y-3">
          <StatusMessage message={message} />
          <StatusMessage message={error} tone="error" />
          <Link className="text-sm text-white/65" to="/login">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};
