"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  UserCog,
  Users,
  X,
  BriefcaseBusiness,
  Sparkles,
  ChevronRight,
  Search,
} from "lucide-react";

const allLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "ads-manager", "developer"],
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Users,
    roles: ["admin", "ads-manager"],
  },
  {
    name: "Clients",
    href: "/clients",
    icon: Building2,
    roles: ["admin", "ads-manager"],
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["admin", "ads-manager", "developer"],
  },
  {
    name: "Quotations",
    href: "/quotations",
    icon: FileText,
    roles: ["admin", "ads-manager"],
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: ListTodo,
    roles: ["admin", "ads-manager", "developer"],
  },
  {
    name: "Team Members",
    href: "/members",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    name: "Team Workload",
    href: "/team-workload",
    icon: BriefcaseBusiness,
    roles: ["admin", "ads-manager"],
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserCog,
    roles: ["admin", "ads-manager", "developer"],
  },
];

const getRoleLabel = (role = "") => {
  if (role === "admin") return "Admin";
  if (role === "ads-manager") return "Ads Manager";
  if (role === "developer") return "Developer";
  return "Member";
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("infriva_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const links = useMemo(() => {
    const role = user?.role || "developer";

    return allLinks.filter((item) => item.roles.includes(role));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("infriva_token");
    localStorage.removeItem("infriva_user");
    router.push("/login");
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();

    const value = globalSearch.trim();

    if (!value) return;

    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen crm-gradient text-foreground">
      <div className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-purple-200">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-sm font-black leading-none">Infriva</p>
              <p className="text-xs text-muted">CRM Panel</p>
            </div>
          </Link>

          <button
            onClick={() => setOpen(true)}
            className="rounded-xl border border-border bg-white p-2"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-70 border-r border-border bg-white/90 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-border px-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-purple-200">
                <Sparkles size={22} />
              </div>

              <div>
                <p className="text-lg font-black leading-none">Infriva</p>
                <p className="mt-1 text-xs font-medium text-muted">
                  Business CRM
                </p>
              </div>
            </Link>

            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border p-2 lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
            {links.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    active
                      ? "bg-primary text-white shadow-lg shadow-purple-200"
                      : "text-muted hover:bg-primary-light hover:text-primary"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} />
                    {item.name}
                  </span>

                  <ChevronRight
                    size={16}
                    className={`transition ${
                      active
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div className="mb-4 rounded-2xl bg-primary-light p-4">
              <p className="text-sm font-black text-primary">
                {user?.name || "Infriva User"}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted">
                {getRoleLabel(user?.role)} Access
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:pl-70">
        <header className="sticky top-0 z-30 hidden h-20 border-b border-border bg-white/70 px-8 backdrop-blur-xl lg:flex lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              CRM Dashboard
            </p>

            <h1 className="mt-1 text-xl font-black text-foreground">
              Welcome back, {user?.name || "User"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <form
              onSubmit={handleGlobalSearch}
              className="relative hidden xl:block"
            >
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search leads, clients, projects..."
                className="h-12 w-85 rounded-full border border-border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-purple-100"
              />
            </form>

            {(user?.role === "admin" || user?.role === "ads-manager") && (
              <Link href="/leads/new" className="theme-btn">
                Add Lead
              </Link>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
