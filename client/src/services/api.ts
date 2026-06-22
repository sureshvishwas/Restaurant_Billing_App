import axios from "axios";
import type { MenuItem, Order, PaymentSetting } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ASSET_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export const assetUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${ASSET_ORIGIN}${path}`;
};

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("billfast_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signup: (payload: { name: string; email: string; password: string }) => api.post("/auth/signup", payload),
  login: (payload: { email: string; password: string }) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password })
};

export const menuApi = {
  list: () => api.get<MenuItem[]>("/menu"),
  create: (form: FormData) => api.post<MenuItem>("/menu", form),
  update: (id: string, form: FormData) => api.put<MenuItem>(`/menu/${id}`, form),
  remove: (id: string) => api.delete(`/menu/${id}`)
};

export const orderApi = {
  list: () => api.get<Order[]>("/orders"),
  create: (payload: Omit<Order, "_id" | "createdAt" | "status">) => api.post<Order>("/orders", payload),
  clear: () => api.delete("/orders")
};

export const paymentApi = {
  get: () => api.get<PaymentSetting>("/payment-settings"),
  update: (form: FormData) => api.put<PaymentSetting>("/payment-settings", form)
};

export const gatewayApi = {
  createStripeCheckoutSession: (payload: {
    tableNumber: number;
    items: Array<{ name: string; price: number; quantity: number }>;
    total: number;
  }) => api.post<{ url: string; id: string }>("/gateway/stripe/checkout-session", payload),
  getStripeCheckoutSession: (id: string) =>
    api.get<{ id: string; status: string; paymentStatus: string; amountTotal: number }>(`/gateway/stripe/checkout-session/${id}`)
};
