"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
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

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Team Workload
              </p>

              <h1 className="mt-2 text-3xl font-black">Workload Overview</h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Track team task distribution, completed work, pending work and
                overdue tasks in one place.
              </p>
            </div>

            <button
              onClick={fetchWorkload}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              <RefreshCcw size={18} />
              Refresh
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Members</p>
                  <h3 className="mt-2 text-3xl font-black">{stats.members}</h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Users size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Total Tasks</p>
                  <h3 className="mt-2 text-3xl font-black">
                    {stats.totalTasks}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <UserCog size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Completed</p>
                  <h3 className="mt-2 text-3xl font-black">
                    {stats.completedTasks}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  <CheckCircle2 size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Pending</p>
                  <h3 className="mt-2 text-3xl font-black">
                    {stats.pendingTasks}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <Clock size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Overdue</p>
                  <h3 className="mt-2 text-3xl font-black">
                    {stats.overdueTasks}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                  <AlertCircle size={22} />
                </div>
              </div>
            </div>
          </section>

          <section className="theme-card p-4">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by member name, email or role..."
                className="theme-input pl-12"
              />
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
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

                <button onClick={fetchWorkload} className="theme-btn mt-5">
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
            <section className="grid gap-4">
              {filteredWorkload.map((item) => {
                const user = item?.user;
                const totalTasks = Number(item?.totalTasks || 0);
                const completedTasks = Number(item?.completedTasks || 0);
                const pendingTasks = Number(item?.pendingTasks || 0);
                const overdueTasks = Number(item?.overdueTasks || 0);
                const progress = getWorkloadPercent(completedTasks, totalTasks);

                return (
                  <Link
                    key={user?._id}
                    href={`/team-workload/${user?._id}`}
                    className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-foreground">
                            {getMemberName(item)}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getRoleClass(
                              user?.role,
                            )}`}
                          >
                            {getRoleLabel(user?.role)}
                          </span>

                          {overdueTasks > 0 && (
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                              {overdueTasks} Overdue
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-muted">
                          {getMemberEmail(item) || "No email added"}
                        </p>

                        <div className="mt-4 max-w-2xl">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-bold text-muted">
                              Progress
                            </span>
                            <span className="font-black text-primary">
                              {progress}%
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-primary-light">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-130">
                        <div className="rounded-2xl bg-white p-4 text-center">
                          <p className="text-2xl font-black text-foreground">
                            {totalTasks}
                          </p>
                          <p className="mt-1 text-xs font-bold text-muted">
                            Total
                          </p>
                        </div>

                        <div className="rounded-2xl bg-green-50 p-4 text-center">
                          <p className="text-2xl font-black text-green-700">
                            {completedTasks}
                          </p>
                          <p className="mt-1 text-xs font-bold text-green-700">
                            Done
                          </p>
                        </div>

                        <div className="rounded-2xl bg-amber-50 p-4 text-center">
                          <p className="text-2xl font-black text-amber-700">
                            {pendingTasks}
                          </p>
                          <p className="mt-1 text-xs font-bold text-amber-700">
                            Pending
                          </p>
                        </div>

                        <div className="rounded-2xl bg-red-50 p-4 text-center">
                          <p className="text-2xl font-black text-red-700">
                            {overdueTasks}
                          </p>
                          <p className="mt-1 text-xs font-bold text-red-700">
                            Overdue
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
