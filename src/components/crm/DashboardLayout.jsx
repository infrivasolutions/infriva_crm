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
  Plus,
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

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

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

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const canAddLead = user?.role === "admin" || user?.role === "ads-manager";

  return (
    <div className="min-h-screen overflow-x-hidden crm-gradient text-foreground">
      {/* Mobile Top Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-purple-200">
              <Sparkles size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-none">
                Infriva
              </p>
              <p className="truncate text-xs text-muted">CRM Panel</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-border bg-white p-2 text-foreground shadow-sm"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile Search + Add Button */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <form
            onSubmit={handleGlobalSearch}
            className="relative min-w-0 flex-1"
          >
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search..."
              className="h-11 w-full rounded-2xl border border-border bg-white pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-purple-100"
            />
          </form>

          {canAddLead && (
            <Link
              href="/leads/new"
              className="flex h-11 shrink-0 items-center justify-center gap-1 rounded-2xl bg-primary px-3 text-sm font-bold text-white shadow-lg shadow-purple-200"
            >
              <Plus size={16} />
              <span className="hidden xs:inline">Lead</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] border-r border-border bg-white/95 backdrop-blur-2xl transition-transform duration-300 lg:w-[280px] lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-border px-5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-purple-200">
                <Sparkles size={22} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-black leading-none">
                  Infriva
                </p>
                <p className="mt-1 truncate text-xs font-medium text-muted">
                  Business CRM
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-border p-2 lg:hidden"
              aria-label="Close sidebar"
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
                  <span className="flex min-w-0 items-center gap-3">
                    <Icon size={19} className="shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </span>

                  <ChevronRight
                    size={16}
                    className={`shrink-0 transition ${
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
              <p className="truncate text-sm font-black text-primary">
                {user?.name || "Infriva User"}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-muted">
                {getRoleLabel(user?.role)} Access
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 lg:pl-[280px]">
        {/* Desktop Header */}
        <header className="sticky top-0 z-30 hidden h-20 border-b border-border bg-white/70 px-6 backdrop-blur-xl lg:flex lg:items-center lg:justify-between xl:px-8">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
              CRM Dashboard
            </p>

            <h1 className="mt-1 truncate text-xl font-black text-foreground">
              Welcome back, {user?.name || "User"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-3">
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
                className="h-12 w-[340px] rounded-full border border-border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-purple-100"
              />
            </form>

            {canAddLead && (
              <Link href="/leads/new" className="theme-btn">
                Add Lead
              </Link>
            )}
          </div>
        </header>

        <div className="w-full max-w-full p-4 sm:p-5 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
