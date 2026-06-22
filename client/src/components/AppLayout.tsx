import { CreditCard, History, LogOut, Moon, ReceiptText, Sun, Utensils } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { to: "/", label: "Billing", icon: ReceiptText },
  { to: "/menu", label: "Menu", icon: Utensils },
  { to: "/payment", label: "Payment", icon: CreditCard },
  { to: "/history", label: "History", icon: History }
];

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-20 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 px-3 py-3 sm:px-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0 lg:pr-2">
            <h1 className="text-2xl font-bold tracking-normal">BillFast</h1>
            <p className="text-sm text-white/55">Restaurant billing system</p>
          </div>
          <nav className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0 sm:pb-0 lg:justify-center">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition ${
                    isActive
                      ? "border-mint bg-mint text-ink"
                      : "border-line bg-panel text-white/75 hover:border-white/40"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex min-w-0 items-center justify-between gap-3 text-sm text-white/70 lg:justify-end">
            <span className="truncate">{user?.name}</span>
            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line hover:border-mint hover:text-mint"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <ThemeIcon size={17} />
            </button>
            <button
              onClick={logout}
              className="flex h-10 shrink-0 items-center gap-2 rounded-md border border-line px-3 hover:border-coral hover:text-coral"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};
