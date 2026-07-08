"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const getMemberName = (item) =>
  item?.user?.name || item?.name || "Unnamed Member";

const getMemberEmail = (item) => item?.user?.email || item?.email || "";

const getRoleLabel = (role = "") => {
  if (role === "admin") return "Admin";
  if (role === "ads-manager") return "Ads Manager";
  if (role === "developer") return "Developer";
  return role || "Member";
};

const getRoleClass = (role = "") => {
  if (role === "admin") return "bg-primary-light text-primary";
  if (role === "ads-manager") return "bg-blue-50 text-blue-700";
  if (role === "developer") return "bg-green-50 text-green-700";

  return "bg-surface-alt text-foreground";
};

const getWorkloadPercent = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

function StatCard({ title, value, desc, icon: Icon, tone = "primary" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-700 shadow-green-100"
      : tone === "blue"
        ? "bg-blue-50 text-blue-700 shadow-blue-100"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 shadow-amber-100"
          : tone === "red"
            ? "bg-red-50 text-red-700 shadow-red-100"
            : "bg-primary-light text-primary shadow-purple-100";

  return (
    <div className="group relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100 sm:rounded-3xl sm:p-5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-black leading-none text-foreground sm:text-3xl">
            {value}
          </h3>

          <p className="mt-3 truncate text-[10px] font-bold text-muted sm:text-sm">
            {desc}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg sm:h-12 sm:w-12 ${toneClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, tone = "white" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "red"
          ? "bg-red-50 text-red-700"
          : "bg-white text-foreground";

  return (
    <div className={`rounded-2xl p-3 text-center sm:p-4 ${toneClass}`}>
      <p className="text-xl font-black sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] font-black uppercase tracking-wider sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function WorkloadCard({ item }) {
  const user = item?.user;
  const userId = user?._id || item?._id;

  const totalTasks = Number(item?.totalTasks || 0);
  const completedTasks = Number(item?.completedTasks || 0);
  const pendingTasks = Number(item?.pendingTasks || 0);
  const overdueTasks = Number(item?.overdueTasks || 0);
  const progress = getWorkloadPercent(completedTasks, totalTasks);

  return (
    <Link
      href={`/team-workload/${userId}`}
      className="group relative block overflow-hidden rounded-[1.7rem] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-purple-100 sm:rounded-3xl"
    >
      <div className="relative overflow-hidden bg-primary-light p-4">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
        <div className="absolute -bottom-12 left-8 h-20 w-20 rounded-full bg-white/60 blur-2xl" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-purple-100 sm:h-12 sm:w-12">
              <UserCog size={20} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-black text-foreground sm:text-lg">
                {getMemberName(item)}
              </h3>

              <p className="mt-1 truncate text-[11px] font-bold text-primary sm:text-xs">
                {getMemberEmail(item) || "No email added"}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getRoleClass(
              user?.role,
            )}`}
          >
            {getRoleLabel(user?.role)}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {overdueTasks > 0 && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700">
            {overdueTasks} overdue task{overdueTasks === 1 ? "" : "s"} need
            attention
          </div>
        )}

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-xs font-black text-muted">
            <span>Completion Progress</span>
            <span className="text-primary">{progress}%</span>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-primary-light">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniMetric label="Total" value={totalTasks} />
          <MiniMetric label="Done" value={completedTasks} tone="green" />
          <MiniMetric label="Pending" value={pendingTasks} tone="amber" />
          <MiniMetric label="Overdue" value={overdueTasks} tone="red" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-black text-primary">
          <span>View Workload</span>

          <ArrowRight
            size={16}
            className="transition group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

export default function TeamWorkloadPage() {
  const router = useRouter();

  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const fetchWorkload = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/dashboard/team-workload");
      setWorkload(res?.data || []);
    } catch (err) {
      console.error(err);

      if (
        err?.message?.toLowerCase().includes("token") ||
        err?.message?.toLowerCase().includes("authorized")
      ) {
        localStorage.removeItem("infriva_token");
        localStorage.removeItem("infriva_user");
        router.replace("/login");
        return;
      }

      setError(err?.message || "Failed to fetch team workload");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchWorkload();
  }, [router]);

  const filteredWorkload = useMemo(() => {
    const value = search.toLowerCase();

    return workload.filter((item) => {
      const role = item?.user?.role || "";

      return (
        getMemberName(item).toLowerCase().includes(value) ||
        getMemberEmail(item).toLowerCase().includes(value) ||
        role.toLowerCase().includes(value)
      );
    });
  }, [workload, search]);

  const stats = useMemo(() => {
    const totalTasks = workload.reduce(
      (sum, item) => sum + Number(item?.totalTasks || 0),
      0,
    );

    const completedTasks = workload.reduce(
      (sum, item) => sum + Number(item?.completedTasks || 0),
      0,
    );

    const pendingTasks = workload.reduce(
      (sum, item) => sum + Number(item?.pendingTasks || 0),
      0,
    );

    const overdueTasks = workload.reduce(
      (sum, item) => sum + Number(item?.overdueTasks || 0),
      0,
    );

    return {
      members: workload.length,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    };
  }, [workload]);

  const statCards = [
    {
      title: "Members",
      value: stats.members,
      desc: "Team users",
      icon: Users,
      tone: "primary",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      desc: "Assigned tasks",
      icon: UserCog,
      tone: "blue",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      desc: "Finished tasks",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      desc: "Remaining work",
      icon: Clock,
      tone: "amber",
    },
    {
      title: "Overdue",
      value: stats.overdueTasks,
      desc: "Needs attention",
      icon: AlertCircle,
      tone: "red",
    },
  ];

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  Team Workload
                </p>

                <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  Workload Overview
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  Track team task distribution, completed work, pending work and
                  overdue tasks in one place.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchWorkload}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </section>

          <section className="theme-card p-4 sm:p-5">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member, email or role..."
                className="theme-input pl-12"
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted sm:text-sm">
              <SlidersHorizontal size={16} />
              Showing {filteredWorkload.length} of {workload.length} members
            </div>
          </section>

          {loading ? (
            <div className="theme-card flex min-h-90 items-center justify-center p-8">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-primary"
                  size={36}
                />

                <h2 className="mt-4 text-xl font-black">Loading workload</h2>

                <p className="mt-2 text-sm text-muted">
                  Fetching latest team workload...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">Error</h2>

                <p className="mt-2 text-sm text-muted">{error}</p>

                <button
                  type="button"
                  onClick={fetchWorkload}
                  className="theme-btn mt-5"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredWorkload.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Users size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">No workload found</h2>

                <p className="mt-2 text-sm text-muted">
                  Assigned tasks will appear here.
                </p>
              </div>
            </div>
          ) : (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Team Members
                  </h2>

                  <p className="text-xs font-semibold text-muted sm:text-sm">
                    Workload cards with task progress
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredWorkload.map((item) => (
                  <WorkloadCard
                    key={item?.user?._id || item?._id}
                    item={item}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
