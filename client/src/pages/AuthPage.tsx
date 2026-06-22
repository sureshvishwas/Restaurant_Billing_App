import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

export const AuthPage = ({ mode }: { mode: "login" | "signup" }) => {
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        await signup({ name, email, password });
      } else {
        await login({ email, password });
      }
      setMessage("Welcome to BillFast");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-3 py-6 text-white sm:px-4 sm:py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-line bg-panel p-4 shadow-2xl sm:p-6">
        <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">BillFast</h1>
        <p className="mt-1 text-white/60">{mode === "signup" ? "Create your restaurant staff account" : "Login to continue"}</p>
        <div className="mt-5 space-y-4">
          {mode === "signup" && (
            <label className="block text-sm">
              <span className="text-white/70">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
                required
              />
            </label>
          )}
          <label className="block text-sm">
            <span className="text-white/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="text-white/70">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-line bg-ink px-3 py-2 outline-none focus:border-mint"
              required
              minLength={6}
            />
          </label>
          <StatusMessage message={message} />
          <StatusMessage message={error} tone="error" />
          <button className="h-11 w-full rounded-md bg-mint font-semibold text-ink hover:bg-emerald-300">
            {mode === "signup" ? "Create account" : "Login"}
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-white/65 min-[380px]:flex-row min-[380px]:justify-between">
          {mode === "signup" ? <Link to="/login">Already have an account?</Link> : <Link to="/signup">Create account</Link>}
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
};
